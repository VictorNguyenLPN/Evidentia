import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2.5">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-base sm:text-xl font-bold text-indigo-900 mt-6 mb-3">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-sm sm:text-base font-semibold text-slate-900 mt-3 mb-1.5">
            {children}
        </h4>
    ),
    p: ({ children }) => (
        <p className="mb-3 leading-relaxed text-slate-800">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="list-disc list-outside pl-10 my-2.5 space-y-1.5 text-slate-800">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-outside pl-10 my-2.5 space-y-1.5 text-slate-800 font-medium">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="leading-relaxed pl-1">
            <span className="font-normal text-slate-800">{children}</span>
        </li>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold text-slate-900">
            {children}
        </strong>
    ),
    em: ({ children }) => (
        <em className="italic text-slate-700">
            {children}
        </em>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/60 px-4 py-2.5 my-3 rounded-r-xl text-slate-700 italic text-sm sm:text-base">
            {children}
        </blockquote>
    ),
    code: ({ node, className, children, ...props }: any) => {
        return (
            <code
                className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-xs font-semibold border border-slate-200/60"
                {...props}
            >
                {children}
            </code>
        );
    },
    pre: ({ children }) => (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-3 text-xs font-mono border border-slate-800 shadow-sm">
            {children}
        </pre>
    ),
    hr: () => <hr className="my-4 border-slate-200" />,
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 font-medium"
        >
            {children}
        </a>
    ),
    table: ({ children }) => (
        <div className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody className="divide-y divide-slate-100">
            {children}
        </tbody>
    ),
    tr: ({ children }) => (
        <tr className="hover:bg-slate-50/50 transition-colors">
            {children}
        </tr>
    ),
    th: ({ children }) => (
        <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-600">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="p-3 text-sm text-slate-800">
            {children}
        </td>
    ),
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    return (
        <div className={`px-2.5 w-full text-sm sm:text-base leading-relaxed text-slate-900 ${className}`}>
            <ReactMarkdown components={markdownComponents}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
