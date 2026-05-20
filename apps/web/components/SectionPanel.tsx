type SectionPanelProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SectionPanel({ title, description, children }: SectionPanelProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {description ? <p className="page-intro">{description}</p> : null}
      {children}
    </section>
  );
}
