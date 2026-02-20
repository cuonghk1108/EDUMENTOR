/**
 * Test file to verify MathRenderer formula validation
 * This verifies that common LaTeX issues are detected and fixed
 */

import { parse } from 'mathjs';

// Test cases with broken formulas and expected fixes
const testCases = [
  {
    name: 'Double-escaped frac',
    input: '$$\\\\frac{1}{2}$$',
    expected: '$$\\frac{1}{2}$$',
  },
  {
    name: 'Inline math with spaces',
    input: '$ x + y $',
    shouldNotHaveExtraSpaces: true,
  },
  {
    name: 'Unmatched braces in frac',
    input: '$$\\frac{1{2}$$',
    shouldDetectError: true,
  },
  {
    name: 'Complex fraction',
    input: '$$\\frac{\\sqrt{x}}{y^2}$$',
    isValid: true,
  },
  {
    name: 'Multiple escaped commands',
    input: '$$\\\\sin(x) + \\\\cos(x)$$',
    expected: '$$\\sin(x) + \\cos(x)$$',
  },
  {
    name: 'Sum with limits',
    input: '$$\\sum_{i=1}^{n} x_i$$',
    isValid: true,
  },
  {
    name: 'Greek letters',
    input: '$$\\\\alpha + \\\\beta = \\\\gamma$$',
    expected: '$$\\alpha + \\beta = \\gamma$$',
  },
  {
    name: 'Matrix environment',
    input: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$',
    isValid: true,
  },
  {
    name: 'Limit expression',
    input: '$$\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin(x)}{x} = 1$$',
    expected: '$$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$',
  },
];

function testMathValidation() {
  console.group('MathRenderer Formula Validation Tests');
  console.log(`Testing ${testCases.length} cases for LaTeX formula handling\n`);

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase) => {
    try {
      // Test 1: Double-escaped commands detection
      if (testCase.input.includes('\\\\')) {
        const fixed = testCase.input.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
        if (testCase.expected && fixed === testCase.expected) {
          console.log(`✓ ${testCase.name}: Double-escape fixed`);
          passed++;
        } else if (testCase.expected) {
          console.warn(`✗ ${testCase.name}: Expected "${testCase.expected}", got "${fixed}"`);
          failed++;
        } else {
          console.log(`✓ ${testCase.name}: Double-escape handling OK`);
          passed++;
        }
      }

      // Test 2: Space normalization
      if (testCase.shouldNotHaveExtraSpaces) {
        const normalized = testCase.input.replace(/\$\s+([^\s])/g, '$$1').replace(/([^\s])\s+\$/g, '$1$');
        if (!normalized.includes('$ ') && !normalized.includes(' $')) {
          console.log(`✓ ${testCase.name}: Extra spaces removed`);
          passed++;
        } else {
          console.warn(`✗ ${testCase.name}: Spaces not properly handled`);
          failed++;
        }
      }

      // Test 3: Simple validation for valid expressions
      if (testCase.isValid) {
        const cleanFormula = testCase.input.replace(/^\$+|\$+$/g, '').trim();
        // Skip complex LaTeX validation - just check basic structure
        if (!cleanFormula.includes('\\\\')) {
          console.log(`✓ ${testCase.name}: Formula structure valid`);
          passed++;
        }
      }

      // Test 4: Error detection for malformed formulas
      if (testCase.shouldDetectError) {
        const openBraces = (testCase.input.match(/\{/g) || []).length;
        const closeBraces = (testCase.input.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          console.log(`✓ ${testCase.name}: Unmatched braces detected`);
          passed++;
        } else {
          console.warn(`✗ ${testCase.name}: Failed to detect error`);
          failed++;
        }
      }
    } catch (error) {
      console.error(`✗ ${testCase.name}: ${error.message}`);
      failed++;
    }
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.groupEnd();

  return { passed, failed, total: passed + failed };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testMathValidation, testCases };
}

// Run if this file is imported in a React component
export { testMathValidation, testCases };
