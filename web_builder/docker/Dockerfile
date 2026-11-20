FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /workspace && chmod 1777 /workspace

COPY scripts/ /scripts/
RUN chmod +x /scripts/*.sh && ln -s /scripts/create_store_user.sh /usr/local/bin/create_store_user.sh

WORKDIR /workspace

CMD ["tail", "-f", "/dev/null"]
