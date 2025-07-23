"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const MapSystem = ({ levels, onLevelSelect, currentLevel }) => {
    return (react_1.default.createElement("div", { className: "map-system" },
        react_1.default.createElement("h2", null, "Map"),
        react_1.default.createElement("ul", null, levels.map((level) => (react_1.default.createElement("li", { key: level, className: level === currentLevel ? 'active' : '' },
            react_1.default.createElement("button", { onClick: () => onLevelSelect(level) }, level)))))));
};
exports.default = MapSystem;
