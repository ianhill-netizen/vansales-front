import { IntegrationsPage } from "@/components/integrations-page";

export default function TrackingPage() {
  return (
    <IntegrationsPage
      category="tracking"
      title="Tracking"
      description="GTM, GA4, and Meta Pixel IDs. When set, scripts are injected into the site &lt;head&gt; site-wide. Leave blank to disable. Changes take effect within 60 seconds."
    />
  );
}
