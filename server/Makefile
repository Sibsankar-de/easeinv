.PHONY: dev docker-down docker-up build deploy

dev: docker-down docker-up npm-dev

docker-down:
	docker compose down

docker-up:
	docker compose up -d

npm-dev:
	npm run dev

build:
	npm ci
	npm run build

deploy: build
	bash deployment/deploy.sh
