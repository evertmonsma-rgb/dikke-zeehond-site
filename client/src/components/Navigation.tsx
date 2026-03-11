import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

function smoothScrollTo(hash: string) {
  if (!hash.startsWith("#")) return;
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(
    () => [
      { name: "Menukaart", href: "#menu" },
      { name: "Locatie", href: "#location" },
      { name: "Webcam", href: "#webcam" },
      { name: "Werken", href: "#werkenbij" },
      { name: "Contact", href: "#contact" },
    ],
    [],
  );

  function handleAnchorClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    setIsMobileMenuOpen(false);
    requestAnimationFrame(() => smoothScrollTo(href));
  }

  const navShell = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
    isScrolled
      ? "bg-[#c9c6b0]/95 backdrop-blur-xl py-4 border-b border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
      : "bg-transparent py-6",
  );

  const linkClass = (active: boolean) =>
    cn(
      "group text-sm font-medium tracking-wide transition-colors relative",
      active
        ? "text-slate-900/90 hover:text-slate-900"
        : "text-white/90 hover:text-white",
    );

  const underlineClass = (active: boolean) =>
    cn(
      "absolute -bottom-2 left-0 h-px w-0 group-hover:w-full transition-all",
      active ? "bg-slate-900/60" : "bg-white/80",
    );

  const iconColor = isScrolled ? "text-slate-900" : "text-white";

  return (
    <nav className={navShell}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo (click = scroll to top) */}
        <Link href="/">
          <a
            className="flex items-center gap-4 py-1 select-none"
            aria-label="Dikke Zeehond"
            onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src="/brand/logo_Dikke_transparent_cropped.png"
              alt="Dikke"
              className="h-10 md:h-12 lg:h-14 w-auto"
              draggable={false}
            />
            {/* Let op: dit is je witte tekst-logo; als je een dark variant hebt, wisselen we 'm bij scroll */}
            <img
              src="/brand/logo_text_white_transparent_cropped.png"
              alt="Dikke Zeehond"
              className={cn(
                "h-10 md:h-12 lg:h-14 w-auto transition-opacity duration-300",
                isScrolled ? "opacity-90" : "opacity-100",
              )}
              draggable={false}
            />
          </a>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className={linkClass(isScrolled)}
            >
              {link.name}
              <span className={underlineClass(isScrolled)} />
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className={cn("h-6 w-6", iconColor)} />
          ) : (
            <Menu className={cn("h-6 w-6", iconColor)} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 border-b shadow-lg p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2",
            isScrolled
              ? "bg-[#c9c6b0]/98 backdrop-blur-xl border-black/10"
              : "bg-black/70 backdrop-blur-xl border-white/10",
          )}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "text-lg font-medium py-2 border-b last:border-0",
                isScrolled
                  ? "text-slate-900 border-black/10"
                  : "text-white border-white/10",
              )}
              onClick={(e) => handleAnchorClick(e, link.href)}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
