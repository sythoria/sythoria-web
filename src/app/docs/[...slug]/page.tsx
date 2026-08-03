import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDocBySlug } from "@/lib/docs";
import { getDocMeta, getAdjacentDocs, getAllDocSlugs } from "@/lib/docs-nav";
import InstallGuide from "@/components/docs/InstallGuide";
import CustomBlockquote from "@/components/docs/CustomBlockquote";
import StreamingFlowDiagram from "@/components/docs/StreamingFlowDiagram";
import AgenticLoopDiagram from "@/components/docs/AgenticLoopDiagram";
import VoiceTranscriptionFlow from "@/components/docs/VoiceTranscriptionFlow";
import DirectRequestFlow from "@/components/docs/DirectRequestFlow";
import { DocHeading } from "@/components/docs/DocHeading";
import { CodeBlock } from "@/components/docs/CodeBlock";

const codeHighlightOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
  defaultLang: "text",
};

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({
    slug: slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join("/");
  const doc = getDocBySlug(slug);
  if (!doc) return { title: "Not Found" };
  return {
    title: `${doc.title} — Documentation`,
    description: doc.description,
    alternates: { canonical: `/docs/${slug}` },
    openGraph: {
      type: "article",
      url: `/docs/${slug}`,
      title: `${doc.title} — Sythoria Documentation`,
      description: doc.description,
      modifiedTime: doc.lastVerifiedDate || undefined,
    },
  };
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
      {doc.lastVerifiedDate && (
        <p className="mt-2 text-xs text-text-muted">
          Verified for{" "}
          {doc.lastVerifiedVersion || "the current desktop release"} on{" "}
          <time dateTime={doc.lastVerifiedDate}>{doc.lastVerifiedDate}</time>
        </p>
      )}
      <div className="markdown-body mt-2">
        <MDXRemote
          source={doc.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [[rehypePrettyCode, codeHighlightOptions]],
            },
          }}
          components={{
            InstallGuide,
            blockquote: CustomBlockquote,
            h2: ({ children }) => <DocHeading level={2}>{children}</DocHeading>,
            h3: ({ children }) => <DocHeading level={3}>{children}</DocHeading>,
            h4: ({ children }) => <DocHeading level={4}>{children}</DocHeading>,
            table: ({ children }) => (
              <div
                className="content-scroll-region"
                role="region"
                aria-label={`${doc.title} table`}
                tabIndex={0}
              >
                <table>{children}</table>
              </div>
            ),
            pre: CodeBlock,
            StreamingFlowDiagram,
            AgenticLoopDiagram,
            VoiceTranscriptionFlow,
            DirectRequestFlow,
          }}
        />
      </div>

      <nav
        aria-label="Previous and next documentation pages"
        className="mt-16 grid grid-cols-1 gap-4 border-t border-border/50 pt-8 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            href={`/docs/${prev.slug}`}
            className="group flex flex-col items-start gap-1 p-4 rounded-xl border border-border/50 hover:border-border hover:bg-hover transition-colors"
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
            className="group flex flex-col items-end gap-1 p-4 rounded-xl border border-border/50 hover:border-border hover:bg-hover transition-colors text-right"
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
      </nav>
    </div>
  );
}
