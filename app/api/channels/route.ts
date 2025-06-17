import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function POST(
  req: Request
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams }= new URL(req.url);

    const serverId = searchParams.get("serverId");
if (!profile) {
  return new NextResponse("Unauthorized", { status: 401 });
}

if (!serverId) {
  return new NextResponse("Server ID missing", { status: 400 });
}

if (name === "general") {
  return new NextResponse("Name cannot be 'general'", { status: 400 });
}

const member = await db.member.findFirst({
  where: {
    serverId,
    profileId: profile.id,
    role: {
      in: [MemberRole.ADMIN, MemberRole.MODERATOR]
    }
  }
});
if (!member) {
  return new NextResponse("Forbidden", { status: 403 });
}

// 2. update 單純用主鍵
const updatedServer = await db.server.update({
  where: { id: serverId },
  data: {
    channels: {
      create: {
        profileId: profile.id,
        name,
        type,
      }
    }
  }
});


return NextResponse.json(updatedServer);
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}