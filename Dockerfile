# First stage: for building binary shipped to release
# container used as target for dev
FROM golang:1.13 as base

WORKDIR /go/src/github.com/ReturnPath/story-points

COPY ./go .

RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -a -installsuffix cgo -o /go/bin/story-points .

# Second stage: only run for release build
FROM alpine:latest

WORKDIR /app

COPY --from=base /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=base /go/bin/story-points .

EXPOSE 8081

CMD ["./story-points"]
