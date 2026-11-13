// Route /contact: write the problem, then open a WhatsApp chat with the message ready to send.
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Button, Icon, Marker, PhoneScreen, PRESSABLE_CLASS } from "@opg/ui";
import {
  buildDeveloperMessage,
  callUrl,
  canSend,
  CONTACT_COPY,
  copyDeveloperPhone,
  DEVELOPER_PHONE,
  MAX_FIELD_LENGTH,
  whatsAppUrl,
} from "../contact";
import { Link } from "../router";
import { useCoverTheme } from "./cover-theme";

const FIELD_STYLE: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: "var(--opg-card)",
  border: "4px solid var(--opg-ink)",
  borderRadius: "var(--opg-radius-button)",
  fontFamily: "var(--opg-font-body)",
  fontSize: 20,
  color: "var(--opg-ink)",
};

const ACTION_STYLE: CSSProperties = {
  minHeight: 64,
  padding: "0 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  border: "4px solid var(--opg-ink)",
  borderRadius: "var(--opg-radius-l)",
  fontSize: 21,
  fontWeight: 700,
  textDecoration: "none",
  textAlign: "center",
};

/** Label plus field, tied together so a screen reader announces the label with the field. */
function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label htmlFor={id} style={{ fontSize: 18, fontWeight: 700 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function DeveloperForm({
  name,
  problem,
  onName,
  onProblem,
}: {
  name: string;
  problem: string;
  onName: (value: string) => void;
  onProblem: (value: string) => void;
}) {
  return (
    <>
      <Field id="contact-name" label={CONTACT_COPY.nameLabel}>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          maxLength={MAX_FIELD_LENGTH}
          placeholder={CONTACT_COPY.namePlaceholder}
          value={name}
          onChange={(event) => onName(event.target.value)}
          style={{ ...FIELD_STYLE, minHeight: 60 }}
        />
      </Field>
      <Field id="contact-problem" label={CONTACT_COPY.problemLabel}>
        <textarea
          id="contact-problem"
          rows={5}
          maxLength={MAX_FIELD_LENGTH}
          placeholder={CONTACT_COPY.problemPlaceholder}
          value={problem}
          onChange={(event) => onProblem(event.target.value)}
          style={{ ...FIELD_STYLE, resize: "vertical" }}
        />
      </Field>
    </>
  );
}

/** The WhatsApp button: a real link once there is something to send, plain text before. */
function WhatsAppAction({ message, ready }: { message: string; ready: boolean }) {
  if (!ready) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          aria-disabled="true"
          style={{
            ...ACTION_STYLE,
            background: "var(--opg-paper)",
            color: "var(--opg-ink-secondary)",
            borderColor: "var(--opg-ink-secondary)",
          }}
        >
          {CONTACT_COPY.whatsapp}
        </span>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--opg-ink-secondary)" }}>
          {CONTACT_COPY.needFields}
        </div>
      </div>
    );
  }
  return (
    <a
      href={whatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={PRESSABLE_CLASS}
      style={{ ...ACTION_STYLE, background: "var(--opg-ink)", color: "var(--opg-paper)" }}
    >
      <Icon name="arrow-right" size={24} color="var(--opg-paper)" />
      <span>{CONTACT_COPY.whatsapp}</span>
    </a>
  );
}

/** Call or copy, for when WhatsApp is not installed or not reachable. */
function FallbackActions() {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const onCopy = () => {
    void copyDeveloperPhone().then((ok) => setCopy(ok ? "copied" : "failed"));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Marker size={28}>{CONTACT_COPY.fallbackTitle}</Marker>
      <a
        href={callUrl()}
        className={PRESSABLE_CLASS}
        style={{ ...ACTION_STYLE, background: "var(--opg-card)", color: "var(--opg-ink)" }}
      >
        {CONTACT_COPY.call}
      </a>
      <Button variant="secondary" size="lg" fullWidth onClick={onCopy}>
        {CONTACT_COPY.copy}
      </Button>
      <output style={{ fontSize: 16, fontWeight: 700, minHeight: 22 }}>
        {copy === "copied" ? CONTACT_COPY.copied : null}
        {copy === "failed" ? CONTACT_COPY.copyFailed : null}
      </output>
    </div>
  );
}

export function ContactDeveloper() {
  useCoverTheme();
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");
  const message = buildDeveloperMessage(name, problem);
  return (
    <PhoneScreen>
      <div dir="rtl" lang="ar" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Link to="/" className="opg-link" style={{ fontSize: 18, fontWeight: 700 }}>
          {CONTACT_COPY.back}
        </Link>
        <h1 style={{ margin: 0 }}>
          <Marker size={38} style={{ lineHeight: 1.3 }}>
            {CONTACT_COPY.title}
          </Marker>
        </h1>
        <div style={{ fontSize: 19, lineHeight: 1.5 }}>{CONTACT_COPY.intro}</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {CONTACT_COPY.phoneLabel}:{" "}
          <bdi dir="ltr" style={{ userSelect: "all" }}>
            {DEVELOPER_PHONE}
          </bdi>
        </div>
        <DeveloperForm name={name} problem={problem} onName={setName} onProblem={setProblem} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div id="contact-preview-label" style={{ fontSize: 18, fontWeight: 700 }}>
            {CONTACT_COPY.previewLabel}
          </div>
          <pre
            aria-labelledby="contact-preview-label"
            style={{ ...FIELD_STYLE, margin: 0, whiteSpace: "pre-wrap", fontSize: 17, lineHeight: 1.6 }}
          >
            {message}
          </pre>
        </div>
        <WhatsAppAction message={message} ready={canSend(name, problem)} />
        <div style={{ fontSize: 16, lineHeight: 1.5, color: "var(--opg-ink-secondary)" }}>
          {CONTACT_COPY.notSentNote}
        </div>
        <FallbackActions />
      </div>
    </PhoneScreen>
  );
}

/** The entry point shown on both landing screens. */
export function ContactLink({ style }: { style?: CSSProperties }) {
  return (
    <Link to="/contact" className="opg-link" style={style}>
      {CONTACT_COPY.title}
    </Link>
  );
}
