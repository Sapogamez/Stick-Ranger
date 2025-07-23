"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Toggle = ({ checked, onChange, label }) => {
    const handleChange = (event) => {
        onChange(event.target.checked);
    };
    return ((0, jsx_runtime_1.jsxs)("label", { className: "toggle", children: [label && (0, jsx_runtime_1.jsx)("span", { children: label }), (0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: checked, onChange: handleChange })] }));
};
exports.default = Toggle;
