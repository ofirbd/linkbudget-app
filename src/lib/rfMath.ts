/**
 * Core RF Propagation Models
 */

// Free Space Path Loss (FSPL) in dB
// f: frequency in MHz, d: distance in km
export function calculateFSPL(f: number, d: number): number {
  if (f <= 0 || d <= 0) return 0;
  return 32.44 + 20 * Math.log10(d) + 20 * Math.log10(f);
}

// Hata Model in dB
// f: freq in MHz (150-1500), d: dist in km (1-20),
// hte: Tx height in m (30-200), hre: Rx height in m (1-10)
export function calculateHataUrban(f: number, d: number, hte: number, hre: number, env: string = 'Urban'): number {
  if (f <= 0 || d <= 0 || hte <= 0 || hre <= 0) return 0;
  // Antenna height correction factor (for a small/medium city)
  const a_hre = (1.1 * Math.log10(f) - 0.7) * hre - (1.56 * Math.log10(f) - 0.8);
  
  let L = 69.55 + 26.16 * Math.log10(f) - 13.82 * Math.log10(hte) - a_hre + 
         (44.9 - 6.55 * Math.log10(hte)) * Math.log10(d);
         
  if (env === 'Suburban') {
    L = L - 2 * Math.pow(Math.log10(f / 28), 2) - 5.4;
  } else if (env === 'Rural') {
    L = L - 4.78 * Math.pow(Math.log10(f), 2) + 18.33 * Math.log10(f) - 40.94;
  }
  return L;
}

// COST-231 Hata Model in dB
// f: freq in MHz (1500-2000), d: dist in km (1-20),
// hte: Tx height in m (30-200), hre: Rx height in m (1-10)
export function calculateCost231Hata(f: number, d: number, hte: number, hre: number, env: string = 'Urban'): number {
  if (f <= 0 || d <= 0 || hte <= 0 || hre <= 0) return 0;
  // Antenna height correction factor (for a small/medium city)
  const a_hre = (1.1 * Math.log10(f) - 0.7) * hre - (1.56 * Math.log10(f) - 0.8);
  const Cm = env === 'Urban' ? 3 : 0; // 3 dB for metropolitan centers, 0 for suburban/rural
  
  let L = 46.3 + 33.9 * Math.log10(f) - 13.82 * Math.log10(hte) - a_hre + 
         (44.9 - 6.55 * Math.log10(hte)) * Math.log10(d) + Cm;
         
  if (env === 'Suburban') {
    L = L - 2 * Math.pow(Math.log10(f / 28), 2) - 5.4;
  } else if (env === 'Rural') {
    L = L - 4.78 * Math.pow(Math.log10(f), 2) + 18.33 * Math.log10(f) - 40.94;
  }
  return L;
}

// Egli Model (for irregular terrain, 40-1000 MHz)
// f: freq in MHz, d: dist in km, hte: Tx height in m, hre: Rx height in m
export function calculateEgli(f: number, d: number, hte: number, hre: number): number {
  if (f <= 0 || d <= 0 || hte <= 0 || hre <= 0) return 0;
  return 117 + 40 * Math.log10(d) + 20 * Math.log10(f) - 20 * Math.log10(hte * hre);
}

// Ericsson Model
// f: freq in MHz, d: dist in km, hte: Tx height in m, hre: Rx height in m
export function calculateEricsson(f: number, d: number, hte: number, hre: number, env: string = 'Urban'): number {
  if (f <= 0 || d <= 0 || hte <= 0 || hre <= 0) return 0;
  
  let a0 = 36.2, a1 = 30.2;
  if (env === 'Suburban') {
    a0 = 43.20;
    a1 = 68.93;
  } else if (env === 'Rural') {
    a0 = 45.95;
    a1 = 100.60;
  }
  
  const a2 = -12.0, a3 = 0.1;
  const g_f = 44.49 * Math.log10(f) - 4.78 * Math.pow(Math.log10(f), 2);
  const log_d = Math.log10(d);
  const log_hte = Math.log10(hte);
  return a0 + a1 * log_d + a2 * log_hte + a3 * log_hte * log_d - 3.2 * Math.pow(Math.log10(11.75 * hre), 2) + g_f;
}

