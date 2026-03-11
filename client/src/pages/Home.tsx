// client/src/pages/Home.tsx
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Instagram,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import InstagramWidget from "@/components/InstagramWidget";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";

/** HERO: video first, then slideshow */
const HERO_VIDEO_SRC = "/videos/DikkeZeehond-2025.mp4";
const HERO_SLIDES = [
  { src: "/photos/exterior.jpg", alt: "Dikke Zeehond aan het strand" },
  { src: "/photos/interior-3.jpg", alt: "Bar & gezellige sfeer" },
  { src: "/photos/interior-4.jpg", alt: "Binnen met zeezicht" },
];

const vibeImageUrl = "/photos/interior-3.jpg";

const MAP_QUERY = "Strandpaviljoen Dikke Zeehond, De Koog, Texel";
const MAPS_EMBED_SRC =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(MAP_QUERY) +
  "&output=embed";
const MAPS_DIRECTIONS_LINK =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(MAP_QUERY);
const MAPS_APP_LINK = "https://maps.app.goo.gl/KPu68EBoRMhDpFGN8?g_st=ipc";

// Bedrijfsgegevens
const CONTACT_PHONE = "0222 441110";
const CONTACT_ADDRESS_LINE1 = "Badweg 202";
const CONTACT_ADDRESS_LINE2 = "1796 AA De Koog (Texel)";
const INSTAGRAM_URL = "https://www.instagram.com/dedikkezeehond/";

// Guestplan
const GUESTPLAN_ACCESS_KEY = "e0bd256fce2d473ce637333d6d8580e31c2a8692";
const GUESTPLAN_SRC = "https://cdn.guestplan.com/widget.js";

// Consent
const CONSENT_KEY = "dikkezeehond_consent_v1";

type IdleCallbackHandle = number;
type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type RequestIdleCallbackOptions = { timeout?: number };

type ConsentState = {
  necessary: true;
  externalContent: boolean;
};

function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

function setStoredConsent(value: ConsentState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
}

function GoodToKnowCard() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <h3 className="mb-2 font-heading text-xl font-bold text-primary">
        Goed om te weten
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-start gap-3">
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
          Prijzen en aanbod kunnen per seizoen verschillen.
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
          Allergieën of dieetwensen? Vraag het ons team.
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
          Groepen &amp; events: we maken graag een aanbod op maat.
        </li>
      </ul>
    </div>
  );
}

