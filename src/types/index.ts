export type Lane = "reply" | "action" | "read" | "reference";
export type ItemType = "email" | "task";
export type ItemStatus = "active" | "cleared";

export interface Item {
	id: string;
	userId: string;
	type: ItemType;
	lane: Lane;
	status: ItemStatus;
	title: string;
	snippet: string | null;
	isRead: boolean;
	gmailMessageId: string | null;
	gmailThreadId: string | null;
	fromEmail: string | null;
	fromName: string | null;
	receivedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	clearedAt: Date | null;
}

export const LANE_CONFIG: Record<Lane, { label: string; shortLabel: string }> = {
	reply: { label: "To Reply", shortLabel: "Reply" },
	action: { label: "To Action", shortLabel: "Action" },
	read: { label: "To Read", shortLabel: "Read" },
	reference: { label: "For Reference", shortLabel: "Ref" },
};
