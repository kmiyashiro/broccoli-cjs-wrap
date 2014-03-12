[![build status](https://secure.travis-ci.org/kmiyashiro/broccoli-cjs-wrap.png)](http://travis-ci.org/kmiyashiro/broccoli-cjs-wrap)

broccoli-cjs-wrap
==========================

Wrap naked CommonJS modules in a `define` wrapper for use in browser.

Installation
------------

```sh
npm install --save-dev broccoli-cjs-wrap
```

Usage (Sample Brocfile.js)
--------------------------

```js
var cjsWrap = require('broccoli-cjs-wrap');
var filterEs6Module = require('broccoli-es6-module-filter');
var pickFiles = require('broccoli-static-compiler');

module.exports = function (broccoli) {

  // in conjunction with es6 module filter
  var tree = broccoli.makeTree('lib');

  // create a CJS version
  var cjsTree = filterEs6Module(pickFiles(tree, {
    srcDir: '',
    destDir: 'cjs'
  }));

  var wrappedCjsTree = cjsWrap(pickFiles(cjsTree, {
    srcDir: 'cjs',
    destDir: 'cjs-wrapped'
  }));

  return [cjsTree, wrappedCjsTree];
};
```

To build:

```sh
$ broccoli build output
```

Options
-------

- `namespace` - Namespace all your modules. ex: 'MyApp', `MyApp/tracker`
- `packageName` - Name of your package, goes after the namespace.
- `main` - main entry point of the module. ex: 'index', `MyApp/tracker/index.js` -> `MyApp/tracker`. You must pass a `packageName` and/or `namespace` if you use `main`
- `require` - Require function that `define` is attached to. Defaults to `this.require`
