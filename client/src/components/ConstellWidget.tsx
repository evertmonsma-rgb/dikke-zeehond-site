import { useEffect } from "react";

const CONSTELL_SRC = "https://widget.constell.com/assets/index.js";

export default function ConstellWidget() {
  useEffect(() => {
    if (document.querySelector(`script[src="${CONSTELL_SRC}"]`)) return;

    const s = document.createElement("script");
    s.type = "module";
    s.src = CONSTELL_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-background/70 p-2 shadow-sm overflow-hidden backdrop-blur-xl">
      {/* @ts-expect-error custom element */}
      <constell-widget
        venue="019be325-7592-73f1-8ce0-1224521ec0bb"
        offset-y="70"
        brand-color="#ffb5af"
        min-guest-amount="25"
        max-guest-amount="100"
        min-budget-amount="5000"
      />
    </div>
  );
}
