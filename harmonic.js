//traceur runtime
"use strict";
(function(global) {
    'use strict';
    if (global.$traceurRuntime) {
        return;
    }
    var $Object = Object;
    var $TypeError = TypeError;
    var $create = $Object.create;
    var $defineProperties = $Object.defineProperties;
    var $defineProperty = $Object.defineProperty;
    var $freeze = $Object.freeze;
    var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
    var $getOwnPropertyNames = $Object.getOwnPropertyNames;
    var $getPrototypeOf = $Object.getPrototypeOf;
    var $hasOwnProperty = $Object.prototype.hasOwnProperty;
    var $toString = $Object.prototype.toString;
    function nonEnum(value) {
        return {
            configurable: true,
            enumerable: false,
            value: value,
            writable: true
        };
    }
    var types = {
        void: function voidType() {},
        any: function any() {},
        string: function string() {},
        number: function number() {},
        boolean: function boolean() {}
    };
    var method = nonEnum;
    var counter = 0;
    function newUniqueString() {
        return '__$' + Math.floor(Math.random() * 1000000000) + '$' + ++counter + '$__';
    }
    var symbolInternalProperty = newUniqueString();
    var symbolDescriptionProperty = newUniqueString();
    var symbolDataProperty = newUniqueString();
    var symbolValues = $create(null);
    function isSymbol(symbol) {
        return typeof symbol === 'object' && symbol instanceof SymbolValue;
    }
    function typeOf(v) {
        if (isSymbol(v))
            return 'symbol';
        return typeof v;
    }
    function Symbol(description) {
        var value = new SymbolValue(description);
        if (!(this instanceof Symbol))
            return value;
        throw new TypeError('Symbol cannot be new\'ed');
    }
    $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(Symbol.prototype, 'toString', method(function() {
        var symbolValue = this[symbolDataProperty];
        if (!getOption('symbols'))
            return symbolValue[symbolInternalProperty];
        if (!symbolValue)
            throw TypeError('Conversion from symbol to string');
        var desc = symbolValue[symbolDescriptionProperty];
        if (desc === undefined)
            desc = '';
        return 'Symbol(' + desc + ')';
    }));
    $defineProperty(Symbol.prototype, 'valueOf', method(function() {
        var symbolValue = this[symbolDataProperty];
        if (!symbolValue)
            throw TypeError('Conversion from symbol to string');
        if (!getOption('symbols'))
            return symbolValue[symbolInternalProperty];
        return symbolValue;
    }));
    function SymbolValue(description) {
        var key = newUniqueString();
        $defineProperty(this, symbolDataProperty, {
            value: this
        });
        $defineProperty(this, symbolInternalProperty, {
            value: key
        });
        $defineProperty(this, symbolDescriptionProperty, {
            value: description
        });
        $freeze(this);
        symbolValues[key] = this;
    }
    $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(SymbolValue.prototype, 'toString', {
        value: Symbol.prototype.toString,
        enumerable: false
    });
    $defineProperty(SymbolValue.prototype, 'valueOf', {
        value: Symbol.prototype.valueOf,
        enumerable: false
    });
    $freeze(SymbolValue.prototype);
    Symbol.iterator = Symbol();
    function toProperty(name) {
        if (isSymbol(name))
            return name[symbolInternalProperty];
        return name;
    }
    function getOwnPropertyNames(object) {
        var rv = [];
        var names = $getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (!symbolValues[name])
                rv.push(name);
        }
        return rv;
    }
    function getOwnPropertyDescriptor(object, name) {
        return $getOwnPropertyDescriptor(object, toProperty(name));
    }
    function getOwnPropertySymbols(object) {
        var rv = [];
        var names = $getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var symbol = symbolValues[names[i]];
            if (symbol)
                rv.push(symbol);
        }
        return rv;
    }
    function hasOwnProperty(name) {
        return $hasOwnProperty.call(this, toProperty(name));
    }
    function getOption(name) {
        return global.traceur && global.traceur.options[name];
    }
    function setProperty(object, name, value) {
        var sym,
            desc;
        if (isSymbol(name)) {
            sym = name;
            name = name[symbolInternalProperty];
        }
        object[name] = value;
        if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
            $defineProperty(object, name, {
                enumerable: false
            });
        return value;
    }
    function defineProperty(object, name, descriptor) {
        if (isSymbol(name)) {
            if (descriptor.enumerable) {
                descriptor = $create(descriptor, {
                    enumerable: {
                        value: false
                    }
                });
            }
            name = name[symbolInternalProperty];
        }
        $defineProperty(object, name, descriptor);
        return object;
    }
    function polyfillObject(Object) {
        $defineProperty(Object, 'defineProperty', {
            value: defineProperty
        });
        $defineProperty(Object, 'getOwnPropertyNames', {
            value: getOwnPropertyNames
        });
        $defineProperty(Object, 'getOwnPropertyDescriptor', {
            value: getOwnPropertyDescriptor
        });
        $defineProperty(Object.prototype, 'hasOwnProperty', {
            value: hasOwnProperty
        });
        Object.getOwnPropertySymbols = getOwnPropertySymbols;
        function is(left, right) {
            if (left === right)
                return left !== 0 || 1 / left === 1 / right;
            return left !== left && right !== right;
        }
        $defineProperty(Object, 'is', method(is));
        function assign(target, source) {
            var props = $getOwnPropertyNames(source);
            var p,
                length = props.length;
            for (p = 0; p < length; p++) {
                target[props[p]] = source[props[p]];
            }
            return target;
        }
        $defineProperty(Object, 'assign', method(assign));
        function mixin(target, source) {
            var props = $getOwnPropertyNames(source);
            var p,
                descriptor,
                length = props.length;
            for (p = 0; p < length; p++) {
                descriptor = $getOwnPropertyDescriptor(source, props[p]);
                $defineProperty(target, props[p], descriptor);
            }
            return target;
        }
        $defineProperty(Object, 'mixin', method(mixin));
    }
    function exportStar(object) {
        for (var i = 1; i < arguments.length; i++) {
            var names = $getOwnPropertyNames(arguments[i]);
            for (var j = 0; j < names.length; j++) {
                (function(mod, name) {
                    $defineProperty(object, name, {
                        get: function() {
                            return mod[name];
                        },
                        enumerable: true
                    });
                })(arguments[i], names[j]);
            }
        }
        return object;
    }
    function toObject(value) {
        if (value == null)
            throw $TypeError();
        return $Object(value);
    }
    function spread() {
        var rv = [],
            k = 0;
        for (var i = 0; i < arguments.length; i++) {
            var valueToSpread = toObject(arguments[i]);
            for (var j = 0; j < valueToSpread.length; j++) {
                rv[k++] = valueToSpread[j];
            }
        }
        return rv;
    }
    function getPropertyDescriptor(object, name) {
        while (object !== null) {
            var result = $getOwnPropertyDescriptor(object, name);
            if (result)
                return result;
            object = $getPrototypeOf(object);
        }
        return undefined;
    }
    function superDescriptor(homeObject, name) {
        var proto = $getPrototypeOf(homeObject);
        if (!proto)
            throw $TypeError('super is null');
        return getPropertyDescriptor(proto, name);
    }
    function superCall(self, homeObject, name, args) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor) {
            if ('value' in descriptor)
                return descriptor.value.apply(self, args);
            if (descriptor.get)
                return descriptor.get.call(self).apply(self, args);
        }
        throw $TypeError("super has no method '" + name + "'.");
    }
    function superGet(self, homeObject, name) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor) {
            if (descriptor.get)
                return descriptor.get.call(self);else if ('value' in descriptor)return descriptor.value
            ;
        }
        return undefined;
    }
    function superSet(self, homeObject, name, value) {
        var descriptor = superDescriptor(homeObject, name);
        if (descriptor && descriptor.set) {
            descriptor.set.call(self, value);
            return;
        }
        throw $TypeError("super has no setter '" + name + "'.");
    }
    function getDescriptors(object) {
        var descriptors = {},
            name,
            names = $getOwnPropertyNames(object);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            descriptors[name] = $getOwnPropertyDescriptor(object, name);
        }
        return descriptors;
    }
    function createClass(ctor, object, staticObject, superClass) {
        $defineProperty(object, 'constructor', {
            value: ctor,
            configurable: true,
            enumerable: false,
            writable: true
        });
        if (arguments.length > 3) {
            if (typeof superClass === 'function')
                ctor.__proto__ = superClass;
            ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
        } else {
            ctor.prototype = object;
        }
        $defineProperty(ctor, 'prototype', {
            configurable: false,
            writable: false
        });
        return $defineProperties(ctor, getDescriptors(staticObject));
    }
    function getProtoParent(superClass) {
        if (typeof superClass === 'function') {
            var prototype = superClass.prototype;
            if ($Object(prototype) === prototype || prototype === null)
                return superClass.prototype;
        }
        if (superClass === null)
            return null;
        throw new TypeError();
    }
    function defaultSuperCall(self, homeObject, args) {
        if ($getPrototypeOf(homeObject) !== null)
            superCall(self, homeObject, 'constructor', args);
    }
    var ST_NEWBORN = 0;
    var ST_EXECUTING = 1;
    var ST_SUSPENDED = 2;
    var ST_CLOSED = 3;
    var END_STATE = -3;
    function addIterator(object) {
        return defineProperty(object, Symbol.iterator, nonEnum(function() {
            return this;
        }));
    }
    function GeneratorContext() {
        this.state = 0;
        this.GState = ST_NEWBORN;
        this.storedException = undefined;
        this.finallyFallThrough = undefined;
        this.sent = undefined;
        this.returnValue = undefined;
        this.tryStack_ = [];
    }
    GeneratorContext.prototype = {
        pushTry: function(catchState, finallyState) {
            if (finallyState !== null) {
                var finallyFallThrough = null;
                for (var i = this.tryStack_.length - 1; i >= 0; i--) {
                    if (this.tryStack_[i].catch !== undefined) {
                        finallyFallThrough = this.tryStack_[i].catch;
                        break;
                    }
                }
                if (finallyFallThrough === null)
                    finallyFallThrough = -3;
                this.tryStack_.push({
                    finally: finallyState,
                    finallyFallThrough: finallyFallThrough
                });
            }
            if (catchState !== null) {
                this.tryStack_.push({
                    catch: catchState
                });
            }
        },
        popTry: function() {
            this.tryStack_.pop();
        }
    };
    function getNextOrThrow(ctx, moveNext, action) {
        return function(x) {
            switch (ctx.GState) {
                case ST_EXECUTING:
                    throw new Error(("\"" + action + "\" on executing generator"));
                case ST_CLOSED:
                    throw new Error(("\"" + action + "\" on closed generator"));
                case ST_NEWBORN:
                    if (action === 'throw') {
                        ctx.GState = ST_CLOSED;
                        throw x;
                    }
                    if (x !== undefined)
                        throw $TypeError('Sent value to newborn generator');
                case ST_SUSPENDED:
                    ctx.GState = ST_EXECUTING;
                    ctx.action = action;
                    ctx.sent = x;
                    var value = moveNext(ctx);
                    var done = value === ctx;
                    if (done)
                        value = ctx.returnValue;
                    ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
                    return {
                        value: value,
                        done: done
                    };
            }
        };
    }
    function generatorWrap(innerFunction, self) {
        var moveNext = getMoveNext(innerFunction, self);
        var ctx = new GeneratorContext();
        return addIterator({
            next: getNextOrThrow(ctx, moveNext, 'next'),
            throw: getNextOrThrow(ctx, moveNext, 'throw')
        });
    }
    function AsyncFunctionContext() {
        GeneratorContext.call(this);
        this.err = undefined;
        var ctx = this;
        ctx.result = new Promise(function(resolve, reject) {
            ctx.resolve = resolve;
            ctx.reject = reject;
        });
    }
    AsyncFunctionContext.prototype = Object.create(GeneratorContext.prototype);
    function asyncWrap(innerFunction, self) {
        var moveNext = getMoveNext(innerFunction, self);
        var ctx = new AsyncFunctionContext();
        ctx.createCallback = function(newState) {
            return function(value) {
                ctx.state = newState;
                ctx.value = value;
                moveNext(ctx);
            };
        };
        ctx.createErrback = function(newState) {
            return function(err) {
                ctx.state = newState;
                ctx.err = err;
                moveNext(ctx);
            };
        };
        moveNext(ctx);
        return ctx.result;
    }
    function getMoveNext(innerFunction, self) {
        return function(ctx) {
            while (true) {
                try {
                    return innerFunction.call(self, ctx);
                } catch (ex) {
                    ctx.storedException = ex;
                    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
                    if (!last) {
                        ctx.GState = ST_CLOSED;
                        ctx.state = END_STATE;
                        throw ex;
                    }
                    ctx.state = last.catch !== undefined ? last.catch : last.finally;
                    if (last.finallyFallThrough !== undefined)
                        ctx.finallyFallThrough = last.finallyFallThrough;
                }
            }
        };
    }
    function setupGlobals(global) {
        global.Symbol = Symbol;
        polyfillObject(global.Object);
    }
    setupGlobals(global);
    global.$traceurRuntime = {
        asyncWrap: asyncWrap,
        createClass: createClass,
        defaultSuperCall: defaultSuperCall,
        exportStar: exportStar,
        generatorWrap: generatorWrap,
        setProperty: setProperty,
        setupGlobals: setupGlobals,
        spread: spread,
        superCall: superCall,
        superGet: superGet,
        superSet: superSet,
        toObject: toObject,
        toProperty: toProperty,
        type: types,
        typeof: typeOf
    };
})(typeof global !== 'undefined' ? global : this);
(function() {
    function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
        var out = [];
        if (opt_scheme) {
            out.push(opt_scheme, ':');
        }
        if (opt_domain) {
            out.push('//');
            if (opt_userInfo) {
                out.push(opt_userInfo, '@');
            }
            out.push(opt_domain);
            if (opt_port) {
                out.push(':', opt_port);
            }
        }
        if (opt_path) {
            out.push(opt_path);
        }
        if (opt_queryData) {
            out.push('?', opt_queryData);
        }
        if (opt_fragment) {
            out.push('#', opt_fragment);
        }
        return out.join('');
    }
    ;
    var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
    var ComponentIndex = {
        SCHEME: 1,
        USER_INFO: 2,
        DOMAIN: 3,
        PORT: 4,
        PATH: 5,
        QUERY_DATA: 6,
        FRAGMENT: 7
    };
    function split(uri) {
        return (uri.match(splitRe));
    }
    function removeDotSegments(path) {
        if (path === '/')
            return '/';
        var leadingSlash = path[0] === '/' ? '/' : '';
        var trailingSlash = path.slice(-1) === '/' ? '/' : '';
        var segments = path.split('/');
        var out = [];
        var up = 0;
        for (var pos = 0; pos < segments.length; pos++) {
            var segment = segments[pos];
            switch (segment) {
                case '':
                case '.':
                    break;
                case '..':
                    if (out.length)
                        out.pop();
                    else
                        up++;
                    break;
                default:
                    out.push(segment);
            }
        }
        if (!leadingSlash) {
            while (up-- > 0) {
                out.unshift('..');
            }
            if (out.length === 0)
                out.push('.');
        }
        return leadingSlash + out.join('/') + trailingSlash;
    }
    function joinAndCanonicalizePath(parts) {
        var path = parts[ComponentIndex.PATH] || '';
        path = removeDotSegments(path.replace(/\/\//.g, '/'));
        parts[ComponentIndex.PATH] = path;
        return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
    }
    function canonicalizeUrl(url) {
        var parts = split(url);
        return joinAndCanonicalizePath(parts);
    }
    function resolveUrl(base, url) {
        var parts = split(url);
        var baseParts = split(base);
        if (parts[ComponentIndex.SCHEME]) {
            return joinAndCanonicalizePath(parts);
        } else {
            parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
        }
        for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
            if (!parts[i]) {
                parts[i] = baseParts[i];
            }
        }
        if (parts[ComponentIndex.PATH][0] == '/') {
            return joinAndCanonicalizePath(parts);
        }
        var path = baseParts[ComponentIndex.PATH];
        var index = path.lastIndexOf('/');
        path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
        parts[ComponentIndex.PATH] = path;
        return joinAndCanonicalizePath(parts);
    }
    function isAbsolute(name) {
        if (!name)
            return false;
        if (name[0] === '/')
            return true;
        var parts = split(name);
        if (parts[ComponentIndex.SCHEME])
            return true;
        return false;
    }
    $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
    $traceurRuntime.isAbsolute = isAbsolute;
    $traceurRuntime.removeDotSegments = removeDotSegments;
    $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
    'use strict';
    var $__2 = $traceurRuntime,
        canonicalizeUrl = $__2.canonicalizeUrl,
        resolveUrl = $__2.resolveUrl,
        isAbsolute = $__2.isAbsolute;
    var moduleInstantiators = Object.create(null);
    var baseURL;
    if (global.location && global.location.href)
        baseURL = resolveUrl(global.location.href, './');
    else
        baseURL = '';
    var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
        this.url = url;
        this.value_ = uncoatedModule;
    };
    ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
    var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
        $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
        this.func = func;
    };
    var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
    ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {
        getUncoatedModule: function() {
            if (this.value_)
                return this.value_;
            return this.value_ = this.func.call(global);
        }
    }, {}, UncoatedModuleEntry);
    function getUncoatedModuleInstantiator(name) {
        if (!name)
            return;
        var url = ModuleStore.normalize(name);
        return moduleInstantiators[url];
    }
    ;
    var moduleInstances = Object.create(null);
    var liveModuleSentinel = {};
    function Module(uncoatedModule) {
        var isLive = arguments[1];
        var coatedModule = Object.create(null);
        Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
            var getter,
                value;
            if (isLive === liveModuleSentinel) {
                var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
                if (descr.get)
                    getter = descr.get;
            }
            if (!getter) {
                value = uncoatedModule[name];
                getter = function() {
                    return value;
                };
            }
            Object.defineProperty(coatedModule, name, {
                get: getter,
                enumerable: true
            });
        }));
        Object.preventExtensions(coatedModule);
        return coatedModule;
    }
    var ModuleStore = function(_ModuleStore) {
      Object.defineProperties(_ModuleStore, {
        baseURL: {
          get: function() {
              return baseURL;
          },

          set: function(v) {
              baseURL = String(v);
          }
        }
      });

      return _ModuleStore;
    }({
      normalize: function(name, refererName, refererAddress) {
          if (typeof name !== "string")
              throw new TypeError("module name must be a string, not " + typeof name);
          if (isAbsolute(name))
              return canonicalizeUrl(name);
          if (/[^\.]\/\.\.\//.test(name)) {
              throw new Error('module name embeds /../: ' + name);
          }
          if (name[0] === '.' && refererName)
              return resolveUrl(refererName, name);
          return canonicalizeUrl(name);
      },

      get: function(normalizedName) {
          var m = getUncoatedModuleInstantiator(normalizedName);
          if (!m)
              return undefined;
          var moduleInstance = moduleInstances[m.url];
          if (moduleInstance)
              return moduleInstance;
          moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
          return moduleInstances[m.url] = moduleInstance;
      },

      set: function(normalizedName, module) {
          normalizedName = String(normalizedName);
          moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
              return module;
          }));
          moduleInstances[normalizedName] = module;
      },

      registerModule: function(name, func) {
          var normalizedName = ModuleStore.normalize(name);
          if (moduleInstantiators[normalizedName])
              throw new Error('duplicate module named ' + normalizedName);
          moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
      },

      bundleStore: Object.create(null),

      register: function(name, deps, func) {
          if (!deps || !deps.length) {
              this.registerModule(name, func);
          } else {
              this.bundleStore[name] = {
                  deps: deps,
                  execute: func
              };
          }
      },

      getAnonymousModule: function(func) {
          return new Module(func.call(global), liveModuleSentinel);
      },

      getForTesting: function(name) {
          var $__0 = this;
          if (!this.testingPrefix_) {
              Object.keys(moduleInstances).some((function(key) {
                  var m = /(traceur@[^\/]*\/)/.exec(key);
                  if (m) {
                      $__0.testingPrefix_ = m[1];
                      return true;
                  }
              }));
          }
          return this.get(this.testingPrefix_ + name);
      }
    });
    ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({
        ModuleStore: ModuleStore
    }));
    var setupGlobals = $traceurRuntime.setupGlobals;
    $traceurRuntime.setupGlobals = function(global) {
        setupGlobals(global);
    };
    $traceurRuntime.ModuleStore = ModuleStore;
    global.System = {
        register: ModuleStore.register.bind(ModuleStore),
        get: ModuleStore.get,
        set: ModuleStore.set,
        normalize: ModuleStore.normalize
    };
    $traceurRuntime.getModuleImpl = function(name) {
        var instantiator = getUncoatedModuleInstantiator(name);
        return instantiator && instantiator.getUncoatedModule();
    };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/utils", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/utils";
    var toObject = $traceurRuntime.toObject;
    function toUint32(x) {
        return x | 0;
    }
    return function(_ref) {
      Object.defineProperties(_ref, {
        toObject: {
          get: function() {
              return toObject;
          }
        },

        toUint32: {
          get: function() {
              return toUint32;
          }
        }
      });

      return _ref;
    }({});
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/ArrayIterator", [], function() {
    "use strict";
    var $__4;
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/ArrayIterator";
    var $__5 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/utils"),
        toObject = $__5.toObject,
        toUint32 = $__5.toUint32;
    var ARRAY_ITERATOR_KIND_KEYS = 1;
    var ARRAY_ITERATOR_KIND_VALUES = 2;
    var ARRAY_ITERATOR_KIND_ENTRIES = 3;
    var ArrayIterator = function ArrayIterator() {};
    ($traceurRuntime.createClass)(ArrayIterator, ($__4 = {}, Object.defineProperty($__4, "next", {
        value: function() {
            var iterator = toObject(this);
            var array = iterator.iteratorObject_;
            if (!array) {
                throw new TypeError('Object is not an ArrayIterator');
            }
            var index = iterator.arrayIteratorNextIndex_;
            var itemKind = iterator.arrayIterationKind_;
            var length = toUint32(array.length);
            if (index >= length) {
                iterator.arrayIteratorNextIndex_ = Infinity;
                return createIteratorResultObject(undefined, true);
            }
            iterator.arrayIteratorNextIndex_ = index + 1;
            if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
                return createIteratorResultObject(array[index], false);
            if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
                return createIteratorResultObject([index, array[index]], false);
            return createIteratorResultObject(index, false);
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), Object.defineProperty($__4, Symbol.iterator, {
        value: function() {
            return this;
        },
        configurable: true,
        enumerable: true,
        writable: true
    }), $__4), {});
    function createArrayIterator(array, kind) {
        var object = toObject(array);
        var iterator = new ArrayIterator;
        iterator.iteratorObject_ = object;
        iterator.arrayIteratorNextIndex_ = 0;
        iterator.arrayIterationKind_ = kind;
        return iterator;
    }
    function createIteratorResultObject(value, done) {
        return {
            value: value,
            done: done
        };
    }
    function entries() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
    }
    function keys() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
    }
    function values() {
        return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
    }
    return function(_ref2) {
      Object.defineProperties(_ref2, {
        entries: {
          get: function() {
              return entries;
          }
        },

        keys: {
          get: function() {
              return keys;
          }
        },

        values: {
          get: function() {
              return values;
          }
        }
      });

      return _ref2;
    }({});
});
System.register("traceur-runtime@0.0.25/node_modules/rsvp/lib/rsvp/asap", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/node_modules/rsvp/lib/rsvp/asap";
    var $__default = function asap(callback, arg) {
        var length = queue.push([callback, arg]);
        if (length === 1) {
            scheduleFlush();
        }
    };
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    function useNextTick() {
        return function() {
            process.nextTick(flush);
        };
    }
    function useMutationObserver() {
        var iterations = 0;
        var observer = new BrowserMutationObserver(flush);
        var node = document.createTextNode('');
        observer.observe(node, {
            characterData: true
        });
        return function() {
            node.data = (iterations = ++iterations % 2);
        };
    }
    function useSetTimeout() {
        return function() {
            setTimeout(flush, 1);
        };
    }
    var queue = [];
    function flush() {
        for (var i = 0; i < queue.length; i++) {
            var tuple = queue[i];
            var callback = tuple[0],
                arg = tuple[1];
            callback(arg);
        }
        queue = [];
    }
    var scheduleFlush;
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
        scheduleFlush = useMutationObserver();
    } else {
        scheduleFlush = useSetTimeout();
    }
    return function(_ref3) {
      Object.defineProperties(_ref3, {
        default: {
          get: function() {
              return $__default;
          }
        }
      });

      return _ref3;
    }({});
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/Promise", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/Promise";
    var async = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/node_modules/rsvp/lib/rsvp/asap").default;
    function isPromise(x) {
        return x && typeof x === 'object' && x.status_ !== undefined;
    }
    function chain(promise) {
        var onResolve = arguments[1] !== (void0) ? arguments[1] : (function(x) {
                return x;
            });
        var onReject = arguments[2] !== (void0) ? arguments[2] : (function(e) {
                throw e;
            });
        var deferred = getDeferred(promise.constructor);
        switch (promise.status_) {
            case undefined:
                throw TypeError;
            case 'pending':
                promise.onResolve_.push([deferred, onResolve]);
                promise.onReject_.push([deferred, onReject]);
                break;
            case 'resolved':
                promiseReact(deferred, onResolve, promise.value_);
                break;
            case 'rejected':
                promiseReact(deferred, onReject, promise.value_);
                break;
        }
        return deferred.promise;
    }
    function getDeferred(C) {
        var result = {};
        result.promise = new C((function(resolve, reject) {
            result.resolve = resolve;
            result.reject = reject;
        }));
        return result;
    }
    var Promise = function Promise(resolver) {
        var $__6 = this;
        this.status_ = 'pending';
        this.onResolve_ = [];
        this.onReject_ = [];
        resolver((function(x) {
            promiseResolve($__6, x);
        }), (function(r) {
            promiseReject($__6, r);
        }));
    };
    ($traceurRuntime.createClass)(Promise, {
        catch: function(onReject) {
            return this.then(undefined, onReject);
        },
        then: function() {
            var onResolve = arguments[0] !== (void0) ? arguments[0] : (function(x) {
                    return x;
                });
            var onReject = arguments[1];
            var $__6 = this;
            var constructor = this.constructor;
            return chain(this, (function(x) {
                x = promiseCoerce(constructor, x);
                return x === $__6 ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
            }), onReject);
        }
    }, {
        resolve: function(x) {
            return new this((function(resolve, reject) {
                resolve(x);
            }));
        },
        reject: function(r) {
            return new this((function(resolve, reject) {
                reject(r);
            }));
        },
        cast: function(x) {
            if (x instanceof this)
                return x;
            if (isPromise(x)) {
                var result = getDeferred(this);
                chain(x, result.resolve, result.reject);
                return result.promise;
            }
            return this.resolve(x);
        },
        all: function(values) {
            var deferred = getDeferred(this);
            var count = 0;
            var resolutions = [];
            try {
                for (var i = 0; i < values.length; i++) {
                    ++count;
                    this.cast(values[i]).then(function(i, x) {
                        resolutions[i] = x;
                        if (--count === 0)
                            deferred.resolve(resolutions);
                    }.bind(undefined, i), (function(r) {
                        if (count > 0)
                            count = 0;
                        deferred.reject(r);
                    }));
                }
                if (count === 0)
                    deferred.resolve(resolutions);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        race: function(values) {
            var deferred = getDeferred(this);
            try {
                for (var i = 0; i < values.length; i++) {
                    this.cast(values[i]).then((function(x) {
                        deferred.resolve(x);
                    }), (function(r) {
                        deferred.reject(r);
                    }));
                }
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        }
    });
    function promiseResolve(promise, x) {
        promiseDone(promise, 'resolved', x, promise.onResolve_);
    }
    function promiseReject(promise, r) {
        promiseDone(promise, 'rejected', r, promise.onReject_);
    }
    function promiseDone(promise, status, value, reactions) {
        if (promise.status_ !== 'pending')
            return;
        for (var i = 0; i < reactions.length; i++) {
            promiseReact(reactions[i][0], reactions[i][1], value);
        }
        promise.status_ = status;
        promise.value_ = value;
        promise.onResolve_ = promise.onReject_ = undefined;
    }
    function promiseReact(deferred, handler, x) {
        async((function() {
            try {
                var y = handler(x);
                if (y === deferred.promise)
                    throw new TypeError;else if (isPromise(y))chain(y, deferred.resolve, deferred.reject)
                    ;
                else
                    deferred.resolve(y);
            } catch (e) {
                deferred.reject(e);
            }
        }));
    }
    var thenableSymbol = '@@thenable';
    function promiseCoerce(constructor, x) {
        if (isPromise(x)) {
            return x;
        } else if (x && typeof x.then === 'function') {
            var p = x[thenableSymbol];
            if (p) {
                return p;
            } else {
                var deferred = getDeferred(constructor);
                x[thenableSymbol] = deferred.promise;
                try {
                    x.then(deferred.resolve, deferred.reject);
                } catch (e) {
                    deferred.reject(e);
                }
                return deferred.promise;
            }
        } else {
            return x;
        }
    }
    return function(_ref4) {
      Object.defineProperties(_ref4, {
        Promise: {
          get: function() {
              return Promise;
          }
        }
      });

      return _ref4;
    }({});
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/String", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/String";
    var $toString = Object.prototype.toString;
    var $indexOf = String.prototype.indexOf;
    var $lastIndexOf = String.prototype.lastIndexOf;
    function startsWith(search) {
        var string = String(this);
        if (this == null || $toString.call(search) == '[object RegExp]') {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        var pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        return $indexOf.call(string, searchString, pos) == start;
    }
    function endsWith(search) {
        var string = String(this);
        if (this == null || $toString.call(search) == '[object RegExp]') {
            throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var pos = stringLength;
        if (arguments.length > 1) {
            var position = arguments[1];
            if (position !== undefined) {
                pos = position ? Number(position) : 0;
                if (isNaN(pos)) {
                    pos = 0;
                }
            }
        }
        var end = Math.min(Math.max(pos, 0), stringLength);
        var start = end - searchLength;
        if (start < 0) {
            return false;
        }
        return $lastIndexOf.call(string, searchString, start) == start;
    }
    function contains(search) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var position = arguments.length > 1 ? arguments[1] : undefined;
        var pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
            pos = 0;
        }
        var start = Math.min(Math.max(pos, 0), stringLength);
        return $indexOf.call(string, searchString, pos) != -1;
    }
    function repeat(count) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var n = count ? Number(count) : 0;
        if (isNaN(n)) {
            n = 0;
        }
        if (n < 0 || n == Infinity) {
            throw RangeError();
        }
        if (n == 0) {
            return '';
        }
        var result = '';
        while (n--) {
            result += string;
        }
        return result;
    }
    function codePointAt(position) {
        if (this == null) {
            throw TypeError();
        }
        var string = String(this);
        var size = string.length;
        var index = position ? Number(position) : 0;
        if (isNaN(index)) {
            index = 0;
        }
        if (index < 0 || index >= size) {
            return undefined;
        }
        var first = string.charCodeAt(index);
        var second;
        if (first >= 55296 && first <= 56319 && size > index + 1) {
            second = string.charCodeAt(index + 1);
            if (second >= 56320 && second <= 57343) {
                return (first - 55296) * 1024 + second - 56320 + 65536;
            }
        }
        return first;
    }
    function raw(callsite) {
        var raw = callsite.raw;
        var len = raw.length >>> 0;
        if (len === 0)
            return '';
        var s = '';
        var i = 0;
        while (true) {
            s += raw[i];
            if (i + 1 === len)
                return s;
            s += arguments[++i];
        }
    }
    function fromCodePoint() {
        var codeUnits = [];
        var floor = Math.floor;
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
            return '';
        }
        while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) != codePoint) {
                throw RangeError('Invalid code point: ' + codePoint);
            }
            if (codePoint <= 65535) {
                codeUnits.push(codePoint);
            } else {
                codePoint -= 65536;
                highSurrogate = (codePoint >> 10) + 55296;
                lowSurrogate = (codePoint % 1024) + 56320;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
        }
        return String.fromCharCode.apply(null, codeUnits);
    }
    return function(_ref5) {
      Object.defineProperties(_ref5, {
        startsWith: {
          get: function() {
              return startsWith;
          }
        },

        endsWith: {
          get: function() {
              return endsWith;
          }
        },

        contains: {
          get: function() {
              return contains;
          }
        },

        repeat: {
          get: function() {
              return repeat;
          }
        },

        codePointAt: {
          get: function() {
              return codePointAt;
          }
        },

        raw: {
          get: function() {
              return raw;
          }
        },

        fromCodePoint: {
          get: function() {
              return fromCodePoint;
          }
        }
      });

      return _ref5;
    }({});
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfills/polyfills", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfills/polyfills";
    var Promise = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/Promise").Promise;
    var $__9 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/String"),
        codePointAt = $__9.codePointAt,
        contains = $__9.contains,
        endsWith = $__9.endsWith,
        fromCodePoint = $__9.fromCodePoint,
        repeat = $__9.repeat,
        raw = $__9.raw,
        startsWith = $__9.startsWith;
    var $__9 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/ArrayIterator"),
        entries = $__9.entries,
        keys = $__9.keys,
        values = $__9.values;
    function maybeDefineMethod(object, name, value) {
        if (!(name in object)) {
            Object.defineProperty(object, name, {
                value: value,
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    }
    function maybeAddFunctions(object, functions) {
        for (var i = 0; i < functions.length; i += 2) {
            var name = functions[i];
            var value = functions[i + 1];
            maybeDefineMethod(object, name, value);
        }
    }
    function polyfillPromise(global) {
        if (!global.Promise)
            global.Promise = Promise;
    }
    function polyfillString(String) {
        maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
        maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    }
    function polyfillArray(Array, Symbol) {
        maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values]);
        if (Symbol && Symbol.iterator) {
            Object.defineProperty(Array.prototype, Symbol.iterator, {
                value: values,
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    }
    function polyfill(global) {
        polyfillPromise(global);
        polyfillString(global.String);
        polyfillArray(global.Array, global.Symbol);
    }
    polyfill(this);
    var setupGlobals = $traceurRuntime.setupGlobals;
    $traceurRuntime.setupGlobals = function(global) {
        setupGlobals(global);
        polyfill(global);
    };
    return {};
});
System.register("traceur-runtime@0.0.25/src/runtime/polyfill-import", [], function() {
    "use strict";
    var __moduleName = "traceur-runtime@0.0.25/src/runtime/polyfill-import";
    var $__11 = $traceurRuntime.getModuleImpl("traceur-runtime@0.0.25/src/runtime/polyfills/polyfills");
    return {};
});
System.get("traceur-runtime@0.0.25/src/runtime/polyfill-import" + '');

//harmonic code
"use strict";
"use strict";
var Harmonic = function() {
  var Harmonic = function Harmonic(name) {
    this.name = name;
  };
  Object.defineProperties(Harmonic.prototype, {
    getConfig: {
      writable: true,
      value: function() {
        return {
          "name": "ES6 Rocks",
          "title": "ES6 Rocks",
          "domain": "http://es6rocks.com",
          "subtitle": "Powered by Harmonic",
          "author": "ES6 Rocks",
          "description": "A website dedicated to teach all about ES6",
          "bio": "Thats me",
          "template": "2.0",
          "preprocessor": "stylus",
          "posts_permalink": ":language/:year/:month/:title",
          "pages_permalink": "pages/:title",
          "header_tokens": ["<!--", "-->"],
          "index_posts": 20,
          "i18n": {
            "default": "en",
            "languages": ["en", "pt-br"]
          }
        };
      }
    },
    getPosts: {
      writable: true,
      value: function() {
        return {
          "en": [{
            "layout": "post",
            "title": "Using ES6 modules in the browser with gulp",
            "date": "2014-12-02T17:14:37.232Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, modules, Traceur, gulp",
            "description": "How to use ES6 modules in the browser using Traceur and gulp",
            "categories": ["modules", " tutorial"],
            "authorName": "Juan Cabrera",
            "authorLink": "http://juan.me",
            "authorPicture": "http://juan.me/images/reacticabrera.jpg",
            "content": "",
            "file": "./src/posts/using-es6-modules-in-the-browser-with-gulp.md",
            "filename": "using-es6-modules-in-the-browser-with-gulp",
            "link": "2014/12/using-es6-modules-in-the-browser-with-gulp",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "ES6 modules today with 6to5",
            "date": "2014-10-28T12:49:54.528Z",
            "comments": "true",
            "published": "true",
            "keywords": "ES6, modules, 6to5",
            "description": "A tutorial about using ES6 modules today with 6to5",
            "categories": ["Modules", " Tutorial"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>I&#39;ve posted the image below on <a href=\"https://twitter.com/jaydson/status/526882798263881730\">Twitter</a> showing how happy I was.</p>\n",
            "file": "./src/posts/es6-modules-today-with-6to5.md",
            "filename": "es6-modules-today-with-6to5",
            "link": "2014/10/es6-modules-today-with-6to5",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "JavaScript ♥  Unicode",
            "date": "2014-10-13T19:22:32.267Z",
            "comments": "true",
            "published": "true",
            "keywords": "ES6, Unicode",
            "description": "Mathias Bynens talking about Unicode in JavaScript",
            "categories": ["Unicode", " Videos"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>Mathias Bynens gave an awesome talk in the last <a href=\"http://2014.jsconf.eu\">JSConfEU</a> edition.</p>\n",
            "file": "./src/posts/javascript-unicode.md",
            "filename": "javascript-unicode",
            "link": "2014/10/javascript-unicode",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "Arrow Functions and their scope",
            "date": "2014-10-01T04:01:41.369Z",
            "comments": "true",
            "published": "true",
            "keywords": "arrow functions, es6, escope",
            "description": "Read about arrow functions in ES6, and their scopes.",
            "categories": ["scope", " articles", " basics"],
            "authorName": "Felipe N. Moura",
            "authorLink": "http://twitter.com/felipenmoura",
            "authorDescription": "FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfa1/v/t1.0-1/c0.0.160.160/p160x160/10556538_10203722375715942_6849892741161969592_n.jpg?oh=a3044d62663f3d0f4fe74f480b61c9d1&oe=54C6A6B1&__gda__=1422509575_e6364eefdf2fc0e5c96899467d229f62",
            "content": "<p>Among so many great new features in ES6, Arrow Functions (or Fat Arrow Functions) is one that deserves attention!</p>\n",
            "file": "./src/posts/arrow-functions-and-their-scope.md",
            "filename": "arrow-functions-and-their-scope",
            "link": "2014/10/arrow-functions-and-their-scope",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "What's next for JavaScript",
            "date": "2014-08-29T03:04:03.666Z",
            "comments": "true",
            "published": "true",
            "keywords": "talks",
            "description": "A talk by Dr. Axel Rauschmayer about what's next for JavaScript",
            "categories": ["talks", " videos"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>If you&#39;re interested in ES6 you must follow <a href=\"https://twitter.com/rauschma\">Dr. Axel Rauschmayer</a>.</p>\n",
            "file": "./src/posts/what-is-next-for-javascript.md",
            "filename": "what-is-next-for-javascript",
            "link": "2014/08/what-is-next-for-javascript",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "What you need to know about block scope - let",
            "date": "2014-08-28T01:58:23.465Z",
            "comments": "true",
            "published": "true",
            "keywords": "",
            "description": "An introduction to block scope on ES6",
            "categories": ["scope", " articles", " basics"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "",
            "file": "./src/posts/what-you-need-to-know-about-block-scope-let.md",
            "filename": "what-you-need-to-know-about-block-scope-let",
            "link": "2014/08/what-you-need-to-know-about-block-scope-let",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "A new syntax for modules in ES6",
            "date": "2014-07-11T07:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, modules",
            "description": "Post about module syntax",
            "categories": ["modules"],
            "authorName": "Jean Carlo Emer",
            "authorLink": "http://twitter.com/jcemer",
            "authorDescription": "Internet craftsman, computer scientist and speaker. I am a full-stack web developer for some time and only write code that solves real problems.",
            "authorPicture": "https://avatars2.githubusercontent.com/u/353504?s=460",
            "content": "<p>TC39 - ECMAScript group is finishing the sixth version of the ECMAScript specification. The <a href=\"http://www.2ality.com/2014/06/es6-schedule.html\">group schedule</a> points to next June as the release date.</p>\n",
            "file": "./src/posts/a-new-syntax-for-modules-in-es6.md",
            "filename": "a-new-syntax-for-modules-in-es6",
            "link": "2014/07/a-new-syntax-for-modules-in-es6",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "ES6 interview with David Herman",
            "date": "2014-07-04T01:08:30.242Z",
            "comments": "true",
            "published": "true",
            "keywords": "ES6",
            "description": "Interview with David Herman about ES6",
            "categories": ["ES6", " Interview"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>We did a nice interview with <a href=\"https://twitter.com/littlecalculist\">David Herman</a> about his thoughts about ES6.</p>\n",
            "file": "./src/posts/es6-interview-with-david-herman.md",
            "filename": "es6-interview-with-david-herman",
            "link": "2014/07/es6-interview-with-david-herman",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "Practical Workflows for ES6 Modules, Fluent 2014",
            "date": "2014-05-27T07:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, modules",
            "description": "Post about modules",
            "categories": ["modules", " talks"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "",
            "file": "./src/posts/practical-workflows-es6-modules.md",
            "filename": "practical-workflows-es6-modules",
            "link": "2014/05/practical-workflows-es6-modules",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "ECMAScript 6 - A Better JavaScript for the Ambient Computing Era",
            "date": "2014-05-27T06:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, talks",
            "description": "talk about es6",
            "categories": ["talks", " videos"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "",
            "file": "./src/posts/ecmascript-6-a-better-javascript-for-the-ambient-computing-era.md",
            "filename": "ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
            "link": "2014/05/ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "ECMAScript 6 - The future is here",
            "date": "2014-05-27T05:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, talks",
            "description": "talk about es6",
            "categories": ["talks"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>A talk by <a href=\"https://twitter.com/sebarmeli\">Sebastiano Armeli</a> showing some of the ES6 features like scoping, generators, collections, modules and proxies.</p>\n",
            "file": "./src/posts/ecmascript-6-the-future-is-here.md",
            "filename": "ecmascript-6-the-future-is-here",
            "link": "2014/05/ecmascript-6-the-future-is-here",
            "lang": "en",
            "default_lang": false
          }, {
            "layout": "post",
            "title": "Hello World",
            "date": "2014-05-17T08:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6",
            "description": "Hello world post",
            "categories": ["JavaScript", " ES6"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>Hello everybody, welcome to ES6Rocks!<br>The mission here is to discuss about <a href=\"http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts\">JavaScript&#39;s next version</a> , aka Harmony or ES.next.</p>\n",
            "file": "./src/posts/hello-world.md",
            "filename": "hello-world",
            "link": "2014/05/hello-world",
            "lang": "en",
            "default_lang": false
          }],
          "pt-br": [{
            "layout": "post",
            "title": "ES6: Brincando com o novo Javascript",
            "date": "2014-11-13T23:30:23.830Z",
            "comments": "true",
            "published": "true",
            "keywords": "ES6, 6to5, Javascript",
            "description": "Como estudar e aprender ES6 criando experimentos e testes",
            "categories": ["Articles"],
            "authorName": "Pedro Nauck",
            "authorLink": "http://twitter.com/pedronauck",
            "authorPicture": "https://avatars0.githubusercontent.com/u/2029172?v=3&s=160",
            "content": "<p>Acredito que boa parte dos desenvolvedores que tem convívio com JavaScript, já estão ouvindo falar da <a href=\"http://tc39wiki.calculist.org/es6/\">nova versão do JavaScript</a>, conhecida também como ECMAScript 6 ou apenas ES6.</p>\n",
            "file": "./src/posts/es6-playing-with-the-new-javascript.md",
            "filename": "es6-playing-with-the-new-javascript",
            "link": "pt-br/2014/11/es6-playing-with-the-new-javascript",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "Módulos ES6 hoje com o 6to5",
            "date": "2014-10-28T12:49:54.528Z",
            "comments": "true",
            "published": "true",
            "keywords": "ES6, modules, 6to5",
            "description": "Um tutorial sobre o uso de módulos ES6 hoje com o 6to5",
            "categories": ["Modules", " Tutorial"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>Eu postei a imagem abaixo no <a href=\"https://twitter.com/jaydson/status/526882798263881730\">Twitter</a>, mostrando o quanto feliz eu estava.</p>\n",
            "file": "./src/posts/es6-modules-today-with-6to5.md",
            "filename": "es6-modules-today-with-6to5",
            "link": "pt-br/2014/10/es6-modules-today-with-6to5",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "JavaScript ♥  Unicode",
            "date": "2014-10-13T19:22:32.267Z",
            "comments": "true",
            "published": "true",
            "keywords": "ES6, Unicode",
            "description": "Mathias Bynens talking about Unicode in JavaScript",
            "categories": ["Unicode", " Videos"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>O Mathias Bynens deu uma palestra incrível na última edição da <a href=\"http://2014.jsconf.eu\">JSConfEU</a>.</p>\n",
            "file": "./src/posts/javascript-unicode.md",
            "filename": "javascript-unicode",
            "link": "pt-br/2014/10/javascript-unicode",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "Arrow Functions and their scope",
            "date": "2014-10-01T04:01:41.369Z",
            "comments": "true",
            "published": "true",
            "keywords": "arrow functions, es6, escope",
            "description": "Read about arrow functions in ES6, and their scopes.",
            "categories": ["scope", " articles", " basics"],
            "authorName": "Felipe N. Moura",
            "authorLink": "http://twitter.com/felipenmoura",
            "authorDescription": "FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfa1/v/t1.0-1/c0.0.160.160/p160x160/10556538_10203722375715942_6849892741161969592_n.jpg?oh=a3044d62663f3d0f4fe74f480b61c9d1&oe=54C6A6B1&__gda__=1422509575_e6364eefdf2fc0e5c96899467d229f62",
            "content": "<p>Entre as tantas novas features presentes no ES6, Arrow Functions (ou Fat Arrow Functions), é uma que merece boa atenção!</p>\n",
            "file": "./src/posts/arrow-functions-and-their-scope.md",
            "filename": "arrow-functions-and-their-scope",
            "link": "pt-br/2014/10/arrow-functions-and-their-scope",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "O que podemos esperar do novo JavaScript",
            "date": "2014-08-29T03:04:03.666Z",
            "comments": "true",
            "published": "true",
            "keywords": "talks",
            "description": "Slides da palestra do Dr. Axel Rauschmayer sobre o que podemos esperar da nova versão do JavaScript",
            "categories": ["talks", " videos"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>Se você está interessado em ES6, você deve seguir o <a href=\"https://twitter.com/rauschma\">Dr. Axel Rauschmayer</a>.</p>\n",
            "file": "./src/posts/what-is-next-for-javascript.md",
            "filename": "what-is-next-for-javascript",
            "link": "pt-br/2014/08/what-is-next-for-javascript",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "O que você precisa saber sobre block scope - let",
            "date": "2014-08-28T01:58:23.465Z",
            "comments": "true",
            "published": "true",
            "keywords": "",
            "description": "Uma introdução a block scope na ES6",
            "categories": ["scope", " articles", " basics"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "",
            "file": "./src/posts/what-you-need-to-know-about-block-scope-let.md",
            "filename": "what-you-need-to-know-about-block-scope-let",
            "link": "pt-br/2014/08/what-you-need-to-know-about-block-scope-let",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "Uma nova sintaxe para módulos na ES6",
            "date": "2014-07-11T07:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, modules",
            "description": "Post about module syntax",
            "categories": ["modules"],
            "authorName": "Jean Carlo Emer",
            "authorLink": "http://twitter.com/jcemer",
            "authorDescription": "Internet craftsman, computer scientist and speaker. I am a full-stack web developer for some time and only write code that solves real problems.",
            "authorPicture": "https://avatars2.githubusercontent.com/u/353504?s=460",
            "content": "<p>O grupo TC39 - ECMAScript já está finalizando a sexta versão da especificação do ECMAScript. A <a href=\"http://www.2ality.com/2014/06/es6-schedule.html\">agenda do grupo</a> aponta o mês de junho do próximo ano como sendo a data de lançamento.</p>\n",
            "file": "./src/posts/a-new-syntax-for-modules-in-es6.md",
            "filename": "a-new-syntax-for-modules-in-es6",
            "link": "pt-br/2014/07/a-new-syntax-for-modules-in-es6",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "Entrevista sobre ES6 com o David Herman",
            "date": "2014-07-04T01:08:30.242Z",
            "comments": "true",
            "published": "true",
            "keywords": "ES6",
            "description": "Entrevista feita com David Herman sobre ES6",
            "categories": ["ES6", " Interview"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>Fizemos uma entrevista bem legal com o <a href=\"https://twitter.com/littlecalculist\">David Herman</a> sobre ES6.</p>\n",
            "file": "./src/posts/es6-interview-with-david-herman.md",
            "filename": "es6-interview-with-david-herman",
            "link": "pt-br/2014/07/es6-interview-with-david-herman",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "Workflows para os módulos da ES6, Fluent 2014",
            "date": "2014-05-27T07:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, modules",
            "description": "Post sobre módulos",
            "categories": ["modules", " talks"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "",
            "file": "./src/posts/practical-workflows-es6-modules.md",
            "filename": "practical-workflows-es6-modules",
            "link": "pt-br/2014/05/practical-workflows-es6-modules",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "ECMAScript 6 - Um melhor JavaScript para a Ambient Computing Era",
            "date": "2014-05-27T06:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, talks",
            "description": "talk about es6",
            "categories": ["talks", " videos"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "",
            "file": "./src/posts/ecmascript-6-a-better-javascript-for-the-ambient-computing-era.md",
            "filename": "ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
            "link": "pt-br/2014/05/ecmascript-6-a-better-javascript-for-the-ambient-computing-era",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "ECMAScript 6 - O futuro está aqui",
            "date": "2014-05-27T05:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6, talks",
            "description": "talk about es6",
            "categories": ["talks"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>Uma palestra do <a href=\"https://twitter.com/sebarmeli\">Sebastiano Armeli</a> mostrando algumas features da ES6 como scoping, generators, collections, modules and proxies.</p>\n",
            "file": "./src/posts/ecmascript-6-the-future-is-here.md",
            "filename": "ecmascript-6-the-future-is-here",
            "link": "pt-br/2014/05/ecmascript-6-the-future-is-here",
            "lang": "pt-br",
            "default_lang": true
          }, {
            "layout": "post",
            "title": "Hello World",
            "date": "2014-05-17T08:18:47.847Z",
            "comments": "true",
            "published": "true",
            "keywords": "JavaScript, ES6",
            "description": "Hello world post",
            "categories": ["JavaScript", " ES6"],
            "authorName": "Jaydson Gomes",
            "authorLink": "http://twitter.com/jaydson",
            "authorDescription": "JavaScript enthusiast - FrontEnd Engineer at Terra Networks - BrazilJS and RSJS curator",
            "authorPicture": "https://pbs.twimg.com/profile_images/453720347620032512/UM2nE21c_400x400.jpeg",
            "content": "<p>Olá pessoal, bem-vindos ao ES6Rocks!\nNossa missão aqui é discutir sobre a <a href=\"http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts\">a nova versão do JavaScript</a>, mais conhecida como Harmony ou ES.next.</p>\n",
            "file": "./src/posts/hello-world.md",
            "filename": "hello-world",
            "link": "pt-br/2014/05/hello-world",
            "lang": "pt-br",
            "default_lang": true
          }]
        };
      }
    },
    getPages: {
      writable: true,
      value: function() {
        return [];
      }
    }
  });
  return Harmonic;
}();
