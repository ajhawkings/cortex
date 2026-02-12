"use client";

import type { Item } from "@/types";

function timeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	if (diffMins < 1) return "now";
	if (diffMins < 60) return `${diffMins}m`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h`;
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) return `${diffDays}d`;
	return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface ItemRowProps {
	item: Item;
	isSelected: boolean;
	onSelect: () => void;
	onClear: () => void;
}

export function ItemRow({ item, isSelected, onSelect, onClear }: ItemRowProps) {
	const isUnread = item.type === "email" && !item.isRead;

	return (
		<div
			onClick={onSelect}
			className={`flex items-center gap-3 px-3 py-1.5 text-sm cursor-pointer border-l-2 transition-colors ${
				isSelected
					? "bg-accent border-l-foreground"
					: "border-l-transparent hover:bg-accent/50"
			}`}
		>
			{/* Unread indicator */}
			<div className="w-1.5 shrink-0">
				{isUnread && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
			</div>

			{/* Type badge */}
			<span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground w-8">
				{item.type === "email" ? "mail" : "task"}
			</span>

			{/* Sender / source */}
			<span
				className={`shrink-0 w-32 truncate text-xs ${
					isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
				}`}
			>
				{item.fromName || item.fromEmail || "—"}
			</span>

			{/* Title + snippet */}
			<div className="flex min-w-0 flex-1 items-baseline gap-2">
				<span
					className={`truncate ${
						isUnread ? "font-semibold text-foreground" : "text-foreground/80"
					}`}
				>
					{item.title}
				</span>
				{item.snippet && (
					<span className="truncate text-xs text-muted-foreground">
						— {item.snippet}
					</span>
				)}
			</div>

			{/* Timestamp */}
			<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
				{timeAgo(item.receivedAt || item.createdAt)}
			</span>
		</div>
	);
}
