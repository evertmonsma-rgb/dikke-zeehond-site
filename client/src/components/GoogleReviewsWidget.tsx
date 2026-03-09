import { useEffect } from "react";

const ELFSIGHT_SRC = "https://elfsightcdn.com/platform.js";
const APP_CLASS = "elfsight-app-caae8ffa-cae8-4dcd-bc92-47f6df48e900";

export default function GoogleReviewsWidget() {
  useEffect(() => {
    if (!document.querySelector(`script[src="${ELFSIGHT_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = ELFSIGHT_SRC;
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="rounded-3xl border border-black/10 bg-white/45 backdrop-blur p-4 md:p-6 shadow-sm">
      <div className={APP_CLASS} data-elfsight-app-lazy />
    </div>
  );
}
