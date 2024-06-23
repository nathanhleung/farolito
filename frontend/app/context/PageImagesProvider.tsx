"use client";

import { createContext, useState } from "react";

type TPageImagesContext = {
  pageImages: string[];
  setPageImages(newPageImages: string[]): void;
};

export const PageImagesContext = createContext<TPageImagesContext>({
  pageImages: [],
  setPageImages: async () => {},
});

export default function PageImagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageImages, setPageImages] = useState<string[]>([]);

  return (
    <PageImagesContext.Provider
      value={{ pageImages, setPageImages: setPageImages }}
    >
      {children}
    </PageImagesContext.Provider>
  );
}
