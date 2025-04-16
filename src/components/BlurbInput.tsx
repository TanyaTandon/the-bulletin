import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';
import { CSSProperties } from 'react';

interface CalendarNote {
  date: Date;
  note: string;
}

const BlurbInput = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarNote, setCalendarNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<CalendarNote[]>([]);

  const handleSaveNote = () => {
    if (date && calendarNote.trim()) {
      setSavedNotes([...savedNotes, { date, note: calendarNote.trim() }]);
      setCalendarNote('');
    }
  };

  const modifiers = {
    withNote: savedNotes.map(note => note.date)
  };

  const modifiersStyles: Record<string, CSSProperties> = {
    withNote: {
      backgroundColor: 'rgba(255, 192, 203, 0.2)',
      position: 'relative' as const,
    }
  };

  const modifiersClassNames = {
    withNote: 'relative group'
  };

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <h3 className="text-lg font-semibold text-black mb-2 text-center w-full" style={{ fontFamily: 'Sometype Mono, monospace' }}>
        Add your monthly summary
      </h3>
      <Textarea 
        placeholder="April was so fucking LIT. I nommed nommed and crushed on my crush and biked on my bike"
        className="min-h-[100px] resize-none w-full max-w-3xl border-violet-200 focus:border-violet-400 focus:ring-violet-400"
        style={{ fontFamily: 'Sometype Mono, monospace' }}
      />
      <div className="flex flex-col items-center space-y-2">
        <h3 className="text-lg font-semibold text-black" style={{ fontFamily: 'Sometype Mono, monospace' }}>
          Add your key April highlights and things you're excited for in May
        </h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow bg-white"
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          modifiersClassNames={modifiersClassNames}
          formatters={{
            formatDay: (date) => {
              const hasNote = savedNotes.some(note => 
                note.date.toDateString() === date.toDateString()
              );
              return (
                <div className="relative">
                  {date.getDate()}
                  {hasNote && (
                    <Heart 
                      className="absolute top-0 right-0 h-3 w-3 text-pink-500" 
                      style={{ transform: 'translate(50%, -50%)' }} 
                    />
                  )}
                </div>
              );
            }
          }}
        />

        <div className="w-full max-w-md space-y-2 mt-4">
          {savedNotes.map((savedNote, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm" style={{ fontFamily: 'Sometype Mono, monospace' }}>
              <Heart className="h-4 w-4 text-pink-500 mt-1" />
              <span>
                {format(savedNote.date, 'M/d')} {savedNote.note}
              </span>
            </div>
          ))}
        </div>

        {date && (
          <div className="mt-4 w-full max-w-md p-4 border rounded-lg bg-white shadow-sm">
            <p className="text-sm mb-2" style={{ fontFamily: 'Sometype Mono, monospace' }}>
              Add a note for {format(date, 'MMMM d, yyyy')}:
            </p>
            <div className="space-y-2">
              <Textarea
                value={calendarNote}
                onChange={(e) => setCalendarNote(e.target.value)}
                placeholder="What's happening on this day?"
                className="min-h-[80px] resize-none border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                style={{ fontFamily: 'Sometype Mono, monospace' }}
              />
              <Button 
                onClick={handleSaveNote}
                className="w-full"
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
