# LaTeX Formula Reference Guide for Teachers

## Quick Start

The system now automatically fixes common LaTeX formula errors. You can use any of these formats and they will display correctly:

## Common Mathematical Formulas

### Basic Operations
```latex
Inline: $x + y = z$
Block: $$x + y = z$$
```

### Fractions
```latex
Simple: $\frac{1}{2}$
Complex: $\frac{\sqrt{2}}{y^2}$
Nested: $\frac{\frac{a}{b}}{c}$
```

### Square Roots & Powers
```latex
Square root: $\sqrt{x}$
Cube root: $\sqrt[3]{x}$
Powers: $x^2, x^{n+1}, 2^{\frac{1}{2}}$
```

### Greek Letters (all automatically fixed)
```latex
α: $\alpha$
β: $\beta$  
γ: $\gamma$
δ: $\delta$
θ: $\theta$
π: $\pi$
λ: $\lambda$
```

### Summation & Integral
```latex
Sum: $\sum_{i=1}^{n} x_i$
Product: $\prod_{i=1}^{n} x_i$
Integral: $\int_0^{\infty} e^{-x^2} dx$
```

### Limits & Derivatives
```latex
Limit: $\lim_{x \to 0} \frac{\sin x}{x} = 1$
Derivative: $\frac{dy}{dx} = 2x$
Partial: $\frac{\partial f}{\partial x}$
```

### Systems & Matrices
```latex
Equation: $$\begin{cases} x + y = 5 \\ x - y = 1 \end{cases}$$
Matrix: $$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$
```

### Inequalities
```latex
Less than or equal: $x \leq y$
Greater than or equal: $x \geq y$
Not equal: $x \neq y$
Approximately: $x \approx y$
```

### Logical & Set Symbols
```latex
For all: $\forall x$
Exists: $\exists y$
Union: $A \cup B$
Intersection: $A \cap B$
Subset: $A \subset B$
```

## Automatic Fixes (No Action Needed)

The system automatically corrects these common issues:

| Problem | Before | After |
|---------|--------|-------|
| Double backslash | `\\frac{1}{2}` | `\frac{1}{2}` |
| Extra spaces | `$ x + y $` | `$x + y$` |
| Escaped Greek | `\\alpha` | `\alpha` |
| Missing spaces | `}x` | `} x` |

## Tips for Teachers

### ✅ DO:
- Use standard LaTeX syntax
- Write inline math with `$...$`
- Write block math with `$$...$$`
- Copy formulas from any LaTeX source
- Test formulas in lessons before publishing

### ❌ DON'T:
- Don't worry about double backslashes - we fix them automatically
- Don't manually escape all backslashes
- Don't use non-standard math formatting
- Don't leave unclosed braces/parentheses
- Don't worry about spacing - we normalize it

## Common Learning Topics with Formulas

### Algebra
```latex
Quadratic formula: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
Logarithms: $\log_b(x) = \frac{\ln(x)}{\ln(b)}$
Polynomials: $p(x) = a_n x^n + a_{n-1} x^{n-1} + \cdots + a_0$
```

### Calculus
```latex
Power rule: $\frac{d}{dx}[x^n] = nx^{n-1}$
Chain rule: $\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$
Mean value theorem: $f'(c) = \frac{f(b) - f(a)}{b - a}$
```

### Geometry
```latex
Pythagorean: $a^2 + b^2 = c^2$
Circle area: $A = \pi r^2$
Sphere volume: $V = \frac{4}{3}\pi r^3$
```

### Statistics
```latex
Mean: $\overline{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$
Variance: $\sigma^2 = \frac{1}{n}\sum_{i=1}^{n} (x_i - \overline{x})^2$
Standard deviation: $\sigma = \sqrt{\sigma^2}$
```

### Physics
```latex
Einstein equation: $E = mc^2$
Newton's law: $F = ma$
Kinetic energy: $KE = \frac{1}{2}mv^2$
```

## Testing Your Formulas

### Method 1: Preview in Lesson
1. Create a lesson with your formula
2. Click "Preview" to see rendering
3. Check if formula displays correctly
4. If error appears, verify your LaTeX syntax

### Method 2: Browser Console Check
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Type your formula and check for errors
4. Look for "Formula validation warning" messages

## Support

### Troubleshooting

**Formula shows as code, not math:**
- Make sure you used `$...$` or `$$...$$`
- Check for typos in LaTeX command names

**Formula renders incorrectly:**
- Verify all braces `{}` are matched
- Check that parentheses are balanced
- Ensure command names are spelled correctly

**Formula renders but looks wrong:**
- Add spaces between commands: `\sin(x)` not `\sin(x)`
- Use `\left(` and `\right)` for big parentheses
- Try breaking into smaller parts

## Resources

### LaTeX Learning
- Overleaf: https://www.overleaf.com/learn
- MathJax: https://www.mathjax.org/
- KaTeX: https://katex.org/

### Validation Tools
- The system automatically validates with mathjs
- Check browser console for validation messages
- All standard LaTeX syntax is supported

---

**Last Updated:** February 20, 2026
**System Status:** ✅ All formula rendering working correctly
