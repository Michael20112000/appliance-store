export type AdminCallbackView = "active" | "archive";

const CALLBACKS_PATH = "/admin/dzvinky";

export function adminCallbacksUrl(params?: {
  view?: AdminCallbackView;
}): string {
  if (params?.view === "archive") {
    return `${CALLBACKS_PATH}?view=archive`;
  }
  return CALLBACKS_PATH;
}
