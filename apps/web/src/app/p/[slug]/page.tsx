import { notFound } from "next/navigation";
import { getAvailablePublicPage } from "../../../lib/pages";
import { createSupabasePageRepository } from "../../../lib/supabase/pageRepository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type PublicPageProps = {
  params: {
    slug: string;
  };
};

export default async function PublicPage({ params }: PublicPageProps) {
  const page = await getAvailablePublicPage(
    createSupabasePageRepository(),
    params.slug
  );

  if (!page) {
    notFound();
  }

  return (
    <main className={`public-page public-page-${page.theme}`}>
      <article className="public-page-document">
        <h1 className="public-page-title">{page.title}</h1>
        <div
          className="public-page-content"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
        <footer className="public-page-footer">
          <div>Updated at: {formatDate(page.updated_at)}</div>
          <div>Expires at: {formatDate(page.expires_at)}</div>
          <div>{page.footer_text}</div>
        </footer>
      </article>
    </main>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date(value));
}
