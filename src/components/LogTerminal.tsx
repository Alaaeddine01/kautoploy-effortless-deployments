import { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axios';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const handleDownload = () => {
    if (!logs) return;
    
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `build-logs-${runName}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    <div className="rounded-lg border border-slate-800 overflow-hidden bg-[#0d1117]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-xs font-medium text-slate-400 ml-2">Build Output</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!logs}
            className="h-7 px-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          
          {/* Status Indicator */}
          {isLive ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-700/30 border border-slate-700 rounded-md">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span className="text-xs font-medium text-slate-400">Finished</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="h-96 overflow-y-auto bg-[#0d1117] p-4 font-mono text-xs text-emerald-400"
      >
        {logs ? (
          <pre className="whitespace-pre-wrap break-words">{logs}</pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            {isLive ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <span className="text-sm">&gt; Waiting for logs...</span>
              </>
            ) : (
              <span className="text-sm">&gt; Connection failed or no logs available</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTerminal;
