"use client";

import { AppContext } from "@/app/context/AppProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { groupBy } from "lodash";
import { useRouter } from "next/navigation";
import logo from "../logo.png";
import Image from "next/image";
import { FormEvent, useContext, useEffect, useState } from "react";
import Link from "next/link";

export default function Fill() {
  const { toast } = useToast();
  const { replace } = useRouter();

  const { allFields, fileToken } = useContext(AppContext);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (Object.keys(allFields).length === 0) {
      replace("/");
    }
    console.log(allFields);
  }, [allFields, replace]);

  const [uploadingDriversLicense, setUploadingDriversLicense] = useState(false);
  const [driversLicenseFile, setDriversLicenseFile] = useState<File | null>(
    null
  );
  async function handleDriversLicenseFileUpload(e: FormEvent) {
    e.preventDefault();
    if (driversLicenseFile) {
      setUploadingDriversLicense(true);
      console.log(driversLicenseFile);

      const formData = new FormData();
      formData.append("file", driversLicenseFile);
      try {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_INGEST_API_ENDPOINT}/upload-drivers/`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await result.json();
        console.log(data);

        // Autofill data
        for (const key of Object.keys(data)) {
          const maybeId = key.toLowerCase().replace(" ", "");
          const maybeInput = document.getElementById(maybeId);
          if (maybeInput && maybeInput instanceof HTMLInputElement) {
            maybeInput.value = data[key];
          }
        }
        toast({
          title: "Autofilled",
          description: "Successfully autofilled from driver's license.",
        });
      } finally {
        setUploadingDriversLicense(false);
      }
    }
  }

  const [uploadingPaystub, setUploadingPaystub] = useState(false);
  const [paystubFile, setPaystubFile] = useState<File | null>(null);
  async function handlePaystubFileUpload(e: FormEvent) {
    e.preventDefault();
    if (paystubFile) {
      setUploadingPaystub(true);

      const formData = new FormData();
      formData.append("file", paystubFile);
      try {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_INGEST_API_ENDPOINT}/upload-paystub/`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await result.json();
        console.log(data);

        // Autofill data
        for (const key of Object.keys(data)) {
          const maybeId = key.toLowerCase().replace(" ", "");
          const maybeInput = document.getElementById(maybeId);
          if (maybeInput && maybeInput instanceof HTMLInputElement) {
            maybeInput.value = data[key];
          }
        }
        toast({
          title: "Autofilled",
          description: "Successfully autofilled from paystub.",
        });
      } finally {
        setUploadingPaystub(false);
      }
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (!form) {
      return;
    }
    const formData = new FormData(form);
    const formDataObject = Object.fromEntries(formData);
    const inputNamesByPageNum = groupBy(
      Object.keys(formDataObject),
      (inputName) => {
        const [pageNum] = inputName.split("__");
        return pageNum;
      }
    );

    for (const pageNum of Object.keys(inputNamesByPageNum)) {
      const dataForPage: { [inputName: string]: string } = {};
      for (const inputName of inputNamesByPageNum[pageNum]) {
        const [, cleanedInputName] = inputName.split("__");
        const maybeId = cleanedInputName.toLowerCase().replace(" ", "");
        const maybeElement = document.getElementById(maybeId);
        if (maybeElement && maybeElement instanceof HTMLInputElement) {
          const value = maybeElement.value;
          dataForPage[cleanedInputName] = value;
        }
      }

      const formDataForPage = new FormData();
      formDataForPage.append("page_index", pageNum.toString());
      formDataForPage.append("file_token", fileToken.toString());
      formDataForPage.append("data", JSON.stringify(dataForPage));

      console.log(formDataForPage);
      setGenerating(true);
      toast({
        title: "Generating filled pdf...",
        description: "Please be patient, this may take up to two minutes...",
      });

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PDFS_API_ENDPOINT}/fill-fields`,
          {
            method: "POST",
            body: formDataForPage,
          }
        );

        toast({
          title: "Generated filled pdf!",
          description:
            "Successfully generated filled pdf! You may need to disable your pop-up viewer to see it.",
        });

        const json = await response.json();
        const img_base64 = json.image;
        window.open(`data:image/png;base64,${img_base64}`);
      } finally {
        setGenerating(false);
      }
      // Just generate one image for now
      break;
    }
  }

  return (
    <main className="flex min-h-screen p-12 pt-24 flex-col items-center justify-center max-w-5xl mx-auto">
      <div className="flex flex-col text-center pb-12 gap-4 max-w-3xl">
        <Image src={logo} alt="Lighthouse AI Logo" />
        <p>
          Upload your state government&apos;s Medicaid application form and
          we&apos;ll help you fill it 2x faster out with information you already
          have.
        </p>
      </div>
      <div className="p-6 bg-slate-100 rounded-lg border-2 border-[var(--foreground-rgb)]">
        <div className="flex flex-col items-start gap-4 pb-4">
          <h2 className="font-bold text-lg">Time to fill your forms!</h2>

          <div className="flex mb-6 gap-12">
            <form
              className="flex gap-2 flex-col items-start"
              onSubmit={handleDriversLicenseFileUpload}
            >
              <Label>Autofill from Driver&apos;s License</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setDriversLicenseFile(e.target.files && e.target.files[0])
                }
                accept=".png, .jpg, .jpeg"
              />
              <Button disabled={!driversLicenseFile || uploadingDriversLicense}>
                {uploadingDriversLicense ? "Uploading..." : "Upload"}
              </Button>
              <Button size="sm" asChild>
                <Link href="hawaii_dl.png" download target="_blank">
                  Download Sample Driver's License
                </Link>
              </Button>
            </form>
            <form
              className="flex gap-2 flex-col items-start"
              onSubmit={handlePaystubFileUpload}
            >
              <Label>Autofill from Paystub</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setPaystubFile(e.target.files && e.target.files[0])
                }
                accept=".pdf"
              />
              <Button disabled={!paystubFile || uploadingPaystub}>
                {uploadingPaystub ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {Object.keys(allFields).map((pageIndex) => {
              return (
                <div key={pageIndex}>
                  <h2 className=" font-bold text-md mb-3">
                    From Page {parseInt(pageIndex, 10) + 1}
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {allFields[pageIndex].map((field) => (
                      <div key={field}>
                        <Label className="text-sm mb-1">{field}</Label>
                        <Input
                          name={`${pageIndex}__${field}`}
                          id={field.toLowerCase().replace(" ", "")}
                          type="text"
                          placeholder={field}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <Button
              size="lg"
              className="self-start"
              type="submit"
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate PDF"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
