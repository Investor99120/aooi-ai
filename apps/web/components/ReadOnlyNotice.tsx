export function ReadOnlyNotice() {
  return (
    <div className="notice">
      <strong>This dashboard is read-only and cannot publish.</strong>
      <span>
        It cannot connect Shopify, modify live themes, generate schema, approve content automatically or push content live.
      </span>
    </div>
  );
}
