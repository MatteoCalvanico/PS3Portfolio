import { Component, Suspense } from "react";
import type { ReactNode } from "react";
import type { BackgroundProps } from "./background-types";
import { resolveBackground } from "../background-themes";
import type { BackgroundSelection } from "../background-themes";

class BackgroundBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    // Failed theme chunks leave the selected CSS fallback and menu available.
    return this.state.failed ? null : this.props.children;
  }
}

export default function ThemeBackground({
  selection,
  ...props
}: BackgroundProps & { selection: BackgroundSelection }) {
  const { theme, variant } = resolveBackground(selection);
  const Background = theme.component;

  return (
    <div
      className="theme-background"
      data-background-theme={theme.id}
      style={{ background: theme.fallback, filter: variant.filter }}
      aria-hidden="true"
    >
      <BackgroundBoundary key={theme.id}>
        <Suspense fallback={null}>
          <Background {...props} />
        </Suspense>
      </BackgroundBoundary>
    </div>
  );
}
