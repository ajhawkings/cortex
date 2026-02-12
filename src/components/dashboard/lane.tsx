"use client";

import { useState, useMemo } from "react";
import type { Item, Lane as LaneType } from "@/types";
import { LANE_CONFIG } from "@/types";
import { ItemRow } from "./item-row";
import { QuickAdd } from "./quick-add";

interface LaneProps {
	lane: LaneType;
	items: Item[];
	selectedItemId: string | null;
	onSelectItem: (id: string) => void;
	onOpenItem: (id: string) => void;
	onClearItem: (id: string) => void;
	onAddItem: (title: string, lane: LaneType) => void;
	onMoveItem?: (itemId: string, toLane: LaneType) => void;
	isArchived?: boolean;
}

export function Lane({ lane, items, selectedItemId, onSelectItem, onOpenItem, onClearItem, onAddItem, onMoveItem, isArchived }: LaneProps) {
	const config = LANE_CONFIG[lane];
	const [isDragOver, setIsDragOver] = useState(false);

	const { unread, read } = useMemo(() => {
		const unread: Item[] = [];
		const read: Item[] = [];
		for (const item of items) {
			if (item.type === "email" && !item.isRead) {
				unread.push(item);
			} else {
				read.push(item);
			}
		}
		return { unread, read };
	}, [items]);

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setIsDragOver(true);
	}

	function handleDragLeave() {
		setIsDragOver(false);
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setIsDragOver(false);
		const itemId = e.dataTransfer.getData("text/plain");
		if (itemId && onMoveItem) {
			onMoveItem(itemId, lane);
		}
	}

	function renderItem(item: Item) {
		return (
			<ItemRow
				key={item.id}
				item={item}
				lane={lane}
				isSelected={item.id === selectedItemId}
				onSelect={() => onSelectItem(item.id)}
				onOpen={() => onOpenItem(item.id)}
				onClear={() => onClearItem(item.id)}
				isArchived={isArchived}
			/>
		);
	}

	return (
		<div
			className="flex h-full flex-col transition-colors"
			style={{ backgroundColor: isDragOver ? config.tint : undefined }}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{/* Lane header */}
			<div
				className="flex items-center gap-2.5 px-4 py-3"
				style={{ borderBottom: `2px solid ${config.color}30` }}
			>
				<div
					className="h-3 w-3 rounded-full"
					style={{ backgroundColor: config.color }}
				/>
				<h2
					className="text-sm font-bold uppercase tracking-wider"
					style={{ color: config.color }}
				>
					{config.label}
				</h2>
				<span className="text-sm font-medium text-muted-foreground tabular-nums">
					{items.length}
				</span>
			</div>

			{/* Scrollable items list */}
			<div className="cortex-scrollbar flex-1 overflow-y-auto">
				{items.length > 0 ? (
					<div>
						{/* Unread section */}
						{unread.length > 0 && (
							<div>
								<div className="flex items-center gap-2 px-4 py-1.5">
									<div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
									<span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
										Unread
									</span>
									<span className="text-xs text-blue-400/60 tabular-nums">{unread.length}</span>
								</div>
								{unread.map(renderItem)}
							</div>
						)}

						{/* Separator between sections */}
						{unread.length > 0 && read.length > 0 && (
							<div className="mx-4 my-1" style={{ borderTop: `1px solid ${config.color}15` }} />
						)}

						{/* Read / everything else section */}
						{read.length > 0 && (
							<div>
								{unread.length > 0 && (
									<div className="flex items-center gap-2 px-4 py-1.5">
										<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
											Earlier
										</span>
									</div>
								)}
								{read.map(renderItem)}
							</div>
						)}
					</div>
				) : (
					<div className="px-4 py-10 text-center text-sm text-muted-foreground">
						{isDragOver ? "Drop here" : "No items"}
					</div>
				)}
			</div>

			{/* Quick add */}
			<div style={{ borderTop: `1px solid ${config.divider}` }}>
				<QuickAdd lane={lane} onAdd={onAddItem} />
			</div>
		</div>
	);
}
