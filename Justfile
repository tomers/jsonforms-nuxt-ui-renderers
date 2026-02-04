@test:
  pnpm run test

@build:
  pnpm run build

@typecheck:
  pnpm run typecheck

@publish:
  pnpm install --frozen-lockfile
  pnpm run test
  pnpm run build
  if [ -n "${NPM_TAG:-}" ]; then npm publish --access public --tag "$NPM_TAG"; else npm publish --access public; fi
