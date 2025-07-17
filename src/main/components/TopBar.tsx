import { ChevronLeft, ChevronRight, Table2, List } from "lucide-react";

interface TopBarProps {
	incrementDates: () => void;
	decrementDates: () => void;
	setDatesToThisWeek: () => void;
	viewType: number;
	setViewType: (viewType: number) => void;
}

const TopBar: React.FC<TopBarProps> = ({
	incrementDates,
	decrementDates,
	setDatesToThisWeek,
	viewType,
	setViewType,
}) => {

	return (
		<div className="top-bar">
			<div className="view-chooser">
				<div
					className={`table-view-chooser ${
						viewType === 0 ? "selected" : "unselected"
					}`}
					onClick={() => setViewType(0)}
				>
					<Table2 className="table-icon" />
				</div>
				<div
					className={`list-view-chooser ${
						viewType === 1 ? "selected" : "unselected"
					}`}
					onClick={() => setViewType(1)}
				>
					<List className="list-icon" />
				</div>
			</div>
			<div className="date-increment-container">
				<ChevronLeft
					onClick={decrementDates}
					className="date-increment left-increment"
				/>
				<div onClick={setDatesToThisWeek} className="date-display">
					{new Date().toDateString()}
				</div>
				<ChevronRight
					onClick={incrementDates}
					className="date-increment right-increment"
				/>
			</div>
		</div>
	);
};

export default TopBar;
