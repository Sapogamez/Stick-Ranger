"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Toggle = ({ checked, onChange, label }) => {
    const handleChange = (event) => {
        onChange(event.target.checked);
    };
    return (react_1.default.createElement("label", { className: "toggle" },
        label && react_1.default.createElement("span", null, label),
        react_1.default.createElement("input", { type: "checkbox", checked: checked, onChange: handleChange })));
};
exports.default = Toggle;
