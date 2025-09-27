import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import Dice from "./components/Dice.js";
const rootEl = document.getElementById("root");
if (rootEl) {
    const root = createRoot(rootEl);
    root.render(_jsx(_Fragment, { children: _jsx(Dice, { sides: 2 }) }));
}
