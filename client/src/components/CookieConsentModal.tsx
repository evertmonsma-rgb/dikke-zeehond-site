import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onAcceptAll: () => void;
  onNecessaryOnly: () => void;
};

export default function CookieConsentModal({
  open,
  onAcceptAll,
  onNecessaryOnly,
}: Props) {
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
                <h3 className="mt-2 text-2xl font-heading text-primary">
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
