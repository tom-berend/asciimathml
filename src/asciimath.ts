// TODO
// internal stylesheet for <b> <i> <ss> colors, fonts
// clean up parser that finds symbols in text (eg: 'in' in undefined)
// maybe add fonts created from unicode glyphs
// investigate TEMML   https://temml.org/
// integrate weird fonts https://github.com/beizhedenglong/weird-fonts


/*
ASCIIMathML.js          // downloaded 23-mar-2026
==============
This file contains JavaScript functions to convert ASCII math notation
and (some) LaTeX to Presentation MathML. The conversion is done while the
HTML page loads, and should work with Firefox and other browsers that can
render MathML.

Just add the next line to your HTML page with this file in the same folder:

<script type="text/javascript" src="ASCIIMathML.js"></script>

Version 2.2 Mar 3, 2014.
Latest version at https://github.com/mathjax/asciimathml
If you use it on a webpage, please send the URL to jipsen@chapman.edu

Copyright (c) 2014 Peter Jipsen and other ASCIIMathML.js contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


type recurseType = 'func' | 'acc' | 'leftbracket' | ''    // enforce calledFrom

// difference from Dr Lippman's version
// supports -100 correctly, there are two different meanings of minus sign.  difference is no space in number '-100'


type AMSymbol = {
    input: string
    tag?: string // 'mi' | 'mo' | 'mn' | 'mroot' | 'mfrac' | 'msup' | 'msub' | 'mover' | 'mtext' | 'msqrt' | 'munder' | 'mstyle' | 'menclose' | 'mrow'
    output?: string
    tex?: string | null
    ttype: number //tokenType

    invisible?: boolean         // all these other unreliable elements ?!?!
    func?: boolean
    acc?: boolean
    rewriteleftright?: string[]  // always two
    notexcopy?: boolean

    atname?: "mathvariant",
    atval?: "bold" | "sans-serif" | "double-struck" | "script" | "fraktur" | "monospace"
    codes?: string
}

let AMmathml = "http://www.w3.org/1998/Math/MathML";


let CONST = 0, UNARY = 1, BINARY = 2, INFIX = 3, LEFTBRACKET = 4,
    RIGHTBRACKET = 5, SPACE = 6, UNDEROVER = 7, DEFINITION = 8,
    LEFTRIGHT = 9, TEXT = 10, BIG = 11, LONG = 12, STRETCHY = 13,
    MATRIX = 14, UNARYUNDEROVER = 15; // token types


const fixphi = true;  		//false to return to legacy phi/varphi mapping

const AMquote: AMSymbol = { input: "\"", tag: "mtext", output: "mbox", tex: null, ttype: TEXT };

export const AMsymbols: AMSymbol[] = [
    //some greek symbols
    { input: "alpha", tag: "mi", output: "\u03B1", tex: null, ttype: CONST },
    { input: "beta", tag: "mi", output: "\u03B2", tex: null, ttype: CONST },
    { input: "chi", tag: "mi", output: "\u03C7", tex: null, ttype: CONST },
    { input: "delta", tag: "mi", output: "\u03B4", tex: null, ttype: CONST },
    { input: "Delta", tag: "mo", output: "\u0394", tex: null, ttype: CONST },
    { input: "epsi", tag: "mi", output: "\u03B5", tex: "epsilon", ttype: CONST },
    { input: "varepsilon", tag: "mi", output: "\u025B", tex: null, ttype: CONST },
    { input: "eta", tag: "mi", output: "\u03B7", tex: null, ttype: CONST },
    { input: "gamma", tag: "mi", output: "\u03B3", tex: null, ttype: CONST },
    { input: "Gamma", tag: "mo", output: "\u0393", tex: null, ttype: CONST },
    { input: "iota", tag: "mi", output: "\u03B9", tex: null, ttype: CONST },
    { input: "kappa", tag: "mi", output: "\u03BA", tex: null, ttype: CONST },
    { input: "lambda", tag: "mi", output: "\u03BB", tex: null, ttype: CONST },
    { input: "Lambda", tag: "mo", output: "\u039B", tex: null, ttype: CONST },
    { input: "lamda", tag: "mi", output: "\u03BB", tex: null, ttype: CONST },
    { input: "Lamda", tag: "mo", output: "\u039B", tex: null, ttype: CONST },
    { input: "mu", tag: "mi", output: "\u03BC", tex: null, ttype: CONST },
    { input: "nu", tag: "mi", output: "\u03BD", tex: null, ttype: CONST },
    { input: "omega", tag: "mi", output: "\u03C9", tex: null, ttype: CONST },
    { input: "Omega", tag: "mo", output: "\u03A9", tex: null, ttype: CONST },
    { input: "phi", tag: "mi", output: fixphi ? "\u03D5" : "\u03C6", tex: null, ttype: CONST },
    { input: "varphi", tag: "mi", output: fixphi ? "\u03C6" : "\u03D5", tex: null, ttype: CONST },
    { input: "Phi", tag: "mo", output: "\u03A6", tex: null, ttype: CONST },
    { input: "pi", tag: "mi", output: "\u03C0", tex: null, ttype: CONST },
    { input: "Pi", tag: "mo", output: "\u03A0", tex: null, ttype: CONST },
    { input: "psi", tag: "mi", output: "\u03C8", tex: null, ttype: CONST },
    { input: "Psi", tag: "mi", output: "\u03A8", tex: null, ttype: CONST },
    { input: "rho", tag: "mi", output: "\u03C1", tex: null, ttype: CONST },
    { input: "sigma", tag: "mi", output: "\u03C3", tex: null, ttype: CONST },
    { input: "Sigma", tag: "mo", output: "\u03A3", tex: null, ttype: CONST },
    { input: "tau", tag: "mi", output: "\u03C4", tex: null, ttype: CONST },
    { input: "theta", tag: "mi", output: "\u03B8", tex: null, ttype: CONST },
    { input: "vartheta", tag: "mi", output: "\u03D1", tex: null, ttype: CONST },
    { input: "Theta", tag: "mo", output: "\u0398", tex: null, ttype: CONST },
    { input: "upsilon", tag: "mi", output: "\u03C5", tex: null, ttype: CONST },
    { input: "xi", tag: "mi", output: "\u03BE", tex: null, ttype: CONST },
    { input: "Xi", tag: "mo", output: "\u039E", tex: null, ttype: CONST },
    { input: "zeta", tag: "mi", output: "\u03B6", tex: null, ttype: CONST },

    //binary operation symbols
    //{input:"-",  tag:"mo", output:"\u0096", tex:null, ttype:CONST},
    { input: "*", tag: "mo", output: "\u22C5", tex: "cdot", ttype: CONST },
    { input: "**", tag: "mo", output: "\u2217", tex: "ast", ttype: CONST },
    { input: "***", tag: "mo", output: "\u22C6", tex: "star", ttype: CONST },
    { input: "//", tag: "mo", output: "/", tex: null, ttype: CONST },
    { input: "\\\\", tag: "mo", output: "\\", tex: "backslash", ttype: CONST },
    { input: "setminus", tag: "mo", output: "\\", tex: null, ttype: CONST },
    { input: "xx", tag: "mo", output: "\u00D7", tex: "times", ttype: CONST },
    { input: "|><", tag: "mo", output: "\u22C9", tex: "ltimes", ttype: CONST },
    { input: "><|", tag: "mo", output: "\u22CA", tex: "rtimes", ttype: CONST },
    { input: "|><|", tag: "mo", output: "\u22C8", tex: "bowtie", ttype: CONST },
    { input: "-:", tag: "mo", output: "\u00F7", tex: "div", ttype: CONST },
    { input: "divide", tag: "mo", output: "-:", tex: null, ttype: DEFINITION },
    { input: "@", tag: "mo", output: "\u2218", tex: "circ", ttype: CONST },
    { input: "o+", tag: "mo", output: "\u2295", tex: "oplus", ttype: CONST },
    { input: "o-", tag: "mo", output: "\u2296", tex: "ominus", ttype: CONST },
    { input: "ox", tag: "mo", output: "\u2297", tex: "otimes", ttype: CONST },
    { input: "o.", tag: "mo", output: "\u2299", tex: "odot", ttype: CONST },
    { input: "sum", tag: "mo", output: "\u2211", tex: null, ttype: UNDEROVER },
    { input: "prod", tag: "mo", output: "\u220F", tex: null, ttype: UNDEROVER },
    { input: "^^", tag: "mo", output: "\u2227", tex: "wedge", ttype: CONST },
    { input: "^^^", tag: "mo", output: "\u22C0", tex: "bigwedge", ttype: UNDEROVER },
    { input: "vv", tag: "mo", output: "\u2228", tex: "vee", ttype: CONST },
    { input: "vvv", tag: "mo", output: "\u22C1", tex: "bigvee", ttype: UNDEROVER },
    { input: "nn", tag: "mo", output: "\u2229", tex: "cap", ttype: CONST },
    { input: "nnn", tag: "mo", output: "\u22C2", tex: "bigcap", ttype: UNDEROVER },
    { input: "uu", tag: "mo", output: "\u222A", tex: "cup", ttype: CONST },
    { input: "uuu", tag: "mo", output: "\u22C3", tex: "bigcup", ttype: UNDEROVER },
    { input: "dag", tag: "mo", output: "\u2020", tex: "dagger", ttype: CONST },
    { input: "ddag", tag: "mo", output: "\u2021", tex: "ddagger", ttype: CONST },

    //binary relation symbols
    { input: "!=", tag: "mo", output: "\u2260", tex: "ne", ttype: CONST },
    { input: ":=", tag: "mo", output: ":=", tex: null, ttype: CONST },
    { input: "lt", tag: "mo", output: "<", tex: null, ttype: CONST },
    { input: "<=", tag: "mo", output: "\u2264", tex: "le", ttype: CONST },
    { input: "lt=", tag: "mo", output: "\u2264", tex: "leq", ttype: CONST },
    { input: "gt", tag: "mo", output: ">", tex: null, ttype: CONST },
    { input: "mlt", tag: "mo", output: "\u226A", tex: "ll", ttype: CONST },
    { input: ">=", tag: "mo", output: "\u2265", tex: "ge", ttype: CONST },
    { input: "gt=", tag: "mo", output: "\u2265", tex: "geq", ttype: CONST },
    { input: "mgt", tag: "mo", output: "\u226B", tex: "gg", ttype: CONST },
    { input: "-<", tag: "mo", output: "\u227A", tex: "prec", ttype: CONST },
    { input: "-lt", tag: "mo", output: "\u227A", tex: null, ttype: CONST },
    { input: ">-", tag: "mo", output: "\u227B", tex: "succ", ttype: CONST },
    { input: "-<=", tag: "mo", output: "\u2AAF", tex: "preceq", ttype: CONST },
    { input: ">-=", tag: "mo", output: "\u2AB0", tex: "succeq", ttype: CONST },
    { input: "in", tag: "mo", output: "\u2208", tex: null, ttype: CONST },
    { input: "!in", tag: "mo", output: "\u2209", tex: "notin", ttype: CONST },
    { input: "sub", tag: "mo", output: "\u2282", tex: "subset", ttype: CONST },
    { input: "!sub", tag: "mo", output: "\u2284", tex: "not\\subset", ttype: CONST },
    { input: "notsubset", tag: "mo", output: "!sub", tex: null, ttype: DEFINITION },
    { input: "sup", tag: "mo", output: "\u2283", tex: "supset", ttype: CONST },
    { input: "!sup", tag: "mo", output: "\u2285", tex: "not\\supset", ttype: CONST },
    { input: "notsupset", tag: "mo", output: "!sup", tex: null, ttype: DEFINITION },
    { input: "sube", tag: "mo", output: "\u2286", tex: "subseteq", ttype: CONST },
    { input: "!sube", tag: "mo", output: "\u2288", tex: "not\\subseteq", ttype: CONST },
    { input: "notsubseteq", tag: "mo", output: "!sube", tex: null, ttype: DEFINITION },
    { input: "supe", tag: "mo", output: "\u2287", tex: "supseteq", ttype: CONST },
    { input: "!supe", tag: "mo", output: "\u2289", tex: "not\\supseteq", ttype: CONST },
    { input: "notsupseteq", tag: "mo", output: "!supe", tex: null, ttype: DEFINITION },
    { input: "-=", tag: "mo", output: "\u2261", tex: "equiv", ttype: CONST },
    { input: "!-=", tag: "mo", output: "\u2262", tex: "not\\equiv", ttype: CONST },
    { input: "notequiv", tag: "mo", output: "!-=", tex: null, ttype: DEFINITION },
    { input: "~=", tag: "mo", output: "\u2245", tex: "cong", ttype: CONST },
    { input: "~~", tag: "mo", output: "\u2248", tex: "approx", ttype: CONST },
    { input: "~", tag: "mo", output: "\u223C", tex: "sim", ttype: CONST },
    { input: "prop", tag: "mo", output: "\u221D", tex: "propto", ttype: CONST },

    //logical symbols
    { input: "and", tag: "mtext", output: "and", tex: null, ttype: SPACE },
    { input: "or", tag: "mtext", output: "or", tex: null, ttype: SPACE },
    { input: "not", tag: "mo", output: "\u00AC", tex: "neg", ttype: CONST },
    { input: "=>", tag: "mo", output: "\u21D2", tex: "implies", ttype: CONST },
    { input: "if", tag: "mo", output: "if", tex: null, ttype: SPACE },
    { input: "<=>", tag: "mo", output: "\u21D4", tex: "iff", ttype: CONST },
    { input: "AA", tag: "mo", output: "\u2200", tex: "forall", ttype: CONST },
    { input: "EE", tag: "mo", output: "\u2203", tex: "exists", ttype: CONST },
    { input: "_|_", tag: "mo", output: "\u22A5", tex: "bot", ttype: CONST },
    { input: "TT", tag: "mo", output: "\u22A4", tex: "top", ttype: CONST },
    { input: "|--", tag: "mo", output: "\u22A2", tex: "vdash", ttype: CONST },
    { input: "|==", tag: "mo", output: "\u22A8", tex: "models", ttype: CONST },

    //grouping brackets
    { input: "(", tag: "mo", output: "(", tex: "left(", ttype: LEFTBRACKET },
    { input: ")", tag: "mo", output: ")", tex: "right)", ttype: RIGHTBRACKET },
    { input: "[", tag: "mo", output: "[", tex: "left[", ttype: LEFTBRACKET },
    { input: "]", tag: "mo", output: "]", tex: "right]", ttype: RIGHTBRACKET },
    { input: "{", tag: "mo", output: "{", tex: null, ttype: LEFTBRACKET },
    { input: "}", tag: "mo", output: "}", tex: null, ttype: RIGHTBRACKET },
    { input: "|", tag: "mo", output: "|", tex: null, ttype: LEFTRIGHT },
    { input: ":|:", tag: "mo", output: "|", tex: null, ttype: CONST },
    { input: "|:", tag: "mo", output: "|", tex: null, ttype: LEFTBRACKET },
    { input: ":|", tag: "mo", output: "|", tex: null, ttype: RIGHTBRACKET },
    //{input:"||", tag:"mo", output:"||", tex:null, ttype:LEFTRIGHT},
    { input: "(:", tag: "mo", output: "\u2329", tex: "langle", ttype: LEFTBRACKET },
    { input: ":)", tag: "mo", output: "\u232A", tex: "rangle", ttype: RIGHTBRACKET },
    { input: "<<", tag: "mo", output: "\u2329", tex: null, ttype: LEFTBRACKET },
    { input: ">>", tag: "mo", output: "\u232A", tex: null, ttype: RIGHTBRACKET },
    { input: "{:", tag: "mo", output: "{:", tex: null, ttype: LEFTBRACKET, invisible: true },
    { input: ":}", tag: "mo", output: ":}", tex: null, ttype: RIGHTBRACKET, invisible: true },

    //miscellaneous symbols
    { input: "int", tag: "mo", output: "\u222B", tex: null, ttype: CONST },
    { input: "dx", tag: "mi", output: "{:d x:}", tex: null, ttype: DEFINITION },
    { input: "dy", tag: "mi", output: "{:d y:}", tex: null, ttype: DEFINITION },
    { input: "dz", tag: "mi", output: "{:d z:}", tex: null, ttype: DEFINITION },
    { input: "dt", tag: "mi", output: "{:d t:}", tex: null, ttype: DEFINITION },
    { input: "oint", tag: "mo", output: "\u222E", tex: null, ttype: CONST },
    { input: "del", tag: "mo", output: "\u2202", tex: "partial", ttype: CONST },
    { input: "grad", tag: "mo", output: "\u2207", tex: "nabla", ttype: CONST },
    { input: "+-", tag: "mo", output: "\u00B1", tex: "pm", ttype: CONST },
    { input: "-+", tag: "mo", output: "\u2213", tex: "mp", ttype: CONST },
    { input: "O/", tag: "mo", output: "\u2205", tex: "emptyset", ttype: CONST },
    { input: "oo", tag: "mo", output: "\u221E", tex: "infty", ttype: CONST },
    { input: "aleph", tag: "mo", output: "\u2135", tex: null, ttype: CONST },
    { input: "...", tag: "mo", output: "...", tex: "ldots", ttype: CONST },
    { input: ":.", tag: "mo", output: "\u2234", tex: "therefore", ttype: CONST },
    { input: ":'", tag: "mo", output: "\u2235", tex: "because", ttype: CONST },
    { input: "/_", tag: "mo", output: "\u2220", tex: "angle", ttype: CONST },
    { input: "/_\\", tag: "mo", output: "\u25B3", tex: "triangle", ttype: CONST },
    { input: "'", tag: "mo", output: "\u2032", tex: "prime", ttype: CONST },
    { input: "tilde", tag: "mover", output: "~", tex: null, ttype: UNARY, acc: true },
    { input: "\\ ", tag: "mo", output: "\u00A0", tex: null, ttype: CONST },
    { input: "frown", tag: "mo", output: "\u2322", tex: null, ttype: CONST },
    { input: "quad", tag: "mo", output: "\u00A0\u00A0", tex: null, ttype: CONST },
    { input: "qquad", tag: "mo", output: "\u00A0\u00A0\u00A0\u00A0", tex: null, ttype: CONST },
    { input: "cdots", tag: "mo", output: "\u22EF", tex: null, ttype: CONST },
    { input: "vdots", tag: "mo", output: "\u22EE", tex: null, ttype: CONST },
    { input: "ddots", tag: "mo", output: "\u22F1", tex: null, ttype: CONST },
    { input: "diamond", tag: "mo", output: "\u22C4", tex: null, ttype: CONST },
    { input: "square", tag: "mo", output: "\u25A1", tex: null, ttype: CONST },
    { input: "|__", tag: "mo", output: "\u230A", tex: "lfloor", ttype: CONST },
    { input: "__|", tag: "mo", output: "\u230B", tex: "rfloor", ttype: CONST },
    { input: "|~", tag: "mo", output: "\u2308", tex: "lceiling", ttype: CONST },
    { input: "~|", tag: "mo", output: "\u2309", tex: "rceiling", ttype: CONST },
    { input: "CC", tag: "mo", output: "\u2102", tex: null, ttype: CONST },
    { input: "NN", tag: "mo", output: "\u2115", tex: null, ttype: CONST },
    { input: "QQ", tag: "mo", output: "\u211A", tex: null, ttype: CONST },
    { input: "RR", tag: "mo", output: "\u211D", tex: null, ttype: CONST },
    { input: "ZZ", tag: "mo", output: "\u2124", tex: null, ttype: CONST },
    { input: "f", tag: "mi", output: "f", tex: null, ttype: UNARY, func: true },
    { input: "g", tag: "mi", output: "g", tex: null, ttype: UNARY, func: true },
    { input: "hbar", tag: "mo", output: "\u210F", tex: null, ttype: CONST },

    //standard functions
    { input: "lim", tag: "mo", output: "lim", tex: null, ttype: UNDEROVER },
    { input: "Lim", tag: "mo", output: "Lim", tex: null, ttype: UNDEROVER },
    { input: "sin", tag: "mo", output: "sin", tex: null, ttype: UNARY, func: true },
    { input: "cos", tag: "mo", output: "cos", tex: null, ttype: UNARY, func: true },
    { input: "tan", tag: "mo", output: "tan", tex: null, ttype: UNARY, func: true },
    { input: "sinh", tag: "mo", output: "sinh", tex: null, ttype: UNARY, func: true },
    { input: "cosh", tag: "mo", output: "cosh", tex: null, ttype: UNARY, func: true },
    { input: "tanh", tag: "mo", output: "tanh", tex: null, ttype: UNARY, func: true },
    { input: "cot", tag: "mo", output: "cot", tex: null, ttype: UNARY, func: true },
    { input: "sec", tag: "mo", output: "sec", tex: null, ttype: UNARY, func: true },
    { input: "csc", tag: "mo", output: "csc", tex: null, ttype: UNARY, func: true },
    { input: "arcsin", tag: "mo", output: "arcsin", tex: null, ttype: UNARY, func: true },
    { input: "arccos", tag: "mo", output: "arccos", tex: null, ttype: UNARY, func: true },
    { input: "arctan", tag: "mo", output: "arctan", tex: null, ttype: UNARY, func: true },
    { input: "arcsec", tag: "mo", output: "arcsec", tex: null, ttype: UNARY, func: true },
    { input: "arccsc", tag: "mo", output: "arccsc", tex: null, ttype: UNARY, func: true },
    { input: "arccot", tag: "mo", output: "arccot", tex: null, ttype: UNARY, func: true },
    { input: "coth", tag: "mo", output: "coth", tex: null, ttype: UNARY, func: true },
    { input: "sech", tag: "mo", output: "sech", tex: null, ttype: UNARY, func: true },
    { input: "csch", tag: "mo", output: "csch", tex: null, ttype: UNARY, func: true },
    { input: "exp", tag: "mo", output: "exp", tex: null, ttype: UNARY, func: true },
    { input: "abs", tag: "mo", output: "abs", tex: null, ttype: UNARY, rewriteleftright: ["|", "|"] },
    { input: "norm", tag: "mo", output: "norm", tex: null, ttype: UNARY, rewriteleftright: ["\u2225", "\u2225"] },
    { input: "floor", tag: "mo", output: "floor", tex: null, ttype: UNARY, rewriteleftright: ["\u230A", "\u230B"] },
    { input: "ceil", tag: "mo", output: "ceil", tex: null, ttype: UNARY, rewriteleftright: ["\u2308", "\u2309"] },
    { input: "log", tag: "mo", output: "log", tex: null, ttype: UNARY, func: true },
    { input: "ln", tag: "mo", output: "ln", tex: null, ttype: UNARY, func: true },
    { input: "det", tag: "mo", output: "det", tex: null, ttype: UNARY, func: true },
    { input: "dim", tag: "mo", output: "dim", tex: null, ttype: CONST },
    { input: "mod", tag: "mo", output: "mod", tex: null, ttype: CONST },
    { input: "gcd", tag: "mo", output: "gcd", tex: null, ttype: UNARY, func: true },
    { input: "lcm", tag: "mo", output: "lcm", tex: null, ttype: UNARY, func: true },
    { input: "lub", tag: "mo", output: "lub", tex: null, ttype: CONST },
    { input: "glb", tag: "mo", output: "glb", tex: null, ttype: CONST },
    { input: "min", tag: "mo", output: "min", tex: null, ttype: UNDEROVER },
    { input: "max", tag: "mo", output: "max", tex: null, ttype: UNDEROVER },
    { input: "Sin", tag: "mo", output: "Sin", tex: null, ttype: UNARY, func: true },
    { input: "Cos", tag: "mo", output: "Cos", tex: null, ttype: UNARY, func: true },
    { input: "Tan", tag: "mo", output: "Tan", tex: null, ttype: UNARY, func: true },
    { input: "Arcsin", tag: "mo", output: "Arcsin", tex: null, ttype: UNARY, func: true },
    { input: "Arccos", tag: "mo", output: "Arccos", tex: null, ttype: UNARY, func: true },
    { input: "Arctan", tag: "mo", output: "Arctan", tex: null, ttype: UNARY, func: true },
    { input: "Sinh", tag: "mo", output: "Sinh", tex: null, ttype: UNARY, func: true },
    { input: "Cosh", tag: "mo", output: "Cosh", tex: null, ttype: UNARY, func: true },
    { input: "Tanh", tag: "mo", output: "Tanh", tex: null, ttype: UNARY, func: true },
    { input: "Cot", tag: "mo", output: "Cot", tex: null, ttype: UNARY, func: true },
    { input: "Sec", tag: "mo", output: "Sec", tex: null, ttype: UNARY, func: true },
    { input: "Csc", tag: "mo", output: "Csc", tex: null, ttype: UNARY, func: true },
    { input: "Log", tag: "mo", output: "Log", tex: null, ttype: UNARY, func: true },
    { input: "Ln", tag: "mo", output: "Ln", tex: null, ttype: UNARY, func: true },
    { input: "Abs", tag: "mo", output: "abs", tex: null, ttype: UNARY, notexcopy: true, rewriteleftright: ["|", "|"] },

    //arrows
    { input: "uarr", tag: "mo", output: "\u2191", tex: "uparrow", ttype: CONST },
    { input: "darr", tag: "mo", output: "\u2193", tex: "downarrow", ttype: CONST },
    { input: "rarr", tag: "mo", output: "\u2192", tex: "rightarrow", ttype: CONST },
    { input: "->", tag: "mo", output: "\u2192", tex: "to", ttype: CONST },
    { input: ">->", tag: "mo", output: "\u21A3", tex: "rightarrowtail", ttype: CONST },
    { input: "->>", tag: "mo", output: "\u21A0", tex: "twoheadrightarrow", ttype: CONST },
    { input: ">->>", tag: "mo", output: "\u2916", tex: "twoheadrightarrowtail", ttype: CONST },
    { input: "|->", tag: "mo", output: "\u21A6", tex: "mapsto", ttype: CONST },
    { input: "larr", tag: "mo", output: "\u2190", tex: "leftarrow", ttype: CONST },
    { input: "harr", tag: "mo", output: "\u2194", tex: "leftrightarrow", ttype: CONST },
    { input: "rArr", tag: "mo", output: "\u21D2", tex: "Rightarrow", ttype: CONST },
    { input: "lArr", tag: "mo", output: "\u21D0", tex: "Leftarrow", ttype: CONST },
    { input: "dArr", tag: "mo", output: "\u21D3", tex: "Downarrow", ttype: CONST },
    { input: "hArr", tag: "mo", output: "\u21D4", tex: "Leftrightarrow", ttype: CONST },
    { input: "rightleftharpoons", tag: "mo", output: "\u21CC", tex: null, ttype: CONST },

    //commands with argument
    { input: "sqrt", tag: "msqrt", output: "sqrt", tex: null, ttype: UNARY },
    { input: "root", tag: "mroot", output: "root", tex: null, ttype: BINARY },
    { input: "frac", tag: "mfrac", output: "/", tex: null, ttype: BINARY },
    { input: "/", tag: "mfrac", output: "/", tex: null, ttype: INFIX },
    { input: "stackrel", tag: "mover", output: "stackrel", tex: null, ttype: BINARY },
    { input: "overset", tag: "mover", output: "stackrel", tex: null, ttype: BINARY },
    { input: "underset", tag: "munder", output: "stackrel", tex: null, ttype: BINARY },
    { input: "_", tag: "msub", output: "_", tex: null, ttype: INFIX },
    { input: "^", tag: "msup", output: "^", tex: null, ttype: INFIX },
    { input: "hat", tag: "mover", output: "\u0302", tex: null, ttype: UNARY, acc: true },
    { input: "bar", tag: "mover", output: "\u00AF", tex: "overline", ttype: UNARY, acc: true },
    { input: "vec", tag: "mover", output: "\u2192", tex: null, ttype: UNARY, acc: true },
    { input: "dot", tag: "mover", output: ".", tex: null, ttype: UNARY, acc: true },
    { input: "ddot", tag: "mover", output: "..", tex: null, ttype: UNARY, acc: true },
    { input: "overarc", tag: "mover", output: "\u23DC", tex: "overparen", ttype: UNARY, acc: true },
    { input: "ul", tag: "munder", output: "\u0332", tex: "underline", ttype: UNARY, acc: true },
    { input: "ubrace", tag: "munder", output: "\u23DF", tex: "underbrace", ttype: UNARYUNDEROVER, acc: true },
    { input: "obrace", tag: "mover", output: "\u23DE", tex: "overbrace", ttype: UNARYUNDEROVER, acc: true },
    { input: "text", tag: "mtext", output: "text", tex: null, ttype: TEXT },
    { input: "mbox", tag: "mtext", output: "mbox", tex: null, ttype: TEXT },
    { input: "color", tag: "mstyle", ttype: BINARY },
    { input: "id", tag: "mrow", ttype: BINARY },
    { input: "class", tag: "mrow", ttype: BINARY },
    { input: "cancel", tag: "menclose", output: "cancel", tex: null, ttype: UNARY },
    AMquote,
    { input: "bb", ttype: UNARY, tex: "mathbf", codes: 'bold' },
    { input: "sf", ttype: UNARY, tex: "mathsf", codes: 'sans-serif' },
    { input: "sfit", ttype: UNARY, codes: 'sans-serif-italic' },
    { input: "bbsf", ttype: UNARY, codes: 'bold-sans-serif' },
    { input: "bbb", ttype: UNARY, tex: "mathbb", codes: 'double-struck' },
    { input: "cc", ttype: UNARY, tex: "mathcal", codes: 'script' },
    { input: "bbcc", ttype: UNARY, codes: 'bold-script' },
    { input: "tt", ttype: UNARY, tex: "mathtt", codes: 'monospace' },
    { input: "fr", ttype: UNARY, tex: "mathfrak", codes: 'fraktur' },
    { input: "bbfr", ttype: UNARY, codes: 'bold-fraktur' },
    { input: "bbit", ttype: UNARY, codes: 'bold-italic' },
    { input: "bbsfit", ttype: UNARY, codes: 'sans-serif-bold-italic' },
    { input: "bold", ttype: UNARY },


];













const debug = true

/*Parsing ASCII math expressions with the following grammar
v ::= [A-Za-z] | greek letters | numbers | other constant symbols
u ::= sqrt | text | bb | other unary symbols for font commands
b ::= frac | root | stackrel         binary symbols
l ::= ( | [ | { | (: | {:            left brackets
r ::= ) | ] | } | :) | :}            right brackets
S ::= v | lEr | uS | bSS             Simple expression
I ::= S_S | S^S | S_S^S | S          Intermediate expression
E ::= IE | I/I                       Expression
Each terminal symbol is translated into a corresponding mathml node.*/



