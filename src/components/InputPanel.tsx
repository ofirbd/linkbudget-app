import type { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { Settings2, Info } from 'lucide-react';

interface Params {
  frequency: number;
  txPower: number;
  txLoss: number;
  txGain: number;
  rxGain: number;
  rxLoss: number;
  rxSensitivity: number;
  distance: number;
  hte: number;
  hre: number;
  gamma: number;
  d0: number;
  vegetationDepth: number;
  rainRate: number;
  model: string;
  environment: string;
  pathType: string;
  floors: number;
}

interface InputPanelProps {
  params: Params;
  onChange: Dispatch<SetStateAction<Params>>;
}

export function InputPanel({ params, onChange }: InputPanelProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    onChange(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? Number(value) : value
    }));
  };

  const getFrequencyWarning = () => {
    const f = params.frequency;
    switch (params.model) {
      case 'HataUrban':
        return (f < 150 || f > 1500) ? 'Hata model is mathematically validated for 150 - 1500 MHz.' : null;
      case 'Cost231Hata':
        return (f < 1500 || f > 2000) ? 'COST-231 Hata is mathematically validated for 1500 - 2000 MHz.' : null;
      case 'Egli':
        return (f < 40 || f > 1000) ? 'Egli model is mathematically validated for 40 - 1000 MHz.' : null;
      case 'Ericsson':
        return (f < 150 || f > 1900) ? 'Ericsson model is mathematically validated for 150 - 1900 MHz.' : null;
      case 'SUI':
        return (f < 1900 || f > 11000) ? 'SUI model is mathematically validated for 1.9 GHz - 11 GHz.' : null;
      case '3GPP':
        return (f < 500 || f > 100000) ? '3GPP TR 38.901 is mathematically validated for 500 MHz - 100 GHz.' : null;
      default:
        return null;
    }
  };

  const getDistanceWarning = () => {
    const d = params.distance;
    switch (params.model) {
      case 'HataUrban':
      case 'Cost231Hata':
        return (d < 1 || d > 20) ? 'This model is mathematically validated for 1 - 20 km.' : null;
      case 'SUI':
        return (d < 0.1 || d > 8) ? 'SUI model is mathematically validated for 0.1 - 8 km.' : null;
      case 'Egli':
        return (d > 60) ? 'Egli model is typically validated for distances under 60 km.' : null;
      case '3GPP':
        return (d < 0.01 || d > 10) ? '3GPP TR 38.901 is mathematically validated for 0.01 - 10 km.' : null;
      case 'ITUR1238':
        return (d > 1) ? 'ITU-R P.1238 is an indoor model and is typically validated for distances under 1 km.' : null;
      default:
        return null;
    }
  };

  const renderEnvironmentToggle = () => {
    if (!['HataUrban', 'Cost231Hata', 'Ericsson', '3GPP', 'ITUR1238'].includes(params.model)) return null;
    
    let envOptions = [{ value: 'Urban', label: 'Urban' }, { value: 'Suburban', label: 'Suburban' }, { value: 'Rural', label: 'Rural' }];
    if (params.model === '3GPP') {
      envOptions = [{ value: 'Urban', label: 'UMa' }, { value: 'Suburban', label: 'UMi' }, { value: 'Rural', label: 'RMa' }];
    } else if (params.model === 'ITUR1238') {
      envOptions = [{ value: 'Residential', label: 'Residential' }, { value: 'Office', label: 'Office' }, { value: 'Commercial', label: 'Commercial' }];
    }
      
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Environment Type</label>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          {envOptions.map(env => (
            <button
              key={env.value}
              onClick={() => onChange(prev => ({ ...prev, environment: env.value }))}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                params.environment === env.value 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {env.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPathTypeToggle = () => {
    if (params.model !== '3GPP') return null;
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Path Type (3GPP)</label>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          {['LOS', 'NLOS'].map(type => (
            <button
              key={type}
              onClick={() => onChange(prev => ({ ...prev, pathType: type }))}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                params.pathType === type 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getModelDescription = () => {
    switch (params.model) {
      case 'FSPL': return 'Assumes an unobstructed, straight-line path through a vacuum. Best for space communications or baseline theoretical maximums.';
      case 'HataUrban': return 'Empirical model based on Okumura data. Best for traditional cellular networks in built-up environments.';
      case 'Cost231Hata': return 'Extension of the Hata model. Best for modern PCS and higher-frequency mobile communications up to 2 GHz.';
      case 'Ericsson': return 'Adapts Okumura-Hata with specific gradient adjustments for frequency scaling. Best for urban/suburban macrocells.';
      case '3GPP': return 'Modern statistical model by 3GPP. Uses LOS/NLOS probabilities and breakpoint distances. Best for high-frequency (up to 100 GHz) 5G networks.';
      case 'SUI': return 'Calibrated by IEEE 802.16. Best for fixed-wireless broadband access (like WiMAX) in suburban environments.';
      case 'Egli': return 'Modified 2-ray terrain model. Best for VHF/UHF broadcasting or links over irregular, uneven landscapes.';
      case 'PlaneEarth': return 'Theoretical 2-ray model. Best for long-distance links over highly flat terrain or water causing ground reflections.';
      case 'Log-Distance': return 'Flexible exponential decay model. Best for indoor environments or when you have measured the specific path loss exponent.';
      case 'ITUR1238': return 'Standardized multi-ray indoor model. Specifically calculates signal attenuation through floors (penetration) depending on building type.';
      default: return '';
    }
  };

  const renderSlider = (label: string, name: keyof Params, min: number, max: number, step: number, unit: string) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm text-slate-400">{params[name]} {unit}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={params[name]}
        onChange={handleChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full">
      <div className="flex items-center gap-2 mb-6 text-xl font-bold text-slate-100">
        <Settings2 className="w-6 h-6 text-blue-500" />
        <h2>Parameters</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-24 custom-scrollbar">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Propagation Model</label>
          <select
            name="model"
            value={params.model}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="FSPL">Free Space Path Loss (FSPL)</option>
            <option value="HataUrban">Hata</option>
            <option value="Cost231Hata">COST-231 Hata</option>
            <option value="Ericsson">Ericsson Model</option>
            <option value="3GPP">3GPP TR 38.901</option>
            <option value="ITUR1238">ITU-R P.1238 (Indoor)</option>
            <option value="SUI">SUI Model (Suburban)</option>
            <option value="Egli">Egli Model</option>
            <option value="PlaneEarth">Plane-Earth (Ground Bounce)</option>
            <option value="Log-Distance">Log-Distance</option>
          </select>
        </div>
        
        {renderEnvironmentToggle()}
        {renderPathTypeToggle()}

        <div className="mb-6 bg-blue-900/20 border border-blue-800/50 p-3 rounded-lg flex gap-3 items-start shadow-sm">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-200/90 leading-relaxed">
            {getModelDescription()}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">System parameters</h3>
          {renderSlider('Frequency', 'frequency', 10, 40000, 10, 'MHz')}
          {getFrequencyWarning() && (
            <div className="text-xs font-medium text-rose-300 bg-rose-900/40 border border-rose-700/50 p-2.5 rounded-lg mb-4 mt-1 flex items-start gap-2">
              <span className="text-rose-400">⚠️</span>
              {getFrequencyWarning()}
            </div>
          )}
          {renderSlider('Distance', 'distance', 0.1, 100, 0.1, 'km')}
          {getDistanceWarning() && (
            <div className="text-xs font-medium text-rose-300 bg-rose-900/40 border border-rose-700/50 p-2.5 rounded-lg mb-4 mt-1 flex items-start gap-2">
              <span className="text-rose-400">⚠️</span>
              {getDistanceWarning()}
            </div>
          )}
          
          {params.model === 'Log-Distance' && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-xs font-semibold text-slate-400 mb-3">Log-Distance Parameters</h4>
              {renderSlider('Path Loss Exponent (γ)', 'gamma', 2.0, 6.0, 0.1, '')}
              {renderSlider('Reference Dist. (d0)', 'd0', 0.1, 10, 0.1, 'km')}
            </div>
          )}

          {params.model === 'ITUR1238' && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-xs font-semibold text-slate-400 mb-3">ITU-R P.1238 Parameters</h4>
              {renderSlider('Number of Floors', 'floors', 0, 10, 1, '')}
            </div>
          )}
          
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Environment</h3>
          {renderSlider('Vegetation Depth', 'vegetationDepth', 0, 100, 1, 'm')}
          {renderSlider('Rainfall Rate', 'rainRate', 0, 150, 1, 'mm/hr')}
          
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Transmitter (Tx)</h3>
          {renderSlider('Tx Power', 'txPower', -20, 60, 1, 'dBm')}
          {renderSlider('Tx Cable Loss', 'txLoss', 0, 10, 0.1, 'dB')}
          {renderSlider('Tx Antenna Gain', 'txGain', -20, 30, 0.5, 'dBi')}
          {(['HataUrban', 'Cost231Hata', 'Ericsson', 'SUI', 'Egli', 'PlaneEarth', '3GPP'].includes(params.model)) && 
            renderSlider('Tx Height', 'hte', 1, 200, 1, 'm')}

          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Receiver (Rx)</h3>
          {renderSlider('Rx Antenna Gain', 'rxGain', -20, 30, 0.5, 'dBi')}
          {renderSlider('Rx Cable Loss', 'rxLoss', 0, 10, 0.1, 'dB')}
          {renderSlider('Rx Sensitivity', 'rxSensitivity', -130, -50, 1, 'dBm')}
          {(['HataUrban', 'Cost231Hata', 'Ericsson', 'SUI', 'Egli', 'PlaneEarth', '3GPP'].includes(params.model)) && 
            renderSlider('Rx Height', 'hre', 1, 50, 1, 'm')}
        </div>
      </div>
    </div>
  );
}
