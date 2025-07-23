"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Button = ({ onClick, disabled, loading, children }) => {
    return ((0, jsx_runtime_1.jsx)("button", { onClick: onClick, disabled: disabled || loading, className: "button", children: loading ? 'Loading...' : children }));
};
exports.default = Button;
