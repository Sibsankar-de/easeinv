.PHONY: dev docker-down docker-up build deploy prisma

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

prisma: docker-down docker-up
	npm run db:generate
	npm run db:migrate
