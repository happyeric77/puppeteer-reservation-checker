# !!IMPORTANT: READ THIS BEFORE USE!! - ONLY FOR LINUX ARM64V8 (AARCH64) ARCHITECTURE
# The puppeteer Dockerfile for Debian arm64v8 (aarch64) architecture - raspberry pi
# Reference blog: https://zenn.dev/tom1111/articles/0dc7cde5c8e9bf
FROM node:18-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Installs the necessary libs to make the bundled version of Chromium work.
RUN apt-get update \
    && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app
COPY . /usr/app/

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm install

CMD ["npm", "start"]

# !IMPORTANT: Make sure to launch puppeteer with:
# const browser = await puppeteer.launch({
#   executablePath: '/usr/bin/chromium',
#   args: ['--no-sandbox', '--disable-setuid-sandbox']
# });

# Note: To check logs and screenshots, use `sudo docker cp <container-id>:/usr/app/assets ./assets`