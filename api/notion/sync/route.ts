import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { NotionSyncService } from "../../../lib/services/notionSync";
import { authOptions } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, databaseId } = await request.json();

    if (!workspaceId || !databaseId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const notionConnection = await prisma.notionConnection.findFirst({
      where: { workspaceId },
    });

    if (!notionConnection) {
      return NextResponse.json(
        { error: "Notion connection not found" },
        { status: 404 }
      );
    }

    const syncService = new NotionSyncService(
      notionConnection.accessToken,
      databaseId,
      notionConnection.mappingConfig as any
    );

    await syncService.syncPages(workspaceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notion sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Notion" },
      { status: 500 }
    );
  }
} 