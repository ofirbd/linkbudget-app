# RF QA: Out-Of-Range Model Results Are Exported Without Warning

## Summary

The deployed calculator warns about some invalid model ranges on the input
screen, but the Results page and CSV export still present exact-looking numeric
outputs without carrying the warning. This allows unsupported extrapolations to
be copied or exported as if they were valid RF calculations.

This is a high-impact RF accuracy issue because empirical propagation models are
only defensible inside their validation domains.

## Live Reproduction

Using the deployed app:

1. Keep the default frequency at `2400 MHz`.
2. Select `Hata`.
3. The input pane warns that Hata is validated for `150 - 1500 MHz`.
4. Navigate to Results.
5. The Results page shows exact Path Loss, RSL, and Fade Margin values without
   the warning.
6. Export CSV.
7. The CSV contains numeric sweep rows only and no validity warning.

## Evidence From The Public Bundle

The public repository contains only the built `index.html` bundle, not the
original source. In the minified bundle, validation is local to the input
component:

```js
case `HataUrban`:
  return t<150||t>1500
    ? `Hata model is mathematically validated for 150 - 1500 MHz.`
    : null;
```

The calculation and export paths still compute and export results:

```js
i.model===`HataUrban`
  ? e=ce(i.frequency,i.distance,i.hte,i.hre,i.environment)
  : ...
```

The CSV export starts with:

```csv
Distance(km),PathLoss(dB),RSL(dBm)
```

No validation status or warning text is included.

## Root Cause

Validation is implemented as UI text in the input panel rather than as a
central part of the calculation/export pipeline. As a result, warnings do not
travel with the computed result.

## Impact

An engineer can export a Hata calculation at `2400 MHz`, or similar invalid
model/range combinations, and later see only numeric path-loss/RSL values. The
exported artifact loses the information that the model was outside its validated
domain.

## Recommended Fix

In the original source code:

1. Create a pure validation function that accepts all calculation parameters and
   returns structured warnings.
2. Use that function in all paths:
   - input pane
   - Results page
   - chart annotations
   - CSV export
3. Decide whether invalid ranges should block calculation or produce a clearly
   labeled extrapolated result.
4. If calculation is allowed, include a visible `OUT_OF_VALIDATED_RANGE` status
   beside the numeric output.

Suggested source shape:

```ts
type ValidationWarning = {
  code: string;
  severity: 'warning' | 'error';
  message: string;
};

function validateLinkBudgetParams(params): ValidationWarning[] {
  // model-specific range checks live here
}
```

## Required Tests

Add tests for every model range:

- Hata frequency and distance limits
- COST-231 Hata frequency and distance limits
- Ericsson frequency limits
- SUI frequency and distance limits
- Egli frequency and distance limits
- 3GPP frequency and distance limits
- ITU-R P.1238 indoor distance limits

For each invalid case, assert that:

- input UI shows the warning
- Results UI shows the warning
- CSV export includes validation status and warning text
