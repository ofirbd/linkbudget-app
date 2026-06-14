# LinkBudget Single-File Web Application - Technical Design & Blueprint

This document outlines the architecture and implementation strategy for converting the legacy Java Swing app into a modern, responsive, single-file web application using React, Vite, Tailwind CSS, and Recharts.

## 1. Vite Build Configuration
To achieve a completely self-contained, offline-capable `index.html` with zero external requests, we will use Vite along with the `vite-plugin-singlefile` plugin. This plugin automatically inlines all JavaScript, CSS, and SVG assets into the final HTML output.

**`vite.config.ts`**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000, // Force large assets to inline
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks: () => 'everything.js', // Ensure single chunk
      },
    },
  },
});
```

## 2. Component Architecture
The application uses a mobile-first, responsive layout driven by Tailwind CSS utilities (`md:flex-row`, etc.). 

```text
App (Entry Point & State Manager)
 ├── ResponsiveLayout (Handles screen-size constraints)
 │    ├── Sidebar / MobileTabs (Navigation & Controls)
 │    │    ├── InputPanel
 │    │    │    ├── ParameterSliders (Power, Gain, Freq)
 │    │    │    ├── EnvironmentSelector (FSPL, Hata, etc.)
 │    │    │    └── Settings (Units, persist via localStorage)
 │    └── MainContent
 │         ├── KPISummary (Top Row: EIRP, RSL, Margin)
 │         ├── ChartContainer (Recharts - Dynamic updating)
 │         └── ActionPanel (Export to CSV Button)
```

**Mobile UX:** The UI will feature a sticky tab bar at the bottom or top to switch between "Inputs", "Results", and "Charts", preventing massive scrolling.
**Desktop UX:** A classic dual-pane setup with a fixed left sidebar for inputs and a large right workspace for charts and KPIs.

## 3. Core Math Module
The propagation models are implemented as pure, synchronous TypeScript functions. To ensure the main thread doesn't block, chart sweeps should be kept to a reasonable number of points (e.g., 200).

**`src/lib/rfMath.ts`**
```typescript
/**
 * Core RF Propagation Models
 */

// Free Space Path Loss (FSPL) in dB
// f: frequency in MHz, d: distance in km
export function calculateFSPL(f: number, d: number): number {
  if (f <= 0 || d <= 0) return 0;
  return 32.44 + 20 * Math.log10(d) + 20 * Math.log10(f);
}

// Hata Model for Urban Environments in dB
// f: freq in MHz (150-1500), d: dist in km (1-20),
// hte: Tx height in m (30-200), hre: Rx height in m (1-10)
export function calculateHataUrban(f: number, d: number, hte: number, hre: number): number {
  // Antenna height correction factor (for a small/medium city)
  const a_hre = (1.1 * Math.log10(f) - 0.7) * hre - (1.56 * Math.log10(f) - 0.8);
  
  return 69.55 + 26.16 * Math.log10(f) - 13.82 * Math.log10(hte) - a_hre + 
         (44.9 - 6.55 * Math.log10(hte)) * Math.log10(d);
}

// System Performance
export function calculateRSL(txPower: number, txLoss: number, txGain: number, pathLoss: number, rxGain: number, rxLoss: number): number {
    const eirp = txPower - txLoss + txGain;
    return eirp - pathLoss + rxGain - rxLoss;
}

export function calculateLinkMargin(rsl: number, rxSensitivity: number): number {
    return rsl - rxSensitivity;
}
```

## 4. App Entry Point Structure
The root component acts as the single source of truth for application state. As the user adjusts parameters, the mathematical derivatives and chart arrays are instantly recalculated.

**`src/App.tsx`**
```tsx
import React, { useState, useMemo, useEffect } from 'react';
import { calculateFSPL, calculateRSL, calculateLinkMargin } from './lib/rfMath';
// Import Components...

export default function App() {
  // 1. Core State
  const [params, setParams] = useState({
    frequency: 2400, txPower: 20, txLoss: 1, txGain: 15,
    rxGain: 15, rxLoss: 1, rxSensitivity: -90, distance: 10,
    model: 'FSPL'
  });
  
  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('linkBudgetParams');
    if (saved) setParams(JSON.parse(saved));
  }, []);
  
  useEffect(() => {
    localStorage.setItem('linkBudgetParams', JSON.stringify(params));
  }, [params]);

  // 2. Derived Math (Point-to-Point)
  const results = useMemo(() => {
    const pathLoss = params.model === 'FSPL' 
       ? calculateFSPL(params.frequency, params.distance) 
       : 0; // Hata, Egli, etc.
       
    const rsl = calculateRSL(params.txPower, params.txLoss, params.txGain, pathLoss, params.rxGain, params.rxLoss);
    const margin = calculateLinkMargin(rsl, params.rxSensitivity);
    
    return { pathLoss, rsl, margin, eirp: params.txPower - params.txLoss + params.txGain };
  }, [params]);

  // 3. Chart Data Generation (Distance Sweep)
  const chartData = useMemo(() => {
    const data = [];
    const maxDist = params.distance * 2; // Sweep up to 2x desired distance
    const step = maxDist / 200; // Keep array size small for performance
    
    for(let d = step; d <= maxDist; d += step) {
       const loss = calculateFSPL(params.frequency, d);
       const rsl = calculateRSL(params.txPower, params.txLoss, params.txGain, loss, params.rxGain, params.rxLoss);
       data.push({ distance: Number(d.toFixed(2)), pathLoss: loss, rsl });
    }
    return data;
  }, [params]);

  // 4. CSV Export Logic (Client-Side)
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Distance(km),PathLoss(dB),RSL(dBm)\n" 
      + chartData.map(row => `${row.distance},${row.pathLoss.toFixed(2)},${row.rsl.toFixed(2)}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "link_budget_sweep.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-100">
      {/* Sidebar for Inputs */}
      <aside className="w-full md:w-80 border-b md:border-r border-slate-700 p-4 overflow-y-auto">
        <InputPanel params={params} onChange={setParams} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        <KPICards results={results} />
        <div className="flex-1 mt-4">
           <ChartView data={chartData} />
        </div>
        <button onClick={handleExportCSV} className="mt-4 bg-blue-600 hover:bg-blue-700 p-2 rounded">
           Export CSV
        </button>
      </main>
    </div>
  );
}
```

> [!NOTE]
> **User Review Required**
> Please review the `implementation_plan.md` architecture. Does this align with your expectations for the framework choices, mobile-first design, and math module separation?
> If you approve, I will proceed with creating a new Vite + React project and wiring up the logic.
