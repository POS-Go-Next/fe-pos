FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY ./package.json ./yarn.lock* ./package-lock.json* ./pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then echo "Installing with Yarn" && yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then echo "Installing with npm" && npm ci; \
  elif [ -f pnpm-lock.yaml ]; then echo "Installing with pnpm" && npm i -g pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found. Please ensure that either yarn.lock, package-lock.json, or pnpm-lock.yaml is present." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./ ./

RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm build; \
  else echo "Lockfile not found2." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]