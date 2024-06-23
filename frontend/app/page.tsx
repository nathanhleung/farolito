"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type Field = {
  name: string;
  type: string;
  options?: string[];
};

export default function Home() {
  const [formFields, setFormFields] = useState<Field[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const formData = new FormData();
      for (const file of acceptedFiles) {
        formData.append("files[]", file);
      }

      try {
        setUploading(true);
        const response = await fetch("/api/get-form-fields", {
          method: "POST",
          body: formData,
        });
        const json = await response.json();
        setFormFields(json.allFields);
      } finally {
        setUploading(false);
      }
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center pb-4">
        <h1 className="text-xl">Form Filler</h1>
        <p>Upload PDF forms to fill out</p>
      </div>
      <div
        className="border-black border-2 rounded-lg border-dashed p-6"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drop a file here, or click to select</p>
        )}
      </div>
      {formFields.map((field) => (
        <div key={field.name}>
          <label>{field.name}</label>
          <input key={field.name} type={field.type} />
        </div>
      ))}
      <pre className="whitespace-normal">{JSON.stringify(formFields)}</pre>
    </main>
  );
}
