/**
 * Theme for JSONForms Nuxt UI renderers.
 * Uses semantic class names (jf-*) - styled by default styles.css.
 * Consumers can override any role with custom classes (Tailwind, Bootstrap, etc.).
 */

export interface NuxtUiRenderersTheme {
  /** Bordered panel (top-level groups, array items). */
  panel: string
  /** Nested group container (no border, padding only). */
  groupNested: string
  /** Vertical stack layout. */
  layoutVertical: string
  /** Vertical stack with wider gap (categorization). */
  layoutVerticalWide: string
  /** Horizontal layout, responsive. */
  layoutHorizontal: string
  /** Child of horizontal layout (flex grow, min-width). */
  layoutHorizontalItem: string
  /** Array item toolbar (flex + margin). */
  arrayItemToolbar: string
  /** Section/category label. */
  labelSection: string
  /** Section label with bottom margin. */
  labelSectionSpaced: string
  /** Muted secondary text. */
  textMuted: string
  /** Muted secondary text, smaller. */
  textMutedXs: string
  /** Array item title. */
  textItemTitle: string
  /** Suffix after item title. */
  textItemSuffix: string
  /** Plain label. */
  textLabel: string
  /** Flex row: centered, space between. */
  flexBetween: string
  /** Flex row: start-aligned, space between. */
  flexBetweenStart: string
  /** Compact flex row for action buttons. */
  flexActions: string
}

/** Semantic class defaults - styled by styles.css. No Tailwind/CSS framework dependency. */
export const defaultTheme: NuxtUiRenderersTheme = {
  panel: 'jf-panel',
  groupNested: 'jf-group',
  layoutVertical: 'jf-layout-vertical',
  layoutVerticalWide: 'jf-layout-vertical-wide',
  layoutHorizontal: 'jf-layout-horizontal',
  layoutHorizontalItem: 'jf-layout-horizontal-item',
  arrayItemToolbar: 'jf-array-item-toolbar',
  labelSection: 'jf-label-section',
  labelSectionSpaced: 'jf-label-section-spaced',
  textMuted: 'jf-text-muted',
  textMutedXs: 'jf-text-muted-xs',
  textItemTitle: 'jf-text-item-title',
  textItemSuffix: 'jf-text-item-suffix',
  textLabel: 'jf-text-label',
  flexBetween: 'jf-flex-between',
  flexBetweenStart: 'jf-flex-between-start',
  flexActions: 'jf-flex-actions',
}

export function mergeTheme(
  overrides?: Partial<NuxtUiRenderersTheme>,
): NuxtUiRenderersTheme {
  return overrides ? { ...defaultTheme, ...overrides } : { ...defaultTheme }
}
