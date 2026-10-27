// client/src/pages/Home.tsx
// Vervangt de volledige Home-pagina, inclusief navigatie en footer.
// Gebruikt bestaande foto's, GoogleReviewsWidget en POST /api/contact.
// Guestplan opent via officiële boekingslinks; er wordt geen zwevende widget geladen.
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Pause,
  Phone,
  Play,
  Plus,
  Waves,
  X,
} from "lucide-react";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";

// Inhoud die bij een kaart- of seizoenswissel op één plek kan worden aangepast.
const SITE = {
  phone: "0222 441110",
  phoneHref: "tel:+31222441110",
  email: "info@dikkezeehond.nl",
  groupsEmail: "groepen@dikkezeehond.nl",
  address: "Badweg 202",
  city: "1796 AA De Koog, Texel",
  menuUrl: "/menu/Menukaart_zomer_2026.pdf",
  // De huidige PDF heet zomer 2026; de website noemt deze daarom 'actuele menukaart'.
  // Vervang dit pad zodra de definitieve winterkaart beschikbaar is.
  instagram: "https://www.instagram.com/dedikkezeehond/",
  maps: "https://maps.app.goo.gl/KPu68EBoRMhDpFGN8?g_st=ipc",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Strandpaviljoen Dikke Zeehond, De Koog, Texel"),
  booking:
    "https://widget.guestplan.com/?i=e0bd256fce2d473ce637333d6d8580e31c2a8692",
  webcam: "https://www.youtube.com/watch?v=f_CtUNq1FR0",
  webcamEmbed:
    "https://www.youtube-nocookie.com/embed/f_CtUNq1FR0?playsinline=1&rel=0",
} as const;

const CHRISTMAS = {
  date: "2026-12-26",
  announcementFrom: "2026-10-01",
  holidaysUntil: "2027-01-01",
  price: "75",
  menuUrl: "/menu/kerstmenu-2026-met-vega.pdf",
  image: "/menu/kerstmenu-2026-met-vega.webp",
  // Echte directe link naar de bestaande Guestplan-service 'Kerstmenu 2026'.
  // De service bepaalt datum, tijden, groepsgrootte en eventuele betaling.
  booking:
    "https://widget.guestplan.com/?id=SjqtXFn0e0bd256fce2d473ce637333d6d8580e31c2a8692",
} as const;

const PHOTOS = {
  hero: "/photos/hero/hero-01-zonsondergang.jpg",
  food: "/photos/hero/hero-12-binnen.jpg", // De bestandsnaam is historisch; dit is een eetfoto.
  lunch: "/photos/hero/hero-06-lunch.jpg",
  interior: "/photos/hero/hero-03-interieur.jpg",
  sea: "/photos/hero/hero-04-zeezicht.jpg",
  team: "/photos/hero/hero-13-team.jpg",
  table: "/photos/hero/hero-09-tafel.jpg",
  drinks: "/photos/hero/hero-08-delen.jpg", // Deze foto toont warme chocolademelk.
} as const;

// De tekst blijft vast staan; alleen deze vijf foto's wisselen rustig door.
const HERO_SLIDES = [
  {
    src: PHOTOS.hero,
    label: "Zonsondergang aan zee",
    alt: "Dikke Zeehond aan het strand van Texel tijdens zonsondergang",
    width: 1448,
    height: 1086,
    position: "50% 62%",
    mobilePosition: "68% 50%",
  },
  {
    src: PHOTOS.sea,
    label: "Het terras en de zee",
    alt: "Het terras van Dikke Zeehond met uitzicht op zee",
    width: 2048,
    height: 1365,
    position: "50% 56%",
    mobilePosition: "55% 50%",
  },
  {
    src: PHOTOS.interior,
    label: "Warm binnen",
    alt: "Houten tafels, planten en warme lampen in Dikke Zeehond",
    width: 2048,
    height: 1365,
    position: "50% 52%",
    mobilePosition: "64% 50%",
  },
  {
    src: PHOTOS.lunch,
    label: "Lunchen aan zee",
    alt: "Een kleurrijk lunchgerecht bij Dikke Zeehond",
    width: 2048,
    height: 1365,
    position: "50% 50%",
    mobilePosition: "45% 50%",
  },
  {
    src: PHOTOS.team,
    label: "Samen aan zee",
    alt: "Het team van Dikke Zeehond staat met de armen om elkaar heen aan het strand van Texel",
    width: 2048,
    height: 1365,
    position: "50% 85%",
    mobilePosition: "50% 50%",
  },
] as const;
const HERO_HOLD_MS = 7000;
const HERO_FADE_MS = 1400;

const GALLERY = [
  {
    src: PHOTOS.table,
    alt: "Warme rotan lampen boven de tafels langs het raam",
    label: "Een fijne plek binnen",
    className: "dz-gallery-tall",
    width: 1365,
    height: 2048,
  },
  {
    src: PHOTOS.sea,
    alt: "Het terras van Dikke Zeehond met uitzicht op zee",
    label: "De zee voor je",
    className: "dz-gallery-wide",
    width: 2048,
    height: 1365,
  },
  {
    src: PHOTOS.drinks,
    alt: "Warme chocolademelk aan tafel bij Dikke Zeehond",
    label: "Even opwarmen",
    className: "dz-gallery-small",
    width: 1365,
    height: 2048,
  },
] as const;

// De keukentijden hieronder gelden vanaf 2 november 2026. Pas ze bij de
// volgende seizoenswissel aan; er is geen onbevestigde einddatum aangenomen.
const CONSENT_KEY = "dikkezeehond_consent_v1";
type Consent = { necessary: true; externalContent: boolean };
type Panel = "contact" | "jobs" | "webcam" | null;

function readConsent(): Consent | null {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(CONSENT_KEY) || "null",
    );
    if (
      value &&
      typeof value === "object" &&
      "externalContent" in value &&
      typeof value.externalContent === "boolean"
    ) {
      return { necessary: true, externalContent: value.externalContent };
    }
  } catch {
    // De pagina blijft bruikbaar wanneer opslag niet beschikbaar is.
  }
  return null;
}

function amsterdamDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function groupMail(subject: string) {
  return `mailto:${SITE.groupsEmail}?subject=${encodeURIComponent(subject + " bij Dikke Zeehond")}`;
}

function BookingLink({
  christmas = false,
  children,
  className = "dz-button",
  ...rest
}: {
  christmas?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      className={className}
      href={christmas ? CHRISTMAS.booking : SITE.booking}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children || "Reserveer je tafel"}
      <ArrowUpRight size={17} aria-hidden="true" />
      <span className="dz-sr-only">
        {" "}
        (opent Guestplan in een nieuw tabblad)
      </span>
    </a>
  );
}

