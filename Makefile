# MoonHub-PWA Makefile
# Development and CI utilities

.PHONY: dev build preview lint typecheck test check ci clean help

# Default target
.DEFAULT_GOAL := help

# Development
dev: ## Start development server
	pnpm dev

build: ## Build for production
	pnpm build

preview: ## Preview production build
	pnpm preview

# Quality checks
lint: ## Run ESLint
	pnpm lint

typecheck: ## Run TypeScript type checking
	pnpm typecheck

test: ## Run tests
	pnpm test

# Combined checks
check: lint typecheck build ## Run all checks (lint + typecheck + build)

ci: lint typecheck ## Simulate CI pipeline locally
	@echo "✅ CI checks passed"

# Utilities
clean: ## Clean build artifacts
	rm -rf dist

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'
