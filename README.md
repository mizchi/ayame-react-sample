# Ayame React サンプル

このサンプルは [WebRTC Signaling Server Ayame](https://github.com/shiguredo/ayame) で利用可能な React を利用したサンプルです。

## 目的

React と WebRTC API を組み合わせる時の一つの例として公開しています。

## 動かし方

[Ayame Server](https://github.com/shiguredo/ayame) をクローンし、USE.md を参考に起動しておきます。

このリポジトリをクローンし、

```
$ yarn install
```
を実行し、依存ライブラリをインストールしたら、

```
$ yarn  serve
```

を実行して、クライアントを serve します。

```
ℹ ｢hot｣: webpack: Compiling...
ℹ ｢serve｣: Serving Static Content from: /
ℹ ｢serve｣: Project is running at http://localhost:8080
ℹ ｢serve｣: Server URI copied to clipboard
ℹ ｢atl｣: Using typescript@3.3.3 from typescript
```
- http://localhost:8080/ にアクセスすると、起動しているアプリが表示されます。

- (オプション) input form にシグナリングサーバの向き先を指定します。デフォルトだと ws://localhost:3000/ws  になっています。

- 「接続」をクリックすると、P2P 接続が開始します。


## ライセンス

Apache License 2.0

```
Copyright 2019, Shiguredo Inc, kdxu

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
