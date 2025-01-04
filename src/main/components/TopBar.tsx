import { ChevronLeft, ChevronRight } from "lucide-react";

interface TopBarProps {
	incrementDates: () => void;
	decrementDates: () => void;
    setDatesToThisWeek: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ incrementDates, decrementDates, setDatesToThisWeek }) => {
	return (
		<div className="top-bar">
			<div className="date-increment-container">
				<ChevronLeft onClick={decrementDates} className="date-increment left-increment" />
                <div onClick={setDatesToThisWeek} className="date-display">
                    {new Date().toDateString()}
                </div>
				<ChevronRight onClick={incrementDates} className="date-increment right-increment" />
			</div>
		</div>
	);
};

export default TopBar;
