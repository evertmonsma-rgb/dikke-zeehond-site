import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** hoeveel eerder laden voordat het zichtbaar is */
  rootMargin?: string;
  /** placeholder UI terwijl nog niet gemount */
  fallback?: React.ReactNode;
  className?: string;
};

export default function LazyMount({
  children,
  rootMargin = "600px 0px",
  fallback = null,
  className,
}: Props) {
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
      { rootMargin }
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