// 3GPP TR 38.901 Model
export function calculate3GPP38901(f: number, d: number, hBS: number, hUT: number, env: string = 'Urban', pathType: string = 'LOS'): number {
  if (f <= 0 || d <= 0 || hBS <= 0 || hUT <= 0) return 0;
  
  const fc = f / 1000; // GHz
  const d3D = d * 1000; // meters
  const c = 3e8; // speed of light
  const f_Hz = f * 1e6;
  
  let pl_los = 0;
  let pl_nlos_formula = 0;

  if (env === 'Urban') { // UMa
    const hE = 1.0;
    const hBS_prime = Math.max(0.01, hBS - hE);
    const hUT_prime = Math.max(0.01, hUT - hE);
    const dBP_prime = 4 * hBS_prime * hUT_prime * f_Hz / c;
    
    const pl1 = 28.0 + 22 * Math.log10(d3D) + 20 * Math.log10(fc);
    const pl2 = 28.0 + 40 * Math.log10(d3D) + 20 * Math.log10(fc) - 9 * Math.log10(Math.pow(dBP_prime, 2) + Math.pow(hBS - hUT, 2));
    pl_los = (d3D <= dBP_prime) ? pl1 : pl2;
    pl_nlos_formula = 13.54 + 39.08 * Math.log10(d3D) + 20 * Math.log10(fc) - 0.6 * (hUT - 1.5);
    
  } else if (env === 'Suburban') { // UMi
    const hE = 1.0;
    const hBS_prime = Math.max(0.01, hBS - hE);
    const hUT_prime = Math.max(0.01, hUT - hE);
    const dBP_prime = 4 * hBS_prime * hUT_prime * f_Hz / c;
    
    const pl1 = 32.4 + 21 * Math.log10(d3D) + 20 * Math.log10(fc);
    const pl2 = 32.4 + 40 * Math.log10(d3D) + 20 * Math.log10(fc) - 9.5 * Math.log10(Math.pow(dBP_prime, 2) + Math.pow(hBS - hUT, 2));
    pl_los = (d3D <= dBP_prime) ? pl1 : pl2;
    pl_nlos_formula = 22.4 + 35.3 * Math.log10(d3D) + 21.3 * Math.log10(fc) - 0.3 * (hUT - 1.5);
    
  } else { // Rural (RMa)
    const dBP = 2 * Math.PI * hBS * hUT * fc * 1e9 / c;
    
    // RMa simplified using h=5, W=20
    const pl1 = 31.67 + 20.5 * Math.log10(d3D) + 20 * Math.log10(fc) + 0.0014 * d3D;
    const pl1_dBP = 31.67 + 20.5 * Math.log10(dBP) + 20 * Math.log10(fc) + 0.0014 * dBP;
    const pl2 = pl1_dBP + 40 * Math.log10(d3D / dBP);
    pl_los = (d3D <= dBP) ? pl1 : pl2;
    
    // NLOS simplified RMa
    const W = 20;
    const h = 5;
    const term1 = 161.04 - 7.1 * Math.log10(W) + 7.5 * Math.log10(h);
    const term2 = (24.37 - 3.7 * Math.pow(h/hBS, 2)) * Math.log10(hBS);
    const term3 = (43.42 - 3.1 * Math.log10(hBS)) * (Math.log10(d3D) - 3);
    const term4 = 20 * Math.log10(fc);
    const term5 = 3.2 * Math.pow(Math.log10(11.75 * hUT), 2) - 4.97;
    pl_nlos_formula = term1 - term2 + term3 + term4 - term5;
  }

  if (pathType === 'LOS') {
    return pl_los;
  } else {
    return Math.max(pl_los, pl_nlos_formula);
  }
}

// ITU-R P.1238 Indoor Model
// f: freq in MHz, d: dist in km, env: string (Residential, Office, Commercial), floors: number
export function calculateITUR1238(f: number, d: number, env: string = 'Office', floors: number = 0): number {
  if (f <= 0 || d <= 0) return 0;
  
  const d_meters = d * 1000;
  
  // Power loss coefficient N
  let N = 30; // Default Office
  if (env === 'Residential') {
    N = 28;
  } else if (env === 'Commercial') {
    N = 22;
  } else {
    // Office
    N = f > 2000 ? 31 : 30; 
  }
  
  // Floor penetration loss Lf
  let Lf = 0;
  if (floors > 0) {
    if (env === 'Residential') {
      Lf = floors * 4;
    } else if (env === 'Commercial') {
      Lf = 6 + 3 * (floors - 1);
    } else { // Office
      Lf = 15 + 4 * (floors - 1);
    }
  }
  
  return 20 * Math.log10(f) + N * Math.log10(Math.max(1, d_meters)) + Lf - 28;
}

