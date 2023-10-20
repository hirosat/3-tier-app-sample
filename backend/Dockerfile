# Dockerfile
# Python 3.8をベースとする公式のイメージを使用
FROM python:3.8

# ワーキングディレクトリを設定
WORKDIR /app

# 依存関係をコピーしてインストール
COPY requirements.txt .
RUN pip install -r requirements.txt

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションを起動
CMD ["python", "app.py"]
