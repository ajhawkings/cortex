"use client";

import { useState, useCallback, useEffect } from "react";
import type { Item, Lane as LaneType } from "@/types";
import { Lane } from "@/components/dashboard/lane";

// Mock data for UI development — will be replaced with real data from D1
const MOCK_ITEMS: Item[] = [
	{
		id: "1",
		userId: "u1",
		type: "email",
		lane: "reply",
		status: "active",
		title: "Re: Project proposal feedback",
		snippet: "Thanks for sending this over. I had a few thoughts on the timeline...",
		isRead: false,
		gmailMessageId: "msg1",
		gmailThreadId: "t1",
		fromEmail: "sarah@example.com",
		fromName: "Sarah Chen",
		receivedAt: new Date(Date.now() - 1000 * 60 * 15),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "2",
		userId: "u1",
		type: "email",
		lane: "reply",
		status: "active",
		title: "Dinner on Friday?",
		snippet: "Hey! Are you free this Friday for dinner? Thinking of trying that new place...",
		isRead: false,
		gmailMessageId: "msg2",
		gmailThreadId: "t2",
		fromEmail: "james@example.com",
		fromName: "James",
		receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "3",
		userId: "u1",
		type: "email",
		lane: "reply",
		status: "active",
		title: "Quick question about the API",
		snippet: "Hey, I noticed the /users endpoint returns 403 when...",
		isRead: true,
		gmailMessageId: "msg3",
		gmailThreadId: "t3",
		fromEmail: "dev@company.com",
		fromName: "Tom (Engineering)",
		receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "4",
		userId: "u1",
		type: "email",
		lane: "action",
		status: "active",
		title: "Invoice #4521 — Payment due",
		snippet: "Your invoice for January is ready. Amount: £340.00. Due by Feb 15.",
		isRead: true,
		gmailMessageId: "msg4",
		gmailThreadId: "t4",
		fromEmail: "billing@service.com",
		fromName: "Billing",
		receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "5",
		userId: "u1",
		type: "task",
		lane: "action",
		status: "active",
		title: "Book dentist appointment",
		snippet: null,
		isRead: true,
		gmailMessageId: null,
		gmailThreadId: null,
		fromEmail: null,
		fromName: null,
		receivedAt: null,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "6",
		userId: "u1",
		type: "task",
		lane: "action",
		status: "active",
		title: "Submit coursework by Thursday",
		snippet: "Module CS3420 — final submission",
		isRead: true,
		gmailMessageId: null,
		gmailThreadId: null,
		fromEmail: null,
		fromName: null,
		receivedAt: null,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "7",
		userId: "u1",
		type: "email",
		lane: "read",
		status: "active",
		title: "This Week in AI — Issue #147",
		snippet: "OpenAI announces GPT-5, Google releases Gemini 2.5, and more...",
		isRead: false,
		gmailMessageId: "msg7",
		gmailThreadId: "t7",
		fromEmail: "newsletter@weekinai.com",
		fromName: "This Week in AI",
		receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "8",
		userId: "u1",
		type: "email",
		lane: "read",
		status: "active",
		title: "How we scaled our Postgres to 1M queries/sec",
		snippet: "A deep dive into connection pooling, read replicas, and query optimization...",
		isRead: false,
		gmailMessageId: "msg8",
		gmailThreadId: "t8",
		fromEmail: "hello@blog.example.com",
		fromName: "Tech Blog Weekly",
		receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "9",
		userId: "u1",
		type: "email",
		lane: "reference",
		status: "active",
		title: "Your flight confirmation — LHR to BCN",
		snippet: "Booking ref: ABC123. Departs 8 Mar 06:45. Terminal 5.",
		isRead: true,
		gmailMessageId: "msg9",
		gmailThreadId: "t9",
		fromEmail: "bookings@airline.com",
		fromName: "British Airways",
		receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
	{
		id: "10",
		userId: "u1",
		type: "email",
		lane: "reference",
		status: "active",
		title: "Your order has shipped",
		snippet: "Tracking number: 1Z999AA10123456784. Estimated delivery: Feb 14.",
		isRead: true,
		gmailMessageId: "msg10",
		gmailThreadId: "t10",
		fromEmail: "orders@amazon.co.uk",
		fromName: "Amazon",
		receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
		createdAt: new Date(),
		updatedAt: new Date(),
		clearedAt: null,
	},
];

const LANES: LaneType[] = ["reply", "action", "read", "reference"];

export default function Dashboard() {
	const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

	const activeItems = items.filter((i) => i.status === "active");

	const handleClear = useCallback((id: string) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === id ? { ...item, status: "cleared" as const, clearedAt: new Date() } : item
			)
		);
		setSelectedItemId(null);
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			// Don't capture shortcuts when typing in an input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			if (e.key === "e" && selectedItemId) {
				e.preventDefault();
				handleClear(selectedItemId);
			}

			if (e.key === "j" || e.key === "k") {
				e.preventDefault();
				const allActive = activeItems;
				if (allActive.length === 0) return;

				const currentIndex = selectedItemId
					? allActive.findIndex((i) => i.id === selectedItemId)
					: -1;

				let nextIndex: number;
				if (e.key === "j") {
					nextIndex = currentIndex < allActive.length - 1 ? currentIndex + 1 : 0;
				} else {
					nextIndex = currentIndex > 0 ? currentIndex - 1 : allActive.length - 1;
				}
				setSelectedItemId(allActive[nextIndex].id);
			}

			if (e.key === "Escape") {
				setSelectedItemId(null);
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedItemId, activeItems, handleClear]);

	return (
		<div className="min-h-screen bg-background">
			{/* Top bar */}
			<header className="border-b border-border/50 px-4 py-3">
				<div className="flex items-center justify-between">
					<h1 className="text-sm font-bold tracking-tight">Cortex</h1>
					<div className="flex items-center gap-4">
						<span className="text-xs text-muted-foreground">
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
					/>
				))}
			</main>
		</div>
	);
}
