import { FileStatusTable } from "../../components/FileStatusTable";
import { ReadOnlyNotice } from "../../components/ReadOnlyNotice";
import { SectionPanel } from "../../components/SectionPanel";
import { StatusCard } from "../../components/StatusCard";
import { getFaqData } from "../../lib/dashboardData";
import { preview } from "../../lib/fileReaders";

function reportValue(files: ReturnType<typeof getFaqData>, suffix: string, key: string) {
  const file = files.find((item) => item.path.endsWith(suffix));
  const data = file?.data as Record<string, unknown> | undefined;
  return data?.[key] ?? "unknown";
}

export default function FaqPage() {
  const files = getFaqData();

  return (
    <>
      <ReadOnlyNotice />
      <h1 className="page-title">FAQ Review</h1>
      <p className="page-intro">Review FAQ Bank, drafts, export candidates, blocked items and review gate reports.</p>
      <div className="grid">
        <StatusCard label="FAQ Bank decision" value={String(reportValue(files, "faq_bank_validation_report.json", "decision"))} status="needs_review" />
        <StatusCard label="Drafts generated" value={String(reportValue(files, "faq_draft_generation_report.json", "drafts_generated"))} status="info" />
        <StatusCard label="Export candidates" value={String(reportValue(files, "faq_export_candidate_report.json", "export_candidates"))} status="info" />
        <StatusCard label="Final FAQ page" value="not generated" status="pass" />
      </div>
      <SectionPanel title="FAQ File Status">
        <FileStatusTable files={files} />
      </SectionPanel>
      <SectionPanel title="FAQ Warnings">
        <ul className="list">
          <li>No final FAQ page is generated in this dashboard.</li>
          <li>No FAQPage Schema is generated in this dashboard.</li>
          <li>Blocked FAQ items must remain excluded from clean outputs.</li>
          <li>Review-mode files may contain Chinese owner notes; clean candidates should not.</li>
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
