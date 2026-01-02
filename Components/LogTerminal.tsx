import React, { useState, useMemo, useEffect, useRef } from 'react';

interface LogTerminalProps {
  logs: string[];
}

type FilterType = 'ALL' | 'SYSTEM' | 'WARNING' | 'CRITICAL';
type TimeRangeType = 'ALL' | '1M' | '5M';
type LogType = 'SYSTEM' | 'WARNING' | 'EMERGENCY' | 'AUTOMATIC';

// Preset keywords for quick filtering
const QUICK_FILTERS = ['SECURITY', 'LATENCY', 'PACKET', 'DATA_INTEGRITY', 'SYNCOPE'];

// --- Helper Components ---

// Memoized Text Highlighter for performance
const HighlightedText = React.memo(({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight) return <>{text}</>;
  
  // Safe regex escape
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-cyan-500 text-black font-bold px-0.5 rounded-[1px] shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
});

// Memoized Row Component to prevent unnecessary re-renders of list items
const LogRow = React.memo(({ log, type, search }: { log: string, type: LogType, search: string }) => {
  let styleClass = '';
  switch (type) {
    case 'EMERGENCY': 
      styleClass = 'text-red-400 border-red-500 bg-red-950/20 shadow-[0_0_5px_rgba(239,68,68,0.2)]';
      break;
    case 'WARNING': 
      styleClass = 'text-yellow-400 border-yellow-500 bg-yellow-950/20';
      break;
    case 'AUTOMATIC': 
      styleClass = 'text-orange-300 border-orange-500 bg-orange-950/20';
      break;
    case 'SYSTEM': 
      styleClass = 'text-cyan-300 border-cyan-500 bg-cyan-950/20';
      break;
    default: 
      styleClass = 'text-gray-300 border-gray-600';
  }

  return (
    <div className={`pl-2 pr-1 py-0.5 border-l-2 text-[10px] font-mono leading-relaxed break-all hover:bg-white/5 transition-colors cursor-default mb-0.5 ${styleClass}`}>
      <span className="opacity-50 mr-2 select-none">›</span>
      <HighlightedText text={log} highlight={search} />
    </div>
  );
});

