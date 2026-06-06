# RF QA: ITU-R P.1238 Environment State And Result Label

## Summary

The deployed calculator reuses one generic `environment` state across outdoor
models, 3GPP scenarios, and ITU-R P.1238 indoor building types. When switching
to ITU-R P.1238, stale outdoor values can remain active and produce calculations
that do not match the selected or displayed indoor building type.

This is a release-blocking RF accuracy issue because the displayed model label
can disagree with the coefficient used in the formula.

## Live Reproduction

Using the deployed app:

1. Start from the default Hata / Urban state.
2. Switch the model to `ITU-R P.1238 (Indoor)`.
3. The UI shows `Residential`, `Office`, and `Commercial` buttons, but none are
   selected because the underlying state is still `Urban`.
4. The Results page labels the model as `Residential`, while the formula uses
   the fallback branch.
5. Select `Residential` explicitly.
6. The computed path loss changes by about `12 dB`, but the Results label
   changes to `Commercial`.

## Evidence From The Public Bundle

The public repository contains only the built `index.html` bundle, not the
original source. In the minified bundle, the ITU-R P.1238 formula branches are:

```js
function fe(e,t,n=`Office`,r=0){
  ...
  a = n===`Residential` ? 28 : n===`Commercial` ? 22 : e>2e3 ? 31 : 30;
  ...
}
```

The results label maps old outdoor environment values to indoor labels:

```js
e===`ITUR1238`
  ? t===`Urban` ? `Residential` : t===`Suburban` ? `Office` : `Commercial`
  : t
```

This means:

- `Urban` can be carried into ITU-R P.1238 even though it is not a valid indoor
  building type.
- The formula treats unknown values such as `Urban` as the fallback branch.
- The Results screen displays `Urban` as `Residential`.
- A real `Residential` value is displayed as `Commercial`.

## Root Cause

The app uses a single cross-model state field for semantically different model
parameters:

- Hata / Ericsson: `Urban | Suburban | Rural`
- 3GPP: `UMa | UMi | RMa`
- ITU-R P.1238: `Residential | Office | Commercial`

The result-display mapper then tries to translate the shared state instead of
displaying the actual model-specific value.

## Recommended Fix

In the original source code:

1. Replace the shared `environment` string with model-specific typed values, or
   store environment/scenario under model-specific fields.
2. Normalize dependent state when the propagation model changes.
3. For ITU-R P.1238, allow only `Residential`, `Office`, and `Commercial`.
4. Display the Results label from the same value used by the formula.
5. Avoid fallback formula branches for invalid model-specific enum values;
   invalid state should throw in development and show a validation error in UI.

Suggested shape:

```ts
type OutdoorEnvironment = 'Urban' | 'Suburban' | 'Rural';
type GppScenario = 'UMa' | 'UMi' | 'RMa';
type IndoorBuildingType = 'Residential' | 'Office' | 'Commercial';
```

## Required Tests

Add UI/state tests for:

- Switching from Hata Urban to ITU-R P.1238 chooses a valid indoor default.
- `Residential` calculates with the residential coefficient and displays
  `Residential`.
- `Office` calculates with the office coefficient and displays `Office`.
- `Commercial` calculates with the commercial coefficient and displays
  `Commercial`.
- Switching back from ITU-R P.1238 to Hata chooses a valid outdoor default.

Add pure formula tests confirming each building type uses the intended path-loss
coefficient.
