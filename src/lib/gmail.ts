const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

interface GmailMessage {
	id: string;
	threadId: string;
	snippet: string;
	payload: {
		headers: Array<{ name: string; value: string }>;
	};
	internalDate: string; // epoch ms as string
	labelIds: string[];
}

interface GmailListResponse {
	messages: Array<{ id: string; threadId: string }>;
	nextPageToken?: string;
	resultSizeEstimate: number;
}

export interface ParsedEmail {
	gmailMessageId: string;
	gmailThreadId: string;
	subject: string;
	snippet: string;
	fromEmail: string;
	fromName: string;
	receivedAt: Date;
	isRead: boolean;
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
	return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function parseFrom(from: string): { name: string; email: string } {
	// "John Doe <john@example.com>" or "john@example.com"
	const match = from.match(/^"?([^"<]*)"?\s*<?([^>]*)>?$/);
	if (match) {
		return { name: match[1].trim(), email: match[2].trim() || match[1].trim() };
	}
	return { name: from, email: from };
}

export async function fetchRecentEmails(
	accessToken: string,
	maxResults = 50,
	pageToken?: string
): Promise<{ emails: ParsedEmail[]; nextPageToken?: string }> {
	// List message IDs
	const listUrl = new URL(`${GMAIL_API}/messages`);
	listUrl.searchParams.set("maxResults", String(maxResults));
	listUrl.searchParams.set("labelIds", "INBOX");
	if (pageToken) listUrl.searchParams.set("pageToken", pageToken);

	const listRes = await fetch(listUrl.toString(), {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!listRes.ok) {
		const err = await listRes.text();
		throw new Error(`Gmail list failed (${listRes.status}): ${err}`);
	}

	const listData: GmailListResponse = await listRes.json();
	if (!listData.messages || listData.messages.length === 0) {
		return { emails: [], nextPageToken: undefined };
	}

	// Fetch full message details in parallel (batch of IDs)
	const emails = await Promise.all(
		listData.messages.map(async (msg) => {
			const msgRes = await fetch(
				`${GMAIL_API}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);

			if (!msgRes.ok) return null;

			const msgData: GmailMessage = await msgRes.json();
			const headers = msgData.payload.headers;
			const from = parseFrom(getHeader(headers, "From"));

			return {
				gmailMessageId: msgData.id,
				gmailThreadId: msgData.threadId,
				subject: getHeader(headers, "Subject") || "(no subject)",
				snippet: msgData.snippet,
				fromEmail: from.email,
				fromName: from.name,
				receivedAt: new Date(parseInt(msgData.internalDate)),
				isRead: !msgData.labelIds.includes("UNREAD"),
			} satisfies ParsedEmail;
		})
	);

	return {
		emails: emails.filter((e): e is ParsedEmail => e !== null),
		nextPageToken: listData.nextPageToken,
	};
}

export async function markAsRead(accessToken: string, messageId: string): Promise<void> {
	const res = await fetch(`${GMAIL_API}/messages/${messageId}/modify`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Gmail markAsRead failed (${res.status}): ${err}`);
	}
}

export async function refreshAccessToken(
	refreshToken: string,
	clientId: string,
	clientSecret: string
): Promise<{ accessToken: string; expiresAt: number }> {
	const res = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret,
		}),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Token refresh failed (${res.status}): ${err}`);
	}

	const data = await res.json() as { access_token: string; expires_in: number };
	return {
		accessToken: data.access_token,
		expiresAt: Date.now() + data.expires_in * 1000,
	};
}
