.PHONY: run build test vet lint lint-fix fmt tidy check

NEXORA_API_ADDR ?= :8080
GOLANGCI_LINT := $(shell go env GOPATH)/bin/golangci-lint

run:
	NEXORA_API_ADDR=$(NEXORA_API_ADDR) go run ./cmd/api

build:
	go build -o bin/api ./cmd/api

test:
	go test ./...

vet:
	go vet ./...

lint:
	$(GOLANGCI_LINT) run ./...

lint-fix:
	$(GOLANGCI_LINT) run ./... --fix

fmt:
	gofmt -l -w .

tidy:
	go mod tidy

# Full local verification, in the order to run it before opening a PR.
check: fmt vet lint test
