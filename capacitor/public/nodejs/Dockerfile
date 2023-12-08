FROM alpine:3.19 AS worker

RUN apk add curl unzip
RUN curl -L https://github.com/nodejs-mobile/nodejs-mobile/releases/download/v18.17.2/nodejs-mobile-v18.17.2-android.zip -o libnode.zip
RUN unzip libnode.zip

FROM saschpe/android-ndk:33-jdk17.0.8_7-ndk25.2.9519653-cmake3.22.1

COPY --from=worker ./nodejs-mobile* /opt/libnode
ENV LIBNODE_PATH=/opt/libnode

# Install nodejs 18 (same version as nodejs-mobile)
ARG NODE_MAJOR=18

RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg make
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y

WORKDIR /app