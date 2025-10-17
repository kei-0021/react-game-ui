import * as React from "react";
import React__default, { useState, useRef, useMemo, useEffect, useCallback } from "react";
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production_min;
function requireReactJsxRuntime_production_min() {
  if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
  hasRequiredReactJsxRuntime_production_min = 1;
  var f = React__default, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
  function q(c, a, g) {
    var b, d = {}, e = null, h = null;
    void 0 !== g && (e = "" + g);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (h = a.ref);
    for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
    if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
    return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
  }
  reactJsxRuntime_production_min.Fragment = l;
  reactJsxRuntime_production_min.jsx = q;
  reactJsxRuntime_production_min.jsxs = q;
  return reactJsxRuntime_production_min;
}
var reactJsxRuntime_development = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_development;
function requireReactJsxRuntime_development() {
  if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
  hasRequiredReactJsxRuntime_development = 1;
  if (process.env.NODE_ENV !== "production") {
    (function() {
      var React2 = React__default;
      var REACT_ELEMENT_TYPE = Symbol.for("react.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        if (maybeIterable === null || typeof maybeIterable !== "object") {
          return null;
        }
        var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
        if (typeof maybeIterator === "function") {
          return maybeIterator;
        }
        return null;
      }
      var ReactSharedInternals = React2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      function error(format) {
        {
          {
            for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }
            printWarning("error", format, args);
          }
        }
      }
      function printWarning(level, format, args) {
        {
          var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
          var stack = ReactDebugCurrentFrame2.getStackAddendum();
          if (stack !== "") {
            format += "%s";
            args = args.concat([stack]);
          }
          var argsWithFormat = args.map(function(item) {
            return String(item);
          });
          argsWithFormat.unshift("Warning: " + format);
          Function.prototype.apply.call(console[level], console, argsWithFormat);
        }
      }
      var enableScopeAPI = false;
      var enableCacheElement = false;
      var enableTransitionTracing = false;
      var enableLegacyHidden = false;
      var enableDebugTracing = false;
      var REACT_MODULE_REFERENCE;
      {
        REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
      }
      function isValidElementType(type) {
        if (typeof type === "string" || typeof type === "function") {
          return true;
        }
        if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
          return true;
        }
        if (typeof type === "object" && type !== null) {
          if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
          // types supported by any Flight configuration anywhere since
          // we don't know which Flight build this will end up being used
          // with.
          type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
            return true;
          }
        }
        return false;
      }
      function getWrappedName(outerType, innerType, wrapperName) {
        var displayName = outerType.displayName;
        if (displayName) {
          return displayName;
        }
        var functionName = innerType.displayName || innerType.name || "";
        return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
      }
      function getContextName(type) {
        return type.displayName || "Context";
      }
      function getComponentNameFromType(type) {
        if (type == null) {
          return null;
        }
        {
          if (typeof type.tag === "number") {
            error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
          }
        }
        if (typeof type === "function") {
          return type.displayName || type.name || null;
        }
        if (typeof type === "string") {
          return type;
        }
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
        }
        if (typeof type === "object") {
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              var context = type;
              return getContextName(context) + ".Consumer";
            case REACT_PROVIDER_TYPE:
              var provider = type;
              return getContextName(provider._context) + ".Provider";
            case REACT_FORWARD_REF_TYPE:
              return getWrappedName(type, type.render, "ForwardRef");
            case REACT_MEMO_TYPE:
              var outerName = type.displayName || null;
              if (outerName !== null) {
                return outerName;
              }
              return getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE: {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                return getComponentNameFromType(init(payload));
              } catch (x) {
                return null;
              }
            }
          }
        }
        return null;
      }
      var assign = Object.assign;
      var disabledDepth = 0;
      var prevLog;
      var prevInfo;
      var prevWarn;
      var prevError;
      var prevGroup;
      var prevGroupCollapsed;
      var prevGroupEnd;
      function disabledLog() {
      }
      disabledLog.__reactDisabledLog = true;
      function disableLogs() {
        {
          if (disabledDepth === 0) {
            prevLog = console.log;
            prevInfo = console.info;
            prevWarn = console.warn;
            prevError = console.error;
            prevGroup = console.group;
            prevGroupCollapsed = console.groupCollapsed;
            prevGroupEnd = console.groupEnd;
            var props = {
              configurable: true,
              enumerable: true,
              value: disabledLog,
              writable: true
            };
            Object.defineProperties(console, {
              info: props,
              log: props,
              warn: props,
              error: props,
              group: props,
              groupCollapsed: props,
              groupEnd: props
            });
          }
          disabledDepth++;
        }
      }
      function reenableLogs() {
        {
          disabledDepth--;
          if (disabledDepth === 0) {
            var props = {
              configurable: true,
              enumerable: true,
              writable: true
            };
            Object.defineProperties(console, {
              log: assign({}, props, {
                value: prevLog
              }),
              info: assign({}, props, {
                value: prevInfo
              }),
              warn: assign({}, props, {
                value: prevWarn
              }),
              error: assign({}, props, {
                value: prevError
              }),
              group: assign({}, props, {
                value: prevGroup
              }),
              groupCollapsed: assign({}, props, {
                value: prevGroupCollapsed
              }),
              groupEnd: assign({}, props, {
                value: prevGroupEnd
              })
            });
          }
          if (disabledDepth < 0) {
            error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
          }
        }
      }
      var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
      var prefix;
      function describeBuiltInComponentFrame(name, source, ownerFn) {
        {
          if (prefix === void 0) {
            try {
              throw Error();
            } catch (x) {
              var match = x.stack.trim().match(/\n( *(at )?)/);
              prefix = match && match[1] || "";
            }
          }
          return "\n" + prefix + name;
        }
      }
      var reentry = false;
      var componentFrameCache;
      {
        var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
        componentFrameCache = new PossiblyWeakMap();
      }
      function describeNativeComponentFrame(fn, construct) {
        if (!fn || reentry) {
          return "";
        }
        {
          var frame = componentFrameCache.get(fn);
          if (frame !== void 0) {
            return frame;
          }
        }
        var control;
        reentry = true;
        var previousPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var previousDispatcher;
        {
          previousDispatcher = ReactCurrentDispatcher.current;
          ReactCurrentDispatcher.current = null;
          disableLogs();
        }
        try {
          if (construct) {
            var Fake = function() {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function() {
                throw Error();
              }
            });
            if (typeof Reflect === "object" && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x) {
                control = x;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x) {
              control = x;
            }
            fn();
          }
        } catch (sample) {
          if (sample && control && typeof sample.stack === "string") {
            var sampleLines = sample.stack.split("\n");
            var controlLines = control.stack.split("\n");
            var s = sampleLines.length - 1;
            var c = controlLines.length - 1;
            while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
              c--;
            }
            for (; s >= 1 && c >= 0; s--, c--) {
              if (sampleLines[s] !== controlLines[c]) {
                if (s !== 1 || c !== 1) {
                  do {
                    s--;
                    c--;
                    if (c < 0 || sampleLines[s] !== controlLines[c]) {
                      var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                      if (fn.displayName && _frame.includes("<anonymous>")) {
                        _frame = _frame.replace("<anonymous>", fn.displayName);
                      }
                      {
                        if (typeof fn === "function") {
                          componentFrameCache.set(fn, _frame);
                        }
                      }
                      return _frame;
                    }
                  } while (s >= 1 && c >= 0);
                }
                break;
              }
            }
          }
        } finally {
          reentry = false;
          {
            ReactCurrentDispatcher.current = previousDispatcher;
            reenableLogs();
          }
          Error.prepareStackTrace = previousPrepareStackTrace;
        }
        var name = fn ? fn.displayName || fn.name : "";
        var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
        {
          if (typeof fn === "function") {
            componentFrameCache.set(fn, syntheticFrame);
          }
        }
        return syntheticFrame;
      }
      function describeFunctionComponentFrame(fn, source, ownerFn) {
        {
          return describeNativeComponentFrame(fn, false);
        }
      }
      function shouldConstruct(Component) {
        var prototype = Component.prototype;
        return !!(prototype && prototype.isReactComponent);
      }
      function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
        if (type == null) {
          return "";
        }
        if (typeof type === "function") {
          {
            return describeNativeComponentFrame(type, shouldConstruct(type));
          }
        }
        if (typeof type === "string") {
          return describeBuiltInComponentFrame(type);
        }
        switch (type) {
          case REACT_SUSPENSE_TYPE:
            return describeBuiltInComponentFrame("Suspense");
          case REACT_SUSPENSE_LIST_TYPE:
            return describeBuiltInComponentFrame("SuspenseList");
        }
        if (typeof type === "object") {
          switch (type.$$typeof) {
            case REACT_FORWARD_REF_TYPE:
              return describeFunctionComponentFrame(type.render);
            case REACT_MEMO_TYPE:
              return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
            case REACT_LAZY_TYPE: {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
              } catch (x) {
              }
            }
          }
        }
        return "";
      }
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var loggedTypeFailures = {};
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame.setExtraStackFrame(null);
          }
        }
      }
      function checkPropTypes(typeSpecs, values, location, componentName, element) {
        {
          var has = Function.call.bind(hasOwnProperty);
          for (var typeSpecName in typeSpecs) {
            if (has(typeSpecs, typeSpecName)) {
              var error$1 = void 0;
              try {
                if (typeof typeSpecs[typeSpecName] !== "function") {
                  var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  err.name = "Invariant Violation";
                  throw err;
                }
                error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (ex) {
                error$1 = ex;
              }
              if (error$1 && !(error$1 instanceof Error)) {
                setCurrentlyValidatingElement(element);
                error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                setCurrentlyValidatingElement(null);
              }
              if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                loggedTypeFailures[error$1.message] = true;
                setCurrentlyValidatingElement(element);
                error("Failed %s type: %s", location, error$1.message);
                setCurrentlyValidatingElement(null);
              }
            }
          }
        }
      }
      var isArrayImpl = Array.isArray;
      function isArray(a) {
        return isArrayImpl(a);
      }
      function typeName(value) {
        {
          var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
          var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          return type;
        }
      }
      function willCoercionThrow(value) {
        {
          try {
            testStringCoercion(value);
            return false;
          } catch (e) {
            return true;
          }
        }
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        {
          if (willCoercionThrow(value)) {
            error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
            return testStringCoercion(value);
          }
        }
      }
      var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
      var RESERVED_PROPS = {
        key: true,
        ref: true,
        __self: true,
        __source: true
      };
      var specialPropKeyWarningShown;
      var specialPropRefWarningShown;
      function hasValidRef(config) {
        {
          if (hasOwnProperty.call(config, "ref")) {
            var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.ref !== void 0;
      }
      function hasValidKey(config) {
        {
          if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.key !== void 0;
      }
      function warnIfStringRefCannotBeAutoConverted(config, self) {
        {
          if (typeof config.ref === "string" && ReactCurrentOwner.current && self) ;
        }
      }
      function defineKeyPropWarningGetter(props, displayName) {
        {
          var warnAboutAccessingKey = function() {
            if (!specialPropKeyWarningShown) {
              specialPropKeyWarningShown = true;
              error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
      }
      function defineRefPropWarningGetter(props, displayName) {
        {
          var warnAboutAccessingRef = function() {
            if (!specialPropRefWarningShown) {
              specialPropRefWarningShown = true;
              error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
      }
      var ReactElement = function(type, key, ref, self, source, owner, props) {
        var element = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: REACT_ELEMENT_TYPE,
          // Built-in properties that belong on the element
          type,
          key,
          ref,
          props,
          // Record the component responsible for creating this element.
          _owner: owner
        };
        {
          element._store = {};
          Object.defineProperty(element._store, "validated", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: false
          });
          Object.defineProperty(element, "_self", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: self
          });
          Object.defineProperty(element, "_source", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: source
          });
          if (Object.freeze) {
            Object.freeze(element.props);
            Object.freeze(element);
          }
        }
        return element;
      };
      function jsxDEV(type, config, maybeKey, source, self) {
        {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          if (maybeKey !== void 0) {
            {
              checkKeyStringCoercion(maybeKey);
            }
            key = "" + maybeKey;
          }
          if (hasValidKey(config)) {
            {
              checkKeyStringCoercion(config.key);
            }
            key = "" + config.key;
          }
          if (hasValidRef(config)) {
            ref = config.ref;
            warnIfStringRefCannotBeAutoConverted(config, self);
          }
          for (propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
              props[propName] = config[propName];
            }
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          if (key || ref) {
            var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
            if (key) {
              defineKeyPropWarningGetter(props, displayName);
            }
            if (ref) {
              defineRefPropWarningGetter(props, displayName);
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
      }
      var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
      var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement$1(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame$1.setExtraStackFrame(null);
          }
        }
      }
      var propTypesMisspellWarningShown;
      {
        propTypesMisspellWarningShown = false;
      }
      function isValidElement(object) {
        {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
      }
      function getDeclarationErrorAddendum() {
        {
          if (ReactCurrentOwner$1.current) {
            var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
      }
      function getSourceInfoErrorAddendum(source) {
        {
          return "";
        }
      }
      var ownerHasKeyUseWarning = {};
      function getCurrentComponentErrorInfo(parentType) {
        {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
      }
      function validateExplicitKey(element, parentType) {
        {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          setCurrentlyValidatingElement$1(element);
          error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
          setCurrentlyValidatingElement$1(null);
        }
      }
      function validateChildKeys(node, parentType) {
        {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
      }
      function validatePropTypes(element) {
        {
          var type = element.type;
          if (type === null || type === void 0 || typeof type === "string") {
            return;
          }
          var propTypes;
          if (typeof type === "function") {
            propTypes = type.propTypes;
          } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          type.$$typeof === REACT_MEMO_TYPE)) {
            propTypes = type.propTypes;
          } else {
            return;
          }
          if (propTypes) {
            var name = getComponentNameFromType(type);
            checkPropTypes(propTypes, element.props, "prop", name, element);
          } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
            propTypesMisspellWarningShown = true;
            var _name = getComponentNameFromType(type);
            error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
          }
          if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
            error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
          }
        }
      }
      function validateFragmentProps(fragment) {
        {
          var keys = Object.keys(fragment.props);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key !== "children" && key !== "key") {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
              setCurrentlyValidatingElement$1(null);
              break;
            }
          }
          if (fragment.ref !== null) {
            setCurrentlyValidatingElement$1(fragment);
            error("Invalid attribute `ref` supplied to `React.Fragment`.");
            setCurrentlyValidatingElement$1(null);
          }
        }
      }
      var didWarnAboutKeySpread = {};
      function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
        {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendum();
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
          }
          var element = jsxDEV(type, props, key, source, self);
          if (element == null) {
            return element;
          }
          if (validType) {
            var children = props.children;
            if (children !== void 0) {
              if (isStaticChildren) {
                if (isArray(children)) {
                  for (var i = 0; i < children.length; i++) {
                    validateChildKeys(children[i], type);
                  }
                  if (Object.freeze) {
                    Object.freeze(children);
                  }
                } else {
                  error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
                }
              } else {
                validateChildKeys(children, type);
              }
            }
          }
          {
            if (hasOwnProperty.call(props, "key")) {
              var componentName = getComponentNameFromType(type);
              var keys = Object.keys(props).filter(function(k) {
                return k !== "key";
              });
              var beforeExample = keys.length > 0 ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
              if (!didWarnAboutKeySpread[componentName + beforeExample]) {
                var afterExample = keys.length > 0 ? "{" + keys.join(": ..., ") + ": ...}" : "{}";
                error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
                didWarnAboutKeySpread[componentName + beforeExample] = true;
              }
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
      }
      function jsxWithValidationStatic(type, props, key) {
        {
          return jsxWithValidation(type, props, key, true);
        }
      }
      function jsxWithValidationDynamic(type, props, key) {
        {
          return jsxWithValidation(type, props, key, false);
        }
      }
      var jsx = jsxWithValidationDynamic;
      var jsxs = jsxWithValidationStatic;
      reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
      reactJsxRuntime_development.jsx = jsx;
      reactJsxRuntime_development.jsxs = jsxs;
    })();
  }
  return reactJsxRuntime_development;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  if (process.env.NODE_ENV === "production") {
    jsxRuntime.exports = requireReactJsxRuntime_production_min();
  } else {
    jsxRuntime.exports = requireReactJsxRuntime_development();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
const boardContainer = "_boardContainer_1laip_8";
const cell = "_cell_1laip_28";
const styles$2 = {
  boardContainer,
  cell
};
function Cell({
  row,
  col,
  cellData,
  onClick,
  onDoubleClick,
  // ⭐ [修正点 2] propsとして受け取る
  children,
  onDrop,
  onDragOver,
  changed = false
}) {
  const handleClick = () => {
    onClick(row, col);
  };
  const handleDoubleClick = () => {
    onDoubleClick(row, col);
  };
  const effectiveBackgroundColor = changed ? cellData.changedColor : cellData.backgroundColor;
  const cellStyle = {
    backgroundColor: effectiveBackgroundColor
    // (clipPathなどの他のスタイルもここに追加できます)
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: styles$2.cell,
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      onDrop,
      onDragOver,
      style: cellStyle,
      children
    }
  );
}
const piece = "_piece_wi08l_3";
const styles$1 = {
  piece
};
function Piece({ piece: piece2, style, onClick, isDraggable, onDragStart }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick(piece2.id);
  };
  const handleDragStart = (e) => {
    if (isDraggable) {
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", piece2.id);
      e.dataTransfer.effectAllowed = "move";
      onDragStart(e, piece2);
    }
  };
  const pieceClasses = [
    styles$1.piece,
    isDraggable ? styles$1.draggable : styles$1.clickable
  ].join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: pieceClasses,
      style: {
        ...style,
        backgroundColor: piece2.color
      },
      onClick: handleClick,
      draggable: isDraggable,
      onDragStart: handleDragStart,
      title: piece2.name,
      children: piece2.name.substring(0, 1)
    }
  );
}
function Board({
  rows,
  cols,
  boardData,
  pieces,
  changedCells,
  renderCell,
  onCellClick,
  onCellDoubleClick,
  // ⭐ 追加
  onPieceClick,
  allowPieceDrag = false,
  onPieceDragStart,
  onCellDrop
}) {
  const handleCellClick = (row, col) => {
    const data = boardData[row][col];
    onCellClick(data, row, col);
  };
  const handleCellDoubleClick = (row, col) => {
    const data = boardData[row][col];
    onCellDoubleClick(data, row, col);
  };
  const handlePieceDragStart = (e, piece2) => {
    onPieceDragStart(e, piece2);
  };
  const boardStyle = {
    "--board-rows": rows,
    "--board-cols": cols,
    display: "grid",
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: "4px",
    width: "600px",
    height: "600px",
    position: "relative"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles$2.boardContainer, style: boardStyle, children: [
    boardData.map((rowArr, row) => rowArr.map((originalCellData, col) => {
      const isChanged = changedCells.some(
        (loc) => loc.row === row && loc.col === col
      );
      const effectiveContent = isChanged ? originalCellData.changedContent : originalCellData.content;
      const cellDataForRenderer = {
        ...originalCellData,
        // ⭐ content プロパティに有効なコンテンツを設定
        content: effectiveContent
        // changedContent はそのまま保持
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Cell,
        {
          row,
          col,
          cellData: cellDataForRenderer,
          onClick: () => handleCellClick(row, col),
          onDoubleClick: () => handleCellDoubleClick(row, col),
          onDrop: (e) => onCellDrop(e, row, col),
          onDragOver: (e) => e.preventDefault(),
          changed: isChanged,
          children: renderCell(cellDataForRenderer, row, col)
        },
        originalCellData.id
      );
    })),
    pieces.map((piece2) => {
      const sameLocationPieces = pieces.filter(
        (p) => p.location.row === piece2.location.row && p.location.col === piece2.location.col
      );
      const groupIndex = sameLocationPieces.findIndex((p) => p.id === piece2.id);
      const groupCount = sameLocationPieces.length;
      let offsetX = 0;
      let offsetY = 0;
      if (groupCount > 1) {
        const radius = 18;
        const angle = 2 * Math.PI / groupCount * groupIndex;
        offsetX = radius * Math.cos(angle);
        offsetY = radius * Math.sin(angle);
      }
      const pieceStyle = {
        gridArea: `${piece2.location.row + 1} / ${piece2.location.col + 1} / span 1 / span 1`,
        alignSelf: "center",
        justifySelf: "center",
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: "transform 0.3s ease-in-out"
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Piece,
        {
          piece: piece2,
          style: pieceStyle,
          onClick: onPieceClick,
          isDraggable: allowPieceDrag,
          onDragStart: (e) => handlePieceDragStart(e, piece2)
        },
        piece2.id
      );
    })
  ] });
}
const card = "_card_1mv54_3";
const tooltip = "_tooltip_1mv54_23";
const cardBack = "_cardBack_1mv54_47";
const deckContainer = "_deckContainer_1mv54_59";
const deckCard = "_deckCard_1mv54_66";
const deckCardFront = "_deckCardFront_1mv54_78";
const deckSection = "_deckSection_1mv54_95";
const discardPileWrapper = "_discardPileWrapper_1mv54_103";
const discardTopCard = "_discardTopCard_1mv54_109";
const styles = {
  card,
  tooltip,
  cardBack,
  deckContainer,
  deckCard,
  deckCardFront,
  deckSection,
  discardPileWrapper,
  discardTopCard
};
const CardContent = ({ card: card2 }) => {
  if (!card2.isFaceUp) return null;
  if (card2.frontImage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: card2.frontImage,
        alt: card2.name,
        style: {
          width: "100%",
          height: "100%",
          objectFit: "contain"
        }
      }
    );
  } else {
    console.log(`[CardContent] pngの描画失敗: ${card2.id}. Path: ${card2.frontImage}`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: "5px"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { fontSize: "1em", wordBreak: "break-all", textAlign: "center" }, children: card2.name })
    }
  );
};
function Deck({ socket, roomId, deckId, name, playerId = null }) {
  const [deckCards, setDeckCards] = React.useState([]);
  const [drawnCards, setDrawnCards] = React.useState([]);
  const [discardPile, setDiscardPile] = React.useState([]);
  const [isDiscardHovered, setIsDiscardHovered] = React.useState(false);
  React.useEffect(() => {
    socket.on(`deck:init:${roomId}:${deckId}`, (data) => {
      setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map((c) => ({ ...c, deckId })));
      setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
    });
    socket.on(`deck:update:${roomId}:${deckId}`, (data) => {
      console.log(`[Deck Update:${roomId}]`, data);
      setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map((c) => ({ ...c, deckId })));
      setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
    });
    return () => {
      socket.off(`deck:init:${roomId}:${deckId}`);
      socket.off(`deck:update:${roomId}:${deckId}`);
    };
  }, [socket, roomId, deckId]);
  const draw = () => {
    if (deckCards.length === 0) return;
    const cardToDraw = deckCards[0];
    const drawLocation = cardToDraw?.drawLocation || "hand";
    const requestData = {
      roomId,
      deckId,
      drawLocation
    };
    if (drawLocation === "hand" && playerId) {
      requestData.playerId = playerId;
    }
    socket.emit("deck:draw", requestData);
  };
  const shuffle = () => socket.emit("deck:shuffle", { roomId, deckId });
  const resetDeck = () => socket.emit("deck:reset", { roomId, deckId });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: styles.deckSection, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginBottom: "6px" }, children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.deckControls, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: shuffle, children: "シャッフル" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: resetDeck, children: "山札に戻す" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.deckWrapper, style: { display: "flex", gap: "0px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.deckContainer, onClick: draw, children: deckCards.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: styles.deckCard,
          style: {
            zIndex: deckCards.length - i,
            transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
            backgroundColor: c.backColor
          }
        },
        c.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.deckContainer, children: drawnCards.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: styles.deckCardFront,
          style: {
            zIndex: i + 1,
            transform: `translate(${i * 0.3}px, ${i * 0.3}px)`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { card: c })
        },
        c.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${styles.deckContainer} ${styles.discardPileWrapper}`, children: discardPile.length > 0 && (() => {
        const topCard = discardPile[discardPile.length - 1];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `${styles.deckCardFront} ${styles.discardTopCard}`,
            style: { pointerEvents: "auto" },
            onMouseEnter: () => setIsDiscardHovered(true),
            onMouseLeave: () => setIsDiscardHovered(false),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { card: topCard }),
              topCard.description && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: styles.tooltip,
                  style: {
                    visibility: isDiscardHovered ? "visible" : "hidden",
                    opacity: isDiscardHovered ? 1 : 0,
                    zIndex: 9999
                  },
                  children: topCard.description
                }
              )
            ]
          },
          topCard.id
        );
      })() })
    ] })
  ] });
}
function Dice({ sides = 6, socket = null, diceId, roomId, onRoll }) {
  const [value, setValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const animRef = useRef(null);
  const rollEventName = useMemo(() => `dice:rolled:${roomId}:${diceId}`, [roomId, diceId]);
  useEffect(() => {
    if (!socket || !roomId) return;
    const handleRoll = (rolledValue) => {
      setRolling(true);
      const rollDuration = 1e3;
      const interval = 50;
      let count = 0;
      const times = rollDuration / interval;
      animRef.current = setInterval(() => {
        const animValue = Math.floor(Math.random() * sides) + 1;
        setValue(animValue);
        count++;
        if (count >= times) {
          clearInterval(animRef.current);
          animRef.current = null;
          setValue(rolledValue);
          setRolling(false);
          onRoll?.(rolledValue);
        }
      }, interval);
    };
    socket.on(rollEventName, handleRoll);
    return () => {
      socket.off(rollEventName, handleRoll);
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [socket, sides, diceId, roomId, onRoll, rollEventName]);
  const roll = () => {
    if (!socket || rolling) return;
    socket.emit("dice:roll", {
      roomId,
      diceId,
      sides
    });
  };
  const diceStyle = {
    width: "80px",
    height: "80px",
    border: "2px solid #333",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    cursor: rolling ? "not-allowed" : "pointer",
    userSelect: "none",
    backgroundColor: rolling ? "#ffeaa7" : "#fff",
    color: "#333",
    boxShadow: rolling ? "0 0 15px rgba(255, 107, 107, 0.7)" : "0 4px 6px rgba(0,0,0,0.3)",
    transition: "all 0.2s",
    fontFamily: "Inter, sans-serif"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: diceStyle,
      onClick: roll,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1em" }, children: value ?? "🎲" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.5rem", color: "#666" }, children: diceId })
      ]
    }
  );
}
function client_log(tag, ...args) {
  console.log(`[${tag}]`, ...args);
}
const CardDisplayContent$1 = ({ card: card2, isFaceUp }) => {
  if (!isFaceUp) {
    console.log(`[CardDisplayContent] Card ID: ${card2.id}, Name: ${card2.name} - isFaceUp is false. Not rendering.`);
    return null;
  }
  if (card2.frontImage) {
    console.log(`[CardDisplayContent] Card ID: ${card2.id}, Name: ${card2.name} - Rendering with frontImage: ${card2.frontImage}`);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: card2.frontImage,
        alt: card2.name,
        style: {
          width: "100%",
          height: "100%",
          objectFit: "contain"
        }
      }
    );
  }
  console.log(`[CardDisplayContent] Card ID: ${card2.id}, Name: ${card2.name} - Rendering with card.name (No frontImage).`);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: "5px",
        color: "#333"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { fontSize: "0.8em", wordBreak: "break-all", textAlign: "center" }, children: card2.name })
    }
  );
};
function PlayField({
  socket,
  roomId,
  deckId,
  name,
  is_logging = false
}) {
  const [playedCards, setPlayedCards] = React.useState([]);
  React.useEffect(() => {
    const handleUpdate = (data) => {
      const newCards = data.playFieldCards || [];
      if (is_logging) {
        client_log("playField", `[${deckId}] 場の状態を更新`);
        client_log("playField", `[${deckId}] 古いカード数: ${playedCards.length}, 新しいカード数: ${newCards.length}`);
        client_log("playField", `[${deckId}] 受信したカードリスト:`, newCards.map((c) => c.name));
      }
      console.log(`[PlayField] Deck ${deckId} - Received ${newCards.length} cards for rendering.`);
      setPlayedCards(newCards);
    };
    socket.on(`deck:update:${roomId}:${deckId}`, handleUpdate);
    return () => {
      socket.off(`deck:update:${roomId}:${deckId}`, handleUpdate);
    };
  }, [socket, roomId, deckId, playedCards.length]);
  const returnCardToOwnerHand = (card2) => {
    if (!card2.ownerId) {
      client_log("playField", `警告: ${card2.name} には所有者IDが設定されていません。手札に戻せません。`);
      return;
    }
    socket.emit("card:return-to-hand", {
      roomId,
      deckId: card2.deckId,
      cardId: card2.id,
      targetPlayerId: card2.ownerId
    });
    client_log("playField", `カード ${card2.name} を持ち主 ${card2.ownerId} の手札に戻すようリクエスト`);
  };
  console.log(`[PlayField] Deck ${deckId} - Start rendering ${playedCards.length} cards in the Play Area.`);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      style: {
        border: "2px dashed #ccc",
        borderRadius: "10px",
        padding: "12px",
        background: "#fafafa"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { style: { marginBottom: "8px" }, children: [
          "プレイエリア",
          name && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              style: {
                marginLeft: "10px",
                fontWeight: "normal",
                fontSize: "0.9em",
                color: "#666"
              },
              children: [
                "（",
                name,
                "）"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "120px" }, children: [
          playedCards.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { opacity: 0.6 }, children: "（まだカードが出ていません）" }),
          playedCards.map((card2) => {
            const isFaceUp = true;
            console.log(`[PlayField] Deck ${deckId} - Rendering Card ID: ${card2.id}, Name: ${card2.name} (isFaceUp: ${isFaceUp})`);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: styles.card,
                style: {
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                onDoubleClick: () => returnCardToOwnerHand(card2),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardDisplayContent$1, { card: card2, isFaceUp }),
                  card2.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles.tooltip, children: card2.description })
                ]
              },
              card2.id
            );
          })
        ] })
      ]
    }
  );
}
const CardDisplayContent = React.memo(({ card: card2, isFaceUp }) => {
  if (!isFaceUp) {
    console.log(`[CardDisplayContent] Card ID: ${card2.id}, Name: ${card2.name} - Not FaceUp. Rendering nothing.`);
    return null;
  }
  if (card2.frontImage) {
    console.log(`[CardDisplayContent] Card ID: ${card2.id}, Name: ${card2.name} - Rendering with frontImage: ${card2.frontImage}`);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: card2.frontImage,
        alt: card2.name,
        style: { width: "100%", height: "100%", objectFit: "contain" }
      }
    );
  }
  console.log(`[CardDisplayContent] Card ID: ${card2.id}, Name: ${card2.name} - Rendering with card.name (No frontImage).`);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    padding: "5px",
    color: "#333"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { fontSize: "0.8em", wordBreak: "break-all", textAlign: "center" }, children: card2.name }) });
});
const TokenDisplayContent = React.memo(({ tokens, socket, roomId, myPlayerId, playerIdBeingDisplayed }) => {
  const isMyToken = myPlayerId === playerIdBeingDisplayed;
  if (!tokens || tokens.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid #ddd"
  }, children: tokens.map((token) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      title: isMyToken ? `クリックして再獲得: ${token.name}` : token.name,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: "50%",
        width: "48px",
        height: "48px",
        fontSize: "0.75em",
        fontWeight: "bold",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        cursor: isMyToken ? "pointer" : "default",
        opacity: isMyToken ? 1 : 0.7,
        flexShrink: 0,
        padding: "2px"
      },
      onClick: () => {
        if (!isMyToken) return;
        socket.emit("token:reclaim", {
          roomId,
          playerId: myPlayerId,
          tokenId: token.id
        });
      },
      children: token.name
    },
    token.id
  )) });
});
const PlayerListItem = React.memo(({
  player,
  currentPlayerId,
  myPlayerId,
  selectedCards,
  toggleCardSelection,
  socket,
  roomId
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "li",
    {
      style: {
        padding: "6px 12px",
        marginBottom: "6px",
        borderRadius: "4px",
        backgroundColor: player.id === currentPlayerId ? "#a0e7ff" : "#f5f5f5",
        fontWeight: player.id === currentPlayerId ? "bold" : "normal"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "1.1em", color: "#333" }, children: [
            player.id === currentPlayerId && "ᐅ ",
            player.id === myPlayerId && "★ ME ",
            player.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "1.2em" }, children: [
            "スコア: ",
            player.score
          ] })
        ] }),
        player.resources?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "4px", marginBottom: "8px", fontSize: "0.9em", color: "#333" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", marginBottom: "4px" }, children: "リソース:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px" }, children: player.resources.map((resource) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              title: resource.name,
              style: {
                padding: "4px 8px",
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
                whiteSpace: "nowrap"
              },
              children: [
                resource.icon,
                " ",
                resource.name,
                ": ",
                resource.currentValue,
                " / ",
                resource.maxValue
              ]
            },
            resource.id
          )) })
        ] }),
        player.tokens?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          TokenDisplayContent,
          {
            tokens: player.tokens,
            socket,
            roomId,
            myPlayerId,
            playerIdBeingDisplayed: player.id
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: player.cards.map((card2) => {
          const isFaceUp = !!card2.isFaceUp && player.id === myPlayerId;
          const isSelected = selectedCards.includes(card2.id);
          const cardClassName = isFaceUp ? styles.card : styles.cardBack;
          console.log(`[PlayerListItem] Player: ${player.name}, Card ID: ${card2.id}, Name: ${card2.name} - isFaceUp: ${isFaceUp}, Class: ${cardClassName}`);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cardClassName,
              style: {
                position: "relative",
                cursor: isFaceUp ? "pointer" : "default",
                backgroundColor: isFaceUp ? void 0 : card2.backColor,
                border: isSelected ? "2px solid gold" : "none",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              },
              onClick: () => toggleCardSelection(card2.id, isFaceUp),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDisplayContent, { card: card2, isFaceUp }),
                isFaceUp && card2.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles.tooltip, children: card2.description })
              ]
            },
            card2.id
          );
        }) })
      ]
    },
    player.id
  );
});
function ScoreBoard({
  socket,
  players,
  currentPlayerId,
  myPlayerId,
  roomId,
  backColor = "#000000ff"
}) {
  const displayedPlayers = React.useMemo(() => {
    return (players || []).map((p) => ({
      ...p,
      score: p.score ?? 0,
      cards: p.cards ?? [],
      resources: p.resources ?? [],
      tokens: p.tokens ?? []
    }));
  }, [players]);
  const [selectedCards, setSelectedCards] = React.useState([]);
  const toggleCardSelection = React.useCallback((cardId, isFaceUp) => {
    if (!isFaceUp) return;
    setSelectedCards(
      (prev) => prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  }, []);
  const playSelectedCards = React.useCallback(() => {
    if (selectedCards.length === 0 || !myPlayerId) return;
    const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
    if (!myPlayer) return;
    const cardsByDeck = {};
    let targetPlayLocation;
    selectedCards.forEach((cardId) => {
      const card2 = myPlayer.cards.find((c) => c.id === cardId);
      if (!card2) return;
      if (!targetPlayLocation) {
        targetPlayLocation = card2.playLocation;
      }
      if (!cardsByDeck[card2.deckId]) cardsByDeck[card2.deckId] = [];
      cardsByDeck[card2.deckId].push(card2.id);
    });
    if (!targetPlayLocation) return;
    Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
      socket.emit("card:play", {
        roomId,
        deckId,
        cardIds,
        playerId: myPlayerId,
        playLocation: targetPlayLocation
      });
    });
    setSelectedCards([]);
  }, [selectedCards, myPlayerId, displayedPlayers, socket, roomId]);
  const nextTurn = React.useCallback(() => {
    socket.emit("game:next-turn", { roomId });
  }, [socket, roomId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    padding: "16px",
    border: "1px solid #333",
    borderRadius: "12px",
    backgroundColor: "#f9f9f9",
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.5em", marginBottom: "12px", borderBottom: "2px solid #ddd", paddingBottom: "8px" }, children: "ゲームスコアボード" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { listStyle: "none", padding: 0 }, children: displayedPlayers.map((player) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      PlayerListItem,
      {
        player,
        currentPlayerId,
        myPlayerId,
        selectedCards,
        toggleCardSelection,
        socket,
        roomId
      },
      player.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "12px", display: "flex", gap: "6px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: playSelectedCards, disabled: selectedCards.length === 0, children: "選択カードを出す" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: nextTurn, children: "次のターン" })
    ] })
  ] });
}
function Timer({ socket = null, onFinish, roomId }) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (!socket || !roomId) return;
    const handleStart = (data) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(data.duration);
    };
    const handleUpdate = (data) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(data.remaining);
      if (data.remaining <= 0) onFinish?.();
    };
    socket.on("timer:start", handleStart);
    socket.on("timer:update", handleUpdate);
    return () => {
      socket.off("timer:start", handleStart);
      socket.off("timer:update", handleUpdate);
    };
  }, [socket, roomId, onFinish]);
  const start = () => {
    if (!socket || !roomId) return;
    socket.emit("timer:start", { duration: 30, roomId });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        width: "300px",
        height: "80px",
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: timeLeft !== null ? timeLeft <= 6 ? "red" : timeLeft <= 15 ? "orange" : "green" : "gray",
              transition: "color 0.5s ease"
            },
            children: [
              "残り時間: ",
              timeLeft ?? "-",
              "s"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: start, style: { marginRight: "4px" }, children: "開始" }) })
      ]
    }
  );
}
const TokenContent = React__default.memo(({ token }) => {
  if (token.imageSrc) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: token.imageSrc,
        alt: token.name,
        style: {
          width: "100%",
          height: "100%",
          objectFit: "contain"
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    padding: "5px"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { fontSize: "1em", wordBreak: "break-all", textAlign: "center" }, children: token.name }) });
});
function TokenStore({ socket, roomId, tokenStoreId, name, onSelect }) {
  const [tokens, setTokens] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const handleInitTokens = useCallback((initialTokens) => {
    console.log(`TokenStore (${tokenStoreId}): 初期情報を受信しました。`, initialTokens);
    setTokens(initialTokens && initialTokens.length > 0 ? initialTokens : []);
  }, [tokenStoreId]);
  const handleUpdateTokens = useCallback((updatedTokens) => {
    console.log(`TokenStore (${tokenStoreId}): 更新情報を受信しました。`, updatedTokens);
    setTokens(updatedTokens || []);
  }, [tokenStoreId]);
  useEffect(() => {
    if (!socket) {
      console.warn("TokenStore: Socket connection is not available. UI remains empty.");
      return;
    }
    const INIT_EVENT = `token-store:init:${roomId}:${tokenStoreId}`;
    const UPDATE_EVENT = `token-store:update:${roomId}:${tokenStoreId}`;
    socket.on(INIT_EVENT, handleInitTokens);
    socket.on(UPDATE_EVENT, handleUpdateTokens);
    console.log(`TokenStore (${tokenStoreId}): リスナーを登録しました。`);
    return () => {
      socket.off(INIT_EVENT, handleInitTokens);
      socket.off(UPDATE_EVENT, handleUpdateTokens);
      console.log(`TokenStore (${tokenStoreId}): リスナーを解除しました。`);
    };
  }, [socket, roomId, tokenStoreId, handleInitTokens, handleUpdateTokens]);
  const getTokenById = useMemo(
    () => (id) => tokens.find((t) => t.id === id),
    [tokens]
  );
  const handleClick = (id) => {
    const token = getTokenById(id);
    if (!token) return;
    setSelectedId(id);
    onSelect?.(token);
  };
  const handleDoubleClick = (id) => {
    const token = getTokenById(id);
    if (!token) return;
    const payload = {
      roomId,
      // ⭐ 追加
      tokenStoreId,
      tokenId: id,
      tokenName: token.name
    };
    console.log(`[TokenStore] ダブルクリック: トークン獲得イベント 'game:acquire-token' を送信`, payload);
    socket.emit("game:acquire-token", payload);
    setSelectedId(null);
  };
  const TOKEN_SIZE = "40px";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      style: {
        backgroundColor: "#dededeff",
        padding: "10px",
        margin: "15px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { marginBottom: "10px", color: "#333" }, children: name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: tokens.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            onClick: () => handleClick(t.id),
            onDoubleClick: () => handleDoubleClick(t.id),
            style: {
              padding: "8px",
              width: TOKEN_SIZE,
              height: TOKEN_SIZE,
              borderRadius: "50%",
              border: selectedId === t.id ? "2px solid #f6fbd1ff" : "2px solid #ccc",
              backgroundColor: "#4f4848ff",
              cursor: "pointer",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              alignItems: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: {
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(TokenContent, { token: t })
              }
            )
          },
          t.id
        )) })
      ]
    }
  );
}
export {
  Board,
  Deck,
  Dice,
  PlayField,
  ScoreBoard,
  Timer,
  TokenStore
};