interface LooseObject { [key: string]: any }


// lexScanner values
type LEX_TOKEN = [string, number]
const LEX_STRING = -1

const AMbb = ["𝐀", "𝐁", "𝐂", "𝐃", "𝐄", "𝐅", "𝐆", "𝐇", "𝐈", "𝐉", "𝐊", "𝐋", "𝐌", "𝐍", "𝐎", "𝐏", "𝐐", "𝐑", "𝐒", "𝐓", "𝐔", "𝐕", "𝐖", "𝐗", "𝐘", "𝐙", "𝐚", "𝐛", "𝐜", "𝐝", "𝐞", "𝐟", "𝐠", "𝐡", "𝐢", "𝐣", "𝐤", "𝐥", "𝐦", "𝐧", "𝐨", "𝐩", "𝐪", "𝐫", "𝐬", "𝐭", "𝐮", "𝐯", "𝐰", "𝐱", "𝐲", "𝐳", "𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗"]


export class AsciiMath {

    AMquote

    noMathML = false
    translated = false;


    AMnestingDepth = 0
    AMpreviousSymbol = 0
    AMcurrentSymbol = 0
    AMnames = []; //list of input symbols

    AMdelimiter1 = "`"
    AMescape1 = "\\\\`"; // can use other characters
    mathfontfamily = 'serif'