// --- Main Component ---

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('ALL');
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, filter, search, activeTags]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // If user scrolls up, disable auto-scroll
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const getLogType = (log: string): LogType => {
    if (log.includes('EMERGENCY') || log.includes('FATAL')) return 'EMERGENCY';
    if (log.includes('WARNING') || log.includes('BREACH')) return 'WARNING';
    if (log.includes('AUTO_TRIG') || log.includes('AUTOMATIC')) return 'AUTOMATIC';
    return 'SYSTEM';
  };

  const getLogTime = (log: string): Date | null => {
      const match = log.match(/^\[(.*?)\]/);
      if (match && match[1]) {
          const timeStr = match[1];
          const d = new Date();
          const parts = timeStr.match(/(\d+):(\d+):(\d+)\s*(AM|PM)?/);
          if (parts) {
             let hours = parseInt(parts[1]);
             const minutes = parseInt(parts[2]);
             const seconds = parseInt(parts[3]);
             const modifier = parts[4];
             
             if (modifier === 'PM' && hours < 12) hours += 12;
             if (modifier === 'AM' && hours === 12) hours = 0;

             d.setHours(hours, minutes, seconds);
             return d;
          }
          return new Date(`${new Date().toDateString()} ${timeStr}`);
      }
      return null;
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // Optimized Filtering
  const filteredLogs = useMemo(() => {
    const now = new Date();
    
    // Reverse logs for display if needed, but usually terminals append at bottom.
    // We filter the raw array.
    return logs.filter(log => {
      // 1. Severity Filter
      const type = getLogType(log);
      if (filter === 'SYSTEM' && type !== 'SYSTEM') return false;
      if (filter === 'WARNING' && (type !== 'WARNING' && type !== 'AUTOMATIC')) return false;
      if (filter === 'CRITICAL' && type !== 'EMERGENCY') return false;

      // 2. Keyword/Tag Filter
      if (activeTags.size > 0) {
        let hasTag = false;
        for (const tag of activeTags) {
          if (log.toUpperCase().includes(tag)) {
            hasTag = true;
            break;
          }
        }
        if (!hasTag) return false;
      }

      // 3. Search Filter
      if (search && !log.toLowerCase().includes(search.toLowerCase())) return false;

      // 4. Time Filter
      if (timeRange !== 'ALL') {
          const logDate = getLogTime(log);
          if (!logDate) return false;
          
          const diffMs = now.getTime() - logDate.getTime();
          const mins = diffMs / 1000 / 60;
          
          if (timeRange === '1M' && (mins > 1 || mins < 0)) return false;
          if (timeRange === '5M' && (mins > 5 || mins < 0)) return false;
      }

      return true;
    });
  }, [logs, filter, search, timeRange, activeTags]);

  return (
    <div className="flex flex-col h-full bg-[#050505] border border-gray-800 rounded overflow-hidden font-mono text-xs relative group shadow-inner">
       {/* Background */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%] opacity-10"></div>

      {/* Toolbar */}
      <div className="flex flex-col border-b border-gray-800 bg-gray-900/40 backdrop-blur-sm z-10">
        
        {/* Row 1: Header & Quick Stats */}
        <div className="flex justify-between items-center p-2 border-b border-gray-800/50">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className="font-bold text-gray-400 tracking-wider text-[10px] uppercase">
                    Event_Stream // {filteredLogs.length} Ent.
                </span>
             </div>
             
             {/* Severity Toggles */}
             <div className="flex gap-1">
                {(['ALL', 'SYSTEM', 'WARNING', 'CRITICAL'] as FilterType[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-widest transition-all border ${
                            filter === f 
                            ? 'bg-gray-700 text-white border-gray-500 shadow-[0_0_5px_rgba(255,255,255,0.2)]' 
                            : 'bg-black/50 text-gray-600 border-gray-800 hover:border-gray-600 hover:text-gray-400'
                        }`}
                    >
                        {f}
                    </button>
                ))}
             </div>
        </div>

        {/* Row 2: Search & Time */}
        <div className="flex gap-2 p-2 items-center">
            {/* Time Toggles */}
            <div className="flex gap-px border border-gray-800 rounded-sm overflow-hidden flex-shrink-0">
                {(['ALL', '1M', '5M'] as TimeRangeType[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTimeRange(t)}
                        className={`px-2 py-1 text-[9px] font-bold tracking-wider transition-colors ${
                            timeRange === t 
                            ? 'bg-cyan-900/40 text-cyan-300' 
                            : 'bg-black text-gray-600 hover:text-gray-400'
                        }`}
                    >
                        {t === 'ALL' ? 'HIST' : t}
                    </button>
                ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 group/search">
                <span className="absolute left-2 top-1.5 text-cyan-700 text-[10px] transition-colors group-focus-within/search:text-cyan-400">GREP »</span>
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/50 border border-gray-800 rounded-sm py-1 pl-12 pr-2 text-cyan-300 placeholder-gray-700 text-[10px] focus:outline-none focus:border-cyan-500/50 transition-all font-mono focus:bg-cyan-950/10"
                    placeholder="FILTER_BUFFER..."
                />
            </div>
        </div>

        {/* Row 3: Quick Filter Chips */}
        <div className="flex gap-1.5 px-2 pb-2 overflow-x-auto no-scrollbar">
            {QUICK_FILTERS.map(tag => {
                const isActive = activeTags.has(tag);
                return (
                    <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`
                            px-2 py-0.5 text-[9px] font-mono border rounded-sm transition-all whitespace-nowrap
                            ${isActive 
                                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] font-bold' 
                                : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                            }
                        `}
                    >
                        #{tag}
                    </button>
                );
            })}
             {activeTags.size > 0 && (
                 <button onClick={() => setActiveTags(new Set())} className="text-[9px] text-red-400 hover:text-red-300 px-1">
                     [CLR]
                 </button>
             )}
        </div>
      </div>

      {/* Log Body */}
      <div 
        className="flex-1 overflow-y-auto p-2 custom-scrollbar relative z-10 scroll-smooth"
        ref={containerRef}
        onScroll={handleScroll}
      >
         <div className="flex flex-col">
            {filteredLogs.length === 0 && (
                <div className="text-gray-700 text-center py-10 text-[10px] tracking-widest flex flex-col items-center gap-2">
                    <div>// BUFFER_EMPTY_OR_FILTERED_OUT</div>
                    <div className="w-8 h-px bg-gray-800"></div>
                </div>
            )}
            
            {filteredLogs.map((log, i) => (
               <LogRow 
                 key={i} // Using index is acceptable here as logs are append-only
                 log={log} 
                 type={getLogType(log)} 
                 search={search} 
               />
            ))}
             
             {/* Anchor for Auto-scroll */}
             <div ref={bottomRef} className="h-px w-full"></div>
             
             {/* Live Cursor */}
             <div className="mt-1 text-cyan-500 animate-pulse text-[10px] pl-2 flex items-center gap-1 opacity-50">
                <span>_</span>
             </div>
         </div>
      </div>
    </div>
  );
};
