import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading
    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();
      
      console.log('=== LOGIN DEBUG ===');
      console.log('Domain:', window.location.hostname);
      console.log('Original input:', { username, password });
      console.log('Cleaned input:', { username: cleanUsername, password: cleanPassword });
      console.log('Expected credentials:', { username: 'tester', passwords: ['test4891', 'TESTER4891'] });
      
      const isValidUsername = cleanUsername === 'tester';
      const isValidPassword = cleanPassword === 'test4891' || cleanPassword === 'TESTER4891';
      
      console.log('Validation results:', { isValidUsername, isValidPassword });
      
      if (isValidUsername && isValidPassword) {
        console.log('LOGIN SUCCESS - Setting localStorage');
        localStorage.setItem('isAuthenticated', 'true');
        console.log('localStorage set, calling onLogin');
        onLogin();
        toast({
          title: "Login successful",
          description: "Welcome to SGL!",
        });
      } else {
        console.log('LOGIN FAILED');
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">SMART GUIDES LIVE</h1>
        <p className="text-lg text-muted-foreground">Welcome to our platform</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};