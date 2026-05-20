import { FileStatusTable } from "../../components/FileStatusTable";
import { ReadOnlyNotice } from "../../components/ReadOnlyNotice";
import { SectionPanel } from "../../components/SectionPanel";
import { StatusCard } from "../../components/StatusCard";
import { getBrandData } from "../../lib/dashboardData";
import { preview } from "../../lib/fileReaders";

export default function BrandPage() {
  const files = getBrandData();

  return (
    <>
      <ReadOnlyNotice />
      <h1 className="page-title">Brand Profile Review</h1>
      <p className="page-intro">Review brand facts, semantic structure, localisation and claim boundaries.</p>
      <div className="grid">
        <StatusCard label="Mode" value="review only" status="needs_review" />
        <StatusCard label="Brand files" value={files.length} status="info" />
        <StatusCard label="Missing files" value={files.filter((item) => !item.exists).length} status={files.some((item) => !item.exists) ? "blocked" : "pass"} />
      </div>
      <SectionPanel title="Brand File Status">
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
