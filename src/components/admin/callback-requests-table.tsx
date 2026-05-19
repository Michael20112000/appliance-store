import { formatUaPhoneDisplay } from "@/lib/phone/format-ua";
import type { CallbackRequestAdminRow } from "@/server/services/store-settings.service";

export function CallbackRequestsTable({
  requests,
}: {
  requests: CallbackRequestAdminRow[];
}) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Ще немає заявок</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">Телефон</th>
            <th className="px-4 py-3 font-medium">Дата</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 tabular-nums">
                {formatUaPhoneDisplay(request.phone)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {request.createdAt.toLocaleString("uk-UA", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
