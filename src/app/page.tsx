"use client";

import { useState, useCallback, useEffect } from "react";
import type { Item, Lane as LaneType } from "@/types";
import { Lane } from "@/components/dashboard/lane";

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
];

const LANES: LaneType[] = ["reply", "action", "read", "reference"];

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
	const [syncing, setSyncing] = useState(false);
	const [isLive, setIsLive] = useState(false); // true when using real data

	// Fetch real items on mount
	useEffect(() => {
		fetch("/api/items")
			.then((res) => {
				if (!res.ok) throw new Error("Not authenticated");
				return res.json();
			})
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					setItems(deserializeItems(data));
					setIsLive(true);
				}
				// If empty array but authed, still mark as live
				if (Array.isArray(data)) setIsLive(true);
			})
			.catch(() => {
				// Not authed or API error — keep mock data
			});
	}, []);

	const activeItems = items.filter((i) => i.status === "active");

	const handleClear = useCallback(
		async (id: string) => {
			// Optimistic update
			setItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, status: "cleared" as const, clearedAt: new Date() } : item
				)
			);
			setSelectedItemId(null);

			// Persist to API if live
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

	const handleAddItem = useCallback(
		async (title: string, lane: LaneType) => {
			if (isLive) {
				const res = await fetch("/api/items", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title, lane }),
				});
				if (res.ok) {
					const newItem = await res.json();
					setItems((prev) => [...prev, { ...newItem, receivedAt: null, createdAt: new Date(), updatedAt: new Date(), clearedAt: null }]);
				}
			} else {
				// Local-only mock add
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
				// Refetch items after sync
				const itemsRes = await fetch("/api/items");
				if (itemsRes.ok) {
					const data = await itemsRes.json();
					setItems(deserializeItems(data));
				}
			}
		} finally {
			setSyncing(false);
		}
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			if (e.key === "e" && selectedItemId) {
				e.preventDefault();
				handleClear(selectedItemId);
			}

			if (e.key === "j" || e.key === "k") {
				e.preventDefault();
				if (activeItems.length === 0) return;

				const currentIndex = selectedItemId
					? activeItems.findIndex((i) => i.id === selectedItemId)
					: -1;

				let nextIndex: number;
				if (e.key === "j") {
					nextIndex = currentIndex < activeItems.length - 1 ? currentIndex + 1 : 0;
				} else {
					nextIndex = currentIndex > 0 ? currentIndex - 1 : activeItems.length - 1;
				}
				setSelectedItemId(activeItems[nextIndex].id);
			}

			if (e.key === "Escape") {
				setSelectedItemId(null);
			}

			// Cmd+Shift+S to sync
			if (e.key === "s" && e.metaKey && e.shiftKey && isLive) {
				e.preventDefault();
				handleSync();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedItemId, activeItems, handleClear, handleSync, isLive]);

	return (
		<div className="min-h-screen bg-background">
			{/* Top bar */}
			<header className="border-b border-border/50 px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h1 className="text-sm font-bold tracking-tight">Cortex</h1>
						{!isLive && (
							<span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
								Demo
							</span>
						)}
					</div>
					<div className="flex items-center gap-4">
						{isLive && (
							<button
								onClick={handleSync}
								disabled={syncing}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
							>
								{syncing ? "Syncing..." : "Sync"}
							</button>
						)}
						<span className="text-xs text-muted-foreground tabular-nums">
							{activeItems.length} items
						</span>
						<kbd className="hidden text-[10px] text-muted-foreground/50 sm:inline">
							j/k navigate · e clear · esc deselect
						</kbd>
					</div>
				</div>
			</header>

			{/* Lanes */}
			<main className="divide-y divide-border/30">
				{LANES.map((lane) => (
					<Lane
						key={lane}
						lane={lane}
						items={activeItems.filter((i) => i.lane === lane)}
						selectedItemId={selectedItemId}
						onSelectItem={setSelectedItemId}
						onClearItem={handleClear}
						onAddItem={handleAddItem}
					/>
				))}
			</main>
		</div>
	);
}
