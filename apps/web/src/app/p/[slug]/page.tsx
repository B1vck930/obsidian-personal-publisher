import { notFound } from "next/navigation";

type PublicPageProps = {
  params: {
    slug: string;
  };
};

export default function PublicPage({ params }: PublicPageProps) {
  void params;
  notFound();
}
