<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="./packages/core/TanudenKumoha-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="./packages/core/TanudenKumoha-LogoBlack.svg">
  <img src="./packages/core/TanudenKumoha-LogoBlack.svg" alt="Tanuden Kumoha Logo" width="40%">
</picture>
</p>
<br>
<p align="center">Tanuden Kumohaテーマエンジンのモノレポ。KumohaテーマがTanuden Consoleのローカルサーバー(`:58680`)とSocket.io経由で通信するためのクライアントです。</p>
<br>

[![License](https://img.shields.io/badge/License-LGPL--3.0-388270)](#license)

<p align="center"><a href="./README.md">English</a> | <b>日本語</b></p>

---

## パッケージ

| パッケージ | 説明 |
|---|---|
| [`@tanuden/kumoha`](packages/core) | フレームワーク非依存のクライアントエンジン。接続、運転台入力、イミュータブルなリアクティブスナップショットを提供します。 |
| [`@tanuden/kumoha-react`](packages/react) | Reactバインディング。高頻度(約10Hz)のテレメトリ向けに設計されたセレクターベースのフックです。 |

## 開発

npm workspacesを使っています。ビルド順序はcoreが先、そのあとreactです。

```bash
npm install
npm run build          # coreをビルドしてからreactをビルド
npm run typecheck
npm run lint:check
npm run format:check
```

## Open Source @ Tanuden

KumohaはLGPL-3.0のもとで公開されているオープンソースソフトウェア(OSS)です。ライセンスに従う限り、提供されるコードを自由に配布、使用、改変できます。

ライセンスの全文はリポジトリのルートにある[こちら](https://github.com/haruyukitanuki/kumoha/blob/main/LICENSE)で確認できます。

> [!IMPORTANT]
> このリポジトリには狸河電鉄が所有する商標やロゴが含まれています。無断使用は禁止されています。

**Tanukigawa Railway | Copyright (c) 2026 Haruyuki Tanukiji.**
