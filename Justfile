set dotenv-load := true

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
  if [ -z "${NPM_TOKEN:-}" ]; then echo "NPM_TOKEN is required (set it in .env)"; exit 1; fi
  printf "//registry.npmjs.org/:_authToken=%s\n" "$NPM_TOKEN" > .npmrc
  if [ -n "${NPM_TAG:-}" ]; then npm publish --tag "$NPM_TAG"; else npm publish; fi
  rm -f .npmrc

