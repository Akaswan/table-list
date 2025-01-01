import "styles.css";
import { format, addDays, startOfWeek } from "date-fns";
import { useEffect, useRef, useState } from "react";
import * as React from "react";

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

const getInitialProjects = () => {
	const projects: Project[] = [
		{
			id: 1,
			name: "Project 1",
			tasks: [
				{
					id: 1,
					name: "Task 1",
					date: new Date(),
					parentProjectId: 1,
				},
			],
		},
		{
			id: 2,
			name: "Project 2",
			tasks: [
				{
					id: 2,
					name: "Task 2",
					date: new Date(),
					parentProjectId: 2,
				},
			],
		},
	];
	return projects;
};

const Table: React.FC = () => {
	const [dates, setDates] = useState(getInitialDates);
	const [projects, setProjects] = useState(getInitialProjects);

	const containerRef = useRef<HTMLDivElement>(null);

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
		setProjects((prevProjects) =>
			prevProjects.map((project) =>
				project.id === id ? { ...project, name: newName } : project
			)
		);

		console.log(projects);
	};

	return (
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
	);
};

export default Table;
