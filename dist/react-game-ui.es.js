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
const styles$6 = {
  boardContainer,
  cell
};
const Cell = ({
  // ⭐ [修正 1]: ジェネリクスをコンポーネント定義時に適用 (Trailing Commaが必要)
  locationData,
  cellData,
  onClick,
  onDoubleClick,
  children,
  onDrop,
  onDragOver,
  changed = false
}) => {
  const handleClick = () => {
    onClick(locationData);
  };
  const handleDoubleClick = () => {
    onDoubleClick(locationData);
  };
  const effectiveBackgroundColor = changed ? cellData.changedColor : cellData.backgroundColor;
  const cellStyle = {
    backgroundColor: effectiveBackgroundColor
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: styles$6.cell,
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      onDrop,
      onDragOver,
      style: cellStyle,
      children
    }
  );
};
const card = "_card_1mv54_3";
const tooltip$2 = "_tooltip_1mv54_23";
const deckContainer = "_deckContainer_1mv54_59";
const deckCard = "_deckCard_1mv54_66";
const deckCardFront = "_deckCardFront_1mv54_78";
const deckSection = "_deckSection_1mv54_95";
const discardPileWrapper = "_discardPileWrapper_1mv54_103";
const styles$5 = {
  card,
  tooltip: tooltip$2,
  deckContainer,
  deckCard,
  deckCardFront,
  deckSection,
  discardPileWrapper
};
const cardImage$1 = "_cardImage_1s9db_1";
const cardNameWrapper = "_cardNameWrapper_1s9db_7";
const cardNameText$1 = "_cardNameText_1s9db_18";
const deckTitle = "_deckTitle_1s9db_24";
const deckWrapperFlex = "_deckWrapperFlex_1s9db_29";
const tooltipBase = "_tooltipBase_1s9db_34";
const deckStyles = {
  cardImage: cardImage$1,
  cardNameWrapper,
  cardNameText: cardNameText$1,
  deckTitle,
  deckWrapperFlex,
  tooltipBase
};
const CardContent = ({ card: card2 }) => {
  if (!card2.isFaceUp) return null;
  if (card2.frontImage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: card2.frontImage,
        alt: card2.name,
        className: deckStyles.cardImage
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: deckStyles.cardNameWrapper, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: deckStyles.cardNameText, children: card2.name }) });
};
function Deck({
  socket,
  roomId,
  deckId,
  name,
  playerId = null
}) {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: styles$5.deckSection, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: deckStyles.deckTitle, children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles$5.deckControls, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: shuffle, children: "シャッフル" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: resetDeck, children: "山札に戻す" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `${styles$5.deckWrapper} ${deckStyles.deckWrapperFlex}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$5.deckContainer, onClick: draw, children: deckCards.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: styles$5.deckCard,
              style: {
                zIndex: deckCards.length - i,
                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
                backgroundColor: c.backColor
              }
            },
            c.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$5.deckContainer, children: drawnCards.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: styles$5.deckCardFront,
              style: {
                zIndex: i + 1,
                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { card: c })
            },
            c.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `${styles$5.deckContainer} ${styles$5.discardPileWrapper}`,
              children: discardPile.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: styles$5.deckCardFront,
                  style: {
                    zIndex: i + 1,
                    transform: `translate(${i * -0.3}px, ${i * -0.3}px)`,
                    pointerEvents: i === discardPile.length - 1 ? "auto" : "none"
                  },
                  onMouseEnter: () => i === discardPile.length - 1 && setIsDiscardHovered(true),
                  onMouseLeave: () => i === discardPile.length - 1 && setIsDiscardHovered(false),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { card: c }),
                    i === discardPile.length - 1 && c.description && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `${styles$5.tooltip} ${deckStyles.tooltipBase}`,
                        style: {
                          visibility: isDiscardHovered ? "visible" : "hidden",
                          opacity: isDiscardHovered ? 1 : 0
                        },
                        children: c.description
                      }
                    )
                  ]
                },
                c.id
              ))
            }
          )
        ]
      }
    )
  ] });
}
const diceWrapper = "_diceWrapper_1yy8i_1";
const diceTitle = "_diceTitle_1yy8i_9";
const dice = "_dice_1yy8i_1";
const tooltip$1 = "_tooltip_1yy8i_41";
const diceRolling = "_diceRolling_1yy8i_69";
const diceNotRolling = "_diceNotRolling_1yy8i_74";
const faceImage = "_faceImage_1yy8i_78";
const faceContainer = "_faceContainer_1yy8i_85";
const defaultText = "_defaultText_1yy8i_93";
const styles$4 = {
  diceWrapper,
  diceTitle,
  dice,
  tooltip: tooltip$1,
  diceRolling,
  diceNotRolling,
  faceImage,
  faceContainer,
  defaultText
};
const dice1Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTA0PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjE5NTczMDkzLWQ2ODktNDQ4MC1hZDY3LTBjMWY0Mzg4OGNhZDwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5kaWNlIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0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";
const dice2Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAIAAABEtEjdAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTExLTAzPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjg2ZjU1OWI2LWYwMDAtNDI0Zi1iOTg2LTk3NTZmZDYxYzQyMTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5kaWNlIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICA8cGRmOkF1dGhvcj7okKnljp/llZPlpKo8L3BkZjpBdXRob3I+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSAoUmVuZGVyZXIpIGRvYz1EQUdwYmdkTTlKZyB1c2VyPVVBR01aLU9nS3VRIGJyYW5kPUJBR01aME01UjVnIHRlbXBsYXRlPTwveG1wOkNyZWF0b3JUb29sPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3InPz5Co481AAAaA0lEQVR4nOzdX2jV9R/H8bOznZ2xkq3p2QRbSOF2QGYzZJxdnXOcmJO2NmjOzEC8GKVFdhHZhX8mSwsCQSiC2V8RzoiiwGFads7sYmNFW39OzYkknaDpSbeQYzvbPOd3UZS/mOW+53u+73Pe3+fjfjsvvhdPP37P2fcUpNNpBwBAF6f0AACA+Yg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgEJF0gOQqdnZ2Xg8nkgkZm7icDiKb1JaWurxeIqLi6XHArAIcc8/33333cDAwOjo6Pj4+Pnz53/55Zfb/MHKysqampra2tq6ujq/319fX5/VnQAEFaTTaekN+A/pdPr777+PRCKRSGRgYCAej5vyaz0ej9/vDwaDwWDQ6/UWFBSY8msB5ALintN+/fXXvr6+48ePDw4OZvWFGhsbH3/88Y6OjiVLlmT1hQBYg7jnounp6Q8++OD48eOnT5+em5uz7HWLiooefPDBrVu3trW1lZSUWPa6AExH3HPLjRs3QqHQyy+//O233wrOWLVq1e7duzdt2lRYWCg4A4BhxD1XJJPJN95445VXXvnxxx+lt/zp3nvvfe6557Zt28YpHsg7xD0nfPbZZ11dXRcuXJAeMo/q6urXXnvtoYcekh4CYAH4IyZhExMTjz76aFNTU26W3eFwxGKxlpaWlpaWWCwmvQXA7eLkLunDDz/cvn375OSk9JDbctddd7355pttbW3SQwD8N07uMqanp5944on29vZ8KbvD4ZicnGxvb9+xY8f09LT0FgD/gZO7gGg02tnZGY1GpYcYtHLlyr6+vpUrV0oPAXBLxN1q4XC4paUlkUhID8nIHXfcEQqFeJcVyFnclrFUKBRqbm7O97I7HI5EItHe3h4KhaSHAJgfcbdOb2/vli1bksmk9BBzzM3Nbdmypbe3V3oIgHkQd4v09PR0dXUpuwmWTqe7uroOHjwoPQTAP3HP3Qr79+/v7u6WXpFFzz///EsvvSS9AsDfiHvWvf76608++aT0iqw7fPjwrl27pFcA+BNxz64TJ048/PDDqVRKekjWOZ3Od955Z+vWrdJDADgcxD2rIpFIc3Ozff7kp6io6NSpU2vXrpUeAoC4Z83FixdXr149NTUlPcRS5eXlIyMjy5cvlx4C2B2flsmKVCq1adMmu5Xd4XBMTU11dnb+8Q3dAAQR96w4cODAF198Ib1CxvDw8N69e6VXAHbHbRnzhcPhdevW2eFN1FtxOp2nT59uamqSHgLYF3E3WTKZXLFiBY8+r66ujkajixYtkh4C2BS3ZUx26NAhyu5wOGKx2Isvvii9ArAvTu5mOnfu3P3336/m6TEZcrvdo6OjXq9XeghgR5zczfTMM89Q9r8kk0n+ZhWQwsndNJFIJBgMSq/IOeFwOBAISK8AbIeTu2l4cta89u/fLz0BsCNO7ub46quv1qxZw8Wc1+DgoM/nk14B2Asnd3McOHCAst8K/6cBrMfJ3QTnz5+vra3lSt5KQUHB8PDwmjVrpIcANsLJ3QSvvvoqZf8X6XT66NGj0isAe+HknqnZ2dlly5bF43HpITmtqqoqFou5XC7pIYBdcHLPVH9/P2X/T5cuXerv75deAdgIcc9UKBSSnpAf3n77bekJgI1wWyYjiUSiqqoqkUhID8kDLpfrypUrPEoMsAYn94x88sknlP02zc7OnjlzRnoFYBfEPSORSER6Qj7hcgGWIe4ZoVYLwuUCLMM9d+OuXr3q8Xjs/I1LC+V0Oi9fvrx48WLpIYB+nNyNO3v2LGVfkFQq9fnnn0uvAGyBuBs3OjoqPSH/DA0NSU8AbIG4Gzc2NiY9If9w0QBrEHfj6JQBFy9elJ4A2AJvqBpXXl7+22+/Sa/IM2VlZVNTU9IrAP2Iu0G///57aWmp9Iq8lEgkuHRAtnFbxiC+CNuw69evS08A9CPuBs3MzEhPyFc3btyQngDoR9wNIu6GcekACxB3gzh+GsYdLcACxN0g4m4Ylw6wAHGH1Yg7YAHiblBhYaH0hHxVXFwsPQHQj7gbRNwNc7vd0hMA/Yi7QRw/DePSARYg7gZxcjeMSwdYgLgbxBc9G8azBwALEHeDiouLy8rKpFfkn7KyMuIOWIC4G+f1eqUn5J/ly5dLTwBsgbgbR9wN4KIB1iDuxnEINYC4A9Yg7sbV19dLT8g/XDTAGnxZh3FXrlyprKxMpVLSQ/KG0+mMx+MVFRXSQwD9OLkbt3jx4rq6OukV+aSuro6yA9Yg7hkJBALSE/IJlwuwDHHPCLVaEC4XYBnuuWfk2rVry5Ytu3btmvSQPOByua5evXrnnXdKDwFsgZN7RhYtWrRx40bpFflh48aNlB2wDHHP1ObNm6Un5Idt27ZJTwBshNsymZqdna2urr506ZL0kJxWWVn5888/u1wu6SGAXXByz5TL5Wpra5Nekeva29spO2AlTu4mGB8f93q9XMlbKSgo+PLLLx944AHpIYCNcHI3QU1NTWtrq/SK3NXa2krZAYtxcjfH0NBQY2Oj9IocNTg46PP5pFcA9sLJ3Rw+n8/v90uvyEV+v5+yA9Yj7qbZvXu39IRcxGUBRHBbxkzr1q07c+aM9IocEggEwuGw9ArAjoi7mcbGxurr65PJpPSQnOB2u7/++uva2lrpIYAdcVvGTF6vl7sQf9m1axdlB6RwcjdZMplcsWJFLBaTHiLs7rvv/uGHH3iYDCCFk7vJ3G73W2+95XTa+sI6nc53332XsgOCbN2gLGlqatqzZ4/0Ckl79uwJBoPSKwBb47ZMVqRSqfXr19vzkzPBYPDTTz+1+f9dAHHEPVsmJiZWr149MTEhPcRS5eXlY2NjVVVV0kMAu+N4lS1Lly796KOPSkpKpIdYp6Sk5P3336fsQC4g7lnU0NDQ19dnkxsUTqezr69v7dq10kMAOBzEPdtaW1uPHDkivcIKR44c4dGYQO4g7lm3c+fOffv2Sa/Irn379u3cuVN6BYC/8YaqRXp6erR+PrK7u3vv3r3SKwD8H+Jund7e3h07dszNzUkPMU1BQcHRo0e3b98uPQTAPxF3S504ceKRRx7R8WQxt9t97Nixjo4O6SEA5kHcrTY8PNzR0fHTTz9JD8nIPffc89577zU0NEgPATA/3lC1WkNDw8jISHNzs/QQ45qbm0dGRig7kMuIu4CKior+/v6DBw8WFhZKb1mYwsLCnp6e/v7+iooK6S0A/g23ZSQNDAxs3rw5Xx5RsHTp0lAoxFfFAnmBk7skv98fjUaffvrpoqIi6S3/pqio6KmnnopGo5QdyBec3HPC2NjYs88++/HHH0sPmceGDRsOHz7s9XqlhwBYAE7uOcHr9Z48eTIcDgcCAektf/vj661PnjxJ2YG8w8k950Qike7u7kgkIrjB5/MdOnQop/6lAbAgxD1HRSKRF154YWhoyOLX9fl83d3d69evt/h1AZiLuOe0ycnJUCh07NixwcHBrL5QY2PjY4891tnZuWTJkqy+EABrEPf8cOHChVOnToXD4YGBgXg8bsrv9Hg8fr8/EAhs2LDhvvvuM+V3AsgRxD3/jI6Onj179ptvvjl37tz4+Pjly5dv8wcrKytrampqampWrVrl9/vr6+uzuhOAIOKe92ZmZuLx+PXr12du4nA4im9SWlrq8XiKi4ulxwKwCHEHAIX4nDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhf4HAAD//+3df0jd9R7H8bOjx2M5ZypnNmIxGnOGrm0g5vnrnDMjmjDJfs3chNEfRatF++Mw/xmtolxgMCIKNmpBjRSpsVIKS44a4bAf042ROiTpFC1dTjjTOh713D/upTu41V1Hz+f9/bzP8/H/PC8O8+nHj8cjcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWypQcAMGp+fn5qampubm7+Oi6XK+c6eXl5Pp/P4/FIj0XqiDug3NDQUF9f3/nz58fGxsbGxiYnJ2/wH65bt660tLS0tHTr1q2BQKCioiKtO7GyViWTSekNAFZSMpk8f/58b29vb29vf3//9PT0inxYn88XCARCoVAoFLrzzjtX5GMifYg7oMeVK1fa29tPnTo1MDCQ1gfy+/1NTU0NDQ2FhYVpfSCkjLgD1pudnT1z5sypU6e6u7sXFhaMPW5OTk5tbW1TU1NtbW1ubq6xx8WNIO6AxRYXF9va2l555ZULFy4Izrjrrruam5t3797tdvMCPKcg7oCV4vH4W2+91dra+v3330tv+Y+ysrJDhw7t2bOHl9k4AXEH7NPZ2bl///5oNCo95E9s3Ljx+PHjO3bskB6S6fgeCrBJNBrdtWvXrl27nFl2l8s1Pj5eU1PT2Nh4+fJl6S0ZjZM7YI333nvvmWeeuXr1qvSQG1JYWPj222/ff//90kMyFCd3wALXrl1rampqamqypewul+vq1av19fX79+///fffpbdkIk7ugNN98803u3fvHh8flx6SovLy8vb29vLycukhmYW4A47W2dnZ0NAwOzsrPWRZ8vLyPv7441AoJD0kg3AtAzhXW1tbfX297WV3uVyzs7M7d+5sa2uTHpJBiDvgUK2trY2NjSZ/4zSt4vF4Y2PjiRMnpIdkCuIOOFE4HA6Hw8puTZPJ5OOPP97a2io9JCMQd8BxmpubFRcwHA4fOXJEeoV+/EAVcJZjx44dPHhQekXavf7660899ZT0Cs2IO+Ag77///t69e5eWlqSHpJ3b7T59+nRdXZ30ELWIO+AUnZ2d9fX1an6C+n/l5uZ2dXXxLjRpQtwBR5iYmNi+ffvMzIz0EKNuueWW77777tZbb5UeohA/UAXkJRKJRx55JNPK7nK5ZmZmMuQayjziDsgLh8NfffWV9AoZPT09L7zwgvQKhbiWAYSdOXMmw9860e12d3d319TUSA9RhbgDkmKxWHl5uWPfnN2Y9evXX7p0yev1Sg/Rg2sZQNJLL71E2V0uVzQabWlpkV6hCid3QMzo6OjWrVvj8bj0EEfwer2XLl1av3699BAlOLkDYp588knK/od4PH7gwAHpFXpwcgdk9Pb28v7m/ysSiQSDQekVGnByB2Tw5ll/6ujRo9ITlODkDgg4e/as3++XXuFEq1atGhwcrKyslB5iPU7ugADOp38lmUwqfrtjkzi5A6Z9++23lZWVfOr9lezs7IsXL5aWlkoPsRsnd8C01157jbL/jYWFhTfeeEN6hfU4uQNGJRKJwsJCBX/zOq1KSkqi0ajH45EeYjFO7oBRXV1dlP3/+uWXX3p6eqRX2I24A0a988470hPs0NbWJj3BblzLAOZMTU3ddtttiURCeogF8vPzf/rpp/z8fOkhtuLkDpjz5ZdfUvYbFIvFuJlZDuIOmNPb2ys9wSY8XctB3AFzqNU/wtO1HNy5A4ZMT0/7fD7+XuiNc7vdk5OTxcXF0kOsxMkdMKS/v5+y/yNLS0tffPGF9ApbEXfAkLNnz0pPsM/Q0JD0BFsRd8CQkZER6Qn2mZiYkJ5gK+IOGEKnUsBXxJTxA1XAhGQyuWbNmmvXrkkPsUxBQcHMzIz0CisRd8CEWCy2Zs0a6RVWisfjOTk50ivsw7UMYMLc3Jz0BFv99ttv0hOsRNwBExYXF6Un2Coej0tPsBJxB0xYWFiQnmArvi6mhrgDJszPz0tPsBVxTw1xB0zgbiFlfF1MDXEHAIWIO2CC1+uVnmCrrKws6QlWIu6ACbxSO2XEPTXEHTAhOztbeoKt+LqYGuIOmMDxM2XcaKWGuAMm8IeeU3bTTTdJT7AScQdMuPnmmwsKCqRX2KegoIBrmdQQd8CQDRs2SE+wT1lZmfQEWxF3wBA6lQKetJQRd8AQOpUCvt1JGXEHDNm2bZv0BPvwpKWMP9YBGPLrr7+uXbt2aWlJeog13G731NRUUVGR9BArcXIHDCkuLt6yZYv0Cpts2bKFsqeMuAPmBINB6Qk24elaDuIOmFNdXS09wSbEfTm4cwfMicVixcXFiURCeogFVq9e/fPPP69evVp6iK04uQPm5Ofn19bWSq+ww4MPPkjZl4O4A0bt27dPeoIdGhoapCfYjWsZwKhEIlFcXByLxaSHONratWt//PFHj8cjPcRinNwBozwezwMPPCC9wukeffRRyr5MnNwB077++uuqqio+9f7KqlWrRkdHN23aJD3EbpzcAdMqKyvvvfde6RXOVVdXR9mXj7gDApqbm6UnOBdPzoog7oCAYDB49913S69wokAgwK96rQjiDsjgfPqnjhw5Ij1BCX6gCoi55557enp6pFc4SDAYjEQi0iuUIO6AmJGRkYqKisXFRekhjuD1eoeHhzdv3iw9RAmuZQAxZWVlTz/9tPQKp2hubqbsK4iTOyApFouVl5dHo1HpIcI2b948PDzs9Xqlh+jByR2QlJ+ff/LkSbc7oz8T3W73m2++SdlXVkb/lwKcoKam5vDhw9IrJB0+fDgUCkmv0IZrGUDe0tKS3+8fHByUHiIgFAp9/vnnGf69SzoQd8ARJiYmtm/fPjMzIz3EqJKSkuHh4ZKSEukhCvHVEnCEDRs2fPDBB7m5udJDzMnNzf3oo48oe5oQd8ApduzY0d7eniEXFNnZ2e3t7VVVVdJD1MqI/0aALerq6l599VXpFSacPHmyrq5OeoVmxB1wlmefffbQoUPSK9KrpaVl79690iuUI+6A4xw9evTFF1+UXpEuzz//PG+aZgCvlgEc6sSJE0888YSmz9CsrKzjx48/9thj0kMyAnEHnKutrW3fvn3xeFx6yArwer2nT5/euXOn9JBMQdwBRxscHHz44Yd/+OEH6SHLcvvtt3d0dPDaGJO4cwccraqq6ty5c1YfeB966KFz585RdsOIO+B0RUVFXV1dL7/8clZWlvSWfyYnJ+fYsWMdHR1FRUXSWzIO1zKANfr6+hoaGi5fviw95IZwFSOLkztgjUAgcPHixQMHDmRnZ0tv+TterzccDnMVI4uTO2CfkZGRgwcPfvrpp9JD/kR9fX1ra+sdd9whPSTTcXIH7FNWVvbJJ59EIpHq6mrpLf/17z9v/eGHH1J2JyDugK2CweDAwEB3d7ff7xdfEolEIpFIMBiUXYI/cC0DaPDZZ58999xzAwMDhh+3urq6paWFpjsQcQf0uHLlSkdHx7vvvpvuyvv9/j179jQ2NhYWFqb1gZAy4g4oND4+3tXVFYlE+vv7p6enV+Rj+ny+QCAQDAbvu+++jRs3rsjHRPoQd0C5oaGhvr6+CxcujI6Ojo2NTU5O3uA/XLdu3aZNm0pLS7dt2xYIBCoqKtK6EyuLuAOZZX5+fmpqam5ubv46Lpcr5zp5eXk+n8/j8UiPReqIOwAoxEshAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCgEHEHAIWIOwAoRNwBQCHiDgAKEXcAUIi4A4BCxB0AFCLuAKAQcQcAhYg7AChE3AFAIeIOAAoRdwBQiLgDgELEHQAUIu4AoBBxBwCFiDsAKETcAUAh4g4AChF3AFCIuAOAQsQdABQi7gCg0L8AzgdOcp4R30UAAAAASUVORK5CYII=";
const dice3Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTA0PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjAzMmJiN2NjLWVlMGEtNDM0Yi1hYWJhLTZjMDI4OGE4N2RmYjwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5kaWNlIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0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";
const dice4Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTA0PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmE2YjQ3MzVmLTgxNWYtNDIwMC1iN2MyLTZhNjgzYWMwOWQ0YTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5kaWNlIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0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";
const dice5Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTA0PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmZiNTRiNDI4LWI1YzYtNDhjNi1iZDBjLWRmMjNiODBlMTc1ODwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5kaWNlIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICA8cGRmOkF1dGhvcj7okKnljp/llZPlpKo8L3BkZjpBdXRob3I+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSAoUmVuZGVyZXIpIGRvYz1EQUdwYmdkTTlKZyB1c2VyPVVBR01aLU9nS3VRIGJyYW5kPUJBR01aME01UjVnIHRlbXBsYXRlPTwveG1wOkNyZWF0b3JUb29sPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3InPz490pVdAAAtYUlEQVR4nOzdfUyV5R/H8c8BOYoVbCpKJ5ZnuRJ79JQKkj24pT0sFXRqT1trubLVYs0sS9TSzB62svojbaWrZa3RRIxC29JcZtJkEJais6JQ1NQmrMSOwPn98StXv36Wyn343vfF+7XxJ+d8du26rs993ecplEgkEgIAAIGWYh0AAAB0HoUOAIADKHQAABxAoQMA4AAKHQAAB1DoAAA4gEIHAMABFDoAAA6g0AEAcACFDgCAAyh0AAAcQKEDAOAACh0AAAdQ6AAAOIBCBwDAARQ6AAAOoNABAHAAhQ4AgAModAAAHEChAwDgAAodAAAHUOgAADiAQgcAwAEUOgAADqDQAQBwAIUOAIADKHQAABxAoQMA4AAKHQAAB1DoAAA4gEIHAMABFDoAAA6g0AEAcACFDgCAAyh0AAAcQKEDAOAACh0AAAdQ6AAAOIBCBwDAARQ6AAAOoNABAHAAhQ4AgAModAAAHEChAwDgAAodAAAHUOgAADiAQgcAwAEUOgAADqDQAQBwAIUOAIADKHQAABxAoQMA4AAKHQAAB1DoAAA4gEIHAMABFDoAAA6g0AEAcACFDgCAAyh0AAAcQKEDAOAACh0AAAdQ6AAAOIBCBwDAARQ6AAAOoNABAHAAhQ4AgAModAAAHEChAwDgAAodAAAHUOgAADiAQgcAwAEUOgAADqDQAQBwAIUOAIADKHQAABxAoQMA4AAKHQAAB1DoAAA4gEIHAMABFDoAAA6g0AEAcEAP6wDoOseOHVM8HldbW5vS0tIUDofVowdTAHBFW1ub4vG4jh07ph49eigcDistLc06FroIu7lDfv31V1VWVqq6ulp79uzR/v37j//t27fvhP937rnnasCAAcf/cnJyNHr0aF1zzTVdmB7Ayfj000+1fv167d69+y9rvLGx8YT/k52drezs7ONrPBKJaNiwYbr++ut15plndmF6JFMokUgkrEPg9B08eFBlZWVatWqVPvnkE/3222+ePXafPn00btw4FRYWauzYserdu7dnjw3g5LS2tqqyslLl5eWqqKjQzz//7Nlj9+zZU9ddd50KCws1fvx49e/f37PHRtej0APohx9+UGlpqVatWqUvvvhCHR0dSX/O3r17a+zYsSosLNS4cePUp0+fpD8n0F0dPHhQFRUVWrVqlT7++GO1trYm/TlTUlJUUFCgwsJCFRYWatCgQUl/TniLQg+Qbdu26dFHH1VFRYVpjh49eujuu+/W3LlzFYlETLMALtm7d6/mzZun5cuXq62tzTTLuHHj9PTTT+viiy82zYGTR6EHwI8//qiSkhKtWLGiS07jJys9PV3FxcV6/PHHddZZZ1nHAQLr8OHDWrRokV555ZUuOY2frJSUFN1xxx168sknFY1GrePgX1DoPnbw4EEtWLBAS5YsUTwet45zQllZWZozZ47uvfdehcNh6zhAYLS2tuqll17Ss88+q8OHD1vHOaFwOKz77rtPs2fPVlZWlnUcnACF7kOHDx/Wiy++qBdeeEG//PKLdZyTFo1GtWDBAt12221KSeErDoATaWtr0xtvvKH58+erqanJOs5JO+uss/Twww/roYce4q6cD1HoPlNTU6OJEyeqoaHBOsppKygo0OrVq9W3b1/rKIDvHDp0SOPHj9emTZuso5y2aDSqlStXKhaLWUfBn3CM8pHy8nKNGjUq0GUuSZs2bdKwYcNUX19vHQXwlfr6eg0bNizQZS5JDQ0NGjVqlMrLy62j4E8odB9IJBJ66qmnVFRUpCNHjljH8URDQ4Py8vJY8MDvysvLlZeXF/gL9j8cOXJERUVFWrhwoXUU/I5CN/bHopgzZ45ce/WjpaWFBQ9Ixy/YW1parKN4KpFIqKSkRHfccYczh5Eg4zV0Q01NTbr55ptVU1NjHSXpbr/9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8cXaunWrdQzglLS3tysWizF3T0KvXr30ww8/qH///tZRnMUJPYkGDBig4uJi6xiB8Pzzz1tHAE5Zamqq5s+fbx0jEIqLiynzJOOEnmTNzc0aOHCgmpubraP41jXXXKNPP/3UOgZw2q666ipt3LjROoZvZWRkqLGxka96TTJO6EmWmZmpWbNmWcfwtaeffto6AtApixYtso7ga4899hhl3gUo9C4wY8YMXXnlldYxfOnRRx9VQUGBdQygU0aNGsXLaycwcuRIzZgxwzpGt8At9y5y4MABXXHFFWpsbLSO4htjxozRmjVrlJLCdSWCr6OjQzfddJPWrl1rHcU3cnJyVFNTo379+llH6RYo9C5UW1urgoICtba2Wkcxd/7552vLli3choNTWlpaNHz4cO3cudM6irmMjAx99tlnuvTSS62jdBscjbrQ0KFD9eabb3b7E2m/fv304YcfUuZwTkZGhj744ANlZWVZRzGVkpKi999/nzLvYt27WQxMnjxZCxcutI5hJi0tTatXr9b5559vHQVIigsuuEBlZWVKS0uzjmJm4cKFGjNmjHWMbodCNzBr1ixNnjzZOoaJl19+WSNHjrSOASTVlVdeqZdfftk6hom77rqLT/YY4TV0I62trRozZow+//xz6yhdpri4WIsXL7aOAXSZ6dOna+nSpdYxuszIkSO1YcOGbn13whIndCPp6enasGGDpk+fbh0l6cLhsN5++23KHN3OkiVL9OqrryocDltHSbrp06frs88+o8wNcUL3gSVLlqi4uFjxeNw6iucikYhKS0v5rDm6tU2bNmn8+PE6dOiQdRTPhcNhvfTSS93icOJ3FLpPuLjgY7GYKioqFIlErKMA5hoaGjRx4kTV1NRYR/FM3759tXr1ai7YfYJb7j5RUFCgLVu2KDc31zqKJyZMmKCNGzdS5sDvotGoNm7cqAkTJlhH8UQsFtOWLVsocx+h0H0kGo2qqqoq0As+FAppwYIFKisrU+/eva3jAL7Su3dvlZWV6amnnlIoFLKOc9r+uGDnt839hUL3mYyMDJWVlendd98N3Ge1r732WlVXV6ukpCTQmxWQTKFQSLNnz1Z1dbWuvfZa6zin5KKLLtLKlSu5YPcpCt2HQqGQbrnlFm3btk3Lly/XwIEDrSP9o/z8fK1fv17r169XLBazjgMEQiwWO75u8vPzreP8o4ED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";
const dice6Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTA0PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjRjZTkxNDQ0LTExMzItNDVlOC1iN2RjLWVhNzgyY2Y2NDNkMTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5kaWNlIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICA8cGRmOkF1dGhvcj7okKnljp/llZPlpKo8L3BkZjpBdXRob3I+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSAoUmVuZGVyZXIpIGRvYz1EQUdwYmdkTTlKZyB1c2VyPVVBR01aLU9nS3VRIGJyYW5kPUJBR01aME01UjVnIHRlbXBsYXRlPTwveG1wOkNyZWF0b3JUb29sPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3InPz5v68A3AAArC0lEQVR4nOzdb0zVdf/H8deRKxpNOd3BiYlCVuBU3CnAP4DAZlMnAt3QM62tjax7blo5N6u51hzrVt6q1p+55UzLLc5BG9ralMkpdBI01LAZIhYydWswZ40G57px/fJ3eXV1Ccdz+Jzv+/t8bE5ueV5+vu/v93U+33M4JxCPx+MCAACeNs11AAAAcP8odAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAwgEIHAMAACh0AAAModAAADKDQAQAw4B+u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";
const defaultDiceImages = {
  1: dice1Image,
  2: dice2Image,
  3: dice3Image,
  4: dice4Image,
  5: dice5Image,
  6: dice6Image
};
function Dice({
  sides = 6,
  socket = null,
  diceId,
  roomId,
  title: title2,
  onRoll,
  customFaces,
  tooltipText
}) {
  const [value, setValue] = useState(1);
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
    socket.emit("dice:roll", { roomId, diceId, sides });
  };
  const renderDiceFace = () => {
    if (customFaces && customFaces[value - 1]) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$4.faceContainer, children: customFaces[value - 1] });
    }
    if (value >= 1 && value <= 6 && defaultDiceImages[value]) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: defaultDiceImages[value], alt: `Dice face ${value}`, className: styles$4.faceImage });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles$4.defaultText, children: value });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles$4.diceWrapper, children: [
    title2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$4.diceTitle, children: title2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${styles$4.dice} ${rolling ? styles$4.diceRolling : styles$4.diceNotRolling}`, onClick: roll, children: [
      renderDiceFace(),
      tooltipText && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$4.tooltip, children: tooltipText })
    ] })
  ] });
}
const draggable = "_draggable_1bsjy_3";
const styles$3 = {
  draggable
};
function Draggable({
  image,
  mask = false,
  initialX = 500,
  initialY = 500,
  size = 100,
  color = "yellow",
  isTransparent = false,
  children,
  style = {},
  socket,
  roomId,
  pieceId,
  onDragEnd,
  scale = 1,
  containerRef
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [rotation, setRotation] = useState(0);
  const posRef = useRef(pos);
  const isDraggingRef = useRef(false);
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);
  useEffect(() => {
    if (!socket || !pieceId) return;
    const eventName = "draggable:update";
    const handleRemoteMove = (move) => {
      if (move.pieceId === pieceId && !isDraggingRef.current) {
        setPos({ x: move.x, y: move.y });
      }
    };
    socket.on(eventName, handleRemoteMove);
    return () => {
      socket.off(eventName, handleRemoteMove);
    };
  }, [socket, pieceId]);
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const fixedContainer = containerRef?.current;
    if (!fixedContainer) {
      console.error("containerRef がセットされていません！");
      return;
    }
    const fixedContainerRect = fixedContainer.getBoundingClientRect();
    const clientX_relative = (e.clientX - fixedContainerRect.left) / scale;
    const clientY_relative = (e.clientY - fixedContainerRect.top) / scale;
    const offsetX = clientX_relative - pos.x;
    const offsetY = clientY_relative - pos.y;
    let lastTime = 0;
    const targetFPS = 60;
    const interval = 1e3 / targetFPS;
    const handleMouseMove = (ev) => {
      const now = performance.now();
      if (now - lastTime < interval) return;
      lastTime = now;
      const currentX_relative = (ev.clientX - fixedContainerRect.left) / scale;
      const currentY_relative = (ev.clientY - fixedContainerRect.top) / scale;
      const newPos = {
        x: currentX_relative - offsetX,
        y: currentY_relative - offsetY
      };
      setPos(newPos);
      posRef.current = newPos;
      if (socket && roomId && pieceId) {
        socket.emit("draggable:moved", { roomId, pieceId, ...newPos });
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      const { x, y } = posRef.current;
      if (socket && roomId && pieceId) {
        socket.emit("draggable:moved", { roomId, pieceId, x, y });
      }
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
      onDragEnd?.(x, y);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleDoubleClick = () => setRotation((prev) => prev + 90);
  const MASK_PROP = ["mask", "Image"].join("");
  const WEBKIT_MASK_PROP = ["Webkit", "Mask", "Image"].join("");
  const URL_FUNC = ["u", "r", "l"].join("");
  const maskStyle = mask && image ? {
    [WEBKIT_MASK_PROP]: `${URL_FUNC}("${image}")`,
    [MASK_PROP]: `${URL_FUNC}("${image}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    backgroundColor: color || "yellow"
  } : {};
  const dynamicStyle = {
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: `${size}px`,
    height: `${size}px`,
    background: mask && image ? void 0 : isTransparent ? "transparent" : color,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    position: "absolute",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...maskStyle,
    ...style
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      onMouseDown: handleMouseDown,
      onDoubleClick: handleDoubleClick,
      className: styles$3.draggable,
      style: dynamicStyle,
      children: image ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: image,
          alt: "",
          style: {
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
            mixBlendMode: mask ? "multiply" : "normal"
          }
        }
      ) : children
    }
  );
}
const piece = "_piece_wi08l_3";
const styles$2 = {
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
    styles$2.piece,
    isDraggable ? styles$2.draggable : styles$2.clickable
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
function GridBoard({
  rows,
  cols,
  boardData,
  pieces,
  changedCells,
  renderCell,
  onCellClick,
  onCellDoubleClick,
  onPieceClick,
  allowPieceDrag = false,
  onPieceDragStart,
  onCellDrop
}) {
  const handleCellClick = (loc) => {
    const data = boardData[loc.row][loc.col];
    onCellClick(data, loc);
  };
  const handleCellDoubleClick = (loc) => {
    const data = boardData[loc.row][loc.col];
    onCellDoubleClick(data, loc);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles$6.boardContainer, style: boardStyle, children: [
    boardData.map((rowArr, row) => rowArr.map((originalCellData, col) => {
      const isChanged = changedCells.some(
        (loc2) => loc2.row === row && loc2.col === col
      );
      const effectiveContent = isChanged ? originalCellData.changedContent : originalCellData.content;
      const cellDataForRenderer = {
        ...originalCellData,
        content: effectiveContent
      };
      const loc = { row, col };
      return (
        // 💡 修正点 5: Cell にジェネリクス型 (GridLocation) を適用
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Cell,
          {
            locationData: loc,
            cellData: cellDataForRenderer,
            onClick: handleCellClick,
            onDoubleClick: handleCellDoubleClick,
            onDrop: (e) => onCellDrop(e, row, col),
            onDragOver: (e) => e.preventDefault(),
            changed: isChanged,
            children: renderCell(cellDataForRenderer, row, col)
          },
          originalCellData.id
        )
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
function client_log(tag, ...args) {
  console.log(`[${tag}]`, ...args);
}
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
const CardDisplayContent$1 = ({ card: card2, isFaceUp }) => {
  if (!isFaceUp) {
    return null;
  }
  if (card2.frontImage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: card2.frontImage, alt: card2.name, className: "rg-card-image" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rg-card-text-content", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "rg-card-name-label", children: card2.name }) });
};
function PlayField({
  socket,
  roomId,
  deckId,
  title: title2,
  players,
  myPlayerId,
  layoutMode = "free",
  is_logging = false
}) {
  const [playedCards, setPlayedCards] = React.useState([]);
  const [activeDraggingId, setActiveDraggingId] = React.useState(null);
  const containerRef = React.useRef(null);
  const draggingIdRef = React.useRef(null);
  React.useEffect(() => {
    const handleUpdate = (data) => {
      const newCards = data.playFieldCards || [];
      if (is_logging) {
        client_log("playField", `[${deckId}] 場の更新: ${newCards.length}枚`);
      }
      setPlayedCards(newCards);
    };
    socket.on(`deck:update:${roomId}:${deckId}`, handleUpdate);
    return () => {
      socket.off(`deck:update:${roomId}:${deckId}`, handleUpdate);
    };
  }, [socket, roomId, deckId, is_logging]);
  const emitMove = React.useMemo(
    () => throttle((cardId, clientX, clientY) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let x = (clientX - rect.left) / rect.width * 100;
      let y = (clientY - rect.top) / rect.height * 100;
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      socket.emit("card:move-on-field", {
        roomId,
        deckId,
        cardId,
        coordinate: { x, y }
      });
    }, 50),
    [socket, roomId, deckId]
  );
  const handlePointerDown = (e, card2) => {
    if (layoutMode !== "free") return;
    draggingIdRef.current = card2.id;
    setActiveDraggingId(card2.id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (!draggingIdRef.current) return;
    emitMove(draggingIdRef.current, e.clientX, e.clientY);
  };
  const handlePointerUp = (e) => {
    if (!draggingIdRef.current) return;
    emitMove(draggingIdRef.current, e.clientX, e.clientY);
    e.currentTarget.releasePointerCapture(e.pointerId);
    draggingIdRef.current = null;
    setActiveDraggingId(null);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    if (!containerRef.current || !myPlayerId) return;
    const droppedCardId = e.dataTransfer.getData("cardId");
    const droppedDeckId = e.dataTransfer.getData("deckId");
    if (!droppedCardId || !droppedDeckId) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width * 100;
    let y = (e.clientY - rect.top) / rect.height * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    socket.emit("card:play", {
      roomId,
      deckId: droppedDeckId,
      cardIds: [droppedCardId],
      playerId: myPlayerId,
      // サーバー側の strict な if 文に合わせて "field" 固定で送る
      playLocation: "field",
      coordinate: { x, y }
      // 座標を渡す
    });
    if (is_logging) {
      client_log("playField", `Card ${droppedCardId} dropped at x:${x.toFixed(1)}%, y:${y.toFixed(1)}%`);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleCardBack = (card2) => {
    const backTo = card2.fieldBackLocation || "discard";
    const requestData = {
      roomId,
      deckId: card2.deckId || deckId,
      cardId: card2.id
    };
    if (backTo === "hand") {
      if (!card2.ownerId) return;
      requestData.targetPlayerId = card2.ownerId;
    }
    socket.emit("card:move-from-field", requestData);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `rg-playfield mode-${layoutMode}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "rg-playfield-title", children: title2 !== void 0 && title2 !== null ? title2 : `プレイフィールド (deckId=${deckId})` }),
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        className: "rg-playfield-container",
        onPointerMove: handlePointerMove,
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        style: {
          position: layoutMode === "free" ? "relative" : void 0,
          minHeight: "600px",
          touchAction: "none",
          overflow: "hidden"
          // 枠外はみ出し防止
        },
        children: playedCards.map((card2, index) => {
          const owner = players.find((p) => p.id === card2.ownerId);
          const isDragging = activeDraggingId === card2.id;
          const isOverlapping = playedCards.slice(0, index).some(
            (other) => Math.abs((other.coordinate?.x ?? 50) - (card2.coordinate?.x ?? 50)) < 1 && Math.abs((other.coordinate?.y ?? 50) - (card2.coordinate?.y ?? 50)) < 1
          );
          const visualOffset = isOverlapping ? index * 12 : 0;
          const freeStyle = layoutMode === "free" ? {
            position: "absolute",
            left: `${card2.coordinate?.x ?? 50}%`,
            top: `${card2.coordinate?.y ?? 50}%`,
            transform: `translate(calc(-50% + ${visualOffset}px), calc(-50% + ${visualOffset}px))`,
            zIndex: isDragging ? 9999 : Math.floor((card2.coordinate?.y ?? 0) * 100) + index
          } : {};
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onPointerDown: (e) => handlePointerDown(e, card2),
              onPointerUp: handlePointerUp,
              className: `${styles$5.card} rg-playfield-card-wrapper`,
              style: {
                "--owner-color": owner?.color || "#aaaaaa",
                ...freeStyle,
                touchAction: "none",
                cursor: isDragging ? "grabbing" : layoutMode === "free" ? "grab" : "default"
              },
              onDoubleClick: () => handleCardBack(card2),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardDisplayContent$1, { card: card2, isFaceUp: true }),
                card2.ownerId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rg-playfield-owner-badge", title: `所有者: ${owner?.name || "不明"}`, children: owner?.name?.[0] || "?" }),
                card2.description && !isDragging && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles$5.tooltip, children: card2.description })
              ]
            },
            card2.id
          );
        })
      }
    )
  ] });
}
const container$1 = "_container_17uio_2";
const cursorWrapper = "_cursorWrapper_17uio_13";
const icon = "_icon_17uio_21";
const label = "_label_17uio_29";
const styles$1 = {
  container: container$1,
  cursorWrapper,
  icon,
  label
};
const RemoteCursor = React__default.memo(
  ({
    socket,
    roomId,
    myPlayerId,
    players,
    scale,
    fixedContainerRef,
    visible,
    isRelative = true
  }) => {
    const [remoteCursors, setRemoteCursors] = useState({});
    useEffect(() => {
      if (!socket) return;
      const handleUpdate = (data) => {
        if (data.playerId === socket.id || data.playerId === myPlayerId) return;
        setRemoteCursors((prev) => ({
          ...prev,
          [data.playerId]: { x: data.x, y: data.y }
        }));
      };
      socket.on("cursor:update", handleUpdate);
      return () => {
        socket.off("cursor:update", handleUpdate);
      };
    }, [socket, myPlayerId]);
    useEffect(() => {
      if (!socket || !roomId || !myPlayerId || !fixedContainerRef.current)
        return;
      const THROTTLE = 50;
      let lastTime = 0;
      const handleMove = (e) => {
        const now = Date.now();
        if (now - lastTime < THROTTLE) return;
        lastTime = now;
        const rect = fixedContainerRef.current.getBoundingClientRect();
        const x = isRelative ? (e.clientX - rect.left) / rect.width : (e.clientX - rect.left) / scale;
        const y = isRelative ? (e.clientY - rect.top) / rect.height : (e.clientY - rect.top) / scale;
        socket.emit("cursor:move", {
          roomId,
          playerId: myPlayerId,
          x,
          y
        });
      };
      window.addEventListener("mousemove", handleMove);
      return () => window.removeEventListener("mousemove", handleMove);
    }, [socket, roomId, myPlayerId, scale, fixedContainerRef, isRelative]);
    if (!visible) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$1.container, children: Object.entries(remoteCursors).map(([id, coords]) => {
      const player = players.find((p) => String(p.socketId) === String(id)) || players.find((p) => p.socketId !== myPlayerId);
      const name = player ? player.name : "接続中...";
      const color = player?.color || "#000000";
      const left = isRelative ? `${coords.x * 100}%` : coords.x;
      const top = isRelative ? `${coords.y * 100}%` : coords.y;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: styles$1.cursorWrapper,
          style: { left, top },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$1.icon, style: { color }, children: "👆" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles$1.label, style: { backgroundColor: color }, children: name })
          ]
        },
        id
      );
    }) });
  }
);
const container = "_container_1wg24_1";
const title = "_title_1wg24_13";
const playerList = "_playerList_1wg24_22";
const playerItem = "_playerItem_1wg24_27";
const activePlayer = "_activePlayer_1wg24_40";
const playerHeader = "_playerHeader_1wg24_48";
const playerName = "_playerName_1wg24_54";
const playerScore = "_playerScore_1wg24_62";
const resourceSection = "_resourceSection_1wg24_71";
const resourceList = "_resourceList_1wg24_76";
const resourceBadge = "_resourceBadge_1wg24_82";
const tokenList = "_tokenList_1wg24_90";
const tokenBadge = "_tokenBadge_1wg24_99";
const tokenBadgeOwner = "_tokenBadgeOwner_1wg24_114";
const tokenBadgeGuest = "_tokenBadgeGuest_1wg24_119";
const cardList = "_cardList_1wg24_125";
const cardBase = "_cardBase_1wg24_133";
const cardSelected = "_cardSelected_1wg24_154";
const cardImage = "_cardImage_1wg24_160";
const cardNameText = "_cardNameText_1wg24_166";
const tooltip = "_tooltip_1wg24_170";
const buttonArea = "_buttonArea_1wg24_195";
const limitMessage = "_limitMessage_1wg24_201";
const buttonGroup = "_buttonGroup_1wg24_215";
const scoreArea = "_scoreArea_1wg24_220";
const debugScoreButtons = "_debugScoreButtons_1wg24_226";
const debugBtn = "_debugBtn_1wg24_231";
const styles = {
  container,
  title,
  playerList,
  playerItem,
  activePlayer,
  playerHeader,
  playerName,
  playerScore,
  resourceSection,
  resourceList,
  resourceBadge,
  tokenList,
  tokenBadge,
  tokenBadgeOwner,
  tokenBadgeGuest,
  cardList,
  cardBase,
  cardSelected,
  cardImage,
  cardNameText,
  tooltip,
  buttonArea,
  limitMessage,
  buttonGroup,
  scoreArea,
  debugScoreButtons,
  debugBtn
};
const CardDisplayContent = React.memo(({ card: card2, canSeeFront }) => {
  if (!canSeeFront) return null;
  if (card2.frontImage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: card2.frontImage, alt: card2.name, className: styles.cardImage });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: styles.cardNameText, children: card2.name });
});
const TokenDisplayContent = React.memo(({ tokens, socket, roomId, myPlayerId, playerIdBeingDisplayed }) => {
  const isMyToken = myPlayerId === playerIdBeingDisplayed;
  if (!tokens || tokens.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.tokenList, children: tokens.map((token) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `${styles.tokenBadge} ${isMyToken ? styles.tokenBadgeOwner : styles.tokenBadgeGuest}`,
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
const PlayerListItem = React.memo(
  ({
    player,
    currentPlayerId,
    myPlayerId,
    selectedCards,
    toggleCardSelection,
    socket,
    roomId,
    isDebug
  }) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = player.color || "#aaaaaa";
    const isOwner = player.id === myPlayerId;
    const handleAddScore = (points) => {
      socket.emit("room:player:add-score", {
        roomId,
        targetPlayerId: player.id,
        points
      });
    };
    const customStyles = {
      "--player-color": playerColor,
      "--player-color-bg": playerColor.replace("hsl", "hsla").replace(")", ", 0.3)"),
      "--player-color-glow": playerColor.replace("hsl", "hsla").replace(")", ", 0.5)")
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `${styles.playerItem} ${isActive ? styles.activePlayer : ""}`, style: customStyles, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.playerHeader, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: styles.playerName, children: [
          isActive && "ᐅ ",
          isOwner && "★ ME ",
          player.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.scoreArea, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: styles.playerScore, children: [
            "スコア: ",
            player.score
          ] }),
          isDebug && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.debugScoreButtons, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleAddScore(-1), className: styles.debugBtn, children: "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleAddScore(1), className: styles.debugBtn, children: "+" })
          ] })
        ] })
      ] }),
      player.resources?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.resourceSection, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.resourceList, children: player.resources.map((resource) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: styles.resourceBadge, children: [
        resource.icon,
        " ",
        resource.name,
        ": ",
        resource.currentValue,
        " / ",
        resource.maxValue
      ] }, resource.id)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TokenDisplayContent,
        {
          tokens: player.tokens,
          socket,
          roomId,
          myPlayerId,
          playerIdBeingDisplayed: player.id
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.cardList, children: player.cards.map((card2) => {
        const isSelected = selectedCards.includes(card2.id);
        const canSeeFront = !!card2.isFaceUp || isOwner;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            draggable: isOwner,
            onDragStart: (e) => {
              if (!isOwner) return;
              e.dataTransfer.setData("cardId", card2.id);
              e.dataTransfer.setData("deckId", card2.deckId);
              e.dataTransfer.effectAllowed = "move";
            },
            className: `${styles.cardBase} rg-playfield-card-wrapper ${isSelected ? styles.cardSelected : ""} ${card2.isFaceUp ? styles.cardSuperRevealed : ""}`,
            style: {
              "--owner-color": playerColor,
              backgroundColor: canSeeFront ? "#fff" : card2.backColor,
              cursor: isOwner ? "grab" : "default",
              border: card2.isFaceUp ? "3px solid #00ffff" : "1px solid #ccc",
              boxShadow: card2.isFaceUp ? "0 0 10px #00ffff" : "none"
            },
            onClick: () => toggleCardSelection(card2.id, isOwner),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDisplayContent, { card: card2, canSeeFront }),
              canSeeFront && card2.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles.tooltip, children: card2.description })
            ]
          },
          card2.id
        );
      }) })
    ] });
  }
);
function ScoreBoard({
  socket,
  players,
  currentPlayerId,
  myPlayerId,
  roomId,
  playCardLimit,
  autoNextTurnOnCardPlay = false,
  isDebug = false
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
  const toggleCardSelection = React.useCallback((cardId, isOwner) => {
    if (!isOwner) return;
    setSelectedCards((prev) => prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]);
  }, []);
  const revealSelectedCards = React.useCallback(() => {
    if (selectedCards.length === 0 || !myPlayerId) return;
    if (playCardLimit !== void 0 && selectedCards.length > playCardLimit) return;
    socket.emit("card:reveal", {
      roomId,
      playerId: myPlayerId,
      cardIds: selectedCards
    });
    if (autoNextTurnOnCardPlay) socket.emit("game:next-turn", { roomId });
    setSelectedCards([]);
  }, [selectedCards, myPlayerId, socket, roomId, playCardLimit, autoNextTurnOnCardPlay]);
  const playSelectedCards = React.useCallback(() => {
    if (selectedCards.length === 0 || !myPlayerId) return;
    if (playCardLimit !== void 0 && selectedCards.length > playCardLimit) return;
    const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
    if (!myPlayer) return;
    const cardsByDeck = {};
    let targetPlayLocation;
    selectedCards.forEach((cardId) => {
      const card2 = myPlayer.cards.find((c) => c.id === cardId);
      if (!card2) return;
      if (!targetPlayLocation) targetPlayLocation = card2.playLocation;
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
        playLocation: targetPlayLocation,
        position: { x: 50, y: 50 }
      });
    });
    if (autoNextTurnOnCardPlay) socket.emit("game:next-turn", { roomId });
    setSelectedCards([]);
  }, [selectedCards, myPlayerId, displayedPlayers, socket, roomId, playCardLimit, autoNextTurnOnCardPlay]);
  const nextTurn = () => socket.emit("game:next-turn", { roomId });
  const isOverLimit = playCardLimit !== void 0 && selectedCards.length > playCardLimit;
  const isActionDisabled = selectedCards.length === 0 || isOverLimit;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: styles.title, children: "ゲームスコアボード" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: styles.playerList, children: displayedPlayers.map((player) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      PlayerListItem,
      {
        player,
        currentPlayerId,
        myPlayerId,
        selectedCards,
        toggleCardSelection,
        socket,
        roomId,
        isDebug
      },
      player.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.buttonArea, children: [
      isOverLimit && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: styles.limitMessage, children: [
        "一度に出せるカードは ",
        playCardLimit,
        " 枚までです"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.buttonGroup, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: playSelectedCards, disabled: isActionDisabled, children: "選択カードを出す" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: revealSelectedCards, disabled: isActionDisabled, children: "選択カードを公開する" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: nextTurn, children: "ターンをスキップ" })
      ] })
    ] })
  ] });
}
function Timer({ socket = null, initialDuration, onFinish, roomId }) {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  useEffect(() => {
    if (!socket || !roomId) return;
    const handleStart = (data) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(data.duration);
    };
    const handleUpdate = (data) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(data.remaining);
    };
    const handleFinish = (data) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(0);
      onFinish?.();
    };
    socket.on("timer:start", handleStart);
    socket.on("timer:update", handleUpdate);
    socket.on("timer:finish", handleFinish);
    return () => {
      socket.off("timer:start", handleStart);
      socket.off("timer:update", handleUpdate);
      socket.off("timer:finish", handleFinish);
    };
  }, [socket, roomId, onFinish, initialDuration]);
  const start = () => {
    if (!socket || !roomId || initialDuration <= 0) return;
    setTimeLeft(initialDuration);
    socket.emit("timer:start", { duration: initialDuration, roomId });
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
              color: timeLeft <= 6 ? "red" : timeLeft <= 15 ? "orange" : "green",
              transition: "color 0.5s ease"
            },
            children: [
              "残り時間: ",
              timeLeft,
              "s"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: start, style: { marginRight: "4px" }, children: [
          "タイマー開始 (",
          initialDuration,
          "s)"
        ] }) })
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
  Cell,
  Deck,
  Dice,
  Draggable,
  GridBoard,
  PlayField,
  RemoteCursor,
  ScoreBoard,
  Timer,
  TokenStore
};
