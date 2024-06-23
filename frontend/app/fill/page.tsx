"use client";

import { AppContext } from "@/app/context/AppProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useContext, useEffect, useState } from "react";

export default function Fill() {
  const { toast } = useToast();
  const { replace } = useRouter();

  const { allFields, setAllFields } = useContext(AppContext);

  // for testing
  useEffect(() => {
    setAllFields({
      "2": [
        "First name",
        "Middle name",
        "Last name",
        "Suffix",
        "Home address",
        "Apartment or suite number",
        "City",
        "State",
        "ZIP code",
        "County",
        "Mailing address (if different from home address)",
        "Apartment or suite number (mailing address)",
        "City (mailing address)",
        "State (mailing address)",
        "ZIP code (mailing address)",
        "County (mailing address)",
        "Home phone number",
        "Cell phone number",
        "Other phone number",
        "Email Address",
        "Preferred method of contact",
        "Preferred spoken language (if not English)",
        "Preferred written language (if not English)",
        "Number of family members living with you",
        "Is any family member incarcerated or residing in Hawaii State Hospital?",
        "Name of incarcerated family member",
        "Start Date of Incarceration",
        "End Date of Incarceration",
      ],
      "4": [
        "First name",
        "Middle name",
        "Last name",
        "Suffix",
        "Relationship to PERSON 1",
        "Date of birth (mm/dd/yyyy)",
        "Gender (Optional)",
        "Social Security Number (SSN)",
        "Name of spouse if married",
        "Do you plan to file a federal income tax return NEXT YEAR?",
        "Will you file jointly with a spouse?",
        "Will you claim any tax dependents on your tax return?",
        "Will you be claimed as a tax dependent on someone’s tax return?",
        "Are you pregnant?",
        "How many babies are expected during this pregnancy?",
        "Are you applying for medical assistance?",
        "If applying for insurance are you a resident of Hawaii?",
        "Does this person have a spouse or parent that lives outside the household?",
        "Were you ever in an accident? If so, are you still incurring medical expenses because of it?",
        "Do you have a disability that will last more than twelve (12) months?",
        "Do you currently receive long-term care nursing services?",
        "Have you received long-term care nursing services in the last three (3) months?",
        "Do you think you need long-term care nursing services now?",
        "Do you receive Supplemental Security Income (SSI)?",
        "Did you receive any medical services in the past three (3) months immediately prior to the date of this application?",
        "Are you a U.S. citizen or U.S. national?",
        "If you are not a U.S. citizen or U.S. national, do you have eligible immigration status?",
        "Immigration document type (i.e. I-551, Visa, etc.)",
        "Status type (optional)",
        "Name as it appears on your immigration document",
        "Alien or I-94 Number",
        "Passport number or other card number",
        "SEVIS ID or Expiration Date (optional)",
        "Other (category code or country of issuance)",
        "Provide the date of entry to the U.S. found on your immigration document listed in question 15. (mm/dd/yyyy)",
        "Are you a citizen of the Federated States of Micronesia, Republic of the Marshall Islands, or Republic of Palau?",
        "Are you, your spouse or parent, a veteran, or an active-duty member of the U.S. military?",
        "Were you in Foster Care, or receiving Kinship or State Adoption assistance and receiving Medicaid when you turned 18 or older?",
        "If Hispanic/Latino, ethnicity (OPTIONAL: mark all that apply)",
        "Race (OPTIONAL: mark all that apply)",
      ],
      "5": [
        "Employment Status",
        "Changed Jobs",
        "Stopped Working",
        "Started Working Fewer Hours",
        "Employer's Name and Address",
        "Employer Phone Number",
        "Wages/Tips (Before Taxes)",
        "Pay Frequency",
        "Average Hours Worked Each Week",
        "Employer's Name and Address (Additional Job)",
        "Employer Phone Number (Additional Job)",
        "Wages/Tips (Before Taxes) (Additional Job)",
        "Pay Frequency (Additional Job)",
        "Average Hours Worked Each Week (Additional Job)",
        "Type of Work (Self-employment)",
        "Gross Income from Self-employment this Month",
        "Unemployment",
        "Pensions",
        "Social Security",
        "Retirement Accounts",
        "Alimony Received",
        "Net Farming/Fishing",
        "Net Rental/Royalty",
        "Educational Grant/Work Study",
        "Other Type of Income",
        "Other Income Amount",
        "Alimony Paid",
        "Type of Deductions",
        "Student Loan Interest",
        "Net Yearly Income (This Year)",
        "Net Yearly Income (Next Year, if different)",
      ],
    });
  }, []);

  // useEffect(() => {
  //   if (Object.keys(allFields).length === 0) {
  //     replace("/");
  //   }
  //   console.log(allFields);
  // }, [allFields, replace]);

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

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(formData);
  }

  return (
    <main className="flex min-h-screen p-12 pt-24 flex-col items-center justify-center max-w-5xl mx-auto">
      <div className="flex flex-col text-center pb-12 gap-4 max-w-3xl">
        <h1 className="text-5xl font-bold">FreeFillableForms.ai</h1>
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
              <Label>Autofill from Driver's License</Label>
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
            <Button size="lg" className="self-start" type="submit">
              Generate PDF
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
