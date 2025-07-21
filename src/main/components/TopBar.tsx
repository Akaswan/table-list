import { ChevronLeft, ChevronRight } from "lucide-react";

interface TopBarProps {
	incrementDates: () => void;
	decrementDates: () => void;
	setDatesToThisWeek: () => void;
	findPendingTasksLeftSide: () => number;
	findPendingTasksRightSide: () => number;
}

const TopBar: React.FC<TopBarProps> = ({
	incrementDates,
	decrementDates,
	setDatesToThisWeek,
	findPendingTasksLeftSide,
	findPendingTasksRightSide,
}) => {
	const leftCount = findPendingTasksLeftSide();
	const rightCount = findPendingTasksRightSide();

	const formatCount = (count: number) => (count > 9 ? "9+" : count);

	return (
		<div className="top-bar">
			<div className="date-increment-container">
				<div className="chevron-wrapper">
					<ChevronLeft
						onClick={decrementDates}
						className="date-increment left-increment"
					/>
					{leftCount > 0 && (
						<div className="chevron-badge left-badge">
							{formatCount(leftCount)}
						</div>
					)}
				</div>

				<div onClick={setDatesToThisWeek} className="date-display">
					{new Date().toDateString()}
				</div>

				<div className="chevron-wrapper">
					<ChevronRight
						onClick={incrementDates}
						className="date-increment right-increment"
					/>
					{rightCount > 0 && (
						<div className="chevron-badge right-badge">
							{formatCount(rightCount)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TopBar;
