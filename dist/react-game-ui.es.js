import * as ae from "react";
import dr, { useState as ie, useRef as mr, useEffect as Oe } from "react";
var U = { exports: {} }, z = {};
/**
 * @license React
 * react-jsx-dev-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Se;
function pr() {
  if (Se) return z;
  Se = 1;
  var s = Symbol.for("react.fragment");
  return z.Fragment = s, z.jsxDEV = void 0, z;
}
var J = {};
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Te;
function vr() {
  return Te || (Te = 1, process.env.NODE_ENV !== "production" && (function() {
    var s = dr, c = Symbol.for("react.element"), g = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), k = Symbol.for("react.strict_mode"), N = Symbol.for("react.profiler"), f = Symbol.for("react.provider"), d = Symbol.for("react.context"), b = Symbol.for("react.forward_ref"), D = Symbol.for("react.suspense"), R = Symbol.for("react.suspense_list"), h = Symbol.for("react.memo"), m = Symbol.for("react.lazy"), B = Symbol.for("react.offscreen"), F = Symbol.iterator, q = "@@iterator";
    function K(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = F && e[F] || e[q];
      return typeof r == "function" ? r : null;
    }
    var O = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function x(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        Pe("error", e, t);
      }
    }
    function Pe(e, r, t) {
      {
        var n = O.ReactDebugCurrentFrame, o = n.getStackAddendum();
        o !== "" && (r += "%s", t = t.concat([o]));
        var u = t.map(function(i) {
          return String(i);
        });
        u.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, u);
      }
    }
    var Ve = !1, Fe = !1, Ae = !1, $e = !1, We = !1, oe;
    oe = Symbol.for("react.module.reference");
    function Be(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === y || e === N || We || e === k || e === D || e === R || $e || e === B || Ve || Fe || Ae || typeof e == "object" && e !== null && (e.$$typeof === m || e.$$typeof === h || e.$$typeof === f || e.$$typeof === d || e.$$typeof === b || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === oe || e.getModuleId !== void 0));
    }
    function Ye(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var o = r.displayName || r.name || "";
      return o !== "" ? t + "(" + o + ")" : t;
    }
    function se(e) {
      return e.displayName || "Context";
    }
    function S(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && x("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case y:
          return "Fragment";
        case g:
          return "Portal";
        case N:
          return "Profiler";
        case k:
          return "StrictMode";
        case D:
          return "Suspense";
        case R:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case d:
            var r = e;
            return se(r) + ".Consumer";
          case f:
            var t = e;
            return se(t._context) + ".Provider";
          case b:
            return Ye(e, e.render, "ForwardRef");
          case h:
            var n = e.displayName || null;
            return n !== null ? n : S(e.type) || "Memo";
          case m: {
            var o = e, u = o._payload, i = o._init;
            try {
              return S(i(u));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var T = Object.assign, A = 0, ce, ue, le, fe, de, me, pe;
    function ve() {
    }
    ve.__reactDisabledLog = !0;
    function Me() {
      {
        if (A === 0) {
          ce = console.log, ue = console.info, le = console.warn, fe = console.error, de = console.group, me = console.groupCollapsed, pe = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: ve,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        A++;
      }
    }
    function Ie() {
      {
        if (A--, A === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: T({}, e, {
              value: ce
            }),
            info: T({}, e, {
              value: ue
            }),
            warn: T({}, e, {
              value: le
            }),
            error: T({}, e, {
              value: fe
            }),
            group: T({}, e, {
              value: de
            }),
            groupCollapsed: T({}, e, {
              value: me
            }),
            groupEnd: T({}, e, {
              value: pe
            })
          });
        }
        A < 0 && x("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var G = O.ReactCurrentDispatcher, X;
    function Y(e, r, t) {
      {
        if (X === void 0)
          try {
            throw Error();
          } catch (o) {
            var n = o.stack.trim().match(/\n( *(at )?)/);
            X = n && n[1] || "";
          }
        return `
` + X + e;
      }
    }
    var H = !1, M;
    {
      var Le = typeof WeakMap == "function" ? WeakMap : Map;
      M = new Le();
    }
    function be(e, r) {
      if (!e || H)
        return "";
      {
        var t = M.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      H = !0;
      var o = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var u;
      u = G.current, G.current = null, Me();
      try {
        if (r) {
          var i = function() {
            throw Error();
          };
          if (Object.defineProperty(i.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(i, []);
            } catch (_) {
              n = _;
            }
            Reflect.construct(e, [], i);
          } else {
            try {
              i.call();
            } catch (_) {
              n = _;
            }
            e.call(i.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (_) {
            n = _;
          }
          e();
        }
      } catch (_) {
        if (_ && n && typeof _.stack == "string") {
          for (var a = _.stack.split(`
`), E = n.stack.split(`
`), p = a.length - 1, v = E.length - 1; p >= 1 && v >= 0 && a[p] !== E[v]; )
            v--;
          for (; p >= 1 && v >= 0; p--, v--)
            if (a[p] !== E[v]) {
              if (p !== 1 || v !== 1)
                do
                  if (p--, v--, v < 0 || a[p] !== E[v]) {
                    var w = `
` + a[p].replace(" at new ", " at ");
                    return e.displayName && w.includes("<anonymous>") && (w = w.replace("<anonymous>", e.displayName)), typeof e == "function" && M.set(e, w), w;
                  }
                while (p >= 1 && v >= 0);
              break;
            }
        }
      } finally {
        H = !1, G.current = u, Ie(), Error.prepareStackTrace = o;
      }
      var V = e ? e.displayName || e.name : "", j = V ? Y(V) : "";
      return typeof e == "function" && M.set(e, j), j;
    }
    function Ue(e, r, t) {
      return be(e, !1);
    }
    function ze(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function I(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return be(e, ze(e));
      if (typeof e == "string")
        return Y(e);
      switch (e) {
        case D:
          return Y("Suspense");
        case R:
          return Y("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case b:
            return Ue(e.render);
          case h:
            return I(e.type, r, t);
          case m: {
            var n = e, o = n._payload, u = n._init;
            try {
              return I(u(o), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var $ = Object.prototype.hasOwnProperty, he = {}, ge = O.ReactDebugCurrentFrame;
    function L(e) {
      if (e) {
        var r = e._owner, t = I(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(t);
      } else
        ge.setExtraStackFrame(null);
    }
    function Je(e, r, t, n, o) {
      {
        var u = Function.call.bind($);
        for (var i in e)
          if (u(e, i)) {
            var a = void 0;
            try {
              if (typeof e[i] != "function") {
                var E = Error((n || "React class") + ": " + t + " type `" + i + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[i] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw E.name = "Invariant Violation", E;
              }
              a = e[i](r, i, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (p) {
              a = p;
            }
            a && !(a instanceof Error) && (L(o), x("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, i, typeof a), L(null)), a instanceof Error && !(a.message in he) && (he[a.message] = !0, L(o), x("Failed %s type: %s", t, a.message), L(null));
          }
      }
    }
    var qe = Array.isArray;
    function Z(e) {
      return qe(e);
    }
    function Ke(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function Ge(e) {
      try {
        return xe(e), !1;
      } catch {
        return !0;
      }
    }
    function xe(e) {
      return "" + e;
    }
    function ye(e) {
      if (Ge(e))
        return x("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ke(e)), xe(e);
    }
    var W = O.ReactCurrentOwner, Xe = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ee, Re, Q;
    Q = {};
    function He(e) {
      if ($.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Ze(e) {
      if ($.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function Qe(e, r) {
      if (typeof e.ref == "string" && W.current && r && W.current.stateNode !== r) {
        var t = S(W.current.type);
        Q[t] || (x('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', S(W.current.type), e.ref), Q[t] = !0);
      }
    }
    function er(e, r) {
      {
        var t = function() {
          Ee || (Ee = !0, x("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function rr(e, r) {
      {
        var t = function() {
          Re || (Re = !0, x("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var tr = function(e, r, t, n, o, u, i) {
      var a = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: c,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: i,
        // Record the component responsible for creating this element.
        _owner: u
      };
      return a._store = {}, Object.defineProperty(a._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(a, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: n
      }), Object.defineProperty(a, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: o
      }), Object.freeze && (Object.freeze(a.props), Object.freeze(a)), a;
    };
    function nr(e, r, t, n, o) {
      {
        var u, i = {}, a = null, E = null;
        t !== void 0 && (ye(t), a = "" + t), Ze(r) && (ye(r.key), a = "" + r.key), He(r) && (E = r.ref, Qe(r, o));
        for (u in r)
          $.call(r, u) && !Xe.hasOwnProperty(u) && (i[u] = r[u]);
        if (e && e.defaultProps) {
          var p = e.defaultProps;
          for (u in p)
            i[u] === void 0 && (i[u] = p[u]);
        }
        if (a || E) {
          var v = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          a && er(i, v), E && rr(i, v);
        }
        return tr(e, a, E, o, n, W.current, i);
      }
    }
    var ee = O.ReactCurrentOwner, _e = O.ReactDebugCurrentFrame;
    function P(e) {
      if (e) {
        var r = e._owner, t = I(e.type, e._source, r ? r.type : null);
        _e.setExtraStackFrame(t);
      } else
        _e.setExtraStackFrame(null);
    }
    var re;
    re = !1;
    function te(e) {
      return typeof e == "object" && e !== null && e.$$typeof === c;
    }
    function Ne() {
      {
        if (ee.current) {
          var e = S(ee.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function ar(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), t = e.lineNumber;
          return `

Check your code at ` + r + ":" + t + ".";
        }
        return "";
      }
    }
    var ke = {};
    function ir(e) {
      {
        var r = Ne();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function we(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = ir(r);
        if (ke[t])
          return;
        ke[t] = !0;
        var n = "";
        e && e._owner && e._owner !== ee.current && (n = " It was passed a child from " + S(e._owner.type) + "."), P(e), x('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), P(null);
      }
    }
    function Ce(e, r) {
      {
        if (typeof e != "object")
          return;
        if (Z(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            te(n) && we(n, r);
          }
        else if (te(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var o = K(e);
          if (typeof o == "function" && o !== e.entries)
            for (var u = o.call(e), i; !(i = u.next()).done; )
              te(i.value) && we(i.value, r);
        }
      }
    }
    function or(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === b || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === h))
          t = r.propTypes;
        else
          return;
        if (t) {
          var n = S(r);
          Je(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !re) {
          re = !0;
          var o = S(r);
          x("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", o || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && x("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function sr(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            P(e), x("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), P(null);
            break;
          }
        }
        e.ref !== null && (P(e), x("Invalid attribute `ref` supplied to `React.Fragment`."), P(null));
      }
    }
    var De = {};
    function cr(e, r, t, n, o, u) {
      {
        var i = Be(e);
        if (!i) {
          var a = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (a += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var E = ar(o);
          E ? a += E : a += Ne();
          var p;
          e === null ? p = "null" : Z(e) ? p = "array" : e !== void 0 && e.$$typeof === c ? (p = "<" + (S(e.type) || "Unknown") + " />", a = " Did you accidentally export a JSX literal instead of a component?") : p = typeof e, x("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", p, a);
        }
        var v = nr(e, r, t, o, u);
        if (v == null)
          return v;
        if (i) {
          var w = r.children;
          if (w !== void 0)
            if (n)
              if (Z(w)) {
                for (var V = 0; V < w.length; V++)
                  Ce(w[V], e);
                Object.freeze && Object.freeze(w);
              } else
                x("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Ce(w, e);
        }
        if ($.call(r, "key")) {
          var j = S(e), _ = Object.keys(r).filter(function(fr) {
            return fr !== "key";
          }), ne = _.length > 0 ? "{key: someKey, " + _.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!De[j + ne]) {
            var lr = _.length > 0 ? "{" + _.join(": ..., ") + ": ...}" : "{}";
            x(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ne, j, lr, j), De[j + ne] = !0;
          }
        }
        return e === y ? sr(v) : or(v), v;
      }
    }
    var ur = cr;
    J.Fragment = y, J.jsxDEV = ur;
  })()), J;
}
var je;
function br() {
  return je || (je = 1, process.env.NODE_ENV === "production" ? U.exports = pr() : U.exports = vr()), U.exports;
}
var l = br();
const hr = "_card_12yoz_4", gr = "_tooltip_12yoz_25", xr = "_cardBack_12yoz_48", yr = "_deckContainer_12yoz_61", Er = "_deckCard_12yoz_69", Rr = "_deckCardFront_12yoz_82", _r = "_deckSection_12yoz_98", C = {
  card: hr,
  tooltip: gr,
  cardBack: xr,
  deckContainer: yr,
  deckCard: Er,
  deckCardFront: Rr,
  deckSection: _r
};
function kr({ socket: s, deckId: c, name: g, playerId: y = null }) {
  const [k, N] = ae.useState([]), [f, d] = ae.useState([]);
  ae.useEffect(() => (s.on(`deck:init:${c}`, (h) => {
    N(h.currentDeck.map((m) => ({ ...m, deckId: c }))), d(h.drawnCards.map((m) => ({ ...m, deckId: c })));
  }), s.on(`deck:update:${c}`, (h) => {
    N(h.currentDeck.map((m) => ({ ...m, deckId: c }))), d(h.drawnCards.map((m) => ({ ...m, deckId: c })));
  }), () => {
    s.off(`deck:init:${c}`), s.off(`deck:update:${c}`);
  }), [s, c]);
  const b = () => {
    k.length !== 0 && s.emit("deck:draw", { deckId: c, playerId: y });
  }, D = () => s.emit("deck:shuffle", { deckId: c }), R = () => s.emit("deck:reset", { deckId: c });
  return /* @__PURE__ */ l.jsxDEV("section", { className: C.deckSection, children: [
    /* @__PURE__ */ l.jsxDEV("h3", { style: { marginBottom: "6px" }, children: g }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("div", { className: C.deckControls, children: [
      /* @__PURE__ */ l.jsxDEV("button", { onClick: D, children: "シャッフル" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 50,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ l.jsxDEV("button", { onClick: R, children: "山札に戻す" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 51,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("div", { className: C.deckWrapper, children: [
      /* @__PURE__ */ l.jsxDEV("div", { className: C.deckContainer, onClick: b, children: k.map((h, m) => /* @__PURE__ */ l.jsxDEV(
        "div",
        {
          className: C.deckCard,
          style: { zIndex: k.length - m, transform: `translate(${m * 0.5}px, ${m * 0.5}px)` }
        },
        h.id,
        !1,
        {
          fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
          lineNumber: 57,
          columnNumber: 13
        },
        this
      )) }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ l.jsxDEV("div", { className: C.deckContainer, children: f.map((h, m) => /* @__PURE__ */ l.jsxDEV(
        "div",
        {
          className: C.deckCardFront,
          style: { zIndex: m + 1, transform: `translate(${m * 0.5}px, ${m * 0.5}px)` },
          children: h.isFaceUp && h.name
        },
        h.id,
        !1,
        {
          fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
          lineNumber: 67,
          columnNumber: 13
        },
        this
      )) }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 65,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 54,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
    lineNumber: 45,
    columnNumber: 5
  }, this);
}
function wr({ sides: s = 6, socket: c = null, diceId: g, onRoll: y }) {
  const [k, N] = ie(null), [f, d] = ie(!1), b = mr(null);
  Oe(() => {
    if (!c) return;
    const R = (h) => {
      d(!0);
      const m = 1e3, B = 50;
      let F = 0;
      const q = m / B;
      b.current = setInterval(() => {
        const K = Math.floor(Math.random() * s) + 1;
        N(K), F++, F >= q && (clearInterval(b.current), b.current = null, N(h), d(!1), y?.(h));
      }, B);
    };
    return c.on(`dice:rolled:${g}`, R), () => {
      c.off(`dice:rolled:${g}`, R), b.current && clearInterval(b.current);
    };
  }, [c, s, g, y]);
  const D = () => {
    !c || f || c.emit("dice:roll", { diceId: g, sides: s });
  };
  return /* @__PURE__ */ l.jsxDEV(
    "div",
    {
      style: {
        width: "80px",
        height: "80px",
        border: "2px solid #333",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2rem",
        fontWeight: "bold",
        cursor: f ? "not-allowed" : "pointer",
        userSelect: "none",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s"
      },
      onClick: D,
      children: k ?? "🎲"
    },
    void 0,
    !1,
    {
      fileName: "/workspaces/react-game-ui/src/components/Dice.tsx",
      lineNumber: 57,
      columnNumber: 5
    },
    this
  );
}
function Cr({ socket: s, players: c, currentPlayerId: g, myPlayerId: y }) {
  const k = () => s.emit("game:next-turn"), N = c.map((f) => ({
    ...f,
    score: f.score ?? 0,
    cards: f.cards ?? []
  }));
  return /* @__PURE__ */ l.jsxDEV("div", { style: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }, children: [
    /* @__PURE__ */ l.jsxDEV("h2", { children: "Scoreboard" }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("ul", { style: { listStyle: "none", padding: 0 }, children: N.map((f) => /* @__PURE__ */ l.jsxDEV(
      "li",
      {
        style: {
          padding: "6px 12px",
          marginBottom: "6px",
          borderRadius: "4px",
          backgroundColor: f.id === g ? "#a0e7ff" : "#f5f5f5",
          fontWeight: f.id === g ? "bold" : "normal"
        },
        children: [
          /* @__PURE__ */ l.jsxDEV("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ l.jsxDEV("span", { children: [
              f.id === y && "⭐️",
              " ",
              f.name
            ] }, void 0, !0, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 43,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ l.jsxDEV("span", { children: f.score }, void 0, !1, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 46,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
            lineNumber: 42,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ l.jsxDEV("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: f.cards.map((d) => {
            const b = d.isFaceUp && f.id === y;
            return /* @__PURE__ */ l.jsxDEV(
              "div",
              {
                className: b ? C.card : C.cardBack,
                style: { position: "relative", cursor: "pointer", width: "60px", height: "80px" },
                onMouseEnter: (D) => {
                  if (!b) return;
                  const R = D.currentTarget.querySelector(`.${C.tooltip}`);
                  R && (R.style.display = "block");
                },
                onMouseLeave: (D) => {
                  if (!b) return;
                  const R = D.currentTarget.querySelector(`.${C.tooltip}`);
                  R && (R.style.display = "none");
                },
                onClick: () => {
                  b && s.emit("card:play", { deckId: d.deckId, cardId: d.id, playerId: f.id });
                },
                children: [
                  b && d.name,
                  b && d.description && /* @__PURE__ */ l.jsxDEV("span", { className: C.tooltip, children: d.description }, void 0, !1, {
                    fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
                    lineNumber: 77,
                    columnNumber: 54
                  }, this)
                ]
              },
              d.id,
              !0,
              {
                fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
                lineNumber: 55,
                columnNumber: 19
              },
              this
            );
          }) }, void 0, !1, {
            fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
            lineNumber: 49,
            columnNumber: 13
          }, this)
        ]
      },
      f.id,
      !0,
      {
        fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
        lineNumber: 32,
        columnNumber: 11
      },
      this
    )) }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("button", { onClick: k, children: "次のターン" }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 86,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
    lineNumber: 28,
    columnNumber: 5
  }, this);
}
function Dr({ socket: s = null, onFinish: c }) {
  const [g, y] = ie(null);
  Oe(() => {
    if (!s) return;
    const N = (d) => {
      y(d);
    }, f = (d) => {
      y(d), d <= 0 && c?.();
    };
    return s.on("timer:start", N), s.on("timer:update", f), () => {
      s.off("timer:start", N), s.off("timer:update", f);
    };
  }, [s, c]);
  const k = () => {
    s && s.emit("timer:start", 30);
  };
  return /* @__PURE__ */ l.jsxDEV(
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
        /* @__PURE__ */ l.jsxDEV(
          "div",
          {
            style: {
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: g !== null ? g <= 6 ? "red" : g <= 15 ? "orange" : "green" : "gray",
              transition: "color 0.5s ease"
            },
            children: [
              "残り時間: ",
              g ?? "-",
              "s"
            ]
          },
          void 0,
          !0,
          {
            fileName: "/workspaces/react-game-ui/src/components/Timer.tsx",
            lineNumber: 56,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ l.jsxDEV("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ l.jsxDEV("button", { onClick: k, style: { marginRight: "4px" }, children: "開始" }, void 0, !1, {
          fileName: "/workspaces/react-game-ui/src/components/Timer.tsx",
          lineNumber: 75,
          columnNumber: 9
        }, this) }, void 0, !1, {
          fileName: "/workspaces/react-game-ui/src/components/Timer.tsx",
          lineNumber: 74,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    !0,
    {
      fileName: "/workspaces/react-game-ui/src/components/Timer.tsx",
      lineNumber: 40,
      columnNumber: 5
    },
    this
  );
}
export {
  kr as Deck,
  wr as Dice,
  Cr as ScoreBoard,
  Dr as Timer
};
