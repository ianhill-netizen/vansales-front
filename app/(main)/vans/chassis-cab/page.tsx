import { CategoryPage, categoryMetadata } from "@/components/seo/category-page";

export const revalidate = 3600;

export const generateMetadata = () => categoryMetadata("chassis-cab");

export default function Page() {
  return <CategoryPage slug="chassis-cab" />;
}
