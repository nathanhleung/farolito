"use client";

import { createContext, useState } from "react";

type TPageImagesContext = {
  fileToken: string;
  pageImages: string[];
  setPageImages(newPageImages: string[]): void;
  setFileToken(newFileToken: string): void;
};

export const PageImagesContext = createContext<TPageImagesContext>({
  fileToken: "",
  pageImages: [],
  setPageImages: () => {},
  setFileToken: () => {},
});

export default function PageImagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [fileToken, setFileToken] = useState("");

  return (
    <PageImagesContext.Provider
      value={{
        pageImages,
        setPageImages: setPageImages,
        fileToken,
        setFileToken,
      }}
    >
      {children}
    </PageImagesContext.Provider>
  );
}
