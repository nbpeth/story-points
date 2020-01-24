# Build angular app
FROM node:12.2.0 as ngbuild

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/
RUN npm run build

# Build API
FROM golang:1.13 as storypointsbase

WORKDIR /go/src/github.com/ReturnPath/story-points

COPY --from=ngbuild /usr/src/app/dist ../dist
COPY ./go .

RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -a -installsuffix cgo -o /go/bin/story-points .

# Second stage: only run for release build
FROM alpine:latest

WORKDIR /app

COPY --from=storypointsbase /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=storypointsbase /go/bin/story-points .
COPY --from=ngbuild /usr/src/app/dist ../dist

EXPOSE 8081

CMD ["./story-points"]