    // will be set  by attributes
    mathcolor: string            // change it to "" (to inherit) or another color
    mathfontsize: string         // change to e.g. 1.2em for larger math
    automathrecognize: boolean    // writing "amath" on page makes this true
    translateASCIIMath: boolean   // false to preserve `..`
    displaystyle: boolean         // puts limits above and below large operators
    decimalsign: string          // if "," then when writing lists or matrices put a space after the "," like `(1, 2)` not `(1,2)`

    safety = 0

    constructor(attributes?: LooseObject) {

        // this.mathcolor = attributes.mathcolor
        // this.mathfontsize = attributes.mathfontsize
        // this.automathrecognize = attributes.automathrecognize
        // this.translateASCIIMath = attributes.translateASCIIMath
        // this.displaystyle = attributes.displaystyle
        // this.decimalsign = attributes.decimalsign

    }



    /** returns an array of string-index pairs, either ['string',-1] or  ['{',-2] or ['}',cCl] or or ['cmd',index] */
    //  If you want curly bracket in a string, use double quotes
    //  outputs tokens [lex, -1/index]  with -1 text
    //  whitespace is trimmed from strings unless quoted
    lexScanner(text: string): [string, number][] {

        // walk character-by-character and pull out the snips
        let tokenStart = 0
        let tokens: LEX_TOKEN[] = [] //text, lexScanner value or index of amssymbol
        let inQuotedString = false

        let pos = tokenStart  // keep moving pos ahead of tokenStart
        let safety = 0

        while (pos < text.length) {
            if (safety++ > 1000) throw new Error('Infinite loop')

            let ch = text.charAt(pos);

            // most of this function is worrying about quoted strings
            if (inQuotedString) {
                if (ch === '"') {  // close a quoted string  // use -2 for quoted string
                    tokens.push([text.slice(tokenStart, pos), -2])   // push the string up to the quote
                    inQuotedString = false
                    tokenStart = pos + 1    // skip over the quote, not added to the token
                    pos = tokenStart
                    continue
                } else {
                    pos += 1
                    continue
                }
            }
            if (ch === '"') {   // open a quoted string
                if (pos > tokenStart) {    // nothing between this and previous token
                    tokens.push(this.lexScannerSnip(text.slice(tokenStart, pos)))
                }
                inQuotedString = true
                tokenStart = pos + 1  // skip over the quote
                pos = tokenStart
                continue
            }

            // look forward to see if unambiguous symbol ahead
            if (pos == tokenStart) {  // only at start of string; too aggressive with mid-string tokens
                let inSymbolTbl = this.longestSymbol(text.slice(pos))
                if (inSymbolTbl !== '') {   // empty string if not found
                    tokens.push(this.lexScannerSnip(inSymbolTbl))
                    tokenStart += inSymbolTbl.length
                    pos = tokenStart
                    continue
                }
            }

            // always break on a space (not in a quoted string)
            if ([' ', '{', '}', '(', ')', '='].includes(ch)) {  // separators like space, brackets, comma
                if (pos > tokenStart) {  // longer than just this separator character
                    tokens.push(this.lexScannerSnip(text.slice(tokenStart, pos))) // what came before
                    tokenStart = pos
                }
                if (ch !== ' ') { // don't need to keep spaces
                    tokens.push(this.lexScannerSnip(ch))
                }
                tokenStart += 1    // skip over the separator
                pos = tokenStart
                continue
            }


            // break on change from symbol to alphabet to numbers
            if (pos > tokenStart && (
                this.containsOnlyLetters(text.slice(tokenStart, pos)) !== this.containsOnlyLetters(ch) ||
                this.containsOnlyNumbers(text.slice(tokenStart, pos)) !== this.containsOnlyNumbers(ch))) {

                tokens.push(this.lexScannerSnip(text.slice(tokenStart, pos)))
                tokenStart = pos    // start new token
                pos = tokenStart
                continue
            }

            // no one claims this token yet?  keep looking forward
            pos += 1

        }

        // we are at the end of the string
        if (tokenStart < text.length && text.slice(tokenStart).trim() !== '') {    // any non-blank remainder not accounted for?
            tokens.push(this.lexScannerSnip(text.slice(tokenStart)))
        }
        return tokens
    }

