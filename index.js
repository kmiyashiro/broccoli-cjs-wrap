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
  var name = filePath.replace(/\.js$/, '')
  var fullPackageName = this.getFullPackageName()
  return name === this.main
    ? fullPackageName
    : compact([fullPackageName, name]).join('/')
}

CjsWrapFilter.prototype.processString = function (fileContents, filePath) {
  var name = this.getName(filePath)
  var filteredFileContents = this.replaceRelativeRequires(fileContents, filePath)
  return this.wrap(this.require, name, filteredFileContents)
}

CjsWrapFilter.prototype.getFullPackageName = function () {
  if (this._cachedFullPackageName) return this._cachedFullPackageName
  var path = compact([ this.namespace, this.packageName ]).join('/')
  return this._cachedFullPackageName = path
}

// replace all instances of '../blah' in string with 'full/module/path/blah'.
// Same with './foo'.
CjsWrapFilter.prototype.replaceRelativeRequires = function (fileContents, filePath) {
  var currentPath = filePath.replace(/\/?\w+?\.js$/, '')
  var pathParts = currentPath.split('/')
  var fullPackageName = this.getFullPackageName()
  var prefix = fullPackageName ? fullPackageName + '/' : ''

  var currentDirMatches = fileContents.match(this._currentDirRegex('g')) || []
  var parentDirMatches = fileContents.match(this._parentDirRegex('g')) || []
  var relativeRequireCount = currentDirMatches.length + parentDirMatches.length
  for (var i = 0; i < relativeRequireCount; i++) {
    fileContents = this.replaceRelativeRequire(fileContents, pathParts, prefix)
  }
  return fileContents
}

// replace '../blah' to 'full/module/path/blah'. Same with './foo'.
CjsWrapFilter.prototype.replaceRelativeRequire = function (relativePath, filePathParts, prefix) {
  var currentDirMatches = relativePath.match(this._currentDirRegex('g'))
  var parentDirMatches = relativePath.match(this._parentDirRegex('g'))
  var levels = 0;
  prefix = prefix || ''

  if (currentDirMatches) {
    return relativePath.replace(this._currentDirRegex(), replacementString())
  }

  if (parentDirMatches) {
    levels = parentDirMatches[0].match(/\.\./g).length
    return relativePath.replace(this._parentDirRegex(), replacementString())
  }

  function replacementString() {
    var path = filePathParts.slice(0, filePathParts.length - levels).join('/')
    path = path
      ? path + '/'
      : ''
    return ["$1", prefix, path, "$3"].join('')
  }
}

CjsWrapFilter.prototype._currentDirRegex = function (flags) {
  return new RegExp(this._currentDirPattern, flags || '')
}

CjsWrapFilter.prototype._parentDirRegex = function (flags) {
  return new RegExp(this._parentDirPattern, flags || '')
}

// [require('][./][blah')]
CjsWrapFilter.prototype._currentDirPattern = '(require\\([\'\"])(\\.\\/)(.*?[\'\"]\\))'

CjsWrapFilter.prototype._parentDirPattern = '(require\\([\'\"])(\\.\\.\\/)+(.*?[\'\"]\\))'

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
