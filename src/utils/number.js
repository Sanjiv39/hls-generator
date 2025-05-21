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
exports.validateNumber = void 0;
var validateNumber = function (value, options) {
    var allOptions = __assign({ validateNaN: true, validateFinite: true, validateCountable: true, defaultValue: 0 }, options);
    try {
        if (typeof value !== "number") {
            return allOptions.defaultValue;
        }
        if (allOptions.validateNaN && Number.isNaN(value)) {
            return allOptions.defaultValue;
        }
        if (allOptions.validateFinite && !Number.isFinite(value)) {
            return allOptions.defaultValue;
        }
        if (allOptions.validateCountable && value <= 0) {
            return allOptions.defaultValue;
        }
        if (typeof allOptions.customValidation === "function") {
            value = allOptions.customValidation(value);
        }
        return value;
    }
    catch (err) {
        return allOptions.defaultValue;
    }
};
exports.validateNumber = validateNumber;
