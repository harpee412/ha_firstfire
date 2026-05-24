ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    py3-pip \
    nodejs \
    npm \
    bash

COPY requirements.txt .

RUN pip install --break-system-packages --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/frontend

RUN npm install
RUN npm run build

WORKDIR /app

COPY run.sh .
RUN chmod +x run.sh

CMD [ "/app/run.sh" ]