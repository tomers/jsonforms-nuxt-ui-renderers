import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import {
  and,
  formatIs,
  isBooleanControl,
  isEnumControl,
  isEnumSchema,
  isIntegerControl,
  isMultiLineControl,
  isNumberControl,
  isObjectControl,
  isStringControl,
  rankWith,
  Resolve,
  schemaTypeIs,
  uiTypeIs,
} from '@jsonforms/core'
import { markRaw } from 'vue'

import { createNuxtUiArrayListRenderer } from './renderers/complex/NuxtUiArrayListRenderer'
import { NuxtUiObjectRenderer } from './renderers/complex/NuxtUiObjectRenderer'
import { createNuxtUiBooleanControl } from './renderers/controls/NuxtUiBooleanControl'
import { NuxtUiEnumControl } from './renderers/controls/NuxtUiEnumControl'
import { NuxtUiIntegerControl } from './renderers/controls/NuxtUiIntegerControl'
import { NuxtUiMultiEnumControl } from './renderers/controls/NuxtUiMultiEnumControl'
import { NuxtUiNumberControl } from './renderers/controls/NuxtUiNumberControl'
import { NuxtUiPasswordControl } from './renderers/controls/NuxtUiPasswordControl'
import { NuxtUiStringControl } from './renderers/controls/NuxtUiStringControl'
import { NuxtUiTextareaControl } from './renderers/controls/NuxtUiTextareaControl'
import { createNuxtUiCategorizationRenderer } from './renderers/layouts/NuxtUiCategorizationRenderer'
import { createNuxtUiCategoryRenderer } from './renderers/layouts/NuxtUiCategoryRenderer'
import { createNuxtUiGroupRenderer } from './renderers/layouts/NuxtUiGroupRenderer'
import { createNuxtUiHorizontalLayoutRenderer } from './renderers/layouts/NuxtUiHorizontalLayoutRenderer'
import { createNuxtUiLabelRenderer } from './renderers/layouts/NuxtUiLabelRenderer'
import { createNuxtUiVerticalLayoutRenderer } from './renderers/layouts/NuxtUiVerticalLayoutRenderer'
import {
  mergeTheme,
  type NuxtUiRenderersTheme,
} from './renderers/theme'

// Intentionally rank higher than typical defaults.
const RANK = 10
const ENUM_RANK = RANK + 1
const PASSWORD_RANK = ENUM_RANK + 1

const isMultiEnumControl = (
  uischema: unknown,
  schema: unknown,
  context: unknown,
): boolean => {
  if (!uiTypeIs('Control')(uischema as any, schema as any, context as any)) {
    return false
  }

  const scope = (uischema as any)?.scope
  if (typeof scope !== 'string') return false

  // JSONForms passes the root schema into testers, but different call sites can
  // vary. Resolve against whatever we have, preferring the provided rootSchema.
  const rootSchema = (context as any)?.rootSchema ?? (schema as any)
  let resolved: any
  try {
    resolved = Resolve.schema(schema as any, scope, rootSchema)
  } catch {
    return false
  }

  if (resolved?.type !== 'array') return false

  const items = resolved?.items
  if (!items) return false

  // JSON Schema `items` can be a schema or an array of schemas.
  if (Array.isArray(items)) return false
  if (typeof items !== 'object' || items === null) return false

  const resolvedItems =
    '$ref' in items && typeof (items as any).$ref === 'string'
      ? Resolve.schema(rootSchema, (items as any).$ref, rootSchema)
      : items

  return isEnumSchema(resolvedItems as any)
}

