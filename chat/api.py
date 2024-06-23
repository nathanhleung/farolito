from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pdf2image import convert_from_bytes
from openai import OpenAI
import base64
from io import BytesIO
import json
from PIL import Image
from dotenv import load_dotenv
import os

load_dotenv()

paystub_form_fields = "First name, last name, employer name, employer address, pay period (options: hourly, weekly, every two weeks, monthly), pay"
dl_form_fields = "First name, last name, home address, apt or suite number (optional), date of birth"

api_key = os.environ["OPEN_API_KEY"]
client = OpenAI(api_key=api_key)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.post("/upload-drivers/")
async def upload_drivers(file: UploadFile = File(...)):
    image = Image.open(file.file)
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    messages = [{"role": "user", 
        "content": [{
            "type": "text",
            "text": f"Identify the values for these fields in the image: {dl_form_fields}:? Format your response similar to the example {{\"First name\": \"Albert\"}} and make sure the response is valid JSON."
        },
        {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{img_str}"}
        }]
    }]

    response = client.chat.completions.create(
        model =  "gpt-4o",
        messages = messages,
        max_tokens = 300
    )

    response_json = response.choices[0].message.content
    response_json = response_json.replace("```", "")
    response_json = response_json.replace("json", "")

    data_dict = json.loads(response_json)

    return JSONResponse(content=data_dict)

@app.post("/upload-paystub/")
async def upload_paystub(file: UploadFile = File(...)):
    contents = await file.read()
    image = convert_from_bytes(contents)[0]
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    messages = [{"role": "user", 
        "content": [{
            "type": "text",
            "text": f"Identify the values for these fields in the image: {paystub_form_fields}:? Format your response similar to the example {{\"First name\": \"Albert\"}} and make sure the response is valid JSON."
        },
        {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{img_str}"}
        }]
    }]

    response = client.chat.completions.create(
        model =  "gpt-4o",
        messages = messages,
        max_tokens = 300
    )

    response_json = response.choices[0].message.content
    response_json = response_json.replace("```", "")
    response_json = response_json.replace("json", "")

    data_dict = json.loads(response_json)

    return JSONResponse(content=data_dict)