import React, { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";
import { CSSProperties } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "./ui/separator";
import ImageUploadGrid, { UploadedImage } from "./ImageUploadGrid";

export interface CalendarNote {
  date: Date;
  note: string;
}

const BlurbInput: React.FC<{
  savedNotes: CalendarNote[];
  setSavedNotes: React.Dispatch<React.SetStateAction<CalendarNote[]>>;
  blurb: string;
  setBlurb: React.Dispatch<React.SetStateAction<string>>;
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
}> = ({ savedNotes, setSavedNotes, blurb, setBlurb, images, setImages }) => {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 4, 1));
  const [calendarNote, setCalendarNote] = useState("");
  const isMobile = useIsMobile();

  const startOfMay2025 = new Date(2025, 4, 1);
  const endOfMay2025 = new Date(2025, 4, 31);

  const handleSaveNote = () => {
    if (date && calendarNote.trim()) {
      console.log(savedNotes);
      setSavedNotes([...savedNotes, { date, note: calendarNote.trim() }]);
      setCalendarNote("");
    }
  };

  const modifiers = {
    withNote: savedNotes?.map((note) => note.date),
  };

  const modifiersStyles: Record<string, CSSProperties> = {
    withNote: {
      backgroundColor: "rgba(255, 192, 203, 0.2)",
      position: "relative" as const,
    },
  };

  const modifiersClassNames = {
    withNote: "relative group",
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfMay2025) || isAfter(date, endOfMay2025);
  };

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <h3
        className={`font-semibold text-black mb-1 text-center w-full ${
          isMobile ? "text-base" : "text-lg"
        }`}
        style={{ fontFamily: "Sometype Mono, monospace" }}
      >
        Add your monthly summary
      </h3>
      <Textarea
        value={blurb}
        onChange={(e) => setBlurb(e.target.value)}
        placeholder="April was so fucking LIT. I nommed nommed and crushed on my crush and biked on my bike"
        className="min-h-[80px] resize-none w-full max-w-3xl border-violet-200 focus:border-violet-400 focus:ring-violet-400 text-sm"
        style={{ fontFamily: "Sometype Mono, monospace" }}
      />
      <div className="flex flex-col items-center space-y-2">
        <h3
          className={`font-semibold text-black ${
            isMobile ? "text-base" : "text-lg"
          }`}
          style={{ fontFamily: "Sometype Mono, monospace" }}
        >
          Add your key April highlights
        </h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow bg-white scale-90 origin-top"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          modifiersClassNames={modifiersClassNames}
          formatters={{
            formatDay: (date) => {
              const hasNote = savedNotes?.some(
                (note) => note.date.toDateString() === date.toDateString()
              );
              return (
                <div className="relative">
                  {date.getDate()}
                  {hasNote && (
                    <Heart
                      className="absolute top-0 right-0 h-2 w-2 text-pink-500"
                      style={{ transform: "translate(50%, -50%)" }}
                    />
                  )}
                </div>
              );
            },
          }}
        />

        <div className="w-full max-w-[40rem] space-y-1 mt-2">
          {savedNotes?.map((savedNote, index) => (
            <div
              key={index}
              className="flex items-start space-x-1 text-xs"
              style={{ fontFamily: "Sometype Mono, monospace" }}
            >
              <Heart className="h-3 w-3 text-pink-500 mt-1 flex-shrink-0" />
              <span className="break-words">
                {format(savedNote.date, "M/d")} {savedNote.note}
              </span>
            </div>
          ))}
        </div>

        {date && (
          <div className="mt-2 w-full max-w-[40rem] p-3 border rounded-lg bg-white shadow-sm">
            <p
              className="text-xs mb-1"
              style={{ fontFamily: "Sometype Mono, monospace" }}
            >
              Add a note for {format(date, "MMMM d, yyyy")}:
            </p>
            <div className="space-y-2">
              <Textarea
                value={calendarNote}
                onChange={(e) => setCalendarNote(e.target.value)}
                placeholder="What's happening on this day?"
                className="min-h-[60px] resize-none border-violet-200 focus:border-violet-400 focus:ring-violet-400 text-xs"
                style={{ fontFamily: "Sometype Mono, monospace" }}
              />
              <Button
                onClick={handleSaveNote}
                className="w-full text-xs py-1 h-auto"
                disabled={!calendarNote.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlurbInput;
