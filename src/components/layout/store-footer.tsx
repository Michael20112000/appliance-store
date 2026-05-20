import { CallbackRequestForm } from "@/components/layout/callback-request-form";
import {
  addressExternalMapUrl,
  addressMapEmbedSrc,
} from "@/lib/catalog/store-map";
import {
  formatUaPhoneDisplay,
  uaPhoneTelHref,
} from "@/lib/phone/format-ua";
import { getPublicStoreContacts } from "@/server/services/store-settings.service";

export async function StoreFooter() {
  const year = new Date().getFullYear();
  const contacts = await getPublicStoreContacts();
  const primaryAddress = contacts.addresses[0];
  const mapEmbedSrc = primaryAddress
    ? addressMapEmbedSrc(primaryAddress)
    : null;

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="order-1 space-y-6 text-sm md:order-2">
            {contacts.phones.length > 0 ? (
              <ul className="space-y-2">
                {contacts.phones.map((phone) => (
                  <li key={phone.id}>
                    <a
                      href={uaPhoneTelHref(phone.digits)}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {formatUaPhoneDisplay(phone.digits)}
                    </a>
                    {phone.label ? (
                      <span className="ml-2 text-muted-foreground">
                        {phone.label}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {contacts.emails.length > 0 ? (
              <ul className="space-y-2">
                {contacts.emails.map((email) => (
                  <li key={email.id}>
                    <a
                      href={`mailto:${email.email}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {email.email}
                    </a>
                    {email.label ? (
                      <span className="ml-2 text-muted-foreground">
                        {email.label}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {contacts.addresses.length > 0 ? (
              <ul className="space-y-2">
                {contacts.addresses.map((address) => (
                  <li key={address.id}>
                    <a
                      href={addressExternalMapUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {address.text}
                    </a>
                    {address.label ? (
                      <span className="ml-2 text-muted-foreground">
                        {address.label}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="order-2 md:order-2">
            <CallbackRequestForm />
          </div>

          {mapEmbedSrc ? (
            <div className="order-3 md:order-1">
              <iframe
                title="Карта магазину"
                src={mapEmbedSrc}
                loading="lazy"
                className="h-40 w-full rounded-md border border-border md:h-auto md:min-h-[280px]"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}
        </div>

        <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
          © {year} Техніка б/у Львів
        </p>
      </div>
    </footer>
  );
}
