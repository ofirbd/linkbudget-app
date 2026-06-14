# 📡 RF Link Budget Calculator

A modern, responsive, offline-capable single-file web application for calculating RF link budgets. This application replaces a legacy Java Swing app and provides a clean, mobile-friendly interface for RF engineers to analyze radio links.

## 🚀 Live Demo
**[Link Budget-App](https://ofirbd.github.io/linkbudget-app/)**

## ✨ Features

- **100% Offline Capability**: The entire application (HTML, CSS, JavaScript, and math engine) is bundled into a single `index.html` file using `vite-plugin-singlefile`. No internet connection or backend server is required to run the production build.
- **Multiple Propagation Models**: Supports Free Space Path Loss (FSPL), Hata (Urban/Suburban/Rural), COST-231 Hata, Egli, Ericsson, 3GPP TR 38.901, ITU-R P.1238 (Indoor), SUI, Plane-Earth, and Log-Distance.
- **Dynamic Environment Modifiers**: Smart UI toggles adjust the internal math engine between environments (e.g., Urban/Suburban/Rural or UMa/UMi/RMa for 3GPP).
- **Environmental Factors**: Calculate additional losses including Rain Attenuation (ITU-R P.838) and Vegetation Loss (Weissberger's Model).
- **Fresnel Zone Clearance**: Actively calculates the exact line-of-sight clearance radius required for the 1st Fresnel Zone at the midpoint of your link.
- **Interactive Visualization**: Dynamic charts (powered by Recharts) showing Distance sweeps against RSL, Fade Margin, or Path Loss.
- **Data Export**: Easily export sweep analysis data to CSV.
- **Persistence**: Automatically saves your parameters to `localStorage` so you can pick up where you left off.

## 🧮 Propagation Models Explained

This calculator features several mathematical models to accurately estimate path loss depending on your environment:

1. **Free Space Path Loss (FSPL)**: The simplest model for unobstructed, straight-line paths in a vacuum. Best for space communications or baseline theoretical maximums.
2. **3GPP TR 38.901**: A highly complex statistical model for 5G NR, valid from 500 MHz up to 100 GHz. Supports LOS/NLOS paths and UMa/UMi/RMa environments.
3. **ITU-R P.1238 (Indoor)**: Designed for short-range indoor communications with dynamic multi-floor penetration losses.
4. **Hata & COST-231 Hata Models**: Empirical formulations for traditional cellular and modern PCS networks in built-up environments (Urban/Suburban/Rural).
5. **Ericsson Model**: Adapts elements of the Okumura-Hata model with specific gradient adjustments for frequency scaling.
6. **SUI (Stanford University Interim)**: Specifically calibrated by IEEE 802.16 for broadband wireless access in suburban environments.
7. **Egli Model**: Designed for irregular terrain, hills, and uneven landscapes (VHF/UHF broadcasting).
8. **Plane-Earth (Ground Bounce)**: A theoretical 2-ray model reflecting interference off flat ground or water.
9. **Log-Distance Model**: A flexible, empirical model used to predict propagation loss using a customizable "Path Loss Exponent".

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) with `vite-plugin-singlefile`
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate into the directory:
   ```bash
   git clone <repository-url>
   cd linkbudget-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

### Building for Production

To generate the single-file standalone application:

```bash
npm run build
```

Once the build completes, navigate to the `dist` folder. You will find a single `index.html` file. You can open this file directly in any modern web browser, share it via email, or distribute it as needed. For a native app experience on mobile, you can use "Add to Home Screen" from the live demo link.

## 🏗️ Architecture

The application math logic is decoupled from the UI. Core RF math and propagation models are found in `src/lib/rfMath.ts`. The UI consists of modular components in `src/components/`, managed centrally by the state in `App.tsx`.
