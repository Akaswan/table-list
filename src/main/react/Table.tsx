// import "styles.css";
import { format, addDays, startOfWeek } from "date-fns";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { useTableContext } from "../views/TableView";

interface Project {
	id: number;
	name: string;
	tasks: Task[];
}

interface Task {
	id: number;
	name: string;
	date: Date;
	parentProjectId: number;
}

const getInitialDates = () => {
	const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
	const dates = Array.from({ length: 7 }, (_, i) => {
		return format(addDays(startDate, i), "yyyy-MM-dd");
	});
	return dates;
};

const Table: React.FC = () => {
	const tableContext = useTableContext();

	const [data, setData] = useState(() => tableContext!.loadData());

	const [dates, setDates] = useState(getInitialDates);

	const [projects, setProjects] = useState(
		() => tableContext!.loadData().projects as Project[]
	);
	const [nextProjectId, setNextProjectId] = useState(
		() => tableContext!.loadData().nextProjectId as number
	);

	const containerRef = useRef<HTMLDivElement>(null);
	const newProjectInputRef = useRef<HTMLInputElement | null>(null);

	const saveSpecificData = (key: string, value: any): void => {
		setData((prevData: any) => {
			const newData = { ...prevData, [key]: value };
			return newData;
		});
	};

	useEffect(() => {
		const handleResize = () => {
			const containerWidth = containerRef.current?.clientWidth;
			if (containerWidth) {
				document.documentElement.style.setProperty(
					"--taskcell-enclosure-width",
					`${(containerWidth - 128) / 7}px`
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

	const handleProjectNameChange = (id: number, newName: string) => {
		if (!newName.trim()) {
			setProjects((prevProjects) => {
				const newProjects = prevProjects.filter(
					(project) => project.id !== id
				);
				saveSpecificData("projects", newProjects);
				return newProjects;
			});
		} else {
			setProjects((prevProjects) => {
				const newProjects = prevProjects.map((project) =>
					project.id === id ? { ...project, name: newName } : project
				);
				saveSpecificData("projects", newProjects);
				return newProjects;
			});
		}
	};

	const createNewProject = (newName: string) => {
		if (!newName.trim()) return;
		setProjects((prevProjects) => {
			const newProjects = [
				...prevProjects,
				{ id: nextProjectId, name: newName, tasks: [] },
			];

			saveSpecificData("projects", newProjects);

			return newProjects;
		});

		setNextProjectId((prevId) => {
			const newId = prevId + 1;
			saveSpecificData("nextProjectId", newId);
			return newId;
		});

		setTimeout(() => {
			if (newProjectInputRef.current) {
				newProjectInputRef.current.focus();
			}
		}, 0);
	};

	useEffect(() => {
		if (tableContext) {
			tableContext.saveData(data);
		} else {
			console.log("not exist");
		}
	}, [projects, nextProjectId]);

	return (
		<div>
			<div className="table-container" ref={containerRef}>
				<table className="table headings-center">
					<thead className="table-header">
						<tr>
							<th>Projects</th>
							{dates.map((date) => (
								<th className="date" key={date}>{`${format(
									date,
									"EEEE"
								)} - ${format(date, "yyyy-MM-dd")}`}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{projects.map((project) => (
							<tr key={project.id}>
								<td key={project.id}>
									<input
										ref={
											project.id === nextProjectId - 1
												? newProjectInputRef
												: null
										} // Attach ref to the newly created project
										type="text"
										value={project.name}
										className="project-input"
										placeholder="New Project"
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
									></td>
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
					placeholder="New Project"
					onChange={(e) => {
						createNewProject(e.target.value);
						e.target.value = "";
					}}
				/>
			</div>
		</div>
	);
};

export default Table;
