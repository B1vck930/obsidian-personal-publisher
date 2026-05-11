type ListKind = "ol" | "ul" | "task";

export function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const result = renderCodeBlock(lines, index);
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    if (isCalloutStart(line)) {
      const result = renderCallout(lines, index);
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    if (isTableStart(lines, index)) {
      const result = renderTable(lines, index);
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      const level = heading[1]?.length ?? 1;
      html.push(`<h${level}>${renderInline(heading[2] ?? "")}</h${level}>`);
      index += 1;
      continue;
    }

    if (getListKind(line)) {
      const result = renderList(lines, index);
      html.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const result = renderParagraph(lines, index);
    html.push(result.html);
    index = result.nextIndex;
  }

  return html.join("\n");
}

function renderCodeBlock(lines: string[], startIndex: number) {
  const opening = lines[startIndex] ?? "";
  const language = opening.replace(/^```/, "").trim();
  const code: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
    code.push(lines[index] ?? "");
    index += 1;
  }

  return {
    html: `<pre><code${language ? ` class="language-${escapeAttribute(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`,
    nextIndex: index < lines.length ? index + 1 : index
  };
}

function renderCallout(lines: string[], startIndex: number) {
  const firstLine = lines[startIndex] ?? "";
  const match = firstLine.match(/^>\s*\[!(\w+)\]\s*(.*)$/);
  const type = (match?.[1] ?? "note").toLowerCase();
  const title = match?.[2]?.trim() || type.toUpperCase();
  const body: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length && (lines[index] ?? "").startsWith(">")) {
    body.push((lines[index] ?? "").replace(/^>\s?/, ""));
    index += 1;
  }

  return {
    html: [
      `<aside class="callout callout-${escapeAttribute(type)}">`,
      `<div class="callout-title">${renderInline(title)}</div>`,
      body.length > 0 ? `<div class="callout-body">${renderInline(body.join("\n"))}</div>` : "",
      "</aside>"
    ]
      .filter(Boolean)
      .join(""),
    nextIndex: index
  };
}

function renderTable(lines: string[], startIndex: number) {
  const headers = splitTableRow(lines[startIndex] ?? "");
  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length && (lines[index] ?? "").includes("|")) {
    const row = splitTableRow(lines[index] ?? "");

    if (row.length === 0) {
      break;
    }

    rows.push(row);
    index += 1;
  }

  const head = headers
    .map((header) => `<th>${renderInline(header.trim())}</th>`)
    .join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${renderInline(cell.trim())}</td>`).join("")}</tr>`
    )
    .join("");

  return {
    html: `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,
    nextIndex: index
  };
}

function renderList(lines: string[], startIndex: number) {
  const kind = getListKind(lines[startIndex] ?? "") ?? "ul";
  const tag = kind === "ol" ? "ol" : "ul";
  const className = kind === "task" ? ' class="task-list"' : "";
  const items: string[] = [];
  let index = startIndex;

  while (index < lines.length && getListKind(lines[index] ?? "") === kind) {
    const line = lines[index] ?? "";
    const item = extractListItem(line, kind);
    items.push(`<li>${item}</li>`);
    index += 1;
  }

  return {
    html: `<${tag}${className}>${items.join("")}</${tag}>`,
    nextIndex: index
  };
}

function renderParagraph(lines: string[], startIndex: number) {
  const paragraph: string[] = [];
  let index = startIndex;

  while (index < lines.length && shouldContinueParagraph(lines, index)) {
    paragraph.push(lines[index] ?? "");
    index += 1;
  }

  return {
    html: `<p>${renderInline(paragraph.join(" "))}</p>`,
    nextIndex: index
  };
}

function renderInline(value: string): string {
  const escaped = escapeHtml(value);

  return escaped
    .replace(
      /!\[([^\]\n]*)\]\(([^)\n]+)\)/g,
      (_match, alt: string, rawUrl: string) => {
        const url = sanitizeUrl(rawUrl);

        if (!url) {
          return "";
        }

        return `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}">`;
      }
    )
    .replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (_match, label: string, rawUrl: string) => {
      const url = sanitizeUrl(rawUrl);

      if (!url) {
        return label;
      }

      return `<a href="${escapeAttribute(url)}" rel="nofollow noopener noreferrer">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

function shouldContinueParagraph(lines: string[], index: number): boolean {
  const line = lines[index] ?? "";

  if (!line.trim()) {
    return false;
  }

  return (
    !line.startsWith("```") &&
    !isCalloutStart(line) &&
    !isTableStart(lines, index) &&
    !line.match(/^(#{1,6})\s+(.+)$/) &&
    !getListKind(line)
  );
}

function isCalloutStart(line: string): boolean {
  return /^>\s*\[!\w+\]/.test(line);
}

function isTableStart(lines: string[], index: number): boolean {
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";

  return current.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(next);
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function getListKind(line: string): ListKind | null {
  if (/^\s*[-*]\s+\[[ xX]\]\s+/.test(line)) {
    return "task";
  }

  if (/^\s*\d+\.\s+/.test(line)) {
    return "ol";
  }

  if (/^\s*[-*]\s+/.test(line)) {
    return "ul";
  }

  return null;
}

function extractListItem(line: string, kind: ListKind): string {
  if (kind === "task") {
    const checked = /^\s*[-*]\s+\[[xX]\]/.test(line);
    const label = line.replace(/^\s*[-*]\s+\[[ xX]\]\s+/, "");

    return `<input type="checkbox" disabled${checked ? " checked" : ""}> ${renderInline(label)}`;
  }

  if (kind === "ol") {
    return renderInline(line.replace(/^\s*\d+\.\s+/, ""));
  }

  return renderInline(line.replace(/^\s*[-*]\s+/, ""));
}

function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();

  if (/^(?:javascript|data):/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
