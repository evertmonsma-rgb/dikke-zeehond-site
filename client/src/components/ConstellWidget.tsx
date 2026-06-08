import { useEffect } from "react";

const CONSTELL_SRC = "https://widget.constell.com/assets/index.js";

export default function ConstellWidget() {
  useEffect(() => {
    // script maar 1x toevoegen
    if (document.querySelector(`script[src="${CONSTELL_SRC}"]`)) return;

    const s = document.createElement("script");
    s.type = "module";
    s.src = CONSTELL_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-background/70 backdrop-blur-xl p-2 shadow-sm overflow-hidden">
      {/* @ts-expect-error - custom element */}
      <constell-widget
        venue="019be325-7592-73f1-8ce0-1224521ec0bb"
        brand-color="#d5d0c4"
        min-guest-amount="400"
        max-guest-amount="120"
        min-budget-amount="5000"
      />
    </div>
  );
}
