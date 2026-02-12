import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { markAsRead, refreshAccessToken } from "@/lib/gmail";
import * as schema from "@/db/schema";

// PATCH /api/items/:id — update an item (clear, change lane, mark read, etc.)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const body = await request.json() as Record<string, unknown>;

	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	// Build update fields
	const updates: Record<string, unknown> = { updatedAt: new Date() };

	if (body.status === "cleared") {
		updates.status = "cleared";
		updates.clearedAt = new Date();
	}
	if (body.status === "active") {
		updates.status = "active";
		updates.clearedAt = null;
	}
	if (body.lane && typeof body.lane === "string" && ["reply", "action", "read", "reference"].includes(body.lane)) {
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

	// Sync read status to Gmail if marking an email as read
	if (body.isRead === true && updated.gmailMessageId) {
		try {
			const accountRow = await env.DB.prepare(
				"SELECT access_token, refresh_token, expires_at FROM accounts WHERE userId = ? AND provider = 'google' LIMIT 1"
			).bind(session.user.id).first<{
				access_token: string;
				refresh_token: string;
				expires_at: number;
			}>();

			if (accountRow?.access_token) {
				let accessToken = accountRow.access_token;
				if (accountRow.expires_at && accountRow.expires_at * 1000 < Date.now() && accountRow.refresh_token) {
					const refreshed = await refreshAccessToken(
						accountRow.refresh_token,
						env.AUTH_GOOGLE_ID,
						env.AUTH_GOOGLE_SECRET
					);
					accessToken = refreshed.accessToken;
					await env.DB.prepare(
						"UPDATE accounts SET access_token = ?, expires_at = ? WHERE userId = ? AND provider = 'google'"
					).bind(accessToken, Math.floor(refreshed.expiresAt / 1000), session.user.id).run();
				}

				await markAsRead(accessToken, updated.gmailMessageId);
			}
		} catch (err) {
			// Don't fail the whole request if Gmail sync fails
			console.error("Gmail markAsRead failed:", err);
		}
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
