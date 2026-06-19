import { redirect } from "next/navigation";

export default function UsedVansPage() {
  redirect("/vans?condition=used");
}
