import { createContext, useContext } from 'react';
import { ItemView, WorkspaceLeaf, App } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import AppComponent from 'src/main/components/App';

export interface AppContext {
	app: App;
	loadData: () => any;
	saveData: (data: any) => Promise<void>;
}

export const TABLE_VIEW_TYPE = 'table-view';

export const TableContext = createContext<AppContext | undefined>(undefined);

export const useTableContext = (): AppContext | undefined => {
	return useContext(TableContext);
};

export class TableView extends ItemView {
	root: Root | null = null;

	loadData: () => any;
	saveData: (data: any) => Promise<void>;

	constructor(leaf: WorkspaceLeaf, loadData: () => any, saveData: (data: any) => Promise<void>) {
		super(leaf);
		this.loadData = loadData;
		this.saveData = saveData;
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
			<TableContext.Provider value={{app: this.app, saveData: this.saveData, loadData: this.loadData}}>
				<AppComponent />
			</TableContext.Provider>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}