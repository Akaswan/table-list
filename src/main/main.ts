import { Plugin, WorkspaceLeaf } from "obsidian";
import { TableView, TABLE_VIEW_TYPE } from "./views/TableView";
import { TableListSettingsTab } from "./settings";

export interface TableListSettings {
	maxDates: string;
}

const DEFAULT_SETTINGS: Partial<TableListSettings> = {
	maxDates: "7",
};

export default class TableList extends Plugin {
	settings: TableListSettings;

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		let data = await this.loadData();

		await this.loadSettings();

		this.addSettingTab(new TableListSettingsTab(this.app, this));

		const statusBarNotifier = this.addStatusBarItem();

		const statusBarText = statusBarNotifier.createEl('span');

		if (!(await data)) {
			data = {
				projects: [],
				nextProjectId: 0,
				nextTaskId: 0,
				lastUpdated: new Date().toISOString(),
			};

			this.saveData(data);
		}

		this.registerEvent(
			this.app.workspace.on(
				"active-leaf-change",
				async () => (data = await this.loadData())
			)
		);

		this.registerView(
			TABLE_VIEW_TYPE,
			(leaf) =>
				new TableView(
					leaf,
					() => data,
					(data) => this.saveData(data),
					this.settings,
					statusBarText
				)
		);

		this.addRibbonIcon("table-2", "Activate view", () => {
			this.activateView();
		});

		// if (!this.app.vault.getFolderByPath("TableList")) {
		// 	this.app.vault.createFolder("TableList");
		// } else {
		// 	console.log("Folder already exists");
		// }
	}

	async onunload() {}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(TABLE_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getLeaf(false);
			if (leaf) {
				await leaf.setViewState({
					type: TABLE_VIEW_TYPE,
					active: true,
				});
			}
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
