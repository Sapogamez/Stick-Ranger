"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Slider = ({ value, onChange, min, max, step = 1 }) => {
    const handleChange = (event) => {
        onChange(Number(event.target.value));
    };
    return ((0, jsx_runtime_1.jsx)("input", { type: "range", value: value, onChange: handleChange, min: min, max: max, step: step, className: "slider", title: `Slider from ${min} to ${max}` }));
};
exports.default = Slider;
