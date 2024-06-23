from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()
client = OpenAI()

def get_soft_mappings(html_field_names, ocr_field_names):
    html_field_names = {
        "First name": "SHARON",
        "Last name": "BOLL",
        "Home address": "P O BOX 1576",
        "Apt or suite number": "",
        "Date of birth": "01/27/1971"
    }
    print(html_field_names)