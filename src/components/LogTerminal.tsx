import { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axios';
import { Loader2 } from 'lucide-react';

interface LogTerminalProps {
  runName: string;
  status: string;
}

const LogTerminal = ({ runName, status }: LogTerminalProps) => {
  const [logs, setLogs] = useState<string>('');
  const [isLive, setIsLive] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`/builds/${runName}/logs`);
      setLogs(response.data.logs || '');
      
      // Auto-scroll to bottom
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs('Failed to load logs...');
    }
  };

  useEffect(() => {
    const normalizedStatus = status.toLowerCase();
    const isBuilding = normalizedStatus === 'running' || 
                       normalizedStatus === 'pending' || 
                       normalizedStatus === 'building...';

    if (isBuilding) {
      // Start polling for live logs
      setIsLive(true);
      fetchLogs(); // Initial fetch
      intervalRef.current = setInterval(fetchLogs, 3000);
    } else {
      // Just fetch once for completed builds
      setIsLive(false);
      fetchLogs();
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runName, status]);

  return (
    <div className="relative">
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
          <Loader2 className="h-3 w-3 text-emerald-400 animate-spin" />
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>
      )}

      {/* Terminal Display */}
      <div
        ref={terminalRef}
        className="h-96 overflow-y-auto bg-black border border-border rounded-md p-4 font-mono text-xs text-slate-300"
      >
        {logs ? (
          <pre className="whitespace-pre-wrap break-words">{logs}</pre>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2">Loading logs...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTerminal;
