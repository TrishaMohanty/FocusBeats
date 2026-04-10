/**
 * FocusBeats Shared Style Tokens
 * Following Atomic Design and DRY Tailwind principles.
 */

export const STYLES = {
  // Common Layout
  SECTION: "relative py-16 px-6 md:py-24 md:px-12",
  CONTAINER: "max-w-7xl mx-auto",
  
  // Premium Interactivity (Lift, Glow, Scale)
  INTERACT: "hover:-translate-y-1 hover:shadow-premium hover:shadow-primary-500/20 active:scale-95 transition-all duration-300 cursor-pointer",
  GLOW: "hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
  
  // Action Pill
  ACTION_PILL: "flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border hover:border-primary-500 hover:text-primary-500 transition-all font-bold text-xs uppercase tracking-wider",
  
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
