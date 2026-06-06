# RF QA: Weissberger Vegetation Loss Branches

## Summary

The deployed calculator appears to reverse the two branches of Weissberger's
Modified Exponential Decay vegetation model. This can overstate foliage loss by
tens of dB for realistic vegetation depths.

This is a release-blocking RF accuracy issue for anyone using the calculator for
physical link planning.

## Evidence From The Public Bundle

The public repository contains only the built `index.html` bundle, not the
original source. In the minified bundle, the vegetation function is:

```js
function ve(e,t){
  if(t<=0)return 0;
  let n=e/1e3;
  return t<14 ? 1.33*n**.284*t**.588 : .45*n**.284*t
}
```

Interpreting the minified variables from the UI:

- `e` is frequency in MHz
- `t` is vegetation depth in meters
- `n` is frequency in GHz

The code applies the `1.33 * f^0.284 * d^0.588` branch when depth is less than
14 m, and the `0.45 * f^0.284 * d` branch when depth is 14 m or greater.

## Root Cause

The branch condition is inverted. Weissberger's model should use the linear
short-depth branch for shallow foliage and the power-law branch for deeper
foliage.

The intended source-level implementation should be:

```js
function weissbergerLoss(frequencyMHz, depthM) {
  if (frequencyMHz <= 0 || depthM <= 0) return 0;

  const frequencyGHz = frequencyMHz / 1000;

  if (depthM <= 14) {
    return 0.45 * frequencyGHz ** 0.284 * depthM;
  }

  return 1.33 * frequencyGHz ** 0.284 * depthM ** 0.588;
}
```

## Impact

At `2400 MHz` and `100 m` foliage depth:

- Current deployed behavior: about `57.7 dB`
- Correct Weissberger branch: about `25.6 dB`
- Error: about `+32.1 dB`

That is large enough to turn a viable RF link into an apparent failure.

## Recommended Fix

In the original source code:

1. Locate the vegetation / Weissberger loss function.
2. Change the depth branch so `depthM <= 14` uses the linear expression.
3. Use `frequencyGHz = frequencyMHz / 1000` explicitly to avoid unit ambiguity.
4. Keep vegetation loss as a separate output component in the link budget, not
   only folded into aggregate path loss.

## Required Tests

Add unit tests for these reference cases:

- `2400 MHz, 10 m`
- `2400 MHz, 14 m`
- `2400 MHz, 50 m`
- `2400 MHz, 100 m`
- `5800 MHz, 100 m`

Also add an integration test confirming that changing vegetation depth changes
only the vegetation-loss component and the final path-loss/RSL totals derived
from it.
