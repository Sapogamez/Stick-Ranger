"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const MapSystem = ({ levels, onLevelSelect, currentLevel }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "map-system", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Map" }), (0, jsx_runtime_1.jsx)("ul", { children: levels.map((level) => ((0, jsx_runtime_1.jsx)("li", { className: level === currentLevel ? 'active' : '', children: (0, jsx_runtime_1.jsx)("button", { onClick: () => onLevelSelect(level), children: level }) }, level))) })] }));
};
exports.default = MapSystem;
