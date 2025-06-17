"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom = ({
  chatId,
  video,
  audio
}: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // 用戶名稱 fallback 機制
    const name =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || user.id;

    (async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${chatId}&username=${encodeURIComponent(name)}`);
        if (!resp.ok) {
          throw new Error(`API 錯誤: ${resp.status}`);
        }
        const data = await resp.json();
        console.log("LiveKit API 回傳:", data);

        if (!data.token) {
          throw new Error("API 回傳沒有 token");
        }
        setToken(data.token);
        setError(null);
      } catch (e: any) {
        setError(e.message || "未知錯誤");
        setToken("");
        console.log("取得 token 失敗:", e);
      }
    })();
  }, [user, chatId]);

  if (!user) {
    // 等待 Clerk 載入 user
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading user...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <p className="text-xs text-red-500 dark:text-red-400">連線發生錯誤: {error}</p>
      </div>
    );
  }

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};