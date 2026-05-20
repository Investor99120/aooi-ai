import { FileStatusTable } from "../../components/FileStatusTable";
import { ReadOnlyNotice } from "../../components/ReadOnlyNotice";
import { SectionPanel } from "../../components/SectionPanel";
import { StatusCard } from "../../components/StatusCard";
import { getShopifyData } from "../../lib/dashboardData";
import { preview } from "../../lib/fileReaders";

function report(files: ReturnType<typeof getShopifyData>, suffix: string) {
  return files.find((item) => item.path.endsWith(suffix))?.data as Record<string, unknown> | undefined;
}

export default function ShopifyPage() {
  const files = getShopifyData();
  const outputReport = report(files, "shopify_faq_output_report.json");
  const gateReport = report(files, "shopify_manual_review_gate_report.json");
  const manifestReport = report(files, "shopify_manual_package_manifest_report.json");

  return (
    <>
      <ReadOnlyNotice />
      <h1 className="page-title">Shopify Package Review</h1>
      <p className="page-intro">Review manual-copy candidates, review outputs, blocked items, checklist and manifest reports.</p>
      <div className="grid">
        <StatusCard label="Clean items" value={String(outputReport?.shopify_clean_items ?? "unknown")} status="info" />
        <StatusCard label="Blocked items" value={String(outputReport?.blocked_items ?? "unknown")} status="needs_review" />
        <StatusCard label="Gate decision" value={String(gateReport?.decision ?? "unknown")} status="needs_review" />
        <StatusCard label="Manifest files found" value={String((manifestReport?.package_summary as Record<string, unknown> | undefined)?.total_files_found ?? "unknown")} status="info" />
        <StatusCard label="Shopify API" value={String(gateReport?.shopify_api_used ?? false)} status={gateReport?.shopify_api_used ? "blocked" : "pass"} />
        <StatusCard label="Auto publish" value={String(gateReport?.auto_publish_used ?? false)} status={gateReport?.auto_publish_used ? "blocked" : "pass"} />
        <StatusCard label="Live theme modified" value={String(gateReport?.live_theme_modified ?? false)} status={gateReport?.live_theme_modified ? "blocked" : "pass"} />
        <StatusCard label="Publish ready" value={String(gateReport?.publish_ready ?? false)} status={gateReport?.publish_ready ? "blocked" : "pass"} />
      </div>
      <SectionPanel title="Shopify File Status">
        <FileStatusTable files={files} />
      </SectionPanel>
      <SectionPanel title="Shopify Safety Warnings">
        <ul className="list">
          <li>No Shopify API is available in this dashboard.</li>
          <li>No auto-publish action is available.</li>
          <li>No live theme modification is available.</li>
          <li>No final Shopify page is generated.</li>
          <li>No FAQPage Schema or Product Schema is generated.</li>
        </ul>
      </SectionPanel>
      <div className="two-col">
        {files.map((file) => (
          <SectionPanel key={file.path} title={file.path}>
            <pre>{preview(file.content)}</pre>
          </SectionPanel>
        ))}
      </div>
    </>
  );
}
