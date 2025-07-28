import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Mail, 
  Lock, 
  Check, 
  Bookmark, 
  Star, 
  Users, 
  Smartphone,
  Shield,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface ModernAuthProps {
  mode?: 'signup' | 'login';
  onModeChange?: (mode: 'signup' | 'login') => void;
}

const ModernAuth: React.FC<ModernAuthProps> = ({ 
  mode: initialMode = 'signup', 
  onModeChange 
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/user-dashboard');
    }
  }, [user, navigate]);

  const handleModeChange = (newMode: 'signup' | 'login') => {
    setMode(newMode);
    onModeChange?.(newMode);
    setEmail('');
    setPassword('');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    
    try {
      const { error } = mode === 'signup' 
        ? await signUp(email, password)
        : await signIn(email, password);
        
      if (error) {
        toast.error(error.message);
      } else {
        if (mode === 'signup') {
          toast.success("Welcome! Please check your email to confirm your account.");
        } else {
          toast.success("Welcome back!");
          navigate('/user-dashboard');
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    setSocialLoading(provider);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/user-dashboard`
        }
      });
      
      if (error) {
        toast.error(`Failed to sign in with ${provider}. Please try again.`);
      }
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setSocialLoading(null);
    }
  };

  const benefits = [
    {
      icon: <Bookmark className="h-5 w-5 text-primary" />,
      text: "Save your favorite guides"
    },
    {
      icon: <Star className="h-5 w-5 text-primary" />,
      text: "Get personalized recommendations"
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      text: "Access exclusive member content"
    },
    {
      icon: <Smartphone className="h-5 w-5 text-primary" />,
      text: "Sync across all devices"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {mode === 'signup' ? 'Join SmartGuides.live' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {mode === 'signup' 
              ? 'Start your journey to smarter travel experiences'
              : 'Access your personalized travel guides'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits Section - only show on signup */}
          {mode === 'signup' && (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 border border-primary/20">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">Member Benefits:</h3>
              <div className="grid grid-cols-1 gap-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {benefit.icon}
                    <span className="text-sm text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Authentication Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleSocialAuth('google')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleSocialAuth('apple')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'apple' ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              Continue with Apple
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleSocialAuth('facebook')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'facebook' ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              Continue with Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                  onClick={() => toast.info("Password reset functionality coming soon!")}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold transition-all duration-200"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Mode Toggle */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              type="button"
              onClick={() => handleModeChange(mode === 'signup' ? 'login' : 'signup')}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Your data is secure and protected</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <button 
                type="button"
                className="hover:text-gray-600 transition-colors"
                onClick={() => toast.info("Terms of Service coming soon!")}
              >
                Terms of Service
              </button>
              <span>•</span>
              <button 
                type="button"
                className="hover:text-gray-600 transition-colors"
                onClick={() => toast.info("Privacy Policy coming soon!")}
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button 
                type="button"
                className="hover:text-gray-600 transition-colors"
                onClick={() => toast.info("Contact support at support@smartguides.live")}
              >
                Support
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernAuth;