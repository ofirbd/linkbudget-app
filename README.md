# 📡 RF Link Budget Calculator

A modern, responsive, and completely offline-capable web application for performing Radio Frequency (RF) link budget calculations. 

This project is a modernization of a legacy Java Swing desktop application, rewritten entirely into a **single, self-contained HTML file** with zero runtime dependencies. It is designed to run flawlessly on both desktop monitors and mobile devices.

## 🚀 Live Demo
[Link Budget-App](https://ofirbd.github.io/linkbudget-app/)

## ✨ Features
* **100% Offline Capability:** The entire application (HTML, CSS, JavaScript, and math engine) is bundled into a single `index.html` file. No internet connection or backend server is required to run it.
* **Multiple Propagation Models:** Choose between FSPL, Hata, Egli, Plane-Earth, and Log-Distance.
* **Environmental Modifiers:** Stack additional real-world losses like Vegetation Depth on top of your core models.
* **Real-time Calculations:** Instantly calculates Receive Signal Level (RSL) and Link Margin as you adjust parameters via interactive sliders.
* **Visual Data:** Dynamic charting of signal loss over distance.
* **Persistent Storage:** Automatically saves your last used radio and antenna parameters across sessions.
* **Export Tool:** One-click generation and download of CSV reports for your calculations.

---

## 🧮 Propagation Models Explained

This calculator features several mathematical models to accurately estimate path loss depending on your environment.

### 1. Free Space Path Loss (FSPL)
The simplest model, assuming an unobstructed, straight-line line-of-sight path through a vacuum (or air) without any reflections or obstacles.
* **Best used for:** Space communications, point-to-point microwave links with high clearance, or baseline theoretical maximums.
* **Calculation:** Depends solely on the frequency ($f$) and the distance ($d$). Signal strength degrades strictly due to the natural geometric expansion of the wave front.

### 2. Hata Model (Urban)
An empirical formulation based on the Okumura data, widely used for predicting path loss in built-up urban environments.
* **Best used for:** Cellular networks and mobile communications in cities with dense buildings. Valid generally for 150 MHz to 1500 MHz.
* **Calculation:** Incorporates the height of the transmitter antenna ($h_{te}$) and the receiver antenna ($h_{re}$) alongside frequency and distance. It assumes heavy scattering and diffraction over rooftops.

### 3. Egli Model
A terrain-based model specifically designed for irregular terrain, hills, and uneven landscapes.
* **Best used for:** VHF/UHF television and radio broadcasting, or rural/suburban communications over uneven ground. Valid between 40 MHz and 1000 MHz.
* **Calculation:** It is fundamentally a modified 2-ray model that introduces an empirical terrain factor. It relies heavily on the heights of both the transmitter and receiver antennas.

### 4. Plane-Earth (Ground Bounce) Model
A theoretical 2-ray model that calculates the interference between the direct line-of-sight wave and a secondary wave that reflects off the flat ground.
* **Best used for:** Long-distance links over highly flat terrain or large bodies of water where ground reflections cause phase cancellation.
* **Calculation:** Interestingly, the 2-ray approximation cancels out the frequency term entirely. The loss is calculated purely based on the distance ($d$) and the heights of both antennas ($h_{te}$, $h_{re}$). 

### 5. Log-Distance Model
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
