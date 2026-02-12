import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import * as schema from "@/db/schema";

// GET /api/items — fetch all active items for the current user
export async function GET() {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	const items = await db
		.select()
		.from(schema.items)
		.where(
			and(
				eq(schema.items.userId, session.user.id),
				eq(schema.items.status, "active")
			)
		)
		.orderBy(schema.items.createdAt);

	return Response.json(items);
}

// POST /api/items — create a new manual task
export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { title, snippet, lane } = body;

	if (!title || !lane) {
		return Response.json({ error: "title and lane are required" }, { status: 400 });
	}

	const validLanes = ["reply", "action", "read", "reference"];
	if (!validLanes.includes(lane)) {
		return Response.json({ error: "Invalid lane" }, { status: 400 });
	}

	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	const [item] = await db
		.insert(schema.items)
		.values({
			userId: session.user.id,
			type: "task",
			lane,
			title,
			snippet: snippet || null,
			isRead: true,
		})
		.returning();

	return Response.json(item, { status: 201 });
}
