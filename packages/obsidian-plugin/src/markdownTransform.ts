import type { AssetWarning, LocalAssetReference } from "./assets";

const supportedImageExtensions = new Set([
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp"
]);

export type MarkdownAssetTransformOptions = {
  assetUrlMap?: Record<string, string>;
  isAssetAvailable?: (path: string) => boolean;
};

export type MarkdownAssetTransformResult = {
  markdown: string;
  assetPaths: string[];
  references: LocalAssetReference[];
  warnings: AssetWarning[];
};

export function formatPublishPreviewNotice(
  title: string,
  assetPreview: Pick<MarkdownAssetTransformResult, "assetPaths" | "warnings">
): string {
  const firstWarning = assetPreview.warnings[0]?.message;

  return [
    `Publish preview ready for "${title}".`,
    `Local assets detected: ${assetPreview.assetPaths.length}.`,
    `Warnings: ${assetPreview.warnings.length}.`,
    ...(firstWarning ? [firstWarning] : []),
    "Backend publishing is not implemented yet."
  ].join("\n");
}

export function extractTitle(markdown: string, fallbackTitle: string): string {
  const heading = markdown
    .split(/\r?\n/)
    .map((line) => line.match(/^#\s+(.+)$/)?.[1]?.trim())
    .find((title): title is string => Boolean(title));

  return heading ?? fallbackTitle;
}

export function transformMarkdownAssets(
  markdown: string,
  options: MarkdownAssetTransformOptions = {}
): MarkdownAssetTransformResult {
  const assetPaths = new Set<string>();
  const references: LocalAssetReference[] = [];
  const warnings: AssetWarning[] = [];
  const warned = new Set<string>();

  const transformed = markdown.replace(
    /!\[([^\]\n]*)\]\(([^)\n]+)\)|!\[\[([^\]\n]+)\]\]/g,
    (
      original: string,
      markdownAlt: string | undefined,
      rawMarkdownPath: string | undefined,
      rawWikiTarget: string | undefined
    ) => {
      const reference = rawWikiTarget
        ? createWikiReference(original, rawWikiTarget)
        : createMarkdownReference(
            original,
            markdownAlt ?? "",
            rawMarkdownPath ?? ""
          );

      if (!isLocalAssetPath(reference.path)) {
        return original;
      }

      const supported = validateAssetPath(
        reference.path,
        options,
        warnings,
        warned
      );

      if (!supported) {
        return original;
      }

      assetPaths.add(reference.path);
      references.push(reference);

      return formatMarkdownImage(
        reference.alt,
        options.assetUrlMap?.[reference.path] ?? reference.path
      );
    }
  );

  return {
    markdown: transformed,
    assetPaths: Array.from(assetPaths),
    references,
    warnings
  };
}

function createMarkdownReference(
  original: string,
  alt: string,
  rawPath: string
): LocalAssetReference {
  return {
    alt,
    original,
    path: normalizeAssetPath(rawPath),
    syntax: "markdown"
  };
}

function createWikiReference(
  original: string,
  rawTarget: string
): LocalAssetReference {
  const wikiImage = parseWikiImage(rawTarget);
  const path = normalizeAssetPath(wikiImage.path);

  return {
    alt: getFallbackAlt(path),
    original,
    path,
    syntax: "wiki",
    ...(wikiImage.width ? { width: wikiImage.width } : {})
  };
}

function parseWikiImage(rawTarget: string): { path: string; width?: string } {
  const [path = "", width] = rawTarget.split("|").map((part) => part.trim());

  return {
    path,
    ...(width ? { width } : {})
  };
}

function normalizeAssetPath(path: string): string {
  return path.trim().replace(/^<(.+)>$/, "$1").replace(/\\/g, "/");
}

function validateAssetPath(
  path: string,
  options: MarkdownAssetTransformOptions,
  warnings: AssetWarning[],
  warned: Set<string>
): boolean {
  if (!isSupportedImagePath(path)) {
    addWarning(warnings, warned, {
      path,
      reason: "unsupported",
      message: `Unsupported image type: ${path}`
    });
    return false;
  }

  if (options.isAssetAvailable && !options.isAssetAvailable(path)) {
    addWarning(warnings, warned, {
      path,
      reason: "missing",
      message: `Missing local image: ${path}`
    });
  }

  return true;
}

function addWarning(
  warnings: AssetWarning[],
  warned: Set<string>,
  warning: AssetWarning
) {
  const key = `${warning.reason}:${warning.path}`;

  if (warned.has(key)) {
    return;
  }

  warned.add(key);
  warnings.push(warning);
}

function isLocalAssetPath(path: string): boolean {
  return !/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(path);
}

function isSupportedImagePath(path: string): boolean {
  const cleanPath = path.split(/[?#]/, 1)[0] ?? path;
  const extension = cleanPath.split(".").pop()?.toLowerCase();

  return extension ? supportedImageExtensions.has(extension) : false;
}

function getFallbackAlt(path: string): string {
  return path.split("/").pop() ?? path;
}

function formatMarkdownImage(alt: string, path: string): string {
  return `![${alt}](${path})`;
}
