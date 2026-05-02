import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { normalizeLatexContent } from '../utils/latex';

/**
 * MathRenderer - Render Markdown with beautiful LaTeX formulas
 * Supports both inline ($...$) and block ($$...$$) math
 * Auto-fixes common LaTeX formula errors
 */
const MathRenderer = ({ content, className = '', as: Component = 'div' }) => {
  if (!content) return null;

  // Pre-process content to handle common LaTeX patterns
  const processedContent = normalizeLatexContent(content);

  return (
    <Component className={`math-content formula-premium prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={{
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-inherit mt-8 mb-4 pb-2 border-b border-current/20">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-inherit mt-6 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-inherit mt-4 mb-2">
              {children}
            </h3>
          ),
          // Custom paragraph
          p: ({ children }) => (
            <p className="text-inherit leading-relaxed mb-4">
              {children}
            </p>
          ),
          // Custom list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-inherit">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-inherit">
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
            <td className="px-4 py-2 text-inherit border-b border-gray-100">
              {children}
            </td>
          ),
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-inherit">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-inherit italic">{children}</em>
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
    </Component>
  );
};

export default MathRenderer;

