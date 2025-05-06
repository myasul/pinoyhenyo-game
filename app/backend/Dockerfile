# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.18.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"
ENV NODE_ENV=production

# ========= Build Stage ==========
FROM base AS build

# 👇 Override the inherited production NODE_ENV so devDependencies get installed
ENV NODE_ENV=development

# Install build deps
# RUN apt-get update -qq && \
#     apt-get install --no-install-recommends -y --fix-missing build-essential node-gyp pkg-config python-is-python3

# Set monorepo root in container as /app
WORKDIR /app

# Copy everything so workspaces can be resolved
COPY . .

# Install dependencies using Yarn Workspaces
RUN yarn install --frozen-lockfile

# Build only the backend
RUN yarn workspace backend build

# ========= Final Stage ==========
FROM base

WORKDIR /app

# Copy only production deps (optional)
COPY --from=build /app/node_modules ./app/node_modules

# Copy only built output and runtime files
COPY --from=build /app/app/backend ./app/backend
COPY --from=build /app/shared ./shared
COPY --from=build /app/yarn.lock ./yarn.lock

# Set working dir to backend
WORKDIR /app/app/backend

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
