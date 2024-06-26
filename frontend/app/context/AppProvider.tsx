"use client";

import { createContext, useState } from "react";

type TFields = {
  // should ideally be a number, but js object keys are always strings
  [pageIndex: string]: string[];
};

type TAppContext = {
  fileToken: string;
  setFileToken(newFileToken: string): void;
  pageImages: string[];
  setPageImages(newPageImages: string[]): void;
  allFields: TFields;
  setAllFields(newAllFields: TFields): void;
};

export const AppContext = createContext<TAppContext>({
  fileToken: "",
  setFileToken: () => {},
  pageImages: [],
  setPageImages: () => {},
  allFields: {},
  setAllFields: () => {},
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [fileToken, setFileToken] = useState("");
  const [allFields, setAllFields] = useState<TFields>({});

  return (
    <AppContext.Provider
      value={{
        pageImages,
        setPageImages,
        fileToken,
        setFileToken,
        allFields,
        setAllFields,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
