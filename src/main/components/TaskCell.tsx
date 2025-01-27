import { Task, TaskStatus } from "./App";

const transColor = (color: string, percent: number): string => {
	const num = parseInt(color.replace("#", ""), 16);
	const amt = Math.round(2.55 * percent);
	const R = (num >> 16) + amt;
	const B = ((num >> 8) & 0x00ff) + amt;
	const G = (num & 0x0000ff) + amt;
	return (
		"#" +
		(
			0x1000000 +
			(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
			(B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
			(G < 255 ? (G < 1 ? 0 : G) : 255)
		)
			.toString(16)
			.slice(1)
	);
};

interface TaskCellProps {
    task: Task;
    removeTask: (id: number) => void;
    inputRef: React.RefObject<HTMLInputElement | null> | null;
	handleTaskNameChange: (id: number, newName: string) => void;
	projectName: string;
	status: TaskStatus;
	taskStatuses: TaskStatus[];
	editTaskStatus: (id: number, newStatusId: string) => void;
}

const TaskCell: React.FC<TaskCellProps> = ({task, removeTask, inputRef, handleTaskNameChange, projectName, status, taskStatuses, editTaskStatus}) => {

	document.documentElement.style.setProperty("--task-color", status.color);
	document.documentElement.style.setProperty(
		"--task-background",
		`${status.color}33`
	);
	document.documentElement.style.setProperty(
		"--dark-task-text-color",
		transColor(status.color, -40)
	);
	document.documentElement.style.setProperty(
		"--light-task-text-color",
		transColor(status.color, 25)
	);
	document.documentElement.style.setProperty(
		"--light-task-background-color",
		`${transColor(status.color, 25)}33`
	);

	return (
		<div className="task-cell">
			<div className="task-cell-header">
				{projectName}
				<select className="task-cell-status-indicator" onChange={(e) => editTaskStatus(task.id, e.target.value)}>
					{taskStatuses.map((status) => (
						<option key={status.id} value={status.id} selected={status.id === task.status.id}>
							{status.name}
						</option>
					))}
				</select>
				</div>
			<div className="task-cell-content">
				<input
					placeholder="Task Name"
					onBlur={(e) => {
						if (e.target.value === "") removeTask(task.id);
					}}
                    ref={inputRef}
					onChange={(e) => handleTaskNameChange(task.id, e.target.value)}
					value={task.name}
				></input>
			</div>
		</div>
	);
};

export default TaskCell;
