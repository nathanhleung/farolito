import functools
import easyocr
import pdf_to_pngs
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
import io

reader = easyocr.Reader(['en'])

"""
Runs EasyOCR on the `page` of the given pdf
"""
@functools.cache
def _get_pdf_page_ocr_results(path_to_pdf: str, page: int):
    page_images_bytes = pdf_to_pngs.pdf_to_pngs_bytes(path_to_pdf)
    ocr_results = reader.readtext(page_images_bytes[page].getvalue())
    return ocr_results

"""
Get the bounding box around field label from the
EasyOCR results
"""
def _get_field_label_bounding_box(field_name: str, ocr_results):

    field = next((result for result in ocr_results if field_name in result[1]), None)
    if field is None:
        return None
    return field[0]

"""
Gets a reasonable font size to use to fill out the form
based on the bounding box of the label
"""
def _get_reasonable_field_font_size(field_name: str, ocr_results):
    default_font_size = 30

    bounding_box = _get_field_label_bounding_box(field_name, ocr_results)
    if bounding_box is None:
        return default_font_size
    
    top_left_coordinates = bounding_box[0]
    bottom_left_coordinates = bounding_box[3]
    top_left_y_coordinate = top_left_coordinates[1]
    bottom_left_y_coordinate = bottom_left_coordinates[1]
    return max(bottom_left_y_coordinate - top_left_y_coordinate, default_font_size)

"""
Writes the `value` for the given `field_name` on page `page`
of the pdf.
"""
def fill_fields_on_pdf_page(path_to_pdf: str, page: int, field_values_to_fill: dict):
    page_images_bytes = pdf_to_pngs.pdf_to_pngs_bytes(path_to_pdf)
    ocr_results = _get_pdf_page_ocr_results(path_to_pdf, page)
    
    img = Image.open(page_images_bytes[page])
    draw = ImageDraw.Draw(img)

    for key in field_values_to_fill.keys():
        field_name = key
        value = field_values_to_fill[key]

        if value == "None":
            continue

        open_sans_font = ImageFont.truetype(
            '../assets/OpenSans.ttf',
            _get_reasonable_field_font_size(field_name, ocr_results)
        )
        bounding_box = _get_field_label_bounding_box(field_name, ocr_results)
        # If we can't find the field, just skip
        if bounding_box is None:
            continue

        # Put the field value to the right of the label
        top_left_coordinates = bounding_box[0]
        top_left_coordinates[0] += 50
        top_left_coordinates[1] += 30
        draw.text(
            top_left_coordinates, value,
            font=open_sans_font,
            fill=(0, 0, 255)
        )

    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    img.show()
    return img_byte_arr