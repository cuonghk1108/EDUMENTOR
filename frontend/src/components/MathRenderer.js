import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * MathRenderer - Render Markdown with beautiful LaTeX formulas
 * Supports both inline ($...$) and block ($$...$$) math
 * Auto-fixes common LaTeX formula errors
 */
const MathRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  // Pre-process content to handle common LaTeX patterns
  const processedContent = preprocessMath(content);

  return (
    <div className={`math-content prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">
              {children}
            </h3>
          ),
          // Custom paragraph
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">
              {children}
            </p>
          ),
          // Custom list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          // Code blocks
          code: ({ inline, className, children }) => {
            if (inline) {
              return (
                <code className="bg-gray-100 text-primary-600 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                <code className={className}>{children}</code>
              </pre>
            );
          },
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-primary-50 rounded-r-lg italic text-gray-700">
              {children}
            </blockquote>
          ),
          // Table
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-700 border-b border-gray-100">
              {children}
            </td>
          ),
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-gray-700 italic">{children}</em>
          ),
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-primary-600 hover:text-primary-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-t-2 border-gray-200" />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

/**
 * Pre-process content to fix common LaTeX issues
 */
function preprocessMath(content) {
  if (!content) return '';
  
  let processed = content;
  
  // Step 1: Fix common escaped patterns from JSON stringification
  // \\ -> \ for common LaTeX commands
  processed = processed.replace(/\\\\(frac|sqrt|sum|int|lim|sin|cos|tan|log|ln|alpha|beta|gamma|delta|theta|pi|omega|leq|geq|neq|times|div|pm|mp|cdot|vec|hat|bar|dot|ddot|tilde|left|right|begin|end|text|mathrm|mathbf|partial|nabla|infty|exist|forall)\b/g, '\\$1');
  
  // Step 2: Handle triple+ escaped backslashes
  while (processed.includes('\\\\\\\\')){
    processed = processed.replace(/\\\\\\\\/g, '\\\\');
  }
  
  // Step 3: Fix spaces within LaTeX environments - remove trailing spaces before closing delimiters
  processed = processed.replace(/\{([^}]*?)\s+\}/g, '{$1}');
  processed = processed.replace(/\(\s+/g, '(');
  processed = processed.replace(/\s+\)/g, ')');
  
  // Step 4: Fix common patterns that cause rendering issues
  // Ensure proper spacing around $$ blocks
  processed = processed.replace(/([^\s])\$\$([^\s])/g, '$1 $$ $2');
  
  // Step 5: Fix inline math spacing - no spaces immediately after opening $ or before closing $
  processed = processed.replace(/\$\s+/g, '$');
  processed = processed.replace(/\s+\$/g, '$');
  
  // Step 6: Ensure math blocks are on their own lines
  processed = processed.replace(/([^\\n])\$\$\n/g, '$1\n$$\n');
  processed = processed.replace(/\$\$\n([^\\n])/g, '$$\n\n$1');
  
  // Step 7: Fix broken LaTeX: remove spaces before commas/periods in fractions
  processed = processed.replace(/\\frac\{\s*([^}]+?)\s*\}\s*\{\s*([^}]+?)\s*\}/g, '\\frac{$1}{$2}');
  
  // Step 8: Fix common escaping issues in array/environment content
  // E.g., "col 1 & col 2" might become "col 1 \\& col 2" -> fix it
  processed = processed.replace(/\\&/g, '&');
  
  // Step 9: Fix double dollar signs that might be escaped
  processed = processed.replace(/\$\$\$/g, '$$');
  
  // Step 10: Remove duplicate backslashes before dollar signs (common in JSON)
  processed = processed.replace(/\\\\\$/g, '$');
  
  return processed;
}

export default MathRenderer;

