import type { Lane } from "@/types";
import type { ParsedEmail } from "./gmail";

interface CategoriseResult {
	lane: Lane;
}

export async function categoriseEmails(
	apiKey: string,
	emails: Array<{ subject: string; snippet: string; fromName: string; fromEmail: string }>
): Promise<CategoriseResult[]> {
	if (emails.length === 0) return [];

	const emailDescriptions = emails
		.map(
			(e, i) =>
				`[${i}] From: ${e.fromName} <${e.fromEmail}>\nSubject: ${e.subject}\nSnippet: ${e.snippet}`
		)
		.join("\n\n");

	const res = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model: "claude-haiku-4-5-20251001",
			max_tokens: 1024,
			messages: [
				{
					role: "user",
					content: `Categorise each email into exactly one lane. Reply with a JSON array of objects, one per email, in order.

Lanes:
- "reply": Emails that need a personal response (someone asking you something, conversations, invitations needing RSVP)
- "action": Emails requiring you to DO something other than reply (pay a bill, sign a document, complete a task, submit something)
- "read": Emails worth reading but no action needed (newsletters, articles, updates, blog posts)
- "reference": Emails to keep for reference but not read now (confirmations, receipts, shipping notifications, account alerts)

Emails:
${emailDescriptions}

Reply ONLY with a valid JSON array like: [{"lane":"reply"},{"lane":"action"},...]`,
				},
			],
		}),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Claude API failed (${res.status}): ${err}`);
	}

	const data = await res.json() as { content: { text: string }[] };
	const text = data.content[0].text;

	// Extract JSON from response (handle possible markdown code blocks)
	const jsonMatch = text.match(/\[[\s\S]*\]/);
	if (!jsonMatch) {
		throw new Error(`Failed to parse Claude response: ${text}`);
	}

	const results: CategoriseResult[] = JSON.parse(jsonMatch[0]);

	// Validate lanes
	const validLanes = new Set(["reply", "action", "read", "reference"]);
	return results.map((r) => ({
		lane: validLanes.has(r.lane) ? r.lane : "reference",
	}));
}

export async function categoriseSingleEmail(
	apiKey: string,
	email: { subject: string; snippet: string; fromName: string; fromEmail: string }
): Promise<Lane> {
	const results = await categoriseEmails(apiKey, [email]);
	return results[0]?.lane || "reference";
}
