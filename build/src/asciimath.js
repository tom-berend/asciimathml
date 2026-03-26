// TODO
// internal stylesheet for <b> <i> <ss> colors, fonts
// clean up parser that finds symbols in text (eg: 'in' in undefined)
// maybe add fonts created from unicode glyphs
// investigate TEMML   https://temml.org/
// integrate weird fonts https://github.com/beizhedenglong/weird-fonts
var AMmathml = "http://www.w3.org/1998/Math/MathML";
var CONST = 0, UNARY = 1, BINARY = 2, INFIX = 3, LEFTBRACKET = 4, RIGHTBRACKET = 5, SPACE = 6, UNDEROVER = 7, DEFINITION = 8, LEFTRIGHT = 9, TEXT = 10, BIG = 11, LONG = 12, STRETCHY = 13, MATRIX = 14, UNARYUNDEROVER = 15; // token types
export class AsciiMath {
    mathcolor = "blue"; // change it to "" (to inherit) or another color
    mathfontsize = "1em"; // change to e.g. 1.2em for larger math
    mathfontfamily = "serif"; // change to "" to inherit (works in IE)
    // or another family (e.g. "arial")
    automathrecognize = false; // writing "amath" on page makes this true
    checkForMathML = true; // check if browser can display MathML
    notifyIfNoMathML = true; // display note at top if no MathML capability
    alertIfNoMathML = false; // show alert box if no MathML capability
    translateOnLoad = true; // set to false to do call translators from js
    translateASCIIMath = true; // false to preserve `..`
    displaystyle = true; // puts limits above and below large operators
    showasciiformulaonhover = true; // helps students learn ASCIIMath
    decimalsign = "."; // if "," then when writing lists or matrices put
    //a space after the "," like `(1, 2)` not `(1,2)`
    AMdelimiter1 = "`";
    AMescape1 = "\\\\`"; // can use other characters
    AMdocumentId = "wikitext"; // PmWiki element containing math (default=body)
    fixphi = true; //false to return to legacy phi/varphi mapping
    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    noMathML = false;
    translated = false;
    AMnestingDepth = 0;
    AMpreviousSymbol = 0;
    AMcurrentSymbol = 0;
    AMnames = []; //list of input symbols
    AMquote = { input: "\"", tag: "mtext", output: "mbox", tex: null, ttype: TEXT };
    AMsymbols = [
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
        { input: "phi", tag: "mi", output: this.fixphi ? "\u03D5" : "\u03C6", tex: null, ttype: CONST },
        { input: "varphi", tag: "mi", output: this.fixphi ? "\u03C6" : "\u03D5", tex: null, ttype: CONST },
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
        { input: "hat", tag: "mover", output: "\u005E", tex: null, ttype: UNARY, acc: true },
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
        this.AMquote,
        { input: "bb", tag: "mstyle", atname: "mathvariant", atval: "bold", output: "bb", tex: null, ttype: UNARY, codes: 'bold' },
        { input: "mathbf", tag: "mstyle", atname: "mathvariant", atval: "bold", output: "mathbf", tex: null, ttype: UNARY, codes: 'bold' },
        { input: "sf", tag: "mstyle", atname: "mathvariant", atval: "sans-serif", output: "sf", tex: null, ttype: UNARY, codes: 'sans-serif' },
        { input: "mathsf", tag: "mstyle", atname: "mathvariant", atval: "sans-serif", output: "mathsf", tex: null, ttype: UNARY, codes: 'sans-serif' },
        { input: "bbb", tag: "mstyle", atname: "mathvariant", atval: "double-struck", output: "bbb", tex: null, ttype: UNARY, codes: 'double-struck' },
        { input: "mathbb", tag: "mstyle", atname: "mathvariant", atval: "double-struck", output: "mathbb", tex: null, ttype: UNARY, codes: 'double-struck' },
        { input: "cc", tag: "mstyle", atname: "mathvariant", atval: "script", output: "cc", tex: null, ttype: UNARY, codes: 'script' },
        { input: "mathcal", tag: "mstyle", atname: "mathvariant", atval: "script", output: "mathcal", tex: null, ttype: UNARY, codes: 'script' },
        { input: "tt", tag: "mstyle", atname: "mathvariant", atval: "monospace", output: "tt", tex: null, ttype: UNARY, codes: 'monospace' },
        { input: "mathtt", tag: "mstyle", atname: "mathvariant", atval: "monospace", output: "mathtt", tex: null, ttype: UNARY, codes: 'monospace' },
        { input: "fr", tag: "mstyle", atname: "mathvariant", atval: "fraktur", output: "fr", tex: null, ttype: UNARY, codes: 'fraktur' },
        { input: "mathfrak", tag: "mstyle", atname: "mathvariant", atval: "fraktur", output: "mathfrak", tex: null, ttype: UNARY, codes: 'fraktur' }
    ];
    constructor() {
        var msg, warnings = new Array();
        if (document.getElementById == null) {
            alert("This webpage requires a recent browser such as Mozilla Firefox");
            return null;
        }
        if (this.checkForMathML && (msg = this.checkMathML()))
            warnings.push(msg);
        if (warnings.length > 0)
            this.displayWarnings(warnings);
        if (!this.noMathML)
            this.initSymbols();
    }
    checkMathML() {
        return true;
        // if (navigator.appName.slice(0, 8) == "Netscape")
        //     if (navigator.appVersion.slice(0, 1) >= "5") noMathML = null;
        //     else noMathML = true;
        // else if (navigator.appName.slice(0, 9) == "Microsoft")
        //     try {
        //         var ActiveX = new ActiveXObject("MathPlayer.Factory.1");
        //         noMathML = null;
        //     } catch (e) {
        //         noMathML = true;
        //     }
        // else if (navigator.appName.slice(0, 5) == "Opera")
        //     if (navigator.appVersion.slice(0, 3) >= "9.5") noMathML = null;
        //     else noMathML = true;
        // //noMathML = true; //uncomment to check
        // if (noMathML && notifyIfNoMathML) {
        //     var msg = "To view the ASCIIMathML notation use Internet Explorer + MathPlayer or Mozilla Firefox 2.0 or later.";
        //     if (alertIfNoMathML)
        //         alert(msg);
        //     else return msg;
        // }
    }
    hideWarning() {
        var body = document.getElementsByTagName("body")[0];
        body.removeChild(document.getElementById('AMMLwarningBox'));
        body.onclick = null;
    }
    displayWarnings(warnings) {
        var i, frag, nd = this.createElementXHTML("div");
        var body = document.getElementsByTagName("body")[0];
        body.onclick = this.hideWarning;
        nd.id = 'AMMLwarningBox';
        for (i = 0; i < warnings.length; i++) {
            frag = this.createElementXHTML("div");
            frag.appendChild(document.createTextNode(warnings[i]));
            frag.style.paddingBottom = "1.0em";
            nd.appendChild(frag);
        }
        nd.appendChild(this.createElementXHTML("p"));
        nd.appendChild(document.createTextNode("For instructions see the "));
        var an = this.createElementXHTML("a");
        an.appendChild(document.createTextNode("ASCIIMathML"));
        an.setAttribute("href", "http://asciimath.org");
        nd.appendChild(an);
        nd.appendChild(document.createTextNode(" homepage"));
        an = this.createElementXHTML("div");
        an.id = 'AMMLcloseDiv';
        an.appendChild(document.createTextNode('(click anywhere to close this warning)'));
        nd.appendChild(an);
        var body = document.getElementsByTagName("body")[0];
        body.insertBefore(nd, body.childNodes[0]);
    }
    /** Find and translate all math on a page.  if spanclassAM is provided then it
    * is the tag to look for.  Perhaps 'span' is a good value.  If it is NOT
    * provided, then we will look for this.AMdelimiter1 (by default a backtick)
    */
    translate(spanclassAM) {
        if (!this.translated) { // run this only once
            this.translated = true;
            var body = document.getElementsByTagName("body")[0];
            var processN = document.getElementById(this.AMdocumentId);
            if (this.translateASCIIMath)
                this.AMprocessNode((processN != null ? processN : body), false, spanclassAM);
        }
    }
    createElementXHTML(t) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", t);
    }
    AMcreateElementMathML(t) {
        return document.createElementNS(AMmathml, t);
    }
    createMmlNode(t, frag) {
        let node = document.createElementNS(AMmathml, t);
        if (frag)
            node.appendChild(frag);
        return node;
    }
    newcommand(oldstr, newstr) {
        this.AMsymbols.push({ input: oldstr, tag: "mo", output: newstr, tex: null, ttype: DEFINITION });
        this.refreshSymbols();
    }
    newsymbol(symbolobj) {
        this.AMsymbols.push(symbolobj);
        this.refreshSymbols();
    }
    compareNames(s1, s2) {
        if (s1.input > s2.input)
            return 1;
        else
            return -1;
    }
    initSymbols() {
        var i;
        var symlen = this.AMsymbols.length;
        for (i = 0; i < symlen; i++) {
            if (this.AMsymbols[i].tex) {
                this.AMsymbols.push({
                    input: this.AMsymbols[i].tex,
                    tex: null,
                    tag: this.AMsymbols[i].tag, output: this.AMsymbols[i].output, ttype: this.AMsymbols[i].ttype,
                    acc: (this.AMsymbols[i].acc || false)
                });
            }
        }
        this.refreshSymbols();
    }
    refreshSymbols() {
        var i;
        this.AMsymbols.sort(this.compareNames);
        for (i = 0; i < this.AMsymbols.length; i++)
            this.AMnames[i] = this.AMsymbols[i].input;
    }
    define(oldstr, newstr) {
        this.AMsymbols.push({ input: oldstr, tag: "mo", output: newstr, tex: null, ttype: DEFINITION });
        this.refreshSymbols(); // this may be a problem if many symbols are defined!
    }
    AMremoveCharsAndBlanks(str, n) {
        //remove n characters and any following blanks
        var st;
        if (str.charAt(n) == "\\" && str.charAt(n + 1) != "\\" && str.charAt(n + 1) != " ")
            st = str.slice(n + 1);
        else
            st = str.slice(n);
        for (var i = 0; i < st.length && st.charCodeAt(i) <= 32; i = i + 1)
            ;
        return st.slice(i);
    }
    position(arr, str, n) {
        // return position >=n where str appears or would be inserted
        // assumes arr is sorted
        if (n == 0) {
            var h, m;
            n = -1;
            h = arr.length;
            while (n + 1 < h) {
                m = (n + h) >> 1;
                if (arr[m] < str)
                    n = m;
                else
                    h = m;
            }
            return h;
        }
        else
            for (var i = n; i < arr.length && arr[i] < str; i++)
                ;
        return i; // i=arr.length || arr[i]>=str
    }
    AMgetSymbol(str) {
        //return maximal initial substring of str that appears in names
        //return null if there is none
        var k = 0; //new pos
        var j = 0; //old pos
        var mk; //match pos
        var st;
        var tagst;
        var match = "";
        var more = true;
        for (var i = 1; i <= str.length && more; i++) {
            st = str.slice(0, i); //initial substring of length i
            j = k;
            k = this.position(this.AMnames, st, j);
            if (k < this.AMnames.length && str.slice(0, this.AMnames[k].length) == this.AMnames[k]) {
                match = this.AMnames[k];
                mk = k;
                i = match.length;
            }
            more = k < this.AMnames.length && str.slice(0, this.AMnames[k].length) >= this.AMnames[k];
        }
        this.AMpreviousSymbol = this.AMcurrentSymbol;
        if (match != "") {
            this.AMcurrentSymbol = this.AMsymbols[mk].ttype;
            return this.AMsymbols[mk];
        }
        // if str[0] is a digit or - return maxsubstring of digits.digits
        this.AMcurrentSymbol = CONST;
        k = 1;
        st = str.slice(0, 1);
        var integ = true;
        while ("0" <= st && st <= "9" && k <= str.length) {
            st = str.slice(k, k + 1);
            k++;
        }
        if (st == this.decimalsign) {
            st = str.slice(k, k + 1);
            if ("0" <= st && st <= "9") {
                integ = false;
                k++;
                while ("0" <= st && st <= "9" && k <= str.length) {
                    st = str.slice(k, k + 1);
                    k++;
                }
            }
        }
        if ((integ && k > 1) || k > 2) {
            st = str.slice(0, k - 1);
            tagst = "mn";
        }
        else {
            k = 2;
            st = str.slice(0, 1); //take 1 character
            tagst = (("A" > st || st > "Z") && ("a" > st || st > "z") ? "mo" : "mi");
        }
        if (st == "-" && str.charAt(1) !== ' ' && this.AMpreviousSymbol == INFIX) {
            this.AMcurrentSymbol = INFIX; //trick "/" into recognizing "-" on second parse
            return { input: st, tag: tagst, output: st, ttype: UNARY, func: true };
        }
        return { input: st, tag: tagst, output: st, ttype: CONST };
    }
    AMremoveBrackets(node) {
        var st;
        if (!node.hasChildNodes()) {
            return;
        }
        if (node.firstChild.hasChildNodes() && (node.nodeName == "mrow" || node.nodeName == "M:MROW")) {
            if (node.firstChild.nextSibling && node.firstChild.nextSibling.nodeName == "mtable") {
                return;
            }
            st = node.firstChild.firstChild.nodeValue;
            if (st == "(" || st == "[" || st == "{")
                node.removeChild(node.firstChild);
        }
        if (node.lastChild.hasChildNodes() && (node.nodeName == "mrow" || node.nodeName == "M:MROW")) {
            st = node.lastChild.firstChild.nodeValue;
            if (st == ")" || st == "]" || st == "}")
                node.removeChild(node.lastChild);
        }
    }
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
    AMparseSexpr(str) {
        var symbol, node, result, i, st, // rightvert = false,
        newFrag = document.createDocumentFragment();
        str = this.AMremoveCharsAndBlanks(str, 0);
        symbol = this.AMgetSymbol(str); //either a token or a bracket or empty
        if (symbol == null || symbol.ttype == RIGHTBRACKET && this.AMnestingDepth > 0) {
            return [null, str];
        }
        if (symbol.ttype == DEFINITION) {
            str = symbol.output + this.AMremoveCharsAndBlanks(str, symbol.input.length);
            symbol = this.AMgetSymbol(str);
        }
        switch (symbol.ttype) {
            case UNDEROVER:
            case CONST:
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                return [this.createMmlNode(symbol.tag, //its a constant
                    document.createTextNode(symbol.output)), str];
            case LEFTBRACKET: //read (expr+)
                this.AMnestingDepth++;
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                result = this.AMparseExpr(str, true);
                this.AMnestingDepth--;
                if (typeof symbol.invisible == "boolean" && symbol.invisible)
                    node = this.createMmlNode("mrow", result[0]);
                else {
                    node = this.createMmlNode("mo", document.createTextNode(symbol.output));
                    node = this.createMmlNode("mrow", node);
                    node.appendChild(result[0]);
                }
                return [node, result[1]];
            case TEXT:
                if (symbol != this.AMquote)
                    str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                if (str.charAt(0) == "{")
                    i = str.indexOf("}");
                else if (str.charAt(0) == "(")
                    i = str.indexOf(")");
                else if (str.charAt(0) == "[")
                    i = str.indexOf("]");
                else if (symbol == this.AMquote)
                    i = str.slice(1).indexOf("\"") + 1;
                else
                    i = 0;
                if (i == -1)
                    i = str.length;
                st = str.slice(1, i);
                if (st.charAt(0) == " ") {
                    node = this.createMmlNode("mspace");
                    node.setAttribute("width", "1ex");
                    newFrag.appendChild(node);
                }
                newFrag.appendChild(this.createMmlNode(symbol.tag, document.createTextNode(st)));
                if (st.charAt(st.length - 1) == " ") {
                    node = this.createMmlNode("mspace");
                    node.setAttribute("width", "1ex");
                    newFrag.appendChild(node);
                }
                str = this.AMremoveCharsAndBlanks(str, i + 1);
                return [this.createMmlNode("mrow", newFrag), str];
            case UNARYUNDEROVER:
            case UNARY:
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                result = this.AMparseSexpr(str);
                if (result[0] == null) {
                    if (symbol.tag == "mi" || symbol.tag == "mo") {
                        return [this.createMmlNode(symbol.tag, document.createTextNode(symbol.output)), str];
                    }
                    else {
                        result[0] = this.createMmlNode("mi", "");
                    }
                }
                if (typeof symbol.func == "boolean" && symbol.func) { // functions hack
                    st = str.charAt(0);
                    if (st == "^" || st == "_" || st == "/" || st == "|" || st == "," ||
                        (symbol.input.length == 1 && symbol.input.match(/\w/) && st != "(")) {
                        return [this.createMmlNode(symbol.tag, document.createTextNode(symbol.output)), str];
                    }
                    else {
                        node = this.createMmlNode("mrow", this.createMmlNode(symbol.tag, document.createTextNode(symbol.output)));
                        node.appendChild(result[0]);
                        return [node, result[1]];
                    }
                }
                this.AMremoveBrackets(result[0]);
                if (symbol.input == "sqrt") { // sqrt
                    return [this.createMmlNode(symbol.tag, result[0]), result[1]];
                }
                else if (typeof symbol.rewriteleftright != "undefined") { // abs, floor, ceil
                    node = this.createMmlNode("mrow", this.createMmlNode("mo", document.createTextNode(symbol.rewriteleftright[0])));
                    node.appendChild(result[0]);
                    node.appendChild(this.createMmlNode("mo", document.createTextNode(symbol.rewriteleftright[1])));
                    return [node, result[1]];
                }
                else if (symbol.input == "cancel") { // cancel
                    node = this.createMmlNode(symbol.tag, result[0]);
                    node.setAttribute("notation", "updiagonalstrike");
                    return [node, result[1]];
                }
                else if (typeof symbol.acc == "boolean" && symbol.acc) { // accent
                    node = this.createMmlNode(symbol.tag, result[0]);
                    var accnode = this.createMmlNode("mo", document.createTextNode(symbol.output));
                    if (symbol.input == "vec" && ((result[0].nodeName == "mrow" && result[0].childNodes.length == 1
                        && result[0].firstChild.firstChild.nodeValue !== null
                        && result[0].firstChild.firstChild.nodeValue.length == 1) ||
                        (result[0].firstChild && result[0].firstChild.nodeValue !== null
                            && result[0].firstChild.nodeValue.length == 1))) {
                        accnode.setAttribute("stretchy", '');
                    }
                    node.appendChild(accnode);
                    return [node, result[1]];
                }
                else { // font change command
                    if (typeof symbol.codes != "undefined") {
                        for (i = 0; i < result[0].childNodes.length; i++)
                            ['mrow', 'mi', 'mo', 'mtext'].map((tag) => {
                                // if(result[0].nodeName === tag)
                                //     result[0].textContent = this.substituteGlyphs(result[0].textContent, symbol.codes);
                                if (result[0].childNodes[i].nodeName === tag)
                                    result[0].childNodes[i].textContent = this.substituteGlyphs(result[0].childNodes[i].textContent, symbol.codes);
                            });
                    }
                    node = this.createMmlNode(symbol.tag, result[0]);
                    // node.setAttribute(symbol.atname, symbol.atval);
                    return [node, result[1]];
                }
            case BINARY:
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                result = this.AMparseSexpr(str);
                if (result[0] == null)
                    return [this.createMmlNode("mo", document.createTextNode(symbol.input)), str];
                this.AMremoveBrackets(result[0]);
                var result2 = this.AMparseSexpr(result[1]);
                if (result2[0] == null)
                    return [this.createMmlNode("mo", document.createTextNode(symbol.input)), str];
                this.AMremoveBrackets(result2[0]);
                if (['color', 'class', 'id'].indexOf(symbol.input) >= 0) {
                    // Get the second argument
                    if (str.charAt(0) == "{")
                        i = str.indexOf("}");
                    else if (str.charAt(0) == "(")
                        i = str.indexOf(")");
                    else if (str.charAt(0) == "[")
                        i = str.indexOf("]");
                    st = str.slice(1, i);
                    // Make a mathml node
                    node = this.createMmlNode(symbol.tag, result2[0]);
                    // Set the correct attribute
                    if (symbol.input === "color")
                        node.setAttribute("mathcolor", st);
                    else if (symbol.input === "class")
                        node.setAttribute("class", st);
                    else if (symbol.input === "id")
                        node.setAttribute("id", st);
                    return [node, result2[1]];
                }
                if (symbol.input == "root" || symbol.output == "stackrel")
                    newFrag.appendChild(result2[0]);
                newFrag.appendChild(result[0]);
                if (symbol.input == "frac")
                    newFrag.appendChild(result2[0]);
                return [this.createMmlNode(symbol.tag, newFrag), result2[1]];
            case INFIX:
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                return [this.createMmlNode("mo", document.createTextNode(symbol.output)), str];
            case SPACE:
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                node = this.createMmlNode("mspace");
                node.setAttribute("width", "1ex");
                newFrag.appendChild(node);
                newFrag.appendChild(this.createMmlNode(symbol.tag, document.createTextNode(symbol.output)));
                node = this.createMmlNode("mspace");
                node.setAttribute("width", "1ex");
                newFrag.appendChild(node);
                return [this.createMmlNode("mrow", newFrag), str];
            case LEFTRIGHT:
                //    if (rightvert) return [null,str]; else rightvert = true;
                this.AMnestingDepth++;
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                result = this.AMparseExpr(str, false);
                this.AMnestingDepth--;
                st = "";
                if (result[0].lastChild != null)
                    st = result[0].lastChild.firstChild.nodeValue;
                if (st == "|" && str.charAt(0) !== ",") { // its an absolute value subterm
                    node = this.createMmlNode("mo", document.createTextNode(symbol.output));
                    node = this.createMmlNode("mrow", node);
                    node.appendChild(result[0]);
                    return [node, result[1]];
                }
                else { // the "|" is a \mid so use unicode 2223 (divides) for spacing
                    node = this.createMmlNode("mo", document.createTextNode("\u2223"));
                    node = this.createMmlNode("mrow", node);
                    return [node, str];
                }
            default:
                //alert("default");
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                return [this.createMmlNode(symbol.tag, //its a constant
                    document.createTextNode(symbol.output)), str];
        }
    }
    AMparseIexpr(str) {
        var symbol, sym1, sym2, node, result, underover;
        str = this.AMremoveCharsAndBlanks(str, 0);
        sym1 = this.AMgetSymbol(str);
        result = this.AMparseSexpr(str);
        node = result[0];
        str = result[1];
        symbol = this.AMgetSymbol(str);
        if (symbol.ttype == INFIX && symbol.input != "/") {
            str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
            //    if (symbol.input == "/") result = AMparseIexpr(str); else ...
            result = this.AMparseSexpr(str);
            if (result[0] == null) // show box in place of missing argument
                result[0] = this.createMmlNode("mo", document.createTextNode("\u25A1"));
            else
                this.AMremoveBrackets(result[0]);
            str = result[1];
            //    if (symbol.input == "/") AMremoveBrackets(node);
            underover = (sym1.ttype == UNDEROVER || sym1.ttype == UNARYUNDEROVER);
            if (symbol.input == "_") {
                sym2 = this.AMgetSymbol(str);
                if (sym2.input == "^") {
                    str = this.AMremoveCharsAndBlanks(str, sym2.input.length);
                    var res2 = this.AMparseSexpr(str);
                    this.AMremoveBrackets(res2[0]);
                    str = res2[1];
                    node = this.createMmlNode((underover ? "munderover" : "msubsup"), node);
                    node.appendChild(result[0]);
                    node.appendChild(res2[0]);
                    node = this.createMmlNode("mrow", node); // so sum does not stretch
                }
                else {
                    node = this.createMmlNode((underover ? "munder" : "msub"), node);
                    node.appendChild(result[0]);
                }
            }
            else if (symbol.input == "^" && underover) {
                node = this.createMmlNode("mover", node);
                node.appendChild(result[0]);
            }
            else {
                node = this.createMmlNode(symbol.tag, node);
                node.appendChild(result[0]);
            }
            if (typeof sym1.func != 'undefined' && sym1.func) {
                sym2 = this.AMgetSymbol(str);
                if (sym2.ttype != INFIX && sym2.ttype != RIGHTBRACKET &&
                    (sym1.input.length > 1 || sym2.ttype == LEFTBRACKET)) {
                    result = this.AMparseIexpr(str);
                    node = this.createMmlNode("mrow", node);
                    node.appendChild(result[0]);
                    str = result[1];
                }
            }
        }
        return [node, str];
    }
    AMparseExpr(str, rightbracket) {
        var symbol, node, result, i, newFrag = document.createDocumentFragment();
        do {
            str = this.AMremoveCharsAndBlanks(str, 0);
            result = this.AMparseIexpr(str);
            node = result[0];
            str = result[1];
            symbol = this.AMgetSymbol(str);
            if (symbol.ttype == INFIX && symbol.input == "/") {
                str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
                result = this.AMparseIexpr(str);
                if (result[0] == null) // show box in place of missing argument
                    result[0] = this.createMmlNode("mo", document.createTextNode("\u25A1"));
                else
                    this.AMremoveBrackets(result[0]);
                str = result[1];
                this.AMremoveBrackets(node);
                node = this.createMmlNode(symbol.tag, node);
                node.appendChild(result[0]);
                newFrag.appendChild(node);
                symbol = this.AMgetSymbol(str);
            }
            else if (node != undefined)
                newFrag.appendChild(node);
        } while ((symbol.ttype != RIGHTBRACKET &&
            (symbol.ttype != LEFTRIGHT || rightbracket)
            || this.AMnestingDepth == 0) && symbol != null && symbol.output != "");
        if (symbol.ttype == RIGHTBRACKET || symbol.ttype == LEFTRIGHT) {
            //    if (this.AMnestingDepth > 0) this.AMnestingDepth--;
            var len = newFrag.childNodes.length;
            if (len > 0 && newFrag.childNodes[len - 1].nodeName == "mrow"
                && newFrag.childNodes[len - 1].lastChild
                && newFrag.childNodes[len - 1].lastChild.firstChild) { //matrix
                //removed to allow row vectors: //&& len>1 &&
                //newFrag.childNodes[len-2].nodeName == "mo" &&
                //newFrag.childNodes[len-2].firstChild.nodeValue == ","
                var right = newFrag.childNodes[len - 1].lastChild.firstChild.nodeValue;
                if (right == ")" || right == "]") {
                    var left = newFrag.childNodes[len - 1].firstChild.firstChild.nodeValue;
                    if (left == "(" && right == ")" && symbol.output != "}" ||
                        left == "[" && right == "]") {
                        var pos = []; // positions of commas
                        var matrix = true;
                        var m = newFrag.childNodes.length;
                        for (i = 0; matrix && i < m; i = i + 2) {
                            pos[i] = [];
                            node = newFrag.childNodes[i];
                            if (matrix)
                                matrix = node.nodeName == "mrow" &&
                                    (i == m - 1 || node.nextSibling.nodeName == "mo" &&
                                        node.nextSibling.firstChild.nodeValue == ",") &&
                                    node.firstChild.firstChild &&
                                    node.firstChild.firstChild.nodeValue == left &&
                                    node.lastChild.firstChild &&
                                    node.lastChild.firstChild.nodeValue == right;
                            if (matrix)
                                for (var j = 0; j < node.childNodes.length; j++)
                                    if (node.childNodes[j].firstChild.nodeValue == ",")
                                        pos[i][pos[i].length] = j;
                            if (matrix && i > 1)
                                matrix = pos[i].length == pos[i - 2].length;
                        }
                        matrix = matrix && (pos.length > 1 || pos[0].length > 0);
                        var columnlines = [];
                        if (matrix) {
                            var row, frag, n, k, table = document.createDocumentFragment();
                            for (i = 0; i < m; i = i + 2) {
                                row = document.createDocumentFragment();
                                frag = document.createDocumentFragment();
                                node = newFrag.firstChild; // <mrow>(-,-,...,-,-)</mrow>
                                n = node.childNodes.length;
                                k = 0;
                                node.removeChild(node.firstChild); //remove (
                                for (j = 1; j < n - 1; j++) {
                                    if (typeof pos[i][k] != "undefined" && j == pos[i][k]) {
                                        node.removeChild(node.firstChild); //remove ,
                                        if (node.firstChild.nodeName == "mrow" && node.firstChild.childNodes.length == 1 &&
                                            node.firstChild.firstChild.firstChild.nodeValue == "\u2223") {
                                            //is columnline marker - skip it
                                            if (i == 0) {
                                                columnlines.push("solid");
                                            }
                                            node.removeChild(node.firstChild); //remove mrow
                                            node.removeChild(node.firstChild); //remove ,
                                            j += 2;
                                            k++;
                                        }
                                        else if (i == 0) {
                                            columnlines.push("none");
                                        }
                                        row.appendChild(this.createMmlNode("mtd", frag));
                                        k++;
                                    }
                                    else
                                        frag.appendChild(node.firstChild);
                                }
                                row.appendChild(this.createMmlNode("mtd", frag));
                                if (i == 0) {
                                    columnlines.push("none");
                                }
                                if (newFrag.childNodes.length > 2) {
                                    newFrag.removeChild(newFrag.firstChild); //remove <mrow>)</mrow>
                                    newFrag.removeChild(newFrag.firstChild); //remove <mo>,</mo>
                                }
                                table.appendChild(this.createMmlNode("mtr", row));
                            }
                            node = this.createMmlNode("mtable", table);
                            node.setAttribute("columnlines", columnlines.join(" "));
                            if (typeof symbol.invisible == "boolean" && symbol.invisible)
                                node.setAttribute("columnalign", "left");
                            newFrag.replaceChild(node, newFrag.firstChild);
                        }
                    }
                }
            }
            str = this.AMremoveCharsAndBlanks(str, symbol.input.length);
            if (typeof symbol.invisible != "boolean" || !symbol.invisible) {
                node = this.createMmlNode("mo", document.createTextNode(symbol.output));
                newFrag.appendChild(node);
            }
        }
        return [newFrag, str];
    }
    parseMath(str, latex) {
        var frag, node;
        this.AMnestingDepth = 0;
        //some basic cleanup for dealing with stuff editors like TinyMCE adds
        str = str.replace(/&nbsp;/g, "");
        str = str.replace(/&gt;/g, ">");
        str = str.replace(/&lt;/g, "<");
        frag = this.AMparseExpr(str.replace(/^\s+/g, ""), false)[0];
        node = this.createMmlNode("mstyle", frag);
        if (this.mathcolor != "")
            node.setAttribute("mathcolor", this.mathcolor);
        if (this.mathfontsize != "") {
            node.setAttribute("fontsize", this.mathfontsize);
            node.setAttribute("mathsize", this.mathfontsize);
        }
        // if (this.mathfontfamily != "") {
        node.setAttribute("fontfamily", this.mathfontfamily);
        // node.setAttribute("mathvariant", this.mathfontfamily);
        // }
        if (this.displaystyle)
            node.setAttribute("displaystyle", "true");
        node = this.createMmlNode("math", node);
        if (this.showasciiformulaonhover) //fixed by djhsu so newline
            node.setAttribute("title", str.replace(/\s+/g, " ")); //does not show in Gecko
        return node;
    }
    strarr2docFrag(arr, linebreaks, latex) {
        var newFrag = document.createDocumentFragment();
        var expr = false;
        for (var i = 0; i < arr.length; i++) {
            if (expr)
                newFrag.appendChild(this.parseMath(arr[i], latex));
            else {
                var arri = (linebreaks ? arr[i].split("\n\n") : [arr[i]]);
                newFrag.appendChild(this.createElementXHTML("span").
                    appendChild(document.createTextNode(arri[0])));
                for (var j = 1; j < arri.length; j++) {
                    newFrag.appendChild(this.createElementXHTML("p"));
                    newFrag.appendChild(this.createElementXHTML("span").
                        appendChild(document.createTextNode(arri[j])));
                }
            }
            expr = !expr;
        }
        return newFrag;
    }
    AMautomathrec(str) {
        //formula is a space (or start of str) followed by a maximal sequence of *two* or more tokens, possibly separated by runs of digits and/or space.
        //tokens are single letters (except a, A, I) and ASCIIMathML tokens
        var texcommand = "\\\\[a-zA-Z]+|\\\\\\s|";
        var ambigAMtoken = "\\b(?:oo|lim|ln|int|oint|del|grad|aleph|prod|prop|sinh|cosh|tanh|cos|sec|pi|tt|fr|sf|sube|supe|sub|sup|det|mod|gcd|lcm|min|max|vec|ddot|ul|chi|eta|nu|mu)(?![a-z])|";
        var englishAMtoken = "\\b(?:sum|ox|log|sin|tan|dim|hat|bar|dot)(?![a-z])|";
        var secondenglishAMtoken = "|\\bI\\b|\\bin\\b|\\btext\\b"; // took if and or not out
        var simpleAMtoken = "NN|ZZ|QQ|RR|CC|TT|AA|EE|sqrt|dx|dy|dz|dt|xx|vv|uu|nn|bb|cc|csc|cot|alpha|beta|delta|Delta|epsilon|gamma|Gamma|kappa|lambda|Lambda|omega|phi|Phi|Pi|psi|Psi|rho|sigma|Sigma|tau|theta|Theta|xi|Xi|zeta"; // uuu nnn?
        var letter = "[a-zA-HJ-Z](?=(?:[^a-zA-Z]|$|" + ambigAMtoken + englishAMtoken + simpleAMtoken + "))|";
        var token = letter + texcommand + "\\d+|[-()[\\]{}+=*&^_%\\\@/<>,\\|!:;'~]|\\.(?!(?:\x20|$))|" + ambigAMtoken + englishAMtoken + simpleAMtoken;
        var re = new RegExp("(^|\\s)(((" + token + ")\\s?)((" + token + secondenglishAMtoken + ")\\s?)+)([,.?]?(?=\\s|$))", "g");
        str = str.replace(re, " `$2`$7");
        var arr = str.split(this.AMdelimiter1);
        var re1 = new RegExp("(^|\\s)([b-zB-HJ-Z+*<>]|" + texcommand + ambigAMtoken + simpleAMtoken + ")(\\s|\\n|$)", "g");
        var re2 = new RegExp("(^|\\s)([a-z]|" + texcommand + ambigAMtoken + simpleAMtoken + ")([,.])", "g"); // removed |\d+ for now
        var i;
        for (i = 0; i < arr.length; i++) //single nonenglish tokens
            if (i % 2 == 0) {
                arr[i] = arr[i].replace(re1, " `$2`$3");
                arr[i] = arr[i].replace(re2, " `$2`$3");
                arr[i] = arr[i].replace(/([{}[\]])/, "`$1`");
            }
        str = arr.join(this.AMdelimiter1);
        str = str.replace(/((^|\s)\([a-zA-Z]{2,}.*?)\)`/g, "$1`)"); //fix parentheses
        str = str.replace(/`(\((a\s|in\s))(.*?[a-zA-Z]{2,}\))/g, "$1`$3"); //fix parentheses
        str = str.replace(/\sin`/g, "` in");
        str = str.replace(/`(\(\w\)[,.]?(\s|\n|$))/g, "$1`");
        str = str.replace(/`([0-9.]+|e.g|i.e)`(\.?)/gi, "$1$2");
        str = str.replace(/`([0-9.]+:)`/g, "$1");
        return str;
    }
    processNodeR(n, linebreaks, latex) {
        var mtch, str, arr, frg, i;
        if (n.childNodes.length == 0) {
            if ((n.nodeType != 8 || linebreaks) &&
                n.parentNode.nodeName != "form" && n.parentNode.nodeName != "FORM" &&
                n.parentNode.nodeName != "textarea" && n.parentNode.nodeName != "TEXTAREA" /*&&
n.parentNode.nodeName!="pre" && n.parentNode.nodeName!="PRE"*/) {
                str = n.nodeValue;
                if (!(str == null)) {
                    str = str.replace(/\r\n\r\n/g, "\n\n");
                    str = str.replace(/\x20+/g, " ");
                    str = str.replace(/\s*\r\n/g, " ");
                    if (latex) {
                        // DELIMITERS:
                        mtch = (str.indexOf("\$") == -1 ? false : true);
                        str = str.replace(/([^\\])\$/g, "$1 \$");
                        str = str.replace(/^\$/, " \$"); // in case \$ at start of string
                        arr = str.split(" \$");
                        for (i = 0; i < arr.length; i++)
                            arr[i] = arr[i].replace(/\\\$/g, "\$");
                    }
                    else {
                        mtch = false;
                        str = str.replace(new RegExp(this.AMescape1, "g"), function () { mtch = true; return "AMescape1"; });
                        str = str.replace(/\\?end{?a?math}?/i, function () { this.automathrecognize = false; mtch = true; return ""; });
                        str = str.replace(/amath\b|\\begin{a?math}/i, function () { this.automathrecognize = true; mtch = true; return ""; });
                        arr = str.split(this.AMdelimiter1);
                        if (this.automathrecognize)
                            for (i = 0; i < arr.length; i++)
                                if (i % 2 == 0)
                                    arr[i] = this.AMautomathrec(arr[i]);
                        str = arr.join(this.AMdelimiter1);
                        arr = str.split(this.AMdelimiter1);
                        for (i = 0; i < arr.length; i++) // this is a problem ************
                            arr[i] = arr[i].replace(/AMescape1/g, this.AMdelimiter1);
                    }
                    if (arr.length > 1 || mtch) {
                        if (!this.noMathML) {
                            frg = this.strarr2docFrag(arr, n.nodeType == 8, latex);
                            var len = frg.childNodes.length;
                            n.parentNode.replaceChild(frg, n);
                            return len - 1;
                        }
                        else
                            return 0;
                    }
                }
            }
            else
                return 0;
        }
        else if (n.nodeName != "math") {
            for (i = 0; i < n.childNodes.length; i++)
                i += this.processNodeR(n.childNodes[i], linebreaks, latex);
        }
        return 0;
    }
    AMprocessNode(n, linebreaks, spanclassAM) {
        var frag, st;
        if (spanclassAM != null) {
            frag = document.getElementsByTagName("span");
            for (var i = 0; i < frag.length; i++)
                if (frag[i].className == "AM")
                    this.processNodeR(frag[i], linebreaks, false);
        }
        else {
            try {
                st = n.innerHTML; // look for AMdelimiter on page
            }
            catch (err) { }
            //alert(st)
            if (st == null || /amath\b|\\begin{a?math}/i.test(st) ||
                st.indexOf(this.AMdelimiter1 + " ") != -1 || st.slice(-1) == this.AMdelimiter1 ||
                st.indexOf(this.AMdelimiter1 + "<") != -1 || st.indexOf(this.AMdelimiter1 + "\n") != -1) {
                this.processNodeR(n, linebreaks, false);
            }
        }
    }
    substituteGlyphs(str, font) {
        console.log(str, font);
        if (str == null)
            return '';
        // font table from https://github.com/beizhedenglong/weird-fonts
        // serif.normal is usual ascii.  others are Mathematical Block unicode from https://www.compart.com/en/unicode/block/U+1D400
        const fonts = {
            "serif.normal": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            "serif.bold": ["𝐀", "𝐁", "𝐂", "𝐃", "𝐄", "𝐅", "𝐆", "𝐇", "𝐈", "𝐉", "𝐊", "𝐋", "𝐌", "𝐍", "𝐎", "𝐏", "𝐐", "𝐑", "𝐒", "𝐓", "𝐔", "𝐕", "𝐖", "𝐗", "𝐘", "𝐙", "𝐚", "𝐛", "𝐜", "𝐝", "𝐞", "𝐟", "𝐠", "𝐡", "𝐢", "𝐣", "𝐤", "𝐥", "𝐦", "𝐧", "𝐨", "𝐩", "𝐪", "𝐫", "𝐬", "𝐭", "𝐮", "𝐯", "𝐰", "𝐱", "𝐲", "𝐳", "𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗"],
            "serif.italic": ["𝐴", "𝐵", "𝐶", "𝐷", "𝐸", "𝐹", "𝐺", "𝐻", "𝐼", "𝐽", "𝐾", "𝐿", "𝑀", "𝑁", "𝑂", "𝑃", "𝑄", "𝑅", "𝑆", "𝑇", "𝑈", "𝑉", "𝑊", "𝑋", "𝑌", "𝑍", "𝑎", "𝑏", "𝑐", "𝑑", "𝑒", "𝑓", "𝑔", "ℎ", "𝑖", "𝑗", "𝑘", "𝑙", "𝑚", "𝑛", "𝑜", "𝑝", "𝑞", "𝑟", "𝑠", "𝑡", "𝑢", "𝑣", "𝑤", "𝑥", "𝑦", "𝑧"],
            "serif.bold-italic": ["𝑨", "𝑩", "𝑪", "𝑫", "𝑬", "𝑭", "𝑮", "𝑯", "𝑰", "𝑱", "𝑲", "𝑳", "𝑴", "𝑵", "𝑶", "𝑷", "𝑸", "𝑹", "𝑺", "𝑻", "𝑼", "𝑽", "𝑾", "𝑿", "𝒀", "𝒁", "𝒂", "𝒃", "𝒄", "𝒅", "𝒆", "𝒇", "𝒈", "𝒉", "𝒊", "𝒋", "𝒌", "𝒍", "𝒎", "𝒏", "𝒐", "𝒑", "𝒒", "𝒓", "𝒔", "𝒕", "𝒖", "𝒗", "𝒘", "𝒙", "𝒚", "𝒛"],
            "sans-serif.normal": ["𝖠", "𝖡", "𝖢", "𝖣", "𝖤", "𝖥", "𝖦", "𝖧", "𝖨", "𝖩", "𝖪", "𝖫", "𝖬", "𝖭", "𝖮", "𝖯", "𝖰", "𝖱", "𝖲", "𝖳", "𝖴", "𝖵", "𝖶", "𝖷", "𝖸", "𝖹", "𝖺", "𝖻", "𝖼", "𝖽", "𝖾", "𝖿", "𝗀", "𝗁", "𝗂", "𝗃", "𝗄", "𝗅", "𝗆", "𝗇", "𝗈", "𝗉", "𝗊", "𝗋", "𝗌", "𝗍", "𝗎", "𝗏", "𝗐", "𝗑", "𝗒", "𝗓", "𝟢", "𝟣", "𝟤", "𝟥", "𝟦", "𝟧", "𝟨", "𝟩", "𝟪", "𝟫"],
            "sans-serif.bold": ["𝗔", "𝗕", "𝗖", "𝗗", "𝗘", "𝗙", "𝗚", "𝗛", "𝗜", "𝗝", "𝗞", "𝗟", "𝗠", "𝗡", "𝗢", "𝗣", "𝗤", "𝗥", "𝗦", "𝗧", "𝗨", "𝗩", "𝗪", "𝗫", "𝗬", "𝗭", "𝗮", "𝗯", "𝗰", "𝗱", "𝗲", "𝗳", "𝗴", "𝗵", "𝗶", "𝗷", "𝗸", "𝗹", "𝗺", "𝗻", "𝗼", "𝗽", "𝗾", "𝗿", "𝘀", "𝘁", "𝘂", "𝘃", "𝘄", "𝘅", "𝘆", "𝘇", "𝟬", "𝟭", "𝟮", "𝟯", "𝟰", "𝟱", "𝟲", "𝟳", "𝟴", "𝟵"],
            "sans-serif.italic": ["𝘈", "𝘉", "𝘊", "𝘋", "𝘌", "𝘍", "𝘎", "𝘏", "𝘐", "𝘑", "𝘒", "𝘓", "𝘔", "𝘕", "𝘖", "𝘗", "𝘘", "𝘙", "𝘚", "𝘛", "𝘜", "𝘝", "𝘞", "𝘟", "𝘠", "𝘡", "𝘢", "𝘣", "𝘤", "𝘥", "𝘦", "𝘧", "𝘨", "𝘩", "𝘪", "𝘫", "𝘬", "𝘭", "𝘮", "𝘯", "𝘰", "𝘱", "𝘲", "𝘳", "𝘴", "𝘵", "𝘶", "𝘷", "𝘸", "𝘹", "𝘺", "𝘻"],
            "sans-serif.bold-italic": ["𝘼", "𝘽", "𝘾", "𝘿", "𝙀", "𝙁", "𝙂", "𝙃", "𝙄", "𝙅", "𝙆", "𝙇", "𝙈", "𝙉", "𝙊", "𝙋", "𝙌", "𝙍", "𝙎", "𝙏", "𝙐", "𝙑", "𝙒", "𝙓", "𝙔", "𝙕", "𝙖", "𝙗", "𝙘", "𝙙", "𝙚", "𝙛", "𝙜", "𝙝", "𝙞", "𝙟", "𝙠", "𝙡", "𝙢", "𝙣", "𝙤", "𝙥", "𝙦", "𝙧", "𝙨", "𝙩", "𝙪", "𝙫", "𝙬", "𝙭", "𝙮", "𝙯"],
            "script.normal": ["𝒜", "ℬ", "𝒞", "𝒟", "ℰ", "ℱ", "𝒢", "ℋ", "ℐ", "𝒥", "𝒦", "ℒ", "ℳ", "𝒩", "𝒪", "𝒫", "𝒬", "ℛ", "𝒮", "𝒯", "𝒰", "𝒱", "𝒲", "𝒳", "𝒴", "𝒵", "𝒶", "𝒷", "𝒸", "𝒹", "ℯ", "𝒻", "ℊ", "𝒽", "𝒾", "𝒿", "𝓀", "𝓁", "𝓂", "𝓃", "ℴ", "𝓅", "𝓆", "𝓇", "𝓈", "𝓉", "𝓊", "𝓋", "𝓌", "𝓍", "𝓎", "𝓏"],
            "script.bold": ["𝓐", "𝓑", "𝓒", "𝓓", "𝓔", "𝓕", "𝓖", "𝓗", "𝓘", "𝓙", "𝓚", "𝓛", "𝓜", "𝓝", "𝓞", "𝓟", "𝓠", "𝓡", "𝓢", "𝓣", "𝓤", "𝓥", "𝓦", "𝓧", "𝓨", "𝓩", "𝓪", "𝓫", "𝓬", "𝓭", "𝓮", "𝓯", "𝓰", "𝓱", "𝓲", "𝓳", "𝓴", "𝓵", "𝓶", "𝓷", "𝓸", "𝓹", "𝓺", "𝓻", "𝓼", "𝓽", "𝓾", "𝓿", "𝔀", "𝔁", "𝔂", "𝔃"],
            "fraktur.normal": ["𝔄", "𝔅", "ℭ", "𝔇", "𝔈", "𝔉", "𝔊", "ℌ", "ℑ", "𝔍", "𝔎", "𝔏", "𝔐", "𝔑", "𝔒", "𝔓", "𝔔", "ℜ", "𝔖", "𝔗", "𝔘", "𝔙", "𝔚", "𝔛", "𝔜", "ℨ", "𝔞", "𝔟", "𝔠", "𝔡", "𝔢", "𝔣", "𝔤", "𝔥", "𝔦", "𝔧", "𝔨", "𝔩", "𝔪", "𝔫", "𝔬", "𝔭", "𝔮", "𝔯", "𝔰", "𝔱", "𝔲", "𝔳", "𝔴", "𝔵", "𝔶", "𝔷"],
            "fraktur.bold": ["𝕬", "𝕭", "𝕮", "𝕯", "𝕰", "𝕱", "𝕲", "𝕳", "𝕴", "𝕵", "𝕶", "𝕷", "𝕸", "𝕹", "𝕺", "𝕻", "𝕼", "𝕽", "𝕾", "𝕿", "𝖀", "𝖁", "𝖂", "𝖃", "𝖄", "𝖅", "𝖆", "𝖇", "𝖈", "𝖉", "𝖊", "𝖋", "𝖌", "𝖍", "𝖎", "𝖏", "𝖐", "𝖑", "𝖒", "𝖓", "𝖔", "𝖕", "𝖖", "𝖗", "𝖘", "𝖙", "𝖚", "𝖛", "𝖜", "𝖝", "𝖞", "𝖟"],
            "mono-space.normal": ["𝙰", "𝙱", "𝙲", "𝙳", "𝙴", "𝙵", "𝙶", "𝙷", "𝙸", "𝙹", "𝙺", "𝙻", "𝙼", "𝙽", "𝙾", "𝙿", "𝚀", "𝚁", "𝚂", "𝚃", "𝚄", "𝚅", "𝚆", "𝚇", "𝚈", "𝚉", "𝚊", "𝚋", "𝚌", "𝚍", "𝚎", "𝚏", "𝚐", "𝚑", "𝚒", "𝚓", "𝚔", "𝚕", "𝚖", "𝚗", "𝚘", "𝚙", "𝚚", "𝚛", "𝚜", "𝚝", "𝚞", "𝚟", "𝚠", "𝚡", "𝚢", "𝚣", "𝟶", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿"],
            "double-struck.bold": ["𝔸", "𝔹", "ℂ", "𝔻", "𝔼", "𝔽", "𝔾", "ℍ", "𝕀", "𝕁", "𝕂", "𝕃", "𝕄", "ℕ", "𝕆", "ℙ", "ℚ", "ℝ", "𝕊", "𝕋", "𝕌", "𝕍", "𝕎", "𝕏", "𝕐", "ℤ", "𝕒", "𝕓", "𝕔", "𝕕", "𝕖", "𝕗", "𝕘", "𝕙", "𝕚", "𝕛", "𝕜", "𝕝", "𝕞", "𝕟", "𝕠", "𝕡", "𝕢", "𝕣", "𝕤", "𝕥", "𝕦", "𝕧", "𝕨", "𝕩", "𝕪", "𝕫", "𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡"],
            "circle": ["Ⓐ", "Ⓑ", "Ⓒ", "Ⓓ", "Ⓔ", "Ⓕ", "Ⓖ", "Ⓗ", "Ⓘ", "Ⓙ", "Ⓚ", "Ⓛ", "Ⓜ", "Ⓝ", "Ⓞ", "Ⓟ", "Ⓠ", "Ⓡ", "Ⓢ", "Ⓣ", "Ⓤ", "Ⓥ", "Ⓦ", "Ⓧ", "Ⓨ", "Ⓩ", "ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ", "ⓕ", "ⓖ", "ⓗ", "ⓘ", "ⓙ", "ⓚ", "ⓛ", "ⓜ", "ⓝ", "ⓞ", "ⓟ", "ⓠ", "ⓡ", "ⓢ", "ⓣ", "ⓤ", "ⓥ", "ⓦ", "ⓧ", "ⓨ", "ⓩ", "⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"],
            "square": ['🄰', '🄱', '🄲', '🄳', '🄴', '🄵', '🄶', '🄷', '🄸', '🄹', '🄺', '🄻', '🄼', '🄽', '🄾', '🄿', '🅀', '🅁', '🅂', '🅃', '🅄', '🅅', '🅆', '🅇', '🅈', '🅉', '🄰', '🄱', '🄲', '🄳', '🄴', '🄵', '🄶', '🄷', '🄸', '🄹', '🄺', '🄻', '🄼', '🄽', '🄾', '🄿', '🅀', '🅁', '🅂', '🅃', '🅄', '🅅', '🅆', '🅇', '🅈', '🅉'],
        };
        let glyphFont = '';
        let result = '';
        switch (font) {
            case 'bold':
                glyphFont = 'serif.bold';
                break;
            case 'double-struck':
                glyphFont = 'double-struck.bold';
                break;
            case 'script':
                glyphFont = 'script.normal';
                break;
            case 'monospace':
                glyphFont = 'mono-space.normal';
                break;
            case 'fraktur':
                glyphFont = 'fraktur.normal';
                break;
            case 'sans-serif':
                glyphFont = 'sans-serif.normal';
                break;
            default: return str; // no converstion required
        }
        let glyphString = '';
        Array.from(str).forEach(char => {
            let glyphIndex = fonts["serif.normal"].indexOf(char); // index of chars we can substitute
            console.log(char, glyphIndex);
            glyphString += (glyphIndex >= 0 && fonts[glyphFont].length > glyphIndex) ? fonts[glyphFont][glyphIndex] : char; // substitute if index found
        });
        console.log(glyphString);
        return glyphString;
    }
}
//# sourceMappingURL=asciimath.js.map