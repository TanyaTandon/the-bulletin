
import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

const BlurbInput = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <h3 className="text-sm text-black mb-2 text-center w-full" style={{ fontFamily: 'Sometype Mono, monospace' }}>
        Add your monthly summary
      </h3>
      <Textarea 
        placeholder="April was so fucking LIT. I nommed nommed and crushed on my crush and biked on my bike"
        className="min-h-[100px] resize-none w-full max-w-3xl border-violet-200 focus:border-violet-400 focus:ring-violet-400"
        style={{ fontFamily: 'Sometype Mono, monospace' }}
      />
      <div className="flex flex-col items-center space-y-2">
        <h3 className="text-sm text-black" style={{ fontFamily: 'Sometype Mono, monospace' }}>
          Selected date: {date ? format(date, 'PPP') : 'Pick a date'}
        </h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow bg-white"
        />
      </div>
    </div>
  );
};

export default BlurbInput;
