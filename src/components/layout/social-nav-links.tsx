import { SOCIAL_LINKS } from "@/lib/social-links";
import {
  TelegramIcon,
  ViberIcon,
  WhatsAppIcon,
} from "@/components/icons/social-icons";

export function SocialNavLinks() {
  return (
    <div className="flex items-center gap-1">
      <a
        href={SOCIAL_LINKS.telegram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted"
      >
        <TelegramIcon className="size-5" style={{ color: "#2AABEE" }} />
      </a>
      <a
        href={SOCIAL_LINKS.viber}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Viber"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted"
      >
        <ViberIcon className="size-5" style={{ color: "#7360F2" }} />
      </a>
      <a
        href={SOCIAL_LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted"
      >
        <WhatsAppIcon className="size-5" style={{ color: "#25D366" }} />
      </a>
    </div>
  );
}
