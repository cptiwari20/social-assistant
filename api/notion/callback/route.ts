import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const workspaceId = searchParams.get("workspace");

    if (!code || !workspaceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Exchange code for access token
    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to exchange code" }, { status: 400 });
    }

    // Save the Notion connection
    await prisma.notionConnection.create({
      data: {
        workspaceId,
        accessToken: data.access_token,
        notionWorkspaceId: data.workspace_id,
        databaseIds: [],
        mappingConfig: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notion callback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 