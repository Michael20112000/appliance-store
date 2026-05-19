/** Display +38 (0XX) XXX-XX-XX for 10-digit UA numbers starting with 0. */
export function formatUaPhoneDisplay(digits: string): string {
  if (digits.length === 10 && digits.startsWith("0")) {
    return `+38 (${digits.slice(1, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }
  if (digits.length >= 12 && digits.startsWith("380")) {
    const local = digits.slice(3);
    if (local.length === 9) {
      return `+38 (${local.slice(0, 2)}) ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7, 9)}`;
    }
  }
  return `+${digits}`;
}

export function uaPhoneTelHref(digits: string): string {
  if (digits.length === 10 && digits.startsWith("0")) {
    return `tel:+380${digits.slice(1)}`;
  }
  if (digits.startsWith("380")) {
    return `tel:+${digits}`;
  }
  return `tel:+${digits}`;
}
