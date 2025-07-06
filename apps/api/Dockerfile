FROM oven/bun AS development

WORKDIR /app

# Copy workspace configuration files
COPY package.json package.json
COPY bun.lock bun.lock
COPY packages/ packages/

# Cache packages installation
COPY apps/api/package.json apps/api/package.json

RUN bun install

COPY apps/api/src apps/api/src

FROM development AS build
ENV NODE_ENV=production

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	apps/api/src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000