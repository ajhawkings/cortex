"use client";

import type { Item, Lane as LaneType } from "@/types";
import { LANE_CONFIG } from "@/types";
import { ItemRow } from "./item-row";

interface LaneProps {
	lane: LaneType;
	items: Item[];
	selectedItemId: string | null;
	onSelectItem: (id: string) => void;
	onClearItem: (id: string) => void;
}

export function Lane({ lane, items, selectedItemId, onSelectItem, onClearItem }: LaneProps) {
	const config = LANE_CONFIG[lane];

	return (
		<div className="space-y-0.5">
			{/* Lane header */}
			<div className="flex items-center justify-between px-3 py-2">
				<div className="flex items-center gap-2">
					<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						{config.label}
					</h2>
					<span className="text-xs text-muted-foreground/60 tabular-nums">
						{items.length}
					</span>
				</div>
			</div>

			{/* Items */}
			{items.length === 0 ? (
				<div className="px-3 py-4 text-center text-xs text-muted-foreground/50">
					Nothing here
				</div>
			) : (
				<div className="divide-y divide-border/50">
					{items.map((item) => (
						<ItemRow
							key={item.id}
							item={item}
							isSelected={item.id === selectedItemId}
							onSelect={() => onSelectItem(item.id)}
							onClear={() => onClearItem(item.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
