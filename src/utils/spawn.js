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
exports.cmd = exports.processFfmpegCmd = void 0;
var fs_1 = require("fs");
var child_process_1 = require("child_process");
var progress_js_1 = require("./progress.js");
var progressBar = new progress_js_1.ProgressBar(0, {}, {}, { debug: false });
var getStats = function (chunk) {
    var _a, _b;
    try {
        var str = (chunk === null || chunk === void 0 ? void 0 : chunk.toString("utf-8")) || "";
        var matched = str
            .trim()
            .match(/frame=((.| )*)fps=((.| )*)size=((.| )*)time=((.| )*)bitrate=((.| )*)speed=([0-9.]*)/);
        // console.log(matched);
        var stats = {
            time: 0,
            timeStamp: (_a = matched === null || matched === void 0 ? void 0 : matched[7]) === null || _a === void 0 ? void 0 : _a.trim(),
            speed: Number((_b = matched === null || matched === void 0 ? void 0 : matched[11]) === null || _b === void 0 ? void 0 : _b.trim()),
        };
        var stampData = progressBar === null || progressBar === void 0 ? void 0 : progressBar.getValidTimestamp(stats.timeStamp);
        stats.timeStamp = stampData === null || stampData === void 0 ? void 0 : stampData.stamp;
        stats.time = stampData === null || stampData === void 0 ? void 0 : stampData.secs;
        if (!stats.timeStamp) {
            throw new Error("Invalid stats");
        }
        return stats;
    }
    catch (err) {
        return null;
    }
};
var processFfmpegCmd = function (input, output, inputOptions, outputOptions, progressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1, total;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, 3, 4]);
                // Input file validation
                if (typeof input !== "string" ||
                    !input.trim() ||
                    !(0, fs_1.existsSync)(input.trim())) {
                    throw new Error("Invalid input file, required string and must exist");
                }
                input = input.trim();
                // Output validation
                if (typeof output !== "string" || !output.trim()) {
                    throw new Error("Invalid output file, required string");
                }
                output = output.trim();
                // Options validation
                inputOptions = typeof inputOptions === "undefined" ? [] : inputOptions;
                outputOptions = typeof outputOptions === "undefined" ? [] : outputOptions;
                if (!Array.isArray(inputOptions) ||
                    inputOptions.find(function (s) { return typeof s !== "string"; })) {
                    throw new Error("Invalid input options, required string array");
                }
                if (!Array.isArray(outputOptions) ||
                    outputOptions.find(function (s) { return typeof s !== "string"; })) {
                    throw new Error("Invalid output options, required string array");
                }
                return [4 /*yield*/, new Promise(function (res, rej) {
                        var cmd = "ffmpeg ".concat((inputOptions === null || inputOptions === void 0 ? void 0 : inputOptions.join(" ")) || [], " -i \"").concat(input, "\" -y ").concat(outputOptions === null || outputOptions === void 0 ? void 0 : outputOptions.join(" "), " ").concat(output || "");
                        console.log("\nFFmpeg command:", cmd);
                        (0, fs_1.appendFileSync)("./command.sh", cmd);
                        var spawned = (0, child_process_1.spawn)(cmd, { shell: true });
                        progressBar === null || progressBar === void 0 ? void 0 : progressBar.start();
                        // Stdout
                        spawned.stdout.on("data", function (chunk) {
                            var stats = getStats(chunk);
                            (stats === null || stats === void 0 ? void 0 : stats.timeStamp) && (progressBar === null || progressBar === void 0 ? void 0 : progressBar.update(stats === null || stats === void 0 ? void 0 : stats.timeStamp));
                        });
                        spawned.stdout.on("end", function () {
                            res(true);
                        });
                        spawned.stdout.on("error", function (err) {
                            rej(err);
                        });
                        // Stderr
                        spawned.stderr.on("data", function (chunk) {
                            var stats = getStats(chunk);
                            (stats === null || stats === void 0 ? void 0 : stats.timeStamp) && (progressBar === null || progressBar === void 0 ? void 0 : progressBar.update(stats === null || stats === void 0 ? void 0 : stats.timeStamp));
                        });
                        spawned.stderr.on("end", function () {
                            res(true);
                        });
                        spawned.stderr.on("error", function (err) {
                            rej(err);
                        });
                        spawned.on("disconnect", function () {
                            rej(new Error("Disconnected process"));
                        });
                        spawned.on("error", function (err) {
                            rej(err);
                        });
                        spawned.on("close", function () {
                            res(true);
                        });
                    })];
            case 1:
                _d.sent();
                return [2 /*return*/, true];
            case 2:
                err_1 = _d.sent();
                throw err_1;
            case 3:
                try {
                    total = ((_a = progressBar === null || progressBar === void 0 ? void 0 : progressBar.bar) === null || _a === void 0 ? void 0 : _a.getTotal()) || 0;
                    (_b = progressBar === null || progressBar === void 0 ? void 0 : progressBar.bar) === null || _b === void 0 ? void 0 : _b.update(total);
                    (_c = progressBar === null || progressBar === void 0 ? void 0 : progressBar.bar) === null || _c === void 0 ? void 0 : _c.stop();
                }
                catch (err) { }
                console.log("\n\n");
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.processFfmpegCmd = processFfmpegCmd;
var cmd = function (command) { return __awaiter(void 0, void 0, void 0, function () {
    var output, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (typeof command !== "string" || !command.trim()) {
                    throw new Error("Non-empty command required");
                }
                return [4 /*yield*/, new Promise(function (res, rej) {
                        (0, child_process_1.exec)(command, function (error, stdout, stderr) {
                            if (error) {
                                rej(error);
                            }
                            if (stderr) {
                                rej(new Error("STDERR => ".concat(stderr)));
                            }
                            res(stdout);
                        });
                    })];
            case 1:
                output = _a.sent();
                return [2 /*return*/, output];
            case 2:
                err_2 = _a.sent();
                console.error("Command error :", err_2);
                return [2 /*return*/, ""];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.cmd = cmd;
