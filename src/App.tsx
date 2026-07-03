import { useState, useMemo, useEffect } from 'react';
import { Download, BookOpen } from 'lucide-react';
import { calculateFSPL, calculateHataUrban, calculateCost231Hata, calculateEgli, calculateEricsson, calculate3GPP38901, calculateITUR1238, calculateSUI, calculateRSL, calculateLinkMargin, calculateLogDistance, calculatePlaneEarth, calculateVegetationLoss, calculateRainAttenuation, calculateFresnelZone, calculateSensitivity } from './lib/rfMath';
import { InputPanel, KPICards, ChartView, SystemDiagram, DocumentationModal } from './components';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inputs' | 'results'>('inputs');
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
    const maxDist = Math.max(20, params.distance * 2); // Sweep up to 2x desired distance or at least 20km
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
      
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex bg-slate-800 border-b border-slate-700">
        <button 
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'inputs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
          onClick={() => setActiveTab('inputs')}
        >
          Inputs
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'results' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
          onClick={() => setActiveTab('results')}
        >
          Results & Charts
        </button>
      </div>

      {/* Sidebar for Inputs */}
      <aside className={`w-full md:w-80 lg:w-96 border-r border-slate-700 p-4 flex-1 min-h-0 md:flex-none flex-col ${activeTab === 'inputs' ? 'flex' : 'hidden md:flex'} flex-shrink-0 bg-slate-900 z-10`}>
        <InputPanel params={params} onChange={setParams} />
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col p-4 md:p-6 overflow-y-auto ${activeTab === 'results' ? 'block' : 'hidden md:flex'}`}>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
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
            </div>
          </div>
          <button 
            onClick={() => setShowDocs(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
            title="Help & Operation Manual"
          >
            <BookOpen className="w-4 h-4" />
            <span>Help</span>
          </button>
        </div>
        
        <KPICards results={results} model={params.model} />
        
        <div className="flex-1 min-h-[400px] mb-4">
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
