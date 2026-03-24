type fontStyle = "normal" | "bold" | "italic" | "bold-italic";
export declare class WeirdFonts {
    fontStyleMap: {
        normal: boolean;
        bold: boolean;
        italic: boolean;
        "bold-italic": boolean;
    };
    lookUp(fontName: string, s?: string): string;
    fonts: {
        "serif.normal": string[];
        "serif.bold": string[];
        "serif.italic": string[];
        "serif.bold-italic": string[];
        "sans-serif.normal": string[];
        "sans-serif.bold": string[];
        "sans-serif.italic": string[];
        "sans-serif.bold-italic": string[];
        "script.normal": string[];
        "script.bold": string[];
        "fraktur.normal": string[];
        "fraktur.bold": string[];
        "mono-space.normal": string[];
        "double-struck.bold": string[];
        circle: string[];
        square: string[];
    };
    fontStyleHelper(s?: string, prefix?: string, options?: {
        fontStyle: fontStyle;
    }): string;
    serif(s?: string, options?: {
        fontStyle: fontStyle;
    }): void;
    sansSerif(s?: string, options?: {
        fontStyle: fontStyle;
    }): void;
    scriptHelper(s?: string, prefix?: string, options?: {
        fontStyle: "normal" | "bold";
    }): string;
    script(s?: string, options?: {
        fontStyle: "normal" | "bold";
    }): void;
    fraktur(s?: string, options?: {
        fontStyle: "normal" | "bold";
    }): void;
    monoSpace: (s?: string) => string;
    doubleStruck: (s?: string) => string;
    circle: (s?: string) => string;
    square: (s?: string) => string;
    strMap: (f: (c: string) => string, s?: string) => string;
}
export {};