function HeroSlideshow({ onOpenWebcam }: { onOpenWebcam: () => void }) {
  const hero = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState<{
    current: number;
    previous: number | null;
  }>({ current: 0, previous: null });
  const [images, setImages] = useState<Array<"pending" | "ready" | "failed">>(
    () => HERO_SLIDES.map(() => "pending"),
  );
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(preference.matches);
    setPlaying(!preference.matches);
    const motionChanged = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    const visibilityChanged = () => setPageVisible(!document.hidden);
    visibilityChanged();
    preference.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.05 },
          )
        : null;
    if (hero.current) observer?.observe(hero.current);
    return () => {
      preference.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      observer?.disconnect();
    };
  }, []);

  // Bij een ontbrekende eerste foto nemen we de eerst beschikbare foto over.
  useEffect(() => {
    if (images[frame.current] !== "failed") return;
    const available = images.findIndex((status) => status === "ready");
    if (available >= 0) setFrame({ current: available, previous: null });
  }, [images, frame.current]);

  useEffect(() => {
    if (!transitioning) return;
    const timer = window.setTimeout(
      () => {
        // De oude laag verdwijnt pas onder de volledig zichtbare nieuwe foto.
        // Zo kan ook terugbladeren weer vanuit een transparante laag vervagen.
        setFrame((value) => ({ ...value, previous: null }));
        setTransitioning(false);
      },
      reducedMotion ? 0 : HERO_FADE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [transitioning, reducedMotion]);

  useEffect(() => {
    if (!playing || !pageVisible || !inView || transitioning) return;
    if (images.filter((status) => status === "ready").length < 2) return;
    const timer = window.setTimeout(() => {
      // Een trage of kapotte foto wordt nooit boven de huidige foto getoond.
      for (let offset = 1; offset < HERO_SLIDES.length; offset += 1) {
        const next = (frame.current + offset) % HERO_SLIDES.length;
        if (images[next] === "ready") {
          setFrame({
            current: next,
            previous: reducedMotion ? null : frame.current,
          });
          setTransitioning(!reducedMotion);
          break;
        }
      }
    }, HERO_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [
    frame.current,
    images,
    playing,
    pageVisible,
    inView,
    transitioning,
    reducedMotion,
  ]);

  function imageSettled(index: number, status: "ready" | "failed") {
    setImages((previous) => {
      if (previous[index] === status) return previous;
      return previous.map((value, photo) => (photo === index ? status : value));
    });
  }

  function selectPhoto(index: number) {
    setPlaying(false);
    if (images[index] !== "ready" || transitioning || index === frame.current)
      return;
    setFrame({
      current: index,
      previous: reducedMotion ? null : frame.current,
    });
    setTransitioning(!reducedMotion);
  }

  return (
    <section
      ref={hero}
      className="dz-hero"
      aria-labelledby="dz-hero-title"
      aria-roledescription="diavoorstelling"
      style={{ "--dz-slide-duration": `${HERO_FADE_MS}ms` } as CSSProperties}
      onFocusCapture={(event) => {
        // Toetsenbordgebruik stopt automatisch wisselen; de afspeelknop hervat het.
        if (
          !(
            event.target instanceof Element &&
            event.target.closest(".dz-slide-toggle")
          )
        )
          setPlaying(false);
      }}
    >
      <div className="dz-hero-images" aria-live="off">
        {HERO_SLIDES.map(
          (photo, index) =>
            (index === 0 || images[0] !== "pending") && (
              <img
                key={photo.src}
                className={`dz-hero-image${index === frame.current ? " is-current" : index === frame.previous ? " is-previous" : ""}`}
                src={photo.src}
                alt={photo.alt}
                aria-hidden={index !== frame.current}
                width={photo.width}
                height={photo.height}
                loading="eager"
                fetchPriority={index === 0 ? "high" : "low"}
                decoding="async"
                style={
                  {
                    "--dz-slide-position": photo.position,
                    "--dz-slide-mobile-position": photo.mobilePosition,
                  } as CSSProperties
                }
                onLoad={() => imageSettled(index, "ready")}
                onError={() => imageSettled(index, "failed")}
              />
            ),
        )}
      </div>
      <div className="dz-hero-shade" aria-hidden="true" />
      <div className="dz-shell dz-hero-content">
        <p className="dz-eyebrow dz-eyebrow-light">Paal 20 · De Koog · Texel</p>
        <h1 id="dz-hero-title">
          Uitwaaien.
          <br />
          <em>Opwarmen.</em>
          <br />
          Genieten.
        </h1>
        <p className="dz-hero-copy">
          De zee voor je. Een goed glas op tafel.
          <br />
          En alle tijd om nog even te blijven.
        </p>
        <div className="dz-actions">
          <BookingLink />
          <a className="dz-button dz-button-glass" href="#menu">
            Bekijk de menukaart
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <button
          type="button"
          className="dz-hero-webcam"
          aria-haspopup="dialog"
          onClick={onOpenWebcam}
        >
          <Play size={16} aria-hidden="true" />
          Bekijk de strandwebcam
          <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
      <div className="dz-shell dz-hero-bottom">
        <span className="dz-hero-tagline">Koffie · Lunch · Borrel · Diner</span>
        <div className="dz-hero-tools">
          <div
            className="dz-slideshow-controls"
            role="group"
            aria-label="Bediening diavoorstelling"
          >
            <button
              type="button"
              className="dz-slide-toggle"
              onClick={() => setPlaying((value) => !value)}
              aria-label={
                playing
                  ? "Diavoorstelling pauzeren"
                  : "Diavoorstelling afspelen"
              }
              title={
                playing
                  ? "Diavoorstelling pauzeren"
                  : "Diavoorstelling afspelen"
              }
            >
              {playing ? (
                <Pause size={13} aria-hidden="true" />
              ) : (
                <Play size={13} aria-hidden="true" />
              )}
            </button>
            <div
              className="dz-slide-dots"
              role="group"
              aria-label="Foto kiezen"
            >
              {HERO_SLIDES.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  className="dz-slide-dot"
                  aria-label={`Foto ${index + 1}: ${photo.label}${images[index] === "failed" ? " (niet beschikbaar)" : images[index] === "pending" ? " (wordt geladen)" : ""}`}
                  aria-pressed={index === frame.current}
                  aria-disabled={images[index] !== "ready" || transitioning}
                  onClick={() => selectPhoto(index)}
                >
                  <span aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
          <a
            className="dz-hero-discover"
            href="#welkom"
            aria-label="Ontdek Dikke Zeehond"
          >
            <span>Voel je welkom</span>
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#top"
      className={`dz-brand${light ? " dz-brand-light" : ""}`}
      aria-label="Dikke Zeehond — naar boven"
    >
      <img
        className="dz-brand-symbol"
        src="/brand/logo_Dikke_transparent_cropped.png"
        alt=""
        width={831}
        height={838}
      />
      <img
        className="dz-brand-word"
        src="/brand/logo_text_white_transparent_cropped.png"
        alt=""
        width={1732}
        height={769}
      />
    </a>
  );
}

function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`dz-dialog${wide ? " dz-dialog-wide" : ""}`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const r = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          onClose();
      }}
    >
      <div className="dz-dialog-header">
        <div>
          {eyebrow && <p className="dz-eyebrow">{eyebrow}</p>}
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          type="button"
          className="dz-icon-button"
          aria-label="Venster sluiten"
          onClick={onClose}
        >
          <X size={23} />
        </button>
      </div>
      {open && <div className="dz-dialog-body">{children}</div>}
    </dialog>
  );
}

