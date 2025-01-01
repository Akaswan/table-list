import { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import Table from 'src/main/react/Table';

export const TABLE_VIEW_TYPE = 'table-view';

export class TableView extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return TABLE_VIEW_TYPE;
	}

	getDisplayText() {
		return 'TableList';
	}

	getIcon() {
		return 'table-2';
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<Table />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}