type AMSymbol = {
    input: string;
    tag: string;
    output?: string;
    tex?: string | null;
    ttype: number;
    invisible?: boolean;
    func?: boolean;
    acc?: boolean;
    rewriteleftright?: string[];
    notexcopy?: boolean;
    atname?: "mathvariant";
    atval?: "bold" | "sans-serif" | "double-struck" | "script" | "fraktur" | "monospace";
    codes?: string;
};
export declare class AsciiMath {
    mathcolor: string;
    mathfontsize: string;
    mathfontfamily: string;
    automathrecognize: boolean;
    checkForMathML: boolean;
    notifyIfNoMathML: boolean;
    alertIfNoMathML: boolean;
    translateOnLoad: boolean;
    translateASCIIMath: boolean;
    displaystyle: boolean;
    showasciiformulaonhover: boolean;
    decimalsign: string;
    AMdelimiter1: string;
    AMescape1: string;
    AMdocumentId: string;
    fixphi: boolean;
    noMathML: boolean;
    translated: boolean;
    AMnestingDepth: number;
    AMpreviousSymbol: number;
    AMcurrentSymbol: number;
    AMnames: any[];
    AMquote: AMSymbol;
    AMsymbols: AMSymbol[];
    constructor();
    checkMathML(): boolean;
    hideWarning(): void;
    displayWarnings(warnings: any): void;
    /** Find and translate all math on a page.  if spanclassAM is provided then it
    * is the tag to look for.  Perhaps 'span' is a good value.  If it is NOT
    * provided, then we will look for this.AMdelimiter1 (by default a backtick)
    */
    translate(spanclassAM?: any): void;
    createElementXHTML(t: string): HTMLElement;
    AMcreateElementMathML(t: any): Element;
    createMmlNode(t: any, frag?: any): Element;
    newcommand(oldstr: any, newstr: any): void;
    newsymbol(symbolobj: any): void;
    compareNames(s1: any, s2: any): 1 | -1;
    initSymbols(): void;
    refreshSymbols(): void;
    define(oldstr: any, newstr: any): void;
    AMremoveCharsAndBlanks(str: any, n: any): any;
    position(arr: any, str: any, n: any): any;
    AMgetSymbol(str: any): AMSymbol | {
        input: any;
        tag: any;
        output: any;
        ttype: number;
        func: boolean;
    } | {
        input: any;
        tag: any;
        output: any;
        ttype: number;
        func?: undefined;
    };
    AMremoveBrackets(node: any): void;
    AMparseSexpr(str: any): any;
    AMparseIexpr(str: any): any[];
    AMparseExpr(str: any, rightbracket: any): any[];
    parseMath(str: any, latex?: any): any;
    strarr2docFrag(arr: any, linebreaks: any, latex: any): DocumentFragment;
    AMautomathrec(str: any): any;
    processNodeR(n: any, linebreaks: any, latex: any): number;
    AMprocessNode(n: any, linebreaks: any, spanclassAM: any): void;
    substituteGlyphs(str: string, font: string): string;
}
export {};
