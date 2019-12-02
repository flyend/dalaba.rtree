"use strict";
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? factory(exports)
        : typeof define === "function" && define.amd
            ? define(["exports"], factory)
            : factory((global.Dalaba = global.Dalaba || {}));
}(typeof window !== "undefined" ? window : typeof this !== "undefined" ? this : global, (function (exports) {

    (exports.geom = exports.geom || {}).RTree = require("./rtree").deps(exports);

    Object.defineProperty(exports, "__esModule", { value: true });
})));