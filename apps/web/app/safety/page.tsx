import { FileStatusTable } from "../../components/FileStatusTable";
import { ReadOnlyNotice } from "../../components/ReadOnlyNotice";
import { SectionPanel } from "../../components/SectionPanel";
import { StatusCard } from "../../components/StatusCard";
import { getPublishingData } from "../../lib/dashboardData";
import { preview } from "../../lib/fileReaders";
import { getSafetySummary } from "../../lib/safetyChecks";

const forbiddenActions = [
  "Publish",
  "Publish to Shopify",
  "Connect Shopify",
  "Push live",
  "Modify theme",
  "Generate Product Schema",
  "Generate FAQPage Schema",
  "Auto approve",
  "Auto publish",
  "Create Shopify section",
];

export default function SafetyPage() {
  const files = getPublishingData();
  const safety = getSafetySummary();

  return (
    <>
      <ReadOnlyNotice />
      <h1 className="page-title">System Safety Boundaries</h1>
      <p className="page-intro">Review the rules that keep this dashboard internal, file-based and read-only.</p>
      <div className="grid">
        <StatusCard label="Publish ready" value={String(safety.publishReady)} status={safety.publishReady ? "blocked" : "pass"} />
        <StatusCard label="Manual review required" value={String(safety.manualReviewRequired)} status="needs_review" />
        <StatusCard label="Machine-readable Chinese leaks" value={safety.machineReadableChineseLeaks.length} status={safety.machineReadableChineseLeaks.length ? "blocked" : "pass"} />
        <StatusCard label="Missing files" value={safety.missingFiles.length} status={safety.missingFiles.length ? "blocked" : "pass"} />
      </div>
      <SectionPanel title="Forbidden Actions">
        <ul className="list">
          {forbiddenActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </SectionPanel>
      <SectionPanel title="Publishing Data Sources">
        <FileStatusTable files={files} />
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
