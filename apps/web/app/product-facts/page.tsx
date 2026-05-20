import { ReadOnlyNotice } from "../../components/ReadOnlyNotice";
import { SectionPanel } from "../../components/SectionPanel";
import { StatusCard } from "../../components/StatusCard";
import { getBrandData } from "../../lib/dashboardData";
import { preview } from "../../lib/fileReaders";

export default function ProductFactsPage() {
  const productFacts = getBrandData().find((item) => item.path.endsWith("product_facts.yml"));

  return (
    <>
      <ReadOnlyNotice />
      <h1 className="page-title">Product Facts Review</h1>
      <p className="page-intro">Inspect verified facts, unverified fields and owner confirmation needs.</p>
      <div className="grid">
        <StatusCard label="Source status discipline" value="required" status="needs_review" />
        <StatusCard label="Unverified facts warning" value="review before export" status="needs_review" />
        <StatusCard label="Schema-ready risk" value="verified only" status="needs_review" />
      </div>
      <SectionPanel title="Product Facts Preview">
        <pre>{preview(productFacts?.content)}</pre>
      </SectionPanel>
      <SectionPanel title="Review Reminders">
        <ul className="list">
          <li>Do not export unverified product facts.</li>
          <li>Do not use needs_owner_confirmation as customer-facing copy.</li>
          <li>Logistics, warranty, certification and review claims require strict source proof.</li>
          <li>Schema-ready fields must be verified before any future schema phase.</li>
        </ul>
      </SectionPanel>
    </>
  );
}
