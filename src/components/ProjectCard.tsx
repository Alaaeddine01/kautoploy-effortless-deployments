import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Rocket, RefreshCw, Loader2, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import LogTerminal from './LogTerminal';

interface Project {
  id: number;
  name: string;
  git_url: string;
  framework: string;
  deployed_url: string | null;
  last_build_status: string;
  last_pipeline_run_name?: string;
}

interface ProjectCardProps {
  project: Project;
  onProjectUpdated: () => void;
}

const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus === 'running' || normalizedStatus === 'building...') {
    return {
      color: 'text-status-running',
      icon: Loader2,
      iconClass: 'animate-spin',
      label: 'Building',
    };
  }
  
  if (normalizedStatus === 'success' || normalizedStatus === 'succeeded') {
    return {
      color: 'text-status-success',
      icon: CheckCircle2,
      iconClass: '',
      label: 'Success',
    };
  }
  
  if (normalizedStatus === 'failed') {
    return {
      color: 'text-status-failed',
      icon: XCircle,
      iconClass: '',
      label: 'Failed',
    };
  }
  
  return {
    color: 'text-status-new',
    icon: null,
    iconClass: '',
    label: 'New',
  };
};

const getFrameworkLabel = (framework: string) => {
  const map: Record<string, string> = {
    react: 'React',
    springboot: 'Spring Boot',
    fastapi: 'FastAPI',
  };
  return map[framework] || framework;
};

const ProjectCard = ({ project, onProjectUpdated }: ProjectCardProps) => {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const statusConfig = getStatusConfig(project.last_build_status);
  const StatusIcon = statusConfig.icon;
  
  const isDeployed = project.last_build_status.toLowerCase() === 'success' || 
                     project.last_build_status.toLowerCase() === 'succeeded';
  const isNew = project.last_build_status.toLowerCase() === 'new';

  const handleDeploy = async () => {
    try {
      await axios.post(`/projects/${project.id}/deploy`);
      toast.success(`Deployment started for ${project.name}`);
      onProjectUpdated();
    } catch (error) {
      toast.error('Failed to start deployment');
      console.error('Deployment error:', error);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold truncate">{project.name}</h3>
          <Badge variant="outline" className={cn('flex items-center gap-1.5 shrink-0', statusConfig.color)}>
            {StatusIcon && <StatusIcon className={cn('h-3 w-3', statusConfig.iconClass)} />}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground truncate" title={project.git_url}>
            {project.git_url}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {getFrameworkLabel(project.framework)}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isDeployed && project.deployed_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              asChild
            >
              <a href={project.deployed_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Visit Site
              </a>
            </Button>
          )}
          
          {project.last_pipeline_run_name && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsLogsOpen(true)}
            >
              <Terminal className="h-4 w-4" />
              View Logs
            </Button>
          )}
          
          <Button
            size="sm"
            className={cn("gap-2", isDeployed || project.last_pipeline_run_name ? "flex-1" : "w-full")}
            onClick={handleDeploy}
          >
            {isNew ? (
              <>
                <Rocket className="h-4 w-4" />
                Deploy
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Redeploy
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Logs Dialog */}
      <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Build Logs: {project.last_pipeline_run_name}</DialogTitle>
          </DialogHeader>
          {project.last_pipeline_run_name && (
            <LogTerminal 
              runName={project.last_pipeline_run_name} 
              status={project.last_build_status} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProjectCard;
