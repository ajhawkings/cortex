"use client";

import { useEffect, useRef } from "react";
import type { Item, Lane } from "@/types";
import { LANE_CONFIG } from "@/types";

interface ReadingPaneProps {
	item: Item;
	onClose: () => void;
	onClear: () => void;
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
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

function getInitials(name: string | null, email: string | null): string {
	if (name) {
		const parts = name.trim().split(/\s+/);
		if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
		return name[0].toUpperCase();
	}
	if (email) return email[0].toUpperCase();
	return "?";
}

function getAvatarColor(name: string | null, email: string | null): string {
	const key = name || email || "default";
	return AVATAR_COLORS[hashString(key) % AVATAR_COLORS.length];
}

export function ReadingPane({ item, onClose, onClear }: ReadingPaneProps) {
	const paneRef = useRef<HTMLDivElement>(null);
	const laneConfig = LANE_CONFIG[item.lane as Lane];

	function handleBackdropClick(e: React.MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	useEffect(() => {
		paneRef.current?.focus();
	}, []);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
			onClick={handleBackdropClick}
		>
			<div
				ref={paneRef}
				tabIndex={-1}
				className="flex h-[90%] w-[90%] flex-col overflow-hidden rounded-2xl border shadow-2xl outline-none"
				style={{
					backgroundColor: "#13203a",
					borderColor: laneConfig.color + "30",
				}}
			>
				{/* Header */}
				<div
					className="flex items-center justify-between px-6 py-4"
					style={{ borderBottom: `1px solid ${laneConfig.color}25` }}
				>
					<div className="flex items-center gap-3">
						<div
							className="h-3.5 w-3.5 rounded-full"
							style={{ backgroundColor: laneConfig.color }}
						/>
						<span
							className="text-sm font-bold uppercase tracking-wider"
							style={{ color: laneConfig.color }}
						>
							{laneConfig.label}
						</span>
						<span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
							{item.type}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={onClear}
							className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
						>
							Archive
						</button>
						<button
							onClick={onClose}
							className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 6 6 18" />
								<path d="m6 6 12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Body */}
				<div className="cortex-scrollbar flex-1 overflow-y-auto px-8 py-6">
					{/* Email meta */}
					{item.type === "email" && (item.fromName || item.fromEmail) && (
						<div className="mb-5 flex items-center gap-4">
							<div
								className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white"
								style={{ backgroundColor: getAvatarColor(item.fromName, item.fromEmail) }}
							>
								{getInitials(item.fromName, item.fromEmail)}
							</div>
							<div>
								<div className="text-base font-semibold text-foreground">
									{item.fromName || "Unknown"}
								</div>
								{item.fromEmail && (
									<div className="text-sm text-muted-foreground">
										{item.fromEmail}
									</div>
								)}
							</div>
							{item.receivedAt && (
								<span className="ml-auto text-sm text-muted-foreground">
									{formatDate(item.receivedAt)}
								</span>
							)}
						</div>
					)}

					{/* Task meta */}
					{item.type === "task" && (
						<div className="mb-5 text-sm text-muted-foreground">
							Created {formatDate(item.createdAt)}
						</div>
					)}

					{/* Title */}
					<h2 className="mb-5 text-2xl font-bold text-foreground">
						{item.title}
					</h2>

					{/* Content */}
					{item.snippet ? (
						<div className="text-base leading-relaxed text-foreground/80">
							{item.snippet}
						</div>
					) : (
						<div className="text-base text-muted-foreground italic">
							No content available
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 py-3" style={{ borderTop: `1px solid ${laneConfig.color}15` }}>
					<div className="flex items-center justify-between">
						<kbd className="text-xs text-muted-foreground">
							Esc close · Backspace archive
						</kbd>
						{item.status === "cleared" && item.clearedAt && (
							<span className="text-xs text-muted-foreground">
								Archived {formatDate(item.clearedAt)}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
