FROM alpine:latest
LABEL maintainer="Nomu Nyan <nomu_nyan@yahoo.co.jp>"

RUN apk add --no-cache nodejs yarn
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY tsconfig.json src ./
RUN yarn build
EXPOSE 3000
CMD [ "yarn", "start:prod" ]
