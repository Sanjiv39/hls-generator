"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
var cli_progress_1 = require("cli-progress");
var moment_1 = require("moment");
var number_js_1 = require("./number.js");
var zeroTimeStamp = "00:00:00";
var ProgressBar = /** @class */ (function () {
    function ProgressBar(totalTimestamp, options, preset, alterOptions) {
        if (totalTimestamp === void 0) { totalTimestamp = 0; }
        var _this = this;
        this.bar = null;
        this.timer = null;
        this.params = { totalTimestamp: zeroTimeStamp, totalTime: 0 };
        this.debug = true;
        /**
         * @description Returns stamp and seconds for passed value if valid.
         * @description Can also default to zero if invalid value by setting option `defaultizeIfInvalid`
         */
        this.getValidTimestamp = function (timestamp, options) {
            var template = {
                stamp: "",
                secs: 0,
            };
            try {
                if (typeof timestamp === "string") {
                    timestamp = timestamp.trim();
                    var parsed = ProgressBar.validateTimestamp(timestamp, {
                        debug: _this.debug,
                    });
                    if (moment_1.default.duration(timestamp).isValid() && parsed.parsedTimestamp) {
                        template.stamp = parsed.parsedTimestamp;
                        template.secs = moment_1.default.duration(timestamp).asSeconds();
                        return template;
                    }
                    if (options === null || options === void 0 ? void 0 : options.defaultizeIfInvalid) {
                        template.stamp = zeroTimeStamp;
                        template.secs = 0;
                        return template;
                    }
                }
                // Timestamp is seconds
                if (typeof timestamp === "number") {
                    if ((0, number_js_1.validateNumber)(timestamp, {
                        validateCountable: false,
                        customValidation: function (val) {
                            if (val >= 0) {
                                return { isValid: true, value: val };
                            }
                            return { isValid: false, value: val };
                        },
                    }).isValid) {
                        var duration = moment_1.default.duration(timestamp, "seconds");
                        template.stamp = "".concat(duration
                            .hours()
                            .toString()
                            .padStart(2, "0"), ":").concat(duration
                            .minutes()
                            .toString()
                            .padStart(2, "0"), ":").concat(duration
                            .seconds()
                            .toString()
                            .padStart(2, "0"));
                        template.secs = moment_1.default.duration(timestamp).asSeconds();
                        return template;
                    }
                    if (options === null || options === void 0 ? void 0 : options.defaultizeIfInvalid) {
                        template.stamp = zeroTimeStamp;
                        template.secs = 0;
                    }
                    return template;
                }
                throw new Error("Invalid value passed, required string in format hh:mm:ss or number >= 0");
            }
            catch (err) {
                _this.debug && console.error("Error getting timestamp :", err);
                return null;
            }
        };
        this.getValidTimestampFromMultiple = function (timestamps, options) {
            try {
                if (!Array.isArray(timestamps) ||
                    !timestamps.every(function (t) { return typeof t === "string" || typeof t === "number"; })) {
                    throw new Error("Required array of each either string or number");
                }
                for (var i = 0; i < timestamps.length; i++) {
                    var stamp = timestamps[i];
                    var data = _this.getValidTimestamp(stamp, options);
                    if (data) {
                        return data;
                    }
                }
                throw new Error("No valid timestamp received");
            }
            catch (err) {
                console.error("Error getting any valid timestamp :", err);
                return null;
            }
        };
        /**
         * @description Updates `totalTimestamp` and `totalTime` if valid.
         * @description Can also default to zero if invalid value by setting option `defaultizeIfInvalid`
         */
        this.updateTotalTimestamp = function (timestamp, options) {
            try {
                var data = _this.getValidTimestamp(timestamp, options);
                if (!data) {
                    throw new Error("Invalid value passed, required string in format hh:mm:ss or number >= 0");
                }
                _this.params.totalTime = data.secs;
                _this.params.totalTimestamp = data.stamp;
            }
            catch (err) {
                _this.debug && console.error("Error updating timestamp :", err);
            }
        };
        this.start = function (startValue, payload) {
            var _a;
            if (startValue === void 0) { startValue = 0; }
            try {
                var startTime = _this.getValidTimestamp(startValue, {
                    defaultizeIfInvalid: true,
                });
                // console.log(startTime, this.params);
                if (!startTime) {
                    throw new Error("Parsing start time failed");
                }
                (_a = _this.bar) === null || _a === void 0 ? void 0 : _a.start(_this.params.totalTime, startTime.secs, payload);
            }
            catch (err) {
                _this.debug && console.error("Error starting progress bar :", err);
            }
        };
        this.update = function (progress) {
            var _a;
            try {
                if (_this.timer) {
                    clearTimeout(_this.timer);
                }
                var data = _this.getValidTimestamp(progress);
                if (!(data === null || data === void 0 ? void 0 : data.stamp)) {
                    throw new Error("Error parsing timestamp");
                }
                (_a = _this.bar) === null || _a === void 0 ? void 0 : _a.update(data.secs);
                // this.timer = setTimeout(() => {
                // }, 10);
            }
            catch (err) {
                _this.debug && console.error("Error updating progress :", err);
            }
        };
        // @ts-ignore
        this.bar = new cli_progress_1.SingleBar(__assign({}, options), __assign({}, preset));
        this.updateTotalTimestamp(totalTimestamp);
        if (typeof alterOptions === "object" &&
            Object.hasOwn(__assign({}, alterOptions), "debug")) {
            this.debug = !!alterOptions.debug;
        }
    }
    ProgressBar.validateTimestamp = function (timestamp, options) {
        var data = {
            parsedTimestamp: "",
            valid: false,
        };
        try {
            if (typeof timestamp !== "string") {
                throw new Error("Timestamp must be string");
            }
            var match = timestamp.match(/^([0-9]{1,2}\:)?([0-9]{1,2}\:)?([0-9]{1,2})(\.[0-9]+)?$/); // hh:mm:ss.S
            if (!match) {
                throw new Error("Timestamp must be something like hh:mm:ss.S");
            }
            var arr = match[0].split(":").map(function (s) { return s.padStart(2, "0"); });
            if (arr.length < 3) {
                arr = Array(3 - arr.length)
                    .fill("00")
                    .concat(arr);
                // arr = arr.fill("00", 0, 3 - arr.length);
            }
            data.parsedTimestamp = arr.join(":");
            data.valid = true;
            return data;
        }
        catch (err) {
            if (typeof options === "object" && (options === null || options === void 0 ? void 0 : options.debug)) {
                console.error("Error validating timestamp :", err);
            }
            return data;
        }
    };
    return ProgressBar;
}());
exports.ProgressBar = ProgressBar;
// console.log(ProgressBar.validateTimestamp(""));
