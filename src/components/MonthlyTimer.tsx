
import React, { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const MonthlyTimer = () => {
  const [now, setNow] = useState(new Date());
  const targetDate = parseISO('2025-05-01T23:59:00-07:00'); // April 25, 11:59 PM PST
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const days = differenceInDays(targetDate, now);
  const hours = differenceInHours(targetDate, now) % 24;
  const minutes = differenceInMinutes(targetDate, now) % 60;

  return (
    <div className="text-center bg-gradient-to-r from-accent/10 to-primary/10 p-3 rounded-lg">
      <p className="text-muted-foreground mb-1 text-sm">Time to print:</p>
      <p className={`font-semibold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent ${isMobile ? 'text-base' : 'text-lg'}`}>
        {days} days, {hours} hours, {minutes} minutes
      </p>
    </div>
  );
};

export default MonthlyTimer;
