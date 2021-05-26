<div align="center">
<h1>Soxsot</h1>
</div>

![](https://img.shields.io/github/package-json/v/Ziphil/Soxsot)
![](https://img.shields.io/github/commit-activity/y/Ziphil/Soxsot?label=commits)
![](https://img.shields.io/github/workflow/status/Ziphil/Soxsot/test?label=test)
![](https://img.shields.io/codecov/c/github/Ziphil/Soxsot)


## Overview
An official library for manipulating dictionaries written in the new Shaleian dictionary format (.xdn/.xdnw/.xdns).
It enables you to perform various operations on Shaleian dictionaries, including parsing, searching and editing.

Classes and functions for manipulating dictionary data are exported from the main entrypoint, and run on both Node.js and browsers.
Those concerning file I/O are exported separately from `dist/io`, which require Node.js modules and run only on Node.js.

This package is currently under development and its API may be significantly changed in the future.

新シャレイア語辞典形式 (.xdn/.xdnw/.xdns) で記述された辞書を操作するための公式ライブラリです。
パース, 検索, 編集などといったシャレイア語辞典に対する様々な操作を行うことができます。

辞書データの操作を行うクラスや関数はメインエントリーポイントからエクスポートされていて、Node.js とブラウザの両方で動きます。
ファイル入出力に関する部分は `dist/io` からエクスポートされていて、これは Node.js のモジュールを必要とするため Node.js でしか動きません。

このパッケージは現在開発中のため、API は今後大幅に変更される可能性があります。

## Installation
Install via [npm](https://www.npmjs.com/package/soxsot).
```
npm i soxsot
```

## Basic usage
### Loading
```typescript
// create a loader
let loader = new DirectoryLoader("directory-path");
// load a dictionary from the specified direcotry
let dictionary = await loader.asPromise();
```

### Saving
```typescript
// create a saver
let saver = new DirectorySaver(dictionary, "directory-path");
// save a dictionary to the specified directory
await saver.asPromise();
```

### Searching
```typescript
// create a parameter object for searching
// here we will perform a prefix search of “savac”
// from the word names of the Japanese entries ignoring diacritics and cases
let parameter = new NormalParameter(
  "savac",   // what to search
  "name",    // where to search from
  "prefix",  // how to match (exact, prefix, part or etc…)
  "ja",      // language
  {case: true, diacritic: true}  // what to ignore
);
// perform the search
let result = dictionary.search(parameter);
let words = result.words;
let suggestions = result.suggestions;
```

### Plain objects
Classes related to dictionary data itself, such as `Dictionary` and `Word`, have several properties for internal processing.
Therefore, when you send objects of these classes using IPC/HTTP communication, if you do not modify them and serialise them as-is, unnecessary data will be included.
To prevent this, each such class provides the `toPlain` method to create plain objects without internal data, and the `fromPlain` static method to reconvert them to the class objects.

`Dictionary` や `Word` などの辞書データ本体に関するクラスは、内部処理用のプロパティをいくつかもっています。
そのため、IPC/HTTP 通信を使ってこれらのクラスのオブジェクトを送信するときに、そのオブジェクトに手を加えずにそのままシリアライズすると、不必要なデータが含まれることになります。
これを防ぐため、そのようなクラスには、内部データを含まないプレーンオブジェクトを作る `toPlain` メソッドと、それらをクラスのオブジェクトに戻す `fromPlain` 静的メソッドが定義されています。

```typescript
// create a plain object
let plainDictionary = dictionary.toPlain();
// send a plain object using IPC/HTTP communication
ipcRenderer.send("foo", plainDicitonary);

// receive a plain object
ipcMain.on("foo", (event, plainDictionary) => {
  // convert the plain object to a class object
  let dictionary = Dictionary.fromPlain(plainDictionary);
});
```