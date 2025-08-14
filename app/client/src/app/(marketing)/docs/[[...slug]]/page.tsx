import DocsBreadcrumb from "@/components/marketing/docs/docs-breadcrumb";
import Pagination from "@/components/marketing/docs/pagination";
import Toc from "@/components/marketing/docs/toc";
import { getRoutesFlatten } from "@/lib/docs/routes-config";
import { notFound } from "next/navigation";
import { getDocsForSlug } from "@/lib/docs/markdown";
import { Typography } from "@/components/marketing/docs/typography";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function DocsPage({ params }: PageProps) {
  const pathName = (await params).slug.join("/");
  const res = await getDocsForSlug(pathName);

  if (!res) notFound();
  return (
    <div className="flex items-start gap-14">
      <div className="flex-[3] pt-10">
        <DocsBreadcrumb paths={(await params).slug} />
        <Typography>
          <h1 className="text-3xl -mt-2">{res.frontmatter.title}</h1>
          <p className="-mt-4 text-muted-foreground text-[16.5px]">
            {res.frontmatter.description}
          </p>
          <div>{res.content}</div>
          <Pagination pathname={pathName} />
        </Typography>
      </div>
      <Toc path={pathName} />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const pathName = (await params).slug.join("/");
  const res = await getDocsForSlug(pathName);
  if (!res) return null;
  const { frontmatter } = res;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
  };
}

export function generateStaticParams() {
  return getRoutesFlatten().map((item) => ({
    slug: item.href.split("/").slice(1),
  }));
}
