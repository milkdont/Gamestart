"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

export const NavigationItem = ({
  id,
  imageUrl,
  name,
}: NavigationItemProps) => {
  const params = useParams();
  const router = useRouter();

  const OnClick = () => {
    router.push(`/servers/${id}`);
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={OnClick}
        className="group relative flex items-center"
      >
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId !== id && "group-hover:h-[20px]",
            params?.serverId === id ? "h-[36px]" : "h-[8px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.serverId === id && "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          {imageUrl
            ? (
              <Image
                fill
                src={imageUrl}
                alt="Channel"
                sizes="48px"
                style={{ objectFit: "cover" }}
              />
            )
            : (
              // fallback 圖示或顏色圈圈
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                {/* 你可以換成 icon 或英文縮寫 */}
                {name.charAt(0).toUpperCase()}
              </div>
            )
          }
        </div>
      </button>
    </ActionTooltip>
  );
};