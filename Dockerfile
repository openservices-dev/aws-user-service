FROM node:22-alpine AS build

RUN apk add dumb-init

RUN corepack enable
RUN yarn set version berry

USER node

RUN mkdir /home/node/aws-user-service/ && chown -R node:node /home/node/aws-user-service
WORKDIR /home/node/aws-user-service

COPY --chown=node:node . .
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:22-alpine

ARG USER_NAME=openservices
ARG GROUP_NAME=openservices
ARG PORT=3010

ENV NODE_ENV production

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init

RUN apk update && apk upgrade --no-cache && \
  corepack enable && \
  yarn set version berry && \
  addgroup --gid 3000 --system ${GROUP_NAME} && \
  adduser  --uid 2000 --system --ingroup ${GROUP_NAME} ${USER_NAME} && \
  mkdir /home/${USER_NAME}/aws-user-service/

USER 2000:3000

WORKDIR /home/${USER_NAME}/aws-user-service

COPY --chown=${USER_NAME}:${GROUP_NAME} --from=build /home/node/aws-user-service/dist ./dist
COPY --chown=${USER_NAME}:${GROUP_NAME} --from=build /home/node/aws-user-service/node_modules ./node_modules

EXPOSE $PORT

CMD [ "dumb-init", "node", "dist/index.js" ]
