from Levenshtein import distance
from fill_field_on_pdf_page import fill_fields_on_pdf_page, _get_pdf_page_ocr_results

def find_closest_match(ocr_field_names, html_field_name):

    min_distance = float('inf')
    closest_name = None

    for given_name in ocr_field_names:
        whitelist = set('abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        ''.join(filter(whitelist.__contains__, given_name)).strip()
        dist = distance(given_name, html_field_name)
        if dist < min_distance:
            min_distance = dist
            closest_name = given_name

    # Set minimum threshold for matching field names
    if min_distance > 5:
        closest_name = "None"

    return closest_name

html_response = {
    "page": 2,
    "data": {
        "First name": "SHARON",
        "Last name": "BOLL",
        "Home address": "P O BOX 1576",
        "Apt or suite number": "",
        "City": "KAPAA",
        "State": "HI",
        "ZIP code": "96746",
        "Date of birth": "01/27/1971"
    }
}

ocr_results = _get_pdf_page_ocr_results("assets/hawaii_medicaid.pdf", 2)
ocr_field_names = [field[1] for field in ocr_results]

print(ocr_field_names)

field_values = {}
for html_field in html_response["data"].keys():
    ocr_field_name = find_closest_match(ocr_field_names, html_field)

    print(f"OCR Field: {ocr_field_name}, HTML Field: {html_field}")

    if ocr_field_name != "None":
        field_values[ocr_field_name] = html_response["data"][html_field]

fill_fields_on_pdf_page("assets/hawaii_medicaid.pdf", html_response["page"], field_values)