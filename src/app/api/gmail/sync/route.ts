import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { fetchRecentEmails, refreshAccessToken } from "@/lib/gmail";
import { categoriseEmails } from "@/lib/ai";
import * as schema from "@/db/schema";

export async function POST() {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { env } = getCloudflareContext();
	const db = drizzle(env.DB, { schema });

	// Query Auth.js accounts table directly (created by @auth/d1-adapter)
	const accountRow = await env.DB.prepare(
		"SELECT access_token, refresh_token, expires_at FROM accounts WHERE userId = ? AND provider = 'google' LIMIT 1"
	).bind(session.user.id).first<{
		access_token: string;
		refresh_token: string;
		expires_at: number;
	}>();

	if (!accountRow?.refresh_token) {
		return Response.json({ error: "No Google account linked" }, { status: 400 });
	}

	// Refresh token if expired
	let accessToken = accountRow.access_token;
	if (accountRow.expires_at && accountRow.expires_at * 1000 < Date.now()) {
		const refreshed = await refreshAccessToken(
			accountRow.refresh_token,
			env.AUTH_GOOGLE_ID,
			env.AUTH_GOOGLE_SECRET
		);
		accessToken = refreshed.accessToken;

		// Update the stored access token
		await env.DB.prepare(
			"UPDATE accounts SET access_token = ?, expires_at = ? WHERE userId = ? AND provider = 'google'"
		).bind(accessToken, Math.floor(refreshed.expiresAt / 1000), session.user.id).run();
	}

	// Fetch recent emails from Gmail
	const { emails } = await fetchRecentEmails(accessToken, 50);

	if (emails.length === 0) {
		return Response.json({ synced: 0 });
	}

	// Check which emails already exist in D1
	const existingIds = new Set(
		(
			await db
				.select({ gmailMessageId: schema.items.gmailMessageId })
				.from(schema.items)
				.where(
					and(
						eq(schema.items.userId, session.user.id),
						eq(schema.items.type, "email")
					)
				)
		).map((r) => r.gmailMessageId)
	);

	const newEmails = emails.filter((e) => !existingIds.has(e.gmailMessageId));

	if (newEmails.length === 0) {
		return Response.json({ synced: 0, message: "All emails already synced" });
	}

	// Categorise new emails with Claude
	let categories: { lane: "reply" | "action" | "read" | "reference" }[];
	try {
		categories = await categoriseEmails(
			env.ANTHROPIC_API_KEY,
			newEmails.map((e) => ({
				subject: e.subject,
				snippet: e.snippet,
				fromName: e.fromName,
				fromEmail: e.fromEmail,
			}))
		);
	} catch (err) {
		// Fallback: put everything in "reference" if AI fails
		console.error("AI categorisation failed:", err);
		categories = newEmails.map(() => ({ lane: "reference" as const }));
	}

	// Insert new emails into D1
	const inserted = await Promise.all(
		newEmails.map((email, i) =>
			db.insert(schema.items).values({
				userId: session.user!.id!,
				type: "email",
				lane: categories[i]?.lane || "reference",
				title: email.subject,
				snippet: email.snippet,
				isRead: email.isRead,
				gmailMessageId: email.gmailMessageId,
				gmailThreadId: email.gmailThreadId,
				fromEmail: email.fromEmail,
				fromName: email.fromName,
				receivedAt: email.receivedAt,
			})
		)
	);

	return Response.json({ synced: inserted.length });
}
