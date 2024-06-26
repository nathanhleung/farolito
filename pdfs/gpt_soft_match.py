from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()
client = OpenAI()

def get_soft_mappings(html_field_values, ocr_field_names):

    messages = []

    messages.append({
        "role": "user",
        "content": f"You are given this data: {html_field_values}. Match each of those data fields to one of these form fields: {ocr_field_names}. If there are no closely matched fields, output \"None\" as the matched form field name. Output results in the form of a JSON string."
    })

    print(messages)

    response = client.chat.completions.create(
        model = "gpt-4o",
        messages = messages,
        response_format={"type":"json_object"},
        temperature = 0.2
    )
    print(response)
    parsed_response = json.loads(response.choices[0].message.content)
    return parsed_response