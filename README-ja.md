
<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/TanudenKumoha-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/TanudenKumoha-LogoBlack.svg">
  <img src="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/TanudenKumoha-LogoBlack.svg" alt="Tanuden Kumoha Logo" width="40%">
</picture>
</p>
<br>
<p align="center">狸河電鉄コンソールのクモハテーマ・モッディングエンジンと連携するための公式ライブラリです。</p>

[![GitHub release](https://img.shields.io/github/release/haruyukitanuki/kumoha?include_prereleases=&sort=semver&color=388270)](https://github.com/haruyukitanuki/kumoha/releases/)
[![License](https://img.shields.io/badge/License-LGPL--2.1-388270)](#license)

> [!TIP]
> This documentation is available in English & Japanese<br>
> このドキュメントは英語版と日本語版があります。
> 
> [![docs - en](https://img.shields.io/static/v1?label=docs&message=en&color=397eed)](https://github.com/haruyukitanuki/kumoha/blob/main/README.md) 
> [![ドキュメント - ja](https://img.shields.io/static/v1?label=ドキュメント&message=ja&color=e32b47)](https://github.com/haruyukitanuki/kumoha/blob/main/README-ja.md)

#### 🚄 名前の由来

**クモハ** は、日本の鉄道における電車の形式記号で、運転台を備え、かつ動力を持つ車両を示します。この名称は以下の要素から構成されています：

- **ク（Ku）**：運転台を備えていることを示す  
- **モ（Mo）**：電動機（モーター）を搭載していることを示す  
- **ハ（Ha）**：旅客車両（普通車）を示す記号

## 📦 インストール

このパッケージは `@tanuden/kumoha` として公開されています。

```bash
npm install @tanuden/kumoha
```
* フロントエンド・バックエンド両対応
* React を利用している場合は、[`@tanuden/kumoha-react`](https://www.npmjs.com/package/@tanuden/kumoha-react)の使用を推奨します（便利な Hook が提供されています）

## 📚 基本的な使い方
```ts
import { Kumoha } from '@tanuden/kumoha';

const engine = Kumoha("ws://localhost:58680", {
  socketOptions: {
    // socket.io のオプション（特別な理由がない限り変更しないでください）
  }
});

// 例: ルームID「ABC123」でログイン -- タヌ電コンソールでルームIDを確認してください
await engine.login('ABC123');

// 例: ドア開操作 "DoorOpn" を送信
await engine.sendButtonAction('DoorOpn', true);
```
* URI 内のポート番号（58680）は タヌ電コンソールによって固定されており、変更しないでください
* socketOptions の変更も、特殊な目的がない限り非推奨です

## 🎛️ 対応ボタンアクション一覧
`sendButtonAction`メソッドには、Train Crew Controller API と同様のアクション文字列を指定します。以下は一般的なアクションの一覧です：

| アクション名 | 説明                       |
| ------------ | -------------------------- |
| NotchUp      | 力行ノッチを1段上げる      |
| NotchDw      | 制動ノッチを1段下げる      |
| NotchN       | ノッチをニュートラルにする |
| NotchEB      | 非常ブレーキノッチ（EB）   |
| Buzzer       | 連絡ブザー                 |
| HornAir      | 空笛                       |
| HornEle      | 電笛                       |
| ViewChange   | 視点の切り替え             |
| PauseMenu    | ポーズメニューを表示       |
| DoorOpn      | ドアを開く                 |
| DoorCls      | ドアを閉じる               |
| Housou       | 車内放送の再生             |

全アクションと詳細な仕様については、Train CrewのコントローラーAPIドキュメントをご参照ください。

## 💾 タヌ電OSS
このプロジェクトはGNU LGPL v2.1のもとでライセンスされています。
詳細についてはLICENSEファイルをご覧ください。

> [!IMPORTANT] 
> このリポジトリには、狸河電鉄が所有するプロジェクト、製品、またはサービスの商標やロゴが含まれている場合があります。無断使用は禁止されています。

## 💝 サポート
もし開発支援としてラーメン代を恵んでくださる方がいらっしゃれば、私の[FANBOX](https://haruyukitanuki.fanbox.cc)までぜひ！

[タヌ電 Discordサーバー](https://go.tanu.ch/tanuden-discord) | [Twitter](https://go.tanu.ch/twitter) | [YouTube](https://go.tanu.ch/tanutube)

**狸河電鉄作品｜Copyright &copy; 2025 Haruyuki Tanukiji.**
