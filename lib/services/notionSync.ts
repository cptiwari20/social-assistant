import { Client } from "@notionhq/client";
import { prisma } from "../prisma";
import { NotionMapping } from "../notion";

interface NotionPage {
  id: string;
  properties: Record<string, any>;
}

export class NotionSyncService {
  private client: Client;
  private mapping: NotionMapping;
  private databaseId: string;

  constructor(accessToken: string, databaseId: string, mapping: NotionMapping) {
    this.client = new Client({ auth: accessToken });
    this.databaseId = databaseId;
    this.mapping = mapping;
  }

  private extractContent(properties: Record<string, any>, propertyName: string): string {
    const property = properties[propertyName];
    if (!property) return "";

    switch (property.type) {
      case "rich_text":
        return property.rich_text.map((text: any) => text.plain_text).join("");
      case "title":
        return property.title.map((text: any) => text.plain_text).join("");
      default:
        return String(property[property.type] || "");
    }
  }

  private extractDate(properties: Record<string, any>, propertyName: string): Date | null {
    const property = properties[propertyName];
    if (!property || !property.date) return null;
    return new Date(property.date.start);
  }

  private extractPlatforms(properties: Record<string, any>, propertyName: string): string[] {
    const property = properties[propertyName];
    if (!property || !property.multi_select) return [];
    return property.multi_select.map((select: any) => select.name);
  }

  private extractMediaUrls(properties: Record<string, any>, propertyName: string): string[] {
    const property = properties[propertyName];
    if (!property || !property.files) return [];
    return property.files.map((file: any) => file.file?.url || file.external?.url || "");
  }

  async syncPages(workspaceId: string): Promise<void> {
    try {
      const pages = await this.fetchAllPages();
      
      for (const page of pages) {
        await this.syncPage(page, workspaceId);
      }
    } catch (error) {
      console.error("Error syncing Notion pages:", error);
      throw error;
    }
  }

  private async fetchAllPages(): Promise<NotionPage[]> {
    const pages: NotionPage[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        start_cursor: startCursor,
      });

      pages.push(...response.results as NotionPage[]);
      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }

    return pages;
  }

  private async syncPage(page: NotionPage, workspaceId: string): Promise<void> {
    const properties = page.properties;

    const content = this.extractContent(properties, this.mapping.content);
    const scheduledTime = this.extractDate(properties, this.mapping.scheduledDate);
    const platforms = this.extractPlatforms(properties, this.mapping.platforms);
    const mediaUrls = this.extractMediaUrls(properties, this.mapping.media);

    if (!scheduledTime) return; // Skip pages without a scheduled time

    await prisma.post.upsert({
      where: {
        notionPageId: page.id,
      },
      update: {
        content,
        scheduledTime,
        platforms,
        mediaUrls,
        status: "SCHEDULED",
      },
      create: {
        notionPageId: page.id,
        workspaceId,
        content,
        scheduledTime,
        platforms,
        mediaUrls,
        status: "SCHEDULED",
        analytics: {},
      },
    });
  }
} 