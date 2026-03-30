
import { Parser } from "./parser.js"

type Tag = 'div' | 'p' | 'span' | 'body' | 'a'


var AMmathml = "http://www.w3.org/1998/Math/MathML";


var CONST = 0, UNARY = 1, BINARY = 2, INFIX = 3, LEFTBRACKET = 4,
    RIGHTBRACKET = 5, SPACE = 6, UNDEROVER = 7, DEFINITION = 8,
    LEFTRIGHT = 9, TEXT = 10, BIG = 11, LONG = 12, STRETCHY = 13,
    MATRIX = 14, UNARYUNDEROVER = 15; // token types


type AMSymbol = {
    input: string
    tag: string // 'mi' | 'mo' | 'mn' | 'mroot' | 'mfrac' | 'msup' | 'msub' | 'mover' | 'mtext' | 'msqrt' | 'munder' | 'mstyle' | 'menclose' | 'mrow'
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

const fixphi = true;  		//false to return to legacy phi/varphi mapping

var LMsqrt = { input: "\\sqrt", tag: "msqrt", output: "sqrt", ttype: UNARY },
    LMroot = { input: "\\root", tag: "mroot", output: "root", ttype: BINARY },
    LMfrac = { input: "\\frac", tag: "mfrac", output: "/", ttype: BINARY },
    LMover = { input: "\\stackrel", tag: "mover", output: "stackrel", ttype: BINARY },
    LMatop = { input: "\\atop", tag: "mfrac", output: "", ttype: INFIX },
    LMchoose = { input: "\\choose", tag: "mfrac", output: "", ttype: INFIX },
    LMsub = { input: "_", tag: "msub", output: "_", ttype: INFIX },
    LMsup = { input: "^", tag: "msup", output: "^", ttype: INFIX },
    LMtext = { input: "\\mathrm", tag: "mtext", output: "text", ttype: TEXT },
    LMmbox = { input: "\\mbox", tag: "mtext", output: "mbox", ttype: TEXT };

// Commented out by DRW to prevent 1/2 turning into a 2-line fraction
// LMdiv   = {input:"/",	 tag:"mfrac", output:"/",    ttype:INFIX},
// Commented out by DRW so that " prints literally in equations
// LMquote = {input:"\"",	 tag:"mtext", output:"mbox", ttype:TEXT};

const LMsymbols = [
    //Greek letters
    { input: "\\alpha", tag: "mi", output: "\u03B1", ttype: CONST },
    { input: "\\beta", tag: "mi", output: "\u03B2", ttype: CONST },
    { input: "\\gamma", tag: "mi", output: "\u03B3", ttype: CONST },
    { input: "\\delta", tag: "mi", output: "\u03B4", ttype: CONST },
    { input: "\\epsilon", tag: "mi", output: "\u03B5", ttype: CONST },
    { input: "\\varepsilon", tag: "mi", output: "\u025B", ttype: CONST },
    { input: "\\zeta", tag: "mi", output: "\u03B6", ttype: CONST },
    { input: "\\eta", tag: "mi", output: "\u03B7", ttype: CONST },
    { input: "\\theta", tag: "mi", output: "\u03B8", ttype: CONST },
    { input: "\\vartheta", tag: "mi", output: "\u03D1", ttype: CONST },
    { input: "\\iota", tag: "mi", output: "\u03B9", ttype: CONST },
    { input: "\\kappa", tag: "mi", output: "\u03BA", ttype: CONST },
    { input: "\\lambda", tag: "mi", output: "\u03BB", ttype: CONST },
    { input: "\\mu", tag: "mi", output: "\u03BC", ttype: CONST },
    { input: "\\nu", tag: "mi", output: "\u03BD", ttype: CONST },
    { input: "\\xi", tag: "mi", output: "\u03BE", ttype: CONST },
    { input: "\\pi", tag: "mi", output: "\u03C0", ttype: CONST },
    { input: "\\varpi", tag: "mi", output: "\u03D6", ttype: CONST },
    { input: "\\rho", tag: "mi", output: "\u03C1", ttype: CONST },
    { input: "\\varrho", tag: "mi", output: "\u03F1", ttype: CONST },
    { input: "\\varsigma", tag: "mi", output: "\u03C2", ttype: CONST },
    { input: "\\sigma", tag: "mi", output: "\u03C3", ttype: CONST },
    { input: "\\tau", tag: "mi", output: "\u03C4", ttype: CONST },
    { input: "\\upsilon", tag: "mi", output: "\u03C5", ttype: CONST },
    { input: "\\phi", tag: "mi", output: "\u03C6", ttype: CONST },
    { input: "\\varphi", tag: "mi", output: "\u03D5", ttype: CONST },
    { input: "\\chi", tag: "mi", output: "\u03C7", ttype: CONST },
    { input: "\\psi", tag: "mi", output: "\u03C8", ttype: CONST },
    { input: "\\omega", tag: "mi", output: "\u03C9", ttype: CONST },
    { input: "\\Gamma", tag: "mo", output: "\u0393", ttype: CONST },
    { input: "\\Delta", tag: "mo", output: "\u0394", ttype: CONST },
    { input: "\\Theta", tag: "mo", output: "\u0398", ttype: CONST },
    { input: "\\Lambda", tag: "mo", output: "\u039B", ttype: CONST },
    { input: "\\Xi", tag: "mo", output: "\u039E", ttype: CONST },
    { input: "\\Pi", tag: "mo", output: "\u03A0", ttype: CONST },
    { input: "\\Sigma", tag: "mo", output: "\u03A3", ttype: CONST },
    { input: "\\Upsilon", tag: "mo", output: "\u03A5", ttype: CONST },
    { input: "\\Phi", tag: "mo", output: "\u03A6", ttype: CONST },
    { input: "\\Psi", tag: "mo", output: "\u03A8", ttype: CONST },
    { input: "\\Omega", tag: "mo", output: "\u03A9", ttype: CONST },

    //fractions
    { input: "\\frac12", tag: "mo", output: "\u00BD", ttype: CONST },
    { input: "\\frac14", tag: "mo", output: "\u00BC", ttype: CONST },
    { input: "\\frac34", tag: "mo", output: "\u00BE", ttype: CONST },
    { input: "\\frac13", tag: "mo", output: "\u2153", ttype: CONST },
    { input: "\\frac23", tag: "mo", output: "\u2154", ttype: CONST },
    { input: "\\frac15", tag: "mo", output: "\u2155", ttype: CONST },
    { input: "\\frac25", tag: "mo", output: "\u2156", ttype: CONST },
    { input: "\\frac35", tag: "mo", output: "\u2157", ttype: CONST },
    { input: "\\frac45", tag: "mo", output: "\u2158", ttype: CONST },
    { input: "\\frac16", tag: "mo", output: "\u2159", ttype: CONST },
    { input: "\\frac56", tag: "mo", output: "\u215A", ttype: CONST },
    { input: "\\frac18", tag: "mo", output: "\u215B", ttype: CONST },
    { input: "\\frac38", tag: "mo", output: "\u215C", ttype: CONST },
    { input: "\\frac58", tag: "mo", output: "\u215D", ttype: CONST },
    { input: "\\frac78", tag: "mo", output: "\u215E", ttype: CONST },

        //commands with argument
    { input: "\\frac", tag: "mfrac", output: "/", tex: null, ttype: BINARY },

    //binary operation symbols
    { input: "\\pm", tag: "mo", output: "\u00B1", ttype: CONST },
    { input: "\\mp", tag: "mo", output: "\u2213", ttype: CONST },
    { input: "\\triangleleft", tag: "mo", output: "\u22B2", ttype: CONST },
    { input: "\\triangleright", tag: "mo", output: "\u22B3", ttype: CONST },
    { input: "\\cdot", tag: "mo", output: "\u22C5", ttype: CONST },
    { input: "\\star", tag: "mo", output: "\u22C6", ttype: CONST },
    { input: "\\ast", tag: "mo", output: "\u002A", ttype: CONST },
    { input: "\\times", tag: "mo", output: "\u00D7", ttype: CONST },
    { input: "\\div", tag: "mo", output: "\u00F7", ttype: CONST },
    { input: "\\circ", tag: "mo", output: "\u2218", ttype: CONST },
    //{input:"\\bullet",	  tag:"mo", output:"\u2219", ttype:CONST},
    { input: "\\bullet", tag: "mo", output: "\u2022", ttype: CONST },
    { input: "\\oplus", tag: "mo", output: "\u2295", ttype: CONST },
    { input: "\\ominus", tag: "mo", output: "\u2296", ttype: CONST },
    { input: "\\otimes", tag: "mo", output: "\u2297", ttype: CONST },
    { input: "\\bigcirc", tag: "mo", output: "\u25CB", ttype: CONST },
    { input: "\\oslash", tag: "mo", output: "\u2298", ttype: CONST },
    { input: "\\odot", tag: "mo", output: "\u2299", ttype: CONST },
    { input: "\\land", tag: "mo", output: "\u2227", ttype: CONST },
    { input: "\\wedge", tag: "mo", output: "\u2227", ttype: CONST },
    { input: "\\lor", tag: "mo", output: "\u2228", ttype: CONST },
    { input: "\\vee", tag: "mo", output: "\u2228", ttype: CONST },
    { input: "\\cap", tag: "mo", output: "\u2229", ttype: CONST },
    { input: "\\cup", tag: "mo", output: "\u222A", ttype: CONST },
    { input: "\\sqcap", tag: "mo", output: "\u2293", ttype: CONST },
    { input: "\\sqcup", tag: "mo", output: "\u2294", ttype: CONST },
    { input: "\\uplus", tag: "mo", output: "\u228E", ttype: CONST },
    { input: "\\amalg", tag: "mo", output: "\u2210", ttype: CONST },
    { input: "\\bigtriangleup", tag: "mo", output: "\u25B3", ttype: CONST },
    { input: "\\bigtriangledown", tag: "mo", output: "\u25BD", ttype: CONST },
    { input: "\\dag", tag: "mo", output: "\u2020", ttype: CONST },
    { input: "\\dagger", tag: "mo", output: "\u2020", ttype: CONST },
    { input: "\\ddag", tag: "mo", output: "\u2021", ttype: CONST },
    { input: "\\ddagger", tag: "mo", output: "\u2021", ttype: CONST },
    { input: "\\lhd", tag: "mo", output: "\u22B2", ttype: CONST },
    { input: "\\rhd", tag: "mo", output: "\u22B3", ttype: CONST },
    { input: "\\unlhd", tag: "mo", output: "\u22B4", ttype: CONST },
    { input: "\\unrhd", tag: "mo", output: "\u22B5", ttype: CONST },


    //BIG Operators
    { input: "\\sum", tag: "mo", output: "\u2211", ttype: UNDEROVER },
    { input: "\\prod", tag: "mo", output: "\u220F", ttype: UNDEROVER },
    { input: "\\bigcap", tag: "mo", output: "\u22C2", ttype: UNDEROVER },
    { input: "\\bigcup", tag: "mo", output: "\u22C3", ttype: UNDEROVER },
    { input: "\\bigwedge", tag: "mo", output: "\u22C0", ttype: UNDEROVER },
    { input: "\\bigvee", tag: "mo", output: "\u22C1", ttype: UNDEROVER },
    { input: "\\bigsqcap", tag: "mo", output: "\u2A05", ttype: UNDEROVER },
    { input: "\\bigsqcup", tag: "mo", output: "\u2A06", ttype: UNDEROVER },
    { input: "\\coprod", tag: "mo", output: "\u2210", ttype: UNDEROVER },
    { input: "\\bigoplus", tag: "mo", output: "\u2A01", ttype: UNDEROVER },
    { input: "\\bigotimes", tag: "mo", output: "\u2A02", ttype: UNDEROVER },
    { input: "\\bigodot", tag: "mo", output: "\u2A00", ttype: UNDEROVER },
    { input: "\\biguplus", tag: "mo", output: "\u2A04", ttype: UNDEROVER },
    { input: "\\int", tag: "mo", output: "\u222B", ttype: CONST },
    { input: "\\oint", tag: "mo", output: "\u222E", ttype: CONST },

    //binary relation symbols
    { input: ":=", tag: "mo", output: ":=", ttype: CONST },
    { input: "\\lt", tag: "mo", output: "<", ttype: CONST },
    { input: "\\gt", tag: "mo", output: ">", ttype: CONST },
    { input: "\\ne", tag: "mo", output: "\u2260", ttype: CONST },
    { input: "\\neq", tag: "mo", output: "\u2260", ttype: CONST },
    { input: "\\le", tag: "mo", output: "\u2264", ttype: CONST },
    { input: "\\leq", tag: "mo", output: "\u2264", ttype: CONST },
    { input: "\\leqslant", tag: "mo", output: "\u2264", ttype: CONST },
    { input: "\\ge", tag: "mo", output: "\u2265", ttype: CONST },
    { input: "\\geq", tag: "mo", output: "\u2265", ttype: CONST },
    { input: "\\geqslant", tag: "mo", output: "\u2265", ttype: CONST },
    { input: "\\equiv", tag: "mo", output: "\u2261", ttype: CONST },
    { input: "\\ll", tag: "mo", output: "\u226A", ttype: CONST },
    { input: "\\gg", tag: "mo", output: "\u226B", ttype: CONST },
    { input: "\\doteq", tag: "mo", output: "\u2250", ttype: CONST },
    { input: "\\prec", tag: "mo", output: "\u227A", ttype: CONST },
    { input: "\\succ", tag: "mo", output: "\u227B", ttype: CONST },
    { input: "\\preceq", tag: "mo", output: "\u227C", ttype: CONST },
    { input: "\\succeq", tag: "mo", output: "\u227D", ttype: CONST },
    { input: "\\subset", tag: "mo", output: "\u2282", ttype: CONST },
    { input: "\\supset", tag: "mo", output: "\u2283", ttype: CONST },
    { input: "\\subseteq", tag: "mo", output: "\u2286", ttype: CONST },
    { input: "\\supseteq", tag: "mo", output: "\u2287", ttype: CONST },
    { input: "\\sqsubset", tag: "mo", output: "\u228F", ttype: CONST },
    { input: "\\sqsupset", tag: "mo", output: "\u2290", ttype: CONST },
    { input: "\\sqsubseteq", tag: "mo", output: "\u2291", ttype: CONST },
    { input: "\\sqsupseteq", tag: "mo", output: "\u2292", ttype: CONST },
    { input: "\\sim", tag: "mo", output: "\u223C", ttype: CONST },
    { input: "\\simeq", tag: "mo", output: "\u2243", ttype: CONST },
    { input: "\\approx", tag: "mo", output: "\u2248", ttype: CONST },
    { input: "\\cong", tag: "mo", output: "\u2245", ttype: CONST },
    { input: "\\Join", tag: "mo", output: "\u22C8", ttype: CONST },
    { input: "\\bowtie", tag: "mo", output: "\u22C8", ttype: CONST },
    { input: "\\in", tag: "mo", output: "\u2208", ttype: CONST },
    { input: "\\ni", tag: "mo", output: "\u220B", ttype: CONST },
    { input: "\\owns", tag: "mo", output: "\u220B", ttype: CONST },
    { input: "\\propto", tag: "mo", output: "\u221D", ttype: CONST },
    { input: "\\vdash", tag: "mo", output: "\u22A2", ttype: CONST },
    { input: "\\dashv", tag: "mo", output: "\u22A3", ttype: CONST },
    { input: "\\models", tag: "mo", output: "\u22A8", ttype: CONST },
    { input: "\\perp", tag: "mo", output: "\u22A5", ttype: CONST },
    { input: "\\smile", tag: "mo", output: "\u2323", ttype: CONST },
    { input: "\\frown", tag: "mo", output: "\u2322", ttype: CONST },
    { input: "\\asymp", tag: "mo", output: "\u224D", ttype: CONST },
    { input: "\\notin", tag: "mo", output: "\u2209", ttype: CONST },

    //matrices
    { input: "\\begin{eqnarray}", output: "X", ttype: MATRIX, invisible: true },
    { input: "\\begin{array}", output: "X", ttype: MATRIX, invisible: true },
    { input: "\\\\", output: "}&{", ttype: DEFINITION },
    { input: "\\end{eqnarray}", output: "}}", ttype: DEFINITION },
    { input: "\\end{array}", output: "}}", ttype: DEFINITION },

    //grouping and literal brackets -- ieval is for IE
    { input: "\\big", tag: "mo", output: "X", atval: "1.2", ieval: "2.2", ttype: BIG },
    { input: "\\Big", tag: "mo", output: "X", atval: "1.6", ieval: "2.6", ttype: BIG },
    { input: "\\bigg", tag: "mo", output: "X", atval: "2.2", ieval: "3.2", ttype: BIG },
    { input: "\\Bigg", tag: "mo", output: "X", atval: "2.9", ieval: "3.9", ttype: BIG },
    { input: "\\left", tag: "mo", output: "X", ttype: LEFTBRACKET },
    { input: "\\right", tag: "mo", output: "X", ttype: RIGHTBRACKET },
    { input: "{", output: "{", ttype: LEFTBRACKET, invisible: true },
    { input: "}", output: "}", ttype: RIGHTBRACKET, invisible: true },

    { input: "(", tag: "mo", output: "(", atval: "1", ttype: STRETCHY },
    { input: "[", tag: "mo", output: "[", atval: "1", ttype: STRETCHY },
    { input: "\\lbrack", tag: "mo", output: "[", atval: "1", ttype: STRETCHY },
    { input: "\\{", tag: "mo", output: "{", atval: "1", ttype: STRETCHY },
    { input: "\\lbrace", tag: "mo", output: "{", atval: "1", ttype: STRETCHY },
    { input: "\\langle", tag: "mo", output: "\u2329", atval: "1", ttype: STRETCHY },
    { input: "\\lfloor", tag: "mo", output: "\u230A", atval: "1", ttype: STRETCHY },
    { input: "\\lceil", tag: "mo", output: "\u2308", atval: "1", ttype: STRETCHY },

    // rtag:"mi" causes space to be inserted before a following sin, cos, etc.
    // (see function LMparseExpr() )
    { input: ")", tag: "mo", output: ")", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "]", tag: "mo", output: "]", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rbrack", tag: "mo", output: "]", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\}", tag: "mo", output: "}", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rbrace", tag: "mo", output: "}", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rangle", tag: "mo", output: "\u232A", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rfloor", tag: "mo", output: "\u230B", rtag: "mi", atval: "1", ttype: STRETCHY },
    { input: "\\rceil", tag: "mo", output: "\u2309", rtag: "mi", atval: "1", ttype: STRETCHY },

    // "|", "\\|", "\\vert" and "\\Vert" modified later: lspace = rspace = 0em
    { input: "|", tag: "mo", output: "\u2223", atval: "1", ttype: STRETCHY },
    { input: "\\|", tag: "mo", output: "\u2225", atval: "1", ttype: STRETCHY },
    { input: "\\vert", tag: "mo", output: "\u2223", atval: "1", ttype: STRETCHY },
    { input: "\\Vert", tag: "mo", output: "\u2225", atval: "1", ttype: STRETCHY },
    { input: "\\mid", tag: "mo", output: "\u2223", atval: "1", ttype: STRETCHY },
    { input: "\\parallel", tag: "mo", output: "\u2225", atval: "1", ttype: STRETCHY },
    { input: "/", tag: "mo", output: "/", atval: "1.01", ttype: STRETCHY },
    { input: "\\backslash", tag: "mo", output: "\u2216", atval: "1", ttype: STRETCHY },
    { input: "\\setminus", tag: "mo", output: "\\", ttype: CONST },

    //miscellaneous symbols
    { input: "\\!", tag: "mspace", atname: "width", atval: "-0.167em", ttype: SPACE },
    { input: "\\,", tag: "mspace", atname: "width", atval: "0.167em", ttype: SPACE },
    { input: "\\>", tag: "mspace", atname: "width", atval: "0.222em", ttype: SPACE },
    { input: "\\:", tag: "mspace", atname: "width", atval: "0.222em", ttype: SPACE },
    { input: "\\;", tag: "mspace", atname: "width", atval: "0.278em", ttype: SPACE },
    { input: "~", tag: "mspace", atname: "width", atval: "0.333em", ttype: SPACE },
    { input: "\\quad", tag: "mspace", atname: "width", atval: "1em", ttype: SPACE },
    { input: "\\qquad", tag: "mspace", atname: "width", atval: "2em", ttype: SPACE },
    //{input:"{}",		  tag:"mo", output:"\u200B", ttype:CONST}, // zero-width
    { input: "\\prime", tag: "mo", output: "\u2032", ttype: CONST },
    { input: "'", tag: "mo", output: "\u02B9", ttype: CONST },
    { input: "''", tag: "mo", output: "\u02BA", ttype: CONST },
    { input: "'''", tag: "mo", output: "\u2034", ttype: CONST },
    { input: "''''", tag: "mo", output: "\u2057", ttype: CONST },
    { input: "\\ldots", tag: "mo", output: "\u2026", ttype: CONST },
    { input: "\\cdots", tag: "mo", output: "\u22EF", ttype: CONST },
    { input: "\\vdots", tag: "mo", output: "\u22EE", ttype: CONST },
    { input: "\\ddots", tag: "mo", output: "\u22F1", ttype: CONST },
    { input: "\\forall", tag: "mo", output: "\u2200", ttype: CONST },
    { input: "\\exists", tag: "mo", output: "\u2203", ttype: CONST },
    { input: "\\Re", tag: "mo", output: "\u211C", ttype: CONST },
    { input: "\\Im", tag: "mo", output: "\u2111", ttype: CONST },
    { input: "\\aleph", tag: "mo", output: "\u2135", ttype: CONST },
    { input: "\\hbar", tag: "mo", output: "\u210F", ttype: CONST },
    { input: "\\ell", tag: "mo", output: "\u2113", ttype: CONST },
    { input: "\\wp", tag: "mo", output: "\u2118", ttype: CONST },
    { input: "\\emptyset", tag: "mo", output: "\u2205", ttype: CONST },
    { input: "\\infty", tag: "mo", output: "\u221E", ttype: CONST },
    { input: "\\surd", tag: "mo", output: "\\sqrt{}", ttype: DEFINITION },
    { input: "\\partial", tag: "mo", output: "\u2202", ttype: CONST },
    { input: "\\nabla", tag: "mo", output: "\u2207", ttype: CONST },
    { input: "\\triangle", tag: "mo", output: "\u25B3", ttype: CONST },
    { input: "\\therefore", tag: "mo", output: "\u2234", ttype: CONST },
    { input: "\\angle", tag: "mo", output: "\u2220", ttype: CONST },
    //{input:"\\\\ ",	  tag:"mo", output:"\u00A0", ttype:CONST},
    { input: "\\diamond", tag: "mo", output: "\u22C4", ttype: CONST },
    //{input:"\\Diamond",	  tag:"mo", output:"\u25CA", ttype:CONST},
    { input: "\\Diamond", tag: "mo", output: "\u25C7", ttype: CONST },
    { input: "\\neg", tag: "mo", output: "\u00AC", ttype: CONST },
    { input: "\\lnot", tag: "mo", output: "\u00AC", ttype: CONST },
    { input: "\\bot", tag: "mo", output: "\u22A5", ttype: CONST },
    { input: "\\top", tag: "mo", output: "\u22A4", ttype: CONST },
    { input: "\\square", tag: "mo", output: "\u25AB", ttype: CONST },
    { input: "\\Box", tag: "mo", output: "\u25A1", ttype: CONST },
    { input: "\\wr", tag: "mo", output: "\u2240", ttype: CONST },

    //standard functions
    //Note UNDEROVER *must* have tag:"mo" to work properly
    { input: "\\arccos", tag: "mi", output: "arccos", ttype: UNARY, func: true },
    { input: "\\arcsin", tag: "mi", output: "arcsin", ttype: UNARY, func: true },
    { input: "\\arctan", tag: "mi", output: "arctan", ttype: UNARY, func: true },
    { input: "\\arg", tag: "mi", output: "arg", ttype: UNARY, func: true },
    { input: "\\cos", tag: "mi", output: "cos", ttype: UNARY, func: true },
    { input: "\\cosh", tag: "mi", output: "cosh", ttype: UNARY, func: true },
    { input: "\\cot", tag: "mi", output: "cot", ttype: UNARY, func: true },
    { input: "\\coth", tag: "mi", output: "coth", ttype: UNARY, func: true },
    { input: "\\csc", tag: "mi", output: "csc", ttype: UNARY, func: true },
    { input: "\\deg", tag: "mi", output: "deg", ttype: UNARY, func: true },
    { input: "\\det", tag: "mi", output: "det", ttype: UNARY, func: true },
    { input: "\\dim", tag: "mi", output: "dim", ttype: UNARY, func: true }, //CONST?
    { input: "\\exp", tag: "mi", output: "exp", ttype: UNARY, func: true },
    { input: "\\gcd", tag: "mi", output: "gcd", ttype: UNARY, func: true }, //CONST?
    { input: "\\hom", tag: "mi", output: "hom", ttype: UNARY, func: true },
    { input: "\\inf", tag: "mo", output: "inf", ttype: UNDEROVER },
    { input: "\\ker", tag: "mi", output: "ker", ttype: UNARY, func: true },
    { input: "\\lg", tag: "mi", output: "lg", ttype: UNARY, func: true },
    { input: "\\lim", tag: "mo", output: "lim", ttype: UNDEROVER },
    { input: "\\liminf", tag: "mo", output: "liminf", ttype: UNDEROVER },
    { input: "\\limsup", tag: "mo", output: "limsup", ttype: UNDEROVER },
    { input: "\\ln", tag: "mi", output: "ln", ttype: UNARY, func: true },
    { input: "\\log", tag: "mi", output: "log", ttype: UNARY, func: true },
    { input: "\\max", tag: "mo", output: "max", ttype: UNDEROVER },
    { input: "\\min", tag: "mo", output: "min", ttype: UNDEROVER },
    { input: "\\Pr", tag: "mi", output: "Pr", ttype: UNARY, func: true },
    { input: "\\sec", tag: "mi", output: "sec", ttype: UNARY, func: true },
    { input: "\\sin", tag: "mi", output: "sin", ttype: UNARY, func: true },
    { input: "\\sinh", tag: "mi", output: "sinh", ttype: UNARY, func: true },
    { input: "\\sup", tag: "mo", output: "sup", ttype: UNDEROVER },
    { input: "\\tan", tag: "mi", output: "tan", ttype: UNARY, func: true },
    { input: "\\tanh", tag: "mi", output: "tanh", ttype: UNARY, func: true },

    //arrows
    { input: "\\gets", tag: "mo", output: "\u2190", ttype: CONST },
    { input: "\\leftarrow", tag: "mo", output: "\u2190", ttype: CONST },
    { input: "\\to", tag: "mo", output: "\u2192", ttype: CONST },
    { input: "\\rightarrow", tag: "mo", output: "\u2192", ttype: CONST },
    { input: "\\leftrightarrow", tag: "mo", output: "\u2194", ttype: CONST },
    { input: "\\uparrow", tag: "mo", output: "\u2191", ttype: CONST },
    { input: "\\downarrow", tag: "mo", output: "\u2193", ttype: CONST },
    { input: "\\updownarrow", tag: "mo", output: "\u2195", ttype: CONST },
    { input: "\\Leftarrow", tag: "mo", output: "\u21D0", ttype: CONST },
    { input: "\\Rightarrow", tag: "mo", output: "\u21D2", ttype: CONST },
    { input: "\\Leftrightarrow", tag: "mo", output: "\u21D4", ttype: CONST },
    { input: "\\iff", tag: "mo", output: "~\\Longleftrightarrow~", ttype: DEFINITION },
    { input: "\\Uparrow", tag: "mo", output: "\u21D1", ttype: CONST },
    { input: "\\Downarrow", tag: "mo", output: "\u21D3", ttype: CONST },
    { input: "\\Updownarrow", tag: "mo", output: "\u21D5", ttype: CONST },
    { input: "\\mapsto", tag: "mo", output: "\u21A6", ttype: CONST },
    { input: "\\longleftarrow", tag: "mo", output: "\u2190", ttype: LONG },
    { input: "\\longrightarrow", tag: "mo", output: "\u2192", ttype: LONG },
    { input: "\\longleftrightarrow", tag: "mo", output: "\u2194", ttype: LONG },
    { input: "\\Longleftarrow", tag: "mo", output: "\u21D0", ttype: LONG },
    { input: "\\Longrightarrow", tag: "mo", output: "\u21D2", ttype: LONG },
    { input: "\\Longleftrightarrow", tag: "mo", output: "\u21D4", ttype: LONG },
    { input: "\\longmapsto", tag: "mo", output: "\u21A6", ttype: CONST },
    // disaster if LONG

    //commands with argument
    LMsqrt, LMroot, LMfrac, LMover, LMsub, LMsup, LMtext, LMmbox, LMatop, LMchoose,
    //LMdiv, LMquote,

    //diacritical marks
    { input: "\\acute", tag: "mover", output: "\u00B4", ttype: UNARY, acc: true },
    //{input:"\\acute",	  tag:"mover",  output:"\u0317", ttype:UNARY, acc:true},
    //{input:"\\acute",	  tag:"mover",  output:"\u0301", ttype:UNARY, acc:true},
    //{input:"\\grave",	  tag:"mover",  output:"\u0300", ttype:UNARY, acc:true},
    //{input:"\\grave",	  tag:"mover",  output:"\u0316", ttype:UNARY, acc:true},
    { input: "\\grave", tag: "mover", output: "\u0060", ttype: UNARY, acc: true },
    { input: "\\breve", tag: "mover", output: "\u02D8", ttype: UNARY, acc: true },
    { input: "\\check", tag: "mover", output: "\u02C7", ttype: UNARY, acc: true },
    { input: "\\dot", tag: "mover", output: ".", ttype: UNARY, acc: true },
    { input: "\\ddot", tag: "mover", output: "..", ttype: UNARY, acc: true },
    //{input:"\\ddot",	  tag:"mover",  output:"\u00A8", ttype:UNARY, acc:true},
    { input: "\\mathring", tag: "mover", output: "\u00B0", ttype: UNARY, acc: true },
    { input: "\\vec", tag: "mover", output: "\u20D7", ttype: UNARY, acc: true },
    { input: "\\overrightarrow", tag: "mover", output: "\u20D7", ttype: UNARY, acc: true },
    { input: "\\overleftarrow", tag: "mover", output: "\u20D6", ttype: UNARY, acc: true },
    { input: "\\hat", tag: "mover", output: "\u005E", ttype: UNARY, acc: true },
    { input: "\\widehat", tag: "mover", output: "\u0302", ttype: UNARY, acc: true },
    { input: "\\tilde", tag: "mover", output: "~", ttype: UNARY, acc: true },
    //{input:"\\tilde",	  tag:"mover",  output:"\u0303", ttype:UNARY, acc:true},
    { input: "\\widetilde", tag: "mover", output: "\u02DC", ttype: UNARY, acc: true },
    { input: "\\bar", tag: "mover", output: "\u203E", ttype: UNARY, acc: true },
    { input: "\\overbrace", tag: "mover", output: "\u23B4", ttype: UNARY, acc: true },
    { input: "\\overline", tag: "mover", output: "\u00AF", ttype: UNARY, acc: true },
    { input: "\\underbrace", tag: "munder", output: "\u23B5", ttype: UNARY, acc: true },
    { input: "\\underline", tag: "munder", output: "\u00AF", ttype: UNARY, acc: true },
    //{input:"underline",	tag:"munder", output:"\u0332", ttype:UNARY, acc:true},

    //typestyles and fonts
    { input: "\\displaystyle", tag: "mstyle", atname: "displaystyle", atval: "true", ttype: UNARY },
    { input: "\\textstyle", tag: "mstyle", atname: "displaystyle", atval: "false", ttype: UNARY },
    { input: "\\scriptstyle", tag: "mstyle", atname: "scriptlevel", atval: "1", ttype: UNARY },
    { input: "\\scriptscriptstyle", tag: "mstyle", atname: "scriptlevel", atval: "2", ttype: UNARY },
    { input: "\\textrm", tag: "mstyle", output: "\\mathrm", ttype: DEFINITION },
    { input: "\\mathbf", tag: "mstyle", atname: "mathvariant", atval: "bold", ttype: UNARY },
    { input: "\\textbf", tag: "mstyle", atname: "mathvariant", atval: "bold", ttype: UNARY },
    { input: "\\mathit", tag: "mstyle", atname: "mathvariant", atval: "italic", ttype: UNARY },
    { input: "\\textit", tag: "mstyle", atname: "mathvariant", atval: "italic", ttype: UNARY },
    { input: "\\mathtt", tag: "mstyle", atname: "mathvariant", atval: "monospace", ttype: UNARY },
    { input: "\\texttt", tag: "mstyle", atname: "mathvariant", atval: "monospace", ttype: UNARY },
    { input: "\\mathsf", tag: "mstyle", atname: "mathvariant", atval: "sans-serif", ttype: UNARY },
    { input: "\\mathbb", tag: "mstyle", atname: "mathvariant", atval: "double-struck", ttype: UNARY, codes: 'double-struck' },
    { input: "\\mathcal", tag: "mstyle", atname: "mathvariant", atval: "script", ttype: UNARY, codes: 'script' },
    { input: "\\mathfrak", tag: "mstyle", atname: "mathvariant", atval: "fraktur", ttype: UNARY, codes: 'fraktur' }
];




export class LatexMath extends Parser {

    constructor() {
        let defaults = {
            mathcolor: "blue",            // change it to "" (to inherit) or another color
            mathfontsize: "1em",          // change to e.g. 1.2em for larger math
            automathrecognize: false,     // writing "amath" on page makes this true
            translateASCIIMath: true,     // false to preserve `..`
            displaystyle: true,           // puts limits above and below large operators
            decimalsign: ".",             // if "," then when writing lists or matrices put a space after the "," like `(1, 2)` not `(1,2)`
            mathfontfamily: 'serif',      // probably no longer needed since mathvariant is depricated
        }
        super(LMsymbols, {}, defaults)

        this.initSymbols();
    }

}
