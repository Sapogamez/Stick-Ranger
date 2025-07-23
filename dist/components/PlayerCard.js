"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
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
    return (react_1.default.createElement("div", { className: "player-card" },
        react_1.default.createElement("h3", null, player.class),
        react_1.default.createElement("select", { value: player.class, onChange: handleClassChange, title: "Select player class" },
            react_1.default.createElement("option", { value: "Warrior" }, "Warrior"),
            react_1.default.createElement("option", { value: "Archer" }, "Archer"),
            react_1.default.createElement("option", { value: "Mage" }, "Mage"),
            react_1.default.createElement("option", { value: "Priest" }, "Priest"),
            react_1.default.createElement("option", { value: "Boxer" }, "Boxer")),
        react_1.default.createElement(Toggle_1.default, { checked: autoSkillEnabled, onChange: () => handleSkillToggle('skill1'), label: `Auto Skill: ${autoSkillEnabled ? 'ON' : 'OFF'}` })));
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
