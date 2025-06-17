import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

type Page = {
  items: MessageWithMemberWithProfile[];
};

type PagesData = {
  pages: Page[];
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    // 更新訊息
    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<PagesData>([queryKey], (oldData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === message.id ? message : item
          ),
        }));

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    // 新增訊息
    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<PagesData>([queryKey], (oldData) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};