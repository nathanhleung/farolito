from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pdf_to_pngs import pdf_bytes_to_pngs_base64

load_dotenv()

app = FastAPI()

@app.get("/")
def root():
    return {"message": "PDF API"}

@app.post("/get-pdf-images")
async def get_pdf_pngs_base64(file: UploadFile = File(...)):
    contents = await file.read()
    page_images_base64 = pdf_bytes_to_pngs_base64(contents)

    print(page_images_base64)

    return {
        "page_images": page_images_base64
    }