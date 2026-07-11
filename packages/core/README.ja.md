<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="./TanudenKumoha-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="./TanudenKumoha-LogoBlack.svg">
  <img src="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/packages/core/TanudenKumoha-LogoBlack.svg" alt="Tanuden Kumoha Logo" width="40%">
</picture>
</p>
<br>
<p align="center">Tanuden ConsoleのKumohaテーマ/モッディングエンジン向けの公式クライアント。Rudolfネイティブ。</p>
<br>

[![License](https://img.shields.io/badge/License-LGPL--3.0-388270)](#license)

<p align="center"><a href="./README.md">English</a> | <b>日本語</b></p>

#### 名前について

**クモハ(Kumoha)**は、動力と運転台の両方を備えた電車(電動制御車)を表す日本の鉄道車両の記号です。**ク**=制御車(運転台)、**モ**=主電動機、**ハ**=普通車(客室)を意味します。

---

## インストール

```bash
npm install @tanuden/kumoha @tanuden/rudolf
```

`@tanuden/rudolf`はピア依存で、テレメトリのワイヤーフォーマットです。Reactアプリでは、このクライアントを直接使うのではなく、リアクティブでセレクターベースのフックを提供する[`@tanuden/kumoha-react`](https://www.npmjs.com/package/@tanuden/kumoha-react)を使ってください。

## 基本的な使い方

```ts
import { createKumohaClient, InputAction } from '@tanuden/kumoha';

const kumoha = createKumohaClient('http://localhost:58680', {
  themeName: '@author/theme-name'
});

kumoha.connect();
await kumoha.login('ABC123'); // Tanuden Consoleに表示される接続コード

// リアクティブスナップショット。1つのイミュータブルなオブジェクトがその場で更新される
const unsubscribe = kumoha.subscribe(() => {
  const { outputDataFrame, connection, simProfile, userPrefs } =
    kumoha.getSnapshot();
  // `outputDataFrame`はRudolfの`OutputDataFrame`(最初のフレームを受け取る前はnull)
});

// あとで:
kumoha.dispose(); // すべてのリスナーを解除しソケットを閉じる
```

- `58680`はTanuden Consoleのデフォルトポートです(使用中の場合は番号を上げて探索します)。
- テレメトリはRudolfの生の[`OutputDataFrame`](https://www.npmjs.com/package/@tanuden/rudolf)です。`simProfile`と`userPrefs`は自動的に更新されます(プロファイルはシナリオ変更時)。

## 運転台入力

入力はRudolfの`InputAction`に対して厳密に型付けされています。ローカルコンソールには単ハンドルのノッチ経路がないため、ノッチ入力は2ハンドル(力行+制動)、またはSAP(kPa指定)になります。ackは適用状態の確認ではなくエコーです。

```ts
await kumoha.sendButton(InputAction.DoorOpen, 'pulse'); // true | false | 'pulse'
await kumoha.sendNotch(0, 8);   // 力行ノッチ、制動ノッチ
await kumoha.sendBrakeSap(410); // 自弁ブレーキ、kPa
await kumoha.sendReverser(1);   // -1 | 0 | 1
```

## テーマ設定

`KumohaUserPrefs`を拡張して、テーマの設定キーに型を付けます。

```ts
declare module '@tanuden/kumoha' {
  interface KumohaUserPrefs {
    'tims.display.consistDisplay': boolean;
  }
}
```

## モックデータ

コンソールを起動せずに開発できます。JSONのフィクスチャを`createMockTransport`に渡し、その結果をクライアントの`transport`に指定します。ログイン、プロファイル、設定にackを返し、接続時にフレームを再生します。すべてメモリ上で完結します。

```ts
import { createKumohaClient, createMockTransport } from '@tanuden/kumoha';
import mock from './mock.json';

const transport = createMockTransport(mock, { frameIntervalMs: 100 });
const kumoha = createKumohaClient('mock', { themeName: '@author/theme-name', transport });

kumoha.connect();
await kumoha.login();        // 'authenticated'状態に到達し設定を読み込む
await kumoha.fetchProfile(); // フィクスチャのプロファイルを読み込む
```

フィクスチャ(`KumohaMockData`)はプロファイルと、固定表示する1フレーム、またはループ再生するフレーム列のいずれかを保持します。`outputDataFrame`か`outputDataFrames`を指定してください。

```jsonc
{
  "simProfile": { "...": "SimulatorProfile" },
  "outputDataFrame": { "...": "1つのOutputDataFrame。固定表示される" },
  "outputDataFrames": ["...OutputDataFrame[]。frameIntervalMsごとに進む"],
  "userPrefs": {}
}
```

`KumohaMockOptions`: `frameIntervalMs`(デフォルト`100`)、`loop`(デフォルト`true`)、`humanReadableRoomId`。クライアントはフレームの`scenarioId`が変わったときだけプロファイルを取得するので、フレームに`scenarioId`を持たせるか、上記のように自分で`fetchProfile()`を呼んでください。Reactアプリではプロバイダーの`mock`プロパティ経由で利用できます。[`@tanuden/kumoha-react`](https://www.npmjs.com/package/@tanuden/kumoha-react)を参照してください。

## APIリファレンス

`@tanuden/kumoha`がエクスポートするすべてです。型はどれもパッケージのルートからインポートできます。

### createKumohaClient(uri, options)

`KumohaClient`を作成します。`uri`はTanuden Consoleのオリジン(通常は`http://localhost:58680`)です。クライアントは即座に返り、ソケットは`connect()`で開きます。`autoConnect`が有効(デフォルト)ならすぐに開きます。

`options`(`KumohaClientOptions`):

| キー | 型 | デフォルト | 用途 |
|---|---|---|---|
| `themeName` | `string` | 必須 | テーマのパッケージ名。設定取得のスコープになる。 |
| `transport` | `KumohaTransport` | `SocketIOTransport` | ワイヤーを差し替える。例: `MockTransport`。 |
| `socketOptions` | `Partial<ManagerOptions & SocketOptions>` | `{}` | `socket.io-client`に渡される。 |
| `autoConnect` | `boolean` | `true` | 作成直後にソケットを開く。 |
| `structuralSharing` | `boolean` | `true` | 変化のないフレームの一部を再利用し、セレクターの再計算を抑える。有効のままにする。 |

### KumohaClient

ファクトリが返すステートフルなクライアントです。

- `getSnapshot(): KumohaSnapshot` 現在のイミュータブルなスナップショット(`{ connection, outputDataFrame, simProfile, userPrefs }`)。参照は変化がない限り安定しているので、`Object.is`で変化の有無を判定できます。
- `subscribe(listener): () => void` スナップショットが変わるたびに`listener`を実行します。解除用の関数を返します。
- `connect(): void` トランスポートを開きます。`autoConnect`が有効なら不要です。
- `login(connectionCode?): Promise<KumohaConnection>` コンソールが表示するコードで認証し、テレメトリのルームに参加して設定を読み込みます。失敗時は`KumohaError`でrejectします。再接続後は自動的に再実行されます。
- `fetchProfile(): Promise<SimulatorProfile | null>` 現在のプロファイルを取得します。フレームの`scenarioId`が変わると自動的に実行されます。
- `fetchUserPrefs<T>(): Promise<T>` このテーマの保存済み設定を取得します。型引数を渡して型を付けられます: `fetchUserPrefs<MyPrefs>()`。
- `sendButton(action, active)`、`sendNotch(power, brake)`、`sendBrakeSap(kPa)`、`sendReverser(reverser)` 運転台入力です。[運転台入力](#運転台入力)を参照してください。それぞれ`Promise<void>`を返します。
- `dispose(): void` すべてのリスナーを解除しトランスポートを閉じます。後片付けのときに呼んでください。

### emptySnapshot()

空の`KumohaSnapshot`(切断状態、データはnullまたは空)を新しく返します。初期値やリセットに便利です。

### KumohaError

コンソールがエラーackを返したときに、クライアントのメソッドがスローします。`.reason`(`KumohaErrorReason`、例: `'AUTHENTICATION_ERROR'`や`'THEME_NOT_FOUND'`)を持ちます。

```ts
try {
  await kumoha.login('WRONG');
} catch (error) {
  if (error instanceof KumohaError && error.reason === 'AUTHENTICATION_ERROR') {
    // わかりやすいメッセージを表示する
  }
}
```

### isAckError(value)

コンソールのエラーackの形(`{ _error: true, because, message? }`)に対する型ガードです。リクエスト処理の内部用ですが、カスタムトランスポートの作者向けに公開しています。

### SocketIOTransport

デフォルトのトランスポートで、`socket.io-client`の薄いラッパーです。`createKumohaClient`が自動で生成します。ソケットを事前に設定したい場合だけ、直接生成してください(`new SocketIOTransport(uri, options?)`、オプションは`SocketIOTransportOptions`)。

### MockTransport, createMockTransport

オフライン開発向けの、メモリ上のトランスポートとフィクスチャ駆動のファクトリです。`MockTransport`は、シナリオを手動で組むための`respond(event, responder)`、`emit(event, payload)`、`listenerCount(event)`も公開しています。

### InputAction, Reverser

`@tanuden/rudolf`から再エクスポートしており、入力の語彙を1つのインポートで使えます。`InputAction`はボタン、ドア、ノッチの操作セット、`Reverser`はレバーサーの位置の値です。

## Open Source @ Tanuden

KumohaはLGPL-3.0のもとで公開されているオープンソースソフトウェア(OSS)です。ライセンスに従う限り、提供されるコードを自由に配布、使用、改変できます。

ライセンスの全文はリポジトリのルートにある[こちら](https://github.com/haruyukitanuki/kumoha/blob/main/LICENSE)で確認できます。

> [!IMPORTANT]
> このリポジトリには狸河電鉄が所有する商標やロゴが含まれています。無断使用は禁止されています。

**Tanukigawa Railway | Copyright (c) 2026 Haruyuki Tanukiji.**
