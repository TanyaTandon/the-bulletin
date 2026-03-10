"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { X, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { store } from "@/redux";
import { useTourGuideWithInit } from "@/providers/contexts/TourGuideContext";
import { useLocation } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useDialog } from "@/providers/dialog-provider";
import { useIsMobile } from "@/hooks/use-mobile";

export interface CalendarNote {
  date: Date;
  note: string;
  example?: boolean;
}

const NoteModalContent: React.FC<{
  selectedDate: Date;
  onSave: (note: string) => void;
}> = ({ selectedDate, onSave }) => {
  const [note, setNote] = useState("");
  return (
    <section className="w-full h-[200px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Add Note for {format(selectedDate, "MMMM d, yyyy")}
        </h3>
      </div>
      <div className="space-y-4">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's happening on this day?"
          className="min-h-[100px] resize-none border-violet-200 focus:border-violet-400 focus:ring-violet-400"
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={() => onSave(note)} disabled={!note.trim()}>
            Save Note
          </Button>
        </div>
      </div>
    </section>
  );
};

const BigCalendar: React.FC<{
  savedNotes: CalendarNote[];
  setSavedNotes: React.Dispatch<React.SetStateAction<CalendarNote[]>>;
}> = ({ savedNotes, setSavedNotes }) => {
  const [queryParams] = useSearchParams();


  // console.log(savedNotes);
  const getNoteForDate = (date: Date) => {
    return savedNotes.find(
      (note) => new Date(note.date).toDateString() === date.toDateString()
    );
  };

  const isMobile = useIsMobile();
  const weekDays = isMobile
    ? ["S", "M", "T", "W", "T", "F", "S"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

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

  const { dialog, close } = useDialog();

  const handleDateClick = (date: Date) => {
    dialog(
      <NoteModalContent
        selectedDate={date}
        onSave={(note) => {
          setSavedNotes((prev) => [
            ...prev.filter((n) => !n.example),
            { date, note },
          ]);
          close();
        }}
      />
    );
  };


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
                    className={`${isMobile ? "p-1" : "p-4"} text-center border-r last:border-r-0`}
                  >
                    <div className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-black`}>{day}</div>
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
                      className={`border-r border-b border-white/10 last:border-r-0 p-1 flex flex-col ${isMobile ? "min-h-[45px]" : "min-h-[70px]"} ${!isCurrentMonth ? "opacity-30" : ""} ${isCurrentMonth ? "cursor-pointer hover:bg-gray-50" : ""}`}
                      onClick={() =>
                        isCurrentMonth && handleDateClick(currentDate)
                      }
                    >
                      <div className="flex justify-between flex-row items-start mb-1">
                        <div className="relative">
                          <span
                            className={`font-medium ${isMobile ? "text-xs px-0.5" : "text-sm px-3"} ${isToday ? "bg-blue-500 text-black w-6 h-6 rounded-full flex items-center justify-center" : "text-black"}`}
                          >
                            {isCurrentMonth ? dayNumber : ""}
                          </span>
                          {hasNote && (
                            <Heart className="absolute -top-0 -right-1 h-3 w-3 text-pink-500" />
                          )}
                        </div>
                      </div>

                      {/* On desktop show note text; on mobile just the heart icon is enough */}
                      {hasNote && !isMobile && (
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

      </main>

      {isMobile && (() => {
        const sorted = [...savedNotes]
          .filter((n) => !n.example)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (sorted.length === 0) return null;

        return (
          <div className="px-4 pb-6 pt-2 flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Saved dates
            </p>
            {sorted.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-lg border px-3 py-2 shadow-sm cursor-pointer"
                onClick={() => handleDateClick(new Date(note.date))}
              >
                <div className="flex flex-col items-center min-w-[36px]">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    {format(new Date(note.date), "MMM")}
                  </span>
                  <span className="text-lg font-semibold leading-none">
                    {format(new Date(note.date), "d")}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-pink-700 truncate">{note.note}</p>
                </div>
                <Heart className="h-3.5 w-3.5 text-pink-400 mt-1 shrink-0" />
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default BigCalendar;
