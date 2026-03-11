export type ConsentState = {
  necessary: true;
  externalContent: boolean;
};

const CONSENT_KEY = "dikkezeehond_consent_v1";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

export function saveConsent(consent: ConsentState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

export function clearConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONSENT_KEY);
}
