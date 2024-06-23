import functools
from pdf2image import convert_from_path
import base64
from io import BytesIO

"""
Converts the given pdf into png, then returns the result
as an array of bytes (each element of the array corresponds
to an image of one of the pages)
"""
@functools.cache
def pdf_to_pngs_bytes(path_to_pdf: str):
    page_images = convert_from_path(path_to_pdf)
    page_images_bytes = []
    for page_image in page_images:
        page_image_bytes = BytesIO()
        page_image.save(page_image_bytes, format='PNG')
        page_images_bytes.append(page_image_bytes)
    return page_images_bytes

"""
Converts the given pdf into png, then returns the result
as an array of base64-encoded strings (each element of the
array corresponds to an image of one of the pages)
"""
@functools.cache
def pdf_to_pngs_base64(path: str):
    page_images_bytes = pdf_to_pngs_bytes(path)
    page_images_base64 = [
        base64
        .b64encode(page_image_bytes.getvalue())
        .decode("utf-8") for page_image_bytes in page_images_bytes
    ]
    return page_images_base64