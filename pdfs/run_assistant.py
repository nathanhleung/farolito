from dotenv import load_dotenv
from openai import OpenAI
import textwrap
import json
import pdf_to_pngs

load_dotenv()
client = OpenAI()

system_prompt = textwrap.dedent("""
    You are an assistant to a social worker.

    For each page, you should first determine if the page requires any information that the user should provide. If the page requires no information, output the following JSON string: `{ "action": "skip", "reason": "{{ reason why you think this page has no information that the user needs to provide. be specific and mention specific parts of the page }}" }`.
                              
    If the page does require some information that the user should provide, the page may contain multiple form fields that needs to be filled in. For each form field, starting from the top left of the page and moving left-to-right, output a human-friendly form field label.
    
    For pages that require a lot of financial information, include an upload prompt that asks the user to upload a pay stub. For pages asking for basic name and address information, include an upload prompt that asks the user to upload a picture of their driver's license. Otherwise, the upload prompt should say "None".
                                                  
    If you reach the end of a page, output a string of the form `{ "action": "fields", "fields": "{{ an array of human-friendly form field labels }}", "upload": "{{ upload prompt }}" "reason": "We found some fields needed on {{current page number}} and will collect them later." }`.

    Do not skip any fields in the form.
""")

"""
Runs the assistant on the given pdf and sends the output as
it is generated.
"""
def run_assistant(path_to_pdf: str):
    messages = [{
        "role": "system",
        "content": system_prompt,
    }]

    page_images_base64 = pdf_to_pngs.pdf_to_pngs_base64(path_to_pdf)

    current_page_index = 0
    total_pages = len(page_images_base64)
    messages.append({
        "role": "user",
        "content": [{
            "type": "text",
            "text": "Here's page 1 of my Medicaid application."
        }, {
            "type": "image_url",
            "image_url": {
                "url": "data:image/png;base64," + page_images_base64[current_page_index],
            }
        }],
    })

    yield {
        "action": "start",
        "reason": "Sending system prompt and first page..."
    }
    response = client.chat.completions.create(
        model = "gpt-4o",
        messages = messages,
        response_format={"type":"json_object"}
    )
    parsed_response = json.loads(response.choices[0].message.content)
    yield parsed_response
    print("Got response " + response.choices[0].message.content)

    current_page_index += 1
    # Stops on page 5 for demo purposes
    while current_page_index < 6:
        print("Sending more messages")
        response = client.chat.completions.create(
            model = "gpt-4o",
            messages = messages,
            response_format={"type":"json_object"}
        )

        parsed_response = json.loads(response.choices[0].message.content)
        print("Got response " + response.choices[0].message.content)

        yield parsed_response

        if parsed_response["action"] == "skip" or parsed_response["action"] == "fields":
            current_page_index += 1
            if current_page_index == total_pages:
                break

            messages.append({
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": "Here's page " + str(current_page_index + 1) + " of my Medicaid application."
                }, {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/png;base64," + page_images_base64[current_page_index],
                    }
                }],
            })