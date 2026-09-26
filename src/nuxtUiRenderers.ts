import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import {
  isEnumSchema,
  isMultiLineControl,
  isObjectControl,
  rankWith,
  Resolve,
  schemaTypeIs,
  uiTypeIs,
} from '@jsonforms/core'
import { markRaw } from 'vue'

import { createNuxtUiArrayListRenderer } from './renderers/complex/NuxtUiArrayListRenderer'
import { unwrapNullableSchema } from './renderers/nullableSchema'
import { NuxtUiObjectRenderer } from './renderers/complex/NuxtUiObjectRenderer'
import { createNuxtUiBooleanControl } from './renderers/controls/NuxtUiBooleanControl'
import {
  createNuxtUiEnumControl,
  type LocaleDirection,
} from './renderers/controls/NuxtUiEnumControl'
import { NuxtUiIntegerControl } from './renderers/controls/NuxtUiIntegerControl'
import { createNuxtUiNullableControl } from './renderers/controls/NuxtUiNullableControl'
import { NuxtUiMultiEnumControl } from './renderers/controls/NuxtUiMultiEnumControl'
import { NuxtUiNumberControl } from './renderers/controls/NuxtUiNumberControl'
import { NuxtUiPasswordControl } from './renderers/controls/NuxtUiPasswordControl'
import { createNuxtUiStringControl } from './renderers/controls/NuxtUiStringControl'
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

function controlSchema(
  uischema: unknown,
  schema: unknown,
  context: unknown,
): Record<string, unknown> | undefined {
  if (!uiTypeIs('Control')(uischema as any, schema as any, context as any)) {
    return undefined
  }

  const scope = (uischema as any)?.scope
  if (typeof scope !== 'string') return undefined

  const rootSchema = (context as any)?.rootSchema ?? schema
  try {
    const resolved = Resolve.schema(schema as any, scope, rootSchema as any)
    return unwrapNullableSchema(resolved, rootSchema)
  } catch {
    return undefined
  }
}

const isControlWithType = (type: string) =>
  (uischema: unknown, schema: unknown, context: unknown): boolean =>
    controlSchema(uischema, schema, context)?.type === type

const isEnumControl = (
  uischema: unknown,
  schema: unknown,
  context: unknown,
): boolean => {
  const resolved = controlSchema(uischema, schema, context)
  return resolved ? isEnumSchema(resolved as any) : false
}

const isOneOfEnumControl = (
  uischema: unknown,
  schema: unknown,
  context: unknown,
): boolean => {
  const oneOf = controlSchema(uischema, schema, context)?.oneOf
  return (
    Array.isArray(oneOf) &&
    oneOf.length > 0 &&
    oneOf.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        !Array.isArray(entry) &&
        'const' in entry,
    )
  )
}

const isPasswordControl = (
  uischema: unknown,
  schema: unknown,
  context: unknown,
): boolean => {
  const resolved = controlSchema(uischema, schema, context)
  return resolved?.type === 'string' && resolved.format === 'password'
}

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


export interface CreateNuxtUiRenderersOptions {
  /** Override theme classes. Use semantic jf-* or custom (Tailwind, etc.). */
  theme?: Partial<NuxtUiRenderersTheme>
  /**
   * Build full docs URL from schema x-docs-path.
   * When provided, controls with x-docs-path show a docs link next to the label.
   */
  docsUrl?: (path: string) => string
  /** Direction to apply to enum option labels; the button-group layout stays LTR. */
  localeDirection?: LocaleDirection
}

export function createNuxtUiRenderers(
  options?: CreateNuxtUiRenderersOptions,
): JsonFormsRendererRegistryEntry[] {
  const theme = mergeTheme(options?.theme)
  const docsUrl = options?.docsUrl
  const enumControl = createNuxtUiEnumControl(options?.localeDirection)
  const nullableEnumControl = createNuxtUiNullableControl(enumControl)
  const nullableTextareaControl = createNuxtUiNullableControl(NuxtUiTextareaControl)
  const nullableNumberControl = createNuxtUiNullableControl(NuxtUiNumberControl)
  const nullableIntegerControl = createNuxtUiNullableControl(NuxtUiIntegerControl)
  const nullableBooleanControl = createNuxtUiNullableControl(
    createNuxtUiBooleanControl(theme),
  )
  const nullablePasswordControl = createNuxtUiNullableControl(NuxtUiPasswordControl)
  const nullableStringControl = createNuxtUiNullableControl(
    createNuxtUiStringControl(docsUrl),
  )

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
      renderer: markRaw(nullableTextareaControl),
    },
    {
      tester: rankWith(RANK, isControlWithType('number')),
      renderer: markRaw(nullableNumberControl),
    },
    {
      tester: rankWith(RANK, isControlWithType('integer')),
      renderer: markRaw(nullableIntegerControl),
    },
    {
      tester: rankWith(RANK, isControlWithType('boolean')),
      renderer: markRaw(nullableBooleanControl),
    },
    {
      // Multi-enum must outrank generic array renderer and string renderer.
      tester: rankWith(ENUM_RANK, isMultiEnumControl),
      renderer: markRaw(NuxtUiMultiEnumControl),
    },
    {
      // oneOf with const+title (display labels) - same as enum for rendering.
      tester: rankWith(ENUM_RANK, isOneOfEnumControl),
      renderer: markRaw(nullableEnumControl),
    },
    {
      // Enum must outrank the generic string control, otherwise enums render
      // as freeform text inputs.
      tester: rankWith(ENUM_RANK, isEnumControl),
      renderer: markRaw(nullableEnumControl),
    },
    {
      tester: rankWith(PASSWORD_RANK, isPasswordControl),
      renderer: markRaw(nullablePasswordControl),
    },
    {
      tester: rankWith(RANK, isControlWithType('string')),
      renderer: markRaw(nullableStringControl),
    },
  ]
}

/** Default renderers with semantic theme. Import styles.css for default styling. */
export const nuxtUiRenderers: JsonFormsRendererRegistryEntry[] =
  createNuxtUiRenderers()
