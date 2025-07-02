import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, EyeOff, Music, Mail, HelpCircle, UserCog, ArrowLeft, Check, X, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import ForcePasswordChange from "./force-password-change";

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, "Password is required")
    .max(128, "Password too long"),
});

const signupSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces")
    .transform(val => val.trim()),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces")
    .transform(val => val.trim()),
  stageName: z.string()
    .min(1, "Stage name is required")
    .max(30, "Stage name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Stage name can only contain letters, numbers, spaces, hyphens, and underscores")
    .transform(val => val.trim()),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16 && age <= 100;
    }, "You must be between 16 and 100 years old"),
  city: z.string()
    .min(1, "City is required")
    .max(50, "City name too long")
    .regex(/^[a-zA-Z\s]+$/, "City can only contain letters and spaces")
    .transform(val => val.trim()),
  verificationLink: z.string()
    .min(1, "Verification link is required")
    .url("Please enter a valid URL (Instagram, SoundCloud, etc.)")
    .refine((url) => {
      const validDomains = ['instagram.com', 'soundcloud.com', 'spotify.com', 'youtube.com', 'beatport.com', 'bandcamp.com', 'mixcloud.com'];
      return validDomains.some(domain => url.includes(domain));
    }, "Please provide a link to Instagram, SoundCloud, Spotify, YouTube, Beatport, Bandcamp, or Mixcloud"),
  securityQuestion: z.string()
    .min(1, "Security question is required"),
  securityAnswer: z.string()
    .min(3, "Security answer must be at least 3 characters")
    .max(100, "Security answer too long")
    .transform(val => val.trim()),
  acceptTerms: z.boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
});

// Password reset schemas
const emailResetSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase().trim()),
});

const securityResetSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase().trim()),
  securityAnswer: z.string()
    .min(1, "Security answer is required")
    .max(100, "Answer too long")
    .transform(val => val.trim()),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
});

const adminContactSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase().trim()),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .transform(val => val.trim()),
});

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;
type EmailResetData = z.infer<typeof emailResetSchema>;
type SecurityResetData = z.infer<typeof securityResetSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const securityQuestions = [
  "What's your favorite underground venue in Bangalore?",
  "Which techno artist got you into the scene?",
  "What's the BPM of your soul?",
  "Name the track that defines your sound?",
  "Which synthesizer would you take to a desert island?",
];

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetMethod, setResetMethod] = useState<'email' | 'security' | 'admin' | null>(null);
  const [userSecurityQuestion, setUserSecurityQuestion] = useState<string>("");
  const [resetStep, setResetStep] = useState<'select' | 'verify' | 'reset' | 'success'>('select');
  const [forcePasswordChange, setForcePasswordChange] = useState<{ email: string } | null>(null);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      stageName: "",
      username: "",
      dateOfBirth: "",
      city: "",
      verificationLink: "",
      securityQuestion: "",
      securityAnswer: "",
      acceptTerms: false,
    },
  });

  const emailResetForm = useForm<EmailResetData>({
    resolver: zodResolver(emailResetSchema),
    defaultValues: { email: "" },
  });

  const securityResetForm = useForm<SecurityResetData>({
    resolver: zodResolver(securityResetSchema),
    defaultValues: {
      email: "",
      securityAnswer: "",
      newPassword: "",
    },
  });

  const adminContactForm = useForm<z.infer<typeof adminContactSchema>>({
    resolver: zodResolver(adminContactSchema),
    defaultValues: {
      email: "",
      firstName: "",
    },
  });

  const generateUsername = (firstName: string, lastName: string, stageName: string) => {
    if (!firstName || !lastName || !stageName) return "";
    
    // Underground music elements
    const undergroundPrefixes = ['dark', 'deep', 'acid', 'sub', 'raw', 'underground', 'vinyl', 'beat', 'bass', 'echo', 'void', 'neon', 'pulse', 'wave', 'synth'];
    const undergroundSuffixes = ['808', 'beats', 'bass', 'drop', 'mix', 'vibe', 'sound', 'tech', 'house', 'acid', 'groove', 'flow', 'soul', 'raw', 'deep'];
    const technoElements = ['kick', 'snare', 'hi', 'loop', 'freq', 'modular', 'analog', 'filter', 'reverb', 'delay', 'distort', 'compress'];
    
    const firstInitial = firstName.charAt(0).toLowerCase();
    const lastInitial = lastName.charAt(0).toLowerCase();
    const cleanStageName = stageName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Generate creative underground combinations
    const randomPrefix = undergroundPrefixes[Math.floor(Math.random() * undergroundPrefixes.length)];
    const randomSuffix = undergroundSuffixes[Math.floor(Math.random() * undergroundSuffixes.length)];
    const randomTechno = technoElements[Math.floor(Math.random() * technoElements.length)];
    const bpmNumber = [120, 124, 128, 132, 136, 140, 145, 150][Math.floor(Math.random() * 8)];
    
    const variations = [
      `${cleanStageName}_${randomSuffix}`,
      `${randomPrefix}_${cleanStageName}`,
      `${cleanStageName}${bpmNumber}`,
      `${firstInitial}${lastInitial}_${randomTechno}`,
      `${cleanStageName}_${randomTechno}`,
      `${randomPrefix}${firstInitial}${lastInitial}`,
      `underground_${cleanStageName}`,
      `${cleanStageName}_bass`,
      `deep_${cleanStageName}`,
      `${cleanStageName}_vinyl`,
      `acid_${cleanStageName}`,
      `${cleanStageName}_${Math.floor(Math.random() * 999) + 100}`,
    ];
    
    // Return the first variation that's at least 3 characters
    return variations.find(v => v.length >= 3) || `underground_${Math.floor(Math.random() * 9999)}`;
  };

  // Watch for changes in firstName, lastName, and stageName to auto-generate username
  const watchedFields = signupForm.watch(['firstName', 'lastName', 'stageName']);
  const [firstName, lastName, stageName] = watchedFields;
  
  // Auto-generate username when all three fields are filled
  useEffect(() => {
    if (firstName && lastName && stageName) {
      const newUsername = generateUsername(firstName, lastName, stageName);

      signupForm.setValue('username', newUsername, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  }, [firstName, lastName, stageName, signupForm]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      
      // Handle forced password change response
      if (response.status === 202 && result.forcePasswordChange) {
        return { forcePasswordChange: true, email: result.email };
      }
      
      return result;
    },
    onSuccess: (data) => {
      // Check if user needs to change password
      if (data.forcePasswordChange) {
        setForcePasswordChange({ email: data.email });
        return;
      }
      
      queryClient.setQueryData(["/api/auth/user"], data);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in to TheCueRoom.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Registration successful!",
        description: "For development: Contact admin or use the verification link to activate your account.",
        duration: 8000,
      });
      
      // Show verification info for development
      if (data?.verificationUrl) {
        setTimeout(() => {
          toast({
            title: "Development Mode",
            description: `Manual verification: ${window.location.origin}${data.verificationUrl}`,
            duration: 10000,
          });
        }, 2000);
      }
      
      setIsLogin(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Email reset mutation
  const emailResetMutation = useMutation({
    mutationFn: async (data: EmailResetData) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: () => {
      setResetStep('success');
      toast({
        title: "Beat Drop Incoming!",
        description: "Password reset link sent to your email. Check your inbox (and spam folder if it's hiding like a secret underground gig)!",
        duration: 6000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Technical Difficulties",
        description: error.message || "Email not found in our underground database. Double-check your spelling!",
        variant: "destructive",
      });
    },
  });

  // Security question reset mutation
  const securityResetMutation = useMutation({
    mutationFn: async (data: SecurityResetData) => {
      const response = await apiRequest("POST", "/api/auth/reset-password-security", data);
      return response.json();
    },
    onSuccess: () => {
      setResetStep('success');
      toast({
        title: "Password Remix Complete!",
        description: "Your password has been updated successfully. Time to drop back into TheCueRoom!",
        duration: 5000,
      });
      setTimeout(() => {
        handleResetComplete();
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Security Check Failed",
        description: error.message || "Wrong answer! Your security response doesn't match our underground records.",
        variant: "destructive",
      });
    },
  });

  // Get security question mutation
  const getSecurityQuestionMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/auth/get-security-question", { email });
      return response.json();
    },
    onSuccess: (data: any) => {
      setUserSecurityQuestion(data.securityQuestion);
      setResetStep('verify');
      securityResetForm.setValue('email', emailResetForm.getValues().email);
    },
    onError: (error: Error) => {
      toast({
        title: "User Not Found",
        description: error.message || "This email isn't in our underground artist database. Check your spelling or apply to join first!",
        variant: "destructive",
      });
    },
  });

  const adminContactMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string }) => {
      const response = await apiRequest("POST", "/api/support/admin-contact", data);
      return response.json();
    },
    onSuccess: () => {
      setResetStep('success');
      toast({
        title: "Support Request Sent!",
        description: "Our admin crew has been notified and will contact you soon. Check your email for updates!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to contact admin support. Please try again or email admin@thecueroom.com directly.",
        variant: "destructive",
      });
    },
  });

  const handleForgotPassword = () => {
    setShowResetPassword(true);
    setResetStep('select');
  };

  const handleResetComplete = () => {
    setShowResetPassword(false);
    setResetMethod(null);
    setUserSecurityQuestion("");
    emailResetForm.reset();
    securityResetForm.reset();
    adminContactForm.reset();
    // Ensure we're back to login view
    setIsLogin(true);
  };

  const handleResetMethodSelect = (method: 'email' | 'security' | 'admin') => {
    setResetMethod(method);
    setResetStep('verify');
  };

  const handlePasswordChangeComplete = () => {
    setForcePasswordChange(null);
    loginForm.reset();
    toast({
      title: "Password changed successfully!",
      description: "You can now log in with your new password.",
    });
  };

  const handlePasswordChangeCancel = () => {
    setForcePasswordChange(null);
    loginForm.reset();
  };

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onSignupSubmit = (data: SignupData) => {
    if (!data.username) {
      toast({
        title: "Username required",
        description: "Username will be auto-generated based on your details.",
        variant: "destructive",
      });
      return;
    }
    signupMutation.mutate(data);
  };

  // Show force password change component if needed
  if (forcePasswordChange) {
    return (
      <ForcePasswordChange
        email={forcePasswordChange.email}
        onPasswordChanged={handlePasswordChangeComplete}
        onCancel={handlePasswordChangeCancel}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <div className="flex items-center space-x-3 mb-2">
            <Logo size="sm" showText={false} />
            <div>
              <DialogTitle className="text-left text-lg font-bold leading-tight">
                {showResetPassword 
                  ? "Reset Your Password"
                  : isLogin 
                    ? "Login to TheCueRoom"
                    : "Join TheCueRoom"
                }
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-muted-foreground leading-tight">
                Underground Music Community
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {showResetPassword ? (
          <div className="space-y-6">
            {resetStep === 'select' && (
              <div className="space-y-4">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2">Lost in the mix? Let's get you back!</h3>
                  <p className="text-sm text-muted-foreground mb-6">Choose your rescue method from our underground toolkit:</p>
                </div>
                
                <div className="grid gap-3">
                  <Card 
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary/50"
                    onClick={() => handleResetMethodSelect('email')}
                  >
                    <CardContent className="flex items-center p-4">
                      <Mail className="h-8 w-8 text-primary mr-4" />
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">Email Reset Link</CardTitle>
                        <CardDescription className="text-sm">
                          Send a secure reset link to your registered email. Fast like a 140 BPM drop!
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary/50"
                    onClick={() => handleResetMethodSelect('security')}
                  >
                    <CardContent className="flex items-center p-4">
                      <HelpCircle className="h-8 w-8 text-primary mr-4" />
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">Security Question</CardTitle>
                        <CardDescription className="text-sm">
                          Answer your underground security question. Prove you're really part of the scene!
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary/50"
                    onClick={() => handleResetMethodSelect('admin')}
                  >
                    <CardContent className="flex items-center p-4">
                      <UserCog className="h-8 w-8 text-primary mr-4" />
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">Contact Admin Support</CardTitle>
                        <CardDescription className="text-sm">
                          Reach out to our underground crew for manual assistance. Human touch guaranteed!
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleResetComplete}
                    className="mt-4 px-4 py-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </div>
            )}

            {resetStep === 'verify' && resetMethod === 'email' && (
              <Form {...emailResetForm}>
                <form onSubmit={emailResetForm.handleSubmit((data) => emailResetMutation.mutate(data))} className="space-y-4">
                  <div className="text-left mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Email Reset Request</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
                  </div>

                  <FormField
                    control={emailResetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="artist@thecueroom.com" 
                            {...field} 
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center space-x-3">
                    <Button 
                      type="submit" 
                      className="px-4 py-2"
                      disabled={emailResetMutation.isPending}
                    >
                      {emailResetMutation.isPending ? "Sending reset link..." : "Send Reset Link"}
                    </Button>

                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setResetStep('select')}
                      className="px-4 py-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Options
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {resetStep === 'verify' && resetMethod === 'security' && !userSecurityQuestion && (
              <Form {...emailResetForm}>
                <form onSubmit={emailResetForm.handleSubmit((data) => getSecurityQuestionMutation.mutate(data.email))} className="space-y-4">
                  <div className="text-left mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <HelpCircle className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Security Question Reset</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">First, enter your email to retrieve your security question</p>
                  </div>

                  <FormField
                    control={emailResetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="artist@thecueroom.com" 
                            {...field} 
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center space-x-3">
                    <Button 
                      type="submit" 
                      className="px-4 py-2"
                      disabled={getSecurityQuestionMutation.isPending}
                    >
                      {getSecurityQuestionMutation.isPending ? "Finding your question..." : "Get Security Question"}
                    </Button>

                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setResetStep('select')}
                      className="px-4 py-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Options
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {resetStep === 'verify' && resetMethod === 'security' && userSecurityQuestion && (
              <Form {...securityResetForm}>
                <form onSubmit={securityResetForm.handleSubmit((data) => securityResetMutation.mutate(data))} className="space-y-4">
                  <div className="text-left mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Answer Your Security Question</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Time to prove you're really you!</p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium text-sm mb-2">Your Security Question:</p>
                    <p className="text-sm italic">{userSecurityQuestion}</p>
                  </div>

                  <FormField
                    control={securityResetForm.control}
                    name="securityAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Answer</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your security answer"
                            {...field} 
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityResetForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Your new secure password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center space-x-3">
                    <Button 
                      type="submit" 
                      className="px-4 py-2"
                      disabled={securityResetMutation.isPending}
                    >
                      {securityResetMutation.isPending ? "Updating password..." : "Reset Password"}
                    </Button>

                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        setResetStep('select');
                        setUserSecurityQuestion("");
                      }}
                      className="px-4 py-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Options
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {resetStep === 'verify' && resetMethod === 'admin' && (
              <Form {...adminContactForm}>
                <form onSubmit={adminContactForm.handleSubmit((data) => adminContactMutation.mutate(data))} className="space-y-4">
                  <div className="text-left mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCog className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Contact Admin Support</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Our underground crew will help you out personally!</p>
                  </div>

                  <FormField
                    control={adminContactForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="artist@thecueroom.com" 
                            {...field} 
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={adminContactForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your first name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center space-x-3">
                    <Button 
                      type="submit" 
                      className="px-4 py-2"
                      disabled={adminContactMutation.isPending}
                    >
                      {adminContactMutation.isPending ? "Notifying admins..." : "Contact Admin Support"}
                    </Button>

                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setResetStep('select')}
                      className="px-4 py-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Options
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {resetStep === 'success' && (
              <div className="text-left space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {resetMethod === 'admin' ? 'Support Request Sent!' : 'Password Reset Successful!'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {resetMethod === 'email' 
                    ? "Check your email for the reset link. It should arrive faster than a hardstyle kick!"
                    : resetMethod === 'admin'
                    ? "Your support request has been sent to our underground crew. Check your email for updates!"
                    : "Your password has been updated. Welcome back to the underground!"
                  }
                </p>
                <div className="text-center">
                  <Button 
                    onClick={handleResetComplete}
                    className="px-4 py-2"
                  >
                    Continue to Login
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : isLogin ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="artist@thecueroom.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Your secure password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="cue-button px-8 py-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entering..." : "Enter The Room"}
              </Button>

              <div className="space-y-2">
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsLogin(false)}
                    className="text-sm"
                  >
                    New to thecueroom? Apply to join
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={signupForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="stageName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Stage Name
                </label>
                <input
                  id="stageName"
                  type="text"
                  placeholder="e.g., Phoenix Beats"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...signupForm.register("stageName")}
                />
                {signupForm.formState.errors.stageName && (
                  <p className="text-sm font-medium text-destructive">
                    {signupForm.formState.errors.stageName.message}
                  </p>
                )}
              </div>

              <FormField
                control={signupForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username (Auto-generated)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Automatically generated from your details"
                        className="bg-muted"
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="artist@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 8 characters"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={signupForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={signupForm.control}
                name="verificationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist Verification Link</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="SoundCloud, Instagram, Beatport, or Bandcamp URL" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="securityQuestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Question</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a question for password recovery" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {securityQuestions.map((question, index) => (
                          <SelectItem key={index} value={question}>
                            {question}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="securityAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Answer</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your answer to the security question"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        I acknowledge and agree to the terms and conditions of TheCueRoom underground community
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="cue-button px-8 py-2"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Applying..." : "Apply to Join"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsLogin(true)}
                  className="text-sm p-0 h-auto"
                >
                  Already in the underground? Login
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}