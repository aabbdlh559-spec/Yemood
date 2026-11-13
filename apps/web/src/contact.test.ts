import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildDeveloperMessage,
  callUrl,
  canSend,
  copyDeveloperPhone,
  DEVELOPER_PHONE,
  whatsAppUrl,
} from "./contact";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildDeveloperMessage", () => {
  it("fills the name and the problem into the ready-made message", () => {
    expect(buildDeveloperMessage("  سالم ", " اللعبة تتوقف عند بدء الجولة ")).toBe(
      [
        "السلام عليكم ورحمة الله وبركاته،",
        "",
        "مرحباً بمطور تطبيق Yemood.",
        "",
        "الاسم: سالم",
        "",
        "المشكلة التي أواجهها:",
        "اللعبة تتوقف عند بدء الجولة",
        "",
        "يرجى مراجعة المشكلة وإصلاحها، وشكراً لكم.",
      ].join("\n"),
    );
  });

  it("keeps the dotted blanks for fields that are still empty", () => {
    const message = buildDeveloperMessage("", "   ");
    expect(message).toContain("الاسم: ............");
    expect(message).toContain("المشكلة التي أواجهها:\n............");
  });
});

describe("whatsAppUrl", () => {
  it("opens the developer's chat with the message encoded in the link", () => {
    const message = buildDeveloperMessage("سالم", "مشكلة & أخرى\nسطر ثان");
    const url = new URL(whatsAppUrl(message));
    expect(url.origin + url.pathname).toBe("https://wa.me/15488782650");
    expect(url.searchParams.get("text")).toBe(message);
  });
});

describe("callUrl", () => {
  it("dials the developer's number in international format", () => {
    expect(callUrl()).toBe("tel:+15488782650");
    expect(DEVELOPER_PHONE).toBe("+15488782650");
  });
});

describe("canSend", () => {
  it("needs both a name and a problem with real text in them", () => {
    expect(canSend("سالم", "مشكلة")).toBe(true);
    expect(canSend("سالم", "   ")).toBe(false);
    expect(canSend("", "مشكلة")).toBe(false);
  });
});

describe("copyDeveloperPhone", () => {
  it("copies the number and reports success", async () => {
    const writeText = vi.fn<typeof navigator.clipboard.writeText>().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await expect(copyDeveloperPhone()).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("+15488782650");
  });

  it("reports failure when the clipboard refuses", async () => {
    const writeText = vi.fn<typeof navigator.clipboard.writeText>().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await expect(copyDeveloperPhone()).resolves.toBe(false);
  });

  it("reports failure when there is no clipboard at all", async () => {
    vi.stubGlobal("navigator", {});
    await expect(copyDeveloperPhone()).resolves.toBe(false);
  });
});
