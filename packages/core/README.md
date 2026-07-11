<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="./TanudenKumoha-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="./TanudenKumoha-LogoBlack.svg">
  <img src="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/packages/core/TanudenKumoha-LogoBlack.svg" alt="Tanuden Kumoha Logo" width="40%">
</picture>
</p>
<br>
<p align="center">The official client for the Tanuden Console's Kumoha theming &amp; modding engine. Rudolf-native.</p>
<br>

[![License](https://img.shields.io/badge/License-LGPL--3.0-388270)](#license)

<p align="center"><b>English</b> | <a href="./README.ja.md">日本語</a></p>

#### About the Name

**Kumoha** is a Japanese railway classification prefix for an electric multiple unit (EMU) car that is both motorized and has a driving cab: **Ku (ク)** = control cab, **Mo (モ)** = traction motors, **Ha (ハ)** = passenger car.

---

## Installation

```bash
npm install @tanuden/kumoha @tanuden/rudolf
```

`@tanuden/rudolf` is a peer dependency, the telemetry wire format. React apps should use [`@tanuden/kumoha-react`](https://www.npmjs.com/package/@tanuden/kumoha-react) for reactive, selector-based hooks instead of consuming this client directly.

## Basic usage

```ts
import { createKumohaClient, InputAction } from '@tanuden/kumoha';

const kumoha = createKumohaClient('http://localhost:58680', {
  themeName: '@author/theme-name'
});

kumoha.connect();
await kumoha.login('ABC123'); // connection code shown by the Tanuden Console

// Reactive snapshot: one immutable object, updated in place.
const unsubscribe = kumoha.subscribe(() => {
  const { outputDataFrame, connection, simProfile, userPrefs } =
    kumoha.getSnapshot();
  // `outputDataFrame` is a Rudolf `OutputDataFrame` (or null before the first frame).
});

// Later:
kumoha.dispose(); // removes every listener and closes the socket
```

- `58680` is the Tanuden Console's default port (it may probe upward if that port is taken).
- Telemetry is the raw Rudolf [`OutputDataFrame`](https://www.npmjs.com/package/@tanuden/rudolf); `simProfile` and `userPrefs` are refreshed automatically (profile on scenario change).

## Cab input

Input is typed strictly against Rudolf's `InputAction`. The local console has no single-handle notch path, so notch input is two-handle (power + brake) or SAP-as-kPa. Acks are echoes, not applied-state confirmations.

```ts
await kumoha.sendButton(InputAction.DoorOpen, 'pulse'); // true | false | 'pulse'
await kumoha.sendNotch(0, 8);   // power notch, brake notch
await kumoha.sendBrakeSap(410); // self-lapping brake, kPa
await kumoha.sendReverser(1);   // -1 | 0 | 1
```

## Theme settings

Augment `KumohaUserPrefs` to type your theme's setting keys:

```ts
declare module '@tanuden/kumoha' {
  interface KumohaUserPrefs {
    'tims.display.consistDisplay': boolean;
  }
}
```

## Mock data

Develop with no console running: hand a JSON fixture to `createMockTransport` and pass the result as the client's `transport`. It acks login, profile, and prefs, then plays the frame(s) on connect, all in memory.

```ts
import { createKumohaClient, createMockTransport } from '@tanuden/kumoha';
import mock from './mock.json';

const transport = createMockTransport(mock, { frameIntervalMs: 100 });
const kumoha = createKumohaClient('mock', { themeName: '@author/theme-name', transport });

kumoha.connect();
await kumoha.login();        // reach the 'authenticated' state and load prefs
await kumoha.fetchProfile(); // load the fixture profile
```

The fixture (`KumohaMockData`) carries a profile and either one held frame or a sequence played on a loop. Provide `outputDataFrame` or `outputDataFrames`:

```jsonc
{
  "simProfile": { "...": "SimulatorProfile" },
  "outputDataFrame": { "...": "one OutputDataFrame, held static" },
  "outputDataFrames": ["...OutputDataFrame[], advanced every frameIntervalMs"],
  "userPrefs": {}
}
```

`KumohaMockOptions`: `frameIntervalMs` (default `100`), `loop` (default `true`), `humanReadableRoomId`. The client fetches the profile only when a frame's `scenarioId` changes, so give the frame a `scenarioId` or call `fetchProfile()` yourself as shown. React apps get this through the provider's `mock` prop, see [`@tanuden/kumoha-react`](https://www.npmjs.com/package/@tanuden/kumoha-react).

## API reference

Everything `@tanuden/kumoha` exports. Import any type from the package root.

### createKumohaClient(uri, options)

Creates a `KumohaClient`. `uri` is the Tanuden Console origin (typically `http://localhost:58680`). Returns the client immediately; the socket opens on `connect()`, or right away when `autoConnect` is left on.

`options` (`KumohaClientOptions`):

| Key | Type | Default | Purpose |
|---|---|---|---|
| `themeName` | `string` | required | Your theme's package name; scopes the prefs fetch. |
| `transport` | `KumohaTransport` | `SocketIOTransport` | Override the wire, e.g. a `MockTransport`. |
| `socketOptions` | `Partial<ManagerOptions & SocketOptions>` | `{}` | Forwarded to `socket.io-client`. |
| `autoConnect` | `boolean` | `true` | Open the socket as soon as it is created. |
| `structuralSharing` | `boolean` | `true` | Reuse unchanged frame sections so selectors bail out. Leave on. |

### KumohaClient

The stateful client returned by the factory.

- `getSnapshot(): KumohaSnapshot` the current immutable snapshot (`{ connection, outputDataFrame, simProfile, userPrefs }`). The reference is stable between changes, so `Object.is` tells you whether anything moved.
- `subscribe(listener): () => void` runs `listener` after every snapshot change. Returns an unsubscribe.
- `connect(): void` opens the transport. Unnecessary when `autoConnect` is on.
- `login(connectionCode?): Promise<KumohaConnection>` authenticates with the code the console shows, joins the telemetry room, and loads prefs. Rejects with a `KumohaError` on failure. Re-runs automatically after a reconnect.
- `fetchProfile(): Promise<SimulatorProfile | null>` pulls the current profile. Runs automatically when a frame's `scenarioId` changes.
- `fetchUserPrefs<T>(): Promise<T>` pulls this theme's saved settings. Pass a type argument to type them: `fetchUserPrefs<MyPrefs>()`.
- `sendButton(action, active)`, `sendNotch(power, brake)`, `sendBrakeSap(kPa)`, `sendReverser(reverser)` cab input; see [Cab input](#cab-input). Each returns `Promise<void>`.
- `dispose(): void` removes every listener and closes the transport. Call it on teardown.

### emptySnapshot()

Returns a fresh empty `KumohaSnapshot` (disconnected, data null or empty). Handy as an initial value or a reset.

### KumohaError

Thrown by client methods when the console returns an error ack. Carries `.reason` (`KumohaErrorReason`, such as `'AUTHENTICATION_ERROR'` or `'THEME_NOT_FOUND'`).

```ts
try {
  await kumoha.login('WRONG');
} catch (error) {
  if (error instanceof KumohaError && error.reason === 'AUTHENTICATION_ERROR') {
    // show a friendly message
  }
}
```

### isAckError(value)

Type guard for the console's error-ack shape (`{ _error: true, because, message? }`). Internal to the request path; exposed for authors of custom transports.

### SocketIOTransport

The default transport, a thin wrapper over `socket.io-client`. `createKumohaClient` builds one for you; construct it directly (`new SocketIOTransport(uri, options?)`, options `SocketIOTransportOptions`) only to preconfigure the socket.

### MockTransport, createMockTransport

An in-memory transport and its fixture-driven factory, for offline development. `MockTransport` also exposes `respond(event, responder)`, `emit(event, payload)`, and `listenerCount(event)` for scripting a scenario by hand.

### InputAction, Reverser

Re-exported from `@tanuden/rudolf` so themes get the input vocabulary from one import. `InputAction` is the button, door, and notch action set; `Reverser` is the reverser position value.

## Open Source @ Tanuden

Kumoha is Open Source Software (OSS), licensed under LGPL-3.0. You may freely distribute, use and modify code provided in accordance with it.

A copy of the license can be found at the root of the repository [here](https://github.com/haruyukitanuki/kumoha/blob/main/LICENSE).

> [!IMPORTANT]
> This repository contains trademarks or logos owned by Tanukigawa Railway. Unauthorized use is prohibited.

**Tanukigawa Railway | Copyright (c) 2026 Haruyuki Tanukiji.**
