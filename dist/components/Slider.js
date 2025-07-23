"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Slider = ({ value, onChange, min, max, step = 1 }) => {
    const handleChange = (event) => {
        onChange(Number(event.target.value));
    };
    return (react_1.default.createElement("input", { type: "range", value: value, onChange: handleChange, min: min, max: max, step: step, className: "slider", title: `Slider from ${min} to ${max}` }));
};
exports.default = Slider;
