import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@opg/i18n";
import { buildDeveloperMessage, CONTACT_COPY, whatsAppUrl } from "../contact";
import { ContactDeveloper, ContactLink } from "./ContactDeveloper";
import { COVER_CLASS } from "./cover-theme";

function renderContact() {
  return render(
    <LocaleProvider>
      <ContactDeveloper />
    </LocaleProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ContactDeveloper", () => {
  it("shows the title, the developer's number and the unfilled message", () => {
    renderContact();
    expect(screen.getByRole("heading", { name: CONTACT_COPY.title })).toBeTruthy();
    expect(screen.getByText("+15488782650")).toBeTruthy();
    expect(screen.getByLabelText(CONTACT_COPY.previewLabel).textContent).toBe(
      buildDeveloperMessage("", ""),
    );
  });

  it("keeps the WhatsApp button off until the name and the problem are written", async () => {
    const user = userEvent.setup();
    renderContact();
    expect(screen.queryByRole("link", { name: CONTACT_COPY.whatsapp })).toBeNull();
    expect(screen.getByText(CONTACT_COPY.needFields)).toBeTruthy();

    await user.type(screen.getByLabelText(CONTACT_COPY.nameLabel), "سالم");
    expect(screen.queryByRole("link", { name: CONTACT_COPY.whatsapp })).toBeNull();

    await user.type(screen.getByLabelText(CONTACT_COPY.problemLabel), "اللعبة تتوقف");
    expect(screen.getByRole("link", { name: CONTACT_COPY.whatsapp })).toBeTruthy();
    expect(screen.queryByText(CONTACT_COPY.needFields)).toBeNull();
  });

  it("opens WhatsApp with the typed message and sends nothing by itself", async () => {
    const fetchSpy = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    renderContact();
    await user.type(screen.getByLabelText(CONTACT_COPY.nameLabel), "سالم");
    await user.type(screen.getByLabelText(CONTACT_COPY.problemLabel), "اللعبة تتوقف");

    const link = screen.getByRole("link", { name: CONTACT_COPY.whatsapp });
    expect(link.getAttribute("href")).toBe(
      whatsAppUrl(buildDeveloperMessage("سالم", "اللعبة تتوقف")),
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(screen.getByText(CONTACT_COPY.notSentNote)).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("offers a phone call when WhatsApp is not available", () => {
    renderContact();
    expect(
      screen.getByRole("link", { name: CONTACT_COPY.call }).getAttribute("href"),
    ).toBe("tel:+15488782650");
  });

  it("copies the number and says so", async () => {
    const writeText = vi.fn<typeof navigator.clipboard.writeText>().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    renderContact();
    fireEvent.click(screen.getByRole("button", { name: CONTACT_COPY.copy }));
    expect(await screen.findByText(CONTACT_COPY.copied)).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith("+15488782650");
  });

  it("tells the user to copy by hand when the clipboard refuses", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn<typeof navigator.clipboard.writeText>().mockRejectedValue(new Error("no")) } });
    renderContact();
    fireEvent.click(screen.getByRole("button", { name: CONTACT_COPY.copy }));
    expect(await screen.findByText(CONTACT_COPY.copyFailed)).toBeTruthy();
  });

  it("wears the cover colours only while it is on screen", () => {
    const { unmount } = renderContact();
    expect(document.documentElement.classList.contains(COVER_CLASS)).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains(COVER_CLASS)).toBe(false);
  });
});

describe("ContactLink", () => {
  it("links to the contact page under its Arabic name", () => {
    render(
      <LocaleProvider>
        <ContactLink />
      </LocaleProvider>,
    );
    expect(
      screen.getByRole("link", { name: CONTACT_COPY.title }).getAttribute("href"),
    ).toBe("/contact");
  });
});
