<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="./packages/core/TanudenKumoha-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="./packages/core/TanudenKumoha-LogoBlack.svg">
  <img src="./packages/core/TanudenKumoha-LogoBlack.svg" alt="Tanuden Kumoha Logo" width="40%">
</picture>
</p>
<br>
<p align="center">Monorepo for the Tanuden Kumoha theming engine. The client Kumoha Themes use to talk to the Tanuden Console's local server (`:58680`) over Socket.io.</p>
<br>

[![License](https://img.shields.io/badge/License-LGPL--3.0-388270)](#license)

<p align="center"><b>English</b> | <a href="./README.ja.md">日本語</a></p>

---

## Packages

| Package | Description |
|---|---|
| [`@tanuden/kumoha`](packages/core) | Framework-agnostic client engine: connection, cab input, and an immutable reactive snapshot. |
| [`@tanuden/kumoha-react`](packages/react) | React bindings: selector-based hooks built for high-frequency (~10 Hz) telemetry. |

## Development

npm workspaces. Build order is core then react.

```bash
npm install
npm run build          # builds core, then react
npm run typecheck
npm run lint:check
npm run format:check
```

## Open Source @ Tanuden

Kumoha is Open Source Software (OSS), licensed under LGPL-3.0. You may freely distribute, use and modify code provided in accordance with it.

A copy of the license can be found at the root of the repository [here](https://github.com/haruyukitanuki/kumoha/blob/main/LICENSE).

> [!IMPORTANT]
> This repository contains trademarks or logos owned by Tanukigawa Railway. Unauthorized use is prohibited.

**Tanukigawa Railway | Copyright (c) 2026 Haruyuki Tanukiji.**
