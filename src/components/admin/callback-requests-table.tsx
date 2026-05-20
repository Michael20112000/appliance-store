import { formatUaPhoneDisplay } from "@/lib/phone/format-ua";
import { CALLBACK_STATUS_LABELS_UA } from "@/lib/callback/status-labels";
import type { AdminCallbackView } from "@/lib/admin/callbacks-url";
import type { CallbackRequestAdminRow } from "@/server/services/callback-request.service";
import { CallbackArchiveButton } from "@/components/admin/callback-archive-button";
import { CallbackListStatusSelect } from "@/components/admin/callback-list-status-select";
import { CallbackNoteField } from "@/components/admin/callback-note-field";

function truncateNote(note: string | null, max = 80): string {
  if (!note) return "—";
  if (note.length <= max) return note;
  return `${note.slice(0, max)}…`;
}

export function CallbackRequestsTable({
  requests,
  view,
}: {
  requests: CallbackRequestAdminRow[];
  view: AdminCallbackView;
}) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {view === "active" ? "Немає активних заявок" : "Архів порожній"}
      </p>
    );
  }

  const isActive = view === "active";

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">Телефон</th>
            <th className="px-4 py-3 font-medium">Дата</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium">Нотатка</th>
            {isActive ? (
              <th className="px-4 py-3 font-medium">Дії</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.id}
              className="border-b border-border align-top last:border-0"
            >
              <td className="px-4 py-3 tabular-nums">
                {formatUaPhoneDisplay(request.phone)}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {request.createdAt.toLocaleString("uk-UA", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-4 py-3">
                {isActive ? (
                  <CallbackListStatusSelect
                    id={request.id}
                    status={request.status}
                  />
                ) : (
                  <span>{CALLBACK_STATUS_LABELS_UA[request.status]}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {isActive ? (
                  <CallbackNoteField id={request.id} note={request.note} />
                ) : (
                  <p className="line-clamp-2 max-w-md text-muted-foreground">
                    {truncateNote(request.note)}
                  </p>
                )}
              </td>
              {isActive ? (
                <td className="px-4 py-3">
                  <CallbackArchiveButton
                    id={request.id}
                    status={request.status}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
