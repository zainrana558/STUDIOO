
import { themes, Theme } from '../../../lib/themes';

/**
 * This is a dynamic layout that wraps genre pages.
 * It reads the URL slug, determines the correct theme, and injects it
 * as CSS variables into the DOM. This allows all child components to be
 * theme-aware without prop drilling.
 */
export default function GenreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  // Get the theme based on the slug, or use default if not found
  const theme: Theme = themes[params.slug as keyof typeof themes] || themes.default;

  // Create a style object for CSS variables
  const themeVariables = {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
  } as React.CSSProperties;

  return (
    <div style={themeVariables} className={`bg-[var(--color-secondary)] ${theme.fonts.body}`}>
      {children}
    </div>
  );
}
