function appendToDisplay(value) {
    document.getElementById('display').value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function calculate() {
    try {
        let expression = document.getElementById('display').value;
        expression = expression.replace(/\^/g, '**');
        let result = math.evaluate(expression);
        if (result && typeof result.toString === 'function') {
            document.getElementById('display').value = result.toString();
        } else {
            document.getElementById('display').value = result;
        }
    } catch (error) {
        document.getElementById('display').value = 'Error';
    }
}

function solveEquation() {
    try {
        let expr = document.getElementById('display').value;
        let sides = expr.split('=');
        if (sides.length !== 2) throw new Error('Equation must contain "="');
        let equation = sides[0] + ' - (' + sides[1] + ')';
        let x = math.parse(equation).compile();
        let scope = { x: 0 };
        let roots = [];
        
        for (let i = -10; i <= 10; i += 0.1) {
            scope.x = i;
            let val = x.evaluate(scope);
            if (Math.abs(val) < 0.01) {
                roots.push(Number(i.toFixed(2)));
            }
        }
        roots = [...new Set(roots)];
        document.getElementById('display').value = roots.length ? 'x = ' + roots.join(', ') : 'No real roots';
    } catch (error) {
        document.getElementById('display').value = 'Error: Invalid equation';
    }
}

function solveLinearSystem() {
    try {
        let expr = document.getElementById('display').value;
        let equations = expr.split(',');
        let A = [];
        let b = [];
        equations.forEach(eq => {
            let [left, right] = eq.split('=').map(s => s.trim());
            let node = math.parse(left + ' - (' + right + ')');
            let coeffs = { x: 0, y: 0 };
            node.traverse((n) => {
                if (n.isSymbolNode) {
                    coeffs[n.name] = 1;
                } else if (n.isOperatorNode && n.op === '*') {
                    if (n.args[0].isConstantNode && n.args[1].isSymbolNode) {
                        coeffs[n.args[1].name] = n.args[0].value;
                    }
                }
            });
            A.push([coeffs.x || 0, coeffs.y || 0]);
            b.push(math.evaluate(right));
        });
        let solution = math.lusolve(A, b);
        document.getElementById('display').value = `x = ${solution[0].toFixed(2)}, y = ${solution[1].toFixed(2)}`;
    } catch (error) {
        document.getElementById('display').value = 'Error: Invalid system';
    }
}