    // helper functions.  could have used fat-arrow functions, but want to translate this to PHP
    /** helper that takes a snip and returns either [snip, index] or [snip, LEX_STRING] depending on value */
    lexScannerSnip(snip: string): LEX_TOKEN {
        // console.warn(`${snip}`)
        // special case - a single minus sign is always a symbol.  Lex scanner doesn't look backwards, could be -100 or a-b
        if (snip === '-')
            return (['-', AMsymbols.findIndex((symbol) => symbol.input === snip)])

        let index = AMsymbols.findIndex((symbol) => symbol.input === snip || symbol.tex === snip)
        if (index === -1) {    // not in symbol table
            return [snip, LEX_STRING]   // command
        } else {
            return [AMsymbols[index].input, index]  // a command from the table (always AM, not TEX)
        }
    }
    /** helper for detecting break between alphas and symbols (assumes no Symbol contains both) */
    containsOnlyLetters(str) {
        let res = /^[A-Za-z]+$/.test(str);
        // console.log(`letters '${str}' returns ${res}`)
        return res
    }
    /** helper for detecting break between alphas and symbols (assumes no Symbol contains both) */
    containsOnlyNumbers(str): boolean {      // leading - is always a math minus. use quotes for "-100"
        // console.log(`numbers '${str}' `)
        if (str == '-' || str == '.') return true  // first char can be - or .  we might get space later
        let res = /^[-]?[0-9]*[.]?[0-9]*$/.test(str);  // allows leading minus and one decimal point
        // console.log(`numbers '${str}' returns ${res}`)
        return res
    }
    /** given the next few characters to parse, is there an unambiguous symbol?    */
    longestSymbol(str: string): string {  // returns empty string if no match
        let lastSymb = ''
        for (const [key, value] of Object.entries(AMsymbols)) {
            if (str.slice(0, value.input.length) === value.input) {     // match, but may be ambiguous
                if (value.input.length > lastSymb.length) {
                    lastSymb = value.input
                }
            }
            // now do it again for tex values
            if (value['tex'] !== undefined && value['tex'] !== null && str.slice(0, value.tex.length) === value.tex) {     // match, but may be ambiguous
                if (value.tex.length > lastSymb.length) {
                    lastSymb = value.tex
                }
            }
        } return lastSymb
    }


