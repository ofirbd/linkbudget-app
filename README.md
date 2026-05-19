# 📡 RF Link Budget Calculator

A modern, responsive, and completely offline-capable web application for performing Radio Frequency (RF) link budget calculations. 

This project is a modernization of a legacy Java Swing desktop application, rewritten entirely into a **single, self-contained HTML file** with zero runtime dependencies. It is designed to run flawlessly on both desktop monitors and mobile devices.

## 🚀 Live Demo
[Link Budget-App](https://ofirbd.github.io/linkbudget-app/)

## ✨ Features
* **100% Offline Capability:** The entire application (HTML, CSS, JavaScript, and math engine) is bundled into a single `index.html` file. No internet connection or backend server is required to run it.
* **Multiple Propagation Models:**
  * Free Space Path Loss (FSPL)
  * Hata Model (Urban environment)
  * Egli Model
  * Plane-Earth (Ground Bounce) Model
  * Log-Distance Path Loss Model (with customizable path loss exponent and reference distance)
* **Real-time Calculations:** Instantly calculates Receive Signal Level (RSL) and Link Margin as you adjust parameters via interactive sliders.
* **Visual Data:** Dynamic charting of signal loss over distance.
* **Persistent Storage:** Automatically saves your last used radio and antenna parameters across sessions.
* **Export Tool:** One-click generation and download of CSV reports for your calculations.

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
