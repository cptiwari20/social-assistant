import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { authOptions } from "../../lib/auth";

// Get all workspaces for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaces: true,
      },
    });

    return NextResponse.json(user?.workspaces || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching workspaces" },
      { status: 500 }
    );
  }
}

// Create a new workspace
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: user.id,
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating workspace" },
      { status: 500 }
    );
  }
} 