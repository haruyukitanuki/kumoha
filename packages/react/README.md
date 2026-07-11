<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="./TanudenKumohaReact-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="./TanudenKumohaReact-LogoBlack.svg">
  <img src="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/packages/react/TanudenKumohaReact-LogoBlack.svg" alt="Tanuden Kumoha React Logo" width="40%">
</picture>
</p>
<br>
<p align="center">React bindings for the Tanuden Kumoha theming engine. Selector-based, built for high-frequency telemetry.</p>
<br>

[![License](https://img.shields.io/badge/License-LGPL--3.0-388270)](#license)

<p align="center"><b>English</b> | <a href="./README.ja.md">日本語</a></p>

---

## Installation

```bash
npm install @tanuden/kumoha-react @tanuden/kumoha @tanuden/rudolf react react-dom
```

## Setup

Wrap your app once. The provider owns a single client, disposes it on unmount, and exposes an immutable snapshot store to the hooks.

```tsx
import { KumohaProvider } from '@tanuden/kumoha-react';

<KumohaProvider uri="http://localhost:58680" options={{ themeName: '@you/theme-name' }}>
  <App />
</KumohaProvider>;
```

## Reading telemetry

The frame arrives at ~10 Hz. Each consumer pays only for what it reads.

### Reactive Selector
Re-renders only when the selected value changes (`Object.is` by default; pass `shallow` for object/tuple selections).

```tsx
import { useKumohaFrame, shallow } from '@tanuden/kumoha-react';

const speed = useKumohaFrame((f) => f?.physics.speed ?? 0);          // primitive, cheapest
const doors = useKumohaFrame((f) => f?.doors ?? null, shallow);      // object slice
```

### Throttled Selector
Latest value, but re-renders at most once per `throttleMs`. For heavy/low-priority views.

```tsx
import { useKumohaFrameThrottled } from '@tanuden/kumoha-react';

const stations = useKumohaFrameThrottled((f) => f?.stations.list ?? [], {
  throttleMs: 250,
  equalityFn: shallow
});
```

### Imperative (render-free)
Fires on change without a React render, for canvas gauges/needles on weak devices.

```tsx
import { useKumohaSubscription } from '@tanuden/kumoha-react';

useKumohaSubscription(
  (f) => f?.physics.speed ?? 0,
  (speed) => needleRef.current?.setSpeed(speed)
);
```

## Connection, state &amp; input

```tsx
import {
  useKumohaConnection,
  useKumohaProfile,
  useKumohaUserPrefs,
  useKumohaLogin,
  useKumohaInput,
  InputAction
} from '@tanuden/kumoha-react';

const { state, connected } = useKumohaConnection();
const profile = useKumohaProfile();
const login = useKumohaLogin();       // stable: login('ABC123')
const input = useKumohaInput();       // stable callbacks

await input.sendButton(InputAction.DoorOpen, 'pulse');
await input.sendNotch(0, 8);
```

Every hook is selector-scoped and every input callback is referentially stable, safe as effect/memo dependencies.

## Mock data from a JSON file

Develop a theme with no console running: pass a JSON fixture as `mock`. The provider connects, logs in, and loads the profile against an in-memory transport, so every hook behaves as if a console were streaming.

```tsx
import mock from './mock.json';

<KumohaProvider mock={mock} options={{ themeName: '@you/theme-name' }}>
  <App />
</KumohaProvider>;
```

The fixture (`KumohaMockData`) holds a profile and either one held frame or a sequence played on a loop (provide `outputDataFrame` or `outputDataFrames`). Tune playback with `mockOptions` (`KumohaMockOptions`): `frameIntervalMs` (default `100`), `loop` (default `true`), `humanReadableRoomId`. See [`@tanuden/kumoha`](https://www.npmjs.com/package/@tanuden/kumoha) for the full fixture shape.

### Example `mock.json`
```jsonc
{
  "simProfile": { "...": "SimulatorProfile" },
  "outputDataFrame": { "...": "one OutputDataFrame, held static" },
  "outputDataFrames": ["...OutputDataFrame[], advanced every frameIntervalMs"],
  "userPrefs": {}
}
```

## API reference

Every value exported from `@tanuden/kumoha-react`.

### KumohaProvider

Wraps the app, owns one client and one snapshot store, and disposes on unmount. Props (`KumohaProviderProps`):

| Prop | Type | Purpose |
|---|---|---|
| `options` | `KumohaClientOptions` | Client options; `themeName` is required. |
| `uri` | `string` | Console origin. Omit in mock mode. |
| `mock` | `KumohaMockData` | Drive the app from a JSON fixture instead of a console. |
| `mockOptions` | `KumohaMockOptions` | Playback tuning for `mock`. |
| `children` | `ReactNode` | Your app. |

### Telemetry hooks

- `useKumohaFrame(selector, equalityFn?)` re-renders only when the selected value changes. `Object.is` by default; pass `shallow` for object or tuple selections. The selector receives the frame (`OutputDataFrame | null`).
- `useKumohaFrameThrottled(selector, options)` the same, but re-renders at most once per `options.throttleMs` (`ThrottledFrameOptions`: `throttleMs`, optional `equalityFn`). For heavy or low-priority views.
- `useKumohaSubscription(selector, onChange, equalityFn?)` calls `onChange` on change with no React render, for canvas gauges. Write to a ref inside `onChange`.

### State hooks

- `useKumohaConnection(): KumohaConnectionMeta` the connection block (`connected`, `state`, `connection`). Re-renders on connection changes only.
- `useKumohaProfile(): SimulatorProfile | null` the current profile.
- `useKumohaUserPrefs(): Partial<KumohaUserPrefs>` this theme's saved settings.
- `useKumohaClient(): KumohaClient | null` the raw client, an escape hatch for imperative calls (null until the provider mounts it).

### Action hooks

- `useKumohaLogin(): (connectionCode?) => Promise<KumohaConnection>` a referentially stable login callback.
- `useKumohaInput(): KumohaInputApi` referentially stable cab-input callbacks: `sendButton(action, active)`, `sendNotch(power, brake)`, `sendBrakeSap(kPa)`, `sendReverser(reverser)`. Safe as effect or memo dependencies.

### Re-exports

- `shallow` zustand's shallow-equality function, for object or tuple selectors.
- `InputAction`, `Reverser` the Rudolf input vocabulary.
- `createMockTransport`, `MockTransport` build a mock transport by hand when you need finer control than the `mock` prop; see [`@tanuden/kumoha`](https://www.npmjs.com/package/@tanuden/kumoha).

## Open Source @ Tanuden

Kumoha is Open Source Software (OSS), licensed under LGPL-3.0. You may freely distribute, use and modify code provided in accordance with it.

A copy of the license can be found at the root of the repository [here](https://github.com/haruyukitanuki/kumoha/blob/main/LICENSE).

> [!IMPORTANT]
> This repository contains trademarks or logos owned by Tanukigawa Railway. Unauthorized use is prohibited.

**Tanukigawa Railway | Copyright (c) 2026 Haruyuki Tanukiji.**
