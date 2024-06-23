"use client";

import { PageImagesContext } from "@/app/context/PageImagesProvider";
import { Button } from "@/components/ui/button";
import { useQueue } from "@uidotdev/usehooks";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type Message =
  | {
      action: "start";
      reason: string;
    }
  | {
      action: "skip";
      reason: string;
    }
  | {
      action: "fields";
      reason: string;
      fields: string[];
      upload?: string;
    };

export default function Application() {
  const { pageImages, fileToken } = useContext(PageImagesContext);
  const { replace } = useRouter();

  // Whether we've started the AI or not
  const [started, setStarted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.NEXT_PUBLIC_ASSISTANT_WEBSOCKET_ENDPOINT!
  );
  const {
    add: addToMessageQueue,
    size,
    clear: clearMessageQueue,
    first: currentMessage,
    remove,
  } = useQueue<Message>();
  const [allFields, setAllFields] = useState<string[]>(["hello", "how"]);

  function addFields(newFields: string[]) {
    setAllFields([...allFields, ...newFields]);
  }

  useEffect(() => {
    if (readyState === ReadyState.OPEN && fileToken !== "") {
      sendMessage(
        JSON.stringify({
          file_token: fileToken,
        })
      );
    }
  }, [readyState, fileToken, sendMessage]);

  // Checks whether there is at least one new message after
  // the current
  const hasNewMessages = size >= 2;

  useEffect(() => {
    if (lastMessage) {
      let dataJson: Message | null = null;
      try {
        dataJson = JSON.parse(lastMessage.data);
        if (dataJson !== null) {
          if (dataJson.action === "start") {
            clearMessageQueue();
            addToMessageQueue(dataJson);
            setPageIndex(0);
            setStarted(true);
          } else if (dataJson.action === "fields") {
            addFields(dataJson.fields);
            addToMessageQueue(dataJson);
          } else {
            addToMessageQueue(dataJson);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastMessage, addToMessageQueue, clearMessageQueue]);

  useEffect(() => {
    // Auto-advance from start message
    if (currentMessage?.action === "start" && hasNewMessages) {
      remove();
    }
  }, [currentMessage, remove, hasNewMessages]);

  useEffect(() => {
    console.log(currentMessage);
  }, [currentMessage]);

  useEffect(() => {
    if (pageImages.length === 0) {
      replace("/");
    }
  }, [pageImages, replace]);

  function onClickNextButton() {
    remove();
    if (currentMessage?.action === "skip") {
      setPageIndex(pageIndex + 1);
    } else if (currentMessage?.action === "fields") {
      setPageIndex(pageIndex + 1);
    }
  }

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
        <div className="flex flex-col items-start gap-4 pb-8">
          <p>
            We&apos;re on page {pageIndex + 1}/{pageImages.length}.{" "}
            {currentMessage?.reason} {!started && "Loading AI..."}
          </p>
          {currentMessage && currentMessage.action !== "start" && (
            <Button onClick={onClickNextButton} disabled={!hasNewMessages}>
              {!hasNewMessages
                ? "Analyzing Next Page..."
                : currentMessage.action === "skip"
                ? "Next Page"
                : "Continue"}
              &nbsp;&nbsp;
              <MoveRight />
            </Button>
          )}
        </div>
        <div>
          <img src={`data:image/png;base64,${pageImages[pageIndex]}`} />
        </div>
        {allFields.length > 0 && (
          <div className="fixed bottom-10 right-10 max-w-20">
            {allFields.join(",")}
          </div>
        )}
      </div>
    </main>
  );
}
