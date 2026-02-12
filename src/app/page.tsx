"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Item, Lane as LaneType, ColumnLane } from "@/types";
import { LANE_CONFIG, ALL_LANES, COLUMN_LANES } from "@/types";
import { Lane } from "@/components/dashboard/lane";
import { ReferenceBin } from "@/components/dashboard/reference-bin";
import { ReadingPane } from "@/components/dashboard/reading-pane";

// Mock data — used when not authenticated or API unavailable
const MOCK_ITEMS: Item[] = [
	{ id: "1", userId: "u1", type: "email", lane: "reply", status: "active", title: "Re: Project proposal feedback", snippet: "Thanks for sending this over. I had a few thoughts on the timeline...", isRead: false, gmailMessageId: "msg1", gmailThreadId: "t1", fromEmail: "sarah@example.com", fromName: "Sarah Chen", receivedAt: new Date(Date.now() - 1000 * 60 * 15), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "2", userId: "u1", type: "email", lane: "reply", status: "active", title: "Dinner on Friday?", snippet: "Hey! Are you free this Friday for dinner?", isRead: false, gmailMessageId: "msg2", gmailThreadId: "t2", fromEmail: "james@example.com", fromName: "James", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "3", userId: "u1", type: "email", lane: "reply", status: "active", title: "Quick question about the API", snippet: "Hey, I noticed the /users endpoint returns 403 when...", isRead: true, gmailMessageId: "msg3", gmailThreadId: "t3", fromEmail: "dev@company.com", fromName: "Tom (Engineering)", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "4", userId: "u1", type: "email", lane: "action", status: "active", title: "Invoice #4521 — Payment due", snippet: "Your invoice for January is ready. Amount: £340.00. Due by Feb 15.", isRead: true, gmailMessageId: "msg4", gmailThreadId: "t4", fromEmail: "billing@service.com", fromName: "Billing", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "5", userId: "u1", type: "task", lane: "action", status: "active", title: "Book dentist appointment", snippet: null, isRead: true, gmailMessageId: null, gmailThreadId: null, fromEmail: null, fromName: null, receivedAt: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), updatedAt: new Date(), clearedAt: null },
	{ id: "6", userId: "u1", type: "task", lane: "action", status: "active", title: "Submit coursework by Thursday", snippet: "Module CS3420 — final submission", isRead: true, gmailMessageId: null, gmailThreadId: null, fromEmail: null, fromName: null, receivedAt: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), updatedAt: new Date(), clearedAt: null },
	{ id: "7", userId: "u1", type: "email", lane: "read", status: "active", title: "This Week in AI — Issue #147", snippet: "OpenAI announces GPT-5, Google releases Gemini 2.5, and more...", isRead: false, gmailMessageId: "msg7", gmailThreadId: "t7", fromEmail: "newsletter@weekinai.com", fromName: "This Week in AI", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "8", userId: "u1", type: "email", lane: "read", status: "active", title: "How we scaled our Postgres to 1M queries/sec", snippet: "A deep dive into connection pooling, read replicas, and query optimization...", isRead: false, gmailMessageId: "msg8", gmailThreadId: "t8", fromEmail: "hello@blog.example.com", fromName: "Tech Blog Weekly", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "9", userId: "u1", type: "email", lane: "reference", status: "active", title: "Your flight confirmation — LHR to BCN", snippet: "Booking ref: ABC123. Departs 8 Mar 06:45. Terminal 5.", isRead: true, gmailMessageId: "msg9", gmailThreadId: "t9", fromEmail: "bookings@airline.com", fromName: "British Airways", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "10", userId: "u1", type: "email", lane: "reference", status: "active", title: "Your order has shipped", snippet: "Tracking number: 1Z999AA10123456784. Estimated delivery: Feb 14.", isRead: true, gmailMessageId: "msg10", gmailThreadId: "t10", fromEmail: "orders@amazon.co.uk", fromName: "Amazon", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), createdAt: new Date(), updatedAt: new Date(), clearedAt: null },
	{ id: "11", userId: "u1", type: "email", lane: "reply", status: "cleared", title: "Re: Lunch tomorrow?", snippet: "Sure, let's do 12:30 at the usual place.", isRead: true, gmailMessageId: "msg11", gmailThreadId: "t11", fromEmail: "alice@example.com", fromName: "Alice Wong", receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), createdAt: new Date(), updatedAt: new Date(), clearedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) },
	{ id: "12", userId: "u1", type: "task", lane: "action", status: "cleared", title: "Pay electricity bill", snippet: null, isRead: true, gmailMessageId: null, gmailThreadId: null, fromEmail: null, fromName: null, receivedAt: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), updatedAt: new Date(), clearedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
];

