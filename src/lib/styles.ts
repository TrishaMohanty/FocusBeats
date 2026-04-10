/**
 * FocusBeats Shared Style Tokens
 * Following Atomic Design and DRY Tailwind principles.
 */

export const STYLES = {
  // Common Layout
  SECTION: "relative py-16 px-6 md:py-24 md:px-12",
  CONTAINER: "max-w-7xl mx-auto",
  
  // Navigation
  NAV_LINK: "text-sm font-medium text-text-muted hover:text-primary transition-colors duration-200",
  
  // Cards
  GLASS_CARD: "glass-card rounded-2xl p-6 border border-border/50",
  CARD_HOVER: "hover:-translate-y-1 hover:shadow-premium transition-all duration-300",
  
  // Buttons (Base functionality handled by Button atom)
  BUTTON_BASE: "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95",
  BUTTON_PRIMARY: "bg-primary text-white hover:bg-primary-600 shadow-sm",
  BUTTON_SECONDARY: "bg-surface text-text border border-border hover:bg-bg",
  BUTTON_GHOST: "text-text-muted hover:text-text hover:bg-surface/50",
  
  // Typography
  H1: "text-4xl md:text-6xl font-extrabold tracking-tight text-text",
  H2: "text-3xl md:text-5xl font-bold tracking-tight text-text",
  H3: "text-xl md:text-2xl font-semibold text-text",
  BODY_MUTED: "text-text-muted text-lg leading-relaxed",
};
