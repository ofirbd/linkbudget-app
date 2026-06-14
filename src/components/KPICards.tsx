import { RadioTower, Activity, ShieldCheck, Zap, Target } from 'lucide-react';

interface Results {
  pathLoss: number;
  rsl: number;
  margin: number;
  eirp: number;
  fresnelClearance: number;
}

interface KPICardsProps {
  results: Results;
  model?: string;
}

export function KPICards({ results, model }: KPICardsProps) {
  const isConnected = results.margin > 0;
  const showFresnel = model !== 'ITUR1238';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-slate-400">EIRP</span>
        </div>
        <div className="text-2xl font-bold text-slate-100">{results.eirp.toFixed(1)} <span className="text-sm font-normal text-slate-400">dBm</span></div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <RadioTower className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-400">Path Loss</span>
        </div>
        <div className="text-2xl font-bold text-slate-100">{results.pathLoss.toFixed(1)} <span className="text-sm font-normal text-slate-400">dB</span></div>
      </div>

      <div className={`p-4 rounded-xl border shadow-sm flex flex-col ${isConnected ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-rose-900/20 border-rose-800/50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Activity className={`w-4 h-4 ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`} />
          <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>RSL</span>
        </div>
        <div className={`text-2xl font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
          {results.rsl.toFixed(1)} <span className="text-sm font-normal opacity-80">dBm</span>
        </div>
      </div>

      <div className={`p-4 rounded-xl border shadow-sm flex flex-col ${isConnected ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-rose-900/20 border-rose-800/50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className={`w-4 h-4 ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`} />
          <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>Fade Margin</span>
        </div>
        <div className={`text-2xl font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
          {results.margin > 0 ? '+' : ''}{results.margin.toFixed(1)} <span className="text-sm font-normal opacity-80">dB</span>
        </div>
      </div>

      <div className={`bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col col-span-2 md:col-span-1 relative group ${showFresnel ? 'cursor-help' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <Target className={`w-4 h-4 ${showFresnel ? 'text-indigo-400' : 'text-slate-600'}`} />
          <span className={`text-sm font-medium ${showFresnel ? 'text-slate-400' : 'text-slate-500'}`}>Fresnel (Mid)</span>
          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded shadow-xl z-20 pointer-events-none text-center">
            {showFresnel 
              ? "Required line-of-sight clearance radius for the 1st Fresnel zone at the exact midpoint of the link."
              : "Fresnel zone clearance is generally not applicable for indoor non-line-of-sight scattering models."}
          </div>
        </div>
        <div className={`text-2xl font-bold ${showFresnel ? 'text-slate-100' : 'text-slate-500'}`}>
          {showFresnel ? (
            <>{results.fresnelClearance.toFixed(1)} <span className="text-sm font-normal text-slate-400">m</span></>
          ) : (
            <span className="text-xl">N/A</span>
          )}
        </div>
      </div>
    </div>
  );
}
