import { Project } from "./App";
import { addDays } from "date-fns";

interface ListViewProps {
	projects: Project[];
	dates: string[];
}

const isSameDay = (d1: Date, d2: Date) => {
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
};

const ListView: React.FC<ListViewProps> = ({ projects, dates }) => {
	const today = new Date(dates[0]);

	const todaysTasks = projects.flatMap((project) =>
		project.tasks
			.filter((task) => isSameDay(new Date(task.date), today))
			.map((task) => ({
				...task,
				projectName: project.name,
			}))
	);

	return (
		<div className="list-view">
			<table className="list-table">
				<thead className="list-table-header">
					<tr>
						<th>{addDays(today, 1).toDateString()}</th>
						<th>Project</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody className="list-table-body">
					{todaysTasks.map((task) => (
						<tr key={task.id}>
							<td>{task.name}</td>
							<td>{task.projectName}</td>
							<td>{task.status.name}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ListView;
