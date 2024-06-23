import aiofiles
from fastapi import FastAPI, WebSocket, File, UploadFile
from fastapi.responses import JSONResponse, Response
from dotenv import load_dotenv
from pdf_to_pngs import pdf_bytes_to_pngs_base64
from uuid import uuid4

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
async def fill_fields(html_response: HTMLResponse):
    page_number = html_response.page - 1
    fill_data = html_response.data

    # Need to change file_path
    file_path = "assets/hawaii_medicaid.pdf"

    ocr_results = _get_pdf_page_ocr_results(file_path, page_number)
    ocr_field_names = [field[1] for field in ocr_results]
    
    field_values = {}
    
    soft_mapping = get_soft_mappings(fill_data, ocr_field_names)

    for html_field in soft_mapping.keys():
        ocr_field_name = soft_mapping[html_field]
        print(f"OCR Field: {ocr_field_name}, HTML Field: {html_field}")

        if ocr_field_name != "None":
            field_values[ocr_field_name] = fill_data[html_field]

    image_bytes = fill_fields_on_pdf_page(file_path, page_number, field_values)
    return Response(content=image_bytes, media_type="image/png")