import { redirect } from "next/navigation";

export default function NewVansPage() {
  redirect("/vans?condition=new");
}
