.PHONY: run build test vet fmt tidy

NEXORA_API_ADDR ?= :8080

run:
	NEXORA_API_ADDR=$(NEXORA_API_ADDR) go run ./cmd/api

build:
	go build -o bin/api ./cmd/api

test:
	go test ./...

vet:
	go vet ./...

fmt:
	gofmt -l -w .

tidy:
	go mod tidy
