"use client";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
function list(items: unknown, depth = 0): string {
  if (!Array.isArray(items) || depth > 10) return "";
  return items.map(item => typeof item === "string" ? `<li>${item}</li>` : item && typeof item === "object" ? `<li>${String(item.content ?? "")}<ul>${list(item.items, depth + 1)}</ul></li>` : "").join("");
}
export default function BlogContent({ content }: { content: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    let markup = content;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.blocks)) markup = parsed.blocks.map((block: { type: string; data: Record<string, unknown> }) => {
        const data = block.data || {};
        if (block.type === "header") { const level = [2, 3, 4].includes(Number(data.level)) ? Number(data.level) : 2; return `<h${level}>${String(data.text ?? "")}</h${level}>`; }
        if (block.type === "list") { const tag = data.style === "ordered" ? "ol" : "ul"; return `<${tag}>${list(data.items)}</${tag}>`; }
        if (block.type === "quote") return `<blockquote>${String(data.text ?? "")}<cite>${String(data.caption ?? "")}</cite></blockquote>`;
        if (block.type === "code") return `<pre><code>${escape(data.code)}</code></pre>`;
        return `<p>${String(data.text ?? "")}</p>`;
      }).join("");
    } catch { /* Legacy posts may contain HTML rather than EditorJS JSON. */ }
    setHtml(DOMPurify.sanitize(markup, { ALLOWED_TAGS: ["p", "br", "strong", "b", "i", "em", "u", "a", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "cite", "pre", "code"], ALLOWED_ATTR: ["href", "title"] }));
  }, [content]);
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
