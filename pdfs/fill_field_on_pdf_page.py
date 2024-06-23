import functools
import easyocr
import pdf_to_pngs
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

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
    field = next(result for result in ocr_results if field_name in result[1].lower())
    return field[0]

"""
Gets a reasonable font size to use to fill out the form
based on the bounding box of the label
"""
def _get_reasonable_field_font_size(field_name: str, ocr_results):
    bounding_box = _get_field_label_bounding_box(field_name, ocr_results)
    top_left_coordinates = bounding_box[0]
    bottom_left_coordinates = bounding_box[3]
    top_left_y_coordinate = top_left_coordinates[1]
    bottom_left_y_coordinate = bottom_left_coordinates[1]
    return (bottom_left_y_coordinate - top_left_y_coordinate) * 2

"""
Writes the `value` for the given `field_name` on page `page`
of the pdf.
"""
def fill_field_on_pdf_page(path_to_pdf: str, page: int, field_name: str, value: str):
    page_images_bytes = pdf_to_pngs.pdf_to_pngs_bytes(path_to_pdf)
    ocr_results = _get_pdf_page_ocr_results(path_to_pdf, page)
    img = Image.open(page_images_bytes[page])
    draw = ImageDraw.Draw(img)
    open_sans_font = ImageFont.truetype(
        '../assets/OpenSans.ttf',
        _get_reasonable_field_font_size(field_name, ocr_results)
    )
    bounding_box = _get_field_label_bounding_box(field_name, ocr_results)
    # Put the field value to the right of the label
    top_right_coordinates = bounding_box[1]
    draw.text(
        top_right_coordinates, value,
        font=open_sans_font,
        fill=(0, 0, 255)
    )
    img.show()