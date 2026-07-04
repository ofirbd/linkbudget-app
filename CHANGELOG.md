# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-07-04
### Changed
- **Mobile UX Enhancements:** Upgraded the mobile bottom sheet to support fluid, finger-tracking swiping (4 states) with a native iOS/Android style pill handle.
- **KPI Layout:** Reordered mobile KPI cards to prioritize RSL, Fade Margin, and Path Loss on the top row, perfectly fitting two compact rows.
- **UI Tweaks:** Added a collapsible info toggle `(i)` for Propagation Model descriptions on mobile to save vertical space, and removed redundant headers.


## [1.0.0] - 2026-07-04
### Added
- **Initial Release:** Complete rewrite of the legacy Java Swing app into a modern React/TypeScript/Vite single-page application.
- **Propagation Models:** 10 core models including FSPL, Hata, COST-231 Hata, Ericsson, 3GPP TR 38.901, ITU-R P.1238, SUI, Egli, Plane-Earth, and Log-Distance.
- **Offline Mode:** Single-file offline deployment bundle (`index.html`) using `vite-plugin-singlefile`.
- **Advanced Sensitivity:** Built-in Receiver Sensitivity Calculator (Bandwidth, Noise Figure, Required SNR).
- **Mobile UX:** 4-state (collapsed, partial, half, expanded) swipable bottom sheet overlay for mobile parameter input.
- **Visualizations:** Dynamic distance sweep charting using Recharts (toggle between RSL, Fade Margin, and Path Loss).
- **Analysis Export:** Export distance sweep data directly to CSV.
- **Smart KPIs:** 3-state (Green/Amber/Red) intelligent color-coding for Link Margin KPIs.
- **Persistence:** UI state persistence via `localStorage`.
- **Documentation:** Integrated, in-app interactive Help and Operation Manual.
