import { useContext, useState } from "react";
import { TaskEditorContext } from "../views/TaskEditorView";
import { useSharedState } from "../sharedState";
import { TableData } from "../types";

const TaskEditor: React.FC = () => {
	const ctx = useContext(TaskEditorContext);
	const shared = ctx?.sharedState;
	const state = shared ? useSharedState(shared) : null;

	if (!state) return <div>Loading...</div>;

    const getInitialData = (): TableData => {
		const loaded = ctx?.loadData?.();
		if (
			loaded &&
			typeof loaded === "object" &&
			"projects" in loaded &&
			"nextProjectId" in loaded &&
			"nextTaskId" in loaded &&
			"lastUpdated" in loaded
		) {
			return loaded as TableData;
		}
		return {
			projects: [],
			nextProjectId: 1,
			nextTaskId: 1,
			lastUpdated: new Date().toISOString(),
		};
	};

    const [data, setData] = useState<TableData>(getInitialData);

    const tasks = data.projects.flatMap(project => project.tasks);

    const selectedTask = tasks.find(task => task.id === state.selectedTaskId);

	return (
		<div className="task-editor">
			<p>{selectedTask?.name}</p>
		</div>
	);
};

export default TaskEditor;
