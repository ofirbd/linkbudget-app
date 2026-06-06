# RF QA: SUI Shadow Fading Is Mixed Into Path Loss

## Summary

The deployed SUI implementation appears to add a fixed `8.2 dB` shadow-fading
term directly into path loss. If the UI intends to display median deterministic
path loss, this makes every SUI result `8.2 dB` too pessimistic. If the term is
intended as shadow margin, it should be labeled and exposed separately instead
of being silently included in propagation loss.

This is a high-impact RF accuracy issue because it directly changes RSL and
fade margin.

## Evidence From The Public Bundle

The public repository contains only the built `index.html` bundle, not the
original source. In the minified bundle, the SUI function contains:

```js
function pe(e,t,n,r){
  ...
  let u=o+c+l+8.2;
  return t>i&&(u+=10*s*Math.log10(t/i)),u
}
```

Interpreting the minified variables from the UI:

- `e` is frequency in MHz
- `t` is distance in km
- `n` is transmitter height in meters
- `r` is receiver height in meters
- `u` is the returned path loss

The constant `+8.2` is always added to the path-loss output.

## Root Cause

The implementation combines two different RF budget concepts:

1. Median propagation path loss
2. Shadow fading / statistical margin

Those should not be silently merged into a single path-loss value. Engineers
need to know whether a displayed path loss is a median prediction or a
margin-loaded design value.

## Impact

For every SUI result:

- Path loss is increased by `8.2 dB`
- RSL is decreased by `8.2 dB`
- Fade margin is decreased by `8.2 dB`

That can incorrectly make a link look non-viable.

## Recommended Fix

In the original source code:

1. Remove the hardcoded `+8.2` from the median SUI path-loss function.
2. Add an explicit `shadowFadingDb` or `fadeMarginDb` input if the app wants to
   support statistical margin planning.
3. Show SUI outputs as separate components:
   - median propagation path loss
   - shadow fading / margin
   - environmental losses
   - total design loss
   - RSL
   - link margin
4. Include the selected shadow margin in CSV export.

Suggested source shape:

```ts
const medianPathLossDb = suiMedianPathLoss(params);
const shadowMarginDb = params.shadowMarginDb ?? 0;
const totalDesignLossDb =
  medianPathLossDb + vegetationLossDb + rainLossDb + shadowMarginDb;
```

## Required Tests

Add tests showing:

- SUI median path loss does not include a hidden fixed margin.
- Adding `shadowMarginDb = 8.2` changes only the total design loss, RSL, and
  final link margin.
- CSV export includes both median path loss and the configured shadow margin.

Also add UI text or labels so users can distinguish median loss from a
margin-loaded design result.
