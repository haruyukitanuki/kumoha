<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark), (max-height: 50px)" srcset="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/TanudenKumoha-LogoWhite.svg">
  <source media="(prefers-color-scheme: light), (max-height: 50px)" srcset="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/TanudenKumoha-LogoBlack.svg">
  <img src="https://raw.githubusercontent.com/haruyukitanuki/kumoha/refs/heads/main/TanudenKumoha-LogoBlack.svg" alt="Tanuden Kumoha Logo" width="40%">
</picture>
</p>
<br>
<p align="center">The official library for interfacing with the Tanuden Console's Kumoha Theming and Modding Engine</p>
<br>

[![GitHub release](https://img.shields.io/github/release/haruyukitanuki/kumoha?include_prereleases=&sort=semver&color=388270)](https://github.com/haruyukitanuki/kumoha/releases/)
[![License](https://img.shields.io/badge/License-LGPL--2.1-388270)](#license)

> [!TIP]
> This documentation is available in English & Japanese<br>
> このドキュメントは英語版と日本語版があります。
> 
> [![docs - en](https://img.shields.io/static/v1?label=docs&message=en&color=397eed)](https://github.com/haruyukitanuki/kumoha/blob/main/README.md) 
> [![ドキュメント - ja](https://img.shields.io/static/v1?label=ドキュメント&message=ja&color=e32b47)](https://github.com/haruyukitanuki/kumoha/blob/main/README-ja.md)

#### 🚄 About the Name

**Kumoha** is a Japanese railway classification prefix used to designate an electric multiple unit (EMU) car that is both motorized and equipped with a driving cab. The name is composed of:

- **Ku (ク)**: indicating a control (driving) cab is present,  
- **Mo (モ)**: indicating that the car has traction motors,  
- **Ha (ハ)**: indicating a passenger car.

---

## 📦 Installation

This package is published as `@tanuden/kumoha`.

```bash
npm install @tanuden/kumoha
```
* Works on both frontend and backend environments
* For React users, it's recommended to use [`@tanuden/kumoha-react`](https://www.npmjs.com/package/@tanuden/kumoha-react) and consume the hooks it provides

## 📚 Basic Usage
```ts
import { Kumoha } from '@tanuden/kumoha';

const engine = Kumoha("ws://localhost:58680", {
  socketOptions: {
    // socket.io options (not recommended to modify unless necessary)
  }
});

// Example login with room ID "ABC123" -- Refer to the Tanuden Console for the room ID
await engine.login('ABC123');

// Example button action sending "DoorOpn" (door open)
await engine.sendButtonAction('DoorOpn', true);
```
* The port number in the URI (58680) is fixed by the Tanuden Console and should not be changed.
* Modifying socketOptions is generally not recommended unless you have specific advanced use cases.

## 🎛️ Supported Button Actions
The `sendButtonAction` method accepts action strings matching the Train Crew Controller API. Below is a list of common actions and their descriptions.

| Action     | Description                |
| ---------- | -------------------------- |
| NotchUp    | Increase throttle step     |
| NotchDw    | Decrease throttle step     |
| NotchN     | Set throttle to Neutral    |
| NotchEB    | EB notch (emergency brake) |
| Buzzer     | Buzzer                     |
| HornAir    | Air horn                   |
| HornEle    | Electric horn              |
| ViewChange | Change viewpoint           |
| PauseMenu  | Pause menu                 |
| DoorOpn    | Open door                  |
| DoorCls    | Close door                 |
| Housou     | Announce (PA system)       |

For the full list and detailed descriptions, please refer to Train Crew Controller API documentation.

## 💾 Tanuden OSS
This project is licensed under the GNU Lesser General Public License v2.1 (LGPL-2.1).
For more details, please see the LICENSE file.

> [!IMPORTANT] 
> This repository may contain trademarks or logos owned by Tanukigawa Railway. Unauthorized use is prohibited.

## 💝 Support
If you have some spare change you'll like to contribute to my ramen fund (helps keep me filled while working on projects), visit my [Fanbox](https://haruyukitanuki.fanbox.cc). 

[Tanuden Discord Server](https://go.tanu.ch/tanuden-discord) | [Twitter](https://go.tanu.ch/twitter) | [YouTube](https://go.tanu.ch/tanutube)

**Tanukigawa Electric Railway | Copyright &copy; 2025 Haruyuki Tanukiji.**

