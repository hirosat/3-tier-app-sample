# Dockerfile
# Node.jsをベースとする公式のイメージを使用
FROM node:latest

# ワーキングディレクトリを設定
WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# アプリケーションを起動
CMD [ "npm", "start" ]

