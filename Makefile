.PHONY: help dev build lint preview clean deps install

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

deps: install ## Install dependencies (alias for install)

install: ## Install npm dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

lint: ## Run linter
	npm run lint

preview: ## Preview production build
	npm run preview

clean: ## Clean build artifacts and node_modules
	rm -rf dist node_modules

