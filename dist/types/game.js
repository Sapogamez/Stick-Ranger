"use strict";
// Type definitions for Stick Ranger
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.TargetType = exports.ResourceType = exports.WeaponType = void 0;
var WeaponType;
(function (WeaponType) {
    WeaponType[WeaponType["AssaultRifle"] = 0] = "AssaultRifle";
    WeaponType[WeaponType["SniperRifle"] = 1] = "SniperRifle";
    WeaponType[WeaponType["Shotgun"] = 2] = "Shotgun";
    WeaponType[WeaponType["Pistol"] = 3] = "Pistol";
    WeaponType[WeaponType["MachineGun"] = 4] = "MachineGun";
    WeaponType[WeaponType["RocketLauncher"] = 5] = "RocketLauncher";
    WeaponType[WeaponType["Bow"] = 6] = "Bow";
    WeaponType[WeaponType["Staff"] = 7] = "Staff";
    WeaponType[WeaponType["Sword"] = 8] = "Sword";
    WeaponType[WeaponType["Fist"] = 9] = "Fist";
    WeaponType[WeaponType["Hammer"] = 10] = "Hammer";
    WeaponType[WeaponType["Mace"] = 11] = "Mace";
})(WeaponType || (exports.WeaponType = WeaponType = {}));
// Resource types for abilities
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["Mana"] = 0] = "Mana";
    ResourceType[ResourceType["Stamina"] = 1] = "Stamina";
    ResourceType[ResourceType["Rage"] = 2] = "Rage";
    ResourceType[ResourceType["Energy"] = 3] = "Energy";
    ResourceType[ResourceType["Health"] = 4] = "Health";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
var TargetType;
(function (TargetType) {
    TargetType[TargetType["Self"] = 0] = "Self";
    TargetType[TargetType["Enemy"] = 1] = "Enemy";
    TargetType[TargetType["Ally"] = 2] = "Ally";
    TargetType[TargetType["Ground"] = 3] = "Ground";
    TargetType[TargetType["Direction"] = 4] = "Direction";
    TargetType[TargetType["Area"] = 5] = "Area";
})(TargetType || (exports.TargetType = TargetType = {}));
// Networking types
var MessageType;
(function (MessageType) {
    MessageType["STATE_UPDATE"] = "STATE_UPDATE";
    MessageType["PLAYER_ACTION"] = "PLAYER_ACTION";
    MessageType["SPAWN_ENTITY"] = "SPAWN_ENTITY";
    MessageType["DESTROY_ENTITY"] = "DESTROY_ENTITY";
    MessageType["CHAT_MESSAGE"] = "CHAT_MESSAGE";
    MessageType["PLAYER_CONNECT"] = "PLAYER_CONNECT";
    MessageType["PLAYER_DISCONNECT"] = "PLAYER_DISCONNECT";
})(MessageType || (exports.MessageType = MessageType = {}));
