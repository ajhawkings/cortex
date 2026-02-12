import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import * as schema from "@/db/schema";

// GET /api/items — fetch items for the current user
// ?status=all returns both active and cleared; default returns active only
export async function GET(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const statusFilter = url.searchParams.get("status");

	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	const conditions = [eq(schema.items.userId, session.user.id)];
	if (statusFilter !== "all") {
		conditions.push(eq(schema.items.status, "active"));
	}

	const items = await db
		.select()
		.from(schema.items)
		.where(and(...conditions))
		.orderBy(schema.items.createdAt);

	return Response.json(items);
}

// POST /api/items — create a new manual task
export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json() as Record<string, unknown>;
	const { title, snippet, lane } = body as { title?: string; snippet?: string; lane?: string };

	if (!title || !lane) {
		return Response.json({ error: "title and lane are required" }, { status: 400 });
	}

	const validLanes = ["reply", "action", "read", "reference"] as const;
	if (!validLanes.includes(lane as typeof validLanes[number])) {
		return Response.json({ error: "Invalid lane" }, { status: 400 });
	}

	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	const [item] = await db
		.insert(schema.items)
		.values({
			userId: session.user.id,
			type: "task",
			lane: lane as typeof validLanes[number],
			title,
			snippet: snippet || null,
			isRead: true,
		})
		.returning();

	return Response.json(item, { status: 201 });
}
