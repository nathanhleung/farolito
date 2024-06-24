"use client";

import { AppContext } from "@/app/context/AppProvider";
import { Button } from "@/components/ui/button";
import { useQueue } from "@uidotdev/usehooks";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Image from "next/image";
import logo from "../logo.png";

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
      action: "stop";
      reason: string;
    }
  | {
      action: "fields";
      reason: string;
      fields: string[];
      upload?: string;
    };

export default function Application() {
  const { pageImages, fileToken, allFields, setAllFields } =
    useContext(AppContext);
  const { replace, push } = useRouter();

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

  const addFields = useCallback(
    (pageNum: number, newFields: string[]) => {
      setAllFields({
        ...allFields,
        [pageNum]: newFields,
      });
    },
    [allFields, setAllFields]
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
            setAllFields({});
            setStarted(true);
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
    } else if (currentMessage?.action === "fields") {
      addFields(pageIndex, currentMessage.fields);
    } else if (currentMessage?.action === "stop") {
      push("/fill");
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

  const numFields = Object.values(allFields).flat().length;

  return (
    <main className="flex min-h-screen p-12 pt-24 flex-col items-center justify-center max-w-3xl mx-auto">
      <div className="flex flex-col text-center pb-12 gap-4">
        <Image src={logo} alt="Lighthouse.ai" />
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
        {numFields > 0 && (
          <div className="border-2 p-8 border-[var(--foreground-rgb)] rounded-lg fixed min-h-40 max-h-[80%] bottom-10 right-10 max-w-60 overflow-scroll bg-white">
            <h2 className="text-xl font-bold mb-2">
              Data needed ({numFields})
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.values(allFields)
                .flat()
                .map((it, i) => (
                  <code className="rounded-md bg-slate-100 p-1 text-xs" key={i}>
                    {it}
                  </code>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
