import { CategoryPage, categoryMetadata } from "@/components/seo/category-page";

export const revalidate = 300; // 5 min: counts come from the vansales API (60 s data cache), so an hour showed stale "0 vans"

export const generateMetadata = () => categoryMetadata("panel-van");

export default function Page() {
  return <CategoryPage slug="panel-van" />;
}
