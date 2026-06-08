// client/src/types/custom-elements.d.ts
import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "constell-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        venue?: string;
        "brand-color"?: string;
        "min-guest-amount"?: string | number;
        "max-guest-amount"?: string | number;
        "min-budget-amount"?: string | number;
      };
    }
  }
}

export {};
