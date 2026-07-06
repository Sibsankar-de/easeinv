.PHONY: help install build clean deploy logs restart status

.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make install   Install dependencies"
	@echo "  make build     Build the Next.js application"
	@echo "  make deploy    Build and deploy to the production server"
	@echo "  make clean     Remove local build artifacts"
	@echo "  make logs      Follow remote frontend service logs"
	@echo "  make restart   Restart the remote frontend service"
	@echo "  make status    Show remote frontend service status"

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

logs:
	ssh -p 8888 ubuntu@frontend.easeinv.app \
		"sudo journalctl -u easeinv_frontend.service -f"

restart:
	ssh -p 8888 ubuntu@frontend.easeinv.app \
		"sudo systemctl restart easeinv_frontend.service"

status:
	ssh -p 8888 ubuntu@frontend.easeinv.app \
		"sudo systemctl status easeinv_frontend.service --no-pager"