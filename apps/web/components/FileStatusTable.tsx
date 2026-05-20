import { DashboardFile } from "../lib/dashboardData";
import { RiskBadge } from "./RiskBadge";

type FileStatusTableProps = {
  files: DashboardFile[];
};

export function FileStatusTable({ files }: FileStatusTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Exists</th>
            <th>Parse</th>
            <th>Type</th>
            <th>Chinese allowed</th>
            <th>Customer-facing</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.path}>
              <td>{file.path}</td>
              <td><RiskBadge value={file.exists ? "pass" : "blocked"} /></td>
              <td>{file.parseStatus || "not_parsed"}</td>
              <td>{file.fileType}</td>
              <td>{file.chineseAllowed ? "yes" : "no"}</td>
              <td>{file.customerFacingAllowed ? "candidate only" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
