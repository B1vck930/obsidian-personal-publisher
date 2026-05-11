export function buildPublicPageUrl(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/p/${encodeURIComponent(slug)}`;
}
