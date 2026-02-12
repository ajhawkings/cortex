"use client";

import { useState, useRef } from "react";
import type { Item, Lane } from "@/types";
import { LANE_CONFIG } from "@/types";
import { ItemRow } from "./item-row";

const REF = LANE_CONFIG.reference;

interface ReferenceBinProps {
	items: Item[];
	selectedItemId: string | null;
	onSelectItem: (id: string) => void;
	onOpenItem: (id: string) => void;
	onClearItem: (id: string) => void;
	onAddItem: (title: string, lane: Lane) => void;
	onMoveItem?: (itemId: string, toLane: Lane) => void;
	isArchived?: boolean;
}

export function ReferenceBin({
	items,
	selectedItemId,
	onSelectItem,
	onOpenItem,
	onClearItem,
	onAddItem,
	onMoveItem,
	isArchived,
}: ReferenceBinProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [addValue, setAddValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setIsDragOver(true);
		if (!isExpanded) setIsExpanded(true);
	}

	function handleDragLeave(e: React.DragEvent) {
		// Only count leaves that actually exit the bin
		if (e.currentTarget.contains(e.relatedTarget as Node)) return;
		setIsDragOver(false);
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setIsDragOver(false);
		const itemId = e.dataTransfer.getData("text/plain");
		if (itemId && onMoveItem) {
			onMoveItem(itemId, "reference");
		}
	}

	function handleAddSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = addValue.trim();
		if (!trimmed) return;
		onAddItem(trimmed, "reference");
		setAddValue("");
		setIsAdding(false);
	}

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className="transition-colors"
			style={{
				borderTop: `2px solid ${REF.color}${isDragOver ? "60" : "30"}`,
				backgroundColor: isDragOver
					? "rgba(139, 92, 246, 0.1)"
					: "rgba(139, 92, 246, 0.03)",
			}}
		>
			{/* Header bar — always visible */}
			<button
				onClick={() => setIsExpanded((v) => !v)}
				className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/5"
			>
				{/* Folder icon */}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke={REF.color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
				</svg>

				<span
					className="text-sm font-bold uppercase tracking-wider"
					style={{ color: REF.color }}
				>
					Reference
				</span>

				<span className="text-sm text-muted-foreground tabular-nums">
					{items.length}
				</span>

				{/* Expand chevron */}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="ml-auto text-muted-foreground transition-transform"
					style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
				>
					<path d="m18 15-6-6-6 6" />
				</svg>
			</button>

			{/* Expanded content */}
			{isExpanded && (
				<div className="cortex-scrollbar overflow-y-auto" style={{ maxHeight: "280px" }}>
					{items.length > 0 ? (
						<div>
							{items.map((item) => (
								<ItemRow
									key={item.id}
									item={item}
									lane="reference"
									isSelected={item.id === selectedItemId}
									onSelect={() => onSelectItem(item.id)}
									onOpen={() => onOpenItem(item.id)}
									onClear={() => onClearItem(item.id)}
									compact
									isArchived={isArchived}
								/>
							))}
						</div>
					) : (
						<div className="px-5 py-6 text-center text-sm text-muted-foreground">
							Drop items here or add a reference
						</div>
					)}

					{/* Add reference */}
					<div className="px-5 py-2" style={{ borderTop: `1px solid ${REF.divider}` }}>
						{isAdding ? (
							<form onSubmit={handleAddSubmit} className="flex items-center gap-2">
								<input
									ref={inputRef}
									value={addValue}
									onChange={(e) => setAddValue(e.target.value)}
									onBlur={() => {
										if (!addValue.trim()) setIsAdding(false);
									}}
									onKeyDown={(e) => {
										if (e.key === "Escape") {
											setAddValue("");
											setIsAdding(false);
										}
									}}
									placeholder="Add a reference..."
									className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
									autoFocus
								/>
							</form>
						) : (
							<button
								onClick={() => {
									setIsAdding(true);
									setTimeout(() => inputRef.current?.focus(), 0);
								}}
								className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
							>
								+ Add reference
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
