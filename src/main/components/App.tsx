/* eslint-disable no-mixed-spaces-and-tabs */
import { useCallback, useEffect, useRef, useState } from "react";
import { useTableContext } from "../views/TableView";
import Table from "./Table";
import TopBar from "./TopBar";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import { Project, TableData, Task, TaskStatus } from "../types";

/** Supabase Setup **/
const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Utility Functions **/
const getWeekDates = (startDate: Date, numDates: number) =>
	Array.from({ length: numDates }, (_, i) =>
		format(addDays(startDate, i), "yyyy-MM-dd")
	);

const getTaskStatuses = (): TaskStatus[] => [
	{ name: "Havent started", id: "havent-started", color: "#FF0000" },
	{ name: "In progress", id: "in-progress", color: "#FF8800" },
	{ name: "Completed", id: "completed", color: "#35CC70" },
];

/** App Component **/
const App: React.FC = () => {
	/** Context and Refs **/
	const tableContext = useTableContext();

	const getInitialData = (): TableData => {
		const loaded = tableContext?.loadData?.();
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

	/** State **/
	const [datesShown, setDatesShown] = useState(5);
	const [dates, setDates] = useState(getWeekDates(new Date(), 5));
	const [data, setData] = useState<TableData>(getInitialData);
	const [projects, setProjects] = useState<Project[]>(
		() => getInitialData().projects
	);
	const [nextProjectId, setNextProjectId] = useState(
		() => getInitialData().nextProjectId
	);
	const [nextTaskId, setNextTaskId] = useState(
		() => getInitialData().nextTaskId
	);
	const [taskStatuses] = useState(getTaskStatuses);
	const [dirty, setDirty] = useState(false);
	const dataRef = useRef<TableData>(getInitialData());
	const wrapperRef = useRef<HTMLDivElement>(null);

	const maxDates = parseInt(tableContext?.settings.maxDates ?? "7");

	/** Date Controls **/
	const incrementDates = () =>
		setDates(getWeekDates(addDays(new Date(dates[0]), 2), datesShown));
	const decrementDates = () =>
		setDates(getWeekDates(subDays(new Date(dates[0]), 0), datesShown));
	const setDatesToThisWeek = () =>
		setDates(getWeekDates(new Date(), datesShown));

	/** Data Handlers **/
	const saveSpecificData = (key: keyof TableData, value: unknown): void => {
		setDirty(true);
		setData((prev) => ({
			...prev,
			[key]: value,
			lastUpdated: new Date().toISOString(),
		}));
	};

	const handleProjectNameChange = (id: number, newName: string) => {
		const newProjects = projects.map((p) =>
			p.id === id ? { ...p, name: newName } : p
		);
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);
	};

	const handleTaskNameChange = (id: number, newName: string) => {
		const newProjects = projects.map((p) => ({
			...p,
			tasks: p.tasks.map((t) =>
				t.id === id ? { ...t, name: newName } : t
			),
		}));
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);
	};

	const removeProject = (id: number) => {
		const newProjects = projects.filter((p) => p.id !== id);
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);
	};

	const removeTask = (id: number) => {
		const newProjects = projects.map((p) => ({
			...p,
			tasks: p.tasks.filter((t) => t.id !== id),
		}));
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);
	};

	const editTaskStatus = (id: number, newStatusId: string) => {
		const newProjects = projects.map((p) => ({
			...p,
			tasks: p.tasks.map((t) =>
				t.id === id
					? {
							...t,
							status:
								taskStatuses.find(
									(s) => s.id === newStatusId
								) ?? t.status,
					  }
					: t
			),
		}));
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);
	};

	const moveTask = (id: number, newDate: string) => {
		const newProjects = projects.map((p) => ({
			...p,
			tasks: p.tasks.map((t) =>
				t.id === id ? { ...t, date: new Date(newDate) } : t
			),
		}));
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);
	};

	const createNewProject = (
		name: string,
		ref: React.RefObject<HTMLInputElement>
	) => {
		if (!name.trim()) return;
		const newProjects = [
			...projects,
			{ id: nextProjectId, name, tasks: [] },
		];
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);

		const newId = nextProjectId + 1;
		saveSpecificData("nextProjectId", newId);
		setNextProjectId(newId);

		setTimeout(() => ref.current?.focus(), 0);
	};

	const addTaskToProject = (project: Project, date: string) => {
		const newTask: Task = {
			id: nextTaskId,
			name: "",
			date: new Date(date),
			parentProjectId: project.id,
			status: taskStatuses[0],
		};

		const newProjects = projects.map((p) =>
			p.id === project.id ? { ...p, tasks: [...p.tasks, newTask] } : p
		);
		saveSpecificData("projects", newProjects);
		setProjects(newProjects);

		const newId = nextTaskId + 1;
		saveSpecificData("nextTaskId", newId);
		setNextTaskId(newId);
	};

	const findPendingTasksLeftSide = () => {
		let number = 0;
		projects.forEach((project) => {
			project.tasks.forEach((task) => {
				if (
					new Date(task.date).getTime() <
						new Date(dates[0]).getTime() &&
					task.status.id !== "completed"
				) {
					number++;
				}
			});
		});

		return number;
	};

	const findPendingTasksRightSide = () => {
		let number = 0;
		projects.forEach((project) => {
			project.tasks.forEach((task) => {
				if (
					new Date(task.date).getTime() >
						new Date(dates[dates.length - 1]).getTime() &&
					task.status.id !== "completed"
				) {
					number++;
				}
			});
		});

		return number;
	};

	const handleResize = useCallback(() => {
		const containerWidth = wrapperRef.current?.clientWidth;

		if (containerWidth) {
			const newDatesToShow = Math.max(
				1,
				Math.min(Math.floor((containerWidth - 128) / 200), maxDates)
			);

			if (newDatesToShow !== datesShown) {
				setDatesShown(newDatesToShow);
				setDates(getWeekDates(new Date(dates[0]), newDatesToShow));
			}

			document.documentElement.style.setProperty(
				"--taskcell-enclosure-width",
				`${(containerWidth - 128) / newDatesToShow}px`
			);
		} else {
			// Fallback to default
			if (datesShown !== 5) {
				setDatesShown(5);
				setDates(getWeekDates(new Date(dates[0]), 5));
			}
		}
	}, [datesShown, dates]);

	/** Sync Logic **/
	const syncWithServer = async () => {
		console.log("🔄 Syncing with server...");
		try {
			const { data, error } = await supabase.from("syncData").select();
			if (error) return console.error("❌ Supabase error:", error);
			const onlineData = data?.[0]?.data;
			if (!onlineData) return console.warn("⚠️ No online data found");

			const onlineTime = new Date(onlineData.lastUpdated).getTime();
			const localTime = new Date(dataRef.current.lastUpdated).getTime();

			if (onlineTime > localTime) {
				setProjects(onlineData.projects ?? []);
				setNextProjectId(onlineData.nextProjectId ?? 1);
				setNextTaskId(onlineData.nextTaskId ?? 1);
				setData({ ...onlineData });
				console.log("⬇️ Pulled newer data from server");
			} else if (dirty) {
				const { error: updateError } = await supabase
					.from("syncData")
					.update({ data: dataRef.current })
					.eq("id", 1);
				if (updateError) console.error("❌ Update error:", updateError);
				else {
					console.log("⬆️ Pushed local changes to server");
					setDirty(false);
				}
			} else {
				console.log("✅ Data already in sync");
			}
		} catch (err) {
			console.error("❌ Sync exception:", err);
		}
	};

	/** Effects **/
	useEffect(() => {
		dataRef.current = data;
	}, [data]);
	useEffect(() => {
		syncWithServer();
	}, []); // Initial sync
	useEffect(() => {
		const interval = setInterval(syncWithServer, 5000);
		return () => clearInterval(interval);
	}, [dirty]);
	useEffect(() => {
		tableContext?.saveData(data);
		let remainingTasks = 0;
		projects.forEach((project) => {
			project.tasks.forEach((task) => {
				if (
					isSameDay(new Date(task.date), subDays(new Date(), 1)) &&
					task.status.id !== "completed"
				) {
					remainingTasks++;
				}
			});
		});

		if (remainingTasks === 0) {
			tableContext?.statusBarText.setText("All Done!");
		} else if (remainingTasks === 1) {
			tableContext?.statusBarText.setText(
				`🗓️ ${remainingTasks} task left `
			);
		} else {
			tableContext?.statusBarText.setText(
				`🗓️ ${remainingTasks} tasks left `
			);
		}
	}, [projects, nextProjectId]);
	useEffect(() => {
		const resizeObserver = new ResizeObserver(handleResize);
		if (wrapperRef.current) {
			resizeObserver.observe(wrapperRef.current);
		}
		handleResize(); // Initial run

		return () => {
			if (wrapperRef.current) {
				resizeObserver.unobserve(wrapperRef.current);
			}
		};
	}, [handleResize]);

	/** Render **/
	return (
		<div className="app-wrapper" ref={wrapperRef}>
			<TopBar
				incrementDates={incrementDates}
				decrementDates={decrementDates}
				setDatesToThisWeek={setDatesToThisWeek}
				findPendingTasksLeftSide={findPendingTasksLeftSide}
				findPendingTasksRightSide={findPendingTasksRightSide}
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
				moveTask={moveTask}
				wrapperRef={wrapperRef}
			/>
		</div>
	);
};

export default App;
