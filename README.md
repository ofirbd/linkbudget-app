# 📡 RF Link Budget Calculator

A modern, responsive, and completely offline-capable web application for performing Radio Frequency (RF) link budget calculations. 

This project is a modernization of a legacy Java Swing desktop application, rewritten entirely into a **single, self-contained HTML file** with zero runtime dependencies. It is designed to run flawlessly on both desktop monitors and mobile devices.

## 🚀 Live Demo
**[Link Budget-App](https://ofirbd.github.io/linkbudget-app/)**

## ✨ Features
* **100% Offline Capability:** The entire application (HTML, CSS, JavaScript, and math engine) is bundled into a single `index.html` file. No internet connection or backend server is required to run it.
* **Multiple Propagation Models:** Choose between FSPL, Hata, COST-231 Hata, Ericsson, SUI, Egli, Plane-Earth, and Log-Distance.
* **Dynamic Environment Modifiers:** For supported models (Hata, COST-231, and Ericsson), a smart UI segmented control appears, allowing you to instantly toggle the internal math engine between **Urban**, **Suburban**, and **Rural** environments.
* **Smart Frequency Validation:** The calculator actively monitors your selected frequency against the mathematical boundaries of your chosen model. If you push the frequency outside a model's validated range, the UI issues a soft visual warning. This keeps you informed of the mathematical constraints while still allowing you the freedom to intentionally extrapolate.
* **Stackable Attenuations:** Stack additional real-world losses like Vegetation Depth and Rain Attenuation on top of your core models.
* **Real-time Calculations:** Instantly calculates Receive Signal Level (RSL) and Link Margin as you adjust parameters via interactive sliders. Both the RSL and Fade Margin KPIs dynamically color-code (green/red) to indicate connection success.
* **Interactive Data Visualization:** Dynamic charting of signal sweep over distance. You can instantly toggle between three critical views:
  * **RSL (dBm):** View the raw received signal strength mapped against your receiver's sensitivity threshold.
  * **Fade Margin (dB):** Visualize the exact buffer your link has before failure (0 dB).
  * **Path Loss (dB):** Isolate and graph the pure environmental/distance loss independent of your radio hardware.
* **Persistent Storage:** Automatically saves your last used radio and antenna parameters across sessions.
* **Export Tool:** One-click generation and download of CSV reports for your calculations.

---

## 🧮 Propagation Models Explained

This calculator features several mathematical models to accurately estimate path loss depending on your environment.

### 1. Free Space Path Loss (FSPL)
The simplest model, assuming an unobstructed, straight-line line-of-sight path through a vacuum (or air) without any reflections or obstacles.
* **Best used for:** Space communications, point-to-point microwave links with high clearance, or baseline theoretical maximums.
* **Calculation:** Depends solely on the frequency ($f$) and the distance ($d$). Signal strength degrades strictly due to the natural geometric expansion of the wave front.

### 2. Hata Model
An empirical formulation based on the Okumura data, widely used for predicting path loss in built-up environments.
* **Best used for:** Traditional cellular networks and mobile communications in cities with dense buildings. Valid generally for **150 MHz to 1500 MHz**.
* **Calculation:** Incorporates the height of the transmitter antenna ($h_{te}$) and the receiver antenna ($h_{re}$) alongside frequency and distance. It assumes heavy scattering and diffraction over rooftops. 
* **Environment Modifiers:** Toggling to Suburban or Rural mathematically subtracts specific Okumura-Hata empirical correction factors from the baseline Urban calculation, significantly reducing the calculated path loss.

### 3. COST-231 Hata Model
An extension of the original Hata model, specifically formulated by the European COST committee to accurately predict path loss at higher frequencies.
* **Best used for:** Modern cellular networks, PCS, and higher-frequency mobile communications. Valid for **1500 MHz to 2000 MHz (2 GHz)**.
* **Calculation:** Uses the same inputs as the standard Hata model (antenna heights, distance) but alters the base mathematical constants to account for the increased absorption and scattering effects at 2 GHz. It automatically applies a 3 dB metropolitan center correction factor when set to Urban.
* **Environment Modifiers:** Supports Urban, Suburban, and Rural toggles.

### 4. Ericsson Model
A highly respected macrocellular model developed by Ericsson that adapts elements of the Okumura-Hata model but introduces specific gradient adjustments for frequency scaling.
* **Best used for:** Urban/Suburban macrocells where you need an alternative predictive gradient to standard Hata. Valid between **150 MHz and 1900 MHz**.
* **Calculation:** Uses deterministic equations based on distance and Tx/Rx heights, heavily augmented by a specialized non-linear frequency correction factor.
* **Environment Modifiers:** The internal engine automatically hot-swaps the base $a_0$ and $a_1$ path-loss coefficients based on whether you select Urban, Suburban, or Rural.

### 5. SUI (Stanford University Interim) Model
A model specifically calibrated by IEEE 802.16 for broadband wireless access, specifically suited for fixed-wireless links in higher frequency bands.
* **Best used for:** Fixed-wireless access (WiMAX, proprietary backhauls) in suburban environments. Valid for **1.9 GHz to 11 GHz**.
* **Calculation:** It relies on an initial Free Space calculation out to a 100m reference distance, followed by a heavily augmented Path Loss exponent determined by the base station height and specific terrain categories (this calculator defaults to Terrain Category B: Suburban).

### 6. Egli Model
A terrain-based model specifically designed for irregular terrain, hills, and uneven landscapes.
* **Best used for:** VHF/UHF television and radio broadcasting, or rural/suburban communications over uneven ground. Valid between **40 MHz and 1000 MHz**.
* **Calculation:** It is fundamentally a modified 2-ray model that introduces an empirical terrain factor. It relies heavily on the heights of both the transmitter and receiver antennas.

### 7. Plane-Earth (Ground Bounce) Model
A theoretical 2-ray model that calculates the interference between the direct line-of-sight wave and a secondary wave that reflects off the flat ground.
* **Best used for:** Long-distance links over highly flat terrain or large bodies of water where ground reflections cause phase cancellation.
* **Calculation:** Interestingly, the 2-ray approximation cancels out the frequency term entirely. The loss is calculated purely based on the distance ($d$) and the heights of both antennas ($h_{te}$, $h_{re}$). 

### 8. Log-Distance Model
A flexible, empirical model used to predict propagation loss inside buildings or across specific generalized environments by tweaking a variable called the "Path Loss Exponent" ($\gamma$).
* **Best used for:** Indoor Wi-Fi, factory floors, or customized environments where you have measured the specific decay rate ($\gamma$).
* **Calculation:** Uses FSPL to calculate the loss at a specific **Reference Distance ($d_0$)**, and then applies the Path Loss Exponent ($\gamma$) to calculate the exponential decay over the remaining distance. A $\gamma$ of 2.0 represents free space, while 3.0 to 6.0 represent increasingly dense environments (like offices or concrete buildings).

---

## 🌲 Environmental Modifiers

### Vegetation Loss (Weissberger's Model)
Trees and foliage absorb and scatter RF signals, especially at higher frequencies. This calculator utilizes **Weissberger's Modified Exponential Decay Model** (an ITU-recognized standard) to calculate this specific loss, which is then added dynamically on top of your chosen propagation model.
* **Calculation:** The loss is dynamically calculated based on the operating frequency (converted to GHz) and the depth of the vegetation ($d$) in meters. 
  * If the foliage depth is less than 14 meters, the model uses a specific curve to account for the rapid initial scattering effect: $L_{veg} = 1.33 \cdot f^{0.284} \cdot d^{0.588}$
  * If the foliage depth is greater than 14 meters, the wave is fully inside the canopy, and it switches to a linear decay rate: $L_{veg} = 0.45 \cdot f^{0.284} \cdot d$

### Rain Attenuation (ITU-R P.838)
High-frequency microwave links are highly susceptible to signal degradation caused by rain fade. This calculator implements an approximation of the official **ITU-R P.838** power-law standard to estimate specific attenuation based on localized rainfall.
* **Calculation:** The specific attenuation ($\gamma_R$ in dB/km) is calculated using the power-law relationship $\gamma_R = k \cdot R^\alpha$, where $R$ is the rainfall rate in mm/hr. Because the coefficients $k$ and $\alpha$ vary significantly depending on the operating frequency, the calculator dynamically interpolates them using an embedded lookup table spanning from 1 GHz to 100 GHz, ensuring accurate rain fade penalties for both lower-frequency cellular links and high-frequency microwave backhauls.

---

## 📱 How to Use
Since this is a single-file application, usage is incredibly simple:
1. Download the `index.html` file from the repository.
2. Double-click it to open it in any modern web browser (Chrome, Safari, Edge, Firefox).
3. Alternatively, you can save the file to your mobile phone and open it via a local file browser, or "Add to Home Screen" from the live GitHub Pages link for a native app experience.

## 🛠️ Technology Stack
* **Framework:** React + TypeScript
* **Styling:** Tailwind CSS (Dark Mode by default)
* **Charting:** Recharts
* **Build System:** Vite (compiled via `vite-plugin-singlefile` to bypass local file security restrictions and generate a 100% standalone artifact).
```
