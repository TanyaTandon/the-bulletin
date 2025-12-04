"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { X, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { store } from "@/redux";
import { useTourGuideWithInit } from "@/providers/contexts/TourGuideContext";
import { useLocation } from "react-router";
import { useSearchParams } from "react-router-dom";

export interface CalendarNote {
  date: Date;
  note: string;
  example?: boolean;
}

const BigCalendar: React.FC<{
  savedNotes: CalendarNote[];
  setSavedNotes: React.Dispatch<React.SetStateAction<CalendarNote[]>>;
}> = ({ savedNotes, setSavedNotes }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [calendarNote, setCalendarNote] = useState("");

  const [queryParams] = useSearchParams();

  // Calendar functionality
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowNoteModal(true);
    setCalendarNote("");
  };

  const handleSaveNote = () => {
    if (selectedDate && calendarNote.trim()) {
      setSavedNotes((prevState) => {
        const filteredNotes = prevState.filter((note) => !note.example);
        return [
          ...filteredNotes,
          { date: selectedDate, note: calendarNote.trim() },
        ];
      });
      setCalendarNote("");
      setShowNoteModal(false);
      setSelectedDate(null);
    }
  };

  const handleCloseModal = () => {
    setShowNoteModal(false);
    setSelectedDate(null);
    setCalendarNote("");
  };

  // console.log(savedNotes);
  const getNoteForDate = (date: Date) => {
    return savedNotes.find(
      (note) => new Date(note.date).toDateString() === date.toDateString()
    );
  };

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Calculate first of next month
  const today = new Date();
  const firstOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  );
  const year = firstOfNextMonth.getFullYear();
  const month = firstOfNextMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = firstOfNextMonth.getDay();

  const { tour, updateCurrentStepTarget, updatePositions } =
    useTourGuideWithInit();

  useEffect(() => {
    if (tour && queryParams.get("onboarding") === "true") {
      setTimeout(() => {
        updateCurrentStepTarget("[data-tg-title='calendar housing']");
        updatePositions();
        const bodyEl = document.querySelector("body");
        if (bodyEl && bodyEl.classList.contains("tg-no-interaction")) {
          console.log("removing tg-no-interaction");
          
          bodyEl.classList.remove("tg-no-interaction");
        }
      }, 750);
    }
  }, [tour, queryParams, updateCurrentStepTarget, updatePositions]);

  return (
    <div className="relative  w-full overflow-hidden">
      <main className="relative sr w-full pt-8 flex">
        <div
          data-tg-title="calendar housing"
          className={`flex-1 flex flex-col`}
        >
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white backdrop-blur-lg rounded-xl border shadow-xl">
              <div className="grid grid-cols-7 border-b">
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className="p-4 text-center border-r last:border-r-0"
                  >
                    <div className="text-sm font-medium text-black">{day}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 h-[60%]">
                {Array.from({ length: 35 }).map((_, index) => {
                  const dayNumber = index - firstDayOffset + 1;
                  const isCurrentMonth =
                    dayNumber > 0 && dayNumber <= daysInMonth;
                  const isToday =
                    isCurrentMonth &&
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === dayNumber;

                  const currentDate = new Date(year, month, dayNumber);
                  const hasNote = getNoteForDate(currentDate);

                  return (
                    <div
                      key={index}
                      className={`border-r border-b border-white/10 last:border-r-0 p-1 min-h-[70px] flex flex-col ${
                        !isCurrentMonth ? "opacity-30" : ""
                      } ${
                        isCurrentMonth ? "cursor-pointer hover:bg-gray-50" : ""
                      }`}
                      onClick={() =>
                        isCurrentMonth && handleDateClick(currentDate)
                      }
                    >
                      <div className="flex justify-between flex-row items-start mb-2">
                        <div className="relative">
                          <span
                            className={`text-sm font-medium px-3 ${
                              isToday
                                ? "bg-blue-500 text-black w-6 h-6 rounded-full flex items-center justify-center"
                                : "text-black"
                            }`}
                          >
                            {isCurrentMonth ? dayNumber : ""}
                          </span>
                          {hasNote && (
                            <Heart className="absolute -top-0 -right-1 h-3 w-3 text-pink-500" />
                          )}
                        </div>
                      </div>

                      {/* Show note for this day, if any */}
                      {hasNote && (
                        <div className="text-xs text-pink-700 mb-1 break-words max-h-10 overflow-hidden">
                          {hasNote.note.length > 40
                            ? hasNote.note.slice(0, 40) + "..."
                            : hasNote.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {showNoteModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Add Note for {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Textarea
                  value={calendarNote}
                  onChange={(e) => setCalendarNote(e.target.value)}
                  placeholder="What's happening on this day?"
                  className="min-h-[100px] resize-none border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    disabled={!calendarNote.trim()}
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BigCalendar;
