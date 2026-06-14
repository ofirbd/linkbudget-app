import { X } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export function DocumentationModal({ onClose }: DocumentationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl max-h-[90dvh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/95 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-100">Math Documentation</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar prose prose-invert prose-slate max-w-none text-slate-300">
          <p className="text-lg text-slate-400 mb-8">
            This tool computes Radio Frequency (RF) link budgets using several standard mathematical propagation models. 
            Below is a brief explanation of each model, its intended use cases, and how the internal engine calculates the loss.
          </p>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">1. Free Space Path Loss (FSPL)</h3>
          <p>
            The simplest model, assuming an unobstructed, straight-line line-of-sight path through a vacuum (or air) without any reflections or obstacles.
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Space communications, point-to-point microwave links with high clearance, or baseline theoretical maximums.</li>
            <li><strong>Calculation:</strong> Signal strength degrades strictly due to the natural geometric expansion of the wave front over distance.</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">2. 3GPP TR 38.901</h3>
          <p>
            A modern, highly complex statistical propagation model standardized by 3GPP for next-generation mobile networks (5G NR).
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Modern 5G and millimeter-wave network planning across an extremely wide frequency spectrum. Valid from <strong>500 MHz up to 100 GHz</strong>, and distances from <strong>10m to 10km</strong>.</li>
            <li><strong>Calculation:</strong> Replaces rigid empirical formulas with dynamic breakpoint distance calculations that vary precisely based on your Tx and Rx antenna heights.</li>
            <li><strong>Path Type:</strong> Introduces an exclusive Line-of-Sight vs Non-Line-of-Sight toggle. Selecting NLOS calculates a massive scattering penalty.</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">3. ITU-R P.1238 (Indoor)</h3>
          <p>
            A specialized, standardized model designed specifically for short-range, indoor communication systems.
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Wi-Fi, indoor cellular coverage, and in-building propagation analysis. Valid typically for short distances up to <strong>1 km</strong>.</li>
            <li><strong>Calculation:</strong> Employs precise empirical distance power-loss coefficients based on building type, and injects severe, non-linear attenuation caused by penetrating multiple floors.</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">4. Hata & COST-231 Hata</h3>
          <p>
            Empirical formulations based on the Okumura data, widely used for predicting path loss in built-up environments.
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Traditional cellular networks and mobile communications in cities with dense buildings. Standard Hata is valid for <strong>150 MHz to 1500 MHz</strong>. COST-231 extends this for <strong>1500 MHz to 2000 MHz</strong>.</li>
            <li><strong>Calculation:</strong> Incorporates the height of the transmitter and receiver antennas. It assumes heavy scattering and diffraction over rooftops.</li>
            <li><strong>Environment Modifiers:</strong> Toggling to Suburban or Rural mathematically subtracts specific Okumura-Hata empirical correction factors from the baseline Urban calculation.</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">5. Ericsson Model</h3>
          <p>
            A highly respected macrocellular model developed by Ericsson that adapts elements of the Okumura-Hata model but introduces specific gradient adjustments for frequency scaling.
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Urban/Suburban macrocells where you need an alternative predictive gradient to standard Hata. Valid between <strong>150 MHz and 1900 MHz</strong>.</li>
            <li><strong>Calculation:</strong> Uses deterministic equations heavily augmented by a specialized non-linear frequency correction factor based on the selected environment (Urban, Suburban, Rural).</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">6. SUI (Stanford University Interim) Model</h3>
          <p>
            A model specifically calibrated by IEEE 802.16 for broadband wireless access, specifically suited for fixed-wireless links.
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Fixed-wireless access (WiMAX, proprietary backhauls) in suburban environments. Valid for <strong>1.9 GHz to 11 GHz</strong>.</li>
            <li><strong>Calculation:</strong> Relies on an initial Free Space calculation out to a 100m reference distance, followed by a heavily augmented Path Loss exponent determined by terrain categories.</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">7. Egli Model</h3>
          <p>
            A terrain-based model specifically designed for irregular terrain, hills, and uneven landscapes.
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> VHF/UHF television and radio broadcasting, or rural/suburban communications over uneven ground. Valid between <strong>40 MHz and 1000 MHz</strong>, up to <strong>60 km</strong>.</li>
            <li><strong>Calculation:</strong> Fundamentally a modified 2-ray model that introduces an empirical terrain factor based on the heights of both the transmitter and receiver antennas.</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">8. Plane-Earth (Ground Bounce) Model</h3>
          <p>
            A theoretical 2-ray model that calculates the interference between the direct line-of-sight wave and a secondary wave that reflects off the flat ground.
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Long-distance links over highly flat terrain or large bodies of water where ground reflections cause phase cancellation.</li>
            <li><strong>Calculation:</strong> The 2-ray approximation cancels out the frequency term entirely, calculating loss purely based on distance and antenna heights.</li>
          </ul>

          <h3 className="text-blue-400 border-b border-slate-700 pb-2">9. Log-Distance Model</h3>
          <p>
            A flexible, empirical model used to predict propagation loss inside buildings or across specific generalized environments by tweaking the Path Loss Exponent (γ).
          </p>
          <ul className="list-disc pl-5 mb-6 text-slate-400">
            <li><strong>Best used for:</strong> Indoor Wi-Fi, factory floors, or customized environments where you have measured the specific decay rate.</li>
            <li><strong>Calculation:</strong> Uses FSPL at a reference distance, then applies the Path Loss Exponent to calculate the exponential decay over the remaining distance.</li>
          </ul>

          <h3 className="text-emerald-400 border-b border-slate-700 pb-2 mt-8">Environmental Attenuations</h3>
          
          <h4 className="text-slate-200 mt-4 font-semibold">Vegetation Loss (Weissberger's Model)</h4>
          <p className="text-sm text-slate-400 mb-4">
            Trees and foliage absorb and scatter RF signals. This calculator utilizes <strong>Weissberger's Modified Exponential Decay Model</strong> to calculate this specific loss, which is then added dynamically on top of your chosen propagation model. The decay rate changes depending on whether the wave is partially or fully submerged in the canopy.
          </p>

          <h4 className="text-slate-200 mt-4 font-semibold">Rain Attenuation (ITU-R P.838)</h4>
          <p className="text-sm text-slate-400 mb-6">
            High-frequency microwave links are highly susceptible to signal degradation caused by rain fade. This calculator implements an approximation of the official <strong>ITU-R P.838</strong> power-law standard to estimate specific attenuation based on localized rainfall. The internal engine dynamically interpolates power-law coefficients based on your exact frequency to ensure accurate rain fade penalties.
          </p>
          
          <div className="mt-8 pt-6 border-t border-slate-700 text-center text-slate-500 text-sm">
            <p>Calculations run entirely client-side on your device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
