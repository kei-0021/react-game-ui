import * as ie from "react";
import vr, { useState as se, useRef as hr, useEffect as Ve } from "react";
import oe from "express";
import M from "path";
import { fileURLToPath as gr } from "url";
var q = { exports: {} }, J = {};
/**
 * @license React
 * react-jsx-dev-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var je;
function br() {
  if (je) return J;
  je = 1;
  var i = Symbol.for("react.fragment");
  return J.Fragment = i, J.jsxDEV = void 0, J;
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
var Pe;
function xr() {
  return Pe || (Pe = 1, process.env.NODE_ENV !== "production" && (function() {
    var i = vr, a = Symbol.for("react.element"), g = Symbol.for("react.portal"), u = Symbol.for("react.fragment"), y = Symbol.for("react.strict_mode"), w = Symbol.for("react.profiler"), h = Symbol.for("react.provider"), s = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), t = Symbol.for("react.suspense"), f = Symbol.for("react.suspense_list"), c = Symbol.for("react.memo"), l = Symbol.for("react.lazy"), E = Symbol.for("react.offscreen"), T = Symbol.iterator, G = "@@iterator";
    function X(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = T && e[T] || e[G];
      return typeof r == "function" ? r : null;
    }
    var $ = i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function D(e) {
      {
        for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
          n[o - 1] = arguments[o];
        Fe("error", e, n);
      }
    }
    function Fe(e, r, n) {
      {
        var o = $.ReactDebugCurrentFrame, v = o.getStackAddendum();
        v !== "" && (r += "%s", n = n.concat([v]));
        var b = n.map(function(m) {
          return String(m);
        });
        b.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, b);
      }
    }
    var Ae = !1, We = !1, Be = !1, Me = !1, Ye = !1, ce;
    ce = Symbol.for("react.module.reference");
    function Le(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === u || e === w || Ye || e === y || e === t || e === f || Me || e === E || Ae || We || Be || typeof e == "object" && e !== null && (e.$$typeof === l || e.$$typeof === c || e.$$typeof === h || e.$$typeof === s || e.$$typeof === p || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === ce || e.getModuleId !== void 0));
    }
    function Ue(e, r, n) {
      var o = e.displayName;
      if (o)
        return o;
      var v = r.displayName || r.name || "";
      return v !== "" ? n + "(" + v + ")" : n;
    }
    function le(e) {
      return e.displayName || "Context";
    }
    function j(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && D("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case u:
          return "Fragment";
        case g:
          return "Portal";
        case w:
          return "Profiler";
        case y:
          return "StrictMode";
        case t:
          return "Suspense";
        case f:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case s:
            var r = e;
            return le(r) + ".Consumer";
          case h:
            var n = e;
            return le(n._context) + ".Provider";
          case p:
            return Ue(e, e.render, "ForwardRef");
          case c:
            var o = e.displayName || null;
            return o !== null ? o : j(e.type) || "Memo";
          case l: {
            var v = e, b = v._payload, m = v._init;
            try {
              return j(m(b));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var P = Object.assign, A = 0, ue, fe, de, me, pe, ve, he;
    function ge() {
    }
    ge.__reactDisabledLog = !0;
    function ze() {
      {
        if (A === 0) {
          ue = console.log, fe = console.info, de = console.warn, me = console.error, pe = console.group, ve = console.groupCollapsed, he = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: ge,
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
    function qe() {
      {
        if (A--, A === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: P({}, e, {
              value: ue
            }),
            info: P({}, e, {
              value: fe
            }),
            warn: P({}, e, {
              value: de
            }),
            error: P({}, e, {
              value: me
            }),
            group: P({}, e, {
              value: pe
            }),
            groupCollapsed: P({}, e, {
              value: ve
            }),
            groupEnd: P({}, e, {
              value: he
            })
          });
        }
        A < 0 && D("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var H = $.ReactCurrentDispatcher, Z;
    function Y(e, r, n) {
      {
        if (Z === void 0)
          try {
            throw Error();
          } catch (v) {
            var o = v.stack.trim().match(/\n( *(at )?)/);
            Z = o && o[1] || "";
          }
        return `
` + Z + e;
      }
    }
    var Q = !1, L;
    {
      var Je = typeof WeakMap == "function" ? WeakMap : Map;
      L = new Je();
    }
    function be(e, r) {
      if (!e || Q)
        return "";
      {
        var n = L.get(e);
        if (n !== void 0)
          return n;
      }
      var o;
      Q = !0;
      var v = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var b;
      b = H.current, H.current = null, ze();
      try {
        if (r) {
          var m = function() {
            throw Error();
          };
          if (Object.defineProperty(m.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(m, []);
            } catch (N) {
              o = N;
            }
            Reflect.construct(e, [], m);
          } else {
            try {
              m.call();
            } catch (N) {
              o = N;
            }
            e.call(m.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (N) {
            o = N;
          }
          e();
        }
      } catch (N) {
        if (N && o && typeof N.stack == "string") {
          for (var d = N.stack.split(`
`), C = o.stack.split(`
`), _ = d.length - 1, R = C.length - 1; _ >= 1 && R >= 0 && d[_] !== C[R]; )
            R--;
          for (; _ >= 1 && R >= 0; _--, R--)
            if (d[_] !== C[R]) {
              if (_ !== 1 || R !== 1)
                do
                  if (_--, R--, R < 0 || d[_] !== C[R]) {
                    var S = `
` + d[_].replace(" at new ", " at ");
                    return e.displayName && S.includes("<anonymous>") && (S = S.replace("<anonymous>", e.displayName)), typeof e == "function" && L.set(e, S), S;
                  }
                while (_ >= 1 && R >= 0);
              break;
            }
        }
      } finally {
        Q = !1, H.current = b, qe(), Error.prepareStackTrace = v;
      }
      var F = e ? e.displayName || e.name : "", O = F ? Y(F) : "";
      return typeof e == "function" && L.set(e, O), O;
    }
    function Ke(e, r, n) {
      return be(e, !1);
    }
    function Ge(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function U(e, r, n) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return be(e, Ge(e));
      if (typeof e == "string")
        return Y(e);
      switch (e) {
        case t:
          return Y("Suspense");
        case f:
          return Y("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case p:
            return Ke(e.render);
          case c:
            return U(e.type, r, n);
          case l: {
            var o = e, v = o._payload, b = o._init;
            try {
              return U(b(v), r, n);
            } catch {
            }
          }
        }
      return "";
    }
    var W = Object.prototype.hasOwnProperty, xe = {}, ye = $.ReactDebugCurrentFrame;
    function z(e) {
      if (e) {
        var r = e._owner, n = U(e.type, e._source, r ? r.type : null);
        ye.setExtraStackFrame(n);
      } else
        ye.setExtraStackFrame(null);
    }
    function Xe(e, r, n, o, v) {
      {
        var b = Function.call.bind(W);
        for (var m in e)
          if (b(e, m)) {
            var d = void 0;
            try {
              if (typeof e[m] != "function") {
                var C = Error((o || "React class") + ": " + n + " type `" + m + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[m] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw C.name = "Invariant Violation", C;
              }
              d = e[m](r, m, o, n, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (_) {
              d = _;
            }
            d && !(d instanceof Error) && (z(v), D("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", o || "React class", n, m, typeof d), z(null)), d instanceof Error && !(d.message in xe) && (xe[d.message] = !0, z(v), D("Failed %s type: %s", n, d.message), z(null));
          }
      }
    }
    var He = Array.isArray;
    function I(e) {
      return He(e);
    }
    function Ze(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, n = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return n;
      }
    }
    function Qe(e) {
      try {
        return Ee(e), !1;
      } catch {
        return !0;
      }
    }
    function Ee(e) {
      return "" + e;
    }
    function _e(e) {
      if (Qe(e))
        return D("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Ze(e)), Ee(e);
    }
    var B = $.ReactCurrentOwner, Ie = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Re, we, ee;
    ee = {};
    function er(e) {
      if (W.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function rr(e) {
      if (W.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function tr(e, r) {
      if (typeof e.ref == "string" && B.current && r && B.current.stateNode !== r) {
        var n = j(B.current.type);
        ee[n] || (D('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', j(B.current.type), e.ref), ee[n] = !0);
      }
    }
    function nr(e, r) {
      {
        var n = function() {
          Re || (Re = !0, D("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: n,
          configurable: !0
        });
      }
    }
    function ar(e, r) {
      {
        var n = function() {
          we || (we = !0, D("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: n,
          configurable: !0
        });
      }
    }
    var ir = function(e, r, n, o, v, b, m) {
      var d = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: a,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: n,
        props: m,
        // Record the component responsible for creating this element.
        _owner: b
      };
      return d._store = {}, Object.defineProperty(d._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(d, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: o
      }), Object.defineProperty(d, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: v
      }), Object.freeze && (Object.freeze(d.props), Object.freeze(d)), d;
    };
    function or(e, r, n, o, v) {
      {
        var b, m = {}, d = null, C = null;
        n !== void 0 && (_e(n), d = "" + n), rr(r) && (_e(r.key), d = "" + r.key), er(r) && (C = r.ref, tr(r, v));
        for (b in r)
          W.call(r, b) && !Ie.hasOwnProperty(b) && (m[b] = r[b]);
        if (e && e.defaultProps) {
          var _ = e.defaultProps;
          for (b in _)
            m[b] === void 0 && (m[b] = _[b]);
        }
        if (d || C) {
          var R = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          d && nr(m, R), C && ar(m, R);
        }
        return ir(e, d, C, v, o, B.current, m);
      }
    }
    var re = $.ReactCurrentOwner, De = $.ReactDebugCurrentFrame;
    function V(e) {
      if (e) {
        var r = e._owner, n = U(e.type, e._source, r ? r.type : null);
        De.setExtraStackFrame(n);
      } else
        De.setExtraStackFrame(null);
    }
    var te;
    te = !1;
    function ne(e) {
      return typeof e == "object" && e !== null && e.$$typeof === a;
    }
    function Ce() {
      {
        if (re.current) {
          var e = j(re.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function sr(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), n = e.lineNumber;
          return `

Check your code at ` + r + ":" + n + ".";
        }
        return "";
      }
    }
    var Ne = {};
    function cr(e) {
      {
        var r = Ce();
        if (!r) {
          var n = typeof e == "string" ? e : e.displayName || e.name;
          n && (r = `

Check the top-level render call using <` + n + ">.");
        }
        return r;
      }
    }
    function Se(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var n = cr(r);
        if (Ne[n])
          return;
        Ne[n] = !0;
        var o = "";
        e && e._owner && e._owner !== re.current && (o = " It was passed a child from " + j(e._owner.type) + "."), V(e), D('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', n, o), V(null);
      }
    }
    function ke(e, r) {
      {
        if (typeof e != "object")
          return;
        if (I(e))
          for (var n = 0; n < e.length; n++) {
            var o = e[n];
            ne(o) && Se(o, r);
          }
        else if (ne(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var v = X(e);
          if (typeof v == "function" && v !== e.entries)
            for (var b = v.call(e), m; !(m = b.next()).done; )
              ne(m.value) && Se(m.value, r);
        }
      }
    }
    function lr(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var n;
        if (typeof r == "function")
          n = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === p || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === c))
          n = r.propTypes;
        else
          return;
        if (n) {
          var o = j(r);
          Xe(n, e.props, "prop", o, e);
        } else if (r.PropTypes !== void 0 && !te) {
          te = !0;
          var v = j(r);
          D("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", v || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && D("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function ur(e) {
      {
        for (var r = Object.keys(e.props), n = 0; n < r.length; n++) {
          var o = r[n];
          if (o !== "children" && o !== "key") {
            V(e), D("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", o), V(null);
            break;
          }
        }
        e.ref !== null && (V(e), D("Invalid attribute `ref` supplied to `React.Fragment`."), V(null));
      }
    }
    var Te = {};
    function fr(e, r, n, o, v, b) {
      {
        var m = Le(e);
        if (!m) {
          var d = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (d += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var C = sr(v);
          C ? d += C : d += Ce();
          var _;
          e === null ? _ = "null" : I(e) ? _ = "array" : e !== void 0 && e.$$typeof === a ? (_ = "<" + (j(e.type) || "Unknown") + " />", d = " Did you accidentally export a JSX literal instead of a component?") : _ = typeof e, D("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", _, d);
        }
        var R = or(e, r, n, v, b);
        if (R == null)
          return R;
        if (m) {
          var S = r.children;
          if (S !== void 0)
            if (o)
              if (I(S)) {
                for (var F = 0; F < S.length; F++)
                  ke(S[F], e);
                Object.freeze && Object.freeze(S);
              } else
                D("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              ke(S, e);
        }
        if (W.call(r, "key")) {
          var O = j(e), N = Object.keys(r).filter(function(pr) {
            return pr !== "key";
          }), ae = N.length > 0 ? "{key: someKey, " + N.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Te[O + ae]) {
            var mr = N.length > 0 ? "{" + N.join(": ..., ") + ": ...}" : "{}";
            D(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ae, O, mr, O), Te[O + ae] = !0;
          }
        }
        return e === u ? ur(R) : lr(R), R;
      }
    }
    var dr = fr;
    K.Fragment = u, K.jsxDEV = dr;
  })()), K;
}
var Oe;
function yr() {
  return Oe || (Oe = 1, process.env.NODE_ENV === "production" ? q.exports = br() : q.exports = xr()), q.exports;
}
var x = yr();
const Er = "_card_12yoz_4", _r = "_tooltip_12yoz_25", Rr = "_cardBack_12yoz_48", wr = "_deckContainer_12yoz_61", Dr = "_deckCard_12yoz_69", Cr = "_deckCardFront_12yoz_82", Nr = "_deckSection_12yoz_98", k = {
  card: Er,
  tooltip: _r,
  cardBack: Rr,
  deckContainer: wr,
  deckCard: Dr,
  deckCardFront: Cr,
  deckSection: Nr
};
function Or({ socket: i, deckId: a, name: g, playerId: u = null }) {
  const [y, w] = ie.useState([]), [h, s] = ie.useState([]);
  ie.useEffect(() => (i.on(`deck:init:${a}`, (c) => {
    w(c.currentDeck.map((l) => ({ ...l, deckId: a }))), s(c.drawnCards.map((l) => ({ ...l, deckId: a })));
  }), i.on(`deck:update:${a}`, (c) => {
    w(c.currentDeck.map((l) => ({ ...l, deckId: a }))), s(c.drawnCards.map((l) => ({ ...l, deckId: a })));
  }), () => {
    i.off(`deck:init:${a}`), i.off(`deck:update:${a}`);
  }), [i, a]);
  const p = () => {
    y.length !== 0 && i.emit("deck:draw", { deckId: a, playerId: u });
  }, t = () => i.emit("deck:shuffle", { deckId: a }), f = () => i.emit("deck:reset", { deckId: a });
  return /* @__PURE__ */ x.jsxDEV("section", { className: k.deckSection, children: [
    /* @__PURE__ */ x.jsxDEV("h3", { style: { marginBottom: "6px" }, children: g }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 47,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ x.jsxDEV("div", { className: k.deckControls, children: [
      /* @__PURE__ */ x.jsxDEV("button", { onClick: t, children: "シャッフル" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 50,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ x.jsxDEV("button", { onClick: f, children: "山札に戻す" }, void 0, !1, {
        fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
        lineNumber: 51,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "/workspaces/react-game-ui/src/components/Deck.tsx",
      lineNumber: 49,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ x.jsxDEV("div", { className: k.deckWrapper, children: [
      /* @__PURE__ */ x.jsxDEV("div", { className: k.deckContainer, onClick: p, children: y.map((c, l) => /* @__PURE__ */ x.jsxDEV(
        "div",
        {
          className: k.deckCard,
          style: { zIndex: y.length - l, transform: `translate(${l * 0.5}px, ${l * 0.5}px)` }
        },
        c.id,
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
      /* @__PURE__ */ x.jsxDEV("div", { className: k.deckContainer, children: h.map((c, l) => /* @__PURE__ */ x.jsxDEV(
        "div",
        {
          className: k.deckCardFront,
          style: { zIndex: l + 1, transform: `translate(${l * 0.5}px, ${l * 0.5}px)` },
          children: c.isFaceUp && c.name
        },
        c.id,
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
function $r({ sides: i = 6, socket: a = null, diceId: g, onRoll: u }) {
  const [y, w] = se(null), [h, s] = se(!1), p = hr(null);
  Ve(() => {
    if (!a) return;
    const f = (c) => {
      s(!0);
      const l = 1e3, E = 50;
      let T = 0;
      const G = l / E;
      p.current = setInterval(() => {
        const X = Math.floor(Math.random() * i) + 1;
        w(X), T++, T >= G && (clearInterval(p.current), p.current = null, w(c), s(!1), u?.(c));
      }, E);
    };
    return a.on(`dice:rolled:${g}`, f), () => {
      a.off(`dice:rolled:${g}`, f), p.current && clearInterval(p.current);
    };
  }, [a, i, g, u]);
  const t = () => {
    !a || h || a.emit("dice:roll", { diceId: g, sides: i });
  };
  return /* @__PURE__ */ x.jsxDEV(
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
        cursor: h ? "not-allowed" : "pointer",
        userSelect: "none",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s"
      },
      onClick: t,
      children: y ?? "🎲"
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
function Vr({ socket: i, players: a, currentPlayerId: g, myPlayerId: u }) {
  const y = () => i.emit("game:next-turn"), w = a.map((h) => ({
    ...h,
    score: h.score ?? 0,
    cards: h.cards ?? []
  }));
  return /* @__PURE__ */ x.jsxDEV("div", { style: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }, children: [
    /* @__PURE__ */ x.jsxDEV("h2", { children: "Scoreboard" }, void 0, !1, {
      fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ x.jsxDEV("ul", { style: { listStyle: "none", padding: 0 }, children: w.map((h) => /* @__PURE__ */ x.jsxDEV(
      "li",
      {
        style: {
          padding: "6px 12px",
          marginBottom: "6px",
          borderRadius: "4px",
          backgroundColor: h.id === g ? "#a0e7ff" : "#f5f5f5",
          fontWeight: h.id === g ? "bold" : "normal"
        },
        children: [
          /* @__PURE__ */ x.jsxDEV("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ x.jsxDEV("span", { children: [
              h.id === u && "⭐️",
              " ",
              h.name
            ] }, void 0, !0, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 43,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ x.jsxDEV("span", { children: h.score }, void 0, !1, {
              fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
              lineNumber: 46,
              columnNumber: 15
            }, this)
          ] }, void 0, !0, {
            fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
            lineNumber: 42,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ x.jsxDEV("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: h.cards.map((s) => {
            const p = s.isFaceUp && h.id === u;
            return /* @__PURE__ */ x.jsxDEV(
              "div",
              {
                className: p ? k.card : k.cardBack,
                style: { position: "relative", cursor: "pointer", width: "60px", height: "80px" },
                onMouseEnter: (t) => {
                  if (!p) return;
                  const f = t.currentTarget.querySelector(`.${k.tooltip}`);
                  f && (f.style.display = "block");
                },
                onMouseLeave: (t) => {
                  if (!p) return;
                  const f = t.currentTarget.querySelector(`.${k.tooltip}`);
                  f && (f.style.display = "none");
                },
                onClick: () => {
                  p && i.emit("card:play", { deckId: s.deckId, cardId: s.id, playerId: h.id });
                },
                children: [
                  p && s.name,
                  p && s.description && /* @__PURE__ */ x.jsxDEV("span", { className: k.tooltip, children: s.description }, void 0, !1, {
                    fileName: "/workspaces/react-game-ui/src/components/ScoreBoard.tsx",
                    lineNumber: 77,
                    columnNumber: 54
                  }, this)
                ]
              },
              s.id,
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
      h.id,
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
    /* @__PURE__ */ x.jsxDEV("button", { onClick: y, children: "次のターン" }, void 0, !1, {
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
function Fr({ socket: i = null, onFinish: a }) {
  const [g, u] = se(null);
  Ve(() => {
    if (!i) return;
    const w = (s) => {
      u(s);
    }, h = (s) => {
      u(s), s <= 0 && a?.();
    };
    return i.on("timer:start", w), i.on("timer:update", h), () => {
      i.off("timer:start", w), i.off("timer:update", h);
    };
  }, [i, a]);
  const y = () => {
    i && i.emit("timer:start", 30);
  };
  return /* @__PURE__ */ x.jsxDEV(
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
        /* @__PURE__ */ x.jsxDEV(
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
        /* @__PURE__ */ x.jsxDEV("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ x.jsxDEV("button", { onClick: y, style: { marginRight: "4px" }, children: "開始" }, void 0, !1, {
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
const Sr = gr(import.meta.url), $e = M.dirname(Sr);
function Ar(i) {
  const a = oe();
  if (process.env.NODE_ENV === "production") {
    const u = M.join($e, "dist");
    a.use("/lib", oe.static(u));
    const y = i ? M.resolve(i) : M.join($e, "dist");
    a.use(oe.static(y)), a.get("/", (w, h) => {
      h.sendFile(M.join(y, "index.html"));
    });
  }
  return a;
}
function Wr(i) {
  const a = {}, g = {};
  let u = [], y = 0;
  function w(s, p) {
    const t = u.find((f) => f.id === s);
    t && (t.score = (t.score || 0) + p, console.log(`[addScore] ${t.name} に ${p} ポイント加算`), i.emit("players:update", u));
  }
  function h(s) {
    if (!a[s]) return;
    const p = a[s].filter((t) => t.location === "deck");
    for (let t = p.length - 1; t > 0; t--) {
      const f = Math.floor(Math.random() * (t + 1));
      [p[t], p[f]] = [p[f], p[t]];
    }
    a[s] = p.concat(a[s].filter((t) => t.location !== "deck")), console.log(`[shuffleDeck] デッキ ${s} をシャッフルしました`);
  }
  i.on("connection", (s) => {
    console.log(`[connection] クライアント接続: ${s.id}`);
    const p = { id: s.id, name: `Player ${u.length + 1}`, cards: [], score: 0 };
    u.push(p), console.log("[connection] 新規プレイヤー追加:", p), s.emit("player:assign-id", p.id), i.emit("players:update", u), i.emit("game:turn", u[y]?.id), s.on("deck:add", ({ deckId: t, name: f, cards: c }) => {
      a[t] || (a[t] = c.map((l) => ({ ...l, deckId: t, location: "deck" })), g[t] = [], console.log(`[deck:add] デッキ "${f}" 初期化完了`), i.emit(`deck:init:${t}`, {
        currentDeck: a[t].filter((l) => l.location === "deck"),
        drawnCards: g[t]
      }));
    }), s.on("deck:draw", ({ deckId: t, playerId: f }) => {
      if (!a[t]) return;
      const c = a[t].filter((E) => E.location === "deck");
      if (!c.length) return;
      const l = c.shift();
      if (l) {
        if (f) {
          const E = u.find((T) => T.id === f);
          E && (E.cards = E.cards || [], l.location = "hand", l.isFaceUp = !0, E.cards.push(l));
        } else
          l.location = "field", g[t].push(l);
        a[t] = c.concat(a[t].filter((E) => E.location !== "deck")), console.log(`[deck:draw] デッキ ${t} からカードを引きました:`, l), i.emit(`deck:update:${t}`, {
          currentDeck: a[t].filter((E) => E.location === "deck"),
          drawnCards: g[t]
        }), i.emit("players:update", u);
      }
    }), s.on("deck:shuffle", ({ deckId: t }) => {
      h(t), console.log(`[deck:shuffle] デッキ ${t} シャッフル`), i.emit(`deck:update:${t}`, {
        currentDeck: a[t].filter((f) => f.location === "deck"),
        drawnCards: g[t]
      });
    }), s.on("deck:reset", ({ deckId: t }) => {
      if (!a[t]) return;
      a[t].filter((c) => c.location === "field").forEach((c) => {
        c.location = "deck", g[t] = g[t].filter((l) => l.id !== c.id);
      }), h(t), console.log(`[deck:reset] デッキ ${t} リセット`), i.emit(`deck:update:${t}`, {
        currentDeck: a[t].filter((c) => c.location === "deck"),
        drawnCards: g[t]
      });
    }), s.on("card:play", ({ deckId: t, cardId: f, playerId: c }) => {
      if (!a[t]) return;
      const l = a[t].find((E) => E.id === f);
      if (l) {
        if (console.log(`[card:play] プレイヤー ${c} がカード ${l.name} を使用`), l.onPlay && l.onPlay({ playerId: c, addScore: w }), c) {
          const E = u.find((T) => T.id === c);
          E && E.cards && (E.cards = E.cards.filter((T) => T.id !== f));
        }
        l.location = "field", g[t].push(l), i.emit(`deck:update:${t}`, {
          currentDeck: a[t].filter((E) => E.location === "deck"),
          drawnCards: g[t]
        }), i.emit("players:update", u);
      }
    }), s.on("dice:roll", ({ diceId: t, sides: f }) => {
      const c = Math.floor(Math.random() * f) + 1;
      console.log(`[dice:roll] サイコロ ${t} の出目: ${c}`), i.emit(`dice:rolled:${t}`, c);
    }), s.on("timer:start", (t) => {
      let f = t;
      console.log(`[timer:start] タイマー開始: ${t} 秒`), i.emit("timer:start", t);
      const c = setInterval(() => {
        f--, i.emit("timer:update", f), f <= 0 && (clearInterval(c), console.log("[timer:end] タイマー終了"), i.emit("timer:end"));
      }, 1e3);
    }), s.on("game:next-turn", () => {
      y = (y + 1) % u.length, console.log(`[game:next-turn] 次のターン: ${u[y]?.name}`), i.emit("game:turn", u[y]?.id);
    }), s.on("disconnect", () => {
      console.log(`[disconnect] プレイヤー切断: ${s.id}`), u = u.filter((t) => t.id !== s.id), y >= u.length && (y = 0), console.log(`[disconnect] 現在のターン: ${u[y]?.name}`), i.emit("game:turn", u[y]?.id), i.emit("players:update", u);
    });
  });
}
export {
  Or as Deck,
  $r as Dice,
  Vr as ScoreBoard,
  Fr as Timer,
  Ar as createLibServer,
  Wr as initGameServer
};
