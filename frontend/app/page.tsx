"use client";

import { AppContext } from "@/app/context/AppProvider";
import { Button } from "@/components/ui/button";
import { useCallback, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import { MoveRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const { pageImages, setPageImages, setFileToken } = useContext(AppContext);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const formData = new FormData();
      for (const file of acceptedFiles) {
        formData.append("file", file);
      }

      try {
        setUploading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PDFS_API_ENDPOINT}/get-pdf-images`,
          {
            method: "POST",
            body: formData,
          }
        );
        const json = await response.json();
        setPageImages(json.page_images);
        setFileToken(json.file_token);
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
    <main className="flex min-h-screen p-12 pt-24 flex-col items-center justify-center max-w-3xl mx-auto">
      <div className="flex flex-col text-center pb-12 gap-4">
        <h1 className="text-5xl font-bold">FreeFillableForms.ai</h1>
        <p>
          Upload your state government&apos;s Medicaid application form and
          we&apos;ll help you fill it 2x faster out with information you already
          have.
        </p>
      </div>
      {pageImages.length > 0 ? (
        <div className="p-6 bg-slate-100 rounded-lg border-2 border-[var(--foreground-rgb)]">
          <div className="flex justify-between items-center mb-6">
            <p>Cool! We found {pageImages.length} pages in this application.</p>
            <Button asChild>
              <Link href="/application">
                Let's Apply&nbsp;&nbsp;
                <MoveRight />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {pageImages.map((pageImage, index) => (
              <img key={index} src={`data:image/png;base64,${pageImage}`} />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center border-[var(--foreground-rgb)] border-2 rounded-lg border-dashed p-6 w-[50%] h-36 mx-auto text-center bg-slate-100"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <p>Uploading...</p>
          ) : isDragActive ? (
            <p>Drop the application PDF here ...</p>
          ) : (
            <p>
              Drop an application PDF here, or click to select a file from your
              computer
            </p>
          )}
        </div>
      )}
    </main>
  );
}