function deserializeItems(raw: Record<string, unknown>[]): Item[] {
	return raw.map((r) => ({
		...r,
		receivedAt: r.receivedAt ? new Date(r.receivedAt as string) : null,
		createdAt: new Date(r.createdAt as string),
		updatedAt: new Date(r.updatedAt as string),
		clearedAt: r.clearedAt ? new Date(r.clearedAt as string) : null,
	})) as Item[];
}

export default function Dashboard() {
	const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const [readingItemId, setReadingItemId] = useState<string | null>(null);
	const [syncing, setSyncing] = useState(false);
	const [isLive, setIsLive] = useState(false);
	const [showArchive, setShowArchive] = useState(false);
	const [visibleLanes, setVisibleLanes] = useState<Set<ColumnLane>>(new Set(COLUMN_LANES));

	useEffect(() => {
		fetch("/api/items?status=all")
			.then((res) => {
				if (!res.ok) throw new Error("Not authenticated");
				return res.json() as Promise<Record<string, unknown>[]>;
			})
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					setItems(deserializeItems(data));
					setIsLive(true);
				}
				if (Array.isArray(data)) setIsLive(true);
			})
			.catch(() => {});
	}, []);

	const filteredItems = useMemo(() => {
		return items.filter((i) => {
			if (showArchive) return i.status === "cleared";
			return i.status === "active";
		});
	}, [items, showArchive]);

	// Counts for the 3 column lanes
	const laneItemCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const lane of COLUMN_LANES) {
			counts[lane] = items.filter((i) => i.lane === lane && i.status === "active").length;
		}
		return counts;
	}, [items]);

	const referenceItems = useMemo(() => {
		return filteredItems.filter((i) => i.lane === "reference");
	}, [filteredItems]);

	const readingItem = readingItemId ? items.find((i) => i.id === readingItemId) ?? null : null;

	const handleClear = useCallback(
		async (id: string) => {
			setItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, status: "cleared" as const, clearedAt: new Date() } : item
				)
			);
			setSelectedItemId(null);
			setReadingItemId(null);

			if (isLive) {
				await fetch(`/api/items/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status: "cleared" }),
				}).catch(() => {});
			}
		},
		[isLive]
	);

	const handleOpenItem = useCallback(
		(id: string) => {
			setReadingItemId(id);

			// Mark as read if unread
			const item = items.find((i) => i.id === id);
			if (item && !item.isRead) {
				setItems((prev) =>
					prev.map((i) =>
						i.id === id ? { ...i, isRead: true } : i
					)
				);

				if (isLive) {
					fetch(`/api/items/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ isRead: true }),
					}).catch(() => {});
				}
			}
		},
		[items, isLive]
	);

	const handleAddItem = useCallback(
		async (title: string, lane: LaneType) => {
			if (isLive) {
				const res = await fetch("/api/items", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title, lane }),
				});
				if (res.ok) {
					const newItem = await res.json() as Item;
					setItems((prev) => [...prev, { ...newItem, receivedAt: null, createdAt: new Date(), updatedAt: new Date(), clearedAt: null }]);
				}
			} else {
				setItems((prev) => [
					...prev,
					{
						id: crypto.randomUUID(),
						userId: "u1",
						type: "task" as const,
						lane,
						status: "active" as const,
						title,
						snippet: null,
						isRead: true,
						gmailMessageId: null,
						gmailThreadId: null,
						fromEmail: null,
						fromName: null,
						receivedAt: null,
						createdAt: new Date(),
						updatedAt: new Date(),
						clearedAt: null,
					},
				]);
			}
		},
		[isLive]
	);

	const handleSync = useCallback(async () => {
		setSyncing(true);
		try {
			const res = await fetch("/api/gmail/sync", { method: "POST" });
			if (res.ok) {
				const itemsRes = await fetch("/api/items?status=all");
				if (itemsRes.ok) {
					const data = await itemsRes.json() as Record<string, unknown>[];
					setItems(deserializeItems(data));
				}
			}
		} finally {
			setSyncing(false);
		}
	}, []);

	const handleRestore = useCallback(
		async (id: string) => {
			setItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, status: "active" as const, clearedAt: null } : item
				)
			);
			setSelectedItemId(null);

			if (isLive) {
				await fetch(`/api/items/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status: "active" }),
				}).catch(() => {});
			}
		},
		[isLive]
	);

	const handleMoveItem = useCallback(
		async (itemId: string, toLane: LaneType) => {
			const item = items.find((i) => i.id === itemId);
			if (!item || item.lane === toLane) return;

			setItems((prev) =>
				prev.map((i) =>
					i.id === itemId ? { ...i, lane: toLane, updatedAt: new Date() } : i
				)
			);

			if (isLive) {
				await fetch(`/api/items/${itemId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ lane: toLane }),
				}).catch(() => {});
			}
		},
		[isLive, items]
	);

	function toggleLane(lane: ColumnLane) {
		setVisibleLanes((prev) => {
			const next = new Set(prev);
			if (next.has(lane)) {
				if (next.size > 1) next.delete(lane);
			} else {
				next.add(lane);
			}
			return next;
		});
	}

	// All navigable items (column lanes + reference, visible only)
	const navigableItems = useMemo(() => {
		return filteredItems.filter((i) => {
			if (i.lane === "reference") return true;
			return visibleLanes.has(i.lane as ColumnLane);
		});
	}, [filteredItems, visibleLanes]);

	// Keyboard shortcuts
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			// Reading pane shortcuts
			if (readingItemId) {
				if (e.key === "Escape") {
					e.preventDefault();
					setReadingItemId(null);
					return;
				}
				if (e.key === "Backspace") {
					e.preventDefault();
					if (showArchive) {
						handleRestore(readingItemId);
					} else {
						handleClear(readingItemId);
					}
					return;
				}
				return;
			}

			// Enter — open reading pane
			if (e.key === "Enter" && selectedItemId) {
				e.preventDefault();
				setReadingItemId(selectedItemId);
				return;
			}

			// Escape — deselect
			if (e.key === "Escape") {
				e.preventDefault();
				setSelectedItemId(null);
				return;
			}

			// Backspace — archive or restore selected
			if (e.key === "Backspace" && selectedItemId) {
				e.preventDefault();
				if (showArchive) {
					handleRestore(selectedItemId);
				} else {
					handleClear(selectedItemId);
				}
				return;
			}

			// j/k/ArrowDown/ArrowUp — navigate
			const isDown = e.key === "j" || e.key === "ArrowDown";
			const isUp = e.key === "k" || e.key === "ArrowUp";
			if (isDown || isUp) {
				e.preventDefault();
				if (navigableItems.length === 0) return;

				const currentIndex = selectedItemId
					? navigableItems.findIndex((i) => i.id === selectedItemId)
					: -1;

				let nextIndex: number;
				if (isDown) {
					nextIndex = currentIndex < navigableItems.length - 1 ? currentIndex + 1 : 0;
				} else {
					nextIndex = currentIndex > 0 ? currentIndex - 1 : navigableItems.length - 1;
				}
				setSelectedItemId(navigableItems[nextIndex].id);
			}

			// Cmd+Shift+S to sync
			if (e.key === "s" && e.metaKey && e.shiftKey && isLive) {
				e.preventDefault();
				handleSync();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedItemId, readingItemId, navigableItems, handleClear, handleRestore, handleSync, isLive, showArchive]);

	const visibleLaneList = COLUMN_LANES.filter((l) => visibleLanes.has(l));

	return (
		<div className="flex h-screen flex-col" style={{ backgroundColor: "#0f1729" }}>
			{/* Top bar */}
			<header className="px-5 py-3" style={{ borderBottom: "1px solid rgba(59, 130, 246, 0.15)" }}>
				<div className="flex items-center justify-between">
					{/* Left: branding */}
					<div className="flex items-center gap-2.5">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/image.png" alt="" width={28} height={28} />
						<h1 className="text-base font-bold tracking-tight text-white">Cortex</h1>
						{!isLive && (
							<span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
								Demo
							</span>
						)}
					</div>

					{/* Center: lane toggle buttons (3 column lanes only) */}
					<div className="flex items-center gap-2">
						{COLUMN_LANES.map((lane) => {
							const config = LANE_CONFIG[lane];
							const isActive = visibleLanes.has(lane);
							const count = laneItemCounts[lane] ?? 0;
							return (
								<button
									key={lane}
									onClick={() => toggleLane(lane)}
									className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all"
									style={{
										backgroundColor: isActive ? config.color + "25" : "transparent",
										color: isActive ? config.color : "#5a6a85",
										border: `1.5px solid ${isActive ? config.color + "50" : "#2a3a55"}`,
									}}
								>
									<div
										className="h-2.5 w-2.5 rounded-full transition-opacity"
										style={{
											backgroundColor: config.color,
											opacity: isActive ? 1 : 0.3,
										}}
									/>
									{config.shortLabel}
									<span style={{ opacity: 0.7 }}>{count}</span>
								</button>
							);
						})}
					</div>

					{/* Right: actions */}
					<div className="flex items-center gap-4">
						<button
							onClick={() => setShowArchive((v) => !v)}
							className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
							style={{
								backgroundColor: showArchive ? "rgba(59, 130, 246, 0.2)" : "transparent",
								color: showArchive ? "#93bbfc" : "#7a8ba5",
							}}
						>
							{showArchive ? "Archive" : "Inbox"}
						</button>

						{isLive && (
							<button
								onClick={handleSync}
								disabled={syncing}
								className="text-sm text-blue-300/70 hover:text-blue-200 transition-colors disabled:opacity-50"
							>
								{syncing ? "Syncing..." : "Sync"}
							</button>
						)}
						<kbd className="hidden text-xs text-muted-foreground lg:inline">
							↑↓ nav · Enter/click open · Esc close · ⌫ archive
						</kbd>
					</div>
				</div>
			</header>

			{/* Multi-column lanes (Reply, Action, Read) */}
			<main
				className="flex-1 overflow-hidden"
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(${visibleLaneList.length}, 1fr)`,
				}}
			>
				{visibleLaneList.map((lane, idx) => {
					const config = LANE_CONFIG[lane];
					return (
						<div
							key={lane}
							className="overflow-hidden"
							style={{
								backgroundColor: config.tint,
								borderRight: idx < visibleLaneList.length - 1
									? `1px solid ${config.divider}`
									: undefined,
							}}
						>
							<Lane
								lane={lane}
								items={filteredItems.filter((i) => i.lane === lane)}
								selectedItemId={selectedItemId}
								onSelectItem={(id) => setSelectedItemId(id)}
								onOpenItem={handleOpenItem}
								onClearItem={showArchive ? handleRestore : handleClear}
								onAddItem={handleAddItem}
								onMoveItem={handleMoveItem}
								isArchived={showArchive}
							/>
						</div>
					);
				})}
			</main>

			{/* Reference bin at the bottom */}
			<ReferenceBin
				items={referenceItems}
				selectedItemId={selectedItemId}
				onSelectItem={(id) => setSelectedItemId(id)}
				onOpenItem={handleOpenItem}
				onClearItem={showArchive ? handleRestore : handleClear}
				onAddItem={handleAddItem}
				onMoveItem={handleMoveItem}
				isArchived={showArchive}
			/>

			{/* Reading pane overlay */}
			{readingItem && (
				<ReadingPane
					item={readingItem}
					onClose={() => setReadingItemId(null)}
					onClear={() => handleClear(readingItem.id)}
				/>
			)}
		</div>
	);
}
