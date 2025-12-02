import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Build {
  id: number;
  pipeline_run_name: string;
  status: string;
  start_time: string;
}

interface BuildHistorySheetProps {
  projectId: number;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusIcon = (status: string) => {
  const normalized = status.toLowerCase();
  
  if (normalized === 'succeeded' || normalized === 'success') {
    return <CheckCircle2 className="h-4 w-4 text-status-success" />;
  }
  
  if (normalized === 'failed') {
    return <XCircle className="h-4 w-4 text-status-failed" />;
  }
  
  if (normalized === 'running' || normalized === 'building...') {
    return <Loader2 className="h-4 w-4 text-status-running animate-spin" />;
  }
  
  return null;
};

const BuildHistorySheet = ({ projectId, projectName, open, onOpenChange }: BuildHistorySheetProps) => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchBuilds = async () => {
    if (!open) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`/projects/${projectId}/builds`);
      setBuilds(response.data);
    } catch (error) {
      toast.error('Failed to fetch build history');
      console.error('Fetch builds error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (build: Build) => {
    try {
      setIsLoadingLogs(true);
      const response = await axios.get(`/builds/${projectName}/${build.pipeline_run_name}/logs`);
      setLogs(response.data.logs || 'No logs available');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setLogs('Logs are not available for this build.');
      } else {
        setLogs('Failed to load logs. Please try again.');
        toast.error('Failed to fetch logs');
      }
      console.error('Fetch logs error:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleBuildClick = (build: Build) => {
    setSelectedBuild(build);
    fetchLogs(build);
  };

  const handleBackToList = () => {
    setSelectedBuild(null);
    setLogs('');
  };

  useEffect(() => {
    if (open) {
      fetchBuilds();
      setSelectedBuild(null);
      setLogs('');
    }
  }, [open, projectId]);

  const getRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        {!selectedBuild ? (
          <>
            <SheetHeader>
              <SheetTitle>Build History: {projectName}</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-3">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-border rounded-lg space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </>
              ) : builds.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No builds found for this project</p>
                </div>
              ) : (
                builds.map((build) => (
                  <button
                    key={build.id}
                    onClick={() => handleBuildClick(build)}
                    className={cn(
                      "w-full p-4 border border-border rounded-lg text-left",
                      "hover:border-primary/50 hover:bg-accent/50 transition-all",
                      "flex items-center justify-between gap-3"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getStatusIcon(build.status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          Build #{build.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getRelativeTime(build.start_time)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="mr-2"
                >
                  ← Back
                </Button>
                <SheetTitle>Build #{selectedBuild.id} Logs</SheetTitle>
              </div>
            </SheetHeader>

            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                {getStatusIcon(selectedBuild.status)}
                <Badge variant="outline" className="capitalize">
                  {selectedBuild.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getRelativeTime(selectedBuild.start_time)}
                </span>
              </div>

              <div className="bg-slate-950 dark:bg-black border border-border rounded-lg overflow-hidden">
                <div className="border-b border-border/50 px-4 py-2 flex items-center justify-between bg-slate-900/50 dark:bg-slate-900/30">
                  <span className="text-sm font-medium text-slate-300">Terminal Output</span>
                </div>

                <div className="p-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {isLoadingLogs ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-slate-800" />
                      <Skeleton className="h-4 w-3/4 bg-slate-800" />
                      <Skeleton className="h-4 w-5/6 bg-slate-800" />
                      <Skeleton className="h-4 w-2/3 bg-slate-800" />
                    </div>
                  ) : (
                    <pre className="font-mono text-sm text-emerald-400 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {logs}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BuildHistorySheet;
