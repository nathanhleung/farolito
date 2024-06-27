"use client";

import { AppContext } from "@/app/context/AppProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import logo from "./logo.png";

export default function Home() {
  const { toast } = useToast();
  const [runningWithSample, setRunningWithSample] = useState(false);
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
        toast({
          title: "Uploading and processing your file...",
          description: "Please be patient, this may take up to a minute...",
        });
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
        toast({
          title: "Uploaded",
          description: "Successfully uploaded your file",
        });
      } finally {
        setUploading(false);
      }
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const onClickRunWithSample = async () => {
    setRunningWithSample(true);
    toast({
      title: "Running with sample file...",
      description: "Please be patient, this may take up to a minute...",
    });
    const formData = new FormData();
    formData.append("use_sample", "True");
    try {
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
      toast({
        title: "Success!",
        description: "Successfully processed sample!",
      });
    } finally {
      setRunningWithSample(false);
    }
  };

  return (
    <main className="flex min-h-screen p-12 pt-24 flex-col items-center justify-center max-w-3xl mx-auto">
      <div className="flex flex-col text-center pb-12 gap-4">
        <Image src={logo} alt="Lighthouse AI Logo" />
        <p>
          Upload your state government&apos;s Medicaid application form and
          we&apos;ll help you fill it 2x faster out with information you already
          have.
        </p>
        <Dialog defaultOpen={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-2">Disclaimer</DialogTitle>
              <DialogDescription>
                <div className="flex flex-col gap-4">
                  <p>
                    This project was created for the{" "}
                    <Link
                      className="text-black hover:opacity-50 underline"
                      href="https://www.outofpocket.health/"
                      target="_blank"
                    >
                      Out of Pocket
                    </Link>{" "}
                    <Link
                      className="text-black hover:opacity-50 underline"
                      href="https://www.outofpocket.health/ai-hackathon"
                      target="_blank"
                    >
                      AI Hackathon
                    </Link>{" "}
                    which took place in June 2024 in San Francisco.
                  </p>
                  <p>
                    As a hackathon project, it is probably broken in many ways!{" "}
                    <b className="text-black">
                      Try refreshing and starting over if something is not
                      working.
                    </b>{" "}
                    Feel free to submit issues on{" "}
                    <Link
                      className="text-black hover:opacity-50 underline"
                      href="https://github.com/nathanhleung/lighthouse/issues"
                    >
                      GitHub
                    </Link>{" "}
                    as well.
                  </p>
                  <p>
                    THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY
                    KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
                    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                    PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
                    OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
                    OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
                    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {pageImages.length > 0 ? (
        <div className="p-6 bg-slate-100 rounded-lg border-2 border-[var(--foreground-rgb)]">
          <div className="flex justify-between items-center mb-6">
            <p>Cool! We found {pageImages.length} pages in this application.</p>
            <Button asChild>
              <Link href="/application">
                Let&apos;s Apply&nbsp;&nbsp;
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
        <div className="flex flex-col gap-2 items-center">
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
                Drop an application PDF here, or click to select a file from
                your computer
              </p>
            )}
          </div>
          <div className="flex flex-col pt-8">
            <Button onClick={onClickRunWithSample} disabled={runningWithSample}>
              {runningWithSample
                ? "Running..."
                : "Run With Sample Application PDF"}
            </Button>
            <Button variant="link" asChild>
              <Link href="hawaii_medicaid.pdf" download target="_blank">
                <small>Download Sample Application PDF</small>
              </Link>
            </Button>
          </div>
        </div>
      )}
      <div className="flex gap-12 text-center pt-8 items-center justify-center">
        <Link
          className="text-black hover:opacity-50 underline"
          href="https://github.com/nathanhleung/lighthouse"
          target="_blank"
        >
          GitHub
        </Link>
        <Link
          className="text-black hover:opacity-50 underline"
          href="https://www.outofpocket.health/ai-hackathon"
          target="_blank"
        >
          Out of Pocket AI Hackathon
        </Link>
      </div>
    </main>
  );
}
