"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    add,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isEqual,
    isSameMonth,
    isToday,
    parse,
    startOfToday,
    startOfWeek,
    endOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";

export type CalendarProps = {
    selected?: Date;
    onSelect?: (date: Date) => void;
    className?: string;
};

export function Calendar({ selected, onSelect, className }: CalendarProps) {
    let today = startOfToday();
    let [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"));
    let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

    let days = eachDayOfInterval({
        start: startOfWeek(firstDayCurrentMonth),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
    });

    function previousMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    }

    function nextMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    }

    return (
        <div className={cn("p-3", className)}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    {format(firstDayCurrentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={previousMonth}
                        className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">Previous month</span>
                        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">Next month</span>
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 mt-4 text-xs leading-6 text-center text-gray-500 dark:text-gray-400">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm">
                {days.map((day, dayIdx) => (
                    <div
                        key={day.toString()}
                        className={cn(
                            dayIdx > 6 && "border-t border-gray-200 dark:border-gray-800",
                            "py-2"
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => onSelect?.(day)}
                            className={cn(
                                isEqual(day, selected || -1) && "text-white",
                                !isEqual(day, selected || -1) &&
                                isToday(day) &&
                                "text-blue-500",
                                !isEqual(day, selected || -1) &&
                                !isToday(day) &&
                                isSameMonth(day, firstDayCurrentMonth) &&
                                "text-gray-900 dark:text-gray-100",
                                !isEqual(day, selected || -1) &&
                                !isToday(day) &&
                                !isSameMonth(day, firstDayCurrentMonth) &&
                                "text-gray-400 dark:text-gray-600",
                                isEqual(day, selected || -1) && isToday(day) && "bg-blue-500",
                                isEqual(day, selected || -1) && !isToday(day) && "bg-gray-900 dark:bg-gray-100 dark:text-gray-900",
                                !isEqual(day, selected || -1) && "hover:bg-gray-200 dark:hover:bg-gray-800",
                                (isEqual(day, selected || -1) || isToday(day)) &&
                                "font-semibold",
                                "mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                            )}
                        >
                            <time dateTime={format(day, "yyyy-MM-dd")}>
                                {format(day, "d")}
                            </time>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
