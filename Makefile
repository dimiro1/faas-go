.PHONY: build test lint clean run help dev install-tools fmt-frontend

BINARY_NAME=faas-go
BUILD_DIR=build

help:
	@echo "Available targets:"
	@echo "  build        - Build the application"
	@echo "  test         - Run all tests"
	@echo "  lint         - Run golangci-lint"
	@echo "  clean        - Remove build artifacts"
	@echo "  run          - Build and run the application"
	@echo "  all          - Run lint, test, and build"
	@echo "  fmt-frontend - Format frontend JS files with deno fmt"

build:
	@echo "Building..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd

test:
	@echo "Running tests..."
	@go test ./...

lint:
	@echo "Running linter..."
	@golangci-lint run

clean:
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)

run:
	@echo "Running application..."
	@go run ./cmd

all: lint test build
	@echo "All checks passed!"

dev:
	@echo "Starting development mode with air..."
	@air

install-tools:
	@echo "Installing development tools..."
	@go install github.com/air-verse/air@latest

fmt-frontend:
	@echo "Formatting frontend..."
	@deno fmt frontend/
