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

// <JsonForms :schema="schema" :uischema="uischema" :data="data" :renderers="nuxtUiRenderers" />
```

### Important

- These renderers **resolve Nuxt UI components by name** (e.g. `UInput`, `UFormField`, `UButton`).
  Your app must register Nuxt UI components globally (Nuxt does this when you use the `@nuxt/ui` module).
- If you override component names or use a different UI library, these renderers will not work out of the box.

## Supported UI schema / schema constructs

- **Controls**: string, multiline string, number, integer, boolean, enum
- **Layouts**: `VerticalLayout`, `HorizontalLayout`, `Group`, `Label`, `Category`, `Categorization`
- **Complex**: arrays (list UI), objects (delegates to generated/registered detail UI schema)

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
