FROM mcr.microsoft.com/devcontainers/javascript-node:20

WORKDIR /workspace

# VoltaとNodeのインストールをまとめる
RUN curl https://get.volta.sh | bash && \
    export VOLTA_HOME=/root/.volta && \
    export PATH=$VOLTA_HOME/bin:$PATH && \
    volta install node@18 && \
    volta install npm@9 && \
    npm install -g ts-node typescript dotenv