import { AsciiMath } from "../src/ts_asciimath.js";
let am = new AsciiMath();
import { asciimath } from "../src/js_ASCIIMathML.js";
let am_old = asciimath;
export function test() {
    let output = '';
    let d = document.getElementById('test');
    if (d) {
        let div = document.createElement('table');
        let tr = document.createElement('tr');
        div.appendChild(tr);
        ['plaintext', 'TS', 'original JS', 'comment'].map((title) => {
            let th = document.createElement('th');
            th.innerHTML = title;
            tr.appendChild(th);
        });
        appnd(div, '\\alpha  \\beta  \\gamma', `\\\\alpha in javascript`);
        appnd(div, 'cc "AaBbCc"');
        appnd(div, '\\textb bold');
        appnd(div, '\\textb bold');
        appnd(div, 'sum_(i=1)^n i^3=((n(n+1))/2)^2');
        appnd(div, `x^2+y_1+z_12^34`);
        appnd(div, `sin^-1(x)`);
        appnd(div, `\\frac{d}{dx}f(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h})`, `in JS, use \\\\ to get \\`);
        appnd(div, `frac{d}{dx}f(x)=lim_{h to 0}frac{f(x+h)-f(x)}{h})`);
        appnd(div, `f(x)=sum_(n=0)^oo(f^((n))(a))/(n!)(x-a)^n`);
        appnd(div, `f(x)=\\sum_{n=0}^\\infty\\frac{f^{(n)}(a)}{n!}(x-a)^n`);
        appnd(div, `int_0^1f(x)dx`);
        appnd(div, `[[a,b],[c,d]]((n),(k))`);
        appnd(div, `x/x={(1,if x!=0),("undefined",if x=0):}`, 'undefined is broken');
        appnd(div, 'x/x={(1,if x!=0),({undefined},if x=0):}', 'still broken, extra { and }');
        appnd(div, `a//b`);
        appnd(div, `(a/b)/(c/d)`);
        appnd(div, `a/b/c/d`);
        appnd(div, `((a*b))/c`);
        appnd(div, `sqrt sqrt root3x`);
        appnd(div, `&lt;&lt; a,b >> and {:(x,y),(u,v):}`);
        appnd(div, `(a,b]={x in RR | a &lt; x &lt;= b}`);
        appnd(div, `abc-123.45^-1.1`);
        appnd(div, `hat(ab) bar(xy) ulA vec v dotx ddot y`);
        appnd(div, `bb{AB3}.bbb(AB].cc(AB).fr{AB}.tt[AB].sf(AB)`);
        appnd(div, `stackrel"def"= or \stackrel{\Delta}{=}" "("or ":=)`);
        appnd(div, `{::}_(\ 92)^238U`);
        appnd(div, `(cancel((x+1))(x-2))/(cancel((x+1))(x+3))`, 'what happened to cancel?');
        appnd(div, `color(red)(x^2)+3x+color(green)(4)`, 'fails for second color');
        appnd(div, `underbrace(1+2+3+4)_("4 terms") - obrace(2+3)^(n)`);
        appnd(div, '');
        appnd(div, `hat(ABC)`);
        appnd(div, `overarc(ABC)`);
        appnd(div, `overparen(ABC)`);
        appnd(div, '');
        // issue 15
        appnd(div, `log`, 'issue 15');
        appnd(div, `log_2(x)/5`);
        appnd(div, `log_2x/5`);
        appnd(div, `log_2.5x/5`);
        appnd(div, `log_2/5`);
        appnd(div, `log_sqrt(5)3/5`);
        appnd(div, `log/5`);
        appnd(div, `log^2(x)/5`);
        appnd(div, `log(x)/5`);
        appnd(div, `log/5`);
        appnd(div, `log_2(x)+5`);
        appnd(div, `log_2^5(x)+5`);
        appnd(div, `log_2+5`);
        appnd(div, `log+5`);
        appnd(div, `log^2(x)+5`);
        appnd(div, `f_3(x)/5`);
        appnd(div, `f_3/5`);
        appnd(div, `2^f-3`);
        appnd(div, `2^f_2-3`, `This is expected to display with _2 instead of a subscript`);
        appnd(div, `4(f_3)-4`);
        appnd(div, `2^(f_3/x)`);
        appnd(div, `2^(f_3(x)/5)`);
        appnd(div, `f_3theta/5`);
        appnd(div, `log_3x^2/5`);
        appnd(div, `log_3x_0/5`);
        appnd(div, '');
        // issue 42
        appnd(div, `[(1,2,3,|,4),(5,6,7, |,8)]`, 'issue 42');
        appnd(div, `[(1,2,3, | ,4,5),(5,6,7, | ,8,9)]`);
        appnd(div, `[(1,|,2,3,4),(5,|,6,7,8)]`);
        appnd(div, `[(1,|,3,|,4),(5,|,7,|,8)]`);
        appnd(div, `[(2,|x|,5),(3,|y|,4)]`, 'Absolute value in matrix:');
        appnd(div, `[(1,|,2,|x|,5),(3,|,4,|y|,7)]`);
        appnd(div, `[(1,2,3,|,4),(5,6,7,8,9)]`, 'These are for testing weird/bad input');
        appnd(div, `[(1,2,3,|,4),(5,6,7,8)]`);
        appnd(div, `[(1,2,3,4,5),(5,6,7,|,9)]`);
        appnd(div, `[(1,2,3,4),(5,6,7,|,9)]`);
        appnd(div, `[(1,2,3,|),(5,6,7,|)]`);
        appnd(div, `|x/2+3|,|x-4/5|`, 'These are testing other uses of |:');
        appnd(div, `int_2^4 2x dx = x^2|_2^4`);
        // issue 74
        appnd(div, `3+sin(x)/5-2`, 'issue 74');
        appnd(div, `3+Sin(x)/5-2`);
        appnd(div, `5+sin(x)+Sin(x)+"test Since"`);
        appnd(div, `Log(x)/3 +log(x)/3`);
        appnd(div, `Abs(3) + abs(3)`);
        // issue 77
        appnd(div, `vec(x)`, 'issue 77');
        appnd(div, `vecx`);
        appnd(div, `vecxyz`);
        appnd(div, `vec(xyx)`);
        appnd(div, `vec(x+y)`);
        appnd(div, `vec(sqrt(x))`);
        appnd(div, `vecsqrtx`);
        appnd(div, `vecsqrt3`);
        appnd(div, `vec"F"`);
        appnd(div, `hat(x)`);
        appnd(div, `hatx`);
        appnd(div, `hatxyz`);
        appnd(div, `hat(xyx)`);
        appnd(div, `ul(x)`);
        appnd(div, `ulx`);
        appnd(div, `ulxyz`);
        appnd(div, `ul(xyx)`);
        appnd(div, ``);
        // issue 94
        appnd(div, `sin(x)/5`, 'issue 94');
        appnd(div, `sin^2(x)/5`);
        appnd(div, `sin^2x/5`);
        appnd(div, `sin^2x^3/5`);
        appnd(div, `f(x)/5`);
        appnd(div, `f^2(x)/5`);
        appnd(div, `f^2x/5`);
        appnd(div, `f^2x^3/5`);
        appnd(div, `1/sin^2x^3`);
        appnd(div, `1/f^2x^3`);
        appnd(div, `1/{f^2x^3}`);
        appnd(div, `1/f^{2x^3}`);
        appnd(div, ``);
        appnd(div, `f'`);
        appnd(div, `1/f'`, 'wrong?');
        appnd(div, `1/{f'}`);
        appnd(div, ``);
        // issue 133
        appnd(div, `1 !-= 3`, 'issue 133');
        appnd(div, `1 \\not\\equiv 3`);
        appnd(div, `1 notequiv 3`);
        appnd(div, ``);
        // issue 136
        appnd(div, `3 !sub A`, 'issue 136');
        appnd(div, `3 \\not\\subset A`);
        appnd(div, `3 notsubset A`);
        appnd(div, `3 not\subset A`);
        appnd(div, `3 !sup A`);
        appnd(div, `3 \\not\\supset A`);
        appnd(div, `3 notsupset A`);
        appnd(div, `3 not\supset A`);
        appnd(div, `3 !sube A`);
        appnd(div, `3 \\not\\subseteq A`);
        appnd(div, `3 notsubseteq A`);
        appnd(div, `3 not\\subseteq A`);
        appnd(div, `3 !supe A`);
        appnd(div, `3 \\not\\supseteq A`);
        appnd(div, `3 notsupseteq A`);
        appnd(div, `3 not\\supseteq A`);
        appnd(div, ``);
        appnd(div, 'a = 2pir^2');
        d.appendChild(div);
    }
}
function appnd(div, expr, comment = '') {
    let tr = document.createElement('tr');
    div.appendChild(tr);
    // plaintext
    let td1 = document.createElement('td');
    td1.innerHTML = expr;
    tr.appendChild(td1);
    // converted by new asciimathml
    let td2 = document.createElement('td');
    tr.appendChild(td2);
    let math = am.parseMath(expr);
    td2.appendChild(math);
    // let old asciimathml convert this one
    let td3 = document.createElement('td');
    td3.innerHTML = '`' + expr;
    tr.appendChild(td3);
    // td2.appendChild(am.parseMath(expr))
    // let p =  document.createElement('p')
    // p.innerHTML = 'tom'
    // td2.appendChild(p)
    let td4 = document.createElement('td');
    tr.appendChild(td4);
    td4.innerHTML = comment;
}
