FROM alpine:3.10.3
WORKDIR /usr/src/app
COPY . .
RUN apk -U add curl jq bash nodejs nodejs-npm && \
  npm install --no-optional && apk del --purge nodejs-npm && \
  rm -rvf /var/cache/* /root/.npm /tmp/* && \
  mkdir -p /var/chache/apk

HEALTHCHECK --interval=120s --timeout=10s \
  CMD curl -f -s http://localhost:5000/health/ || exit 1
EXPOSE 5000
ENTRYPOINT ["node","server.js"]
