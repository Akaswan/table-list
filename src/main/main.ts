import { Plugin, WorkspaceLeaf } from "obsidian";
import { TableView, TABLE_VIEW_TYPE } from "./views/TableView";

export default class TableList extends Plugin {
	async onload() {
		let data = await this.loadData();

		if (!(await data)) {
			data = {
				projects: [],
				nextProjectId: 0,
			};

			this.saveData(data);
		}

		this.app.workspace.on(
			"active-leaf-change",
			async () => (data = await this.loadData())
		);

		this.registerView(
			TABLE_VIEW_TYPE,
			(leaf) => new TableView(leaf, () => data, (data) => this.saveData(data))
		);

		this.addRibbonIcon("table-2", "Activate view", () => {
			this.activateView();
		});

		if (!this.app.vault.getFolderByPath("TableList")) {
			this.app.vault.createFolder("TableList");
		} else {
			console.log("Folder already exists");
		}
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
