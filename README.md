# outofpocket

Don't forget to in each directory and set .

## `ingest`

FastAPI endpoints to read DL and paystub info

### Getting Started

1. `pip install -r requirements.txt`
1. Set `OPENAI_API_KEY` in `.env` (can be at repository root)

### Deploy

(replace with your username/container registry)

1. `docker build --platform linux/amd64 --tag ghcr.io/nathanhleung/outofpocket/ingest:latest .`
1. `docker push ghcr.io/nathanhleung/outofpocket/ingest:latest`
1. Set image id in Runpod, set `OPENAI_API_KEY` environment variable in Runpod

## `pdfs`

code for converting pdfs to images, writing text to pdfs, sending pdfs to openai

### Getting Started

1. `pip install -r requirements.txt`
1. Set `OPENAI_API_KEY` in `.env` (can be at repository root)

## `frontend`

frontend