/** Matches oneOf: [{ const, title? }, ...] - enum-like schema with display labels. */
const isOneOfEnumControl = (
  uischema: unknown,
  schema: unknown,
  context: unknown,
): boolean => {
  if (!uiTypeIs('Control')(uischema as any, schema as any, context as any)) {
    return false
  }

  const scope = (uischema as any)?.scope
  if (typeof scope !== 'string') return false

  const rootSchema = (context as any)?.rootSchema ?? (schema as any)
  let resolved: any
  try {
    resolved = Resolve.schema(schema as any, scope, rootSchema)
  } catch {
    return false
  }

  const oneOf = resolved?.oneOf
  if (!Array.isArray(oneOf) || oneOf.length === 0) return false

  for (const entry of oneOf) {
    if (typeof entry !== 'object' || entry === null) continue
    if (!('const' in (entry as Record<string, unknown>))) return false
  }
  return true
}

export interface CreateNuxtUiRenderersOptions {
  /** Override theme classes. Use semantic jf-* or custom (Tailwind, etc.). */
  theme?: Partial<NuxtUiRenderersTheme>
}

export function createNuxtUiRenderers(
  options?: CreateNuxtUiRenderersOptions,
): JsonFormsRendererRegistryEntry[] {
  const theme = mergeTheme(options?.theme)

  return [
    // Layouts
    {
      tester: rankWith(RANK, uiTypeIs('VerticalLayout')),
      renderer: markRaw(createNuxtUiVerticalLayoutRenderer(theme)),
    },
    {
      tester: rankWith(RANK, uiTypeIs('HorizontalLayout')),
      renderer: markRaw(createNuxtUiHorizontalLayoutRenderer(theme)),
    },
    {
      tester: rankWith(RANK, uiTypeIs('Group')),
      renderer: markRaw(createNuxtUiGroupRenderer(theme)),
    },
    {
      tester: rankWith(RANK, uiTypeIs('Categorization')),
      renderer: markRaw(createNuxtUiCategorizationRenderer(theme)),
    },
    {
      tester: rankWith(RANK, uiTypeIs('Category')),
      renderer: markRaw(createNuxtUiCategoryRenderer(theme)),
    },
    {
      tester: rankWith(RANK, uiTypeIs('Label')),
      renderer: markRaw(createNuxtUiLabelRenderer(theme)),
    },

    // Complex schemas
    {
      tester: rankWith(RANK, schemaTypeIs('array')),
      renderer: markRaw(createNuxtUiArrayListRenderer(theme)),
    },
    {
      tester: rankWith(RANK, isObjectControl),
      renderer: markRaw(NuxtUiObjectRenderer),
    },

    // Primitive controls
    {
      tester: rankWith(RANK, isMultiLineControl),
      renderer: markRaw(NuxtUiTextareaControl),
    },
    {
      tester: rankWith(RANK, isNumberControl),
      renderer: markRaw(NuxtUiNumberControl),
    },
    {
      tester: rankWith(RANK, isIntegerControl),
      renderer: markRaw(NuxtUiIntegerControl),
    },
    {
      tester: rankWith(RANK, isBooleanControl),
      renderer: markRaw(createNuxtUiBooleanControl(theme)),
    },
    {
      // Multi-enum must outrank generic array renderer and string renderer.
      tester: rankWith(ENUM_RANK, isMultiEnumControl),
      renderer: markRaw(NuxtUiMultiEnumControl),
    },
    {
      // oneOf with const+title (display labels) - same as enum for rendering.
      tester: rankWith(ENUM_RANK, isOneOfEnumControl),
      renderer: markRaw(NuxtUiEnumControl),
    },
    {
      // Enum must outrank the generic string control, otherwise enums render
      // as freeform text inputs.
      tester: rankWith(ENUM_RANK, isEnumControl),
      renderer: markRaw(NuxtUiEnumControl),
    },
    {
      tester: rankWith(PASSWORD_RANK, and(isStringControl, formatIs('password'))),
      renderer: markRaw(NuxtUiPasswordControl),
    },
    {
      tester: rankWith(RANK, isStringControl),
      renderer: markRaw(NuxtUiStringControl),
    },
  ]
}

/** Default renderers with semantic theme. Import styles.css for default styling. */
export const nuxtUiRenderers: JsonFormsRendererRegistryEntry[] =
  createNuxtUiRenderers()
