"use client";

import { useState, useRef } from "react";
import type { Lane } from "@/types";

interface QuickAddProps {
	lane: Lane;
	onAdd: (title: string, lane: Lane) => void;
}

export function QuickAdd({ lane, onAdd }: QuickAddProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) return;
		onAdd(trimmed, lane);
		setValue("");
		setIsOpen(false);
	}

	if (!isOpen) {
		return (
			<button
				onClick={() => {
					setIsOpen(true);
					setTimeout(() => inputRef.current?.focus(), 0);
				}}
				className="w-full px-4 py-2 text-left text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
			>
				+ Add item
			</button>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="px-4 py-2">
			<input
				ref={inputRef}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={() => {
					if (!value.trim()) setIsOpen(false);
				}}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setValue("");
						setIsOpen(false);
					}
				}}
				placeholder="Add a task..."
				className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
				autoFocus
			/>
		</form>
	);
}
