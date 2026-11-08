// "Contact the developer": the number, the Arabic copy and the message that WhatsApp opens with.
// The screen is Arabic by design (the developer's own wording), so its copy lives here as one
// unit instead of in the en/he dictionaries.

/** Shown on screen and used for the call link. */
export const DEVELOPER_PHONE = "+15488782650";

/** The same number as wa.me wants it: digits only, no plus sign. */
const DEVELOPER_WHATSAPP_ID = "15488782650";

/** Stands in for a field the user has not filled in yet. */
const BLANK = "............";

export const MAX_FIELD_LENGTH = 1000;

export const CONTACT_COPY = {
  title: "التواصل مع المطور",
  intro: "واجهتك مشكلة في Yemood؟ اكتب اسمك ووصف المشكلة، وسنفتح لك محادثة واتساب مع المطور والرسالة مكتوبة مسبقاً.",
  phoneLabel: "رقم المطور",
  nameLabel: "الاسم",
  namePlaceholder: "اكتب اسمك",
  problemLabel: "المشكلة التي أواجهها",
  problemPlaceholder: "اشرح المشكلة بالتفصيل",
  previewLabel: "الرسالة التي ستُفتح في واتساب",
  whatsapp: "مراسلة المطور عبر واتساب",
  needFields: "اكتب اسمك ووصف المشكلة لتفعيل زر واتساب.",
  notSentNote: "لا تُرسَل الرسالة تلقائياً: تُفتح المحادثة والرسالة مكتوبة، وأنت من يضغط إرسال داخل واتساب.",
  fallbackTitle: "إن لم يكن واتساب متاحاً",
  call: "اتصال هاتفي بالمطور",
  copy: "نسخ رقم المطور",
  copied: "تم نسخ الرقم.",
  copyFailed: "تعذّر النسخ تلقائياً. اضغط مطولاً على الرقم أعلاه وانسخه.",
  back: "رجوع",
} as const;

/** The ready-made message, with the user's name and problem filled in. */
export function buildDeveloperMessage(name: string, problem: string): string {
  return [
    "السلام عليكم ورحمة الله وبركاته،",
    "",
    "مرحباً بمطور تطبيق Yemood.",
    "",
    `الاسم: ${name.trim() || BLANK}`,
    "",
    "المشكلة التي أواجهها:",
    problem.trim() || BLANK,
    "",
    "يرجى مراجعة المشكلة وإصلاحها، وشكراً لكم.",
  ].join("\n");
}

/** A chat with the developer that opens in WhatsApp with the message typed, not sent. */
export function whatsAppUrl(message: string): string {
  return `https://wa.me/${DEVELOPER_WHATSAPP_ID}?text=${encodeURIComponent(message)}`;
}

/** Opens the phone's dialler. */
export function callUrl(): string {
  return `tel:${DEVELOPER_PHONE}`;
}

/** Both fields need something before the WhatsApp message makes sense. */
export function canSend(name: string, problem: string): boolean {
  return name.trim().length > 0 && problem.trim().length > 0;
}

/** Puts the number on the clipboard. False when the browser refuses or has no clipboard. */
export async function copyDeveloperPhone(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(DEVELOPER_PHONE);
    return true;
  } catch {
    return false;
  }
}
