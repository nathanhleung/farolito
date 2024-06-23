from dotenv import load_dotenv
from openai import OpenAI
import textwrap
from openai import OpenAI
import json
import pdf_to_pngs
from fill_field_on_pdf_page import fill_field_on_pdf_page

load_dotenv()
client = OpenAI()

system_prompt = textwrap.dedent("""
    You are an assistant to a social worker. Your job is to help users fill out benefit applications. Users will give you the benefit application one page at a time, and you will output JSON. Example outputs are given, and parts wrapped with double curly braces `{{like this}}` should be interpreted as templates for you to fill in.

    For each page, you should first determine if the page requires any information. If the page requires no information, output the following JSON string: `{ "action": "skip", "reason": "{{reason why you think this page has no information}}" }`.
                              
    If the page does require some information, the page may contain multiple form fields that needs to be filled in. For each form field, starting from the top left of the page and moving left-to-right, you need to determine whether the user needs to fill in the field. If the field appears to be optional or potentially not relevant, ask the user for more information to determine whether the form field needs to be filled. To ask the user for clarification, output a JSON string of the form `{ "action": "question", "question": "{{insert your question here}}", "reason": "{{reason why you need to ask the question}}" }`. You may re-prompt the user in the same format until you make a determination.
                              
    If you determine that the user needs to fill out the form field, you should ask the user for the information. Ask for only one piece of data at a time. To do this, output a string of the form `{ "action": "input", "input": "{{insert a description the data needed for this form field here}}" }`. 
                                
    Remember the data that the user has given you so far. If you reach the end of a page, output a string of the form `{ "action": "next", "data": "{{ a JSON object containing the data collected for the form so far }}", "reason": "We've reached the end of page {{current page number}}. Onto the next page." }`.
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

    # await user response for consistency with other yields
    user_response = yield {
        "action": "system_prompt",
        "system_prompt": system_prompt
    }
    user_response = ""
    while True:
        if user_response:
            messages.append({
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": user_response
                }],
            })
            user_response = ""

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="gpt-4o",
            response_format={"type":"json_object"}
        )
        parsed_response = json.loads(chat_completion.choices[0].message.content)
        if parsed_response["action"] == "skip" or parsed_response["action"] == "next":
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
            yield parsed_response
        else:
            user_response = yield parsed_response

        # fill_field_on_pdf_page("../assets/hawaii_medicaid.pdf", 2, 'first name', 'nikhil')