import { FileStatusTable } from "../components/FileStatusTable";
import { ReadOnlyNotice } from "../components/ReadOnlyNotice";
import { SectionPanel } from "../components/SectionPanel";
import { StatusCard } from "../components/StatusCard";
import { brandName, currentStage, getAllDashboardFiles } from "../lib/dashboardData";
import { getSafetySummary } from "../lib/safetyChecks";

export default function OverviewPage() {
  const safety = getSafetySummary();
  const files = getAllDashboardFiles();

  return (
    <>
      <ReadOnlyNotice />
      <h1 className="page-title">Aooi Internal Review Dashboard</h1>
      <p className="page-intro">
        Internal file-based review dashboard for existing Aooi outputs. It reads local project files and cannot publish.
      </p>

      <div className="grid">
        <StatusCard label="Brand" value={brandName} status="info" description="First serviced brand case." />
        <StatusCard label="Current stage" value={currentStage} status="needs_review" description="Minimal read-only dashboard." />
        <StatusCard label="Publish ready" value={String(safety.publishReady)} status={safety.publishReady ? "blocked" : "pass"} />
        <StatusCard label="Manual review required" value={String(safety.manualReviewRequired)} status="needs_review" />
        <StatusCard label="Shopify API used" value={String(safety.shopifyApiUsed)} status={safety.shopifyApiUsed ? "blocked" : "pass"} />
        <StatusCard label="Auto publish used" value={String(safety.autoPublishUsed)} status={safety.autoPublishUsed ? "blocked" : "pass"} />
        <StatusCard label="Live theme modified" value={String(safety.liveThemeModified)} status={safety.liveThemeModified ? "blocked" : "pass"} />
        <StatusCard label="Missing files" value={safety.missingFiles.length} status={safety.missingFiles.length ? "blocked" : "pass"} />
      </div>

      <SectionPanel title="Pipeline Summary" description="High-level status from existing reports.">
        <div className="grid">
          <StatusCard label="FAQ blocked" value={safety.blockedCounts.faqExport} status={safety.blockedCounts.faqExport ? "needs_review" : "pass"} />
          <StatusCard label="FAQ needs review" value={safety.needsReviewCounts.faqExport} status="needs_review" />
          <StatusCard label="Shopify blocked" value={safety.blockedCounts.shopify} status={safety.blockedCounts.shopify ? "needs_review" : "pass"} />
          <StatusCard label="Shopify needs review" value={safety.needsReviewCounts.shopify} status="needs_review" />
        </div>
      </SectionPanel>

      <SectionPanel title="Next Human Actions">
        <ul className="list">
          <li>Review unverified and needs_owner_confirmation product facts.</li>
          <li>Review blocked and needs_review FAQ items before any future export.</li>
          <li>Confirm clean Shopify output remains target-market language only.</li>
          <li>Keep publish_ready false until a future manual approval workflow exists.</li>
        </ul>
      </SectionPanel>

      <SectionPanel title="File Status">
        <FileStatusTable files={files} />
      </SectionPanel>
    </>
  );
}
