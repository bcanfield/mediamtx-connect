FROM node:20.10.0-alpine@sha256:e96618520c7db4c3e082648678ab72a49b73367b9a1e7884cf75ac30a198e454 AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY --chown=node:node prisma ./prisma

RUN npm ci && npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# If using npm comment out above and use below instead
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Create Screenshots and Recordings Directories
RUN mkdir /screenshots
RUN chown nextjs:nodejs /screenshots

RUN mkdir /recordings
RUN chown nextjs:nodejs /recordings

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg
RUN apk --no-cache add curl

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/node_modules/prisma/ ./node_modules/prisma/
COPY --from=builder --chown=node:node /app/node_modules/@prisma/ ./node_modules/@prisma/
COPY --from=builder --chown=node:node /app/node_modules/sharp/ ./node_modules/sharp/

COPY --chown=node:node --from=builder /app/scripts/start.sh ./start.sh
COPY --chown=node:node --from=builder /app/prisma ./prisma
RUN chown -R nextjs:nodejs ./prisma
RUN chmod -R 777 ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT [ "/bin/sh" ]
CMD ["./start.sh"]