    ////////////////////////////////////
    ////////////////////////////////////
    ////////////////////////////////////


    parser(str: string, extraStyle: string = ''): string {
        let output = ''
        let index = 0

        // output += `<math display="block" xmlns="http://www.w3.org/1998/Math/MathML" title='${str}'>`
        output += `<math title="${str}">`
        // output += `<semantics></semantics>`
        output += `<mstyle mathcolor="blue" fontsize="1em" mathsize="1em" fontfamily="serif" mathvariant="serif" displaystyle="true">`
        output += `<mrow>`

        let lex = this.lexScanner(str)

        console.warn(`%c parsing '${str}'`, 'background-color:blue;')
        this.safety = 0

        while (index < lex.length) {
            let oldIndex = index
            if (this.safety > 100) {
                throw new Error(`Endless loop: output '${output}' at index ${index}: ${JSON.stringify(lex[index])}`)
            }
            console.warn(`%cinner outer index: '${index}', lex[index]: '${JSON.stringify(lex[index])}'`, 'background-color:green;')

            let partial = this.recursiveParser(lex, index, '', '')
            index = partial[1]

            if (oldIndex == partial[1]) // sanity check - did we eat anything?
                throw new Error(`didn't move forward on ${lex[index][0]}`)

            // now check if the partial result is followed by INFIX
            let symb = (index < lex.length && lex[index][1] >= 0) ? AMsymbols[lex[index][1]] : null
            if (symb && symb.ttype == INFIX) {
                partial = this.recursiveParser(lex, oldIndex, 'acc', '')    // run it again as an accent
                index = partial[1]
                index += 1  // the infix
                let partial2 = this.recursiveParser(lex, index, 'acc', '')
                output += `<${symb.tag} ${extraStyle}><mrow>${partial[0]}</mrow><mrow>${partial2[0]}</mrow></${symb.tag}>`
                index = partial2[1]
            } else {
                output += partial[0]    // almost every case except INFIX
                index = partial[1]
            }
        }

        output += `</mrow>`
        output += `</mstyle>`
        output += `</math>`

        // attempt to put svg inside <math>.  doesnt work
        // output += `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 100 100"    preserveAspectRatio="none">
        // <line
        // x1="0"
        // y1="100"
        // x2="100"
        // y2="0"
        // stroke="black"
        // />
        // </svg>`
        return output
    }

