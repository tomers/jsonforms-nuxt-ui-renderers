import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import {
  isBooleanControl,
  isEnumControl,
  isIntegerControl,
  isMultiLineControl,
  isNumberControl,
  isObjectControl,
  isStringControl,
  rankWith,
  schemaTypeIs,
  uiTypeIs,
} from '@jsonforms/core'
import { markRaw } from 'vue'

import { NuxtUiArrayListRenderer } from './renderers/complex/NuxtUiArrayListRenderer'
import { NuxtUiObjectRenderer } from './renderers/complex/NuxtUiObjectRenderer'
import { NuxtUiBooleanControl } from './renderers/controls/NuxtUiBooleanControl'
import { NuxtUiEnumControl } from './renderers/controls/NuxtUiEnumControl'
import { NuxtUiIntegerControl } from './renderers/controls/NuxtUiIntegerControl'
import { NuxtUiNumberControl } from './renderers/controls/NuxtUiNumberControl'
import { NuxtUiStringControl } from './renderers/controls/NuxtUiStringControl'
import { NuxtUiTextareaControl } from './renderers/controls/NuxtUiTextareaControl'
import { NuxtUiCategorizationRenderer } from './renderers/layouts/NuxtUiCategorizationRenderer'
import { NuxtUiCategoryRenderer } from './renderers/layouts/NuxtUiCategoryRenderer'
import { NuxtUiGroupRenderer } from './renderers/layouts/NuxtUiGroupRenderer'
import { NuxtUiHorizontalLayoutRenderer } from './renderers/layouts/NuxtUiHorizontalLayoutRenderer'
import { NuxtUiLabelRenderer } from './renderers/layouts/NuxtUiLabelRenderer'
import { NuxtUiVerticalLayoutRenderer } from './renderers/layouts/NuxtUiVerticalLayoutRenderer'

// Intentionally rank higher than typical defaults.
const RANK = 10
const ENUM_RANK = RANK + 1

export const nuxtUiRenderers: JsonFormsRendererRegistryEntry[] = [
  // Layouts
  {
    tester: rankWith(RANK, uiTypeIs('VerticalLayout')),
    renderer: markRaw(NuxtUiVerticalLayoutRenderer),
  },
  {
    tester: rankWith(RANK, uiTypeIs('HorizontalLayout')),
    renderer: markRaw(NuxtUiHorizontalLayoutRenderer),
  },
  {
    tester: rankWith(RANK, uiTypeIs('Group')),
    renderer: markRaw(NuxtUiGroupRenderer),
  },
  {
    tester: rankWith(RANK, uiTypeIs('Categorization')),
    renderer: markRaw(NuxtUiCategorizationRenderer),
  },
  {
    tester: rankWith(RANK, uiTypeIs('Category')),
    renderer: markRaw(NuxtUiCategoryRenderer),
  },
  {
    tester: rankWith(RANK, uiTypeIs('Label')),
    renderer: markRaw(NuxtUiLabelRenderer),
  },

  // Complex schemas
  {
    tester: rankWith(RANK, schemaTypeIs('array')),
    renderer: markRaw(NuxtUiArrayListRenderer),
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
    renderer: markRaw(NuxtUiBooleanControl),
  },
  {
    // Enum must outrank the generic string control, otherwise enums can render
    // as freeform text inputs.
    tester: rankWith(ENUM_RANK, isEnumControl),
    renderer: markRaw(NuxtUiEnumControl),
  },
  {
    tester: rankWith(RANK, isStringControl),
    renderer: markRaw(NuxtUiStringControl),
  },
]

