import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const LoginGate = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('siteAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Login attempt with:', { username, password });

    // Check credentials
    if (username === 'TESTER' && password === 'tester4891') {
      console.log('Credentials valid, setting authentication...');
      localStorage.setItem('siteAuthenticated', 'true');
      console.log('localStorage set:', localStorage.getItem('siteAuthenticated'));
      
      toast({
        title: "Login Successful",
        description: "Welcome to Smart Guide Books!",
      });
      
      // Force a page reload to ensure the auth guard picks up the change
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      console.log('Invalid credentials');
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      <Card className="w-full max-w-md border-8 border-white shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">seniortravel.agency</CardTitle>
          <CardDescription className="text-lg">
            Please enter your credentials to access the site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
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
                placeholder="Enter password"
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

export default LoginGate;