    /** eats both constants and literals */
    constantEater(lex: [string, number][], index: number, calledFrom: recurseType = '', extraStyle: string = ''): [string, number] {
        let output = ''
        let oldIndex = index;

        while (index < lex.length && (lex[index][1] === -1 || lex[index][1] === -2 || AMsymbols[lex[index][1]].ttype === CONST)) {
            // console.warn(`  constantEater, ${index}, ${JSON.stringify(lex[index])}, '${calledFrom}'`)

            if (lex[index][1] === -1) {  // literal, no symb available

                // a special case for infix - we look ahead.  if infix we must infix first
                let nextSymb = (index + 1 < lex.length && lex[index + 1][1] >= 0) ? AMsymbols[lex[index + 1][1]] : null

                if (false) { //(nextSymb && nextSymb.ttype === INFIX) {
                    output += `<${nextSymb.tag}>`

                    if (this.containsOnlyNumbers(lex[index][0])) {
                        output += `<mn ${extraStyle}>` + lex[index][0] + `</mn>`
                    } else {
                        output += `<mi ${extraStyle}>` + lex[index][0] + `</mi>`
                    }
                    index += 2  // skip over the infix token
                    if (this.containsOnlyNumbers(lex[index][0])) {
                        output += `<mn ${extraStyle}>` + lex[index][0] + `</mn>`
                    } else {
                        output += `<mi ${extraStyle}>` + lex[index][0] + `</mi>`
                    }
                    output += `</${nextSymb.tag}>`
                    index += 1
                    continue; //return [output, index]

                    // special case - comma.   if called from 'leftbracket' then breaks tablerow else just operator
                } else if (lex[index][0] === ',') {
                    output += (calledFrom == 'leftbracket') ? '</mtd><mtd>' : `<mo ${extraStyle}>,</mo>`
                    index += 1
                } else if (this.containsOnlyNumbers(lex[index][0]) && lex[index][0] !== '-') {  // ugly case of minus again
                    output += `<mn ${extraStyle}>` + lex[index][0] + `</mn>`;
                    index += 1
                } else {
                    let charArray = lex[index][0].split('')
                    for (let i = 0; i < charArray.length; i++) {
                        output += ['+', '/', '-', '*', '%', '$'].includes(charArray[i]) ? `<mo ${extraStyle}>${charArray[i]}</mo>` : `<mi ${extraStyle}>${charArray[i]}</mi>`
                    }
                    index += 1
                }

                // if (calledFrom == 'acc' || calledFrom == 'func')
                //     return [output, index]
                // else
                //     continue

            } else if (lex[index][1] === -2) {  // quoted string
                output += `<mtext ${extraStyle}>` + lex[index][0] + `</mtext>`;
                index += 1
                continue;  //return [output, index]

            } else {    // CONST
                // throw new Error('cannot be anything else')
                let symb = AMsymbols[lex[index][1]]   // the lex we are looking at
                if (symb.ttype == CONST) {
                    // console.assert(symb.ttype == CONST, 'expected CONST')
                    output += `<${symb.tag} ${extraStyle}>` + symb.output + `</${symb.tag}>`
                    index += 1
                    continue; //return [output, index]
                } else {
                    break       // not literal or string, not CONST, we have eaten all we can
                }
            }
            // every path comes through here
            // index += 1
        }

        // if (oldIndex == index) // sanity check - did we eat anything?
        //     throw new Error(`didn't move forward on ${lex[index][0]}`)

        return [output, index]
    }


