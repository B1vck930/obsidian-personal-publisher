import { describe, expect, it } from "vitest";
import {
  extractTitle,
  formatPublishPreviewNotice,
  transformMarkdownAssets
} from "../src/markdownTransform";

describe("extractTitle", () => {
  it("uses the first H1", () => {
    expect(extractTitle("# Example\n\nBody", "fallback")).toBe("Example");
  });

  it("falls back when no H1 exists", () => {
    expect(extractTitle("Body", "fallback")).toBe("fallback");
  });
});

describe("formatPublishPreviewNotice", () => {
  it("shows asset and warning counts", () => {
    expect(
      formatPublishPreviewNotice("Image Test", {
        assetPaths: ["image.png"],
        warnings: []
      })
    ).toBe(
      [
        'Publish preview ready for "Image Test".',
        "Local assets detected: 1.",
        "Warnings: 0.",
        "Backend publishing is not implemented yet."
      ].join("\n")
    );
  });

  it("shows the first warning message", () => {
    expect(
      formatPublishPreviewNotice("Image Test", {
        assetPaths: ["missing.png"],
        warnings: [
          {
            message: "Missing local image: missing.png",
            path: "missing.png",
            reason: "missing"
          }
        ]
      })
    ).toBe(
      [
        'Publish preview ready for "Image Test".',
        "Local assets detected: 1.",
        "Warnings: 1.",
        "Missing local image: missing.png",
        "Backend publishing is not implemented yet."
      ].join("\n")
    );
  });
});

describe("transformMarkdownAssets", () => {
  it("extracts and transforms Obsidian wiki image syntax", () => {
    const result = transformMarkdownAssets("Before\n![[image.png]]\nAfter");

    expect(result.markdown).toBe("Before\n![image.png](image.png)\nAfter");
    expect(result.assetPaths).toEqual(["image.png"]);
    expect(result.references).toMatchObject([
      { alt: "image.png", path: "image.png", syntax: "wiki" }
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("extracts Obsidian wiki image paths inside folders", () => {
    const result = transformMarkdownAssets("![[folder/image.png]]");

    expect(result.markdown).toBe("![image.png](folder/image.png)");
    expect(result.assetPaths).toEqual(["folder/image.png"]);
  });

  it("extracts Obsidian wiki width syntax", () => {
    const result = transformMarkdownAssets("![[image.png|400]]");

    expect(result.markdown).toBe("![image.png](image.png)");
    expect(result.assetPaths).toEqual(["image.png"]);
    expect(result.references[0]).toMatchObject({
      path: "image.png",
      syntax: "wiki",
      width: "400"
    });
  });

  it("extracts standard Markdown image syntax", () => {
    const result = transformMarkdownAssets("![alt](image.png)");

    expect(result.markdown).toBe("![alt](image.png)");
    expect(result.assetPaths).toEqual(["image.png"]);
    expect(result.references).toMatchObject([
      { alt: "alt", path: "image.png", syntax: "markdown" }
    ]);
  });

  it("extracts standard Markdown image paths inside folders", () => {
    const result = transformMarkdownAssets("![alt](folder/image.png)");

    expect(result.markdown).toBe("![alt](folder/image.png)");
    expect(result.assetPaths).toEqual(["folder/image.png"]);
  });

  it("replaces local image paths with mapped remote URLs", () => {
    const result = transformMarkdownAssets("![[image.png]]\n![alt](folder/a.webp)", {
      assetUrlMap: {
        "folder/a.webp": "https://cdn.example.com/a.webp",
        "image.png": "https://cdn.example.com/image.png"
      }
    });

    expect(result.markdown).toBe(
      "![image.png](https://cdn.example.com/image.png)\n![alt](https://cdn.example.com/a.webp)"
    );
    expect(result.assetPaths).toEqual(["image.png", "folder/a.webp"]);
  });

  it("returns warnings for missing supported images", () => {
    const result = transformMarkdownAssets("![[missing.png]]", {
      isAssetAvailable: () => false
    });

    expect(result.assetPaths).toEqual(["missing.png"]);
    expect(result.warnings).toEqual([
      {
        message: "Missing local image: missing.png",
        path: "missing.png",
        reason: "missing"
      }
    ]);
  });

  it("returns warnings for unsupported local image references", () => {
    const result = transformMarkdownAssets("![[document.pdf]]");

    expect(result.markdown).toBe("![[document.pdf]]");
    expect(result.assetPaths).toEqual([]);
    expect(result.warnings).toEqual([
      {
        message: "Unsupported image type: document.pdf",
        path: "document.pdf",
        reason: "unsupported"
      }
    ]);
  });

  it("ignores remote Markdown image URLs", () => {
    const result = transformMarkdownAssets("![alt](https://example.com/image.png)");

    expect(result.markdown).toBe("![alt](https://example.com/image.png)");
    expect(result.assetPaths).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});
