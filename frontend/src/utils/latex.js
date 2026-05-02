const LATEX_COMMANDS = [
  'frac', 'dfrac', 'tfrac', 'sqrt', 'sum', 'prod', 'int', 'iint', 'iiint',
  'lim', 'sin', 'cos', 'tan', 'cot', 'log', 'ln', 'exp',
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta',
  'theta', 'vartheta', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
  'tau', 'phi', 'varphi', 'chi', 'psi', 'omega',
  'le', 'leq', 'ge', 'geq', 'neq', 'approx', 'sim', 'equiv',
  'times', 'div', 'pm', 'mp', 'cdot', 'circ', 'bullet',
  'vec', 'overrightarrow', 'hat', 'bar', 'overline', 'dot', 'ddot', 'tilde',
  'left', 'right', 'big', 'Big', 'bigg', 'Bigg',
  'begin', 'end', 'text', 'textrm', 'mathrm', 'mathbf', 'mathbb', 'mathcal',
  'partial', 'nabla', 'infty', 'exists', 'forall', 'in', 'notin', 'cup', 'cap',
  'subset', 'supset', 'subseteq', 'supseteq', 'to', 'rightarrow', 'leftarrow',
  'Rightarrow', 'Leftarrow', 'Leftrightarrow',
  'angle', 'triangle', 'parallel', 'perp', 'degree'
];

const LATEX_COMMAND_PATTERN = new RegExp(`\\\\\\\\(?=(${LATEX_COMMANDS.join('|')})\\b)`, 'g');
const BARE_LATEX_COMMAND_PATTERN = new RegExp(`\\\\(?:${LATEX_COMMANDS.join('|')})\\b`);

const MATH_SYMBOLS = [
  [/≤/g, '\\leq'],
  [/≥/g, '\\geq'],
  [/≠/g, '\\neq'],
  [/≈/g, '\\approx'],
  [/±/g, '\\pm'],
  [/∓/g, '\\mp'],
  [/×/g, '\\times'],
  [/÷/g, '\\div'],
  [/·/g, '\\cdot'],
  [/∞/g, '\\infty'],
  [/→/g, '\\to'],
  [/←/g, '\\leftarrow'],
  [/⇒/g, '\\Rightarrow'],
  [/⇔/g, '\\Leftrightarrow'],
  [/∈/g, '\\in'],
  [/∉/g, '\\notin'],
  [/∪/g, '\\cup'],
  [/∩/g, '\\cap'],
  [/⊂/g, '\\subset'],
  [/⊆/g, '\\subseteq'],
  [/⊃/g, '\\supset'],
  [/⊇/g, '\\supseteq'],
  [/∑/g, '\\sum'],
  [/∏/g, '\\prod'],
  [/∫/g, '\\int'],
  [/∂/g, '\\partial'],
  [/∇/g, '\\nabla'],
  [/∠/g, '\\angle'],
  [/⊥/g, '\\perp'],
  [/∥/g, '\\parallel'],
  [/°/g, '^{\\circ}'],
  [/≤/g, '\\leq'],
  [/≥/g, '\\geq'],
  [/≠/g, '\\neq'],
  [/≈/g, '\\approx'],
  [/±/g, '\\pm'],
  [/∓/g, '\\mp'],
  [/×/g, '\\times'],
  [/÷/g, '\\div'],
  [/·/g, '\\cdot'],
  [/∞/g, '\\infty'],
  [/→/g, '\\to'],
  [/←/g, '\\leftarrow'],
  [/⇒/g, '\\Rightarrow'],
  [/⇔/g, '\\Leftrightarrow'],
  [/∈/g, '\\in'],
  [/∉/g, '\\notin'],
  [/∪/g, '\\cup'],
  [/∩/g, '\\cap'],
  [/⊂/g, '\\subset'],
  [/⊆/g, '\\subseteq'],
  [/⊃/g, '\\supset'],
  [/⊇/g, '\\supseteq'],
  [/∑/g, '\\sum'],
  [/∏/g, '\\prod'],
  [/∫/g, '\\int'],
  [/∂/g, '\\partial'],
  [/∇/g, '\\nabla'],
  [/∠/g, '\\angle'],
  [/⊥/g, '\\perp'],
  [/∥/g, '\\parallel'],
  [/°/g, '^{\\circ}']
];

