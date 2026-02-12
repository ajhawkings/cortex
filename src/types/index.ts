export type Lane = "reply" | "action" | "read" | "reference";
export type ColumnLane = "reply" | "action" | "read";
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

export interface LaneConfig {
	label: string;
	shortLabel: string;
	color: string;
	tint: string;
	divider: string;
}

export const LANE_CONFIG: Record<Lane, LaneConfig> = {
	reply:     { label: "Reply",     shortLabel: "Reply",  color: "#3b82f6", tint: "rgba(59, 130, 246, 0.06)",  divider: "rgba(59, 130, 246, 0.12)" },
	action:    { label: "Action",    shortLabel: "Action", color: "#f59e0b", tint: "rgba(245, 158, 11, 0.06)",  divider: "rgba(245, 158, 11, 0.12)" },
	read:      { label: "Read",      shortLabel: "Read",   color: "#10b981", tint: "rgba(16, 185, 129, 0.06)",  divider: "rgba(16, 185, 129, 0.12)" },
	reference: { label: "Reference", shortLabel: "Ref",    color: "#8b5cf6", tint: "rgba(139, 92, 246, 0.06)",  divider: "rgba(139, 92, 246, 0.12)" },
};

export const ALL_LANES: Lane[] = ["reply", "action", "read", "reference"];
export const COLUMN_LANES: ColumnLane[] = ["reply", "action", "read"];
