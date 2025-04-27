import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

const MonthlyTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());
  const isMobile = useIsMobile();

  function getTimeRemaining() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Set the target date to the 5th of the next month
    let targetDate = new Date(currentYear, currentMonth + 1, 5);

    // If today is after the 5th, target the 5th of the following month
    if (now.getDate() > 5) {
      targetDate = new Date(currentYear, currentMonth + 2, 5);
    }

    const difference = targetDate.getTime() - now.getTime();

    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold mb-2" style={{ fontFamily: "Sometype Mono, monospace" }}>
        Time until the next bulletin ships!
      </div>
      <div className="flex justify-center items-center space-x-4">
        <div className="text-lg">
          {timeRemaining.days} <span className="text-sm">Days</span>
        </div>
        <div className="text-lg">
          {timeRemaining.hours} <span className="text-sm">Hours</span>
        </div>
        <div className="text-lg">
          {timeRemaining.minutes} <span className="text-sm">Minutes</span>
        </div>
        <div className="text-lg">
          {timeRemaining.seconds} <span className="text-sm">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTimer;