export default function Home() {
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();

  // Consent state
  const [consentLoaded, setConsentLoaded] = useState(false);
  const [hasExternalConsent, setHasExternalConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();

    if (!stored) {
      setShowConsentModal(true);
      setHasExternalConsent(false);
    } else {
      setHasExternalConsent(stored.externalContent);
      setShowConsentModal(false);
    }

    setConsentLoaded(true);
  }, []);

  function acceptAllConsent() {
    setStoredConsent({ necessary: true, externalContent: true });
    setHasExternalConsent(true);
    setShowConsentModal(false);
  }

  function acceptNecessaryOnly() {
    setStoredConsent({ necessary: true, externalContent: false });
    setHasExternalConsent(false);
    setShowConsentModal(false);
  }

  function openPrivacySettings() {
    setShowConsentModal(true);
  }

  // Hero parallax
  const { scrollY } = useScroll();
  const heroBgY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 180]);
  const heroBgScale = useTransform(
    scrollY,
    [0, 900],
    [1, reduceMotion ? 1 : 1.12],
  );
  const heroOverlayOpacity = useTransform(scrollY, [0, 700], [0.22, 0.45]);

  // Parallax refs
  const vibeRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: vibeProgress } = useScroll({
    target: vibeRef,
    offset: ["start end", "end start"],
  });
  const vibeY = useTransform(
    vibeProgress,
    [0, 1],
    [reduceMotion ? 0 : -70, reduceMotion ? 0 : 70],
  );

  const { scrollYProgress: contactProgress } = useScroll({
    target: contactRef,
    offset: ["start end", "end start"],
  });
  const contactBgY = useTransform(
    contactProgress,
    [0, 1],
    [reduceMotion ? 0 : -60, reduceMotion ? 0 : 60],
  );
  const contactGlowOpacity = useTransform(contactProgress, [0, 0.35], [0, 1]);

  const { scrollYProgress: mapProgress } = useScroll({
    target: mapRef,
    offset: ["start end", "end start"],
  });
  const mapY = useTransform(
    mapProgress,
    [0, 1],
    [reduceMotion ? 0 : -14, reduceMotion ? 0 : 14],
  );

  const photos = useMemo(
    () => [
      { src: "/photos/exterior.jpg", alt: "Dikke Zeehond aan het strand" },
      { src: "/photos/interior-1.jpg", alt: "Sfeervolle zitplekken" },
      { src: "/photos/interior-2.jpg", alt: "Interieur met warme details" },
      { src: "/photos/interior-3.jpg", alt: "Bar & gezellige sfeer" },
      { src: "/photos/interior-4.jpg", alt: "Binnen met zeezicht" },
      { src: "/photos/interior-5.jpg", alt: "Zon, zee en ontspannen" },
      { src: "/photos/interior-6.jpg", alt: "Details & styling" },
    ],
    [],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length,
    );
  const next = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const n = (lightboxIndex + 1) % photos.length;
    const p = (lightboxIndex - 1 + photos.length) % photos.length;
    const imgN = new Image();
    imgN.src = photos[n].src;
    const imgP = new Image();
    imgP.src = photos[p].src;
  }, [lightboxIndex, photos]);

  // Contact form
  const [contactLoading, setContactLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  });

  async function submitContact(e: FormEvent) {
    e.preventDefault();
    if (contactLoading) return;

    setContactLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error((data as any)?.message || "Verzenden mislukt");

      toast({
        title: "Verzonden!",
        description: "Bedankt — we nemen zo snel mogelijk contact met je op.",
      });

      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        website: "",
      });
    } catch (err: any) {
      toast({
        title: "Oeps…",
        description: err?.message || "Er ging iets mis bij het verzenden.",
        variant: "destructive",
      });
    } finally {
      setContactLoading(false);
    }
  }

  // Guestplan alleen na consent
  useEffect(() => {
    if (!consentLoaded || !hasExternalConsent) return;

    const load = () => {
      if (document.querySelector(`script[src="${GUESTPLAN_SRC}"]`)) return;

      (window as any)._gstpln = (window as any)._gstpln || {};
      (window as any)._gstpln.accessKey = GUESTPLAN_ACCESS_KEY;

      const s = document.createElement("script");
      s.src = GUESTPLAN_SRC;
      s.async = true;
      document.body.appendChild(s);
    };

    const w = window as unknown as {
      requestIdleCallback?: (
        cb: (deadline: IdleDeadline) => void,
        opts?: RequestIdleCallbackOptions,
      ) => IdleCallbackHandle;
      cancelIdleCallback?: (id: IdleCallbackHandle) => void;
    };

    let idleId: IdleCallbackHandle | null = null;
    let timeoutId: number | null = null;

    if (w.requestIdleCallback) {
      idleId = w.requestIdleCallback(() => load(), { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(load, 1200);
    }

    return () => {
      if (idleId !== null && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [consentLoaded, hasExternalConsent]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <Navigation />

      <main className="flex-1">
        <section className="relative flex h-screen min-h-[680px] items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 z-0 will-change-transform"
            style={{ y: heroBgY, scale: heroBgScale }}
          >
            <HeroMedia videoSrc={HERO_VIDEO_SRC} slides={HERO_SLIDES} />
          </motion.div>

          <motion.div
            className="absolute inset-0 z-10 bg-black"
            style={{ opacity: heroOverlayOpacity }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />

          <div className="container relative z-20 px-6 pt-24 text-center md:text-left">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="max-w-3xl"
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-white/90 md:text-sm">
                Strandpaviljoen • De Koog • Texel
              </p>

              <h1 className="mb-6 font-heading text-5xl font-bold leading-[1.03] text-white md:text-7xl lg:text-8xl">
                Beach More
                <br />
                Worry Less
                <br />
              </h1>

              <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-white/90 md:text-xl">
                Van je eerste koffie tot de laatste proost bij zonsondergang —
                zand tussen je tenen en het geluid van de zee op de achtergrond.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/80 px-8 text-base font-medium text-white backdrop-blur-sm hover:bg-white/15"
                >
                  <a href="#menu">Bekijk menukaart</a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-white px-8 text-base font-medium text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
                >
                  <a href="#contact">Reserveren</a>
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ delay: 1.35, duration: 1 }}
            className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70"
          >
            <span className="text-[11px] uppercase tracking-[0.35em]">
              Scroll
            </span>
            <div className="relative h-12 w-px overflow-hidden bg-white/30">
              <div className="animate-slide-down absolute left-0 top-0 h-1/2 w-full bg-white" />
            </div>
          </motion.div>
        </section>

        <section id="menu" className="bg-secondary/20 py-10 md:py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-start gap-10 lg:flex-row md:gap-12">
              <div className="space-y-6 lg:w-5/12 md:space-y-8">
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
                  Eten &amp; drinken
                </span>
                <h2 className="font-heading text-4xl text-primary md:text-6xl">
                  Menukaart
                </h2>

                <div className="hidden lg:block">
                  <GoodToKnowCard />
                </div>
              </div>

              <div className="w-full lg:w-7/12">
                <div className="relative h-[66vh] w-full overflow-hidden rounded-3xl border border-border bg-white shadow-sm md:h-[80vh]">
                  <img
                    src="/menu/Zomer_menu_cover.png"
                    alt="Menukaart cover"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/25" />

                  <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      className="h-12 rounded-full bg-accent px-10 text-white hover:bg-accent/90"
                    >
                      <a
                        href="/menu/Menukaart_Zomer_2026.pdf"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open menukaart (PDF) <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="h-12 rounded-full bg-white/90 px-8"
                    ></Button>
                  </div>
                </div>

                <div className="mt-5 lg:hidden">
                  <GoodToKnowCard />
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Tip: op sommige telefoons opent de PDF in een nieuw tabblad.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="webcam" className="bg-background py-10 md:py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-5xl">
              <div className="mb-7 space-y-3 text-center md:mb-12 md:space-y-4">
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
                  Live
                </span>
                <h2 className="font-heading text-4xl text-primary md:text-6xl">
                  Strandwebcam
                </h2>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Check de golven, het weer en de sfeer live.
                </p>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-black shadow-sm">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube-nocookie.com/embed/kqlZ81HU2RU?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1"
                  title="Strandwebcam Dikke Zeehond"
                  loading="lazy"
                  allow="autoplay; encrypted-media; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="werkenbij"
          className="scroll-mt-28 bg-background py-10 md:py-16"
        >
          <div className="container mx-auto px-6">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
                  Werken bij
                </span>
                <h2 className="mt-3 font-heading text-4xl text-primary md:text-6xl">
                  Kom werken bij Dikke Zeehond
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Zoek je een leuke (bij)baan op Texel? We zoeken energieke
                  mensen voor bediening, keuken en allround. Geen gedoe — gewoon
                  een goed team, een mooie plek en lekker knallen met elkaar.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-border bg-white/60 p-5">
                    <p className="font-semibold text-primary">
                      Wat je kunt verwachten
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>• Flexibele uren (fulltime / parttime / weekend)</li>
                      <li>
                        • Marktconform salaris + fooi (waar van toepassing)
                      </li>
                      <li>
                        • Gezellig team, hoge energie, duidelijke afspraken
                      </li>
                      <li>• Werkplek aan zee (ja, echt)</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border bg-white/60 p-5">
                    <p className="font-semibold text-primary">We zoeken o.a.</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-black/5 px-3 py-1">
                        Bediening
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1">
                        Keukenhulp
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1">
                        Afwas
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1">
                        Allround
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                id="solliciteren"
                className="rounded-3xl border border-border bg-white/60 p-6 shadow-sm backdrop-blur md:p-8"
              >
                <h3 className="font-heading text-2xl text-primary">
                  Solliciteren
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Laat je gegevens achter — we nemen snel contact met je op.
                </p>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const fd = new FormData(form);

                    const payload = {
                      topic: "Werken bij",
                      name: String(fd.get("name") ?? ""),
                      email: String(fd.get("email") ?? ""),
                      phone: String(fd.get("phone") ?? ""),
                      message: String(fd.get("message") ?? ""),
                      website: "",
                    };

                    const res = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });

                    if (res.ok) {
                      form.reset();
                      alert("Dankjewel! We nemen snel contact met je op.");
                    } else {
                      alert(
                        "Oeps, verzenden ging niet. Probeer het later opnieuw.",
                      );
                    }
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        Naam
                      </label>
                      <input
                        name="name"
                        required
                        className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                        placeholder="Je naam"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        E-mail
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                        placeholder="naam@email.nl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Telefoon (optioneel)
                    </label>
                    <input
                      name="phone"
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                      placeholder="06…"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Vertel kort wat je zoekt
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                      placeholder="Welke rol? Vanaf wanneer? Hoeveel uur?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-accent"
                  >
                    Verstuur sollicitatie
                  </button>

                  <p className="text-xs text-slate-600">
                    Liever direct mailen?{" "}
                    <a
                      className="underline underline-offset-4"
                      href="mailto:info@dikkezeehond.nl?subject=Sollicitatie%20Dikke%20Zeehond"
                    >
                      info@dikkezeehond.nl
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section id="location" className="bg-background py-10 md:py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-7 space-y-3 text-center md:mb-12 md:space-y-4">
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
                  Locatie
                </span>
                <h2 className="font-heading text-4xl text-primary md:text-6xl">
                  De Koog, Texel
                </h2>
                <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
                  Je vindt Strandpaviljoen Dikke Zeehond direct aan het strand
                  bij De Koog.
                </p>
              </div>

              <div
                ref={mapRef}
                className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5"
              >
                <div className="lg:col-span-3">
                  <motion.div
                    style={reduceMotion ? undefined : { y: mapY }}
                    className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
                  >
                    <div className="relative h-[380px] md:h-[520px]">
                      {hasExternalConsent ? (
                        <iframe
                          title="Google Maps - Strandpaviljoen Dikke Zeehond"
                          src={MAPS_EMBED_SRC}
                          className="h-full w-full"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      ) : (
                        <ConsentPlaceholder
                          title="Google Maps"
                          onAllow={acceptAllConsent}
                        />
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-2">
                  <div className="rounded-3xl border border-border bg-white p-7 shadow-sm">
                    <h3 className="mb-4 font-heading text-2xl text-primary">
                      Strandpaviljoen Dikke Zeehond
                    </h3>

                    <div className="space-y-3 text-muted-foreground">
                      <p>
                        <span className="font-medium text-primary">Adres</span>
                        <br />
                        {CONTACT_ADDRESS_LINE1}
                        <br />
                        {CONTACT_ADDRESS_LINE2}
                      </p>

                      <p>
                        <span className="font-medium text-primary">
                          Telefoon
                        </span>
                        <br />
                        {CONTACT_PHONE}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button
                        asChild
                        className="h-12 rounded-full bg-accent px-10 text-white hover:bg-accent/90"
                      >
                        <a
                          href={MAPS_APP_LINK}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Google Maps
                        </a>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="h-12 rounded-full bg-accent px-10 text-white hover:bg-accent/90"
                      >
                        <a
                          href={MAPS_DIRECTIONS_LINK}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Route
                        </a>
                      </Button>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-accent" />
                        <span className="font-medium text-primary">
                          {CONTACT_PHONE}
                        </span>
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 hover:text-primary"
                      >
                        <Instagram className="h-4 w-4 text-accent" />
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="vibe"
          className="relative overflow-hidden bg-[#c9c6b0] py-14 text-slate-900 md:py-36"
        >
          <div ref={vibeRef} className="pointer-events-none absolute inset-0" />

          <motion.div
            className="absolute inset-0 z-0 opacity-45 will-change-transform"
            style={{ y: vibeY }}
          >
            <img
              src={vibeImageUrl}
              alt="Interieur"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <div className="absolute inset-0 z-10 bg-[#c9c6b0]/70" />

          <div className="container relative z-20 mx-auto px-6 text-center">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.35em] text-slate-700">
              De plek
            </span>
            <h2 className="mb-8 font-heading text-4xl text-slate-900 md:text-6xl">
              Stijlvol op het zand
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-slate-700/90 md:text-2xl">
              Binnen warm en comfortabel, buiten zonnig en relaxed. Kom voor het
              uitzicht, blijf voor de sfeer.
            </p>

            <div className="mx-auto mt-10 max-w-4xl">
              {hasExternalConsent ? (
                <GoogleReviewsWidget />
              ) : (
                <ConsentPlaceholder
                  title="Google Reviews"
                  onAllow={acceptAllConsent}
                />
              )}
            </div>
          </div>
        </section>

        <section id="instagram" className="bg-background py-10 md:py-14">
          <div className="container mx-auto px-6">
            <div className="mb-7 space-y-3 text-center md:mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
                Instagram
              </span>
              <h2 className="font-heading text-4xl text-primary md:text-6xl">
                Laatste posts
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Live vanuit Instagram.
              </p>
            </div>

            {hasExternalConsent ? (
              <InstagramWidget />
            ) : (
              <ConsentPlaceholder
                title="Instagram"
                onAllow={acceptAllConsent}
              />
            )}

            <div className="mt-6 text-center">
              <a
                href="https://www.instagram.com/dedikkezeehond/"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                Bekijk alles op Instagram
              </a>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="relative overflow-hidden bg-background py-10 md:py-32"
        >
          <div
            ref={contactRef}
            className="pointer-events-none absolute inset-0"
          />

          <motion.div
            className="absolute inset-0 z-0 will-change-transform"
            style={{ y: contactBgY }}
          >
            <img
              src="/photos/interior-2.jpg"
              alt=""
              className="h-full w-full object-cover opacity-25"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/55 via-background/90 to-background" />

          <motion.div
            className="absolute inset-0 z-0"
            style={{ opacity: contactGlowOpacity }}
          >
            <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
          </motion.div>

          <div className="container relative z-10 mx-auto px-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-accent">
                  Contact
                </span>
                <h2 className="mt-3 font-heading text-4xl text-primary md:text-6xl">
                  Stuur ons een bericht
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                  Vraag, groep of iets te vieren? Laat een bericht achter — we
                  reageren zo snel mogelijk.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-background/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-10">
                <form onSubmit={submitContact} className="space-y-6">
                  <input
                    value={contactForm.website}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, website: e.target.value }))
                    }
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Naam</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Je naam"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                        placeholder="naam@email.nl"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Telefoon (optioneel)</Label>
                      <Input
                        id="phone"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="06…"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="message">Bericht</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm((p) => ({
                            ...p,
                            message: e.target.value,
                          }))
                        }
                        placeholder="Waar kunnen we je mee helpen?"
                        rows={8}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Door te verzenden ga je akkoord dat we je bericht
                      gebruiken om contact op te nemen.
                    </p>

                    <Button
                      type="submit"
                      className="h-12 rounded-full bg-accent px-10 text-white hover:bg-accent/90"
                      disabled={contactLoading}
                    >
                      {contactLoading ? "Verzenden..." : "Verstuur bericht"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-accent" />
                      <span className="font-medium text-primary">
                        {CONTACT_PHONE}
                      </span>
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{CONTACT_ADDRESS_LINE2}</span>
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 hover:text-primary"
                    >
                      <Instagram className="h-4 w-4 text-accent" />
                      Instagram
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <Dialog
          open={lightboxIndex !== null}
          onOpenChange={(open) => (!open ? closeLightbox() : undefined)}
        >
          <DialogContent className="max-w-5xl overflow-hidden border-none bg-black p-0 text-white">
            <DialogTitle className="sr-only">Foto</DialogTitle>

            <div className="relative">
              {lightboxIndex !== null && (
                <img
                  src={photos[lightboxIndex].src}
                  alt={photos[lightboxIndex].alt}
                  className="h-[70vh] w-full bg-black object-contain md:h-[80vh]"
                  decoding="async"
                />
              )}

              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Sluit"
                className="absolute right-3 top-3 rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={prev}
                aria-label="Vorige"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Volgende"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm text-white/80">
                  {lightboxIndex !== null ? photos[lightboxIndex].alt : ""}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="mt-auto bg-[#c9c6b0] text-slate-900">
        <div className="h-px w-full bg-black/10" />

        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4">
                <img
                  src="/brand/logo_text_white_transparent_cropped.png"
                  alt="Dikke Zeehond"
                  className="h-10 w-auto opacity-95"
                  draggable={false}
                />
              </div>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-700">
                Strandpaviljoen Dikke Zeehond — warm, stijlvol en relaxed op het
                zand. Van koffie in de ochtend tot borrel bij zonsondergang.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <a
                  href="tel:+31222441110"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/35 px-4 py-2 text-slate-900 hover:bg-white/55"
                >
                  <span className="text-slate-700">Tel</span>
                  <span className="font-semibold">0222 441110</span>
                </a>

                <a
                  href="mailto:info@dikkezeehond.nl"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/35 px-4 py-2 text-slate-900 hover:bg-white/55"
                >
                  <span className="text-slate-700">Mail</span>
                  <span className="font-semibold">info@dikkezeehond.nl</span>
                </a>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/dedikkezeehond/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/35 text-slate-900 hover:bg-white/55"
                  aria-label="Instagram"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9A3.5 3.5 0 0 0 20 16.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.25 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/35 text-slate-900 hover:bg-white/55"
                  aria-label="Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V5c-.3 0-1.3-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.6V11H7.2v3h2.6v8h3.7Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-800">
                Navigatie
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>
                  <a href="#menu" className="hover:text-slate-900">
                    Menukaart
                  </a>
                </li>
                <li>
                  <a href="#webcam" className="hover:text-slate-900">
                    Webcam
                  </a>
                </li>
                <li>
                  <a href="#werkenbij" className="hover:text-slate-900">
                    Werken
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-slate-900">
                    Reserveren &amp; contact
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openPrivacySettings}
                    className="hover:text-slate-900"
                  >
                    Privacy-instellingen
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-800">
                Locatie
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">
                    Badweg 202
                  </span>
                  <br />
                  1796 AA De Koog (Texel)
                </p>

                <a
                  href={MAPS_DIRECTIONS_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/35 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white/55"
                >
                  Plan route
                </a>

                <p className="text-xs text-slate-600">
                  Openingstijden: dagelijks 11:00 tot zonsondergang
                  (seizoensafhankelijk).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-black/10 pt-6 text-xs text-slate-600 md:flex-row md:items-center md:justify-between">
            <span>
              © {new Date().getFullYear()} Dikke Zeehond Strandpaviljoen
            </span>

            <span className="text-slate-600 md:text-center">
              Dikke Zeehond V.O.F. • KvK 90208366
              <span className="hidden md:inline"> • </span>
              <span className="block md:inline">
                Vestigingsnr. 000045750343
              </span>
            </span>

            <button
              type="button"
              onClick={openPrivacySettings}
              className="text-right text-slate-500 underline underline-offset-4 hover:text-slate-700"
            >
              Privacy-instellingen
            </button>
          </div>
        </div>
      </footer>

      <CookieConsentModal
        open={showConsentModal}
        onAcceptAll={acceptAllConsent}
        onNecessaryOnly={acceptNecessaryOnly}
      />
    </div>
  );
}