const OCR_MATH_SYMBOLS = [
  [/\u2264/g, '\\leq'],
  [/\u2265/g, '\\geq'],
  [/\u2260/g, '\\neq'],
  [/\u2248/g, '\\approx'],
  [/\u00b1/g, '\\pm'],
  [/\u2213/g, '\\mp'],
  [/\u00d7/g, '\\times'],
  [/\u00f7/g, '\\div'],
  [/\u00b7/g, '\\cdot'],
  [/\u221e/g, '\\infty'],
  [/\u2192/g, '\\to'],
  [/\u2190/g, '\\leftarrow'],
  [/\u21d2/g, '\\Rightarrow'],
  [/\u21d4/g, '\\Leftrightarrow'],
  [/\u2208/g, '\\in'],
  [/\u2209/g, '\\notin'],
  [/\u222a/g, '\\cup'],
  [/\u2229/g, '\\cap'],
  [/\u2211/g, '\\sum'],
  [/\u220f/g, '\\prod'],
  [/\u222b/g, '\\int'],
  [/\u222c/g, '\\iint'],
  [/\u222d/g, '\\iiint'],
  [/\u221a/g, '\\sqrt'],
  [/\u2206/g, '\\Delta'],
  [/\u0394/g, '\\Delta'],
  [/\u03b1/g, '\\alpha'],
  [/\u03b2/g, '\\beta'],
  [/\u03b8/g, '\\theta'],
  [/\u2220/g, '\\angle'],
  [/\u03c0/g, '\\pi'],
  [/\u03a0/g, '\\Pi'],
  [/\u00b2/g, '^2'],
  [/\u00b3/g, '^3'],
  [/\u00b0/g, '^{\\circ}'],
  [/\uf03d/g, '='],
  [/\uf02b/g, '+'],
  [/\uf02d/g, '-'],
  [/\uf0d7/g, '\\times'],
  [/\uf0b7/g, '\\cdot'],
  [/\uf0b0/g, '^{\\circ}'],
  [/\uf061/g, '\\alpha'],
  [/\uf062/g, '\\beta'],
  [/\uf071/g, '\\theta'],
  [/\uf070/g, '\\pi'],
  [/\uf0a2/g, "'"],
  [/\uf0de/g, '\\Rightarrow']
];

const ALL_MATH_SYMBOLS = [...OCR_MATH_SYMBOLS, ...MATH_SYMBOLS];

function stripLatexDocumentWrapper(content) {
  if (!content) return '';

  let processed = String(content)
    .replace(/^```latex\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');

  if (!/\\begin\{document\}/.test(processed)) {
    return processed;
  }

  processed = processed
    .replace(/^[\s\S]*?\\begin\{document\}/, '')
    .replace(/\\end\{document\}[\s\S]*$/, '');

  return processed
    .replace(/\\section\*?\{([^{}]*)\}/g, '\n# $1\n')
    .replace(/\\subsection\*?\{([^{}]*)\}/g, '\n## $1\n')
    .replace(/\\subsubsection\*?\{([^{}]*)\}/g, '\n### $1\n')
    .replace(/\\begin\{(?:enumerate|itemize)\}/g, '\n')
    .replace(/\\end\{(?:enumerate|itemize)\}/g, '\n')
    .replace(/\\item\s+/g, '- ')
    .replace(/\\begin\{center\}/g, '\n')
    .replace(/\\end\{center\}/g, '\n')
    .replace(/\\textbf\{([^{}]*)\}/g, '**$1**')
    .replace(/\\emph\{([^{}]*)\}/g, '*$1*')
    .trim();
}

function normalizeMathSymbols(expr) {
  return ALL_MATH_SYMBOLS.reduce((value, [pattern, replacement]) => {
    return value.replace(pattern, ` ${replacement} `);
  }, expr);
}

function normalizeLatexExpression(expr) {
  if (!expr) return '';

  let normalized = String(expr)
    .replace(/\r\n?/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  normalized = normalized.replace(LATEX_COMMAND_PATTERN, '\\');
  normalized = normalized.replace(/\\\\\$/g, '$');
  normalized = normalized.replace(/\\&/g, '&');
  normalized = normalizeMathSymbols(normalized);
  normalized = normalized.replace(/\s*\n\s*/g, ' ');
  normalized = normalized.replace(/\\pi\s+\\pi(?=\s*\\int(?:\b|_|\^|\s|$))/g, '\\pi');

  // Keep LaTeX environment row separators intact while removing noisy padding.
  normalized = normalized.replace(/[ \t]+\\\\[ \t]+/g, ' \\\\ ');
  normalized = normalized.replace(/[ \t]{2,}/g, ' ');
  normalized = normalized.replace(/\{\s+/g, '{').replace(/\s+\}/g, '}');

  return normalized.trim();
}

function splitCodeSegments(content) {
  const segments = [];
  const source = String(content);
  const pattern = /(```[\s\S]*?```|`[^`\n]*`)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: source.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    segments.push({ type: 'text', value: source.slice(lastIndex) });
  }

  return segments;
}

