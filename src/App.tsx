import { useState, useMemo, useEffect } from 'react';
import { Download, BookOpen, Settings2 } from 'lucide-react';
import { calculateFSPL, calculateHataUrban, calculateCost231Hata, calculateEgli, calculateEricsson, calculate3GPP38901, calculateITUR1238, calculateSUI, calculateRSL, calculateLinkMargin, calculateLogDistance, calculatePlaneEarth, calculateVegetationLoss, calculateRainAttenuation, calculateFresnelZone, calculateSensitivity } from './lib/rfMath';
import { InputPanel, KPICards, ChartView, SystemDiagram, DocumentationModal } from './components';

export default function App() {
  const [sheetState, setSheetState] = useState<'collapsed' | 'partial' | 'half' | 'expanded'>('partial');
  const [touchStartY, setTouchStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  
  // 1. Core State
  const [params, setParams] = useState({
    frequency: 2400,
    txPower: 20,
    txLoss: 1,
    txGain: 15,
    rxGain: 15,
    rxLoss: 1,
    rxSensitivity: -90,
    calcSensitivity: false,
    bandwidth: 20,
    noiseFigure: 5,
    requiredSnr: 10,
    chartMaxDistance: 20,
    distance: 10,
    hte: 30,
    hre: 2,
    gamma: 3.0,
    d0: 1.0,
    vegetationDepth: 0,
    rainRate: 0,
    model: 'FSPL',
    environment: 'Urban',
    pathType: 'LOS',
    floors: 0
  });
  
  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('linkBudgetParams');
      if (saved) {
        setParams(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.warn("localStorage not available", e);
    }
  }, []);
  
  useEffect(() => {
    try {
      localStorage.setItem('linkBudgetParams', JSON.stringify(params));
    } catch (e) {
      // Ignore
    }
  }, [params]);

  // 2. Derived Math (Point-to-Point)
  const results = useMemo(() => {
    let pathLoss = 0;
    if (params.model === 'FSPL') {
      pathLoss = calculateFSPL(params.frequency, params.distance);
    } else if (params.model === 'HataUrban') {
      pathLoss = calculateHataUrban(params.frequency, params.distance, params.hte, params.hre, params.environment);
    } else if (params.model === 'Cost231Hata') {
      pathLoss = calculateCost231Hata(params.frequency, params.distance, params.hte, params.hre, params.environment);
    } else if (params.model === 'Egli') {
      pathLoss = calculateEgli(params.frequency, params.distance, params.hte, params.hre);
    } else if (params.model === 'Ericsson') {
      pathLoss = calculateEricsson(params.frequency, params.distance, params.hte, params.hre, params.environment);
    } else if (params.model === '3GPP') {
      pathLoss = calculate3GPP38901(params.frequency, params.distance, params.hte, params.hre, params.environment, params.pathType);
    } else if (params.model === 'ITUR1238') {
      pathLoss = calculateITUR1238(params.frequency, params.distance, params.environment, params.floors);
    } else if (params.model === 'SUI') {
      pathLoss = calculateSUI(params.frequency, params.distance, params.hte, params.hre);
    } else if (params.model === 'Log-Distance') {
      pathLoss = calculateLogDistance(params.frequency, params.distance, params.d0, params.gamma);
    } else if (params.model === 'PlaneEarth') {
      pathLoss = calculatePlaneEarth(params.distance, params.hte, params.hre);
    }
    
    // Additional Environmental Losses
    pathLoss += calculateVegetationLoss(params.frequency, params.vegetationDepth);
    pathLoss += calculateRainAttenuation(params.frequency, params.distance, params.rainRate);
       
    const rsl = calculateRSL(params.txPower, params.txLoss, params.txGain, pathLoss, params.rxGain, params.rxLoss);
    const effectiveSensitivity = params.calcSensitivity ? calculateSensitivity(params.bandwidth, params.noiseFigure, params.requiredSnr) : params.rxSensitivity;
    const margin = calculateLinkMargin(rsl, effectiveSensitivity);
    const fresnelClearance = calculateFresnelZone(params.frequency, params.distance);
    
    return { pathLoss, rsl, margin, eirp: params.txPower - params.txLoss + params.txGain, fresnelClearance };
  }, [params]);

  // 3. Chart Data Generation (Distance Sweep)
  const chartData = useMemo(() => {
    const data = [];
    const maxDist = Math.max(params.chartMaxDistance, params.distance); // Sweep up to user specified max chart range
    const step = maxDist / 100; // 100 points
    
    for(let d = step; d <= maxDist; d += step) {
       let loss = 0;
       if (params.model === 'FSPL') {
         loss = calculateFSPL(params.frequency, d);
       } else if (params.model === 'HataUrban') {
         loss = calculateHataUrban(params.frequency, d, params.hte, params.hre, params.environment);
       } else if (params.model === 'Cost231Hata') {
         loss = calculateCost231Hata(params.frequency, d, params.hte, params.hre, params.environment);
       } else if (params.model === 'Egli') {
         loss = calculateEgli(params.frequency, d, params.hte, params.hre);
       } else if (params.model === 'Ericsson') {
         loss = calculateEricsson(params.frequency, d, params.hte, params.hre, params.environment);
       } else if (params.model === '3GPP') {
         loss = calculate3GPP38901(params.frequency, d, params.hte, params.hre, params.environment, params.pathType);
       } else if (params.model === 'ITUR1238') {
         loss = calculateITUR1238(params.frequency, d, params.environment, params.floors);
       } else if (params.model === 'SUI') {
         loss = calculateSUI(params.frequency, d, params.hte, params.hre);
       } else if (params.model === 'Log-Distance') {
         loss = calculateLogDistance(params.frequency, d, params.d0, params.gamma);
       } else if (params.model === 'PlaneEarth') {
         loss = calculatePlaneEarth(d, params.hte, params.hre);
       }
       
       loss += calculateVegetationLoss(params.frequency, params.vegetationDepth);
       loss += calculateRainAttenuation(params.frequency, d, params.rainRate);
       
       const rsl = calculateRSL(params.txPower, params.txLoss, params.txGain, loss, params.rxGain, params.rxLoss);
       const effectiveSensitivity = params.calcSensitivity ? calculateSensitivity(params.bandwidth, params.noiseFigure, params.requiredSnr) : params.rxSensitivity;
       const margin = calculateLinkMargin(rsl, effectiveSensitivity);
       data.push({ distance: Number(d.toFixed(2)), pathLoss: loss, rsl, margin });
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
    link.setAttribute("download", `link_budget_sweep_${params.model}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === 0) return;
    const currentY = e.touches[0].clientY;
    setDragOffset(currentY - touchStartY);
  };

  const handleTouchEnd = () => {
    const deltaY = dragOffset || 0;
    setTouchStartY(0);
    setDragOffset(null);
    
    if (Math.abs(deltaY) < 10) {
      // Tap detection
      if (sheetState === 'collapsed') setSheetState('partial');
      else if (sheetState === 'partial') setSheetState('half');
      else if (sheetState === 'half') setSheetState('expanded');
      else setSheetState('partial');
      return;
    }
    
    if (deltaY > 40) {
      // Swiped down
      if (sheetState === 'expanded') setSheetState('half');
      else if (sheetState === 'half') setSheetState('partial');
      else if (sheetState === 'partial') setSheetState('collapsed');
    } else if (deltaY < -40) {
      // Swiped up
      if (sheetState === 'collapsed') setSheetState('partial');
      else if (sheetState === 'partial') setSheetState('half');
      else if (sheetState === 'half') setSheetState('expanded');
    }
  };

  const getSheetBaseTransform = () => {
    if (sheetState === 'expanded') return '0px';
    if (sheetState === 'half') return '100% - 50dvh';
    if (sheetState === 'partial') return '100% - 25dvh';
    return '100% - 4rem';
  };

  const getModelDisplayName = (model: string) => {
    switch (model) {
      case 'FSPL': return 'Free Space (FSPL)';
      case 'HataUrban': return 'Hata';
      case 'Cost231Hata': return 'COST-231 Hata';
      case 'Ericsson': return 'Ericsson';
      case '3GPP': return '3GPP TR 38.901';
      case 'ITUR1238': return 'ITU-R P.1238 (Indoor)';
      case 'SUI': return 'SUI';
      case 'Egli': return 'Egli';
      case 'PlaneEarth': return 'Plane-Earth';
      case 'Log-Distance': return 'Log-Distance';
      default: return model;
    }
  };

  const getEnvDisplayName = (model: string, env: string) => {
    if (model === '3GPP') {
      return env === 'Urban' ? 'UMa' : env === 'Suburban' ? 'UMi' : 'RMa';
    }
    if (model === 'ITUR1238') {
      return env === 'Urban' ? 'Residential' : env === 'Suburban' ? 'Office' : 'Commercial';
    }
    return env;
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Sidebar / Mobile Bottom Sheet for Inputs */}
      <aside 
        className={`
          fixed inset-x-0 bottom-0 z-40 bg-slate-900 border-t border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl flex flex-col
          ${dragOffset === null ? 'transition-transform duration-300 ease-in-out' : ''}
          ${sheetState === 'expanded' ? 'translate-y-0 h-[70dvh]' : sheetState === 'half' ? 'translate-y-[calc(100%-50dvh)] h-[70dvh]' : sheetState === 'partial' ? 'translate-y-[calc(100%-25dvh)] h-[70dvh]' : 'translate-y-[calc(100%-4rem)] h-[70dvh]'}
          md:static md:translate-y-0 md:h-auto md:w-80 md:lg:w-96 md:border-t-0 md:border-r md:rounded-none md:shadow-none md:flex-none
        `}
        style={dragOffset !== null ? { transform: `translateY(calc(${getSheetBaseTransform()} + ${dragOffset}px))` } : undefined}
      >
        {/* Mobile Drag Handle */}
        <div 
          className="md:hidden flex flex-col items-center justify-center pt-3 pb-3 cursor-pointer select-none border-b border-slate-800 shrink-0 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Google Maps style pill handle */}
          <div className="w-10 h-1.5 bg-slate-600 rounded-full mb-3" />
          <div className="flex items-center justify-between w-full px-6">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-slate-200">System Parameters</span>
            </div>
          </div>
        </div>
        
        {/* Scrollable Input Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <InputPanel params={params} onChange={setParams} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto pb-[25dvh] md:pb-6 block">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Link Budget Analysis</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 ring-1 ring-inset ring-blue-500/20 shadow-sm shadow-blue-900/20">
              {getModelDisplayName(params.model)}
            </span>
            {['HataUrban', 'Cost231Hata', 'Ericsson', '3GPP', 'ITUR1238'].includes(params.model) && (
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20 shadow-sm shadow-emerald-900/20">
                {params.model === '3GPP' && `${params.pathType} `}{getEnvDisplayName(params.model, params.environment)}
              </span>
            )}
            <button 
              onClick={() => setShowDocs(true)}
              className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 ring-1 ring-inset ring-slate-700 shadow-sm hover:bg-slate-700 hover:text-white transition-colors ml-auto sm:ml-0"
              title="Help & Operation Manual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Help</span>
            </button>
          </div>
        </div>
        
        <KPICards results={results} model={params.model} />
        
        <div className="flex-1 min-h-[250px] md:min-h-[400px] mb-4">
           <ChartView data={chartData} currentDistance={params.distance} rxSensitivity={params.calcSensitivity ? calculateSensitivity(params.bandwidth, params.noiseFigure, params.requiredSnr) : params.rxSensitivity} />
        </div>
        
        <SystemDiagram model={params.model} />
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleExportCSV} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
             <Download className="w-4 h-4" />
             Export Sweep CSV
          </button>
        </div>
      </main>

      {showDocs && <DocumentationModal onClose={() => setShowDocs(false)} />}
    </div>
  );
}
