import * as te from "react";
import De, { useState as ne, useRef as hr, useEffect as Fe } from "react";
var B = { exports: {} }, N = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Oe;
function mr() {
  if (Oe) return N;
  Oe = 1;
  var u = De, o = Symbol.for("react.element"), b = Symbol.for("react.fragment"), _ = Object.prototype.hasOwnProperty, C = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, x = { key: !0, ref: !0, __self: !0, __source: !0 };
  function c(d, s, j) {
    var h, m = {}, p = null, k = null;
    j !== void 0 && (p = "" + j), s.key !== void 0 && (p = "" + s.key), s.ref !== void 0 && (k = s.ref);
    for (h in s) _.call(s, h) && !x.hasOwnProperty(h) && (m[h] = s[h]);
    if (d && d.defaultProps) for (h in s = d.defaultProps, s) m[h] === void 0 && (m[h] = s[h]);
    return { $$typeof: o, type: d, key: p, ref: k, props: m, _owner: C.current };
  }
  return N.Fragment = b, N.jsx = c, N.jsxs = c, N;
}
var L = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ke;
function gr() {
  return ke || (ke = 1, process.env.NODE_ENV !== "production" && (function() {
    var u = De, o = Symbol.for("react.element"), b = Symbol.for("react.portal"), _ = Symbol.for("react.fragment"), C = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), d = Symbol.for("react.context"), s = Symbol.for("react.forward_ref"), j = Symbol.for("react.suspense"), h = Symbol.for("react.suspense_list"), m = Symbol.for("react.memo"), p = Symbol.for("react.lazy"), k = Symbol.for("react.offscreen"), W = Symbol.iterator, q = "@@iterator";
    function J(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = W && e[W] || e[q];
      return typeof r == "function" ? r : null;
    }
    var F = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function R(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        $e("error", e, t);
      }
    }
    function $e(e, r, t) {
      {
        var n = F.ReactDebugCurrentFrame, l = n.getStackAddendum();
        l !== "" && (r += "%s", t = t.concat([l]));
        var f = t.map(function(i) {
          return String(i);
        });
        f.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, f);
      }
    }
    var Ae = !1, We = !1, Ye = !1, Ie = !1, Ne = !1, ae;
    ae = Symbol.for("react.module.reference");
    function Le(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === _ || e === x || Ne || e === C || e === j || e === h || Ie || e === k || Ae || We || Ye || typeof e == "object" && e !== null && (e.$$typeof === p || e.$$typeof === m || e.$$typeof === c || e.$$typeof === d || e.$$typeof === s || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ae || e.getModuleId !== void 0));
    }
    function Me(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var l = r.displayName || r.name || "";
      return l !== "" ? t + "(" + l + ")" : t;
    }
    function ie(e) {
      return e.displayName || "Context";
    }
    function O(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && R("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case _:
          return "Fragment";
        case b:
          return "Portal";
        case x:
          return "Profiler";
        case C:
          return "StrictMode";
        case j:
          return "Suspense";
        case h:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case d:
            var r = e;
            return ie(r) + ".Consumer";
          case c:
            var t = e;
            return ie(t._context) + ".Provider";
          case s:
            return Me(e, e.render, "ForwardRef");
          case m:
            var n = e.displayName || null;
            return n !== null ? n : O(e.type) || "Memo";
          case p: {
            var l = e, f = l._payload, i = l._init;
            try {
              return O(i(f));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var P = Object.assign, Y = 0, oe, se, le, ue, ce, fe, de;
    function ve() {
    }
    ve.__reactDisabledLog = !0;
    function Ue() {
      {
        if (Y === 0) {
          oe = console.log, se = console.info, le = console.warn, ue = console.error, ce = console.group, fe = console.groupCollapsed, de = console.groupEnd;
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
        Y++;
      }
    }
    function Ve() {
      {
        if (Y--, Y === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: P({}, e, {
              value: oe
            }),
            info: P({}, e, {
              value: se
            }),
            warn: P({}, e, {
              value: le
            }),
            error: P({}, e, {
              value: ue
            }),
            group: P({}, e, {
              value: ce
            }),
            groupCollapsed: P({}, e, {
              value: fe
            }),
            groupEnd: P({}, e, {
              value: de
            })
          });
        }
        Y < 0 && R("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var K = F.ReactCurrentDispatcher, G;
    function M(e, r, t) {
      {
        if (G === void 0)
          try {
            throw Error();
          } catch (l) {
            var n = l.stack.trim().match(/\n( *(at )?)/);
            G = n && n[1] || "";
          }
        return `
` + G + e;
      }
    }
    var X = !1, U;
    {
      var ze = typeof WeakMap == "function" ? WeakMap : Map;
      U = new ze();
    }
    function pe(e, r) {
      if (!e || X)
        return "";
      {
        var t = U.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      X = !0;
      var l = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var f;
      f = K.current, K.current = null, Ue();
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
            } catch (S) {
              n = S;
            }
            Reflect.construct(e, [], i);
          } else {
            try {
              i.call();
            } catch (S) {
              n = S;
            }
            e.call(i.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (S) {
            n = S;
          }
          e();
        }
      } catch (S) {
        if (S && n && typeof S.stack == "string") {
          for (var a = S.stack.split(`
`), E = n.stack.split(`
`), g = a.length - 1, y = E.length - 1; g >= 1 && y >= 0 && a[g] !== E[y]; )
            y--;
          for (; g >= 1 && y >= 0; g--, y--)
            if (a[g] !== E[y]) {
              if (g !== 1 || y !== 1)
                do
                  if (g--, y--, y < 0 || a[g] !== E[y]) {
                    var T = `
` + a[g].replace(" at new ", " at ");
                    return e.displayName && T.includes("<anonymous>") && (T = T.replace("<anonymous>", e.displayName)), typeof e == "function" && U.set(e, T), T;
                  }
                while (g >= 1 && y >= 0);
              break;
            }
        }
      } finally {
        X = !1, K.current = f, Ve(), Error.prepareStackTrace = l;
      }
      var A = e ? e.displayName || e.name : "", D = A ? M(A) : "";
      return typeof e == "function" && U.set(e, D), D;
    }
    function Be(e, r, t) {
      return pe(e, !1);
    }
    function qe(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function V(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return pe(e, qe(e));
      if (typeof e == "string")
        return M(e);
      switch (e) {
        case j:
          return M("Suspense");
        case h:
          return M("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case s:
            return Be(e.render);
          case m:
            return V(e.type, r, t);
          case p: {
            var n = e, l = n._payload, f = n._init;
            try {
              return V(f(l), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var I = Object.prototype.hasOwnProperty, he = {}, me = F.ReactDebugCurrentFrame;
    function z(e) {
      if (e) {
        var r = e._owner, t = V(e.type, e._source, r ? r.type : null);
        me.setExtraStackFrame(t);
      } else
        me.setExtraStackFrame(null);
    }
    function Je(e, r, t, n, l) {
      {
        var f = Function.call.bind(I);
        for (var i in e)
          if (f(e, i)) {
            var a = void 0;
            try {
              if (typeof e[i] != "function") {
                var E = Error((n || "React class") + ": " + t + " type `" + i + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[i] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw E.name = "Invariant Violation", E;
              }
              a = e[i](r, i, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (g) {
              a = g;
            }
            a && !(a instanceof Error) && (z(l), R("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, i, typeof a), z(null)), a instanceof Error && !(a.message in he) && (he[a.message] = !0, z(l), R("Failed %s type: %s", t, a.message), z(null));
          }
      }
    }
    var Ke = Array.isArray;
    function H(e) {
      return Ke(e);
    }
    function Ge(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function Xe(e) {
      try {
        return ge(e), !1;
      } catch {
        return !0;
      }
    }
    function ge(e) {
      return "" + e;
    }
    function ye(e) {
      if (Xe(e))
        return R("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ge(e)), ge(e);
    }
    var be = F.ReactCurrentOwner, He = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, _e, xe;
    function Ze(e) {
      if (I.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Qe(e) {
      if (I.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function er(e, r) {
      typeof e.ref == "string" && be.current;
    }
    function rr(e, r) {
      {
        var t = function() {
          _e || (_e = !0, R("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function tr(e, r) {
      {
        var t = function() {
          xe || (xe = !0, R("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var nr = function(e, r, t, n, l, f, i) {
      var a = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: o,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: i,
        // Record the component responsible for creating this element.
        _owner: f
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
        value: l
      }), Object.freeze && (Object.freeze(a.props), Object.freeze(a)), a;
    };
    function ar(e, r, t, n, l) {
      {
        var f, i = {}, a = null, E = null;
        t !== void 0 && (ye(t), a = "" + t), Qe(r) && (ye(r.key), a = "" + r.key), Ze(r) && (E = r.ref, er(r, l));
        for (f in r)
          I.call(r, f) && !He.hasOwnProperty(f) && (i[f] = r[f]);
        if (e && e.defaultProps) {
          var g = e.defaultProps;
          for (f in g)
            i[f] === void 0 && (i[f] = g[f]);
        }
        if (a || E) {
          var y = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          a && rr(i, y), E && tr(i, y);
        }
        return nr(e, a, E, l, n, be.current, i);
      }
    }
    var Z = F.ReactCurrentOwner, Re = F.ReactDebugCurrentFrame;
    function $(e) {
      if (e) {
        var r = e._owner, t = V(e.type, e._source, r ? r.type : null);
        Re.setExtraStackFrame(t);
      } else
        Re.setExtraStackFrame(null);
    }
    var Q;
    Q = !1;
    function ee(e) {
      return typeof e == "object" && e !== null && e.$$typeof === o;
    }
    function Ee() {
      {
        if (Z.current) {
          var e = O(Z.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function ir(e) {
      return "";
    }
    var Ce = {};
    function or(e) {
      {
        var r = Ee();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function je(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = or(r);
        if (Ce[t])
          return;
        Ce[t] = !0;
        var n = "";
        e && e._owner && e._owner !== Z.current && (n = " It was passed a child from " + O(e._owner.type) + "."), $(e), R('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), $(null);
      }
    }
    function Se(e, r) {
      {
        if (typeof e != "object")
          return;
        if (H(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            ee(n) && je(n, r);
          }
        else if (ee(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var l = J(e);
          if (typeof l == "function" && l !== e.entries)
            for (var f = l.call(e), i; !(i = f.next()).done; )
              ee(i.value) && je(i.value, r);
        }
      }
    }
    function sr(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === s || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === m))
          t = r.propTypes;
        else
          return;
        if (t) {
          var n = O(r);
          Je(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !Q) {
          Q = !0;
          var l = O(r);
          R("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", l || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && R("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function lr(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            $(e), R("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), $(null);
            break;
          }
        }
        e.ref !== null && ($(e), R("Invalid attribute `ref` supplied to `React.Fragment`."), $(null));
      }
    }
    var Te = {};
    function we(e, r, t, n, l, f) {
      {
        var i = Le(e);
        if (!i) {
          var a = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (a += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var E = ir();
          E ? a += E : a += Ee();
          var g;
          e === null ? g = "null" : H(e) ? g = "array" : e !== void 0 && e.$$typeof === o ? (g = "<" + (O(e.type) || "Unknown") + " />", a = " Did you accidentally export a JSX literal instead of a component?") : g = typeof e, R("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", g, a);
        }
        var y = ar(e, r, t, l, f);
        if (y == null)
          return y;
        if (i) {
          var T = r.children;
          if (T !== void 0)
            if (n)
              if (H(T)) {
                for (var A = 0; A < T.length; A++)
                  Se(T[A], e);
                Object.freeze && Object.freeze(T);
              } else
                R("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Se(T, e);
        }
        if (I.call(r, "key")) {
          var D = O(e), S = Object.keys(r).filter(function(pr) {
            return pr !== "key";
          }), re = S.length > 0 ? "{key: someKey, " + S.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Te[D + re]) {
            var vr = S.length > 0 ? "{" + S.join(": ..., ") + ": ...}" : "{}";
            R(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, re, D, vr, D), Te[D + re] = !0;
          }
        }
        return e === _ ? lr(y) : sr(y), y;
      }
    }
    function ur(e, r, t) {
      return we(e, r, t, !0);
    }
    function cr(e, r, t) {
      return we(e, r, t, !1);
    }
    var fr = cr, dr = ur;
    L.Fragment = _, L.jsx = fr, L.jsxs = dr;
  })()), L;
}
var Pe;
function yr() {
  return Pe || (Pe = 1, process.env.NODE_ENV === "production" ? B.exports = mr() : B.exports = gr()), B.exports;
}
var v = yr();
const br = "_card_12yoz_4", _r = "_tooltip_12yoz_25", xr = "_cardBack_12yoz_48", Rr = "_deckContainer_12yoz_61", Er = "_deckCard_12yoz_69", Cr = "_deckCardFront_12yoz_82", jr = "_deckSection_12yoz_98", w = {
  card: br,
  tooltip: _r,
  cardBack: xr,
  deckContainer: Rr,
  deckCard: Er,
  deckCardFront: Cr,
  deckSection: jr
};
function Tr({ socket: u, deckId: o, name: b, playerId: _ = null }) {
  const [C, x] = te.useState([]), [c, d] = te.useState([]);
  te.useEffect(() => (u.on(`deck:init:${o}`, (m) => {
    x(m.currentDeck.map((p) => ({ ...p, deckId: o }))), d(m.drawnCards.map((p) => ({ ...p, deckId: o })));
  }), u.on(`deck:update:${o}`, (m) => {
    x(m.currentDeck.map((p) => ({ ...p, deckId: o }))), d(m.drawnCards.map((p) => ({ ...p, deckId: o })));
  }), () => {
    u.off(`deck:init:${o}`), u.off(`deck:update:${o}`);
  }), [u, o]);
  const s = () => {
    C.length !== 0 && u.emit("deck:draw", { deckId: o, playerId: _ });
  }, j = () => u.emit("deck:shuffle", { deckId: o }), h = () => u.emit("deck:reset", { deckId: o });
  return /* @__PURE__ */ v.jsxs("section", { className: w.deckSection, children: [
    /* @__PURE__ */ v.jsx("h3", { style: { marginBottom: "6px" }, children: b }),
    /* @__PURE__ */ v.jsxs("div", { className: w.deckControls, children: [
      /* @__PURE__ */ v.jsx("button", { onClick: j, children: "シャッフル" }),
      /* @__PURE__ */ v.jsx("button", { onClick: h, children: "山札に戻す" })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: w.deckWrapper, children: [
      /* @__PURE__ */ v.jsx("div", { className: w.deckContainer, onClick: s, children: C.map((m, p) => /* @__PURE__ */ v.jsx(
        "div",
        {
          className: w.deckCard,
          style: { zIndex: C.length - p, transform: `translate(${p * 0.5}px, ${p * 0.5}px)` }
        },
        m.id
      )) }),
      /* @__PURE__ */ v.jsx("div", { className: w.deckContainer, children: c.map((m, p) => /* @__PURE__ */ v.jsx(
        "div",
        {
          className: w.deckCardFront,
          style: { zIndex: p + 1, transform: `translate(${p * 0.5}px, ${p * 0.5}px)` },
          children: m.isFaceUp && m.name
        },
        m.id
      )) })
    ] })
  ] });
}
function wr({ sides: u = 6, socket: o = null, diceId: b, onRoll: _ }) {
  const [C, x] = ne(null), [c, d] = ne(!1), s = hr(null);
  Fe(() => {
    if (!o) return;
    const h = (m) => {
      d(!0);
      const p = 1e3, k = 50;
      let W = 0;
      const q = p / k;
      s.current = setInterval(() => {
        const J = Math.floor(Math.random() * u) + 1;
        x(J), W++, W >= q && (clearInterval(s.current), s.current = null, x(m), d(!1), _?.(m));
      }, k);
    };
    return o.on(`dice:rolled:${b}`, h), () => {
      o.off(`dice:rolled:${b}`, h), s.current && clearInterval(s.current);
    };
  }, [o, u, b, _]);
  const j = () => {
    !o || c || o.emit("dice:roll", { diceId: b, sides: u });
  };
  return /* @__PURE__ */ v.jsx(
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
        cursor: c ? "not-allowed" : "pointer",
        userSelect: "none",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s"
      },
      onClick: j,
      children: C ?? "🎲"
    }
  );
}
function Or({ socket: u, players: o, currentPlayerId: b, myPlayerId: _ }) {
  const C = () => u.emit("game:next-turn"), x = (o || []).map((c) => ({
    ...c,
    score: c.score ?? 0,
    cards: c.cards ?? []
  }));
  return /* @__PURE__ */ v.jsxs("div", { style: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }, children: [
    /* @__PURE__ */ v.jsx("h2", { children: "Scoreboard" }),
    /* @__PURE__ */ v.jsx("ul", { style: { listStyle: "none", padding: 0 }, children: x.map((c) => /* @__PURE__ */ v.jsxs(
      "li",
      {
        style: {
          padding: "6px 12px",
          marginBottom: "6px",
          borderRadius: "4px",
          backgroundColor: c.id === b ? "#a0e7ff" : "#f5f5f5",
          fontWeight: c.id === b ? "bold" : "normal"
        },
        children: [
          /* @__PURE__ */ v.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ v.jsxs("span", { children: [
              c.id === _ && "⭐️",
              " ",
              c.name
            ] }),
            /* @__PURE__ */ v.jsx("span", { children: c.score })
          ] }),
          /* @__PURE__ */ v.jsx("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: c.cards.map((d) => {
            const s = d.isFaceUp && c.id === _;
            return /* @__PURE__ */ v.jsxs(
              "div",
              {
                className: s ? w.card : w.cardBack,
                style: { position: "relative", cursor: "pointer", width: "60px", height: "80px" },
                onMouseEnter: (j) => {
                  if (!s) return;
                  const h = j.currentTarget.querySelector(`.${w.tooltip}`);
                  h && (h.style.display = "block");
                },
                onMouseLeave: (j) => {
                  if (!s) return;
                  const h = j.currentTarget.querySelector(`.${w.tooltip}`);
                  h && (h.style.display = "none");
                },
                onClick: () => {
                  s && u.emit("card:play", { deckId: d.deckId, cardId: d.id, playerId: c.id });
                },
                children: [
                  s && d.name,
                  s && d.description && /* @__PURE__ */ v.jsx("span", { className: w.tooltip, children: d.description })
                ]
              },
              d.id
            );
          }) })
        ]
      },
      c.id
    )) }),
    /* @__PURE__ */ v.jsx("button", { onClick: C, children: "次のターン" })
  ] });
}
function kr({ socket: u = null, onFinish: o }) {
  const [b, _] = ne(null);
  Fe(() => {
    if (!u) return;
    const x = (d) => {
      _(d);
    }, c = (d) => {
      _(d), d <= 0 && o?.();
    };
    return u.on("timer:start", x), u.on("timer:update", c), () => {
      u.off("timer:start", x), u.off("timer:update", c);
    };
  }, [u, o]);
  const C = () => {
    u && u.emit("timer:start", 30);
  };
  return /* @__PURE__ */ v.jsxs(
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
        /* @__PURE__ */ v.jsxs(
          "div",
          {
            style: {
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: b !== null ? b <= 6 ? "red" : b <= 15 ? "orange" : "green" : "gray",
              transition: "color 0.5s ease"
            },
            children: [
              "残り時間: ",
              b ?? "-",
              "s"
            ]
          }
        ),
        /* @__PURE__ */ v.jsx("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ v.jsx("button", { onClick: C, style: { marginRight: "4px" }, children: "開始" }) })
      ]
    }
  );
}
export {
  Tr as Deck,
  wr as Dice,
  Or as ScoreBoard,
  kr as Timer
};