function normalizeMathDelimiters(content) {
  let processed = content.replace(/\r\n?/g, '\n');

  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, expr) => {
    return `\n$$\n${normalizeLatexExpression(expr)}\n$$\n`;
  });
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, expr) => {
    return `$${normalizeLatexExpression(expr)}$`;
  });

  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => {
    return `\n$$\n${normalizeLatexExpression(expr)}\n$$\n`;
  });
  processed = processed.replace(/(^|[^$])\$([^$]+?)\$([^$]|$)/g, (_, before, expr, after) => {
    return `${before}$${normalizeLatexExpression(expr)}$${after}`;
  });

  processed = processed.replace(/\$\$\$/g, '$$');
  processed = processed.replace(/([^\n])\n?\$\$/g, '$1\n$$');
  processed = processed.replace(/\$\$\n?([^\n])/g, '$$\n$1');
  processed = processed.replace(/\n{3,}/g, '\n\n');

  return processed;
}

function wrapBareLatexSegments(content) {
  const mathDelimitedPattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mathDelimitedPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'math', value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts.map((part) => {
    if (part.type === 'math') return part.value;

    return part.value
      .replace(/\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\1\}/g, (expr) => {
        return `\n$$\n${normalizeLatexExpression(expr)}\n$$\n`;
      })
      .replace(/\\[a-zA-Z]+(?:\*?)?(?:\s*(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\[[^\]]*\]|_[A-Za-z0-9{}]+|\^[A-Za-z0-9{}]+|\([^)]+\)|[A-Za-z0-9]+))*/g, (expr) => {
        if (!BARE_LATEX_COMMAND_PATTERN.test(expr)) return expr;
        return `$${normalizeLatexExpression(expr)}$`;
      });
  }).join('');
}

function looksLikeBareFormulaLine(line) {
  const value = line.trim();
  if (!value || value.includes('$') || value.length > 180) return false;
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(value)) return false;
  if (!/[=^_+\-*/<>|]|\\[a-zA-Z]+|[≤≥≠≈±×÷∞→⇒∫∑√πΠαβθΔ]/u.test(value)) return false;
  return /[=]|\\(?:frac|sqrt|int|sum|prod|lim|sin|cos|tan|log|ln|pi)\b|[∫∑√π]/u.test(value);
}

function wrapBareFormulaLines(content) {
  return String(content)
    .split('\n')
    .map((line) => {
      if (!looksLikeBareFormulaLine(line)) return line;
      return `$$\n${normalizeLatexExpression(line)}\n$$`;
    })
    .join('\n');
}

function wrapBareInlineFormulas(content) {
  return String(content)
    .split('\n')
    .map((line) => {
      if (!line || line.includes('$')) return line;

      return line
        .replace(/([A-Za-z][A-Za-z0-9_']*\s*=\s*[^,.;:\n]*(?:[∫∑√π²³]|\\(?:int|frac|sqrt|sum|pi)\b|\^)[^,.;:\n]*)/gu, (expr) => {
          return `$${normalizeLatexExpression(expr)}$`;
        })
        .replace(/([π∫√]\s*[^,.;:\n]*?(?:dx|dy|dt|du|dv|d[A-Za-z]))/gu, (expr) => {
          return `$${normalizeLatexExpression(expr)}$`;
        });
    })
    .join('\n');
}

function normalizeLatexContent(content, options = {}) {
  if (!content) return '';

  const { wrapBareLatex = true } = options;
  const source = stripLatexDocumentWrapper(content);

  return splitCodeSegments(source)
    .map((segment) => {
      if (segment.type === 'code') return segment.value;
      const normalized = normalizeMathDelimiters(segment.value);
      const withInlineFormulas = wrapBareInlineFormulas(normalized);
      const withFormulaLines = wrapBareFormulaLines(withInlineFormulas);
      return wrapBareLatex ? wrapBareLatexSegments(withFormulaLines) : withFormulaLines;
    })
    .join('');
}

function splitMathSegments(content) {
  const normalized = normalizeLatexContent(content);
  const segments = [];
  const pattern = /\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: normalized.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      segments.push({ type: 'block', content: normalizeLatexExpression(match[1]) });
    } else {
      segments.push({ type: 'inline', content: normalizeLatexExpression(match[2]) });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    segments.push({ type: 'text', content: normalized.slice(lastIndex) });
  }

  return segments;
}

function stripLatexForPlainText(content) {
  return normalizeLatexContent(content)
    .replace(/\$\$([\s\S]*?)\$\$/g, ' ')
    .replace(/\$([^$\n]+?)\$/g, ' ')
    .replace(/\\[a-zA-Z]+\*?(?:\{[^{}]*\})?/g, ' ')
    .replace(/[{}_^]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export {
  normalizeLatexContent,
  normalizeLatexExpression,
  splitMathSegments,
  stripLatexDocumentWrapper,
  stripLatexForPlainText
};
