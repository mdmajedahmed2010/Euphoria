import { redirect } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryRedirectPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const queryString = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      queryString.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => queryString.append(key, v));
    }
  });
  
  const qs = queryString.toString();
  redirect(`/collections/${slug}${qs ? `?${qs}` : ""}`);
}
