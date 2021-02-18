asciimathml-ts
===========

This is a quick-and-dirty port of ASCIIMathML.js into TS and NPM.

Disclaimer: I'm the wrong guy to build this, I am just on day one of learning ASCIIMath. But the existing library didn't meet my needs, so I ran it through TS and posted it on NPM.

It's not completely clean.  There is some confusion in the original code between DocumentFragments and strings that prevents strict TS typechecking.  I'll come back
to that one day.


ASCIIMathML translates from ASCIIMath to MathML.  [Check this out.](http://www1.chapman.edu/~jipsen/asciimath.html)  Cheat sheet [here.](http://asciimath.org/)


As I write this, MathML is only supported in FireFox and Opera, but it looks as if Chrome support is [on the horizon.](https://mathml.igalia.com/)

The original ASCIIMathML is here: [https://github.com/asciimath/asciimathml](https://github.com/asciimath/asciimathml) 




If you want ASCIIMath in all browsers, you need to add JAX.  Refer to [this stackoverflow](https://stackoverflow.com/questions/29682207/unable-to-render-mathml-content-in-google-chrome). But you lose many features like
color and fonts.




## Usage
```
import {AsciiMath} from 'ASCIIMathML-ts'

let a = new AsciiMath()

// put an equation at <div id='testmath'>
let eqn = 'sum_(i=1)^n i^3=((n(n+1))/2)^2'
document.getElementById('testmath').appendChild(a.parseMath(eqn))


// alternately, just translate the entire <body>
// everything in backticks will be translated
a.translate()
```







