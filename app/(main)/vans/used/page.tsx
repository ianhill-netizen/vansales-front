import { permanentRedirect } from "next/navigation";

export default function UsedVansPage() {
  permanentRedirect("/vans?condition=used");
}
