import w, { useState as F, useRef as ae, useEffect as V } from "react";
var C = { exports: {} }, k = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var q;
function se() {
  if (q) return k;
  q = 1;
  var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
  function d(m, c, u) {
    var o = null;
    if (u !== void 0 && (o = "" + u), c.key !== void 0 && (o = "" + c.key), "key" in c) {
      u = {};
      for (var s in c)
        s !== "key" && (u[s] = c[s]);
    } else u = c;
    return c = u.ref, {
      $$typeof: t,
      type: m,
      key: o,
      ref: c !== void 0 ? c : null,
      props: u
    };
  }
  return k.Fragment = n, k.jsx = d, k.jsxs = d, k;
}
var y = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var B;
function ie() {
  return B || (B = 1, process.env.NODE_ENV !== "production" && (function() {
    function t(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === te ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case j:
          return "Fragment";
        case G:
          return "Profiler";
        case O:
          return "StrictMode";
        case Q:
          return "Suspense";
        case K:
          return "SuspenseList";
        case re:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case S:
            return "Portal";
          case H:
            return (e.displayName || "Context") + ".Provider";
          case X:
            return (e._context.displayName || "Context") + ".Consumer";
          case Z:
            var r = e.render;
            return e = e.displayName, e || (e = r.displayName || r.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case ee:
            return r = e.displayName || null, r !== null ? r : t(e.type) || "Memo";
          case Y:
            r = e._payload, e = e._init;
            try {
              return t(e(r));
            } catch {
            }
        }
      return null;
    }
    function n(e) {
      return "" + e;
    }
    function d(e) {
      try {
        n(e);
        var r = !1;
      } catch {
        r = !0;
      }
      if (r) {
        r = console;
        var i = r.error, x = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return i.call(
          r,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          x
        ), n(e);
      }
    }
    function m(e) {
      if (e === j) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === Y)
        return "<...>";
      try {
        var r = t(e);
        return r ? "<" + r + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function c() {
      var e = A.A;
      return e === null ? null : e.getOwner();
    }
    function u() {
      return Error("react-stack-top-frame");
    }
    function o(e) {
      if (z.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function s(e, r) {
      function i() {
        W || (W = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          r
        ));
      }
      i.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: i,
        configurable: !0
      });
    }
    function p() {
      var e = t(this.type);
      return M[e] || (M[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function E(e, r, i, x, R, v, P, $) {
      return i = v.ref, e = {
        $$typeof: T,
        type: e,
        key: r,
        props: v,
        _owner: R
      }, (i !== void 0 ? i : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: p
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: P
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: $
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function b(e, r, i, x, R, v, P, $) {
      var _ = r.children;
      if (_ !== void 0)
        if (x)
          if (ne(_)) {
            for (x = 0; x < _.length; x++)
              f(_[x]);
            Object.freeze && Object.freeze(_);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else f(_);
      if (z.call(r, "key")) {
        _ = t(e);
        var g = Object.keys(r).filter(function(oe) {
          return oe !== "key";
        });
        x = 0 < g.length ? "{key: someKey, " + g.join(": ..., ") + ": ...}" : "{key: someKey}", I[_ + x] || (g = 0 < g.length ? "{" + g.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          x,
          _,
          g,
          _
        ), I[_ + x] = !0);
      }
      if (_ = null, i !== void 0 && (d(i), _ = "" + i), o(r) && (d(r.key), _ = "" + r.key), "key" in r) {
        i = {};
        for (var D in r)
          D !== "key" && (i[D] = r[D]);
      } else i = r;
      return _ && s(
        i,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), E(
        e,
        _,
        v,
        R,
        c(),
        i,
        P,
        $
      );
    }
    function f(e) {
      typeof e == "object" && e !== null && e.$$typeof === T && e._store && (e._store.validated = 1);
    }
    var l = w, T = Symbol.for("react.transitional.element"), S = Symbol.for("react.portal"), j = Symbol.for("react.fragment"), O = Symbol.for("react.strict_mode"), G = Symbol.for("react.profiler"), X = Symbol.for("react.consumer"), H = Symbol.for("react.context"), Z = Symbol.for("react.forward_ref"), Q = Symbol.for("react.suspense"), K = Symbol.for("react.suspense_list"), ee = Symbol.for("react.memo"), Y = Symbol.for("react.lazy"), re = Symbol.for("react.activity"), te = Symbol.for("react.client.reference"), A = l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, z = Object.prototype.hasOwnProperty, ne = Array.isArray, N = console.createTask ? console.createTask : function() {
      return null;
    };
    l = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var W, M = {}, L = l.react_stack_bottom_frame.bind(
      l,
      u
    )(), U = N(m(u)), I = {};
    y.Fragment = j, y.jsx = function(e, r, i, x, R) {
      var v = 1e4 > A.recentlyCreatedOwnerStacks++;
      return b(
        e,
        r,
        i,
        !1,
        x,
        R,
        v ? Error("react-stack-top-frame") : L,
        v ? N(m(e)) : U
      );
    }, y.jsxs = function(e, r, i, x, R) {
      var v = 1e4 > A.recentlyCreatedOwnerStacks++;
      return b(
        e,
        r,
        i,
        !0,
        x,
        R,
        v ? Error("react-stack-top-frame") : L,
        v ? N(m(e)) : U
      );
    };
  })()), y;
}
var J;
function le() {
  return J || (J = 1, process.env.NODE_ENV === "production" ? C.exports = se() : C.exports = ie()), C.exports;
}
var a = le();
const ce = "_card_12yoz_4", ue = "_tooltip_12yoz_25", de = "_cardBack_12yoz_48", fe = "_deckContainer_12yoz_61", me = "_deckCard_12yoz_69", pe = "_deckCardFront_12yoz_82", xe = "_deckSection_12yoz_98", h = {
  card: ce,
  tooltip: ue,
  cardBack: de,
  deckContainer: fe,
  deckCard: me,
  deckCardFront: pe,
  deckSection: xe
};
function be({ socket: t, deckId: n, name: d, playerId: m = null }) {
  const [c, u] = w.useState([]), [o, s] = w.useState([]);
  w.useEffect(() => (t.on(`deck:init:${n}`, (f) => {
    u(f.currentDeck.map((l) => ({ ...l, deckId: n }))), s(f.drawnCards.map((l) => ({ ...l, deckId: n })));
  }), t.on(`deck:update:${n}`, (f) => {
    u(f.currentDeck.map((l) => ({ ...l, deckId: n }))), s(f.drawnCards.map((l) => ({ ...l, deckId: n })));
  }), () => {
    t.off(`deck:init:${n}`), t.off(`deck:update:${n}`);
  }), [t, n]);
  const p = () => {
    c.length !== 0 && t.emit("deck:draw", { deckId: n, playerId: m });
  }, E = () => t.emit("deck:shuffle", { deckId: n }), b = () => t.emit("deck:reset", { deckId: n });
  return /* @__PURE__ */ a.jsxs("section", { className: h.deckSection, children: [
    /* @__PURE__ */ a.jsx("h3", { style: { marginBottom: "6px" }, children: d }),
    /* @__PURE__ */ a.jsxs("div", { className: h.deckControls, children: [
      /* @__PURE__ */ a.jsx("button", { onClick: E, children: "シャッフル" }),
      /* @__PURE__ */ a.jsx("button", { onClick: b, children: "山札に戻す" })
    ] }),
    /* @__PURE__ */ a.jsxs("div", { className: h.deckWrapper, children: [
      /* @__PURE__ */ a.jsx("div", { className: h.deckContainer, onClick: p, children: c.map((f, l) => /* @__PURE__ */ a.jsx(
        "div",
        {
          className: h.deckCard,
          style: { zIndex: c.length - l, transform: `translate(${l * 0.5}px, ${l * 0.5}px)` }
        },
        f.id
      )) }),
      /* @__PURE__ */ a.jsx("div", { className: h.deckContainer, children: o.map((f, l) => /* @__PURE__ */ a.jsx(
        "div",
        {
          className: h.deckCardFront,
          style: { zIndex: l + 1, transform: `translate(${l * 0.5}px, ${l * 0.5}px)` },
          children: f.isFaceUp && f.name
        },
        f.id
      )) })
    ] })
  ] });
}
function he({ sides: t = 6, socket: n = null, diceId: d, onRoll: m }) {
  const [c, u] = F(null), [o, s] = F(!1), p = ae(null);
  V(() => {
    if (!n) return;
    const b = (f) => {
      s(!0);
      const l = 1e3, T = 50;
      let S = 0;
      const j = l / T;
      p.current = setInterval(() => {
        const O = Math.floor(Math.random() * t) + 1;
        u(O), S++, S >= j && (clearInterval(p.current), p.current = null, u(f), s(!1), m?.(f));
      }, T);
    };
    return n.on(`dice:rolled:${d}`, b), () => {
      n.off(`dice:rolled:${d}`, b), p.current && clearInterval(p.current);
    };
  }, [n, t, d, m]);
  const E = () => {
    !n || o || n.emit("dice:roll", { diceId: d, sides: t });
  };
  return /* @__PURE__ */ a.jsx(
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
        cursor: o ? "not-allowed" : "pointer",
        userSelect: "none",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s"
      },
      onClick: E,
      children: c ?? "🎲"
    }
  );
}
function ve({ socket: t, players: n, currentPlayerId: d, myPlayerId: m }) {
  const c = () => t.emit("game:next-turn"), u = n.map((o) => ({
    ...o,
    score: o.score ?? 0,
    cards: o.cards ?? []
  }));
  return /* @__PURE__ */ a.jsxs("div", { style: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }, children: [
    /* @__PURE__ */ a.jsx("h2", { children: "Scoreboard" }),
    /* @__PURE__ */ a.jsx("ul", { style: { listStyle: "none", padding: 0 }, children: u.map((o) => /* @__PURE__ */ a.jsxs(
      "li",
      {
        style: {
          padding: "6px 12px",
          marginBottom: "6px",
          borderRadius: "4px",
          backgroundColor: o.id === d ? "#a0e7ff" : "#f5f5f5",
          fontWeight: o.id === d ? "bold" : "normal"
        },
        children: [
          /* @__PURE__ */ a.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ a.jsxs("span", { children: [
              o.id === m && "⭐️",
              " ",
              o.name
            ] }),
            /* @__PURE__ */ a.jsx("span", { children: o.score })
          ] }),
          /* @__PURE__ */ a.jsx("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: o.cards.map((s) => {
            const p = s.isFaceUp && o.id === m;
            return /* @__PURE__ */ a.jsxs(
              "div",
              {
                className: p ? h.card : h.cardBack,
                style: { position: "relative", cursor: "pointer", width: "60px", height: "80px" },
                onMouseEnter: (E) => {
                  if (!p) return;
                  const b = E.currentTarget.querySelector(`.${h.tooltip}`);
                  b && (b.style.display = "block");
                },
                onMouseLeave: (E) => {
                  if (!p) return;
                  const b = E.currentTarget.querySelector(`.${h.tooltip}`);
                  b && (b.style.display = "none");
                },
                onClick: () => {
                  p && t.emit("card:play", { deckId: s.deckId, cardId: s.id, playerId: o.id });
                },
                children: [
                  p && s.name,
                  p && s.description && /* @__PURE__ */ a.jsx("span", { className: h.tooltip, children: s.description })
                ]
              },
              s.id
            );
          }) })
        ]
      },
      o.id
    )) }),
    /* @__PURE__ */ a.jsx("button", { onClick: c, children: "次のターン" })
  ] });
}
function Ee({ socket: t = null, onFinish: n }) {
  const [d, m] = F(null);
  V(() => {
    if (!t) return;
    const u = (s) => {
      m(s);
    }, o = (s) => {
      m(s), s <= 0 && n?.();
    };
    return t.on("timer:start", u), t.on("timer:update", o), () => {
      t.off("timer:start", u), t.off("timer:update", o);
    };
  }, [t, n]);
  const c = () => {
    t && t.emit("timer:start", 30);
  };
  return /* @__PURE__ */ a.jsxs(
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
        /* @__PURE__ */ a.jsxs(
          "div",
          {
            style: {
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: d !== null ? d <= 6 ? "red" : d <= 15 ? "orange" : "green" : "gray",
              transition: "color 0.5s ease"
            },
            children: [
              "残り時間: ",
              d ?? "-",
              "s"
            ]
          }
        ),
        /* @__PURE__ */ a.jsx("div", { style: { marginTop: "6px" }, children: /* @__PURE__ */ a.jsx("button", { onClick: c, style: { marginRight: "4px" }, children: "開始" }) })
      ]
    }
  );
}
export {
  be as Deck,
  he as Dice,
  ve as ScoreBoard,
  Ee as Timer
};
