import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from '@/lib/axios';

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const NewProjectModal = ({ open, onOpenChange, onProjectCreated }: NewProjectModalProps) => {
  const [name, setName] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [framework, setFramework] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !gitUrl || !framework) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate name format (lowercase, no spaces)
    if (!/^[a-z0-9-]+$/.test(name)) {
      toast.error('Project name must be lowercase with no spaces (use hyphens)');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/projects', {
        name,
        git_url: gitUrl,
        framework,
        github_token: githubToken || null,
      });

      toast.success('Project created successfully!');
      setName('');
      setGitUrl('');
      setFramework('');
      setGithubToken('');
      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      toast.error('Failed to create project. Please try again.');
      console.error('Project creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Deploy your application to Kubernetes with a single click
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="my-awesome-app"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s/g, '-'))}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitUrl">Git Repository URL</Label>
            <Input
              id="gitUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubToken">GitHub Personal Access Token (PAT)</Label>
            <Input
              id="githubToken"
              type="password"
              placeholder="ghp_..."
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Provide this to automatically create the Webhook in your repository.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Select value={framework} onValueChange={setFramework} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="react">React / Static</SelectItem>
                <SelectItem value="springboot">Spring Boot</SelectItem>
                <SelectItem value="fastapi">FastAPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
