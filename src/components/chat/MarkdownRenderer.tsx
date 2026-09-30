import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
    content: string;
}

/**
 * Renders AI message content as markdown.
 * Sanitized by rehype-sanitize — no raw HTML execution.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="ryta-markdown text-[15px] leading-7 text-[var(--ryta-text)]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                    p: (props) => (
                        <p className="mb-3 last:mb-0" {...props} />
                    ),
                    strong: (props) => (
                        <strong
                            className="font-semibold text-[var(--ryta-text)]"
                            {...props}
                        />
                    ),
                    em: (props) => (
                        <em
                            className="italic text-[var(--ryta-text-muted)]"
                            {...props}
                        />
                    ),
                    ul: (props) => (
                        <ul
                            className="list-disc pl-5 mb-3 space-y-1"
                            {...props}
                        />
                    ),
                    ol: (props) => (
                        <ol
                            className="list-decimal pl-5 mb-3 space-y-1"
                            {...props}
                        />
                    ),
                    li: (props) => <li {...props} />,
                    h1: (props) => (
                        <h1
                            className="text-lg font-semibold mb-3 mt-4 first:mt-0"
                            {...props}
                        />
                    ),
                    h2: (props) => (
                        <h2
                            className="text-base font-semibold mb-2 mt-4 first:mt-0"
                            {...props}
                        />
                    ),
                    h3: (props) => (
                        <h3
                            className="text-[15px] font-semibold mb-2 mt-3 first:mt-0"
                            {...props}
                        />
                    ),
                    code: ({
                        inline,
                        className,
                        children,
                        ...props
                    }: React.ComponentProps<"code"> & { inline?: boolean }) => {
                        if (inline) {
                            return (
                                <code
                                    className="px-1.5 py-0.5 rounded bg-[var(--ryta-surface)] text-[var(--ryta-primary)] font-mono text-[13px]"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code
                                className={`block font-mono text-[13px] leading-6 ${className ?? ""}`}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    pre: (props) => (
                        <pre
                            className="bg-[var(--ryta-surface)] border border-[var(--ryta-border)] rounded-lg p-3 my-3 overflow-x-auto text-[13px]"
                            {...props}
                        />
                    ),
                    a: (props) => (
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--ryta-primary)] underline underline-offset-2 hover:opacity-80"
                            {...props}
                        />
                    ),
                    blockquote: (props) => (
                        <blockquote
                            className="border-l-2 border-[var(--ryta-primary)] pl-3 my-3 italic text-[var(--ryta-text-muted)]"
                            {...props}
                        />
                    ),
                    hr: (props) => (
                        <hr
                            className="border-0 border-t border-[var(--ryta-border)] my-4"
                            {...props}
                        />
                    ),
                    table: (props) => (
                        <div className="overflow-x-auto my-3">
                            <table
                                className="w-full border-collapse text-sm"
                                {...props}
                            />
                        </div>
                    ),
                    th: (props) => (
                        <th
                            className="border border-[var(--ryta-border)] px-2 py-1.5 text-left font-semibold bg-[var(--ryta-surface)]"
                            {...props}
                        />
                    ),
                    td: (props) => (
                        <td
                            className="border border-[var(--ryta-border)] px-2 py-1.5"
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;