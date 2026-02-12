"use client";

import type { Item, Lane } from "@/types";
import { LANE_CONFIG } from "@/types";

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

const AVATAR_COLORS = [
	"#ef4444", "#f97316", "#f59e0b", "#84cc16",
	"#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
	"#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
];

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return Math.abs(hash);
}

export function getInitials(name: string | null, email: string | null): string {
	if (name) {
		const parts = name.trim().split(/\s+/);
		if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
		return name[0].toUpperCase();
	}
	if (email) return email[0].toUpperCase();
	return "?";
}

export function getAvatarColor(name: string | null, email: string | null): string {
	const key = name || email || "default";
	return AVATAR_COLORS[hashString(key) % AVATAR_COLORS.length];
}

// Archive icon (box with down arrow)
function ArchiveIcon({ size }: { size: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="2" y="3" width="20" height="5" rx="1" />
			<path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
			<path d="m10 12 2 2 2-2" />
			<path d="M12 10v4" />
		</svg>
	);
}

// Inbox/restore icon (arrow coming out of box)
function InboxIcon({ size }: { size: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="2" y="3" width="20" height="5" rx="1" />
			<path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
			<path d="m10 14 2-2 2 2" />
			<path d="M12 16v-4" />
		</svg>
	);
}

// Checkmark icon
function CheckIcon({ size }: { size: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="M5 12l5 5L20 7" />
		</svg>
	);
}

interface ItemRowProps {
	item: Item;
	lane: Lane;
	isSelected: boolean;
	onSelect: () => void;
	onOpen: () => void;
	onClear: () => void;
	compact?: boolean;
	isArchived?: boolean;
}

export function ItemRow({ item, lane, isSelected, onSelect, onOpen, onClear, compact, isArchived }: ItemRowProps) {
	const isUnread = item.type === "email" && !item.isRead;
	const laneConfig = LANE_CONFIG[lane];
	const avatarSize = compact ? "h-7 w-7" : "h-9 w-9";
	const iconSize = compact ? 13 : 16;

	return (
		<div
			onClick={() => {
				onSelect();
				onOpen();
			}}
			draggable
			onDragStart={(e) => {
				e.dataTransfer.setData("text/plain", item.id);
				e.dataTransfer.effectAllowed = "move";
			}}
			className={`group flex items-center gap-3 px-3 cursor-grab active:cursor-grabbing transition-colors ${
				compact ? "py-1.5" : "py-2.5"
			} ${
				isSelected
					? "bg-white/10"
					: "hover:bg-white/5"
			}`}
		>
			{/* Avatar / Action zone */}
			<div
				className={`relative shrink-0 ${avatarSize}`}
				onClick={(e) => {
					e.stopPropagation();
					onClear();
				}}
			>
				{item.type === "email" ? (
					isArchived ? (
						<>
							{/* Archived email — Normal: muted archive icon */}
							<div
								className={`flex ${avatarSize} items-center justify-center rounded-full bg-white/10 text-muted-foreground transition-opacity group-hover:opacity-0`}
							>
								<ArchiveIcon size={iconSize} />
							</div>
							{/* Hover: restore/inbox icon */}
							<div
								className={`absolute inset-0 flex ${avatarSize} items-center justify-center rounded-full bg-blue-500/20 text-blue-400 opacity-0 transition-opacity hover:bg-blue-500/30 group-hover:opacity-100`}
							>
								<InboxIcon size={iconSize} />
							</div>
						</>
					) : (
						<>
							{/* Active email — Normal: initials avatar */}
							<div
								className={`flex ${avatarSize} items-center justify-center rounded-full font-semibold text-white transition-opacity group-hover:opacity-0 ${
									compact ? "text-xs" : "text-sm"
								}`}
								style={{ backgroundColor: getAvatarColor(item.fromName, item.fromEmail) }}
							>
								{getInitials(item.fromName, item.fromEmail)}
							</div>
							{/* Hover: archive icon */}
							<div
								className={`absolute inset-0 flex ${avatarSize} items-center justify-center rounded-full bg-white/10 text-muted-foreground opacity-0 transition-opacity hover:bg-white/20 hover:text-foreground group-hover:opacity-100`}
							>
								<ArchiveIcon size={iconSize} />
							</div>
						</>
					)
				) : (
					isArchived ? (
						<>
							{/* Archived task — Normal: filled check (completed) */}
							<div
								className={`flex ${avatarSize} items-center justify-center rounded-full border-2 transition-opacity group-hover:opacity-0`}
								style={{ borderColor: laneConfig.color, backgroundColor: laneConfig.color + "20" }}
							>
								<span style={{ color: laneConfig.color }}>
									<CheckIcon size={iconSize} />
								</span>
							</div>
							{/* Hover: empty circle (uncheck / restore) */}
							<div
								className={`absolute inset-0 flex ${avatarSize} items-center justify-center rounded-full border-2 opacity-0 transition-opacity group-hover:opacity-100`}
								style={{ borderColor: laneConfig.color }}
							>
								<span style={{ color: laneConfig.color, opacity: 0.3 }}>
									<CheckIcon size={iconSize} />
								</span>
							</div>
						</>
					) : (
						<>
							{/* Active task — Normal: circle with greyed-out check */}
							<div
								className={`flex ${avatarSize} items-center justify-center rounded-full border-2 transition-opacity group-hover:opacity-0`}
								style={{ borderColor: laneConfig.color }}
							>
								<span style={{ color: laneConfig.color, opacity: 0.3 }}>
									<CheckIcon size={iconSize} />
								</span>
							</div>
							{/* Hover: filled check */}
							<div
								className={`absolute inset-0 flex ${avatarSize} items-center justify-center rounded-full border-2 opacity-0 transition-opacity group-hover:opacity-100`}
								style={{ borderColor: laneConfig.color, backgroundColor: laneConfig.color + "20" }}
							>
								<span style={{ color: laneConfig.color }}>
									<CheckIcon size={iconSize} />
								</span>
							</div>
						</>
					)
				)}
			</div>

			{/* Content */}
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					{item.type === "email" && (
						<span
							className={`shrink-0 truncate text-sm ${
								isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
							}`}
							style={{ maxWidth: "10rem" }}
						>
							{item.fromName || item.fromEmail || "Unknown"}
						</span>
					)}
					<span
						className={`truncate text-sm ${
							isUnread ? "font-semibold text-foreground" : "text-foreground/80"
						}`}
					>
						{item.title}
					</span>
				</div>
				{!compact && item.snippet && (
					<span className="truncate text-sm text-muted-foreground">
						{item.snippet}
					</span>
				)}
			</div>

			{/* Unread dot */}
			{isUnread && (
				<div className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400" />
			)}

			{/* Timestamp */}
			<span className="shrink-0 text-sm text-muted-foreground tabular-nums">
				{timeAgo(item.receivedAt || item.createdAt)}
			</span>
		</div>
	);
}
