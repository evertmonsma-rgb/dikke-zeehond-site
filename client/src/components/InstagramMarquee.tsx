import { useMemo } from "react";
import { cn } from "@/lib/utils";

type MarqueeImage = {
  src: string;
  alt: string;
  href?: string;
};

export default function InstagramMarquee({
  images,
  durationSec = 60,
  className,
}: {
  images: MarqueeImage[];
  durationSec?: number;
  className?: string;
}) {
  const loopImages = useMemo(() => [...images, ...images], [images]);

  return (
    <div
      className={cn(
        // full width, no card styling
        "relative w-full overflow-hidden",
        className
      )}
      aria-label="Foto slider"
    >
      {/* subtle edge fade (blijft premium, maar geen kader) */}
      <div className="pointer-events-none absolute inset-0 dz-marquee-fade z-10" />

      <div
        className={cn(
          "dz-marquee-track flex w-max",
          // heel weinig ruimte tussen tiles
          "gap-1 md:gap-2",
          "hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {loopImages.map((img, idx) => {
          const Tile = (
            <div className="group relative overflow-hidden">
              <img
                src={img.src}
                alt={img.alt}
                className={cn(
                  // tiles: strak, zonder rounded
                  "h-[160px] w-[220px] md:h-[200px] md:w-[280px] lg:h-[230px] lg:w-[340px]",
                  "object-cover",
                  "transition-transform duration-700 group-hover:scale-[1.04]"
                )}
                loading="lazy"
              />
              {/* subtiele hover overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );

          return (
            <div key={`${img.src}-${idx}`} className="shrink-0">
              {img.href ? (
                <a
                  href={img.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={img.alt}
                >
                  {Tile}
                </a>
              ) : (
                Tile
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .dz-marquee-track { animation: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
