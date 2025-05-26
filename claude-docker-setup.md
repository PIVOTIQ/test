# Claude Code Docker環境

このプロジェクトは、Claude CodeをDocker環境で実行するためのセットアップです。

## 必要な環境

- Docker
- Docker Compose
- Anthropic API Key（[console.anthropic.com](https://console.anthropic.com/)から取得）

## セットアップ手順

### 1. Dockerイメージをビルド

```bash
docker-compose build
```

### 2. 環境変数の設定

`env.example`をコピーして`.env`ファイルを作成し、Anthropic API Keyを設定：

```bash
cp env.example .env
# .envファイルを編集してAPIキーを設定
```

### 3. コンテナを起動

```bash
# 全てのコンテナを起動
docker-compose up -d

# 特定のコンテナのみ起動
docker-compose up -d claude-dev
docker-compose up -d claude-dev-2
```

### 4. コンテナに接続

```bash
# 1つ目のコンテナに接続
docker-compose exec claude-dev bash

# 2つ目のコンテナに接続
docker-compose exec claude-dev-2 bash
```

## Claude Codeの使用方法

### 基本的な使用方法

```bash
# Claude Codeを起動
claude

# 特定のタスクを実行
claude "プロジェクトの構造を説明して"

# ヘルプを表示
claude --help
```

### 主要コマンド

- `claude` - インタラクティブモードで起動
- `claude "質問やタスク"` - 直接質問やタスクを実行
- `/help` - ヘルプを表示
- `/clear` - 会話履歴をクリア
- `/cost` - トークン使用量を表示
- `/bug` - バグレポートを送信

### 使用例

```bash
# コードの説明
claude "このプロジェクトのアーキテクチャを説明して"

# ファイルの作成
claude "Express.jsのAPIサーバーを作成して"

# バグ修正
claude "auth moduleのタイプエラーを修正して"

# Git操作
claude "変更をコミットして"
```

## ディレクトリ構造

```
.
├── Dockerfile              # Docker環境の定義
├── docker-compose.yml      # Docker Compose設定
├── env.example             # 環境変数のサンプル
├── .env                    # 環境変数（自分で作成）
└── claude-docker-setup.md  # このファイル
```

## 複数コンテナでのボリューム共有

現在の設定では、2つのコンテナが同じボリュームを共有しています：

- **共有ボリューム**：
  - `claude-home` - ホームディレクトリ（設定ファイルなどの永続化）
  - `.:/workspace` - プロジェクトファイル

- **利用可能なコンテナ**：
  - `claude-dev` - メインのClaude Codeコンテナ（ポート3000, 8000, 8080）
  - `claude-dev-2` - セカンダリコンテナ（ポート3001, 8001, 8081）

### ボリューム共有の確認

```bash
# コンテナ1でファイル作成
docker-compose exec claude-dev bash -c "echo 'shared data' > /home/developer/test.txt"

# コンテナ2で同じファイルを確認
docker-compose exec claude-dev-2 bash -c "cat /home/developer/test.txt"
```

## トラブルシューティング

### Authentication エラー

1. `.env`ファイルにAPIキーが正しく設定されているか確認
2. AnthropicのコンソールでAPIキーが有効か確認
3. 課金設定が有効になっているか確認

### Permission エラー

コンテナ内で権限エラーが発生した場合：

```bash
# rootユーザーでコンテナに接続
docker-compose exec --user root claude-dev bash
```

### Node.js/npm エラー

```bash
# Node.jsとnpmのバージョンを確認
node --version
npm --version

# Claude Codeの再インストール
npm install -g @anthropic-ai/claude-code
```

## 注意事項

- APIキーは絶対に公開リポジトリにコミットしないでください
- `.env`ファイルは`.gitignore`に含まれていることを確認してください
- Claude Codeの使用には課金が発生します

## 参考リンク

- [Claude Code公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Anthropic Console](https://console.anthropic.com/)
- [Claude Code npm package](https://www.npmjs.com/package/@anthropic-ai/claude-code)