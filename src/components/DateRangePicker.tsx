import React, { useState, useEffect } from 'react';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Sync internal calendar view with selected start date if present
    useEffect(() => {
        if (startDate) {
            setCurrentDate(new Date(startDate));
        }
    }, []); // Only on mount

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const selectedDate = new Date(year, month, day);
        // Reset time to midnight to avoid timezone issues with comparisons
        selectedDate.setHours(0, 0, 0, 0);

        // Adjust for timezone offset so the ISO string comes out right for the local date
        const offset = selectedDate.getTimezoneOffset() * 60000;
        const localDateStr = new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];

        if (!startDate || (startDate && endDate)) {
            // Start of new range
            onChange(localDateStr, '');
        } else {
            // Selecting end date
            const start = new Date(startDate);
            if (selectedDate < start) {
                // If clicked date is before start, treat as new start
                onChange(localDateStr, '');
            } else {
                onChange(startDate, localDateStr);
            }
        }
    };

    // Helper to determine styling for each day
    const getDayClasses = (day: number) => {
        const dateStr = new Date(year, month, day - new Date().getTimezoneOffset() / 1440).toISOString().split('T')[0];

        // Re-construct date properly for comparison to avoid timezone shifts
        const currentLoopDate = new Date(year, month, day);
        currentLoopDate.setHours(0, 0, 0, 0);

        // Format as YYYY-MM-DD for reliable comparison
        const offset = currentLoopDate.getTimezoneOffset() * 60000;
        const currentLoopDateStr = new Date(currentLoopDate.getTime() - offset).toISOString().split('T')[0];

        const isSelectedStart = currentLoopDateStr === startDate;
        const isSelectedEnd = currentLoopDateStr === endDate;
        const isInRange = startDate && endDate && currentLoopDateStr > startDate && currentLoopDateStr < endDate;
        const isToday = new Date().toDateString() === currentLoopDate.toDateString();

        let classes = "w-10 h-10 flex items-center justify-center text-sm font-medium rounded-full transition-all duration-200 cursor-pointer relative ";

        if (isSelectedStart || isSelectedEnd) {
            classes += "bg-teal-500 text-white shadow-lg hover:bg-teal-600 z-10 ";
        } else if (isInRange) {
            classes += "bg-teal-900/50 text-teal-100 rounded-none first:rounded-l-full last:rounded-r-full ";
        } else {
            classes += "text-gray-300 hover:bg-gray-700 hover:text-white ";
        }

        if (isToday && !isSelectedStart && !isSelectedEnd && !isInRange) {
            classes += "border border-teal-500/50 text-teal-400 ";
        }

        return classes;
    };

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:p-6 shadow-2xl max-w-sm mx-auto select-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                    ←
                </button>
                <h3 className="text-lg font-bold text-white capitalize">
                    {monthNames[month]} <span className="text-gray-400">{year}</span>
                </h3>
                <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                    →
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-gray-500 text-xs font-bold uppercase tracking-wider py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            {/* Days Grid - Always render 42 cells (6 rows x 7 cols) to keep height consistent */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for previous month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-start-${i}`} className="w-10 h-10" />
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    return (
                        <div key={day} className="flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => handleDayClick(day)}
                                className={getDayClasses(day)}
                            >
                                {day}
                            </button>
                        </div>
                    );
                })}

                {/* Empty slots for end of grid to maintain consistent height */}
                {Array.from({ length: 42 - daysInMonth - firstDay }).map((_, i) => (
                    <div key={`empty-end-${i}`} className="w-10 h-10" />
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-400">
                <p>
                    {startDate ? new Date(startDate).toLocaleDateString() : 'Select start'}
                    {startDate && !endDate && ' → Select end'}
                    {endDate && ` → ${new Date(endDate).toLocaleDateString()}`}
                </p>
                {startDate && (
                    <button
                        type="button"
                        onClick={() => onChange('', '')}
                        className="text-red-400 hover:text-red-300"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
