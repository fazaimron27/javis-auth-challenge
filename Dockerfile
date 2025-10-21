FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN apk add --no-cache netcat-openbsd

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Add startup script and wait-for-it script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/docker-entrypoint.sh /app/wait-for-it.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]