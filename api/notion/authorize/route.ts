import { NextResponse } from "next/server";

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI!;

export async function GET() {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&redirect_uri=${NOTION_REDIRECT_URI}&response_type=code&owner=user`;
  
  return NextResponse.json({ authUrl });
} 