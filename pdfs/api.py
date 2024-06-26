import base64
import json
from typing import Optional
import aiofiles
from fastapi import FastAPI, Form, WebSocket, File, UploadFile
from fastapi.responses import JSONResponse, Response
from dotenv import load_dotenv
from pdf_to_pngs import pdf_bytes_to_pngs_base64
from uuid import uuid4
import pathlib
import asyncio

from fill_field_on_pdf_page import fill_fields_on_pdf_page, _get_pdf_page_ocr_results
from gpt_soft_match import get_soft_mappings
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from run_assistant import run_assistant

load_dotenv()

app = FastAPI()

@app.get("/")
def root():
    return {"message": "PDF API"}

@app.post("/get-pdf-images")
async def get_pdf_pngs_base64(file: Optional[UploadFile] = None, use_sample: bool = Form(False)):
    file_token = 'sample'
    contents = pathlib.Path("user_data/sample.pdf").read_bytes()

    print(use_sample)

    if not use_sample:
        if not file:
            return {"message": "No upload file sent"}
        file_token = str(uuid4())
        contents = await file.read()

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
    try:
        data = await websocket.receive_json()
        if data["file_token"] != '':
            file_token = data["file_token"]
            print("Running assistant on file " + file_token + ".pdf")
            loop = asyncio.get_running_loop()
            assistant_generator = run_assistant("user_data/" + file_token + ".pdf")

            while True:
                data = await loop.run_in_executor(None, lambda: next(assistant_generator, None))
                if data is None:
                    break
                await websocket.send_json(data)
    except Exception as e:
        print(e)

class HTMLResponse(BaseModel):
    page : int
    data : dict

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/fill-fields")
async def fill_fields(page_index: str = Form(), file_token: str = Form(), data: str = Form()):
    print("Filling fields...")
    page_index = int(page_index)
    fill_data = json.loads(data)

    file_path = "user_data/" + file_token + ".pdf"

    print("Running OCR...")
    ocr_results = _get_pdf_page_ocr_results(file_path, page_index)
    ocr_field_names = [field[1] for field in ocr_results]
    
    field_values = {}
    
    soft_mapping = get_soft_mappings(fill_data, ocr_field_names)

    for html_field in soft_mapping.keys():
        ocr_field_name = soft_mapping[html_field]
        print(f"OCR Field: {ocr_field_name}, HTML Field: {html_field}")

        if ocr_field_name != "None":
            field_values[ocr_field_name] = fill_data[html_field]

    print(field_values)

    print("Generating image...")
    image_bytes = fill_fields_on_pdf_page(file_path, page_index, field_values)
    img_base64 = base64.b64encode(image_bytes).decode("utf-8")
    return JSONResponse(content={
        'image':img_base64
    })
