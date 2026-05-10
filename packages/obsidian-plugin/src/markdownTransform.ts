export function extractTitle(markdown: string, fallbackTitle: string): string {
  const heading = markdown
    .split(/\r?\n/)
    .map((line) => line.match(/^#\s+(.+)$/)?.[1]?.trim())
    .find((title): title is string => Boolean(title));

  return heading ?? fallbackTitle;
}
