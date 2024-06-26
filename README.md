<img src="./frontend/app/logo.png" alt="Lighthouse AI logo">
<br/>
<br/>

# Lighthouse AI

Guiding the way to government benefits. A project for the [Out of Pocket](https://www.outofpocket.health/) [AI Hackathon](https://www.outofpocket.health/ai-hackathon), June 2024 in San Francisco.

## Slides/Prototypes

[PDF Slides/Prototypes](./slides/slides.pdf)

<table>
    <tr>
        <td>
            <img src="./assets/slides/slide1.png">
        </td>
        <td>
            <img src="./assets/slides/slide2.png">
        </td>
        <td>
            <img src="./assets/slides/slide3.png">
        </td>
    </tr>
    <tr>
        <td>
            <img src="./assets/slides/slide4.png">
        </td>
        <td>
            <img src="./assets/slides/slide5.png">
        </td>
        <td>
            <img src="./assets/slides/slide6.png">
        </td>
    </tr>
    <tr>
        <td>
            <img src="./assets/slides/slide7.png">
        </td>
        <td>
            <img src="./assets/slides/slide8.png">
        </td>
        <td>
            <img src="./assets/slides/slide9.png">
        </td>
    </tr>
    <tr>
        <td>
            <img src="./assets/slides/slide10.png">
        </td>
        <td>
            <img src="./assets/slides/slide11.png">
        </td>
    </tr>
</table>

## Team

- [Albert Cai](https://www.linkedin.com/in/albert-cai-b1a2b7161)
- [Irene Jiang](https://www.linkedin.com/in/irene-jiang/)
- [Nathan Leung](https://natecation.com)

## Limitations

- slow
- demo only runs on max first 6 pages of pdf
- pdf is flaky

# Repository Structure

## `assets`

Static assets (pdfs, fonts, etc.)

## `pdfs`

code for converting pdfs to images, writing text to pdfs, sending pdfs to openai

### Getting Started

1. `pip install -r requirements.txt`
1. Set `OPENAI_API_KEY` in `.env` (can be at repository root)

### Deploy

(replace with your username/container registry)

1. `docker build --platform linux/amd64 --tag ghcr.io/nathanhleung/lighthouse/pdfs:latest .` (in `pdfs` directory)
1. `docker push ghcr.io/nathanhleung/lighthouse/pdfs:latest`
1. Set image id in Runpod, set `OPENAI_API_KEY` environment variable in Runpod

## `ingest`

FastAPI endpoints to read DL and paystub info

### Getting Started

1. `pip install -r requirements.txt`
1. Set `OPENAI_API_KEY` in `.env` (can be at repository root)

### Deploy

(replace with your username/container registry)

1. `docker build --platform linux/amd64 --tag ghcr.io/nathanhleung/lighthouse/ingest:latest .` (in `ingest` directory)
1. `docker push ghcr.io/nathanhleung/lighthouse/ingest:latest`
1. Set image id in Runpod, set `OPENAI_API_KEY` environment variable in Runpod

## `frontend`

frontend for the app

1. `npm install`
1. Set `NEXT_PUBLIC_INGEST_API_ENDPOINT` in `.env.local` (in `frontend` directory) — based on the pod ID and exposed port (probably `8000`) from Runpod, include protocol, no trailing slash
1. Set `NEXT_PUBLIC_PDFS_API_ENDPOINT` in `.env.local`, include protocol, no trailing slash
1. `npm run dev`

### Deploy

1. Set `NEXT_PUBLIC_INGEST_API_ENDPOINT`, `NEXT_PUBLIC_PDFS_API_ENDPOINT`, `NEXT_PUBLIC_ASSISTANT_WEBSOCKET_ENDPOINT` in Vercel
1. `git push`

## `test`

Files used for testing
