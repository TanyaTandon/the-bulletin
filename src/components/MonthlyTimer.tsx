
import React from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, endOfMonth } from 'date-fns';

const MonthlyTimer = () => {
  const now = new Date();
  const monthEnd = endOfMonth(now);
  
  const days = differenceInDays(monthEnd, now);
  const hours = differenceInHours(monthEnd, now) % 24;
  const minutes = differenceInMinutes(monthEnd, now) % 60;

  return (
    <div className="text-center text-muted-foreground">
      <p>Time remaining until end of month:</p>
      <p className="text-xl font-semibold">
        {days} days, {hours} hours, {minutes} minutes
      </p>
    </div>
  );
};

export default MonthlyTimer;
