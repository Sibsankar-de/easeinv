.PHONY: dev dev-down serve test lint lint-fix build-sandbox build-executor docker-build help

ifeq (test,$(firstword $(MAKECMDGOALS)))
  TEST_TARGET := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  $(eval .PHONY: $(TEST_TARGET))
  $(eval $(TEST_TARGET):;@:)
endif

dev:
	docker compose up -d

dev-down:
	docker compose down

serve:
	uv run python main.py

build-sandbox:
	docker compose build command_executor

build-executor: build-sandbox

docker-build: build-sandbox

test:
	@if [ -n "$(TEST_TARGET)" ]; then \
		uv run python -m unittest $(TEST_TARGET); \
	elif [ -n "$(FILE)" ]; then \
		uv run python -m unittest $(FILE); \
	else \
		uv run python -m unittest discover tests; \
	fi

lint:
	uv run ruff check .

lint-fix:
	uv run ruff check --fix .
