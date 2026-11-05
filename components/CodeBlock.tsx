interface CodeBlockProps {
  /** Header label, e.g. a filename or "terminal". */
  title?: string;
  /** Short language chip shown on the right, e.g. "bash". */
  lang?: string;
  /** Plain text content. */
  children: string;
}

/**
 * A bordered code block with a header bar. Rendered inside `.static-prose`
 * (docs pages), where `.code-block pre` styles are scoped.
 */
export default function CodeBlock({ title, lang, children }: CodeBlockProps) {
  return (
    <figure className="code-block">
      <div className="code-block-header" aria-hidden="true">
        <span className="code-block-title">{title ?? "text"}</span>
        {lang ? <span className="code-block-lang">{lang}</span> : null}
      </div>
      <pre>
        <code>{children}</code>
      </pre>
    </figure>
  );
}
