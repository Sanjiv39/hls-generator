"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPresetValid = exports.getValidPreset = exports.devices = exports.intelPresets = exports.amdPresets = exports.nvidiaPresets = void 0;
var spawn_js_1 = require("./spawn.js");
// @ts-ignore
exports.nvidiaPresets = Array(7)
    .fill(null)
    .map(function (_, i) { return "p".concat(i + 1); })
    .concat([
    "slow",
    "medium",
    "fast",
    "default",
    "hq",
    "hp",
    "bd",
    "ll",
    "llhq",
    "llhp",
    "lossless",
    "losslesshp",
]);
exports.amdPresets = [
    "balanced",
    "quality",
    "speed",
];
exports.intelPresets = [
    "veryfast",
    "faster",
    "fast",
    "medium",
    "slow",
    "slower",
    "veryslow",
];
exports.devices = [
    "amd",
    "intel",
    "nvidia",
    "none",
    "mac",
];
var getValidPreset = function (device, preset) {
    if (device === void 0) { device = "none"; }
    try {
        // @ts-ignore
        device =
            (typeof device === "string" && device.trim().toLowerCase()) || null;
        // @ts-ignore
        preset =
            typeof preset === "number"
                ? preset
                : typeof preset === "string"
                    ? (preset || "").toLowerCase().trim()
                    : null;
        if (!device ||
            // @ts-ignore
            !exports.devices.includes(device.trim().toLowerCase())) {
            throw new Error("Invalid device, required one of [".concat(exports.devices.join(", "), "] but got ").concat(device), { cause: "invalid-device-type" });
        }
        // @ts-ignore
        device = device.trim().toLowerCase();
        if (device === "nvidia") {
            // @ts-ignore
            var valid = 
            // @ts-ignore
            typeof preset === "string" && exports.nvidiaPresets.includes(preset)
                ? preset
                : typeof preset === "number" &&
                    !Number.isNaN(preset) &&
                    Number.isFinite(preset) &&
                    preset > 0 &&
                    preset <= 7
                    ? "p".concat(preset)
                    : "p5";
            return valid;
        }
        if (device === "amd") {
            // @ts-ignore
            var valid = 
            // @ts-ignore
            typeof preset === "string" && exports.amdPresets.includes(preset)
                ? preset
                : "balanced";
            return valid;
        }
        if (device === "intel") {
            // @ts-ignore
            var valid = 
            // @ts-ignore
            typeof preset === "string" && exports.intelPresets.includes(preset)
                ? preset
                : typeof preset === "number" &&
                    !Number.isNaN(preset) &&
                    Number.isFinite(preset) &&
                    preset > 0 &&
                    preset <= 10
                    ? preset
                    : "fast";
            return valid;
        }
        return "fast";
    }
    catch (err) {
        console.error("Error getting preset :", err);
        return "";
    }
};
exports.getValidPreset = getValidPreset;
var isPresetValid = function (videoCodec, preset) { return __awaiter(void 0, void 0, void 0, function () {
    var output, arr, start_1, end_1, presets, defaultPreset, isValid, data, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, spawn_js_1.cmd)("ffmpeg -hide_banner -h encoder=\"".concat(videoCodec, "\""))];
            case 1:
                output = _c.sent();
                arr = output
                    .split("\n")
                    .filter(function (s) { return s.trim(); })
                    .map(function (s) { return s.trim(); });
                console.log(output);
                start_1 = arr.findIndex(function (s) { return s.match(/\-preset/); });
                end_1 = arr.findIndex(function (s, i) { return s.match(/\-/) && i > start_1; });
                if (start_1 >= 0 && end_1 >= 0 && end_1 > start_1) {
                    console.log(arr.filter(function (_, i) { return i >= start_1 && i <= end_1; }));
                    presets = arr
                        .map(function (s) { return s.replace(/ +/g, " "); })
                        .filter(function (s, i) { return i > start_1 && i < end_1 && s.match(/^(.+) (.+)/); })
                        .map(function (s) { var _a; return ((_a = s.match(/^(.+) (.+)/)) === null || _a === void 0 ? void 0 : _a[1]) || ""; })
                        .filter(function (s, i) { return s; });
                    defaultPreset = ((_b = (_a = arr[start_1].match(/\(default([^()]+)\)/)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.trim()) || "";
                    isValid = presets.includes(preset.trim());
                    data = {
                        presets: presets,
                        preset: preset.trim() || undefined,
                        valid: isValid,
                        defaultPreset: defaultPreset,
                    };
                    return [2 /*return*/, data];
                }
                throw new Error("No preset data");
            case 2:
                err_1 = _c.sent();
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.isPresetValid = isPresetValid;
// console.log(getValidPreset("intel"));
console.log(await (0, exports.isPresetValid)("h264_nvenc", ""));
