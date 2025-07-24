import { format, parseISO } from "date-fns";
import { useRef } from "react";
import * as React from "react";
import TaskCell from "./TaskCell";
import { DndContext, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { Project, TaskStatus } from "../types";

interface TableProps {
	projects: Project[];
	nextProjectId: number;
	handleProjectNameChange: (id: number, newName: string) => void;
	createNewProject: (
		newName: string,
		newProjectInputRef: React.RefObject<HTMLInputElement | null>
	) => void;
	dates: string[];
	addTaskToProject: (project: Project, date: string) => void;
	removeProject: (id: number) => void;
	removeTask: (id: number) => void;
	nextTaskId: number;
	handleTaskNameChange: (id: number, newName: string) => void;
	taskStatuses: TaskStatus[];
	editTaskStatus: (id: number, newStatusId: string) => void;
	moveTask: (taskId: number, newDate: string) => void;
	wrapperRef: React.RefObject<HTMLDivElement | null>;
}

function DroppableCell({
	id,
	children,
	onClick,
}: {
	id: string;
	children: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLTableCellElement>;
}) {
	const { setNodeRef } = useDroppable({ id });

	return (
		<td
			ref={setNodeRef}
			className="taskcell-enclosure"
			data-droppable-id={id}
			onClick={onClick}
		>
			{children}
		</td>
	);
}

const Table: React.FC<TableProps> = ({
	projects,
	nextProjectId,
	handleProjectNameChange,
	createNewProject,
	dates,
	addTaskToProject,
	removeProject,
	removeTask,
	nextTaskId,
	handleTaskNameChange,
	taskStatuses,
	editTaskStatus,
	moveTask,
	wrapperRef,
}) => {
	const newProjectInputRef = useRef<HTMLInputElement | null>(null);
	const newTaskInputRef = useRef<HTMLTextAreaElement | null>(null);

	return (
		<DndContext
			onDragEnd={(event: DragEndEvent) => {
				const { active, over } = event;
				if (!over || active.id === over.id) return;

				const taskId = Number(active.id);
				const [, newDate] = String(over.id).split("::");

				moveTask(taskId, newDate);
			}}
		>
			<div>
				<div className="table-container">
					<table className="table headings-center">
						<thead className="table-header">
							<tr>
								<th>Projects</th>
								{dates.map((date) => {
									const dateObj = parseISO(date);
									return (
										<th className="date" key={date}>
											<div className="date-header">
												<div>
													{format(dateObj, "EEEE")}
												</div>
												<div>
													{format(
														dateObj,
														"yyyy-MM-dd"
													)}
												</div>
											</div>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{projects.map((project) => (
								<tr key={project.id}>
									<td
										key={project.id}
										className="project-column"
									>
										<input
											ref={
												project.id === nextProjectId - 1
													? newProjectInputRef
													: null
											}
											type="text"
											value={project.name}
											className="project-input"
											placeholder="New project"
											onBlur={(e) => {
												if (e.target.value === "")
													removeProject(project.id);
											}}
											onChange={(e) =>
												handleProjectNameChange(
													project.id,
													e.target.value
												)
											}
										/>
									</td>
									{dates.map((date, index) => (
										<DroppableCell
											id={`${project.id}::${date}`}
											onClick={(e) => {
												if (
													e.target === e.currentTarget
												) {
													addTaskToProject(
														project,
														date
													);
													setTimeout(() => {
														newTaskInputRef.current?.focus();
													}, 0);
												}
											}}
											key={`${project.id}-${date}`} // ADD KEY HERE
										>
											{project.tasks
												.filter(
													(task) =>
														new Date(
															task.date
														).toISOString() ===
														new Date(
															date
														).toISOString()
												)
												.map((task) => (
													<TaskCell
														key={task.id}
														task={task}
														autoFocus={task.id === nextTaskId - 1 && task.name === ""}
														projectName={
															project.name
														}
														removeTask={removeTask}
														inputRef={
															task.id ===
															nextTaskId - 1
																? newTaskInputRef
																: null
														}
														handleTaskNameChange={
															handleTaskNameChange
														}
														status={task.status}
														taskStatuses={
															taskStatuses
														}
														editTaskStatus={
															editTaskStatus
														}
													/>
												))}
										</DroppableCell>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="new-project-container">
					<input
						type="text"
						className="project-input"
						placeholder="New project"
						onChange={(e) => {
							createNewProject(
								e.target.value,
								newProjectInputRef
							);
							e.target.value = "";
						}}
					/>
				</div>
			</div>
		</DndContext>
	);
};

export default Table;
