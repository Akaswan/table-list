export type Project = {
	id: number;
	name: string;
	tasks: Task[];
};

export type Task = {
	id: number;
	name: string;
	date: Date;
	parentProjectId: number;
	status: TaskStatus;
};

export type TaskStatus = {
	name: string;
	id: string;
	color: string;
};

export type TableData = {
	projects: Project[];
	nextProjectId: number;
	nextTaskId: number;
	lastUpdated: string;
};
