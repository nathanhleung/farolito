import { NextRequest } from "next/server";
import { PDFDocument, PDFRadioGroup } from "pdf-lib";

const PDF_FIELD_TYPE_TO_HTML_INPUT_TYPE: { [key: string]: string } = {
  PDFTextField: "text",
  PDFCheckBox: "checkbox",
  PDFRadioGroup: "radio",
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const uploadedFiles: File[] = formData
    .getAll("files[]")
    .filter((file): file is File => file instanceof File);
  const pdfs = await Promise.all(
    uploadedFiles.map(async (file) => {
      const buffer = await file.arrayBuffer();
      return PDFDocument.load(buffer);
    })
  );

  const allFields = pdfs.flatMap((pdf) => {
    const fields = pdf.getForm().getFields();
    return fields.map((field) => {
      return {
        name: field.getName(),
        type:
          PDF_FIELD_TYPE_TO_HTML_INPUT_TYPE[field.constructor.name] ??
          field.constructor.name,
        ...{
          options:
            field instanceof PDFRadioGroup ? field.getOptions() : undefined,
        },
      };
    });
  });

  return Response.json({
    allFields,
    success: true,
  });
}
