FROM alpine:3.10.3 AS builder
WORKDIR /usr/src/app
COPY . .
RUN apk --no-cache --virtual build-dependencies add python make g++ nodejs nodejs-npm && \
  npm install --no-optional --no-shrinkwrap --no-package-lock

FROM alpine:3.10.3
WORKDIR /app
COPY --from=builder  /usr/src/app .
RUN apk --no-cache --virtual add nodejs nodejs-npm && \
  npm run build && \
  rm -rvf /var/cache/* /root/.npm /tmp/* 2>/dev/null && \
  mkdir -p /var/chache/apk

EXPOSE 3000
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

ENTRYPOINT ["npm","run","start"]
