# RF QA: CSV Export Is Not Audit-Ready

## Summary

The deployed calculator exports only distance, path loss, and RSL. That is not
enough for RF engineering review, reproducibility, or handoff. Engineers need
the model, assumptions, inputs, environmental losses, margin, and validation
status alongside the numeric results.

This is a medium-to-high impact issue because exported results can be separated
from the UI context that explains how they were calculated.

## Live Reproduction

Using the deployed app:

1. Select any model.
2. Click `Export Sweep CSV`.
3. The exported file contains rows like:

```csv
Distance(km),PathLoss(dB),RSL(dBm)
0.2,111.38,-63.38
0.4,121.98,-73.98
```

The export does not include the selected model inputs, assumptions, warnings, or
fade margin.

## Evidence From The Public Bundle

The public repository contains only the built `index.html` bundle, not the
original source. In the minified bundle, the export is constructed with:

```js
data:text/csv;charset=utf-8,Distance(km),PathLoss(dB),RSL(dBm)
```

The sweep data in memory includes margin:

```js
e.push({
  distance: Number(r.toFixed(2)),
  pathLoss: t,
  rsl: n,
  margin: a
})
```

But the CSV export omits margin and all input metadata.

## Root Cause

CSV export is implemented as a narrow chart-data dump instead of an engineering
calculation record. It exports derived values but not the assumptions needed to
reproduce or validate them.

## Impact

An RF engineer receiving the CSV cannot determine:

- propagation model
- frequency
- environment/scenario/building type
- LOS/NLOS path type
- antenna heights
- Tx power
- gains and losses
- receiver sensitivity
- vegetation and rain assumptions
- validation warnings
- fade margin

This makes the CSV unsuitable as an auditable engineering artifact.

## Recommended Fix

In the original source code:

1. Export all inputs and model assumptions.
2. Include both aggregate and component losses.
3. Include fade margin.
4. Include validation status and warnings.
5. Include units in every header.
6. Keep one row per sweep point, with repeated metadata columns, so the file can
   be filtered and audited without reading separate UI state.

Minimum suggested columns:

```csv
Model,Environment,PathType,Frequency(MHz),Distance(km),TxPower(dBm),TxLoss(dB),TxGain(dBi),TxHeight(m),RxGain(dBi),RxLoss(dB),RxHeight(m),RxSensitivity(dBm),PropagationPathLoss(dB),VegetationLoss(dB),RainLoss(dB),TotalPathLoss(dB),RSL(dBm),FadeMargin(dB),ValidationStatus,Warnings
```

## Required Tests

Add export tests confirming:

- CSV includes model and all active input values.
- CSV includes fade margin.
- CSV includes validation warnings for out-of-range models.
- CSV includes model-specific fields when relevant.
- Numeric values in CSV match the Results page for the same parameter set.

Also add at least one golden CSV fixture for a known FSPL case so future changes
cannot silently alter export semantics.
