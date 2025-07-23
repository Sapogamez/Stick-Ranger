"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Toggle_1 = __importDefault(require("./Toggle"));
const PlayerCard = ({ player, onClassChange, onSkillToggle, autoSkillEnabled }) => {
    const handleClassChange = (event) => {
        const newClass = event.target.value; // Cast to PlayerClass
        onClassChange(player.id, newClass);
        // Update player stats dynamically
        const updatedStats = getClassStats(newClass);
        player.stats = Object.assign(Object.assign({}, player.stats), updatedStats);
        console.log(`Player ${player.id} changed class to ${newClass}.`);
    };
    const handleSkillToggle = (skillId) => {
        onSkillToggle(player.id, skillId, !autoSkillEnabled);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "player-card", children: [(0, jsx_runtime_1.jsx)("h3", { children: player.class }), (0, jsx_runtime_1.jsxs)("select", { value: player.class, onChange: handleClassChange, title: "Select player class", children: [(0, jsx_runtime_1.jsx)("option", { value: "Warrior", children: "Warrior" }), (0, jsx_runtime_1.jsx)("option", { value: "Archer", children: "Archer" }), (0, jsx_runtime_1.jsx)("option", { value: "Mage", children: "Mage" }), (0, jsx_runtime_1.jsx)("option", { value: "Priest", children: "Priest" }), (0, jsx_runtime_1.jsx)("option", { value: "Boxer", children: "Boxer" })] }), (0, jsx_runtime_1.jsx)(Toggle_1.default, { checked: autoSkillEnabled, onChange: () => handleSkillToggle('skill1'), label: `Auto Skill: ${autoSkillEnabled ? 'ON' : 'OFF'}` })] }));
};
exports.default = PlayerCard;
function getClassStats(playerClass) {
    // Dummy implementation for updating stats based on class
    switch (playerClass) {
        case 'Warrior':
            return { strength: 10, agility: 2, intelligence: 1 };
        case 'Archer':
            return { strength: 5, agility: 10, intelligence: 2 };
        case 'Mage':
            return { strength: 1, agility: 2, intelligence: 10 };
        case 'Priest':
            return { strength: 2, agility: 3, intelligence: 8 };
        case 'Boxer':
            return { strength: 8, agility: 5, intelligence: 2 };
        default:
            return {};
    }
}
