import { IntegrationsPage } from "@/components/integrations-page";

export default function ApisPage() {
  return (
    <IntegrationsPage
      category="api"
      title="API integrations"
      description="Vehicle data, payment, email and feed connections. Keys are encrypted at rest and never sent to the browser."
    />
  );
}
