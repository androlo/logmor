/* eslint-disable no-useless-escape, no-cond-assign, no-empty, no-prototype-builtins */
import CodeMirror from "codemirror";
import {allKeywords} from "../Tokens";

import 'codemirror/addon/mode/simple.js';

const atoms = [
    'true',
    'pos',
    'false',
    'neg',
    'either'
];

const builtinKeywords = [

];

let atomRegex = () => {
    let str = '';
    for (const a of atoms) {
        str += a + '|';
    }
    str = str.slice(0, str.length - 1);
    return str;
};

let keywordRegex = () => {
    let str = '';
    for (const kw of allKeywords) {
        str += kw + '|';
    }
    for (const kw of builtinKeywords) {
        str += kw + '|';
    }
    str = str.slice(0, str.length - 1);
    return str;
};

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

CodeMirror.defineSimpleMode("lcc", {
    // The start state contains the rules that are intially used

    start: [
        // The regex matches the token, the token property contains the type
        {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
        {regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: "string"},
        {regex: /`/, token: "string", next: "stringtpt"},

        // Rules are matched in the order in which they appear, so there is
        // no ambiguity between this one and the one above
        {
            regex: keywordRegex(),
            token: "keyword"
        },
        {regex: atomRegex(), token: "atom"},
        {
            regex: /\d+\.?\d*/,
            token: "number"
        },
        {regex: /\/\/.*/, token: "comment"},
        // A next property will cause the mode to move to a different state
        {regex: /\/\*/, token: "comment", next: "comment"},
        {regex: /[+\-*&^%:=<>~!|\/]+/, token: "operator"},
        // indent and dedent properties guide autoindentation
        {regex: /[\{\[\(]/, indent: true},
        {regex: /[\}\]\)]/, dedent: true},
        {regex: /[A-Za-z_]+\w*/, token: "variable"},
    ],
    // The multi-line comment state.
    comment: [
        {regex: /.*?\*\//, token: "comment", next: "start"},
        {regex: /.*/, token: "comment"}
    ],
    stringtpt: [
        {regex: /`/, token: "string", next: "start"},
        {regex: /[^`]*/, token: "string"}
    ],
    // The meta property contains global information about the mode. It
    // can contain properties like lineComment, which are supported by
    // all modes, and also directives like dontIndentStates, which are
    // specific to simple modes.
    meta: {
        dontIndentStates: ["comment", "stringtpt"],
        lineComment: "//"
    }
});

CodeMirror.defineMIME("text/x-lcc", "lcc");

