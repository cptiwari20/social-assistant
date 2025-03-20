import { Client } from "@notionhq/client";

export interface NotionConfig {
  accessToken: string;
  workspaceId: string;
}

export const createNotionClient = (accessToken: string) => {
  return new Client({
    auth: accessToken,
  });
};

export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, any>;
}

export interface NotionMapping {
  content: string;
  scheduledDate: string;
  platforms: string;
  media: string;
} 