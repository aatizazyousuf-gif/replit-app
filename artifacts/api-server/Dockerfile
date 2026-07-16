# Build context is the REPO ROOT (not this folder) because this is a pnpm
# workspace and api-server depends on the sibling `lib/db` and `lib/api-zod`
# packages. See .github/workflows/deploy-backend.yml for how it's invoked.

FROM node:24-slim AS build
RUN corepack enable && corepack prepare pnpm@11 --activate
WORKDIR /repo

# Copy just the manifests first so Docker can cache the install layer
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

# Bundles src/index.ts (and the workspace deps it imports) into a single
# self-contained dist/index.mjs via esbuild - see artifacts/api-server/build.mjs
RUN pnpm --filter @workspace/api-server run build

# ---- runtime image: just Node + the bundled output, nothing else ----
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/artifacts/api-server/dist ./dist

# Cloud Run sets PORT itself (defaults to 8080); the app already reads
# process.env.PORT, so nothing to configure here.
EXPOSE 8080
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
