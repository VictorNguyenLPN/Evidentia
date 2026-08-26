import React, { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const normalizeMarkdown = (text: string): string => {
    if (!text) return '';
    // Fix merged table rows that might be formatted on a single line: '| |' -> '|\n|'
    let normalized = text.replace(/\|\s*\|\s*/g, '|\n| ');
    // Ensure table separator rows with dashes are on their own line if not preceded by newline
    normalized = normalized.replace(/([^\n])\s*(\|\s*:?-+:?\s*\|)/g, '$1\n$2');
    return normalized;
};

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-base sm:text-xl font-bold text-indigo-900 dark:text-indigo-400 mt-6 mb-3">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-3 mb-1.5">
            {children}
        </h4>
    ),
    p: ({ children }) => (
        <p className="mb-3 leading-relaxed text-slate-800 dark:text-slate-200">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="list-disc list-outside pl-10 my-2.5 space-y-1.5 text-slate-800 dark:text-slate-200">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-outside pl-10 my-2.5 space-y-1.5 text-slate-800 dark:text-slate-200 font-medium">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="leading-relaxed pl-1">
            <span className="font-normal text-slate-800 dark:text-slate-200">{children}</span>
        </li>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold text-slate-900 dark:text-white">
            {children}
        </strong>
    ),
    em: ({ children }) => (
        <em className="italic text-slate-700 dark:text-slate-300">
            {children}
        </em>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 px-4 py-2.5 my-3 rounded-r-xl text-slate-700 dark:text-slate-300 italic text-sm sm:text-base">
            {children}
        </blockquote>
    ),
    code: ({ children, ...props }) => {
        return (
            <code
                className="bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono text-xs font-semibold border border-slate-200/60 dark:border-slate-700"
                {...props}
            >
                {children}
            </code>
        );
    },
    pre: ({ children }) => (
        <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto my-3 text-xs font-mono border border-slate-800 dark:border-slate-800 shadow-sm">
            {children}
        </pre>
    ),
    hr: () => <hr className="my-4 border-slate-200 dark:border-slate-800" />,
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline underline-offset-2 font-medium"
        >
            {children}
        </a>
    ),
    table: ({ children }) => (
        <div className="overflow-x-auto my-4 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
            {children}
        </tbody>
    ),
    tr: ({ children }) => (
        <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
            {children}
        </tr>
    ),
    th: ({ children }) => (
        <th className="px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed align-top">
            {children}
        </td>
    ),
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    const formattedContent = useMemo(() => normalizeMarkdown(content), [content]);

    return (
        <div className={`px-2.5 w-full text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100 ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {formattedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