// SUI (Stanford University Interim) Model
// f: freq in MHz, d: dist in km, hte: Tx height in m, hre: Rx height in m
export function calculateSUI(f: number, d: number, hte: number, hre: number): number {
  if (f <= 0 || d <= 0 || hte <= 0 || hre <= 0) return 0;
  const d0 = 0.1; // 100m reference distance in km
  const lambda = 300 / f; // wavelength in meters
  const A = 20 * Math.log10((4 * Math.PI * 100) / lambda);
  
  // Terrain Category B (Suburban)
  const a = 4.0, b = 0.0065, c = 17.1;
  const gamma = a - b * hte + c / hte;
  
  const Xf = 6.0 * Math.log10(f / 2000);
  const Xh = -10.8 * Math.log10(hre / 2.0);
  const s = 8.2; // Shadowing factor
  
  let pl = A + Xf + Xh + s;
  if (d > d0) {
    pl += 10 * gamma * Math.log10(d / d0);
  }
  return pl;
}

// System Performance
export function calculateRSL(txPower: number, txLoss: number, txGain: number, pathLoss: number, rxGain: number, rxLoss: number): number {
    const eirp = txPower - txLoss + txGain;
    return eirp - pathLoss + rxGain - rxLoss;
}

export function calculateLinkMargin(rsl: number, rxSensitivity: number): number {
    return rsl - rxSensitivity;
}

// Log-Distance Path Loss Model
// f: freq in MHz, d: dist in km, d0: ref dist in km, gamma: path loss exponent
export function calculateLogDistance(f: number, d: number, d0: number, gamma: number): number {
  if (f <= 0 || d <= 0 || d0 <= 0 || gamma <= 0) return 0;
  const pl_d0 = calculateFSPL(f, d0);
  return pl_d0 + 10 * gamma * Math.log10(d / d0);
}

// Plane-Earth (Ground Bounce) Model
// d: dist in km, hte: Tx height in m, hre: Rx height in m
export function calculatePlaneEarth(d: number, hte: number, hre: number): number {
  if (d <= 0 || hte <= 0 || hre <= 0) return 0;
  return 120 + 40 * Math.log10(d) - 20 * Math.log10(hte) - 20 * Math.log10(hre);
}

// Weissberger's Modified Exponential Decay Model (Vegetation Loss)
// f: freq in MHz, depth: foliage depth in meters
export function calculateVegetationLoss(f: number, depth: number): number {
  if (depth <= 0) return 0;
  const f_GHz = f / 1000;
  if (depth < 14) {
    return 1.33 * Math.pow(f_GHz, 0.284) * Math.pow(depth, 0.588);
  } else {
    return 0.45 * Math.pow(f_GHz, 0.284) * depth;
  }
}

// Rain Attenuation Model (ITU-R P.838 Approximation)
// f: freq in MHz, d: distance in km, R: rainfall rate in mm/hr
export function calculateRainAttenuation(f: number, d: number, R: number): number {
  if (f <= 0 || d <= 0 || R <= 0) return 0;
  const f_GHz = f / 1000;
  
  // Simplified lookup table for k and alpha (Circular Polarization approx)
  const table = [
    [1, 0.0000387, 0.912],
    [2, 0.000154, 0.963],
    [4, 0.00065, 1.121],
    [6, 0.00175, 1.308],
    [8, 0.00454, 1.327],
    [10, 0.0101, 1.276],
    [12, 0.0188, 1.217],
    [15, 0.0367, 1.154],
    [20, 0.0751, 1.099],
    [30, 0.187, 1.021],
    [40, 0.350, 0.939],
    [100, 1.06, 0.753]
  ];
  
  let lower = table[0];
  let upper = table[table.length - 1];
  
  if (f_GHz <= lower[0]) upper = lower;
  else if (f_GHz >= upper[0]) lower = upper;
  else {
    for (let i = 0; i < table.length - 1; i++) {
      if (f_GHz >= table[i][0] && f_GHz <= table[i+1][0]) {
        lower = table[i];
        upper = table[i+1];
        break;
      }
    }
  }
  
  let k, alpha;
  if (lower[0] === upper[0]) {
    k = lower[1];
    alpha = lower[2];
  } else {
    const ratio = (f_GHz - lower[0]) / (upper[0] - lower[0]);
    k = lower[1] + ratio * (upper[1] - lower[1]);
    alpha = lower[2] + ratio * (upper[2] - lower[2]);
  }
  
  return k * Math.pow(R, alpha) * d;
}

// Fresnel Zone (1st zone midpoint radius in meters)
// f: freq in MHz, d: dist in km
export function calculateFresnelZone(f: number, d: number): number {
  if (f <= 0 || d <= 0) return 0;
  const f_GHz = f / 1000;
  return 8.66 * Math.sqrt(d / f_GHz);
}
