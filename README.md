# jsonforms-nuxt-ui-renderers

JSONForms renderer set for **Nuxt UI** (`@nuxt/ui`) on Vue 3 / Nuxt.

This package provides a `renderers` registry you pass to `@jsonforms/vue`'s `JsonForms` component.

## Install

```bash
pnpm add jsonforms-nuxt-ui-renderers @jsonforms/core @jsonforms/vue
pnpm add -D @nuxt/ui
```

Nuxt UI should be installed/configured in your Nuxt app (see Nuxt UI docs).

## Usage (Nuxt / Vue)

```ts
import { JsonForms } from '@jsonforms/vue'
import { nuxtUiRenderers } from 'jsonforms-nuxt-ui-renderers'
import 'jsonforms-nuxt-ui-renderers/styles.css'

// <JsonForms :schema="schema" :uischema="uischema" :data="data" :renderers="nuxtUiRenderers" />
```

Import `styles.css` for default styling of layout panels, labels, and typography. The package uses semantic class names (`jf-*`) and does not depend on Tailwind or any specific CSS framework.

### Important

- These renderers **resolve Nuxt UI components by name** (e.g. `UFormField`, `UInput`, `UTextarea`, `USelectMenu`, `USwitch`, `UButton`).
  Your app must register Nuxt UI components globally (Nuxt does this when you use the `@nuxt/ui` module).
- If you override component names or use a different UI library, these renderers will not work out of the box.

## Supported UI schema / schema constructs

This package is intentionally small and opinionated: it ships a **single** renderer registry (`nuxtUiRenderers`) covering the following UI schema elements / JSON Schema patterns.

### Controls (field types)

- **String**: JSON Schema `type: "string"` → `UInput`
- **Multiline string**: JSONForms “multiline” control (e.g. `uischema.options.multi: true`) → `UTextarea`
- **Password**: JSON Schema `type: "string"` + `format: "password"` → `UInput type="password"` with show/hide toggle button
- **Number**: JSON Schema `type: "number"` → `UInput type="number"` (parses to `number`, empty becomes `undefined`)
- **Integer**: JSON Schema `type: "integer"` → `UInput type="number" step="1"` (parses to `integer`, empty becomes `undefined`)
- **Boolean**: JSON Schema `type: "boolean"` → `USwitch`
- **Enum (single-select)**: JSON Schema `enum: [...]` (or `oneOf: [{ const, title? }, ...]`) → `USelectMenu`
- **Enum (multi-select)**: JSON Schema `type: "array"` with `items` being an enum schema (supports `$ref`’d `items`) → `USelectMenu multiple`

### Layouts

- **`VerticalLayout`**
- **`HorizontalLayout`** (responsive: stacks on small screens, wraps into columns on larger screens)
- **`Group`**
- **`Label`**
- **`Categorization` / `Category`**

### Complex types

- **Arrays (list UI)**: any schema with `type: "array"` renders as a list with **Add / Remove / Up / Down**
  - Respects `minItems` / `maxItems` (disables buttons accordingly)
  - Item label can be customized via `uischema.options.childLabelProp`; otherwise it uses JSONForms’ first primitive property as a best-effort label
  - “Add” uses JSONForms `createDefaultValue(...)` for the item value
- **Objects**: object controls delegate to a **detail UI schema**
  - If no matching detail UI schema is registered, a default one is generated via JSONForms `Generate.uiSchema(...)`
  - The root object is rendered as a `VerticalLayout`; nested objects default to a `Group` using the control’s label

## Theming

The package uses semantic class names (`jf-*`) for layout and typography. Two ways to customize:

### Option 1: Default styles + CSS variables

Import the default stylesheet and override variables in your app:

```ts
import 'jsonforms-nuxt-ui-renderers/styles.css'
```

CSS variables (in `styles.css`) you can override in `:root`:

| Variable | Default | Description |
|----------|---------|-------------|
| `--jf-panel-border` | `1px solid rgba(0,0,0,0.06)` | Panel border |
| `--jf-panel-border-radius` | `0.25rem` | Panel corner radius |
| `--jf-panel-padding` | `0.75rem` | Panel padding |
| `--jf-gap` | `0.75rem` | Layout gap |
| `--jf-gap-wide` | `1.5rem` | Wide layout gap |
| `--jf-label-section-size` | `0.875rem` | Label font size |
| `--jf-label-section-weight` | `600` | Label font weight |
| `--jf-text-muted-color` | `rgb(107 114 128)` | Muted text (light) |
| `--jf-text-muted-color-dark` | `rgb(156 163 175)` | Muted text (dark) |
| `--jf-text-item-title-color` | `rgb(55 65 81)` | Item title (light) |
| `--jf-text-item-title-color-dark` | `rgb(229 231 235)` | Item title (dark) |
| `--jf-text-label-color` | `rgb(75 85 99)` | Label (light) |
| `--jf-text-label-color-dark` | `rgb(209 213 219)` | Label (dark) |

### Option 2: Theme overrides (e.g. Tailwind)

Pass custom classes to match your app. You can omit `styles.css` when using full overrides:

```ts
import { createNuxtUiRenderers } from 'jsonforms-nuxt-ui-renderers'

const renderers = createNuxtUiRenderers({
  theme: {
    panel: 'rounded border border-default bg-muted/40 p-3',
    groupNested: 'rounded bg-muted/20 p-3',
    layoutVertical: 'flex flex-col gap-3',
    layoutHorizontal: 'flex flex-col gap-3 md:flex-row md:flex-wrap',
    labelSection: 'text-sm font-semibold',
    textMuted: 'text-sm text-muted',
    // ... see NuxtUiRenderersTheme for all keys
  },
})
```

Theme keys: `panel`, `groupNested`, `layoutVertical`, `layoutVerticalWide`, `layoutHorizontal`, `layoutHorizontalItem`, `arrayItemToolbar`, `labelSection`, `labelSectionSpaced`, `textMuted`, `textMutedXs`, `textItemTitle`, `textItemSuffix`, `textLabel`, `flexBetween`, `flexBetweenStart`, `flexActions`.

## Contributing

- Install deps: `pnpm install`
- Run tests: `pnpm test`
- Build: `pnpm build`

## Publishing (npm)

This repo is set up so you can publish via `just publish` (manual) or via GitHub Actions (recommended).

### CI publish (recommended)

- Bump `package.json` version
- Push a tag matching the version: `vX.Y.Z` (e.g. `v0.1.0`)
- CI will run checks and publish to npm via npm “trusted publishing” (OIDC). No repository secret is required.

### Manual publish (local)

- Ensure you are authenticated to npm (e.g. `npm login` or a preconfigured npm auth in your environment)
- Run:

```bash
just publish
```

Optional:
- `NPM_TAG`: publish under a dist-tag (e.g. `next`)

## License

MIT
