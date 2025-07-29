import { createContext, useContext } from "react";
import { ItemView, WorkspaceLeaf, App } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import AppComponent from "src/main/components/App";
import { IntraViewData, TableListSettings } from "../main";
import { SharedState } from "../sharedState";

export interface TableViewContext {
	app: App;
	loadData: () => unknown;
	saveData: (data: unknown) => Promise<void>;
	settings: TableListSettings;
	statusBarText: HTMLSpanElement;
	sharedState: SharedState<IntraViewData>;
}

export const TABLE_VIEW_TYPE = "table-view";

export const TableContext = createContext<TableViewContext | undefined>(undefined);

export const useTableContext = (): TableViewContext | undefined => {
	return useContext(TableContext);
};

export class TableView extends ItemView {
	root: Root | null = null;

	loadData: () => unknown;
	saveData: (data: unknown) => Promise<void>;
	settings: TableListSettings;
	statusBarText: HTMLSpanElement;
	sharedState: SharedState<IntraViewData>;

	constructor(
		leaf: WorkspaceLeaf,
		loadData: () => unknown,
		saveData: (data: unknown) => Promise<void>,
		settings: TableListSettings,
		statusBarText: HTMLSpanElement,
		sharedState: SharedState<IntraViewData>
	) {
		super(leaf);
		this.loadData = loadData;
		this.saveData = saveData;
		this.settings = settings;
		this.statusBarText = statusBarText;
		this.sharedState = sharedState;
	}

	getViewType() {
		return TABLE_VIEW_TYPE;
	}

	getDisplayText() {
		return "TableList";
	}

	getIcon() {
		return "table-2";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<TableContext.Provider
				value={{
					app: this.app,
					saveData: this.saveData,
					loadData: this.loadData,
					settings: this.settings,
					statusBarText: this.statusBarText,
					sharedState: this.sharedState,
				}}
			>
				<AppComponent />
			</TableContext.Provider>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
