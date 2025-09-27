import q, { useState as oe, useRef as dr, useEffect as Oe } from "react";
var z = { exports: {} }, U = {};
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
function mr() {
  if (Se) return U;
  Se = 1;
  var s = Symbol.for("react.fragment");
  return U.Fragment = s, U.jsxDEV = void 0, U;
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
function pr() {
  return Te || (Te = 1, process.env.NODE_ENV !== "production" && (function() {
    var s = q, c = Symbol.for("react.element"), x = Symbol.for("react.portal"), R = Symbol.for("react.fragment"), N = Symbol.for("react.strict_mode"), f = Symbol.for("react.profiler"), v = Symbol.for("react.provider"), g = Symbol.for("react.context"), b = Symbol.for("react.forward_ref"), S = Symbol.for("react.suspense"), D = Symbol.for("react.suspense_list"), h = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), B = Symbol.for("react.offscreen"), F = Symbol.iterator, K = "@@iterator";
    function G(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = F && e[F] || e[K];
      return typeof r == "function" ? r : null;
    }
    var O = s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function y(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        Pe("error", e, t);
      }
    }
    function Pe(e, r, t) {
      {
        var n = O.ReactDebugCurrentFrame, i = n.getStackAddendum();
        i !== "" && (r += "%s", t = t.concat([i]));
        var u = t.map(function(o) {
          return String(o);
        });
        u.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, u);
      }
    }
    var Ve = !1, Fe = !1, $e = !1, Ae = !1, We = !1, ie;
    ie = Symbol.for("react.module.reference");
    function Be(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === R || e === f || We || e === N || e === S || e === D || Ae || e === B || Ve || Fe || $e || typeof e == "object" && e !== null && (e.$$typeof === d || e.$$typeof === h || e.$$typeof === v || e.$$typeof === g || e.$$typeof === b || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ie || e.getModuleId !== void 0));
    }
    function Ye(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var i = r.displayName || r.name || "";
      return i !== "" ? t + "(" + i + ")" : t;
    }
    function se(e) {
      return e.displayName || "Context";
    }
    function C(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && y("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case R:
          return "Fragment";
        case x:
          return "Portal";
        case f:
          return "Profiler";
        case N:
          return "StrictMode";
        case S:
          return "Suspense";
        case D:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case g:
            var r = e;
            return se(r) + ".Consumer";
          case v:
            var t = e;
            return se(t._context) + ".Provider";
          case b:
            return Ye(e, e.render, "ForwardRef");
          case h:
            var n = e.displayName || null;
            return n !== null ? n : C(e.type) || "Memo";
          case d: {
            var i = e, u = i._payload, o = i._init;
            try {
              return C(o(u));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var T = Object.assign, $ = 0, ce, ue, le, fe, de, me, pe;
    function ve() {
    }
    ve.__reactDisabledLog = !0;
    function Ie() {
      {
        if ($ === 0) {
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
        $++;
      }
    }
    function Me() {
      {
        if ($--, $ === 0) {
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
        $ < 0 && y("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var X = O.ReactCurrentDispatcher, H;
    function Y(e, r, t) {
      {
        if (H === void 0)
          try {
            throw Error();
          } catch (i) {
            var n = i.stack.trim().match(/\n( *(at )?)/);
            H = n && n[1] || "";
          }
        return `
` + H + e;
      }
    }
    var Z = !1, I;
    {
      var Le = typeof WeakMap == "function" ? WeakMap : Map;
      I = new Le();
    }
    function be(e, r) {
      if (!e || Z)
        return "";
      {
        var t = I.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      Z = !0;
      var i = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var u;
      u = X.current, X.current = null, Ie();
      try {
        if (r) {
          var o = function() {
            throw Error();
          };
          if (Object.defineProperty(o.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(o, []);
            } catch (_) {
              n = _;
            }
            Reflect.construct(e, [], o);
          } else {
            try {
              o.call();
            } catch (_) {
              n = _;
            }
            e.call(o.prototype);
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
`), m = a.length - 1, p = E.length - 1; m >= 1 && p >= 0 && a[m] !== E[p]; )
            p--;
          for (; m >= 1 && p >= 0; m--, p--)
            if (a[m] !== E[p]) {
              if (m !== 1 || p !== 1)
                do
                  if (m--, p--, p < 0 || a[m] !== E[p]) {
                    var w = `
` + a[m].replace(" at new ", " at ");
                    return e.displayName && w.includes("<anonymous>") && (w = w.replace("<anonymous>", e.displayName)), typeof e == "function" && I.set(e, w), w;
                  }
                while (m >= 1 && p >= 0);
              break;
            }
        }
      } finally {
        Z = !1, X.current = u, Me(), Error.prepareStackTrace = i;
      }
      var V = e ? e.displayName || e.name : "", j = V ? Y(V) : "";
      return typeof e == "function" && I.set(e, j), j;
    }
    function ze(e, r, t) {
      return be(e, !1);
    }
    function Ue(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function M(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return be(e, Ue(e));
      if (typeof e == "string")
        return Y(e);
      switch (e) {
        case S:
          return Y("Suspense");
        case D:
          return Y("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case b:
            return ze(e.render);
          case h:
            return M(e.type, r, t);
          case d: {
            var n = e, i = n._payload, u = n._init;
            try {
              return M(u(i), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var A = Object.prototype.hasOwnProperty, he = {}, ge = O.ReactDebugCurrentFrame;
    function L(e) {
      if (e) {
        var r = e._owner, t = M(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(t);
      } else
        ge.setExtraStackFrame(null);
    }
    function Je(e, r, t, n, i) {
      {
        var u = Function.call.bind(A);
        for (var o in e)
          if (u(e, o)) {
            var a = void 0;
            try {
              if (typeof e[o] != "function") {
                var E = Error((n || "React class") + ": " + t + " type `" + o + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[o] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw E.name = "Invariant Violation", E;
              }
              a = e[o](r, o, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (m) {
              a = m;
            }
            a && !(a instanceof Error) && (L(i), y("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, o, typeof a), L(null)), a instanceof Error && !(a.message in he) && (he[a.message] = !0, L(i), y("Failed %s type: %s", t, a.message), L(null));
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
        return y("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ke(e)), xe(e);
    }
    var W = O.ReactCurrentOwner, Xe = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ee, Re, ee;
    ee = {};
    function He(e) {
      if (A.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Ze(e) {
      if (A.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function Qe(e, r) {
      if (typeof e.ref == "string" && W.current && r && W.current.stateNode !== r) {
        var t = C(W.current.type);
        ee[t] || (y('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', C(W.current.type), e.ref), ee[t] = !0);
      }
    }
    function er(e, r) {
      {
        var t = function() {
          Ee || (Ee = !0, y("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
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
          Re || (Re = !0, y("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var tr = function(e, r, t, n, i, u, o) {
      var a = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: c,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: o,
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
        value: i
      }), Object.freeze && (Object.freeze(a.props), Object.freeze(a)), a;
    };
    function nr(e, r, t, n, i) {
      {
        var u, o = {}, a = null, E = null;
        t !== void 0 && (ye(t), a = "" + t), Ze(r) && (ye(r.key), a = "" + r.key), He(r) && (E = r.ref, Qe(r, i));
        for (u in r)
          A.call(r, u) && !Xe.hasOwnProperty(u) && (o[u] = r[u]);
        if (e && e.defaultProps) {
          var m = e.defaultProps;
          for (u in m)
            o[u] === void 0 && (o[u] = m[u]);
        }
        if (a || E) {
          var p = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          a && er(o, p), E && rr(o, p);
        }
        return tr(e, a, E, i, n, W.current, o);
      }
    }
    var re = O.ReactCurrentOwner, _e = O.ReactDebugCurrentFrame;
    function P(e) {
      if (e) {
        var r = e._owner, t = M(e.type, e._source, r ? r.type : null);
        _e.setExtraStackFrame(t);
      } else
        _e.setExtraStackFrame(null);
    }
    var te;
    te = !1;
    function ne(e) {
      return typeof e == "object" && e !== null && e.$$typeof === c;
    }
    function Ne() {
      {
        if (re.current) {
          var e = C(re.current.type);
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
    function or(e) {
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
    function ke(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = or(r);
        if (we[t])
          return;
        we[t] = !0;
        var n = "";
        e && e._owner && e._owner !== re.current && (n = " It was passed a child from " + C(e._owner.type) + "."), P(e), y('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), P(null);
      }
    }
    function Ce(e, r) {
      {
        if (typeof e != "object")
          return;
        if (Q(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            ne(n) && ke(n, r);
          }
        else if (ne(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var i = G(e);
          if (typeof i == "function" && i !== e.entries)
            for (var u = i.call(e), o; !(o = u.next()).done; )
              ne(o.value) && ke(o.value, r);
        }
      }
    }
    function ir(e) {
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
          var n = C(r);
          Je(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !te) {
          te = !0;
          var i = C(r);
          y("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", i || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && y("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function sr(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            P(e), y("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), P(null);
            break;
          }
        }
        e.ref !== null && (P(e), y("Invalid attribute `ref` supplied to `React.Fragment`."), P(null));
      }
    }
    var De = {};
    function cr(e, r, t, n, i, u) {
      {
        var o = Be(e);
        if (!o) {
          var a = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (a += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var E = ar(i);
          E ? a += E : a += Ne();
          var m;
          e === null ? m = "null" : Q(e) ? m = "array" : e !== void 0 && e.$$typeof === c ? (m = "<" + (C(e.type) || "Unknown") + " />", a = " Did you accidentally export a JSX literal instead of a component?") : m = typeof e, y("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", m, a);
        }
        var p = nr(e, r, t, i, u);
        if (p == null)
          return p;
        if (o) {
          var w = r.children;
          if (w !== void 0)
            if (n)
              if (Q(w)) {
                for (var V = 0; V < w.length; V++)
                  Ce(w[V], e);
                Object.freeze && Object.freeze(w);
              } else
                y("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Ce(w, e);
        }
        if (A.call(r, "key")) {
          var j = C(e), _ = Object.keys(r).filter(function(fr) {
            return fr !== "key";
          }), ae = _.length > 0 ? "{key: someKey, " + _.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!De[j + ae]) {
            var lr = _.length > 0 ? "{" + _.join(": ..., ") + ": ...}" : "{}";
            y(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ae, j, lr, j), De[j + ae] = !0;
          }
        }
        return e === R ? sr(p) : ir(p), p;
      }
    }
    var ur = cr;
    J.Fragment = R, J.jsxDEV = ur;
  })()), J;
}
var je;
function vr() {
  return je || (je = 1, process.env.NODE_ENV === "production" ? z.exports = mr() : z.exports = pr()), z.exports;
}
var l = vr();
const br = "_card_12yoz_4", hr = "_tooltip_12yoz_25", gr = "_deckContainer_12yoz_61", xr = "_deckCard_12yoz_69", yr = "_deckCardFront_12yoz_82", Er = "_deckSection_12yoz_98", k = {
  card: br,
  tooltip: hr,
  deckContainer: gr,
  deckCard: xr,
  deckCardFront: yr,
  deckSection: Er
};
function _r({ socket: s, deckId: c, name: x, playerId: R = null }) {
  const [N, f] = q.useState([]), [v, g] = q.useState([]);
  q.useEffect(() => (s.on(`deck:init:${c}`, (h) => {
    f(h.currentDeck.map((d) => ({ ...d, deckId: c }))), g(h.drawnCards.map((d) => ({ ...d, deckId: c })));
  }), s.on(`deck:update:${c}`, (h) => {
    f(h.currentDeck.map((d) => ({ ...d, deckId: c }))), g(h.drawnCards.map((d) => ({ ...d, deckId: c })));
  }), () => {
    s.off(`deck:init:${c}`), s.off(`deck:update:${c}`);
  }), [s, c]);
  const b = () => {
    N.length !== 0 && s.emit("deck:draw", { deckId: c, playerId: R });
  }, S = () => s.emit("deck:shuffle", { deckId: c }), D = () => s.emit("deck:reset", { deckId: c });
  return /* @__PURE__ */ l.jsxDEV("section", { className: k.deckSection, children: [
    /* @__PURE__ */ l.jsxDEV("h3", { style: { marginBottom: "6px" }, children: x }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("div", { className: k.deckControls, children: [
      /* @__PURE__ */ l.jsxDEV("button", { onClick: S, children: "シャッフル" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 50,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ l.jsxDEV("button", { onClick: D, children: "山札に戻す" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 51,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("div", { className: k.deckWrapper, children: [
      /* @__PURE__ */ l.jsxDEV("div", { className: k.deckContainer, onClick: b, children: N.map((h, d) => /* @__PURE__ */ l.jsxDEV(
        "div",
        {
          className: k.deckCard,
          style: { zIndex: N.length - d, transform: `translate(${d * 0.5}px, ${d * 0.5}px)` }
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
      /* @__PURE__ */ l.jsxDEV("div", { className: k.deckContainer, children: v.map((h, d) => /* @__PURE__ */ l.jsxDEV(
        "div",
        {
          className: k.deckCardFront,
          style: { zIndex: d + 1, transform: `translate(${d * 0.5}px, ${d * 0.5}px)` },
          children: h.name
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
function Nr({ sides: s = 6, socket: c = null, diceId: x, onRoll: R }) {
  const [N, f] = oe(null), [v, g] = oe(!1), b = dr(null);
  Oe(() => {
    if (!c) return;
    const D = (h) => {
      g(!0);
      const d = 1e3, B = 50;
      let F = 0;
      const K = d / B;
      b.current = setInterval(() => {
        const G = Math.floor(Math.random() * s) + 1;
        f(G), F++, F >= K && (clearInterval(b.current), b.current = null, f(h), g(!1), R?.(h));
      }, B);
    };
    return c.on(`dice:rolled:${x}`, D), () => {
      c.off(`dice:rolled:${x}`, D), b.current && clearInterval(b.current);
    };
  }, [c, s, x, R]);
  const S = () => {
    !c || v || c.emit("dice:roll", { diceId: x, sides: s });
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
        cursor: v ? "not-allowed" : "pointer",
        userSelect: "none",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s"
      },
      onClick: S,
      children: N ?? "🎲"
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
function wr({ socket: s, players: c, currentPlayerId: x }) {
  const R = () => s.emit("game:next-turn"), N = c.map((f) => ({
    ...f,
    score: f.score ?? 0,
    cards: f.cards ?? []
  }));
  return /* @__PURE__ */ l.jsxDEV("div", { style: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }, children: [
    /* @__PURE__ */ l.jsxDEV("h2", { children: "Scoreboard" }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("ul", { style: { listStyle: "none", padding: 0 }, children: N.map((f) => /* @__PURE__ */ l.jsxDEV(
      "li",
      {
        style: {
          padding: "6px 12px",
          marginBottom: "6px",
          borderRadius: "4px",
          backgroundColor: f.id === x ? "#a0e7ff" : "#f5f5f5",
          fontWeight: f.id === x ? "bold" : "normal"
        },
        children: [
          /* @__PURE__ */ l.jsxDEV("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ l.jsxDEV("span", { children: f.name }, void 0, !1, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 37,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ l.jsxDEV("span", { children: f.score }, void 0, !1, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 38,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
            lineNumber: 36,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ l.jsxDEV("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: f.cards.map((v) => /* @__PURE__ */ l.jsxDEV(
            "div",
            {
              className: k.card,
              style: { position: "relative", cursor: "pointer" },
              onMouseEnter: (g) => {
                const b = g.currentTarget.querySelector(`.${k.tooltip}`);
                b && (b.style.display = "block");
              },
              onMouseLeave: (g) => {
                const b = g.currentTarget.querySelector(`.${k.tooltip}`);
                b && (b.style.display = "none");
              },
              onClick: () => {
                console.log("カードの効果発動:", v.name), s.emit("card:play", { deckId: v.deckId, cardId: v.id, playerId: f.id });
              },
              children: [
                v.name,
                v.description && /* @__PURE__ */ l.jsxDEV("span", { className: k.tooltip, children: v.description }, void 0, !1, {
                  fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
                  lineNumber: 63,
                  columnNumber: 40
                }, this)
              ]
            },
            v.id,
            !0,
            {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 43,
              columnNumber: 17
            },
            this
          )) }, void 0, !1, {
            fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
            lineNumber: 41,
            columnNumber: 13
          }, this)
        ]
      },
      f.id,
      !0,
      {
        fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
        lineNumber: 26,
        columnNumber: 11
      },
      this
    )) }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 24,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ l.jsxDEV("button", { onClick: R, children: "次のターン" }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 71,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}
function kr({ socket: s = null, onFinish: c }) {
  const [x, R] = oe(null);
  Oe(() => {
    if (!s) return;
    const f = (g) => {
      R(g);
    }, v = (g) => {
      R(g), g <= 0 && c?.();
    };
    return s.on("timer:start", f), s.on("timer:update", v), () => {
      s.off("timer:start", f), s.off("timer:update", v);
    };
  }, [s, c]);
  const N = () => {
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
              color: x !== null ? x <= 6 ? "red" : x <= 15 ? "orange" : "green" : "gray",
              transition: "color 0.5s ease"
            },
            children: [
              "残り時間: ",
              x ?? "-",
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
        /* @__PURE__ */ l.jsxDEV("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ l.jsxDEV("button", { onClick: N, style: { marginRight: "4px" }, children: "開始" }, void 0, !1, {
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
  _r as Deck,
  Nr as Dice,
  wr as ScoreBoard,
  kr as Timer
};
