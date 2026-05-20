import { FileStatusTable } from "../../components/FileStatusTable";
import { ReadOnlyNotice } from "../../components/ReadOnlyNotice";
import { SectionPanel } from "../../components/SectionPanel";
import { StatusCard } from "../../components/StatusCard";
import { getSchemaData } from "../../lib/dashboardData";
import { preview } from "../../lib/fileReaders";

export default function SchemaPage() {
  const files = getSchemaData();
  const report = files.find((item) => item.path.endsWith("schema_generation_report.json"));
  const reportData = report?.data as Record<string, unknown> | undefined;

  return (
    <>
      <ReadOnlyNotice />
      <h1 className="page-title">Schema Review</h1>
      <p className="page-intro">Review low-risk schema candidates and confirm excluded schema types remain excluded.</p>
      <div className="grid">
        <StatusCard label="Schema decision" value={String(reportData?.decision || "unknown")} status="needs_review" />
        <StatusCard label="Manual review" value={String(reportData?.manual_review_required ?? true)} status="needs_review" />
        <StatusCard label="Product Schema" value="not generated" status="pass" />
        <StatusCard label="FAQPage Schema" value="not generated" status="pass" />
      </div>
      <SectionPanel title="Schema File Status">
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
