import { prisma } from "../prisma";
import { NotionSyncService } from "../services/notionSync";

export async function syncAllWorkspaces() {
  try {
    const notionConnections = await prisma.notionConnection.findMany({
      include: {
        workspace: true,
      },
    });

    for (const connection of notionConnections) {
      const { accessToken, databaseIds, mappingConfig, workspace } = connection;

      for (const databaseId of databaseIds) {
        const syncService = new NotionSyncService(
          accessToken,
          databaseId,
          mappingConfig as any
        );

        await syncService.syncPages(workspace.id);
      }
    }
  } catch (error) {
    console.error("Error in background sync:", error);
  }
} 