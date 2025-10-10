import * as $ from "react";
import dr, { useState as ie, useRef as mr, useEffect as Pe } from "react";
var J = { exports: {} }, q = {};
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
  if (Se) return q;
  Se = 1;
  var l = Symbol.for("react.fragment");
  return q.Fragment = l, q.jsxDEV = void 0, q;
}
var K = {};
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var je;
function vr() {
  return je || (je = 1, process.env.NODE_ENV !== "production" && (function() {
    var l = dr, u = Symbol.for("react.element"), g = Symbol.for("react.portal"), b = Symbol.for("react.fragment"), x = Symbol.for("react.strict_mode"), y = Symbol.for("react.profiler"), m = Symbol.for("react.provider"), N = Symbol.for("react.context"), k = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), D = Symbol.for("react.suspense_list"), a = Symbol.for("react.memo"), i = Symbol.for("react.lazy"), p = Symbol.for("react.offscreen"), E = Symbol.iterator, B = "@@iterator";
    function G(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = E && e[E] || e[B];
      return typeof r == "function" ? r : null;
    }
    var V = l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function R(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        Oe("error", e, t);
      }
    }
    function Oe(e, r, t) {
      {
        var n = V.ReactDebugCurrentFrame, f = n.getStackAddendum();
        f !== "" && (r += "%s", t = t.concat([f]));
        var d = t.map(function(s) {
          return String(s);
        });
        d.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, d);
      }
    }
    var Ve = !1, Fe = !1, Ae = !1, $e = !1, Be = !1, oe;
    oe = Symbol.for("react.module.reference");
    function We(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === b || e === y || Be || e === x || e === T || e === D || $e || e === p || Ve || Fe || Ae || typeof e == "object" && e !== null && (e.$$typeof === i || e.$$typeof === a || e.$$typeof === m || e.$$typeof === N || e.$$typeof === k || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === oe || e.getModuleId !== void 0));
    }
    function Ye(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var f = r.displayName || r.name || "";
      return f !== "" ? t + "(" + f + ")" : t;
    }
    function se(e) {
      return e.displayName || "Context";
    }
    function S(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && R("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case b:
          return "Fragment";
        case g:
          return "Portal";
        case y:
          return "Profiler";
        case x:
          return "StrictMode";
        case T:
          return "Suspense";
        case D:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case N:
            var r = e;
            return se(r) + ".Consumer";
          case m:
            var t = e;
            return se(t._context) + ".Provider";
          case k:
            return Ye(e, e.render, "ForwardRef");
          case a:
            var n = e.displayName || null;
            return n !== null ? n : S(e.type) || "Memo";
          case i: {
            var f = e, d = f._payload, s = f._init;
            try {
              return S(s(d));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var P = Object.assign, W = 0, ce, le, ue, fe, de, me, pe;
    function ve() {
    }
    ve.__reactDisabledLog = !0;
    function Me() {
      {
        if (W === 0) {
          ce = console.log, le = console.info, ue = console.warn, fe = console.error, de = console.group, me = console.groupCollapsed, pe = console.groupEnd;
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
        W++;
      }
    }
    function ze() {
      {
        if (W--, W === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: P({}, e, {
              value: ce
            }),
            info: P({}, e, {
              value: le
            }),
            warn: P({}, e, {
              value: ue
            }),
            error: P({}, e, {
              value: fe
            }),
            group: P({}, e, {
              value: de
            }),
            groupCollapsed: P({}, e, {
              value: me
            }),
            groupEnd: P({}, e, {
              value: pe
            })
          });
        }
        W < 0 && R("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var X = V.ReactCurrentDispatcher, H;
    function z(e, r, t) {
      {
        if (H === void 0)
          try {
            throw Error();
          } catch (f) {
            var n = f.stack.trim().match(/\n( *(at )?)/);
            H = n && n[1] || "";
          }
        return `
` + H + e;
      }
    }
    var Z = !1, L;
    {
      var Le = typeof WeakMap == "function" ? WeakMap : Map;
      L = new Le();
    }
    function be(e, r) {
      if (!e || Z)
        return "";
      {
        var t = L.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      Z = !0;
      var f = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var d;
      d = X.current, X.current = null, Me();
      try {
        if (r) {
          var s = function() {
            throw Error();
          };
          if (Object.defineProperty(s.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(s, []);
            } catch (_) {
              n = _;
            }
            Reflect.construct(e, [], s);
          } else {
            try {
              s.call();
            } catch (_) {
              n = _;
            }
            e.call(s.prototype);
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
          for (var o = _.stack.split(`
`), w = n.stack.split(`
`), v = o.length - 1, h = w.length - 1; v >= 1 && h >= 0 && o[v] !== w[h]; )
            h--;
          for (; v >= 1 && h >= 0; v--, h--)
            if (o[v] !== w[h]) {
              if (v !== 1 || h !== 1)
                do
                  if (v--, h--, h < 0 || o[v] !== w[h]) {
                    var C = `
` + o[v].replace(" at new ", " at ");
                    return e.displayName && C.includes("<anonymous>") && (C = C.replace("<anonymous>", e.displayName)), typeof e == "function" && L.set(e, C), C;
                  }
                while (v >= 1 && h >= 0);
              break;
            }
        }
      } finally {
        Z = !1, X.current = d, ze(), Error.prepareStackTrace = f;
      }
      var A = e ? e.displayName || e.name : "", O = A ? z(A) : "";
      return typeof e == "function" && L.set(e, O), O;
    }
    function Ue(e, r, t) {
      return be(e, !1);
    }
    function Ie(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function U(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return be(e, Ie(e));
      if (typeof e == "string")
        return z(e);
      switch (e) {
        case T:
          return z("Suspense");
        case D:
          return z("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case k:
            return Ue(e.render);
          case a:
            return U(e.type, r, t);
          case i: {
            var n = e, f = n._payload, d = n._init;
            try {
              return U(d(f), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var Y = Object.prototype.hasOwnProperty, he = {}, ge = V.ReactDebugCurrentFrame;
    function I(e) {
      if (e) {
        var r = e._owner, t = U(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(t);
      } else
        ge.setExtraStackFrame(null);
    }
    function Je(e, r, t, n, f) {
      {
        var d = Function.call.bind(Y);
        for (var s in e)
          if (d(e, s)) {
            var o = void 0;
            try {
              if (typeof e[s] != "function") {
                var w = Error((n || "React class") + ": " + t + " type `" + s + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[s] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw w.name = "Invariant Violation", w;
              }
              o = e[s](r, s, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (v) {
              o = v;
            }
            o && !(o instanceof Error) && (I(f), R("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, s, typeof o), I(null)), o instanceof Error && !(o.message in he) && (he[o.message] = !0, I(f), R("Failed %s type: %s", t, o.message), I(null));
          }
      }
    }
    var qe = Array.isArray;
    function Q(e) {
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
        return R("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ke(e)), xe(e);
    }
    var M = V.ReactCurrentOwner, Xe = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ee, Ne, ee;
    ee = {};
    function He(e) {
      if (Y.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Ze(e) {
      if (Y.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function Qe(e, r) {
      if (typeof e.ref == "string" && M.current && r && M.current.stateNode !== r) {
        var t = S(M.current.type);
        ee[t] || (R('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', S(M.current.type), e.ref), ee[t] = !0);
      }
    }
    function er(e, r) {
      {
        var t = function() {
          Ee || (Ee = !0, R("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
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
          Ne || (Ne = !0, R("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var tr = function(e, r, t, n, f, d, s) {
      var o = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: u,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: s,
        // Record the component responsible for creating this element.
        _owner: d
      };
      return o._store = {}, Object.defineProperty(o._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(o, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: n
      }), Object.defineProperty(o, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: f
      }), Object.freeze && (Object.freeze(o.props), Object.freeze(o)), o;
    };
    function nr(e, r, t, n, f) {
      {
        var d, s = {}, o = null, w = null;
        t !== void 0 && (ye(t), o = "" + t), Ze(r) && (ye(r.key), o = "" + r.key), He(r) && (w = r.ref, Qe(r, f));
        for (d in r)
          Y.call(r, d) && !Xe.hasOwnProperty(d) && (s[d] = r[d]);
        if (e && e.defaultProps) {
          var v = e.defaultProps;
          for (d in v)
            s[d] === void 0 && (s[d] = v[d]);
        }
        if (o || w) {
          var h = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          o && er(s, h), w && rr(s, h);
        }
        return tr(e, o, w, f, n, M.current, s);
      }
    }
    var re = V.ReactCurrentOwner, Re = V.ReactDebugCurrentFrame;
    function F(e) {
      if (e) {
        var r = e._owner, t = U(e.type, e._source, r ? r.type : null);
        Re.setExtraStackFrame(t);
      } else
        Re.setExtraStackFrame(null);
    }
    var te;
    te = !1;
    function ne(e) {
      return typeof e == "object" && e !== null && e.$$typeof === u;
    }
    function ke() {
      {
        if (re.current) {
          var e = S(re.current.type);
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
    var we = {};
    function ir(e) {
      {
        var r = ke();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function _e(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = ir(r);
        if (we[t])
          return;
        we[t] = !0;
        var n = "";
        e && e._owner && e._owner !== re.current && (n = " It was passed a child from " + S(e._owner.type) + "."), F(e), R('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), F(null);
      }
    }
    function Ce(e, r) {
      {
        if (typeof e != "object")
          return;
        if (Q(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            ne(n) && _e(n, r);
          }
        else if (ne(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var f = G(e);
          if (typeof f == "function" && f !== e.entries)
            for (var d = f.call(e), s; !(s = d.next()).done; )
              ne(s.value) && _e(s.value, r);
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
        else if (typeof r == "object" && (r.$$typeof === k || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === a))
          t = r.propTypes;
        else
          return;
        if (t) {
          var n = S(r);
          Je(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !te) {
          te = !0;
          var f = S(r);
          R("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", f || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && R("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function sr(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            F(e), R("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), F(null);
            break;
          }
        }
        e.ref !== null && (F(e), R("Invalid attribute `ref` supplied to `React.Fragment`."), F(null));
      }
    }
    var De = {};
    function cr(e, r, t, n, f, d) {
      {
        var s = We(e);
        if (!s) {
          var o = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (o += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var w = ar(f);
          w ? o += w : o += ke();
          var v;
          e === null ? v = "null" : Q(e) ? v = "array" : e !== void 0 && e.$$typeof === u ? (v = "<" + (S(e.type) || "Unknown") + " />", o = " Did you accidentally export a JSX literal instead of a component?") : v = typeof e, R("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", v, o);
        }
        var h = nr(e, r, t, f, d);
        if (h == null)
          return h;
        if (s) {
          var C = r.children;
          if (C !== void 0)
            if (n)
              if (Q(C)) {
                for (var A = 0; A < C.length; A++)
                  Ce(C[A], e);
                Object.freeze && Object.freeze(C);
              } else
                R("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Ce(C, e);
        }
        if (Y.call(r, "key")) {
          var O = S(e), _ = Object.keys(r).filter(function(fr) {
            return fr !== "key";
          }), ae = _.length > 0 ? "{key: someKey, " + _.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!De[O + ae]) {
            var ur = _.length > 0 ? "{" + _.join(": ..., ") + ": ...}" : "{}";
            R(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ae, O, ur, O), De[O + ae] = !0;
          }
        }
        return e === b ? sr(h) : or(h), h;
      }
    }
    var lr = cr;
    K.Fragment = b, K.jsxDEV = lr;
  })()), K;
}
var Te;
function br() {
  return Te || (Te = 1, process.env.NODE_ENV === "production" ? J.exports = pr() : J.exports = vr()), J.exports;
}
var c = br();
const hr = "_card_12yoz_4", gr = "_tooltip_12yoz_25", xr = "_cardBack_12yoz_48", yr = "_deckContainer_12yoz_61", Er = "_deckCard_12yoz_69", Nr = "_deckCardFront_12yoz_82", Rr = "_deckSection_12yoz_98", j = {
  card: hr,
  tooltip: gr,
  cardBack: xr,
  deckContainer: yr,
  deckCard: Er,
  deckCardFront: Nr,
  deckSection: Rr
};
function wr({ socket: l, deckId: u, name: g, playerId: b = null }) {
  const [x, y] = $.useState([]), [m, N] = $.useState([]);
  $.useEffect(() => (l.on(`deck:init:${u}`, (a) => {
    y(a.currentDeck.map((i) => ({ ...i, deckId: u }))), N(a.drawnCards.map((i) => ({ ...i, deckId: u })));
  }), l.on(`deck:update:${u}`, (a) => {
    y(a.currentDeck.map((i) => ({ ...i, deckId: u }))), N(a.drawnCards.map((i) => ({ ...i, deckId: u })));
  }), () => {
    l.off(`deck:init:${u}`), l.off(`deck:update:${u}`);
  }), [l, u]);
  const k = () => {
    x.length !== 0 && l.emit("deck:draw", { deckId: u, playerId: b });
  }, T = () => l.emit("deck:shuffle", { deckId: u }), D = () => l.emit("deck:reset", { deckId: u });
  return /* @__PURE__ */ c.jsxDEV("section", { className: j.deckSection, children: [
    /* @__PURE__ */ c.jsxDEV("h3", { style: { marginBottom: "6px" }, children: g }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ c.jsxDEV("div", { className: j.deckControls, children: [
      /* @__PURE__ */ c.jsxDEV("button", { onClick: T, children: "シャッフル" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 50,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ c.jsxDEV("button", { onClick: D, children: "山札に戻す" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 51,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ c.jsxDEV("div", { className: j.deckWrapper, children: [
      /* @__PURE__ */ c.jsxDEV("div", { className: j.deckContainer, onClick: k, children: x.map((a, i) => /* @__PURE__ */ c.jsxDEV(
        "div",
        {
          className: j.deckCard,
          style: {
            zIndex: x.length - i,
            transform: `translate(${i * 0.5}px, ${i * 0.5}px)`,
            backgroundColor: a.backColor
          }
        },
        a.id,
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
      /* @__PURE__ */ c.jsxDEV("div", { className: j.deckContainer, children: m.map((a, i) => /* @__PURE__ */ c.jsxDEV(
        "div",
        {
          className: j.deckCardFront,
          style: { zIndex: i + 1, transform: `translate(${i * 0.5}px, ${i * 0.5}px)` },
          children: a.isFaceUp && a.name
        },
        a.id,
        !1,
        {
          fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
          lineNumber: 71,
          columnNumber: 13
        },
        this
      )) }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 69,
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
function _r({ sides: l = 6, socket: u = null, diceId: g, onRoll: b }) {
  const [x, y] = ie(null), [m, N] = ie(!1), k = mr(null);
  Pe(() => {
    if (!u) return;
    const D = (a) => {
      N(!0);
      const i = 1e3, p = 50;
      let E = 0;
      const B = i / p;
      k.current = setInterval(() => {
        const G = Math.floor(Math.random() * l) + 1;
        y(G), E++, E >= B && (clearInterval(k.current), k.current = null, y(a), N(!1), b?.(a));
      }, p);
    };
    return u.on(`dice:rolled:${g}`, D), () => {
      u.off(`dice:rolled:${g}`, D), k.current && clearInterval(k.current);
    };
  }, [u, l, g, b]);
  const T = () => {
    !u || m || u.emit("dice:roll", { diceId: g, sides: l });
  };
  return /* @__PURE__ */ c.jsxDEV(
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
        cursor: m ? "not-allowed" : "pointer",
        userSelect: "none",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s"
      },
      onClick: T,
      children: x ?? "🎲"
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
function Cr({ socket: l, deckId: u }) {
  const [g, b] = $.useState([]);
  return $.useEffect(() => {
    const x = (y) => {
      b(y.playFieldCards || []);
    };
    return l.on(`deck:update:${u}`, x), () => {
      l.off(`deck:update:${u}`, x);
    };
  }, [l, u]), /* @__PURE__ */ c.jsxDEV("section", { style: { border: "2px dashed #ccc", borderRadius: "10px", padding: "12px", margin: "12px 0", background: "#fafafa" }, children: [
    /* @__PURE__ */ c.jsxDEV("h3", { style: { marginBottom: "8px" }, children: "プレイエリア" }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/PlayField.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ c.jsxDEV("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "120px" }, children: [
      g.length === 0 && /* @__PURE__ */ c.jsxDEV("div", { style: { opacity: 0.6 }, children: "（まだカードが出ていません）" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/PlayField.tsx",
        lineNumber: 39,
        columnNumber: 38
      }, this),
      g.map((x) => /* @__PURE__ */ c.jsxDEV(
        "div",
        {
          style: {
            width: "80px",
            height: "120px",
            border: "1px solid #999",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            cursor: "pointer",
            position: "relative"
          },
          onMouseEnter: (y) => {
            const m = y.currentTarget.querySelector(".tooltip");
            m && (m.style.display = "block");
          },
          onMouseLeave: (y) => {
            const m = y.currentTarget.querySelector(".tooltip");
            m && (m.style.display = "none");
          },
          children: [
            x.name,
            x.description && /* @__PURE__ */ c.jsxDEV(
              "span",
              {
                className: "tooltip",
                style: {
                  display: "none",
                  position: "absolute",
                  bottom: "110%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "6px 10px",
                  background: "#333",
                  color: "white",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                  zIndex: 1e3,
                  fontSize: "12px"
                },
                children: x.description
              },
              void 0,
              !1,
              {
                fileName: "/workspaces/react-game-ui/src/components/PlayField.tsx",
                lineNumber: 71,
                columnNumber: 21
              },
              this
            )
          ]
        },
        x.id,
        !0,
        {
          fileName: "/workspaces/react-game-ui/src/components/PlayField.tsx",
          lineNumber: 43,
          columnNumber: 17
        },
        this
      ))
    ] }, void 0, !0, {
      fileName: "/workspaces/react-game-ui/src/components/PlayField.tsx",
      lineNumber: 38,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "/workspaces/react-game-ui/src/components/PlayField.tsx",
    lineNumber: 36,
    columnNumber: 5
  }, this);
}
function Dr({
  socket: l,
  players: u,
  currentPlayerId: g,
  myPlayerId: b,
  backColor: x = "#000000ff"
}) {
  const y = () => l.emit("game:next-turn"), [m, N] = $.useState([]), k = (u || []).map((a) => ({
    ...a,
    score: a.score ?? 0,
    cards: a.cards ?? []
  })), T = (a, i) => {
    i && N(
      (p) => p.includes(a) ? p.filter((E) => E !== a) : [...p, a]
    );
  }, D = () => {
    if (m.length === 0 || !b) return;
    const a = k.find((p) => p.id === b);
    if (!a) return;
    const i = {};
    m.forEach((p) => {
      const E = a.cards.find((B) => B.id === p);
      E && (i[E.deckId] || (i[E.deckId] = []), i[E.deckId].push(E.id));
    }), Object.entries(i).forEach(([p, E]) => {
      l.emit("card:play", {
        deckId: p,
        cardIds: E,
        // そのデッキ内の複数カード
        playerId: b,
        playLocation: "field"
      });
    }), N([]);
  };
  return /* @__PURE__ */ c.jsxDEV("div", { style: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }, children: [
    /* @__PURE__ */ c.jsxDEV("h2", { children: "Scoreboard" }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 69,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ c.jsxDEV("ul", { style: { listStyle: "none", padding: 0 }, children: k.map((a) => /* @__PURE__ */ c.jsxDEV(
      "li",
      {
        style: {
          padding: "6px 12px",
          marginBottom: "6px",
          borderRadius: "4px",
          backgroundColor: a.id === g ? "#a0e7ff" : "#f5f5f5",
          fontWeight: a.id === g ? "bold" : "normal"
        },
        children: [
          /* @__PURE__ */ c.jsxDEV("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ c.jsxDEV("span", { children: [
              a.id === b && "⭐️",
              " ",
              a.name
            ] }, void 0, !0, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 83,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ c.jsxDEV("span", { children: a.score }, void 0, !1, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 84,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
            lineNumber: 82,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ c.jsxDEV("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: a.cards.map((i) => {
            const p = !!i.isFaceUp && a.id === b, E = m.includes(i.id);
            return /* @__PURE__ */ c.jsxDEV(
              "div",
              {
                className: p ? j.card : j.cardBack,
                style: {
                  position: "relative",
                  cursor: p ? "pointer" : "default",
                  width: "60px",
                  height: "80px",
                  backgroundColor: p ? void 0 : i.backColor,
                  border: E ? "2px solid gold" : "none",
                  boxSizing: "border-box"
                },
                onClick: () => T(i.id, p),
                children: [
                  p && i.name,
                  p && i.description && /* @__PURE__ */ c.jsxDEV("span", { className: j.tooltip, children: i.description }, void 0, !1, {
                    fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
                    lineNumber: 109,
                    columnNumber: 23
                  }, this)
                ]
              },
              i.id,
              !0,
              {
                fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
                lineNumber: 93,
                columnNumber: 19
              },
              this
            );
          }) }, void 0, !1, {
            fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
            lineNumber: 87,
            columnNumber: 13
          }, this)
        ]
      },
      a.id,
      !0,
      {
        fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
        lineNumber: 72,
        columnNumber: 11
      },
      this
    )) }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ c.jsxDEV("div", { style: { marginTop: "12px", display: "flex", gap: "6px" }, children: [
      /* @__PURE__ */ c.jsxDEV("button", { onClick: D, disabled: m.length === 0, children: "選択カードを出す" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
        lineNumber: 120,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ c.jsxDEV("button", { onClick: y, children: "次のターン" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
        lineNumber: 123,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 119,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
    lineNumber: 68,
    columnNumber: 5
  }, this);
}
function Sr({ socket: l = null, onFinish: u }) {
  const [g, b] = ie(null);
  Pe(() => {
    if (!l) return;
    const y = (N) => {
      b(N);
    }, m = (N) => {
      b(N), N <= 0 && u?.();
    };
    return l.on("timer:start", y), l.on("timer:update", m), () => {
      l.off("timer:start", y), l.off("timer:update", m);
    };
  }, [l, u]);
  const x = () => {
    l && l.emit("timer:start", 30);
  };
  return /* @__PURE__ */ c.jsxDEV(
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
        /* @__PURE__ */ c.jsxDEV(
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
        /* @__PURE__ */ c.jsxDEV("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ c.jsxDEV("button", { onClick: x, style: { marginRight: "4px" }, children: "開始" }, void 0, !1, {
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
  wr as Deck,
  _r as Dice,
  Cr as PlayField,
  Dr as ScoreBoard,
  Sr as Timer
};
