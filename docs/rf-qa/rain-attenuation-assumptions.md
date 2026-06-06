# RF QA: Rain Attenuation Needs Engineering Assumptions

## Summary

The deployed calculator presents rain attenuation as an ITU-R P.838-style
calculation, but the implementation does not expose the assumptions required for
engineering-grade microwave or mmWave rain-fade planning. It uses a sparse
coefficient table and multiplies by the full path distance without polarization,
elevation angle, or terrestrial path-reduction handling.

This is a high-impact RF accuracy issue because rain fade can dominate high
frequency links and can differ by many dB depending on polarization and path
geometry.

## Evidence From The Public Bundle

The public repository contains only the built `index.html` bundle, not the
original source. In the minified bundle, the rain function is:

```js
function ye(e,t,n){
  if(e<=0||t<=0||n<=0)return 0;
  let r=e/1e3,
      i=[[1,387e-7,.912],[2,154e-6,.963], ... [100,1.06,.753]];
  ...
  return s*n**+c*t
}
```

Interpreting the minified variables from the UI:

- `e` is frequency in MHz
- `t` is link distance in km
- `n` is rain rate in mm/hr
- the coefficient table is a simplified frequency table

Because of JavaScript parsing, the return expression behaves like:

```js
return k * rainRate ** alpha * distanceKm;
```

That is a specific-attenuation estimate multiplied by full path distance.

## Root Cause

The current UI and documentation imply a more complete standards-based rain
fade model than the implementation can support. A usable engineering rain model
needs explicit assumptions for at least:

- polarization
- elevation angle
- link type and path geometry
- effective path length / path reduction
- rain climate or rain-rate percentile when doing availability work

The current implementation provides only frequency, rain rate, and full path
distance.

## Impact

For short screening calculations, `k * R^alpha * d` can be useful as a rough
estimate. For actual terrestrial microwave planning, it is not enough to support
availability or fade-margin decisions.

At high rain rates and high frequencies, missing polarization and path-reduction
assumptions can move the result by many dB.

## Recommended Fix

In the original source code, choose one of these paths:

### Option A: Make It Explicitly A Screening Estimate

1. Rename the output to `Rain screening loss`.
2. Add UI text and CSV metadata stating that it uses approximate
   `specific attenuation * full path length`.
3. Do not market the output as an engineering-grade ITU-R rain fade design
   result.

### Option B: Implement Engineering-Grade Rain Fade

1. Implement ITU-R P.838 coefficient handling with polarization and elevation
   angle inputs.
2. Add the appropriate terrestrial path-reduction workflow for the intended link
   type.
3. Add rain-rate percentile / availability inputs if the app is intended for
   outage or availability planning.
4. Export all assumptions in CSV.

## Required Tests

Add reference tests for:

- horizontal polarization at 10, 20, and 40 GHz
- vertical polarization at 10, 20, and 40 GHz
- zero rain rate
- zero or invalid distance
- CSV export of rain assumptions

The tests should name the source table/recommendation used for each reference
case and should assert units explicitly.
