import { useEffect } from "react";

const ELFSIGHT_SRC = "https://elfsightcdn.com/platform.js";
const APP_CLASS = "elfsight-app-1fa3d1d5-0333-40f8-b077-007ae1f4fee3";

export default function InstagramWidget() {
  useEffect(() => {
    // Script maar 1x laden
    if (!document.querySelector(`script[src="${ELFSIGHT_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = ELFSIGHT_SRC;
      s.async = true;
      document.body.appendChild(s);
    }

    // Elfsight refresht soms niet automatisch bij SPA navigatie
    // -> veilige “nudge” als hun global bestaat
    const w = window as any;
    if (w?.ELFSIGHT_WIDGETS) {
      try {
        w.ELFSIGHT_WIDGETS?.init?.();
      } catch {}
    }
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-white/60 backdrop-blur p-4 md:p-6 shadow-sm">
      <div className={APP_CLASS} data-elfsight-app-lazy />
    </div>
  );
}