    /**  returns parsed string and index of NEXT token */
    recursiveParser(lex: [string, number][], index: number, calledFrom: recurseType, extraStyle: string): [string, number] {

        if (index > lex.length - 1)
            throw new Error()

        let output = ''
        console.warn(`%cinner partial index=${index}, lex:'${lex[index][0]}' called from '${calledFrom}'`, 'background-color:darkred;')


        // just for debugging
        let current = index < lex.length ? lex[index] : -1

        // console.log('top loop', JSON.stringify(lex[index]))
        this.safety += 1
        if (this.safety > 100) {
            console.log(`output '${output}'`)
            if (lex[index][1] >= 0) {
                let symb = AMsymbols[lex[index][1]]   // the lex we are looking at
                let t: string = symb.ttype.toString()
                if (symb.ttype == 0) t = 'CONST'
                if (symb.ttype == 1) t = 'UNARY'
                if (symb.ttype == 2) t = 'BINARY'
                if (symb.ttype == 3) t = 'INFIX'
                if (symb.ttype == 4) t = 'LEFTBRACKET'

                console.log(`ttype: ${t}`, symb)

            }
            let str = ''
            for (let i = index; i < lex.length; i++) {
                str += lex[i][0]
            }
            console.log(lex)
            // index += 10
            // return[output,index]
            throw new Error(`endless loop:, string = '${str}', output = '${output}', 'index: '${index}'`)
        }



        if (lex[index][1] === -1 || lex[index][1] === -2 || AMsymbols[lex[index][1]].ttype == CONST) {  // literal or quoted string, or constants
            // let charArray = lex[index][0].split('')
            // charArray.forEach(char => output += `<mi>` + char + `</mi>`);
            // [output, index + 1]
            let left = this.constantEater(lex, index, calledFrom, extraStyle)
            output += left[0]
            index = left[1]
            return [output, index] //continue;



        } else {

            let symb = AMsymbols[lex[index][1]]   // the lex we are looking at
            let nextSymb = (index + 1 < lex.length && lex[index + 1][1] >= 0) ? AMsymbols[lex[index + 1][1]] : null

            // define lookAhead symbol type so don't have to keep checking if there is an entry in AMsymbol.
            let lookAheadSymbTtype = (nextSymb) ? AMsymbols[lex[index + 1][1]].ttype : -1

            // console.log('symb in recursive', symb, lookAheadSymbTtype)

            switch (symb.ttype) {
                case -1:
                case -2:
                    output += symb.input
                    index += 1
                    return [output, index]

                case CONST:

                    // if (calledFrom == 'func' || calledFrom == '') {
                    //     let left = this.constantEater(lex, index, calledFrom, extraStyle)
                    //     output += left[0]
                    //     index = left[1]
                    //     console.log('const loop1', symb)

                    // } else if (lookAheadSymbTtype == INFIX) {  // consts like INT (integral) have infix
                    //     output = `<msubsup>`
                    //     index += 1
                    //     output += `<${symb.tag} ${extraStyle}>${symb.output}</${symb.tag}>`  // eg: tan
                    //     index += 1
                    //     symb = AMsymbols[lex[index][1]]   // the lex we are looking at
                    //     output += `<${symb.tag} ${extraStyle}>${symb.output}</${symb.tag}>`  // eg: tan
                    //     index += 1
                    //     symb = AMsymbols[lex[index][1]]   // the lex we are looking at
                    //     output += `<${symb.tag} ${extraStyle}>${symb.output}</${symb.tag}>`  // eg: tan

                    //     output = `</msubsup>`
                    //     return [output, index]

                    // } else {      // acc only eats a single symbol
                    output = `<${symb.tag} ${extraStyle}>` + symb.output + `</${symb.tag}>`
                    index += 1
                    console.log('const loop2', symb)
                    // return [output, index]
                    // }
                    return [output, index];

                case UNARY:

                    if (symb.input == 'bold') {
                        index += 1  // eat the bold

                        // three cases - open(, and other
                        if (nextSymb && nextSymb.input == '(') {   // bold as a function, eat the brackets
                            let left = this.recursiveParser(lex, index + 1, '', `style='font-weight:bold;'`)
                            output += left[0]
                            index = left[1]

                            // sanity check
                            symb = (index < lex.length && lex[index][1] >= 0) ? AMsymbols[lex[index][1]] : null
                            console.assert(symb && symb.input == ')', `expected ')', got '${symb && symb.input}' at index ${index}`)

                            index += 1  // this is the right round bracket

                            // } else if (nextSymb && nextSymb.ttype == LEFTBRACKET) {
                            //     let left = this.recursiveParser(lex, index, '', `style='font-weight:bold;'`)
                            //     output += left[0]
                            //     index = left[1]

                            //     index += 1  // this is the right bracket

                        } else {
                            let left = this.recursiveParser(lex, index, 'acc', `style='font-weight:bold;'`)
                            output += left[0]
                            index = left[1]
                        }
                        return [output, index]


                    } else if (symb.func) {               // eg tan
                        // console.log('func',index)
                        output += `<${symb.tag} ${extraStyle}>${symb.output}</${symb.tag}>`  // eg: tan
                        let func = this.recursiveParser(lex, index + 1, 'func', extraStyle)    // argument for tan
                        output += func[0]
                        index = func[1]
                        // return [output, index]   // end of expression
                        return [output, index]

                    } else if (symb.acc) {        // eg; vec
                        output += `<${symb.tag} ${extraStyle}>`  // mover

                        output += `<mrow>`
                        let acc = this.recursiveParser(lex, index + 1, 'acc', extraStyle)
                        output += acc[0]
                        index = acc[1]
                        output += `</mrow>`

                        output += `<mo ${extraStyle}>` + symb.output + `</mo>`
                        output += `</${symb.tag} ${extraStyle}>`  // <mover>

                        // this is the end of the accent
                        // continue
                        return [output, index]


                    } else if (symb.rewriteleftright) {
                        // console.log('rewrite')
                        output += `<mrow>`
                        output += `<mo ${extraStyle}>` + symb.rewriteleftright[0] + `</mo>`
                        let left = this.recursiveParser(lex, index + 1, 'acc', extraStyle)
                        output += left[0]
                        index = left[1]
                        output += `<mo ${extraStyle}>` + symb.rewriteleftright[1] + `</mo>`
                        output += `</mrow>`
                        return [output, index]


                    } else if (symb.codes) {
                        output += ''

                    } else {// eg: sqrt, bold
                        output += `<${symb.tag} ${extraStyle}>`
                        output += `<mrow>`
                        let acc = this.recursiveParser(lex, index + 1, 'acc', extraStyle)
                        output += acc[0]
                        index = acc[1]
                        output += `</mrow>`
                        output += `</${symb.tag}>`      // close of sqrt?
                        // throw new Error('unary')
                    }
                    break;

                case LEFTBRACKET:
                    console.warn('leftbracket', index, `'${calledFrom}'`, lex[index], (index < lex.length - 1) ? lex[index + 1] : '')

                    if (calledFrom == 'func') {

                        let output = `<${symb.tag} ${extraStyle}>${symb.output}</${symb.tag}>`
                        let inside = this.recursiveParser(lex, index + 1, 'leftbracket', extraStyle)
                        output += inside[0]
                        index = inside[1]

                        if (index < lex.length) {
                            let rightb = AMsymbols[lex[index][1]]   // the closing bracket
                            if (rightb && rightb.ttype == RIGHTBRACKET) {   // safety check, it SHOULD be a rightbracket
                                output += `<${rightb.tag} ${extraStyle}>${rightb.output}</${rightb.tag}>`
                                index += 1
                            }
                        }
                        return [output, index]   // end of expression

                    } else if (calledFrom == 'acc') {
                        // brackets do not go into output for accents, only the insides
                        let left = this.recursiveParser(lex, index + 1, '', extraStyle)
                        output += left[0]

                        index = left[1] + 1 // eat the closing bracket
                        return [output, index]


                    } else if (calledFrom == 'leftbracket') {
                        // don't output these brackets
                        // output += `<${symb.tag} ${extraStyle}>${symb.output}bob3</${symb.tag}>`
                        index += 1

                        symb = (index < lex.length && lex[index][1] >= 0) ? AMsymbols[lex[index][1]] : null
                        let left = this.recursiveParser(lex, index, 'leftbracket', extraStyle)
                        output += left[0]
                        index = left[1]

                        // look ahead, eat the right bracket
                        symb = (index < lex.length && lex[index][1] >= 0) ? AMsymbols[lex[index][1]] : null
                        console.assert(symb && symb.ttype == RIGHTBRACKET, ` expected a RIGHTBRACKET, got '${symb && symb.input}' `)

                        index += 1

                        // // if the brackets that opened this loop close, dispay them
                        // symb = (index < lex.length && lex[index][1] >= 0) ? AMsymbols[lex[index][1]] : null
                        // console.log('bill3', symb, index, lex[index], lex)
                        // if (symb && symb.ttype == RIGHTBRACKET) {
                        //     output += "</mtd></mtr></mtable>"
                        //     // don't output these brackets
                        //     // output += `<${symb.tag} ${extraStyle}>${symb.output}bill3</${symb.tag}>`
                        //     index += 1
                        //     break;
                        // }

                    } else {

                        // user wants brackets
                        output += `<${symb.tag} ${extraStyle}>${symb.output}</${symb.tag}>`
                        index += 1

                        // look ahead
                        symb = (index < lex.length && lex[index][1] >= 0) ? AMsymbols[lex[index][1]] : null
                        if (symb && AMsymbols[lex[index][1]].ttype == LEFTBRACKET) {
                            output += `<mtable><mtr><mtd>`

                            let left = this.recursiveParser(lex, index, 'leftbracket', extraStyle)
                            output += left[0]
                            index = left[1]

                            output += `</mtd></mtr></mtable>`
                        } else {
                            let left = this.recursiveParser(lex, index, '', extraStyle)
                            output += left[0]
                            index = left[1]
                        }

                        // look ahead, eat the right bracket
                        symb = (index < lex.length && lex[index][1] >= 0) ? AMsymbols[lex[index][1]] : null
                        console.log('TTT', symb)
                        if (symb && symb.ttype == RIGHTBRACKET) {
                            output += `<${symb.tag} ${extraStyle}>${symb.output}</${symb.tag}>`
                            index += 1
                        } else {
                            console.assert(true, ` expected a RIGHTBRACKET, got '${symb && symb.input}' `)
                        }
                        return [output, index]
                    }

                    break

                case RIGHTBRACKET:
                    console.warn('rightbracket', index, `'${calledFrom}'`, lex[index], (index < lex.length - 1) ? lex[index + 1] : '')

                    if (calledFrom == 'func') {  // show a bracket  for functions
                        output += `<${symb.tag} ${extraStyle}>${symb.output}tom4</${symb.tag}>`
                        return [output, index + 1]

                        // } else if (calledFrom == 'leftbracket') { //  middle ][ boundary of a matrix
                        //     output += `<${symb.tag} ${extraStyle}>${symb.output}tom6</${symb.tag}>`
                        //     const newLocal = index += 1
                        //     continue;
                        //     // return [output, index]

                    // } else if (calledFrom == 'acc') {  // show a bracket  for functions
                    //     throw new Error('should be handled by leftbracket')

                        // } else if (lookAheadSymbTtype == LEFTBRACKET) { //  middle ][ boundary of a matrix
                        //     // index += 1

                        //     output += `<${symb.tag} ${extraStyle}>${symb.output}tom1</${symb.tag}>`
                        //     output += `</mtd><mtd>`
                        //     let left = this.recursiveParser(lex, index + 1, 'leftbracket', extraStyle)
                        //     output += left[0]
                        //     index = left[1]
                        //     return [output, index + 1]

                    } else if (lookAheadSymbTtype == RIGHTBRACKET) { //  ]] end of a matrix
                        // // output += `<${symb.tag} ${extraStyle}>${symb.output}tom7</${symb.tag}>`
                        // output += `</mtd></mtr></mtable>`
                        index += 1

                        return [output, index]

                    } else if (calledFrom == 'leftbracket') {
                        // output += '</mtd>'
                        // output += `<${symb.tag} ${extraStyle}>${symb.output}tom5</${symb.tag}>`
                        // output += '<mtd>'
                        // index += 1

                        // let left = this.recursiveParser(lex, index + 1, 'leftbracket', extraStyle)
                        // output += left[0]
                        // index = left[1]

                        // is there a closing bracket?
                        // if (index < lex.length - 1 && AMsymbols[lex[index][1]].ttype == RIGHTBRACKET) {
                        // let nextSymb = AMsymbols[lex[index][1]]
                        // output += `<${nextSymb.tag} ${extraStyle}>` + nextSymb.output + `tom</${nextSymb.tag}>`
                        // index += 1
                        // }
                        // output += "</mtd></mtr></mtable>"
                        return [output, index]

                    } else {

                        output += `<${symb.tag} ${extraStyle}>${symb.output}RIGHT1</${symb.tag}>`

                        // if (index < lex.length - 1) {
                        //     let left = this.recursiveParser(lex, index + 1, calledFrom, extraStyle)
                        //     output += left[0]
                        //     index = left[1]
                        // }
                        // output += `</mtd></mtr></mtable>`
                        // continue
                        return [output, index + 1]

                    }
                    break;

                case INFIX:

                    // output += `<${symb.tag} ${extraStyle}>`      // nextSymbol sub, sup goes first
                    // // let acc = this.constantEater(lex, index + 1, calledFrom, extraStyle)  // current symbol
                    // let left = this.recursiveParser(lex, index + 1, calledFrom, extraStyle)
                    // output += left[0]
                    // index = left[1]
                    // output += `</${symb.tag}>`  // close the sub sup
                    return [output, index]



                //     output += `<${symb.tag}>`      // sub, sup
                //     let acc = this.constantEater(lex, index+1, calledFrom, extraStyle)
                //     output += acc[0]
                //     index =acc[1]
                //     output += `</${symb.tag}>$`
                //     break;

                case DEFINITION:
                    console.error('missing definition', symb)
                    index += 1
                    break;

                case BINARY:

                    index += 1  // usually mover or munder

                    let part1 = this.recursiveParser(lex, index, 'acc', extraStyle)
                    let part2 = this.recursiveParser(lex, part1[1], 'acc', extraStyle)

                    output += `<${symb.input} ${extraStyle}><mover><mrow>${part2[0]}</mrow><mrow>${[part1[0]]}</mrow></${symb.input}>`
                    index = part2[1]
                    break;


                default:
                    console.log(symb)
                    throw new Error(`Unexpected token ${JSON.stringify(lex[index])}`)
                    index + 1
            }

            // }
            // while loop back to top
        }
        // }
        return [output, index]






    }


}