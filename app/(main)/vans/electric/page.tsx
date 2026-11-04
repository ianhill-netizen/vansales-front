import { CategoryPage, categoryMetadata } from "@/components/seo/category-page";

export const revalidate = 3600;

export const generateMetadata = () => categoryMetadata("electric");

export default function Page() {
  return <CategoryPage slug="electric" />;
}
