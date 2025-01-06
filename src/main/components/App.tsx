import { useEffect, useState } from "react";
import { useTableContext } from "../views/TableView";
import Table from "./Table";
import TopBar from "./TopBar";
import { format, addDays, startOfWeek, subDays } from "date-fns";
import { stat } from "fs";

export interface Project {
	id: number;
	name: string;
	tasks: Task[];
}

export interface Task {
	id: number;
	name: string;
	date: Date;
	parentProjectId: number;
	status: TaskStatus;
}

export interface TaskStatus {
	name: string;
	id: string;
	color: string;
}

const getWeekDates = (date: Date) => {
	const startDate = startOfWeek(date, { weekStartsOn: 1 });
	const dates = Array.from({ length: 7 }, (_, i) => {
		return format(addDays(startDate, i), "yyyy-MM-dd");
	});
	return dates;
};

const getTaskStatuses = () => {
	return [
		{ name: "Havent Started", id: "havent-started", color: "#FF0000" },
		{ name: "In Progress", id: "in-progress", color: "#FF8800" },
		{ name: "Completed", id: "completed", color: "#35CC70" },
	];
}

const App: React.FC = () => {
	const tableContext = useTableContext();

	const [dates, setDates] = useState(getWeekDates(new Date()));

	const [data, setData] = useState(() => tableContext!.loadData());

	const [taskStatuses, setTaskStatuses] = useState(getTaskStatuses());

	const [projects, setProjects] = useState(
		() => tableContext!.loadData().projects as Project[]
	);
	const [nextProjectId, setNextProjectId] = useState(
		() => tableContext!.loadData().nextProjectId as number
	);
	const [nextTaskId, setNextTaskId] = useState(
		() => tableContext!.loadData().nextProjectId as number
	);

	const incrementDates = () => {
		setDates((prevDates) => {
			const newDates = getWeekDates(addDays(new Date(prevDates[0]), 8));
			return newDates;
		});
	};
	
	const decrementDates = () => {
		setDates((prevDates) => {
			const newDates = getWeekDates(subDays(new Date(prevDates[0]), 6));
			return newDates;
		});
	};

	const setDatesToThisWeek = () => {
		setDates((prevDates) => {
			const newDates = getWeekDates(new Date());
			return newDates;
		});
	};

	const handleProjectNameChange = (id: number, newName: string) => {
		setProjects((prevProjects) => {
			const newProjects = prevProjects.map((project) =>
				project.id === id ? { ...project, name: newName } : project
			);
			saveSpecificData("projects", newProjects);
			return newProjects;
		});
	};

	const handleTaskNameChange = (id: number, newName: string) => {
		setProjects((prevProjects) => {
			const newProjects = prevProjects.map((project) => {
				const newTasks = project.tasks.map((task) =>
					task.id === id ? { ...task, name: newName } : task
				);
				return { ...project, tasks: newTasks };
			});
			saveSpecificData("projects", newProjects);
			return newProjects;
		});
	}

	const removeProject = (id: number) => {
		setProjects((prevProjects) => {
			const newProjects = prevProjects.filter(
				(project) => project.id !== id
			);
			saveSpecificData("projects", newProjects);
			return newProjects;
		});
	};

	const removeTask = (id: number) => {
		setProjects((prevProjects) => {
			const newProjects = prevProjects.map((project) => {
				const newTasks = project.tasks.filter((task) => task.id !== id);
				return { ...project, tasks: newTasks };
			});
			saveSpecificData("projects", newProjects);
			return newProjects;
		});
	};

	const editTaskStatus = (id: number, newStatusId: string) => {
		setProjects((prevProjects) => {
			const newProjects = prevProjects.map((project) => {
				const newTasks = project.tasks.map((task) =>
					task.id === id
						? {
								...task,
								status: taskStatuses.find(
									(status) => status.id === newStatusId
								) as TaskStatus,
						  }
						: task
				);
				return { ...project, tasks: newTasks };
			});
			saveSpecificData("projects", newProjects);
			return newProjects;
		});
	}

	const createNewProject = (
		newName: string,
		newProjectInputRef: React.RefObject<HTMLInputElement | null>
	) => {
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

	const addTaskToProject = (project: Project, date: string) => {
		const newTask = {
			id: nextTaskId,
			name: "",
			date: new Date(date),
			parentProjectId: project.id,
			status: taskStatuses[0],
		};

		setProjects((prevProjects) => {
			const newProjects = prevProjects.map((p) => {
				if (p.id === project.id) {
					return { ...p, tasks: [...p.tasks, newTask] };
				}
				return p;
			});

			saveSpecificData("projects", newProjects);

			return newProjects;
		});

		setNextTaskId((prevId) => {
			const newId = prevId + 1;
			saveSpecificData("nextTaskId", newId);
			return newId;
		});
	};

	const saveSpecificData = (key: string, value: any): void => {
		setData((prevData: any) => {
			const newData = { ...prevData, [key]: value };
			return newData;
		});
	};

	useEffect(() => {
		if (tableContext) {
			tableContext.saveData(data);
		} else {
			console.log("not exist");
		}
	}, [projects, nextProjectId]);

	return (
		<div className="app-wrapper">
			<TopBar
				incrementDates={incrementDates}
				decrementDates={decrementDates}
				setDatesToThisWeek={setDatesToThisWeek}
			/>
			<Table
				projects={projects}
				nextProjectId={nextProjectId}
				handleProjectNameChange={handleProjectNameChange}
				createNewProject={createNewProject}
				dates={dates}
				addTaskToProject={addTaskToProject}
				removeProject={removeProject}
				removeTask={removeTask}
				nextTaskId={nextTaskId}
				handleTaskNameChange={handleTaskNameChange}
				taskStatuses={taskStatuses}
				editTaskStatus={editTaskStatus}
			/>
		</div>
	);
};

export default App;
