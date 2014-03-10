var Filter = require('broccoli-filter')

module.exports = CjsWrapFilter
CjsWrapFilter.prototype = Object.create(Filter.prototype)
CjsWrapFilter.prototype.constructor = CjsWrapFilter

function CjsWrapFilter(inputTree, options) {
  options = options || {}
  if (!(this instanceof CjsWrapFilter)) {
    return new CjsWrapFilter(inputTree, options)
  }
  Filter.prototype.constructor.apply(this, arguments)
  this.setOptions(options)
}

CjsWrapFilter.prototype.setOptions = function (options) {
  this.require = options.require || this.require
  this.namespace = options.namespace || this.namespace
  this.main = options.main || this.main
  this.packageName = options.packageName || this.packageName
  this._validateOptions()
}

CjsWrapFilter.prototype._validateOptions = function () {
  if (this.main) {
    if (!this.packageName && !this.namespace) {
      throw new Error('Must have namespace or packageName if main is defined')
    }
  }
}

CjsWrapFilter.prototype.wrap = function (require, moduleName, data) {
  return require + '.define({"' + moduleName + '":' +
    'function(exports, require, module){' +
    data +
    ';}});\n'
}

// Returns name used for definition (define("Module/Name"))
// if name is the main file, return ns/packageName
// else return ns/name
CjsWrapFilter.prototype.getName = function (filePath) {
  var name = filePath.replace(/.js$/, '')
  var fullPackageName = this.getFullPackageName()
  return name === this.main
    ? fullPackageName
    : compact([fullPackageName, name]).join('/')
}

CjsWrapFilter.prototype.processString = function (fileContents, filePath) {
  var name = this.getName(filePath)
  return this.wrap(this.require, name, fileContents)
}

CjsWrapFilter.prototype.getFullPackageName = function () {
  if (this._cachedFullPackageName) return this._cachedFullPackageName
  var path = compact([ this.namespace, this.packageName ]).join('/')
  return this._cachedFullPackageName = path
}

CjsWrapFilter.prototype._prependNamespace = function (name) {
  var ns = this.namespace
  return ns ? ns + '/' + name : name
}

CjsWrapFilter.prototype.extensions = ['js']
CjsWrapFilter.prototype.targetExtension = 'js'

// Default is context.require
CjsWrapFilter.prototype.require = 'this.require'

// Used to namespace the module name
// ie. 'MyApp' => 'MyApp/tracker'
CjsWrapFilter.prototype.namespace = null

CjsWrapFilter.prototype.packageName = null

// Main file within the package
CjsWrapFilter.prototype.main = null

CjsWrapFilter.prototype._cachedFullPackageName = null

function compact(arr) {
  return arr.filter(function(item) {
    return !!item
  })
}
