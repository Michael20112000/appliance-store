export type AdminChatView = "active" | "archive";

export function buildAdminChatHref(
  view: AdminChatView,
  conversationId?: string | null,
): string {
  const params = new URLSearchParams();
  if (view === "archive") {
    params.set("view", "archive");
  }
  if (conversationId) {
    params.set("conversationId", conversationId);
  }
  const qs = params.toString();
  return qs ? `/admin/chaty?${qs}` : "/admin/chaty";
}
