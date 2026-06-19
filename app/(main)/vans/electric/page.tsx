import { redirect } from "next/navigation";

export default function ElectricVansPage() {
  redirect("/vans?fuel=electric");
}