function ContactForm({ job = false }: { job?: boolean }) {
  const id = useId();
  const sending = useRef(false);
  const request = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) || "").trim();
    const payload = {
      name: value("name"),
      email: value("email"),
      phone: value("phone"),
      message: value("message"),
      website: value("website"),
      ...(job ? { topic: "Werken bij" } : {}),
    };
    if (!payload.name || !payload.email || !payload.message) {
      setStatus({
        type: "error",
        message: "Vul je naam, e-mailadres en bericht in.",
      });
      return;
    }
    sending.current = true;
    setBusy(true);
    setStatus(null);
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(
          "Verzenden is niet gelukt. Probeer het opnieuw of mail ons rechtstreeks.",
        );
      form.reset();
      setStatus({
        type: "success",
        message: job
          ? "Bedankt voor je sollicitatie. We nemen contact met je op."
          : "Bedankt! Je bericht is verstuurd. We nemen contact met je op.",
      });
    } catch {
      if (request.current === controller)
        setStatus({
          type: "error",
          message:
            "We konden je bericht niet versturen. Probeer het opnieuw of mail ons rechtstreeks.",
        });
    } finally {
      window.clearTimeout(timeout);
      sending.current = false;
      setBusy(false);
      request.current = null;
    }
  }

  return (
    <form className="dz-form" onSubmit={submit} aria-busy={busy}>
      <div className="dz-honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Laat dit veld leeg</label>
        <input
          id={`${id}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <fieldset disabled={busy}>
        <legend className="dz-sr-only">
          {job ? "Solliciteren" : "Contact opnemen"}
        </legend>
        <div className="dz-form-row">
          <div>
            <label htmlFor={`${id}-name`}>Naam</label>
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              required
              maxLength={150}
              placeholder="Je naam"
            />
          </div>
          <div>
            <label htmlFor={`${id}-email`}>E-mail</label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="naam@voorbeeld.nl"
            />
          </div>
        </div>
        <label htmlFor={`${id}-phone`}>
          Telefoon <span>(optioneel)</span>
        </label>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          placeholder="Je telefoonnummer"
        />
        <label htmlFor={`${id}-message`}>
          {job ? "Vertel ons wat je zoekt" : "Je bericht"}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          required
          maxLength={6000}
          placeholder={
            job
              ? "Welke functie, vanaf wanneer en hoeveel uur?"
              : "Waar kunnen we je mee helpen?"
          }
        />
        <p className="dz-form-note">
          We gebruiken je gegevens om op je {job ? "sollicitatie" : "bericht"}{" "}
          te reageren.
        </p>
        <button className="dz-button" type="submit" disabled={busy}>
          {busy
            ? "Verzenden…"
            : job
              ? "Verstuur sollicitatie"
              : "Verstuur bericht"}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </fieldset>
      {status && (
        <p
          className={`dz-form-status dz-form-status-${status.type}`}
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.type === "success" && <Check size={18} aria-hidden="true" />}
          {status.message}
        </p>
      )}
      <p className="dz-form-note">
        Liever mailen?{" "}
        <a
          href={`mailto:${SITE.email}${job ? "?subject=Sollicitatie%20Dikke%20Zeehond" : ""}`}
        >
          {SITE.email}
        </a>
      </p>
    </form>
  );
}

function NearViewport({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled]);
  return <div ref={ref}>{enabled && near ? children : null}</div>;
}

export default function Home() {
  const [today, setToday] = useState(amsterdamDate);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [external, setExternal] = useState(false);
  const [consentBanner, setConsentBanner] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const christmasVisible =
    today >= CHRISTMAS.announcementFrom && today <= CHRISTMAS.date;
  const holidaysVisible =
    today >= CHRISTMAS.announcementFrom && today <= CHRISTMAS.holidaysUntil;
  const winterStarted = today >= "2026-11-02";
  const year = today.slice(0, 4);

  useEffect(() => {
    const value = readConsent();
    setExternal(value?.externalContent ?? false);
    setConsentBanner(value === null);
    const timer = window.setInterval(() => setToday(amsterdamDate()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Dikke Zeehond | Strandpaviljoen De Koog, Texel";
    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const existed = Boolean(description);
    const oldDescription = description?.content || "";
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content =
      "Uitwaaien, opwarmen en genieten bij Dikke Zeehond. Koffie, lunch, borrel en diner aan het strand van De Koog op Texel. Bekijk de kaart en reserveer.";
    return () => {
      document.title = oldTitle;
      if (existed) description!.content = oldDescription;
      else description?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mobileMenu) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenu(false);
        menuButton.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !navRef.current?.contains(event.target)
      )
        setMobileMenu(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [mobileMenu]);

  // Bestaande gedeelde links naar webcam, werken en contact blijven bruikbaar.
  useEffect(() => {
    const handleHash = () => {
      if (
        ["#werken", "#werkenbij", "#solliciteren"].includes(
          window.location.hash,
        )
      )
        setPanel("jobs");
      else if (window.location.hash === "#webcam") setPanel("webcam");
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function chooseConsent(allow: boolean) {
    try {
      window.localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ necessary: true, externalContent: allow }),
      );
    } catch {
      /* Keuze geldt dan voor deze sessie. */
    }
    setExternal(allow);
    setConsentBanner(false);
    if (!allow) setShowMap(false);
  }

  const navItems = [
    { href: "#menu", text: "Menukaart" },
    { href: "#sfeer", text: "Sfeer" },
    { href: "#groepen", text: "Groepen & vieren" },
    { href: "#contact", text: "Bezoek ons" },
  ];

  return (
    <div id="top" className="dz-home">
      <style>{STYLES}</style>
      <a className="dz-skip" href="#main">
        Naar de inhoud
      </a>

      {christmasVisible && (
        <a className="dz-announcement" href="#kerstmenu">
          <span>26 december</span>
          <span className="dz-announcement-dot" aria-hidden="true">
            ·
          </span>
          <span>Kerst aan zee</span>
          <span className="dz-announcement-extra"> — bekijk ons kerstmenu</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      )}

      <header ref={navRef} className="dz-header">
        <div className="dz-shell dz-header-inner">
          <Brand />
          <nav aria-label="Hoofdnavigatie" className="dz-desktop-nav">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.text}
              </a>
            ))}
            <button
              type="button"
              className="dz-nav-webcam"
              aria-haspopup="dialog"
              onClick={() => setPanel("webcam")}
            >
              <Play size={14} aria-hidden="true" />
              Strandwebcam
            </button>
          </nav>
          <BookingLink className="dz-button dz-header-booking">
            Reserveer
          </BookingLink>
          <button
            ref={menuButton}
            type="button"
            className="dz-menu-toggle"
            aria-expanded={mobileMenu}
            aria-controls="dz-mobile-menu"
            aria-label={mobileMenu ? "Menu sluiten" : "Menu openen"}
            onClick={() => setMobileMenu((value) => !value)}
          >
            {mobileMenu ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
        {mobileMenu && (
          <nav
            id="dz-mobile-menu"
            className="dz-mobile-nav"
            aria-label="Mobiele navigatie"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenu(false)}
              >
                {item.text}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ))}
            <button
              type="button"
              className="dz-mobile-nav-webcam"
              aria-haspopup="dialog"
              onClick={() => {
                setMobileMenu(false);
                setPanel("webcam");
              }}
            >
              <span>
                <Play size={16} aria-hidden="true" />
                Strandwebcam
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>
            <BookingLink onClick={() => setMobileMenu(false)} />
            <div className="dz-mobile-nav-extra">
              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  setPanel("jobs");
                }}
              >
                Werken bij
              </button>
            </div>
          </nav>
        )}
      </header>

      <main id="main">
        <HeroSlideshow onOpenWebcam={() => setPanel("webcam")} />

        <section
          id="welkom"
          className="dz-intro dz-shell"
          aria-labelledby="dz-intro-title"
        >
          <div>
            <p className="dz-eyebrow">Een fijne plek aan zee</p>
            <h2 id="dz-intro-title">
              Even uitwaaien.
              <br />
              <em>Lekker blijven hangen.</em>
            </h2>
          </div>
          <div className="dz-intro-copy">
            <p>
              Na een strandwandeling, voor een lange lunch of zomaar omdat je op
              Texel bent. Bij Dikke Zeehond schuif je aan voor goed eten en een
              ontspannen middag of avond aan zee.
            </p>
            <a className="dz-text-link" href="#sfeer">
              Ontdek de sfeer
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section
          id="menu"
          className="dz-food dz-section"
          aria-labelledby="dz-food-title"
        >
          <div className="dz-shell dz-food-grid">
            <div className="dz-food-visual">
              <img
                src={PHOTOS.food}
                alt="Een tafel met kleurrijke gerechten, brood en kleine schaaltjes bij Dikke Zeehond"
                width={2048}
                height={1365}
                loading="lazy"
                decoding="async"
              />
              <div className="dz-photo-note">
                <Waves size={22} aria-hidden="true" />
                <span>Met uitzicht smaakt alles beter.</span>
              </div>
            </div>
            <div className="dz-food-copy">
              <p className="dz-eyebrow">Eten & drinken</p>
              <h2 id="dz-food-title">
                Een lange lunch.
                <br />
                Een goed glas.
                <br />
                <em>De zee erbij.</em>
              </h2>
              <p>
                Van koffie met iets lekkers tot uitgebreid tafelen. Kies een
                plek bij het raam, bestel waar je zin in hebt en laat de middag
                rustig overgaan in de avond.
              </p>
              <div className="dz-menu-moments">
                <div>
                  <span>01</span>
                  <p>
                    <strong>Voor de trek</strong>Een ontspannen lunch na het
                    strand.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    <strong>Om op te proosten</strong>Een borrel en iets lekkers
                    om te delen.
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <p>
                    <strong>Om voor te blijven</strong>Alle tijd voor een fijn
                    diner.
                  </p>
                </div>
              </div>
              <a
                className="dz-button"
                href={SITE.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bekijk de actuele menukaart
                <ArrowUpRight size={17} aria-hidden="true" />
                <span className="dz-sr-only"> (PDF in een nieuw tabblad)</span>
              </a>
              <p className="dz-small-note">
                Allergieën of dieetwensen? Vertel het ons team.
              </p>
            </div>
          </div>
        </section>

        {christmasVisible && (
          <section
            id="kerstmenu"
            className="dz-christmas dz-section"
            aria-labelledby="dz-christmas-title"
          >
            <div className="dz-shell dz-christmas-grid">
              <div className="dz-christmas-copy">
                <p className="dz-eyebrow dz-eyebrow-light">
                  <Plus size={15} aria-hidden="true" />
                  Tweede kerstdag · 26 december 2026
                </p>
                <h2 id="dz-christmas-title">
                  Kerst.
                  <br />
                  <em>Met uitzicht.</em>
                </h2>
                <p>
                  Vier tweede kerstdag aan zee. Een feestelijk diner, een goed
                  glas en alle aandacht voor elkaar.
                </p>
                <div className="dz-christmas-menu">
                  <div>
                    <strong>4 gangen & een amuse</strong>
                    <span>Met vegetarische keuzes</span>
                  </div>
                  <p className="dz-price">
                    <span>€</span>
                    {CHRISTMAS.price}
                    <small>per persoon</small>
                  </p>
                </div>
                <p className="dz-christmas-reservation">
                  Op 26 december ’s avonds, uitsluitend op reservering.
                </p>
                <div className="dz-actions">
                  <BookingLink christmas>
                    Reserveer voor 26 december
                  </BookingLink>
                  <a
                    className="dz-text-link dz-text-link-light"
                    href={CHRISTMAS.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Bekijk het kerstmenu (PDF)
                    <ArrowUpRight size={17} aria-hidden="true" />
                    <span className="dz-sr-only">
                      {" "}
                      (opent in een nieuw tabblad)
                    </span>
                  </a>
                </div>
                <p className="dz-small-note">
                  Geef allergieën en dieetwensen door bij je reservering.
                </p>
              </div>
              <a
                className="dz-christmas-image"
                href={CHRISTMAS.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open het kerstmenu voor 26 december 2026 als PDF (nieuw tabblad)"
              >
                <img
                  src={CHRISTMAS.image}
                  alt="Kerstmenu Dikke Zeehond: vier gangen en een amuse, met vegetarische opties (V)."
                  width={1654}
                  height={2339}
                  loading="lazy"
                  decoding="async"
                />
                <span>
                  Bekijk de volledige kaart (PDF)
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </a>
            </div>
          </section>
        )}

        <section
          id="sfeer"
          className="dz-atmosphere dz-section"
          aria-labelledby="dz-atmosphere-title"
        >
          <div className="dz-shell">
            <div className="dz-section-heading">
              <div>
                <p className="dz-eyebrow">Dit is Dikke Zeehond</p>
                <h2 id="dz-atmosphere-title">
                  Warm binnen.
                  <br />
                  <em>Zee voor de deur.</em>
                </h2>
              </div>
              <p>
                Hout, warme kleuren en een plek aan het raam. Buiten de frisse
                zeelucht, binnen alle tijd voor elkaar.
              </p>
            </div>
            <div className="dz-gallery">
              {GALLERY.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  className={`dz-gallery-item ${photo.className}`}
                  onClick={() => setGalleryIndex(index)}
                  aria-label={`Vergroot foto: ${photo.label}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    {photo.label}
                    <Plus size={20} aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
            <a
              className="dz-text-link dz-instagram-link"
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={17} aria-hidden="true" />
              Meer momenten van Dikke Zeehond
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section
          id="groepen"
          className="dz-groups dz-section"
          aria-labelledby="dz-groups-title"
        >
          <div className="dz-shell dz-groups-grid">
            <div className="dz-groups-image">
              <img
                src={PHOTOS.interior}
                alt="Een lange houten tafel en kleurrijke stoelen in het eigen paviljoen van Dikke Zeehond"
                width={2048}
                height={1365}
                loading="lazy"
                decoding="async"
              />
              <span>Een mooie plek voor jullie moment.</span>
            </div>
            <div className="dz-groups-copy">
              <p className="dz-eyebrow">Groepen & vieren</p>
              <h2 id="dz-groups-title">
                Samen aan tafel.
                <br />
                <em>Iets te vieren.</em>
              </h2>
              <p>
                Een verjaardag, een bedrijfsborrel of een diner met de hele
                familie. We denken graag mee over jullie moment aan zee.
              </p>
              <div className="dz-group-options">
                <a href={groupMail("Groepsdiner")}>
                  <span>
                    <strong>Lang tafelen</strong>
                    <small>Een diner met vrienden, familie of collega’s.</small>
                  </span>
                  <ArrowUpRight size={21} aria-hidden="true" />
                </a>
                <a href={groupMail("Borrel")}>
                  <span>
                    <strong>Samen proosten</strong>
                    <small>
                      Een ontspannen borrel, met de zee op de achtergrond.
                    </small>
                  </span>
                  <ArrowUpRight size={21} aria-hidden="true" />
                </a>
                <a href={groupMail("Feest of bruiloft")}>
                  <span>
                    <strong>Een bijzondere dag</strong>
                    <small>
                      Een feest of bruiloft dat past bij jullie wensen.
                    </small>
                  </span>
                  <ArrowUpRight size={21} aria-hidden="true" />
                </a>
              </div>
              <a
                className="dz-button dz-button-dark"
                href={groupMail("Groepsaanvraag")}
              >
                Bespreek de mogelijkheden
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <p className="dz-small-note">
                Met meer dan 10 personen? Mail{" "}
                <a href={`mailto:${SITE.groupsEmail}`}>{SITE.groupsEmail}</a>.
              </p>
            </div>
          </div>
        </section>

        <section
          className="dz-reviews dz-section"
          aria-labelledby="dz-reviews-title"
        >
          <div className="dz-shell">
            <div className="dz-section-heading">
              <div>
                <p className="dz-eyebrow">Ervaringen van onze gasten</p>
                <h2 id="dz-reviews-title">
                  Fijn als je
                  <br />
                  <em>nog eens terugkomt.</em>
                </h2>
              </div>
              <a
                className="dz-text-link"
                href={SITE.maps}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bekijk ons op Google
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
            {external ? (
              <div className="dz-live-reviews">
                <NearViewport enabled={external}>
                  <GoogleReviewsWidget />
                </NearViewport>
              </div>
            ) : (
              <div className="dz-review-invitation">
                <div>
                  <p>
                    Lees hoe anderen hun bezoek aan Dikke Zeehond hebben
                    ervaren.
                  </p>
                  <span>
                    De beoordelingen worden geladen via een externe dienst.
                  </span>
                </div>
                <button
                  className="dz-button dz-button-outline"
                  type="button"
                  onClick={() => chooseConsent(true)}
                >
                  Toestaan & beoordelingen laden
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          id="contact"
          className="dz-visit dz-section"
          aria-labelledby="dz-visit-title"
        >
          <span id="location" className="dz-anchor" />
          <div className="dz-shell">
            <div className="dz-section-heading">
              <div>
                <p className="dz-eyebrow">Je bent welkom</p>
                <h2 id="dz-visit-title">Tot aan zee.</h2>
              </div>
              <BookingLink />
            </div>
            <div className="dz-visit-grid">
              <div className="dz-address">
                <MapPin size={22} aria-hidden="true" />
                <h3>Paal 20, De Koog</h3>
                <p>
                  {SITE.address}
                  <br />
                  {SITE.city}
                </p>
                <a
                  className="dz-text-link"
                  href={SITE.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Plan je route
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <div className="dz-contact-links">
                  <a href={SITE.phoneHref}>
                    <Phone size={17} aria-hidden="true" />
                    {SITE.phone}
                  </a>
                  <a href={`mailto:${SITE.email}`}>
                    <Mail size={17} aria-hidden="true" />
                    {SITE.email}
                  </a>
                </div>
                <button
                  type="button"
                  className="dz-text-link"
                  onClick={() => setPanel("contact")}
                >
                  Stuur ons een bericht
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
              <div className="dz-hours">
                <Clock3 size={22} aria-hidden="true" />
                <h3>Openingstijden</h3>
                {!winterStarted && (
                  <p className="dz-hours-current">
                    Tot 2 november dagelijks open vanaf 11.00 uur.
                  </p>
                )}
                <p className="dz-hours-label">Keuken · vanaf 2 november 2026</p>
                <dl>
                  <div>
                    <dt>Zondag t/m donderdag</dt>
                    <dd>10.00–19.00</dd>
                  </div>
                  <div>
                    <dt>Vrijdag & zaterdag</dt>
                    <dd>10.00–19.30</dd>
                  </div>
                </dl>
                <p className="dz-small-note">
                  Dit zijn de keukentijden. Vragen over je bezoek? Bel ons
                  gerust.
                </p>
                {holidaysVisible && (
                  <details className="dz-holiday-hours">
                    <summary>
                      Feestdagen & kerstvakantie
                      <ChevronDown size={17} aria-hidden="true" />
                    </summary>
                    <dl>
                      <div>
                        <dt>25 december</dt>
                        <dd>Gesloten</dd>
                      </div>
                      <div>
                        <dt>26 december</dt>
                        <dd>Open; ’s avonds kerstmenu op reservering</dd>
                      </div>
                      <div>
                        <dt>Kerstvakantie</dt>
                        <dd>10.00–20.00</dd>
                      </div>
                      <div>
                        <dt>31 december</dt>
                        <dd>Open tot 17.00</dd>
                      </div>
                      <div>
                        <dt>1 januari</dt>
                        <dd>Open vanaf 13.00</dd>
                      </div>
                    </dl>
                  </details>
                )}
              </div>
              <div className="dz-visit-image">
                {showMap && external ? (
                  <iframe
                    title="Locatie Dikke Zeehond op Google Maps"
                    src={`https://www.google.com/maps?q=${encodeURIComponent("Strandpaviljoen Dikke Zeehond, De Koog, Texel")}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={PHOTOS.sea}
                      alt="Uitzicht vanaf het terras van Dikke Zeehond"
                      width={2048}
                      height={1365}
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <p>
                        Het strand is dichterbij
                        <br />
                        dan je denkt.
                      </p>
                      <button
                        className="dz-button dz-button-white"
                        type="button"
                        onClick={() => {
                          chooseConsent(true);
                          setShowMap(true);
                        }}
                      >
                        Toestaan & kaart laden
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="dz-footer">
        <div className="dz-shell">
          <div className="dz-footer-top">
            <div>
              <Brand light />
              <p>
                Een fijne plek aan het strand.
                <br />
                Het hele jaar door.
              </p>
            </div>
            <div className="dz-footer-links">
              <a href="#menu">Menukaart</a>
              <a href="#groepen">Groepen & vieren</a>
              <a href="#contact">Openingstijden & contact</a>
              {christmasVisible && <a href="#kerstmenu">Kerst aan zee</a>}
            </div>
            <div className="dz-footer-links">
              <button type="button" onClick={() => setPanel("webcam")}>
                Strandwebcam
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setPanel("jobs")}>
                Werken bij Dikke Zeehond
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <button type="button" onClick={() => setConsentBanner(true)}>
                Privacyvoorkeuren
              </button>
            </div>
          </div>
          <div className="dz-footer-bottom">
            <span>© {year} Dikke Zeehond</span>
            <span>
              Strandpaviljoen Dikke Zeehond V.O.F. · KvK 90208366 · Vestiging
              000045750343
            </span>
            <span>De Koog, Texel</span>
          </div>
        </div>
      </footer>

      <nav
        className="dz-mobile-bar"
        aria-label="Snel naar menukaart, strandwebcam en reserveren"
      >
        <a href="#menu">
          Menukaart
          <ArrowRight size={16} aria-hidden="true" />
        </a>
        <button
          type="button"
          className="dz-mobile-webcam"
          aria-label="Bekijk de strandwebcam"
          aria-haspopup="dialog"
          onClick={() => {
            setMobileMenu(false);
            setPanel("webcam");
          }}
        >
          <Play size={15} aria-hidden="true" />
          Webcam
        </button>
        <BookingLink>Reserveer</BookingLink>
      </nav>

      {consentBanner && (
        <aside
          className="dz-consent"
          role="region"
          aria-labelledby="dz-consent-title"
        >
          <button
            type="button"
            className="dz-icon-button dz-consent-close"
            aria-label="Sluiten en alleen noodzakelijke onderdelen gebruiken"
            onClick={() => chooseConsent(false)}
          >
            <X size={18} />
          </button>
          <div>
            <p id="dz-consent-title" className="dz-consent-title">
              Jouw privacy, jouw keuze.
            </p>
            <p>
              Voor beoordelingen, de kaart en de webcam laden we externe inhoud.
              Jij kiest of je die wilt toestaan.
            </p>
          </div>
          <div className="dz-consent-actions">
            <button
              type="button"
              className="dz-button dz-button-outline"
              onClick={() => chooseConsent(false)}
            >
              Alleen noodzakelijk
            </button>
            <button
              type="button"
              className="dz-button dz-button-dark"
              onClick={() => chooseConsent(true)}
            >
              Alles toestaan
            </button>
          </div>
        </aside>
      )}

      <Modal
        open={panel === "contact"}
        onClose={() => setPanel(null)}
        title="Stuur ons een bericht"
        eyebrow="We horen graag van je"
      >
        <p>
          Een vraag over je bezoek? Laat een bericht achter. Voor groepen kun je
          rechtstreeks mailen naar{" "}
          <a href={`mailto:${SITE.groupsEmail}`}>{SITE.groupsEmail}</a>.
        </p>
        <ContactForm />
      </Modal>
      <Modal
        open={panel === "jobs"}
        onClose={() => setPanel(null)}
        title="Een werkplek aan zee"
        eyebrow="Werken bij Dikke Zeehond"
      >
        <p>
          We zoeken mensen voor de bediening, keuken, afwas en allround
          werkzaamheden. Vertel ons waar jij energie van krijgt en wanneer je
          beschikbaar bent.
        </p>
        <div className="dz-job-benefits">
          <span>Flexibele uren</span>
          <span>Een gezellig team</span>
          <span>Werken op Texel</span>
        </div>
        <ContactForm job />
      </Modal>
      <Modal
        open={panel === "webcam"}
        onClose={() => setPanel(null)}
        title="Even naar de zee kijken"
        eyebrow="Strandwebcam"
        wide
      >
        {external ? (
          <div className="dz-webcam-frame">
            <iframe
              title="Live strandwebcam Dikke Zeehond"
              src={SITE.webcamEmbed}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="dz-webcam-poster">
            <img
              src={PHOTOS.sea}
              alt="Het terras met uitzicht op zee"
              width={2048}
              height={1365}
            />
            <div>
              <Play size={34} aria-hidden="true" />
              <p>Laad de live webcam via YouTube.</p>
              <button
                className="dz-button"
                type="button"
                onClick={() => chooseConsent(true)}
              >
                Toestaan & webcam bekijken
              </button>
            </div>
          </div>
        )}
        <a
          className="dz-text-link"
          href={SITE.webcam}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open de webcam op YouTube
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </Modal>
      <Modal
        open={galleryIndex !== null}
        onClose={() => setGalleryIndex(null)}
        title={galleryIndex !== null ? GALLERY[galleryIndex].label : "De sfeer"}
        eyebrow="Dikke Zeehond"
        wide
      >
        {galleryIndex !== null && (
          <img
            className="dz-lightbox-image"
            src={GALLERY[galleryIndex].src}
            alt={GALLERY[galleryIndex].alt}
          />
        )}
      </Modal>
    </div>
  );
}

const STYLES = `
.dz-home{--dz-cream:#f6f2ea;--dz-paper:#eee6da;--dz-ink:#30382d;--dz-muted:#66665b;--dz-olive:#343e30;--dz-rust:#a74f36;--dz-line:#d8d1c4;background:var(--dz-cream);color:var(--dz-ink);font-family:"DM Sans",Arial,sans-serif;font-size:16px;line-height:1.65;overflow-x:clip;-webkit-font-smoothing:antialiased}
.dz-home *,.dz-home *::before,.dz-home *::after{box-sizing:border-box}
.dz-home h1,.dz-home h2,.dz-home h3,.dz-home p,.dz-home figure,.dz-home dl,.dz-home dd{margin:0}
.dz-home h1,.dz-home h2,.dz-home h3{font-family:Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-.045em;text-wrap:balance}
.dz-home h2{font-size:clamp(2.5rem,4.1vw,4.15rem);line-height:1.09}
.dz-home h3{font-size:1.75rem;line-height:1.2;letter-spacing:-.025em}
.dz-home h1 em,.dz-home h2 em{font-weight:400}
.dz-home a{color:inherit;text-decoration:none}
.dz-home button,.dz-home input,.dz-home textarea{font:inherit}
.dz-home button{cursor:pointer}
.dz-home button:disabled{cursor:wait;opacity:.65}
.dz-home img{display:block;max-width:100%}
.dz-home svg{flex-shrink:0}
.dz-home :focus-visible{outline:3px solid #a74f36;outline-offset:5px}
.dz-home .dz-hero :focus-visible,.dz-home .dz-footer :focus-visible,.dz-home .dz-christmas :focus-visible{outline-color:#f5dfb8}
.dz-home ::selection{background:#d5b08e;color:#242a22}
.dz-home section[id],.dz-home main[id],.dz-home .dz-anchor{scroll-margin-top:110px}
.dz-shell{width:min(1240px,calc(100% - 112px));margin-inline:auto}
.dz-section{padding-block:96px}
.dz-eyebrow{display:flex;align-items:center;gap:10px;font-size:10px;font-weight:700;line-height:1.5;letter-spacing:.22em;text-transform:uppercase;color:var(--dz-rust);margin-bottom:22px!important}
.dz-eyebrow-light{color:#f1ddc4}
.dz-button{display:inline-flex;align-items:center;justify-content:center;gap:14px;min-height:50px;padding:13px 24px;border:1px solid transparent;border-radius:4px;background:var(--dz-rust);color:#fff!important;font-size:13px;font-weight:600;line-height:1.45;text-align:center;text-decoration:none!important;transition:background .18s ease,transform .18s ease}
.dz-button:hover{background:#8e402b;transform:translateY(-1px)}
.dz-button-dark{background:var(--dz-olive)}
.dz-button-dark:hover{background:#242d22}
.dz-button-outline{background:transparent;color:var(--dz-ink)!important;border-color:var(--dz-line)}
.dz-button-outline:hover{background:#eae3d7}
.dz-button-white{background:var(--dz-cream);color:var(--dz-ink)!important}
.dz-button-white:hover{background:#fff}
.dz-button-glass{background:transparent;border-color:rgba(255,255,255,.62);color:#fff!important}
.dz-button-glass:hover{background:rgba(255,255,255,.14)}
.dz-actions{display:flex;align-items:center;flex-wrap:wrap;gap:14px}
.dz-text-link{display:inline-flex;align-items:center;gap:12px;width:fit-content;padding:8px 0;border:0;border-bottom:1px solid var(--dz-line);background:transparent;color:var(--dz-ink);font-size:13px;font-weight:600;line-height:1.5}
.dz-text-link:hover{border-color:currentColor}
.dz-text-link-light{color:#f9f3e9!important;border-color:rgba(255,255,255,.4)}
.dz-small-note{font-size:11px;line-height:1.7;color:var(--dz-muted);margin-top:17px!important}
.dz-small-note a{text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}
.dz-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.dz-skip{position:fixed;top:-80px;left:16px;z-index:1000;padding:12px 18px;background:#fff;color:#222!important}
.dz-skip:focus{top:12px}
.dz-announcement{display:flex;align-items:center;justify-content:center;gap:12px;min-height:35px;padding:8px 20px;background:var(--dz-olive);color:#f7f0e4!important;font-size:10px;font-weight:500;letter-spacing:.08em;line-height:1.4}
.dz-announcement:hover{background:#263020}
.dz-announcement>span:first-child{text-transform:uppercase;font-size:9px;letter-spacing:.14em}
.dz-announcement-dot{opacity:.6}
.dz-header{position:sticky;top:0;z-index:60;background:rgba(246,242,234,.97);border-bottom:1px solid rgba(48,56,45,.09);backdrop-filter:blur(12px)}
.dz-header-inner{display:flex;align-items:center;gap:32px;height:87px}
.dz-brand{display:inline-flex;align-items:center;gap:10px;flex-shrink:0;line-height:1}
.dz-brand img{object-fit:contain;filter:brightness(0) saturate(100%);opacity:.85}
.dz-brand-symbol{width:42px;height:43px}
.dz-brand-word{width:105px;height:47px}
.dz-brand-light img{filter:none;opacity:1}
.dz-desktop-nav{display:flex;align-items:center;justify-content:flex-end;gap:28px;margin-left:auto}
.dz-desktop-nav a{font-size:11px;font-weight:500;white-space:nowrap;position:relative;padding-block:10px}
.dz-desktop-nav a::after{content:"";position:absolute;left:0;right:0;bottom:3px;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .18s}
.dz-desktop-nav a:hover::after{transform:scaleX(1)}
.dz-header-booking{min-height:42px;padding:10px 18px;font-size:11px}
.dz-menu-toggle{display:none;align-items:center;justify-content:center;width:44px;height:44px;border:0;background:transparent;color:var(--dz-ink)}
.dz-mobile-nav{display:none}
.dz-hero{position:relative;isolation:isolate;min-height:650px;height:calc(100svh - 122px);max-height:900px;background:#453b2e;color:#fff}
.dz-hero-images{position:absolute;inset:0;z-index:-2;isolation:isolate;overflow:hidden}
.dz-hero-image{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;object-position:var(--dz-slide-position,50% 62%);opacity:0;transition:none}
.dz-hero-image.is-previous{z-index:1;opacity:1}
.dz-hero-image.is-current{z-index:2;opacity:1;transition:opacity var(--dz-slide-duration,1400ms) ease}
.dz-hero-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(23,25,19,.68),rgba(23,25,19,.3) 49%,rgba(23,25,19,.12)),linear-gradient(0deg,rgba(20,22,18,.45),transparent 42%)}
.dz-hero-content{height:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding-block:70px 105px}
.dz-hero h1{font-size:clamp(4rem,7vw,6.65rem);line-height:.99;letter-spacing:-.055em;margin:0 0 27px;max-width:680px;color:#fff}
.dz-hero h1 em{color:#f2dfbf}
.dz-hero-copy{font-size:15px;line-height:1.8;font-weight:400;color:rgba(255,255,255,.92);margin-bottom:29px!important}
.dz-hero-bottom{position:absolute;bottom:27px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding-top:18px;border-top:1px solid rgba(255,255,255,.3);font-size:10px;font-weight:500;letter-spacing:.08em}
.dz-hero-bottom{gap:16px}
.dz-hero-tools{display:flex;align-items:center;gap:32px;flex-shrink:0}
.dz-hero-discover{display:flex;gap:18px;align-items:center}
.dz-slideshow-controls,.dz-slide-dots{display:flex;align-items:center}
.dz-slideshow-controls{gap:10px}
.dz-slide-toggle,.dz-slide-dot{display:inline-flex;align-items:center;justify-content:center;padding:0;background:transparent;color:#fff;border:0;flex-shrink:0}
.dz-slide-toggle{width:34px;height:34px;border:1px solid #ffffff70;border-radius:50%}
.dz-slide-toggle:hover{background:#ffffff20}
.dz-slide-dot{width:28px;height:34px}
.dz-slide-dot>span{width:6px;height:6px;border:1px solid #ffffffc9;border-radius:6px;background:transparent;transition:width .2s,background .2s}
.dz-slide-dot[aria-pressed=true]>span{width:20px;background:#f2dfbf;border-color:#f2dfbf}
.dz-slide-dot[aria-disabled=true]{cursor:default}
.dz-slide-dot[aria-disabled=true]:not([aria-pressed=true]){opacity:.5}
.dz-intro{display:grid;grid-template-columns:1.05fr 1fr;gap:100px;align-items:center;padding-block:82px}
.dz-intro h2{font-size:clamp(2.2rem,3vw,3.1rem)}
.dz-intro-copy>p{max-width:485px;color:var(--dz-muted);font-size:14px;line-height:1.9;margin-bottom:16px}
.dz-food{background:var(--dz-paper)}
.dz-food-grid{display:grid;grid-template-columns:1.08fr 1fr;gap:100px;align-items:center}
.dz-food-visual{position:relative;min-width:0;align-self:stretch;min-height:570px}
.dz-food-visual>img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover;object-position:48% 50%;border-radius:5px}
.dz-photo-note{position:absolute;right:-25px;bottom:34px;display:flex;align-items:center;gap:15px;max-width:calc(100% - 24px);padding:20px 25px;background:var(--dz-cream);font-family:Georgia,serif;font-size:16px;line-height:1.35;box-shadow:0 8px 35px #201b1612}
.dz-food-copy>p:not(.dz-eyebrow):not(.dz-small-note){font-size:14px;line-height:1.9;color:var(--dz-muted);margin-block:23px}
.dz-menu-moments{margin:27px 0 30px}
.dz-menu-moments>div{display:flex;gap:17px;align-items:baseline;padding:13px 0;border-top:1px solid var(--dz-line)}
.dz-menu-moments>div:last-child{border-bottom:1px solid var(--dz-line)}
.dz-menu-moments>div>span{font-size:10px;font-weight:500;color:var(--dz-rust);letter-spacing:.08em}
.dz-menu-moments p{font-size:11px;color:var(--dz-muted);line-height:1.7}
.dz-menu-moments strong{display:block;font-size:13px;font-weight:600;color:var(--dz-ink)}
.dz-christmas{background:var(--dz-olive);color:var(--dz-cream);overflow:hidden}
.dz-christmas-grid{display:grid;grid-template-columns:1.1fr .85fr;gap:130px;align-items:center}
.dz-christmas h2{font-size:clamp(3rem,5.7vw,5.8rem)}
.dz-christmas h2 em{color:#e5c8a8}
.dz-christmas-copy>p:not(.dz-eyebrow):not(.dz-small-note):not(.dz-christmas-reservation){color:#dfdfd3;font-size:14px;line-height:1.9;max-width:400px;margin-block:25px}
.dz-christmas-menu{display:flex;align-items:center;justify-content:space-between;gap:20px;border-block:1px solid #ffffff30;padding-block:22px;margin-block:28px}
.dz-christmas-menu strong{font-family:Georgia,serif;font-size:21px;font-weight:400}
.dz-christmas-menu>div>span{display:block;margin-top:5px;font-size:11px;color:#dbdaca}
.dz-price{font-family:Georgia,serif;font-size:57px;line-height:1}
.dz-price>span{font-size:23px;vertical-align:top;padding-right:5px;position:relative;top:7px}
.dz-price>small{display:block;font-family:"DM Sans",Arial,sans-serif;font-size:9px;line-height:1.5;margin-top:8px;text-align:right;color:#dbdaca}
.dz-christmas-reservation{font-size:12px;color:#f2ebdf;margin-bottom:23px!important}
.dz-christmas .dz-small-note{color:#d2d2c6}
.dz-christmas .dz-actions{gap:20px}
.dz-christmas .dz-button{background:#f0dcc1;color:#30382d!important}
.dz-christmas .dz-button:hover{background:#fff2df}
.dz-christmas-image{position:relative;display:block;width:100%;max-width:425px;justify-self:end;transform:rotate(2deg)}
.dz-christmas-image>img{width:100%;height:auto;border-radius:4px;box-shadow:0 18px 55px #0004}
.dz-christmas-image>span{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding:10px 0;border-bottom:1px solid #ffffff40;color:var(--dz-cream);font-size:11px;font-weight:600;line-height:1.5}
.dz-section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:60px;margin-bottom:43px}
.dz-section-heading>p{max-width:310px;margin-bottom:6px;font-size:13px;line-height:1.9;color:var(--dz-muted)}
.dz-gallery{display:grid;grid-template-columns:1.05fr 1fr .75fr;gap:25px;align-items:start}
.dz-gallery-item{position:relative;display:block;width:100%;padding:0;border:0;background:#e1d9cb;border-radius:4px;overflow:hidden;text-align:left;isolation:isolate}
.dz-gallery-item::after{content:"";position:absolute;inset:50% 0 0;background:linear-gradient(transparent,rgba(21,27,18,.6));pointer-events:none}
.dz-gallery-item>img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}
.dz-gallery-item:hover>img{transform:scale(1.035)}
.dz-gallery-item>span{position:absolute;left:22px;right:22px;bottom:20px;display:flex;align-items:center;justify-content:space-between;color:#fff;font-size:11px;font-weight:500;z-index:1;gap:8px}
.dz-gallery-tall{height:470px}
.dz-gallery-wide{height:340px;margin-top:50px}
.dz-gallery-small{height:390px;margin-top:80px}
.dz-instagram-link{margin-top:28px}
.dz-groups{background:#ebe6da}
.dz-groups-grid{display:grid;grid-template-columns:1fr 1fr;gap:100px;align-items:center}
.dz-groups-image{position:relative;min-height:550px;align-self:stretch}
.dz-groups-image>img{position:absolute;width:100%;height:100%;object-fit:cover;object-position:42% 50%;border-radius:4px}
.dz-groups-image>span{position:absolute;bottom:24px;left:24px;right:24px;padding:14px 18px;background:var(--dz-cream);font-family:Georgia,serif;font-size:16px;text-align:center;line-height:1.45}
.dz-groups-copy>p:not(.dz-eyebrow):not(.dz-small-note){color:var(--dz-muted);font-size:14px;line-height:1.9;margin-top:22px}
.dz-group-options{margin:25px 0 28px}
.dz-group-options>a{display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:1px solid var(--dz-line);padding:18px 0}
.dz-group-options>a:last-child{border-bottom:1px solid var(--dz-line)}
.dz-group-options>a:hover>svg{transform:translate(2px,-2px)}
.dz-group-options strong{display:block;font-family:Georgia,serif;font-size:21px;font-weight:400;letter-spacing:-.02em}
.dz-group-options small{display:block;margin-top:4px;font-size:11px;line-height:1.6;color:var(--dz-muted)}
.dz-reviews{padding-block:75px}
.dz-reviews h2{font-size:clamp(2.2rem,3.2vw,3.3rem)}
.dz-reviews .dz-section-heading{margin-bottom:30px}
.dz-review-invitation{display:flex;justify-content:space-between;align-items:center;gap:35px;padding:27px 0;border-block:1px solid var(--dz-line)}
.dz-review-invitation p{font-size:14px}
.dz-review-invitation span{display:block;margin-top:5px;font-size:11px;color:var(--dz-muted)}
.dz-review-invitation .dz-button{font-size:11px;flex-shrink:0}
.dz-live-reviews{min-height:200px}
.dz-visit{position:relative;background:#ece7dd}
.dz-anchor{position:absolute;top:0}
.dz-visit-grid{display:grid;grid-template-columns:.85fr 1.05fr 1fr;gap:48px;align-items:start}
.dz-visit-grid h3{margin:18px 0 15px;font-size:25px}
.dz-address>p{font-size:13px;color:var(--dz-muted);line-height:1.9;margin-bottom:12px}
.dz-contact-links{display:flex;flex-direction:column;gap:10px;margin:24px 0 15px}
.dz-contact-links>a{display:flex;align-items:center;gap:10px;font-size:12px;overflow-wrap:anywhere}
.dz-hours-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;margin:18px 0 12px!important}
.dz-hours-current{font-size:12px;color:var(--dz-muted)}
.dz-hours dl>div{display:flex;gap:12px;justify-content:space-between;padding:10px 0;border-top:1px solid var(--dz-line);font-size:11px;line-height:1.7}
.dz-hours dd{font-weight:600;text-align:right;flex-shrink:0}
.dz-hours .dz-small-note{font-size:10px}
.dz-holiday-hours{margin-top:22px;border-top:1px solid var(--dz-line)}
.dz-holiday-hours summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 0;cursor:pointer;list-style:none;font-size:11px;font-weight:600}
.dz-holiday-hours summary::-webkit-details-marker{display:none}
.dz-holiday-hours[open] summary svg{transform:rotate(180deg)}
.dz-holiday-hours dd{max-width:55%;flex-shrink:1}
.dz-visit-image{position:relative;isolation:isolate;min-height:355px;align-self:stretch;overflow:hidden;border-radius:4px}
.dz-visit-image>img,.dz-visit-image>iframe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}
.dz-visit-image>div{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;padding:25px;background:linear-gradient(transparent 20%,#1e261bd4)}
.dz-visit-image>div>p{color:#fff;font-family:Georgia,serif;font-size:27px;line-height:1.2;margin-bottom:20px;letter-spacing:-.025em}
.dz-visit-image .dz-button{min-height:42px;padding:11px 13px;font-size:10px;gap:7px}
.dz-footer{background:#2c3529;color:var(--dz-cream);padding-block:60px 25px}
.dz-footer-top{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:70px;padding-bottom:43px}
.dz-footer-top>div>p{font-size:12px;color:#cdcec1;line-height:1.9;margin-top:19px}
.dz-footer-links{display:flex;flex-direction:column;align-items:flex-start;gap:13px;padding-top:5px}
.dz-footer-links>a,.dz-footer-links>button{display:inline-flex;align-items:center;gap:8px;font-size:11px;color:#e1e3d8;border:0;padding:0;background:transparent;text-align:left}
.dz-footer-links>a:hover,.dz-footer-links>button:hover{text-decoration:underline;text-underline-offset:5px}
.dz-footer-bottom{display:flex;justify-content:space-between;gap:20px;padding-top:23px;border-top:1px solid #ffffff26;font-size:9px;color:#c2c6b8;line-height:1.7}
.dz-mobile-bar{display:none}
.dz-consent{position:fixed;left:24px;bottom:24px;z-index:90;width:min(490px,calc(100% - 48px));padding:22px 24px;background:var(--dz-cream);border:1px solid #c9c1b2;border-radius:6px;box-shadow:0 8px 35px #12180f26;max-height:calc(100svh - 140px);overflow-y:auto}
.dz-consent-title{font-family:Georgia,serif;font-size:20px;letter-spacing:-.02em;line-height:1.3;margin-bottom:7px!important;padding-right:23px}
.dz-consent p:not(.dz-consent-title){font-size:11px;line-height:1.7;color:var(--dz-muted);padding-right:8px}
.dz-consent-actions{display:flex;gap:10px;margin-top:15px}
.dz-consent-actions .dz-button{min-height:39px;padding:10px 13px;font-size:10px;flex:1}
.dz-icon-button{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:1px solid var(--dz-line);border-radius:50%;background:transparent;color:var(--dz-ink);flex-shrink:0}
.dz-icon-button:hover{background:var(--dz-paper)}
.dz-consent-close{position:absolute;top:13px;right:13px;border:0;width:30px;height:30px}
.dz-dialog{width:min(620px,calc(100% - 32px));max-height:calc(100svh - 40px);padding:30px;border:1px solid var(--dz-line);border-radius:8px;background:var(--dz-cream);color:var(--dz-ink);overflow-y:auto;margin:auto;box-shadow:0 20px 80px #0003;overscroll-behavior:contain}
.dz-dialog::backdrop{background:rgba(22,27,20,.65);backdrop-filter:blur(4px)}
.dz-dialog:not([open]){display:none}
.dz-dialog-wide{width:min(960px,calc(100% - 32px))}
.dz-dialog-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:21px}
.dz-dialog-header .dz-eyebrow{margin-bottom:10px!important;font-size:9px}
.dz-dialog-header h2{font-size:33px;line-height:1.15}
.dz-dialog-body>p{font-size:13px;color:var(--dz-muted);line-height:1.8}
.dz-dialog-body>p>a{text-decoration:underline;text-underline-offset:3px}
.dz-dialog-body>.dz-text-link{margin-top:17px}
.dz-form{margin-top:24px}
.dz-form fieldset{border:0;padding:0;margin:0;min-width:0}
.dz-form-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.dz-form label{display:block;font-size:11px;font-weight:600;margin-bottom:7px}
.dz-form label>span{font-weight:400;color:var(--dz-muted)}
.dz-form input,.dz-form textarea{display:block;width:100%;border:1px solid #c7c1b5;background:#fbf9f4;border-radius:3px;padding:11px 12px;margin-bottom:17px;font-size:14px;color:var(--dz-ink);line-height:1.5}
.dz-form input{min-height:46px}
.dz-form textarea{resize:vertical;min-height:120px}
.dz-form input::placeholder,.dz-form textarea::placeholder{color:#7b796f;opacity:1}
.dz-form-note{font-size:10px;line-height:1.7;color:var(--dz-muted);margin:0 0 15px!important}
.dz-form-note a{text-decoration:underline;text-underline-offset:3px}
.dz-form>.dz-form-note{margin:18px 0 0!important}
.dz-form-status{display:flex;align-items:flex-start;gap:10px;padding:14px;margin-top:18px!important;font-size:12px;line-height:1.6;border-radius:4px}
.dz-form-status-success{background:#e0e8d9;color:#2a4527}
.dz-form-status-error{background:#f4e4dc;color:#753a28}
.dz-honeypot{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}
.dz-job-benefits{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
.dz-job-benefits>span{font-size:10px;padding:6px 10px;background:var(--dz-paper);border-radius:3px}
.dz-webcam-frame,.dz-webcam-poster{position:relative;aspect-ratio:16/9;background:#343e30;overflow:hidden;border-radius:4px}
.dz-webcam-frame>iframe,.dz-webcam-poster>img{width:100%;height:100%;position:absolute;inset:0;border:0;object-fit:cover}
.dz-webcam-poster>div{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:15px;padding:20px;text-align:center;background:#17201588;color:#fff}
.dz-webcam-poster p{font-size:13px}
.dz-lightbox-image{width:100%;max-height:72svh;object-fit:contain;background:#eee6da}
@media(min-width:1550px){.dz-hero-content{padding-block:65px 105px}}
@media(max-width:1100px){.dz-shell{width:calc(100% - 72px)}.dz-header-inner{gap:22px}.dz-desktop-nav{gap:18px}.dz-food-grid,.dz-groups-grid{gap:60px}.dz-christmas-grid{gap:65px}.dz-intro{gap:60px}.dz-visit-grid{gap:28px}.dz-visit-grid{grid-template-columns:.9fr 1.15fr}.dz-visit-image{grid-column:1/-1;min-height:240px}.dz-visit-image>img{object-position:50% 55%}.dz-visit-image>div{background:linear-gradient(90deg,#1e261bd4,transparent 80%)}.dz-footer-top{gap:40px}.dz-footer-bottom>span:nth-child(2){max-width:420px}}
@media(max-width:850px){.dz-shell{width:calc(100% - 48px)}.dz-header-inner{height:74px;gap:16px}.dz-desktop-nav{display:none}.dz-header-booking{margin-left:auto}.dz-menu-toggle{display:flex}.dz-brand-symbol{width:35px;height:37px}.dz-brand-word{width:90px;height:40px}.dz-mobile-nav{display:flex;position:absolute;top:100%;left:0;right:0;flex-direction:column;background:var(--dz-cream);padding:8px 24px 22px;border-bottom:1px solid var(--dz-line);box-shadow:0 15px 25px #30382d14;max-height:calc(100svh - 90px);overflow-y:auto}.dz-mobile-nav>a:not(.dz-button){display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--dz-line);font-size:14px}.dz-mobile-nav>.dz-button{margin-top:18px}.dz-mobile-nav-extra{display:flex;justify-content:center;gap:25px;margin-top:20px}.dz-mobile-nav-extra>button{border:0;background:transparent;padding:3px;font-size:11px;color:var(--dz-muted)}.dz-section{padding-block:70px}.dz-hero{height:calc(100svh - 109px);min-height:620px;max-height:780px}.dz-hero h1{font-size:clamp(4.6rem,10vw,6rem)}.dz-intro{gap:40px;padding-block:60px}.dz-intro h2{font-size:2.4rem}.dz-intro-copy>p{font-size:13px}.dz-food-grid,.dz-groups-grid{gap:38px}.dz-food-visual{min-height:540px}.dz-photo-note{right:-15px;bottom:25px;padding:17px;font-size:14px}.dz-food-copy h2,.dz-groups-copy h2{font-size:2.8rem}.dz-food-copy>p:not(.dz-eyebrow):not(.dz-small-note),.dz-groups-copy>p:not(.dz-eyebrow):not(.dz-small-note){font-size:13px}.dz-christmas-grid{gap:45px;grid-template-columns:1.15fr .85fr}.dz-christmas h2{font-size:3.9rem}.dz-christmas .dz-eyebrow{font-size:9px}.dz-christmas-menu strong{font-size:18px}.dz-price{font-size:45px}.dz-christmas-image{transform:rotate(1deg)}.dz-gallery{gap:16px}.dz-gallery-tall{height:390px}.dz-gallery-wide{height:285px;margin-top:35px}.dz-gallery-small{height:320px;margin-top:60px}.dz-gallery-item>span{left:15px;right:15px;font-size:10px}.dz-section-heading{gap:35px}.dz-section-heading>p{max-width:250px;font-size:12px}.dz-groups-image{min-height:520px}.dz-groups-image>span{left:15px;right:15px;font-size:14px}.dz-review-invitation{align-items:flex-start;flex-direction:column;gap:20px}.dz-footer-bottom{flex-wrap:wrap}.dz-footer-bottom>span:nth-child(2){order:3;width:100%;max-width:none}}
@media(max-width:620px){.dz-shell{width:calc(100% - 40px)}.dz-section{padding-block:55px}.dz-home h2{font-size:2.6rem}.dz-eyebrow{font-size:9px;margin-bottom:17px!important;letter-spacing:.17em}.dz-announcement{gap:8px;font-size:10px;min-height:34px}.dz-announcement-extra{display:none}.dz-header-inner{height:70px;gap:10px}.dz-brand{gap:8px}.dz-brand-symbol{width:31px;height:33px}.dz-brand-word{width:78px;height:35px}.dz-header-booking{min-height:38px;padding:9px 13px;font-size:10px;gap:7px}.dz-menu-toggle{width:36px}.dz-hero{min-height:610px;height:calc(100svh - 104px);max-height:790px}.dz-hero-image{object-position:var(--dz-slide-mobile-position,68% 50%)}.dz-hero-shade{background:linear-gradient(90deg,#161b14a6,#161b1452),linear-gradient(0deg,#161b1480,transparent 65%)}.dz-hero-content{padding-block:53px 98px;justify-content:center}.dz-hero h1{font-size:clamp(3.7rem,14.4vw,5.6rem);line-height:1.01;margin-bottom:24px}.dz-hero-copy{font-size:13px;line-height:1.85;margin-bottom:27px!important}.dz-hero .dz-actions{gap:10px;width:100%;flex-direction:column;align-items:flex-start}.dz-hero .dz-button{min-height:47px;padding:12px 18px;min-width:220px;font-size:12px}.dz-hero-bottom{bottom:24px;font-size:9px;padding-top:15px;letter-spacing:.02em}.dz-hero-bottom{gap:10px}.dz-hero-tools{gap:8px}.dz-hero-discover{gap:9px}.dz-hero-discover>span{display:none}.dz-slideshow-controls{gap:4px}.dz-slide-toggle{width:32px;height:32px}.dz-slide-dot{width:24px;height:32px}.dz-slide-dot[aria-pressed=true]>span{width:17px}.dz-intro{grid-template-columns:1fr;gap:23px;padding-block:46px}.dz-intro h2{font-size:2.25rem}.dz-intro-copy>p{font-size:13px;line-height:1.9;margin-bottom:13px}.dz-food-grid{grid-template-columns:1fr;gap:35px}.dz-food-visual{min-height:0;height:390px}.dz-food-visual>img{object-position:50% 50%}.dz-photo-note{right:-5px;bottom:23px;font-size:14px;gap:12px;padding:17px}.dz-food-copy h2{font-size:2.8rem}.dz-food-copy>p:not(.dz-eyebrow):not(.dz-small-note){font-size:13px;margin-block:20px}.dz-menu-moments{margin-block:22px 25px}.dz-menu-moments>div{padding-block:12px}.dz-food-copy>.dz-button{width:100%;font-size:12px}.dz-christmas-grid{grid-template-columns:1fr;gap:35px}.dz-christmas h2{font-size:3.9rem}.dz-christmas-copy>p:not(.dz-eyebrow):not(.dz-small-note):not(.dz-christmas-reservation){font-size:13px;margin-block:20px}.dz-christmas-menu{margin-block:23px;padding-block:19px}.dz-christmas-menu strong{font-size:20px}.dz-price{font-size:52px}.dz-christmas .dz-actions{align-items:flex-start;flex-direction:column;gap:14px}.dz-christmas .dz-button{width:100%;font-size:12px}.dz-christmas-image{width:84%;max-width:330px;justify-self:center;transform:rotate(1deg)}.dz-christmas-image>span{font-size:10px}.dz-section-heading{display:block;margin-bottom:28px}.dz-section-heading>p{max-width:none;font-size:13px;margin-top:20px;margin-bottom:0}.dz-section-heading>.dz-text-link,.dz-section-heading>.dz-button{margin-top:23px}.dz-gallery{grid-template-columns:1fr 1fr;gap:12px}.dz-gallery-tall{grid-row:span 2;height:435px}.dz-gallery-wide{margin-top:0;height:210px}.dz-gallery-small{margin-top:0;height:213px}.dz-gallery-item>span{font-size:9px;bottom:13px;left:12px;right:12px;line-height:1.4}.dz-gallery-item>span>svg{width:15px;height:15px}.dz-instagram-link{font-size:11px;margin-top:22px}.dz-groups-grid{grid-template-columns:1fr;gap:35px}.dz-groups-image{min-height:0;height:360px}.dz-groups-image>img{object-position:45% 50%}.dz-groups-image>span{bottom:18px;padding:12px 15px;font-size:15px}.dz-groups-copy h2{font-size:2.7rem}.dz-group-options>a{padding-block:16px}.dz-group-options strong{font-size:21px}.dz-groups-copy>.dz-button{width:100%;font-size:12px}.dz-reviews h2{font-size:2.4rem}.dz-review-invitation{padding-block:22px;gap:18px}.dz-review-invitation p{font-size:13px}.dz-review-invitation .dz-button{width:100%;font-size:11px}.dz-review-invitation span{font-size:10px}.dz-visit-grid{grid-template-columns:1fr;gap:35px}.dz-visit-grid h3{font-size:25px}.dz-address{padding-bottom:28px;border-bottom:1px solid var(--dz-line)}.dz-visit .dz-section-heading>.dz-button{width:100%}.dz-address>p{font-size:13px}.dz-contact-links>a{font-size:13px}.dz-hours dl>div{font-size:12px;padding-block:12px}.dz-hours .dz-small-note{font-size:11px}.dz-hours-label{font-size:11px}.dz-holiday-hours summary{font-size:12px}.dz-holiday-hours dl>div{font-size:11px}.dz-visit-image{min-height:300px}.dz-visit-image>div{background:linear-gradient(0deg,#1e261bd4,transparent 95%)}.dz-visit-image>div>p{font-size:31px}.dz-visit-image .dz-button{font-size:11px}.dz-footer{padding:45px 0 calc(96px + env(safe-area-inset-bottom))}.dz-footer-top{grid-template-columns:1fr 1fr;gap:32px 22px;padding-bottom:30px}.dz-footer-top>div:first-child{grid-column:1/-1}.dz-footer-top>div>p{font-size:12px}.dz-footer .dz-brand-symbol{width:38px;height:40px}.dz-footer .dz-brand-word{width:96px;height:43px}.dz-footer-links{gap:15px}.dz-footer-links>a,.dz-footer-links>button{font-size:10px;line-height:1.7}.dz-footer-bottom{font-size:9px;gap:12px}.dz-mobile-bar{position:fixed;bottom:0;left:0;right:0;z-index:70;display:grid;grid-template-columns:1fr 1.3fr;gap:10px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:rgba(246,242,234,.98);border-top:1px solid var(--dz-line);box-shadow:0 -5px 22px #151b1112;backdrop-filter:blur(10px)}.dz-mobile-bar>a{display:flex;align-items:center;justify-content:center;gap:13px;font-size:12px;font-weight:600;min-height:42px}.dz-mobile-bar .dz-button{padding:10px 16px;min-height:42px}.dz-consent{left:12px;bottom:calc(77px + env(safe-area-inset-bottom));width:calc(100% - 24px);padding:19px;max-height:calc(100svh - 180px)}.dz-consent-title{font-size:19px}.dz-consent p:not(.dz-consent-title){font-size:10px}.dz-consent-actions{gap:8px;margin-top:13px}.dz-consent-actions .dz-button{font-size:10px;padding:10px 8px;min-height:41px}.dz-dialog{padding:22px;max-height:calc(100svh - 24px);width:calc(100% - 24px)}.dz-dialog-header{gap:12px}.dz-dialog-header h2{font-size:28px}.dz-dialog-header .dz-icon-button{width:36px;height:36px}.dz-form-row{grid-template-columns:1fr;gap:0}.dz-form input,.dz-form textarea{font-size:16px}.dz-form .dz-button{width:100%}.dz-webcam-frame,.dz-webcam-poster{aspect-ratio:4/3}.dz-webcam-poster>div{gap:12px;padding:15px}.dz-webcam-poster .dz-button{font-size:10px;min-height:42px;padding:10px 12px}.dz-webcam-poster p{font-size:11px}.dz-lightbox-image{max-height:68svh}.dz-home section[id],.dz-home main[id],.dz-home .dz-anchor{scroll-margin-top:90px}}
@media(max-width:360px){.dz-hero-tagline{max-width:105px;line-height:1.8}.dz-shell{width:calc(100% - 32px)}.dz-header-booking{padding:9px 10px;gap:5px}.dz-brand-word{width:68px}.dz-brand-symbol{width:28px}.dz-hero h1{font-size:3.6rem}.dz-hero-copy{font-size:12px}.dz-food-visual{height:340px}.dz-gallery{gap:9px}.dz-gallery-tall{height:379px}.dz-gallery-wide{height:185px}.dz-gallery-small{height:185px}.dz-gallery-item>span{left:9px;right:9px;font-size:8px}.dz-consent-actions .dz-button{font-size:9px}.dz-dialog{padding:18px}.dz-christmas h2{font-size:3.6rem}}
/* Strandwebcam: direct vindbaar, zonder een extra video op de homepage te laden. */
.dz-home .dz-nav-webcam{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:10px 0;border:0;background:transparent;color:var(--dz-ink);font-size:11px;font-weight:600;line-height:1.4;white-space:nowrap}
.dz-home .dz-nav-webcam>svg{color:var(--dz-rust)}
.dz-home .dz-nav-webcam:hover{color:var(--dz-rust)}
.dz-home .dz-hero-webcam{display:inline-flex;align-items:center;gap:10px;min-height:40px;margin-top:18px;padding:5px 0;border:0;border-bottom:1px solid #ffffff65;background:transparent;color:#fff;font-size:12px;font-weight:500;line-height:1.5;text-align:left;flex-shrink:0}
.dz-home .dz-hero-webcam:hover{color:#f2dfbf;border-bottom-color:#f2dfbf}
.dz-home .dz-mobile-nav-webcam{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:48px;padding:14px 0;border:0;border-bottom:1px solid var(--dz-line);background:transparent;color:var(--dz-ink);font-size:14px;font-weight:600;text-align:left}
.dz-home .dz-mobile-nav-webcam>span{display:inline-flex;align-items:center;gap:10px}
.dz-home .dz-mobile-nav-webcam>span>svg{color:var(--dz-rust)}
@media(min-width:851px) and (max-width:1100px){.dz-desktop-nav{gap:15px}.dz-home .dz-nav-webcam{gap:5px}}
@media(max-width:620px){.dz-home .dz-hero-webcam{margin-top:12px;min-height:36px;font-size:12px;gap:9px}.dz-hero-content{padding-bottom:92px}.dz-mobile-bar{grid-template-columns:1fr 1fr 1.2fr;gap:6px;padding-inline:12px}.dz-mobile-bar>a,.dz-mobile-bar>button{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:0;font-size:11px;font-weight:600;line-height:1.4;white-space:nowrap}.dz-home .dz-mobile-webcam{padding:8px 5px;border:0;border-inline:1px solid var(--dz-line);background:transparent;color:var(--dz-ink)}.dz-home .dz-mobile-webcam>svg{color:var(--dz-rust)}.dz-mobile-bar .dz-button{padding:10px 9px;min-height:44px;font-size:11px;gap:6px}}
@media(prefers-reduced-motion:reduce){.dz-home *,.dz-home *::before,.dz-home *::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}.dz-button:hover,.dz-gallery-item:hover>img{transform:none}}
`;
