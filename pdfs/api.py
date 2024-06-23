import aiofiles
from fastapi import FastAPI, WebSocket, File, UploadFile
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pdf_to_pngs import pdf_bytes_to_pngs_base64
from uuid import uuid4

from run_assistant import run_assistant

load_dotenv()

app = FastAPI()

@app.get("/")
def root():
    return {"message": "PDF API"}

@app.post("/get-pdf-images")
async def get_pdf_pngs_base64(file: UploadFile = File(...)):
    contents = await file.read()
    file_token = str(uuid4())
    page_images_base64 = pdf_bytes_to_pngs_base64(contents)
    async with aiofiles.open("user_data/" + file_token + ".pdf", 'wb') as out_file:
        await out_file.write(contents)
    return {
        "file_token": file_token,
        "page_images": page_images_base64
    }

@app.websocket("/assistant")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        if data["file_token"] != '':
            file_token = data["file_token"]
            await websocket.send_text(f"{data}")
            async for data in run_assistant("user_data/" + file_token + ".pdf"):
                await websocket.send_text(f"{data}")