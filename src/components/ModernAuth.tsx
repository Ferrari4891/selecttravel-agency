import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Mail, 
  Lock, 
  User,
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
  const [firstName, setFirstName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
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
    setFirstName('');
    setAgeGroup('');
    setGender('');
  };

  const isFormValid = () => {
    if (mode === 'login') {
      return email && password;
    }
    return email && password && firstName && ageGroup && gender;
  };

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setLoading(true);
    
    try {
      if (mode === 'signup') {
        // Clean up any existing auth state
        cleanupAuthState();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          // Continue even if this fails
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/user-dashboard`,
            data: {
              first_name: firstName,
              age_group: ageGroup,
              gender: gender,
              display_name: firstName
            }
          }
        });
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created successfully! Welcome to SmartGuides!");
          // Force page reload for clean state
          setTimeout(() => {
            window.location.href = '/user-dashboard';
          }, 1000);
        }
      } else {
        // Login
        cleanupAuthState();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          // Continue even if this fails
        }

        const { error } = await signIn(email, password);
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          // Force page reload for clean state
          setTimeout(() => {
            window.location.href = '/user-dashboard';
          }, 500);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ageOptions = [
    { value: 'under-60', label: 'Under 60' },
    { value: '61-70', label: '61 to 70' },
    { value: '71-80', label: '71 to 80' },
    { value: '80-plus', label: '80 plus' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            It's FREE! to join seniorstravelagency.com
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {mode === 'signup' 
              ? 'Create your membership account'
              : 'Sign in to your account'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-6">
            {/* Signup-specific fields */}
            {mode === 'signup' && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-base font-medium text-gray-700">
                    First Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-12 h-14 text-lg border-gray-300 focus:border-primary focus:ring-primary"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="ageGroup" className="text-base font-medium text-gray-700">
                    Age Group *
                  </Label>
                  <Select value={ageGroup} onValueChange={setAgeGroup} required>
                    <SelectTrigger className="h-14 text-lg border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Select your age group" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {ageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-lg py-3">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-700">
                    Gender *
                  </Label>
                  <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-8">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="male" id="male" className="h-5 w-5" />
                      <Label htmlFor="male" className="text-lg font-normal cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="female" id="female" className="h-5 w-5" />
                      <Label htmlFor="female" className="text-lg font-normal cursor-pointer">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {/* Email field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium text-gray-700">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 text-lg border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-medium text-gray-700">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 text-lg border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Stay logged in checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="stayLoggedIn" 
                checked={stayLoggedIn}
                onCheckedChange={(checked) => setStayLoggedIn(checked === true)}
                className="h-5 w-5"
              />
              <Label htmlFor="stayLoggedIn" className="text-base font-normal cursor-pointer text-gray-700">
                Stay logged in
              </Label>
            </div>

            {/* Submit button */}
            <Button 
              type="submit" 
              className={`w-full h-16 text-lg font-semibold transition-all duration-200 ${
                isFormValid() 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                mode === 'signup' ? 'Join Now' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Mode Toggle */}
          <div className="text-center pt-4">
            <span className="text-base text-gray-600">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              type="button"
              onClick={() => handleModeChange(mode === 'signup' ? 'login' : 'signup')}
              className="text-base font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernAuth;