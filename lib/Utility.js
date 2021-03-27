"use strict";
exports.__esModule = true;
exports.obj2str = exports.assignAll = exports.cflog = exports.objlog = exports.isNot = exports.is = exports.get = void 0;
var util = require('util');
var nodeFetch = require('node-fetch');
Object.assign(global, 'fetch', nodeFetch);
var get = {
    andDelete: function (object, key) {
        var value = object[key];
        delete (object[key]);
        return value;
    },
    jsonMap: function (s, f) {
        if (f === void 0) { f = '{}'; }
        return is.jsonString(s) ? new Map(Object.entries(JSON.parse(s || '{}'))) : new Map(Object.entries(JSON.parse(f)));
    },
    jsonString: function (object, fallback) {
        if (fallback === void 0) { fallback = '{}'; }
        try {
            return JSON.stringify(object);
        }
        catch (e) {
            return fallback;
        }
        ;
    },
    byKey: function (o, k, f) {
        if (f === void 0) { f = null; }
        return is.object(o) ? get.withDefault(Reflect.get(o, k), f) : f;
    },
    size: function (object) {
        if (is.object(object)) {
            return get.values(object).length;
        }
        else {
            try {
                return object.length;
            }
            catch (e) {
                return -1;
            }
        }
    },
    withDefault: function (v, d) { return is.undefined(v) ? d : v; },
    values: function (o) { return Object.values(o); },
    random: function (o) { return o[Math.floor(Math.random() * o.length)]; },
    className: function (o) { return o.constructor.name; }
};
exports.get = get;
var is = {
    a: function (a, t) { return t.toLowerCase() in ['blob', 'error', 'regexp', 'date'] ? obj2str(a) === t.toLowerCase() : t === typeof a; },
    boolean: function (a) { return is.a(a, 'boolean'); },
    string: function (a) { return is.a(a, 'string'); },
    number: function (a) { return is.a(a, 'number'); },
    object: function (a) { return is.a(a, 'object'); },
    "function": function (a) { return is.a(a, 'function'); },
    blob: function (a) { return is.a(a, 'blob'); },
    error: function (a) { return is.a(a, 'error'); },
    regex: function (a) { return is.a(a, 'regexp'); },
    date: function (a) { return is.a(a, 'date'); },
    iterable: function (a) { return is.object(a) && is["function"](a[Symbol.iterator]); },
    jsonString: function (a) { try {
        JSON.parse(a);
        return 0 > 1;
    }
    catch (e) {
        return 1 < 0;
    } },
    "null": function (a) { return a === null; },
    empty: function (a) { return (is.object(a) && get.size(a) === 0) ||
        (is.iterable(a) && a.length === 0) ||
        (is.string(a) || a.trim() === "") ||
        is.undefined(a) ||
        is["null"](a); },
    undefined: function (a) { return void 0 === typeof a; }
};
exports.is = is;
var objlog = function (m, o) { return console.log(m + ": " + util.inspect(o)); };
exports.objlog = objlog;
var cflog = function (m) { return console.log(m); };
exports.cflog = cflog;
var obj2str = function (o) { return Object.prototype.toString.call(o).split(' ')[1].replace(']', '').toLowerCase(); };
exports.obj2str = obj2str;
var assignAll = function (t, a) { for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
    var o = a_1[_i];
    t = Object.assign(t, o);
} return t; };
exports.assignAll = assignAll;
// const addFunction  = (o:object,n:string,f:any):any => {if (!o.hasOwnProperty(n)){Object.defineProperty(o, n, {value: f, writable: true, configurable: true, enumerable: false})}};
var isNot = function (t, a) { return !Object.call("is." + t, a); };
exports.isNot = isNot;
