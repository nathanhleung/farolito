from dotenv import load_dotenv
from openai import OpenAI
import json
from fill_field_on_pdf_page import fill_fields_on_pdf_page, _get_pdf_page_ocr_results

load_dotenv()
client = OpenAI()

def get_soft_mappings(html_field_values, ocr_field_names):

    messages = []

    messages.append({
        "role": "user",
        "content": f"You are given this data: {html_field_values}. Match each of those data fields to one of these form fields: {ocr_field_names}. If there are no closely matched fields, output \"None\" as the matched form field name. Output results in the form of a JSON string."
    })

    response = client.chat.completions.create(
        model = "gpt-4o",
        messages = messages,
        response_format={"type":"json_object"},
        temperature = 0.2
    )
    print(response)
    parsed_response = json.loads(response.choices[0].message.content)
    return parsed_response

html_response = {
    "page": 5,
    "data": {
        "First name": "Sharon",
        "Last name": "Boll",
        "Employer name and address": "LITTLE CAESAR'S, 2424 S Beretania St, Honolulu, HI, 96826, United States",
        "Pay period": "every two weeks",
        "Pay": "$678.85"
    }
}

ocr_results = _get_pdf_page_ocr_results("assets/hawaii_medicaid.pdf", 5)
ocr_field_names = [field[1] for field in ocr_results]

field_values = {}

soft_mapping = get_soft_mappings(html_response["data"], ocr_field_names)

for html_field in soft_mapping.keys():
    ocr_field_name = soft_mapping[html_field]
    print(f"OCR Field: {ocr_field_name}, HTML Field: {html_field}")

    if ocr_field_name != "None":
        field_values[ocr_field_name] = html_response['data'][html_field]

fill_fields_on_pdf_page("assets/hawaii_medicaid.pdf", html_response["page"], field_values)