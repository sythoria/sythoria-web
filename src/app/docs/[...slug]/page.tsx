import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDocBySlug } from "@/lib/docs";
import { getDocMeta, getAdjacentDocs, getAllDocSlugs } from "@/lib/docs-nav";

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({
    slug: slug.split("/"),
  }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  return params.then((p) => {
    const slug = p.slug.join("/");
    const doc = getDocBySlug(slug);
    if (!doc) return { title: "Not Found" };
    return {
      title: `${doc.title} — Sythoria Docs`,
      description: doc.description,
    };
  });
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");
  const doc = getDocBySlug(slug);

  if (!doc) notFound();

  const meta = getDocMeta(slug);
  const { prev, next } = getAdjacentDocs(slug);

  return (
    <div className="animate-fade-in">
      {meta && (
        <span className="text-xs font-medium uppercase tracking-widest text-accent">
          {meta.group}
        </span>
      )}
      <div className="markdown-body mt-2">
        <MDXRemote source={doc.content} />
      </div>

      <div className="mt-16 pt-8 border-t border-border/50 grid grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/docs/${prev.slug}`}
            className="group flex flex-col items-start gap-1 p-4 rounded-xl border border-border/50 hover:border-accent/30 hover:bg-hover transition-colors"
          >
            <span className="text-xs text-text-muted flex items-center gap-1">
              <ArrowLeft size={12} /> Previous
            </span>
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {prev.label}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className="group flex flex-col items-end gap-1 p-4 rounded-xl border border-border/50 hover:border-accent/30 hover:bg-hover transition-colors text-right"
          >
            <span className="text-xs text-text-muted flex items-center gap-1">
              Next <ArrowRight size={12} />
            </span>
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {next.label}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
