import { format, parseISO } from "date-fns";
import { useEffect, useRef } from "react";
import * as React from "react";
import { Project, TaskStatus } from "./App";
import TaskCell from "./TaskCell";

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
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const newProjectInputRef = useRef<HTMLInputElement | null>(null);
	const newTaskInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const handleResize = () => {
			const containerWidth = containerRef.current?.clientWidth;
			if (containerWidth) {
				document.documentElement.style.setProperty(
					"--taskcell-enclosure-width",
					`${(containerWidth - 128) / 5}px`
				);
			}
		};

		const resizeObserver = new ResizeObserver(handleResize);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		// Initial call to set the variable
		handleResize();

		return () => {
			if (containerRef.current) {
				resizeObserver.unobserve(containerRef.current);
			}
		};
	}, [containerRef]);

	return (
		<div>
			<div className="table-container" ref={containerRef}>
				<table className="table headings-center">
					<thead className="table-header">
						<tr>
							<th>Projects</th>
							{dates.map((date) => {
								const dateObj = parseISO(date);
								return (
									<th className="date" key={date}>
										<div className="date-header">
											<div>{format(dateObj, "EEEE")}</div>
											<div>
												{format(dateObj, "yyyy-MM-dd")}
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
								<td key={project.id} className="project-column">
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
									<td
										className="taskcell-enclosure"
										key={`${project.id}:${date}:${index}`}
										onClick={(e) => {
											if (e.target === e.currentTarget) {
												addTaskToProject(project, date);
												setTimeout(() => {
													if (
														newTaskInputRef.current
													) {
														newTaskInputRef.current.focus();
													}
												}, 0);
											}
										}}
									>
										{project.tasks
											.filter(
												(task) =>
													new Date(
														task.date
													).toISOString() ===
													new Date(date).toISOString()
											)
											.map((task) => (
												<TaskCell
													task={task}
													projectName={project.name}
													removeTask={removeTask}
													key={task.id}
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
													taskStatuses={taskStatuses}
													editTaskStatus={
														editTaskStatus
													}
												/>
											))}
									</td>
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
						createNewProject(e.target.value, newProjectInputRef);
						e.target.value = "";
					}}
				/>
			</div>
		</div>
	);
};

export default Table;
