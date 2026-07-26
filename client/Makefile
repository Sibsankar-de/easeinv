.PHONY: help install build clean deploy

.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make install   Install dependencies"
	@echo "  make build     Build the Next.js application"
	@echo "  make deploy    Build and deploy to the production server"
	@echo "  make clean     Remove local build artifacts"

install:
	npm ci

build:
	npm run build

clean:
	rm -rf .next
	rm -rf .deploy
	rm -f release.tar.gz

deploy:
	./deployment/deploy.sh
