"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Button = ({ onClick, disabled, loading, children }) => {
    return (react_1.default.createElement("button", { onClick: onClick, disabled: disabled || loading, className: "button" }, loading ? 'Loading...' : children));
};
exports.default = Button;
