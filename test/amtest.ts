

import { AsciiMath } from "../src/asciimath.js"
let am = new AsciiMath()

export function test() {


    let d = document.getElementById('test')
    if (d) {
        let div = document.createElement('table')
        d.appendChild(div)

        let tr = document.createElement('tr')
        div.appendChild(tr);

        ['plaintext', 'AsciiMathML.js', 'TS Rewrite', 'tokens', 'output'].map((title) => {
            let th = document.createElement('th')
            th.innerHTML = title
            tr.appendChild(th)
        })

        subtitle(div, 'letters and symbols')
        /*
        */
        appnd(div, 'abc')
        appnd(div, 'a b c')
        appnd(div, 'alpha  beta  gamma')
        appnd(div, 'NN')
        appnd(div, 'NN ZZ')
        appnd(div, 'a NN alpha ZZ')
        appnd(div, 'a + b - c * d xx e')
        appnd(div, '-200-100 - 50  -a-b')

        subtitle(div, 'unary')
        appnd(div, 'vec x')      // acc is true
        appnd(div, 'vec alpha')
        appnd(div, 'vec alpha x')
        appnd(div, 'tan x')      // func is true
        appnd(div, 'tan x tan alpha')
        appnd(div, '(x)')
        appnd(div, 'vec x')
        appnd(div, 'vec(x)')
        appnd(div, 'tan vec x')
        appnd(div, 'vec tan x')
        appnd(div, 'vec(x + a)')
        appnd(div, 'tan(x)')
        appnd(div, 'tan(x + a)')
        appnd(div, 'tan x y z')
        appnd(div, 'tan (x y z)')
        appnd(div, 'norm x ') // rewriteleftright has two values
        appnd(div, 'norm(x)') // rewriteleftright has two values
        appnd(div, 'norm(alpha)')
        appnd(div, 'norm(vec x)')
        appnd(div, 'norm(tan x)')
        appnd(div, 'norm(tan(x))')
        appnd(div, 'tan(norm(tan(x)))')


        appnd(div, 'abs x')
        appnd(div, 'abs(x)')
        appnd(div, 'abs(xyz+ 123)')
        appnd(div, 'abs(x+ -.123)')



        appnd(div, `obrace log(x) cc log(x)`)
        appnd(div, `obrace log(x) obrace cc log(x)`)
        appnd(div, `log(x) cc "log(x)"`)
        appnd(div, `log(x) cc log(x)`)


        subtitle(div, 'matrices')
        appnd(div, 'a b c d')
        appnd(div, 'a,b,c,d')
        appnd(div, '[a,b,c,d]')
        appnd(div, '[[ a,b,c,d ]]')
        appnd(div, '[[a,b],[c,d]]')
        appnd(div, '[(a,b),(c,d)]')
        appnd(div, '((a),(b))')
        appnd(div, '([a],[b])')
        appnd(div, '(  a,b )')
        /*
        appnd(div, '<<(a),(b)>>')
        appnd(div, '<< a,b >>')
        appnd(div, '[[ ((x),(y)) ,b],[c,d]]')
        appnd(div, '[[a,b,|,c],[d,e,|,f]]')
        appnd(div, `{(2x,+,17y,=,23),(x,-,y,=,5):}`)

        appnd(div, `lim_(N->oo) sum_(i=0)^N`)

        appnd(div, `log(x)`)
        appnd(div, `bb log(x)`)
        appnd(div, `bb log x`)
        appnd(div, `bb log bb`)
        appnd(div, `"(x)"`)
        appnd(div,`log(x) bb`)



        // appnd(div, '')
        // appnd(div, `"abc 01239 $%*"`)
        // appnd(div, `bb "abc 01239 $%*"`)
        // appnd(div, `bbb "abc 01239 $%*"`)
        // appnd(div, `tt "abc 01239 $%*"`)
        // appnd(div, `fr "abc 01239 $%*"`)
        // appnd(div, `sf "abc 01239 $%*"`)

        // appnd(div, '')
        // appnd(div, `bb(bracket bold AaBbCc)`)
        // appnd(div, `mathbf(bracket bold AaBbCc)`)
        // appnd(div, 'bb "literal bold AaBbCc"')
        // appnd(div, 'mathbf "literal bold AaBbCc"')
        // appnd(div, '')
        // appnd(div, '"AaBbCc literal"')
        // appnd(div, 'bb "AaBbCc bold"')
        // appnd(div, 'bbb "AaBbCc dbl-struck"')
        // appnd(div, 'cc "AaBbCc script"')
        // appnd(div, 'tt "AaBbCc mono"')
        // appnd(div, 'fr "AaBbCc frakur"')
        // appnd(div, 'sf "AaBbCc sanserif"')

        // appnd(div, 'bold (abc)')
        // appnd(div, 'bold (vec A)  bold(alpha')
        // appnd(div, 'bold(alpha  beta  gamma)')

        // appnd(div, `"Literal non-italic"`)

        // appnd(div, '')


        // appnd(div, `(cancel((x + 1))(x - 2)) / (cancel((x + 1))(x + 3))`, 'what happened to cancel?')

        /*
                appnd(div, 'sum_(i=1)^n i^3=((n(n+1))/2)^2')
                appnd(div, `x ^ 2 + y_1 + z_12 ^ 34`)
                appnd(div, `sin ^ -1(x)`)
                appnd(div, `\\frac{ d }{ dx }f(x) =\\lim_{ h\\to 0}\\frac{ f(x+ h) - f(x)
    } { h })`, ` in JS, use \\\\ to get \\`)
                appnd(div, `frac{ d } { dx } f(x) = lim_{h to 0 }frac{ f(x + h) - f(x) } { h })`)
                appnd(div, `f(x) = sum_(n = 0) ^ oo(f ^ ((n))(a)) / (n!)(x - a) ^ n`)
                appnd(div, `f(x) =\\sum_{ n = 0 }^\\infty\\frac{ f ^ {(n) } (a)
} { n! } (x - a) ^ n`)
                appnd(div, `int_0 ^ 1f(x)dx`)
                appnd(div, `[[a, b], [c, d]]((n), (k))`)
                appnd(div, `x / x={ (1,if x != 0), ("undefined",if x = 0):} `)
                appnd(div, `a//b`)
appnd(div, `(a/b)/(c/d)`)
appnd(div, `a/b/c/d`)
appnd(div, `((a*b))/c`)
appnd(div, `sqrt sqrt root3x`)
appnd(div, `&lt;&lt; a,b >> and {:(x,y),(u,v):}`)
appnd(div, `(a,b]={x in RR | a &lt; x &lt;= b}`)
appnd(div, `abc-123.45^-1.1`)
appnd(div, `hat(ab) bar(xy) ulA vec v dotx ddot y`)
appnd(div, `bb{AB3}.bbb(AB].cc(AB).fr{AB}.tt[AB].sf(AB)`)
appnd(div, `stackrel"def"= or \stackrel{\Delta}{=}" "("or ":=)`)
appnd(div, `{::}_(\ 92)^238U`)
appnd(div, `(cancel((x+1))(x-2))/(cancel((x+1))(x+3))`, 'what happened to cancel?')
appnd(div, `color(red)(x^2)+ color(orange)(3x) + color(green)(4)`)
appnd(div, `underbrace(1+2+3+4)_("4 terms") - obrace(2+3)^(n)`)

appnd(div, '')

appnd(div, `hatx`)
appnd(div, `bar x`)
appnd(div, `ul x`)
appnd(div, `vec x`)
appnd(div, `tilde x`)
appnd(div, `dot x`)
appnd(div, `ddot x`)

appnd(div, '')

appnd(div, `overset(x)(=)`)
appnd(div, `underset(x)(=)`)
appnd(div, `ubrace(1+2)`)
appnd(div, `obrace(1+2)`)
appnd(div, `overarc(AB)`)
appnd(div, `color(red)(x)`)
appnd(div, `cancel(x)`)

appnd(div, '')

// issue 15
appnd(div, `log`, 'issue 15')
appnd(div, `log_2(x)/5`)
appnd(div, `log_2x/5`)
appnd(div, `log_2.5x/5`)
appnd(div, `log_2/5`)
appnd(div, `log_sqrt(5)3/5`)
appnd(div, `log/5`)
appnd(div, `log^2(x)/5`)
appnd(div, `log(x)/5`)
appnd(div, `log/5`)
appnd(div, `log_2(x)+5`)
appnd(div, `log_2^5(x)+5`)
appnd(div, `log_2+5`)
appnd(div, `log+5`)
appnd(div, `log^2(x)+5`)
appnd(div, `f_3(x)/5`)
appnd(div, `f_3/5`)
appnd(div, `2^f-3`)
appnd(div, `2^f_2-3`, `This is expected to display with _2 instead of a subscript`)
appnd(div, `4(f_3)-4`)
appnd(div, `2^(f_3/x)`)
appnd(div, `2^(f_3(x)/5)`)
appnd(div, `f_3theta/5`)
appnd(div, `log_3x^2/5`)
appnd(div, `log_3x_0/5`)

appnd(div, '')

// issue 42
appnd(div, `[(1,2,3,|,4),(5,6,7, |,8)]`, 'issue 42')
appnd(div, `[(1,2,3, | ,4,5),(5,6,7, | ,8,9)]`)
appnd(div, `[(1,|,2,3,4),(5,|,6,7,8)]`)
appnd(div, `[(1,|,3,|,4),(5,|,7,|,8)]`)
appnd(div, `[(2,|x|,5),(3,|y|,4)]`, 'Absolute value in matrix:')
appnd(div, `[(1,|,2,|x|,5),(3,|,4,|y|,7)]`)
appnd(div, `[(1,2,3,|,4),(5,6,7,8,9)]`, 'These are for testing weird/bad input')
appnd(div, `[(1,2,3,|,4),(5,6,7,8)]`)
appnd(div, `[(1,2,3,4,5),(5,6,7,|,9)]`)
appnd(div, `[(1,2,3,4),(5,6,7,|,9)]`)
appnd(div, `[(1,2,3,|),(5,6,7,|)]`)
appnd(div, `|x/2+3|,|x-4/5|`, 'These are testing other uses of |:')
appnd(div, `int_2^4 2x dx = x^2|_2^4`)

// issue 74
appnd(div, `3+sin(x)/5-2`, 'issue 74')
appnd(div, `3+Sin(x)/5-2`)
appnd(div, `5+sin(x)+Sin(x)+"test Since"`)
appnd(div, `Log(x)/3 +log(x)/3`)
appnd(div, `Abs(3) + abs(3)`)


// issue 77
appnd(div, `vec(x)`, 'issue 77')
appnd(div, `vecx`)
appnd(div, `vecxyz`)
appnd(div, `vec(xyx)`)
appnd(div, `vec(x+y)`)
appnd(div, `vec(sqrt(x))`)
appnd(div, `vecsqrtx`)
appnd(div, `vecsqrt3`)
appnd(div, `vec"F"`)
appnd(div, `hat(x)`)
appnd(div, `hatx`)
appnd(div, `hatxyz`)
appnd(div, `hat(xyx)`)
appnd(div, `ul(x)`)
appnd(div, `ulx`)
appnd(div, `ulxyz`)
appnd(div, `ul(xyx)`)
appnd(div, ``)

// issue 94

appnd(div, `sin(x)/5`, 'issue 94')
appnd(div, `sin^2(x)/5`)
appnd(div, `sin^2x/5`)
appnd(div, `sin^2x^3/5`)
appnd(div, `f(x)/5`)
appnd(div, `f^2(x)/5`)
appnd(div, `f^2x/5`)
appnd(div, `f^2x^3/5`)
appnd(div, `1/sin^2x^3`)
appnd(div, `1/f^2x^3`)
appnd(div, `1/{f^2x^3}`)
appnd(div, `1/f^{2x^3}`)
appnd(div, ``)
appnd(div, `f'`)
appnd(div, `1/f'`, 'wrong?')
appnd(div, `1/{f'}`)

appnd(div, ``)

// issue 133
appnd(div, `1 !-= 3`, 'issue 133')
appnd(div, `1 \\not\\equiv 3`)
appnd(div, `1 notequiv 3`)

appnd(div, ``)

// issue 136
appnd(div, `3 !sub A`, 'issue 136')
appnd(div, `3 \\not\\subset A`)
appnd(div, `3 notsubset A`)
appnd(div, `3 not\subset A`)
appnd(div, `3 !sup A`)
appnd(div, `3 \\not\\supset A`)
appnd(div, `3 notsupset A`)
appnd(div, `3 not\supset A`)
appnd(div, `3 !sube A`)
appnd(div, `3 \\not\\subseteq A`)
appnd(div, `3 notsubseteq A`)
appnd(div, `3 not\\subseteq A`)
appnd(div, `3 !supe A`)
appnd(div, `3 \\not\\supseteq A`)
appnd(div, `3 notsupseteq A`)
appnd(div, `3 not\\supseteq A`)

appnd(div, ``)

appnd(div, 'a = 2pir^2')

    */
    }

}

