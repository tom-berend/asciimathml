declare type AMSymbol = {
    input: string;
    tag: 'mi' | 'mo' | 'mn' | 'mroot' | 'mfrac' | 'msup' | 'msub' | 'mover' | 'mtext' | 'msqrt' | 'munder' | 'mstyle' | 'menclose' | 'mrow';
    output: string;
    tex: string | null;
    ttype: number;
    invisible?: boolean;
    func?: boolean;
    acc?: boolean;
    rewriteleftright?: string[];
    notexcopy?: boolean;
    atname?: "mathvariant";
    atval?: "bold" | "sans-serif" | "double-struck" | "script" | "fraktur" | "monospace";
    codes?: string[];
};
declare type Tag = 'div' | 'p' | 'span' | 'body' | 'a';
/** convert an AsciiMath statement to MathML */
export declare class AsciiMath {
    noMathML: boolean;
    translated: boolean;
    latex: boolean;
    AMnames: string[];
    AMmathml: string;
    AMnestingDepth: number;
    AMpreviousSymbol: number;
    AMcurrentSymbol: number;
    mathcolor: string;
    mathfontsize: string;
    mathfontfamily: string;
    AMdelimiter1: string;
    AMescape1: string;
    AMSymbols: AMSymbol[];
    constructor();
    /** Add a stylesheet, replacing any previous custom stylesheet (adapted from TW) */
    setStylesheet(s: string): void;
    init(): boolean;
    checkMathML(): string;
    hideWarning(): void;
    displayWarnings(warnings: string[]): void;
    /** Find and translate all math on a page.  if spanclassAM is provided then it
     * is the tag to look for.  Perhaps 'span' is a good value.  If it is NOT
     * provided, then we will look for AMDelimiter1 (by default a backtick)
     */
    translate(spanclassAM?: string): void;
    createElementXHTML(t: Tag): HTMLElement;
    AMcreateElementMathML(t: Tag): Element;
    createMmlNode(t: string, frag?: any): any;
    newcommand(oldstr: string, newstr: string): void;
    newsymbol(symbolobj: AMSymbol): void;
    compareNames(s1: AMSymbol, s2: AMSymbol): number;
    initSymbols(): void;
    refreshSymbols(): void;
    define(oldstr: string, newstr: string): void;
    AMremoveCharsAndBlanks(str: string, n: number): any;
    position(arr: string[], str: string, n: number): any;
    AMgetSymbol(str: string): AMSymbol;
    AMremoveBrackets(node: Node): void;
    AMparseSexpr(str: string): [Node, string];
    AMparseIexpr(str: string): [Node, string];
    AMparseExpr(str: string, rightbracket: boolean): (string | DocumentFragment)[];
    /** Convert a single string to an HTML Element ready for insertion.
     * let a = new AsciiMath()
     * let eqn = 'sum_(i=1)^n i^3=((n(n+1))/2)^2'
     * document.getElementById('insertMathHere').appendChild(a.parseMath(eqn))
      */
    parseMath(str: string): Element;
    strarr2docFrag(arr: string[], linebreaks: boolean): DocumentFragment;
    AMautomathrec(str: string): string;
    processNodeR(n: Node, linebreaks: boolean): number;
    /** hunt through a document and translate every math element.
     * if spanclassAM is provided, then it is the <tag> that holds math (perhaps 'span'?)
     * otherwise we go looking for AMdelimiter
     */
    AMprocessNode(n: HTMLElement, linebreaks: boolean, spanclassAM?: string): void;
    /** load the parsing table.  Needs to be reloaded when  fixPHI is changed. */
    loadAMSymbols(): void;
}
export {};
