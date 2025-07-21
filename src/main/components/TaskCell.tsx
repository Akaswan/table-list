/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from "@headlessui/react";
import { useDraggable } from "@dnd-kit/core";
import { Task, TaskStatus } from "../types";
import { useEffect, useRef, useState } from "react";

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

const hexToRgba = (hex: string, alpha: number) => {
	const cleanHex = hex.replace("#", "");
	const bigint = parseInt(cleanHex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface TaskCellProps {
	task: Task;
	removeTask: (id: number) => void;
	inputRef: React.RefObject<HTMLTextAreaElement | null> | null; // keep it for type compatibility
	handleTaskNameChange: (id: number, newName: string) => void;
	projectName: string;
	status: TaskStatus;
	taskStatuses: TaskStatus[];
	editTaskStatus: (id: number, newStatusId: string) => void;
}

const TaskCell: React.FC<TaskCellProps> = ({
	task,
	removeTask,
	inputRef, // we won’t use this ref internally to fix your problem
	handleTaskNameChange,
	projectName,
	status,
	taskStatuses,
	editTaskStatus,
}) => {
	const taskBackground = `${status.color}33`;
	const lightTaskTextColor = transColor(status.color, 25);
	const placeholderColor = hexToRgba(lightTaskTextColor, 0.5);

	const [value, setValue] = useState(task.name);

	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: task.id,
	});

	// Use a local ref here instead of the passed inputRef
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"; // Reset first
			textareaRef.current.style.height =
				textareaRef.current.scrollHeight + "px"; // Then grow
		}
	}, [value]);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.focus();
			// Optional: move cursor to end
			const len = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(len, len);
		}
	}, []);

	return (
		<div
			ref={setNodeRef}
			className="task-cell"
			style={{
				backgroundColor: taskBackground,
				...(transform
					? {
							transform: `translate(${transform.x}px, ${transform.y}px)`,
					  }
					: {}),
			}}
		>
			<div
				className="task-cell-header"
				style={{
					backgroundColor: taskBackground,
					color: lightTaskTextColor,
				}}
			>
				{/* ✅ Only this part is draggable */}
				<div
					{...listeners}
					{...attributes}
					className="project-name-repeat"
					style={{
						cursor: "grab",
						userSelect: "none",
					}}
				>
					{projectName}
				</div>

				<Listbox
					value={status.id}
					onChange={(value) => editTaskStatus(task.id, value)}
				>
					<div className="relative">
						<ListboxButton
							className="task-cell-status-indicator"
							style={{
								border: `1px solid ${lightTaskTextColor}`,
								color: lightTaskTextColor,
							}}
						>
							{status.name}
						</ListboxButton>
						<ListboxOptions className="task-cell-dropdown-options">
							{taskStatuses.map((s) => (
								<ListboxOption
									key={s.id}
									value={s.id}
									className={({ active }) =>
										`task-cell-dropdown-option ${
											active ? "active" : ""
										}`
									}
								>
									{s.name}
								</ListboxOption>
							))}
						</ListboxOptions>
					</div>
				</Listbox>
			</div>

			<div className="task-cell-content">
				<textarea
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
						handleTaskNameChange(task.id, e.target.value);
					}}
					onBlur={(e) => {
						if (e.target.value === "") removeTask(task.id);
					}}
					ref={textareaRef} // use local ref here
					className={`task-input-${task.id}`}
					placeholder="Task name"
					style={{
						color: lightTaskTextColor,
						resize: "none",
						overflow: "hidden",
						height: "auto",
					}}
					rows={1}
				/>
				<style>{`
					.task-input-${task.id}::placeholder {
						color: ${placeholderColor};
					}
				`}</style>
			</div>
		</div>
	);
};

export default TaskCell;
