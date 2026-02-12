import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import * as schema from "@/db/schema";

// PATCH /api/items/:id — update an item (clear, change lane, mark read, etc.)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const body = await request.json();

	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	// Build update fields
	const updates: Record<string, unknown> = { updatedAt: new Date() };

	if (body.status === "cleared") {
		updates.status = "cleared";
		updates.clearedAt = new Date();
	}
	if (body.lane && ["reply", "action", "read", "reference"].includes(body.lane)) {
		updates.lane = body.lane;
	}
	if (typeof body.isRead === "boolean") {
		updates.isRead = body.isRead;
	}
	if (body.title) {
		updates.title = body.title;
	}

	const [updated] = await db
		.update(schema.items)
		.set(updates)
		.where(and(eq(schema.items.id, id), eq(schema.items.userId, session.user.id)))
		.returning();

	if (!updated) {
		return Response.json({ error: "Not found" }, { status: 404 });
	}

	return Response.json(updated);
}

// DELETE /api/items/:id — permanently delete an item
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	await db
		.delete(schema.items)
		.where(and(eq(schema.items.id, id), eq(schema.items.userId, session.user.id)));

	return new Response(null, { status: 204 });
}
