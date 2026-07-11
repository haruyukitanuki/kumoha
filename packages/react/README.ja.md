<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="./TanudenKumohaReact-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="./TanudenKumohaReact-LogoBlack.svg">
  <img src="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/packages/react/TanudenKumohaReact-LogoBlack.svg" alt="Tanuden Kumoha React Logo" width="40%">
</picture>
</p>
<br>
<p align="center">Tanuden Kumohaテーマエンジン用のReactバインディング。セレクターベースで、高頻度テレメトリ向けに設計されています。</p>
<br>

[![License](https://img.shields.io/badge/License-LGPL--3.0-388270)](#license)

<p align="center"><a href="./README.md">English</a> | <b>日本語</b></p>

---

## インストール

```bash
npm install @tanuden/kumoha-react @tanuden/kumoha @tanuden/rudolf react react-dom
```

## セットアップ

アプリを一度だけラップします。プロバイダーは1つのクライアントを保持し、アンマウント時に破棄します。イミュータブルなスナップショットストアをフックに公開します。

```tsx
import { KumohaProvider } from '@tanuden/kumoha-react';

<KumohaProvider uri="http://localhost:58680" options={{ themeName: '@you/theme-name' }}>
  <App />
</KumohaProvider>;
```

## テレメトリの読み取り

フレームは約10Hzで届きます。各コンシューマーは読み取った分だけコストを払います。

### リアクティブセレクター
選択した値が変わったときだけ再レンダリングします(デフォルトは`Object.is`。オブジェクトやタプルを選択する場合は`shallow`を渡します)。

```tsx
import { useKumohaFrame, shallow } from '@tanuden/kumoha-react';

const speed = useKumohaFrame((f) => f?.physics.speed ?? 0);          // プリミティブ、最も低コスト
const doors = useKumohaFrame((f) => f?.doors ?? null, shallow);      // オブジェクトの一部
```

### スロットル付きセレクター
最新の値を保持しつつ、再レンダリングは`throttleMs`ごとに最大1回です。重い、または優先度の低いビュー向けです。

```tsx
import { useKumohaFrameThrottled } from '@tanuden/kumoha-react';

const stations = useKumohaFrameThrottled((f) => f?.stations.list ?? [], {
  throttleMs: 250,
  equalityFn: shallow
});
```

### 命令的(レンダリングなし)
Reactの再レンダリングを起こさずに、変化時に発火します。非力なデバイスでのcanvasゲージや針の描画向けです。

```tsx
import { useKumohaSubscription } from '@tanuden/kumoha-react';

useKumohaSubscription(
  (f) => f?.physics.speed ?? 0,
  (speed) => needleRef.current?.setSpeed(speed)
);
```

## 接続、状態、入力

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
const login = useKumohaLogin();       // 安定した参照: login('ABC123')
const input = useKumohaInput();       // 安定したコールバック

await input.sendButton(InputAction.DoorOpen, 'pulse');
await input.sendNotch(0, 8);
```

すべてのフックはセレクターのスコープに限定され、すべての入力コールバックは参照的に安定しているため、effectやmemoの依存配列に安全に渡せます。

## JSONファイルからのモックデータ

コンソールを起動せずにテーマを開発できます。JSONのフィクスチャを`mock`として渡します。プロバイダーはメモリ上のトランスポートに対して接続、ログイン、プロファイル読み込みを行うので、すべてのフックはコンソールがストリーミングしているかのように動作します。

```tsx
import mock from './mock.json';

<KumohaProvider mock={mock} options={{ themeName: '@you/theme-name' }}>
  <App />
</KumohaProvider>;
```

フィクスチャ(`KumohaMockData`)はプロファイルと、固定表示する1フレーム、またはループ再生するフレーム列のいずれかを保持します(`outputDataFrame`か`outputDataFrames`を指定)。再生の挙動は`mockOptions`(`KumohaMockOptions`)で調整できます: `frameIntervalMs`(デフォルト`100`)、`loop`(デフォルト`true`)、`humanReadableRoomId`。フィクスチャの完全な形は[`@tanuden/kumoha`](https://www.npmjs.com/package/@tanuden/kumoha)を参照してください。

### `mock.json`の例
```jsonc
{
  "simProfile": { "...": "SimulatorProfile" },
  "outputDataFrame": { "...": "1つのOutputDataFrame。固定表示される" },
  "outputDataFrames": ["...OutputDataFrame[]。frameIntervalMsごとに進む"],
  "userPrefs": {}
}
```

## APIリファレンス

`@tanuden/kumoha-react`がエクスポートするすべての値です。

### KumohaProvider

アプリをラップし、1つのクライアントと1つのスナップショットストアを保持し、アンマウント時に破棄します。プロパティ(`KumohaProviderProps`):

| プロパティ | 型 | 用途 |
|---|---|---|
| `options` | `KumohaClientOptions` | クライアントのオプション。`themeName`は必須。 |
| `uri` | `string` | コンソールのオリジン。モックモードでは省略。 |
| `mock` | `KumohaMockData` | コンソールの代わりにJSONフィクスチャでアプリを駆動する。 |
| `mockOptions` | `KumohaMockOptions` | `mock`の再生調整。 |
| `children` | `ReactNode` | あなたのアプリ。 |

### テレメトリフック

- `useKumohaFrame(selector, equalityFn?)` 選択した値が変わったときだけ再レンダリングします。デフォルトは`Object.is`。オブジェクトやタプルを選択する場合は`shallow`を渡します。セレクターはフレーム(`OutputDataFrame | null`)を受け取ります。
- `useKumohaFrameThrottled(selector, options)` 上と同じですが、再レンダリングは`options.throttleMs`ごとに最大1回です(`ThrottledFrameOptions`: `throttleMs`と任意の`equalityFn`)。重い、または優先度の低いビュー向けです。
- `useKumohaSubscription(selector, onChange, equalityFn?)` Reactの再レンダリングなしで、変化時に`onChange`を呼びます。canvasゲージ向けです。`onChange`の中でrefに書き込んでください。

### 状態フック

- `useKumohaConnection(): KumohaConnectionMeta` 接続ブロック(`connected`、`state`、`connection`)。接続の変化時だけ再レンダリングします。
- `useKumohaProfile(): SimulatorProfile | null` 現在のプロファイル。
- `useKumohaUserPrefs(): Partial<KumohaUserPrefs>` このテーマの保存済み設定。
- `useKumohaClient(): KumohaClient | null` 生のクライアント。命令的な呼び出し向けの避難口です(プロバイダーがマウントするまではnull)。

### アクションフック

- `useKumohaLogin(): (connectionCode?) => Promise<KumohaConnection>` 参照的に安定したログイン用コールバック。
- `useKumohaInput(): KumohaInputApi` 参照的に安定した運転台入力のコールバック: `sendButton(action, active)`、`sendNotch(power, brake)`、`sendBrakeSap(kPa)`、`sendReverser(reverser)`。effectやmemoの依存配列に安全に渡せます。

### 再エクスポート

- `shallow` zustandの浅い等価比較関数。オブジェクトやタプルのセレクター向けです。
- `InputAction`、`Reverser` Rudolfの入力の語彙。
- `createMockTransport`、`MockTransport` `mock`プロパティより細かく制御したいときに、モックトランスポートを手動で組み立てます。[`@tanuden/kumoha`](https://www.npmjs.com/package/@tanuden/kumoha)を参照してください。

## Open Source @ Tanuden

KumohaはLGPL-3.0のもとで公開されているオープンソースソフトウェア(OSS)です。ライセンスに従う限り、提供されるコードを自由に配布、使用、改変できます。

ライセンスの全文はリポジトリのルートにある[こちら](https://github.com/haruyukitanuki/kumoha/blob/main/LICENSE)で確認できます。

> [!IMPORTANT]
> このリポジトリには狸河電鉄が所有する商標やロゴが含まれています。無断使用は禁止されています。

**Tanukigawa Railway | Copyright (c) 2026 Haruyuki Tanukiji.**