function ConsentPlaceholder({
  title,
  onAllow,
}: {
  title: string;
  onAllow: () => void;
}) {
  return (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-3xl border border-border bg-white/70 p-8 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
          Externe content
        </p>
        <h3 className="font-heading text-2xl text-primary">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Deze content wordt pas geladen nadat je externe content hebt
          toegestaan.
        </p>
        <button
          type="button"
          onClick={onAllow}
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Toestaan
        </button>
      </div>
    </div>
  );
}

function CookieConsentModal({
  open,
  onAcceptAll,
  onNecessaryOnly,
}: {
  open: boolean;
  onAcceptAll: () => void;
  onNecessaryOnly: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-x-4 bottom-4 z-[101] mx-auto max-w-2xl rounded-3xl border border-border bg-background p-6 shadow-2xl md:bottom-8 md:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                  Privacy
                </p>
                <h3 className="mt-2 font-heading text-2xl text-primary">
                  Jouw voorkeuren
                </h3>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                We gebruiken alleen noodzakelijke technieken om de site goed te
                laten werken. Externe content zoals Instagram, Google Reviews,
                Google Maps en reserveringswidgets kan gegevens laden van derde
                partijen.
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Kies of je alleen noodzakelijke onderdelen wilt gebruiken, of
                ook externe content wilt toestaan.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onAcceptAll}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-white hover:bg-accent/90"
                >
                  Akkoord
                </button>

                <button
                  type="button"
                  onClick={onNecessaryOnly}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-8 text-sm font-semibold text-primary hover:bg-secondary/40"
                >
                  Alleen noodzakelijk
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** HeroMedia */
function HeroMedia({
  videoSrc,
  slides,
  slideDurationMs = 5200,
}: {
  videoSrc: string;
  slides: { src: string; alt: string }[];
  slideDurationMs?: number;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [phase, setPhase] = useState<"video" | "slideshow">("video");
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
  }, [slides]);

  useEffect(() => {
    if (phase !== "video") return;
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        await v.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    };

    tryPlay();
    const onLoaded = () => void tryPlay();
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, [phase]);

  useEffect(() => {
    if (phase !== "slideshow") return;
    if (slides.length <= 1) return;
    if (reduceMotion) return;

    const id = window.setInterval(
      () => setSlideIndex((i) => (i + 1) % slides.length),
      slideDurationMs,
    );
    return () => window.clearInterval(id);
  }, [phase, slides.length, slideDurationMs, reduceMotion]);

  const currentSlide = slides[Math.min(slideIndex, slides.length - 1)];

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        {phase === "video" ? (
          <motion.div
            key="video"
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={videoSrc}
              muted
              playsInline
              autoPlay
              preload="auto"
              controls={false}
              onEnded={() => setPhase("slideshow")}
              onError={() => setPhase("slideshow")}
            />

            {autoplayBlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await videoRef.current?.play();
                      setAutoplayBlocked(false);
                    } catch {
                      setPhase("slideshow");
                    }
                  }}
                  className="h-12 rounded-full border border-white/20 bg-white/15 px-8 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
                >
                  Klik om video te starten
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPhase("slideshow")}
              className="absolute bottom-6 right-6 h-10 rounded-full border border-white/15 bg-black/25 px-6 text-xs uppercase tracking-[0.25em] text-white/80 backdrop-blur transition hover:bg-black/35 hover:text-white"
            >
              Skip
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="slideshow"
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide.src}
                src={currentSlide.src}
                alt={currentSlide.alt}
                className="h-full w-full object-cover"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.9,
                  ease: "easeOut",
                }}
                decoding="async"
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LazyMount({
  children,
  rootMargin = "600px 0px",
  fallback = null,
  className,
}: {
  children: ReactNode;
  rootMargin?: string;
  fallback?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {mounted ? children : fallback}
    </div>
  );
}
