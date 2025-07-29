import { createContext } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import TaskEditor from "../components/TaskEditor";
import { SharedState } from "../sharedState";
import { IntraViewData } from "../main";

export const TASK_EDITOR_VIEW_TYPE = "task-editor-sidebar-view";

// Context shared between React components
export const TaskEditorContext = createContext<{
	loadData: () => unknown;
	saveData: (data: unknown) => Promise<void>;
	sharedState: SharedState<IntraViewData>;
} | null>(null);

export class TaskEditorView extends ItemView {
	root: Root | null = null;

	loadData: () => unknown;
	saveData: (data: unknown) => Promise<void>;
	sharedState: SharedState<IntraViewData>;

	constructor(
		leaf: WorkspaceLeaf,
		sharedState: SharedState<IntraViewData>,
		loadData: () => unknown,
		saveData: (data: unknown) => Promise<void>
	) {
		super(leaf);
		this.loadData = loadData;
		this.saveData = saveData;
		this.sharedState = sharedState;
	}

	getViewType() {
		return TASK_EDITOR_VIEW_TYPE;
	}

	getDisplayText() {
		return "Task Editor";
	}

	getIcon() {
		return "rectangle-horizontal";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<TaskEditorContext.Provider
				value={{
					sharedState: this.sharedState,
					loadData: this.loadData,
					saveData: this.saveData,
				}}
			>
				<TaskEditor />
			</TaskEditorContext.Provider>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
