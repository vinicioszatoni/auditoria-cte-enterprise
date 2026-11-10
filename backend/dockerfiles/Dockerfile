FROM 414700354900.dkr.ecr.us-east-1.amazonaws.com/base/golden-image/v2/node:24-dev AS builder

USER root
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=build

COPY . ./

RUN --mount=type=secret,id=NODE_AUTH_TOKEN,env=NODE_AUTH_TOKEN \
  echo "@grupoboticario:registry=https://npm.pkg.github.com/" > ./.npmrc && \
  echo "//npm.pkg.github.com/:_authToken=$NODE_AUTH_TOKEN" >> ./.npmrc && \
  npm ci
RUN npm run build
RUN npm prune --production
RUN rm -f .npmrc

FROM 414700354900.dkr.ecr.us-east-1.amazonaws.com/base/golden-image/v2/node:24

WORKDIR /app

COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
COPY --chown=65532:65532 --from=builder /app/dist /app/
COPY --chown=65532:65532 --from=builder /app/node_modules /app/node_modules

USER 65532

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--", "node", "src/index.js"]

