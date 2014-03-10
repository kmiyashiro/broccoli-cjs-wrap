var assert = require('assert');
var Filter = require('../index');

describe('broccoli-cjs-wrap', function() {
  describe('options', function() {
    it('sets inputTree', function() {
      var filter = new Filter(['lib']);
      assert.equal(filter.inputTree[0], 'lib');
    });
  });

  describe('getName', function() {
    it('returns filename', function() {
      var filter = new Filter(null);
      assert.equal(filter.getName('foo/bar.js'), 'foo/bar');
    });

    describe('named package', function() {
      it('is packageName if the file matches the "main" option', function() {
        var filter = new Filter(null, {
          namespace: 'MyApp',
          packageName: 'package-name',
          main: 'main'
        });
        assert.equal(filter.getName('main.js'), 'MyApp/package-name');
      });
    });
  });

  describe('processString', function() {
    it('actually works', function() {
      var filter = new Filter();
      var out = filter.processString('module.exports = {};', 'bar.js');
      assert.equal(out,
        filter.require + '.define({"bar":' +
        'function(exports, require, module){' +
        'module.exports = {};' +
        ";}});\n");
    });
  });

  describe('getFullPackageName', function() {
    it('returns cached result', function() {
      var filter = new Filter(null, { packageName: 'foo' });
      assert.equal(filter.getFullPackageName(), 'foo');
      filter.packageName = 'bar';
      assert.equal(filter.getFullPackageName(), 'foo');
    });

    describe('no packageName or namespace', function() {
      it('returns blank string', function() {
        var filter = new Filter();
        assert.equal(filter.getFullPackageName(), '');
      });
    });

    describe('with packageName', function() {
      it('returns packageName', function() {
        var filter = new Filter(null, { packageName: 'foo' });
        assert.equal(filter.getFullPackageName(), 'foo');
      });
    });

    describe('with namespace', function() {
      it('returns namespace', function() {
        var filter = new Filter(null, { namespace: 'MyApp' });
        assert.equal(filter.getFullPackageName(), 'MyApp');
      });
    });

    describe('with packageName and namespace', function() {
      it('returns namespace/packageName', function() {
        var filter = new Filter(null, {
          namespace: 'MyApp',
          packageName: 'foo'
        });
        assert.equal(filter.getFullPackageName(), 'MyApp/foo');
      });
    });
  });
});
