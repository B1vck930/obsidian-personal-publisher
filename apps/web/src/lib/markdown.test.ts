import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders headings", () => {
    expect(renderMarkdown("# Hello")).toContain("<h1>Hello</h1>");
  });

  it("renders tables", () => {
    const html = renderMarkdown("| A | B |\n| --- | --- |\n| 1 | 2 |");

    expect(html).toContain("<table>");
    expect(html).toContain("<th>A</th>");
    expect(html).toContain("<td>2</td>");
  });

  it("renders images", () => {
    expect(renderMarkdown("![Alt](https://example.com/a.png)")).toContain(
      '<img src="https://example.com/a.png" alt="Alt">'
    );
  });

  it("renders fenced code blocks", () => {
    const html = renderMarkdown("```ts\nconst x = 1;\n```");

    expect(html).toContain('<code class="language-ts">');
    expect(html).toContain("const x = 1;");
  });

  it("renders simple Obsidian callouts safely", () => {
    const html = renderMarkdown("> [!NOTE] Heads up\n> <script>alert(1)</script>");

    expect(html).toContain("callout-note");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
});