function subtitle(div: HTMLElement, title: string) {
    let tr = document.createElement('tr')
    div.appendChild(tr)
    let td = document.createElement('td')
    td.colSpan = 6
    td.innerHTML = `<b>${title}</b>`
    td.style = 'background-color:aliceblue';
    tr.appendChild(td)
}

function appnd(div: HTMLElement, expr: string, comment: string = '') {
    let tr = document.createElement('tr')
    div.appendChild(tr)

    // plaintext
    let td1 = document.createElement('td')
    td1.innerHTML = expr
    tr.appendChild(td1)

    // // converted by new asciimathml
    // let td2 = document.createElement('td')
    // tr.appendChild(td2)
    // let math = am.parseMath(expr)
    // td2.appendChild(math)

    // let old asciimathml convert this one
    let td3 = document.createElement('td')
    td3.innerHTML = '`' + expr + '`'
    tr.appendChild(td3)

    let td4 = document.createElement('td')
    let pOut = am.naiveParser(expr)
    td4.innerHTML = pOut
    tr.appendChild(td4)


    let td5 = document.createElement('td')
    tr.appendChild(td5)
    let rOut = am.lexScanner(expr)
    let rOut2 = JSON.stringify(rOut).replaceAll('],', ']<br/>')

    td5.innerHTML = comment + rOut2

    let td6 = document.createElement('td')
    tr.appendChild(td6)
    let pOut2 = pOut.slice(135 + expr.length) // chop off the front
    pOut2 = pOut2.slice(0, -23)   // chop off the end
    pOut2 = pOut2.replaceAll('<', '&lt;')   // neuter
    pOut2 = pOut2.replaceAll('>&lt;m', '><br>&lt;m')
    td6.innerHTML = pOut2

}

