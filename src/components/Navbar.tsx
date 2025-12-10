import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Rocket, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  onNewProject?: () => void;
}

const Navbar = ({ onNewProject }: NavbarProps) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get username from stored email (part before @)
  const getUserDisplayName = () => {
    const email = localStorage.getItem('user_email');
    if (email) {
      return email.split('@')[0];
    }
    return null;
  };

  const displayName = getUserDisplayName();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 text-xl font-bold">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Kautoploy
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {displayName && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{displayName}</span>
                </div>
              )}
              {onNewProject && (
                <Button onClick={onNewProject} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
