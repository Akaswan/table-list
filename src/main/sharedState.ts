import { useSyncExternalStore } from "react";

export interface SharedState<T> {
	get: () => T;
	set: (next: Partial<T>) => void;
	subscribe: (callback: () => void) => () => void;
}

export function createSharedState<T extends object>(initialState: T): SharedState<T> {
	let current = { ...initialState };
	const listeners = new Set<() => void>();

	function get() {
		return current;
	}

	function set(partial: Partial<T>) {
		current = { ...current, ...partial };
		for (const listener of listeners) listener();
	}

	function subscribe(callback: () => void) {
		listeners.add(callback);
		return () => listeners.delete(callback);
	}

	return { get, set, subscribe };
}

export function useSharedState<T>(shared: SharedState<T>): T {
	return useSyncExternalStore(shared.subscribe, shared.get, shared.get);
}
