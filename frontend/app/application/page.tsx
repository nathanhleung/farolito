"use client";

import { PageImagesContext } from "@/app/context/PageImagesProvider";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useWebSocket, { ReadyState } from "react-use-websocket";

export default function Application() {
  const { pageImages, fileToken } = useContext(PageImagesContext);
  const { replace } = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.NEXT_PUBLIC_ASSISTANT_WEBSOCKET_ENDPOINT!
  );
  useEffect(() => {
    if (readyState === ReadyState.OPEN && fileToken !== "") {
      sendMessage(
        JSON.stringify({
          file_token: fileToken,
        })
      );
    }
  }, [readyState, fileToken, sendMessage]);

  useEffect(() => {
    console.log(lastMessage);
  }, [lastMessage]);

  useEffect(() => {
    if (pageImages.length === 0) {
      replace("/");
    }
  }, [pageImages, replace]);

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
      <div className="p-6 bg-slate-100 rounded-lg border-2 border-[var(--foreground-rgb)]">
        <p className="mb-6">
          We&apos;re on page {pageIndex + 1}/{pageImages.length}
        </p>
        <div>
          <img src={`data:image/png;base64,${pageImages[pageIndex]}`} />
        </div>
      </div>
    </main>
  );
}
