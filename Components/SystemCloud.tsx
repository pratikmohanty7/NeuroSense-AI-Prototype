import React, { useState, useEffect } from 'react';

export const SystemClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // High frequency update for milliseconds visualization
    const interval = setInterval(() => {
      setTime(new Date());
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');
  // Get 2 digits of milliseconds
  const ms = Math.floor(time.getMilliseconds() / 10).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-end group select-none relative">
      <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-0.5 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-cyan-900 group-hover:bg-cyan-500 transition-colors"></span>
          SYS_TIME_SYNC
      </div>
      <div className="text-lg font-mono text-cyan-400 font-bold tracking-widest flex items-baseline leading-none shadow-[0_0_10px_rgba(6,182,212,0.1)]">
        {format(time.getHours())}:{format(time.getMinutes())}:{format(time.getSeconds())}
        <span className="text-sm text-cyan-700 ml-px">.{ms}</span>
        {/* Blinking Block Cursor */}
        <span className="w-2 h-4 bg-cyan-500 ml-1.5 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
      </div>
    </div>
  );
};
