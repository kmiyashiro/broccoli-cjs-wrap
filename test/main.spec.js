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

    it('replaces relative requires', function() {
      var filter = new Filter();
      var out = filter.processString('require("./util"); module.exports = {};', 'bar.js');
      assert.equal(out,
        filter.require + '.define({"bar":' +
        'function(exports, require, module){' +
        'require("util"); ' +
        'module.exports = {};' +
        ";}});\n");
    })
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

  describe('replaceRelativeRequire', function() {
    beforeEach(function() {
      var filter = new Filter();
      this.replaceRelativeRequire = filter.replaceRelativeRequire.bind(filter);
    });

    afterEach(function() {
      delete this.replaceRelativeRequire;
    });

    it('prepends a prefix to relative requires', function() {
      var content = this.replaceRelativeRequire("require('./bar')", ['helpers'], 'foo/');
      assert.equal(content, "require('foo/helpers/bar')");
    });

    it('replaces "./" with the base filePath', function() {
      var content = this.replaceRelativeRequire("require('./bar')", ['helpers']);
      assert.equal(content, "require('helpers/bar')");
    });

    it('replaces "../" with one level up from filePath', function() {
      var content = this.replaceRelativeRequire("require('../bar')", ['helpers', 'tools']);
      assert.equal(content, "require('helpers/bar')");
    });

    it('replaces "../../../" with 3 levels up from filePath', function() {
      var content = this.replaceRelativeRequire("require('../../../bar')", ['helpers', 'tools', 'formatters', 'stuff']);
      assert.equal(content, "require('helpers/bar')");
    });

    it('works with a single file as filePath', function() {
      var content = this.replaceRelativeRequire("require('./bar')", ['']);
      assert.equal(content, "require('bar')");
    });

    it('works with double quotes', function() {
      var content = this.replaceRelativeRequire('require("../../../bar")', ['helpers', 'tools', 'formatters', 'stuff']);
      assert.equal(content, 'require("helpers/bar")');
    });
  });

  describe('replaceRelativeRequires', function() {
    beforeEach(function() {
      var filter = new Filter(null, {
        packageName: 'foo'
      });
      this.replaceRelativeRequires = filter.replaceRelativeRequires.bind(filter);
    });

    afterEach(function() {
      delete this.replaceRelativeRequires;
    });

    it('replaces all relative paths in a string', function() {
      var content = this.replaceRelativeRequires("require('./bar'); require('../../dog');", 'helpers/tools/formatters/baz.js');
      assert.equal(content, "require('foo/helpers/tools/formatters/bar'); require('foo/helpers/dog');");
    });

    it('works with a file as path', function() {
      var content = this.replaceRelativeRequires("require('./bar'); require('./dog');", 'baz.js');
      assert.equal(content, "require('foo/bar'); require('foo/dog');");
    });

    it('works with a filename with dashes', function() {
      var content = this.replaceRelativeRequires("require('./bar'); require('../dog');", 'bob/baz-foo.js');
      assert.equal(content, "require('foo/bob/bar'); require('foo/dog');");
    });
  });
});
