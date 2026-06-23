import { permanentRedirect } from "next/navigation";

export default function NewVansPage() {
  permanentRedirect("/vans?condition=new");
}
