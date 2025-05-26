# Ubuntu 22.04をベースにしたDockerfile
FROM ubuntu:22.04

# 環境変数の設定
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20

# システムの更新と基本パッケージのインストール
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    vim \
    nano \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20.xのインストール
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# npmのグローバルパッケージディレクトリを設定
RUN mkdir -p /usr/local/lib/node_modules && \
    npm config set prefix /usr/local

# Claude Codeのインストール
RUN npm install -g @anthropic-ai/claude-code

# 作業ディレクトリの設定
WORKDIR /workspace

# デフォルトユーザーの作成（rootを避けるため）
RUN useradd -m -s /bin/bash developer && \
    chown -R developer:developer /workspace

# developerユーザーに切り替え
USER developer

# bashrcにNode.jsのパスを追加
RUN echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bashrc

# デフォルトコマンド
CMD ["/bin/bash"] 