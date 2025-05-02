
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Heart } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useIsMobile } from "@/hooks/use-mobile";
import { useClerk, useSignUp, useSignIn } from "@clerk/clerk-react";
import sendError from "@/hooks/use-sendError";
import { createNewUser } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const isMobile = useIsMobile();
  
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { session } = useClerk();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    if (!isSignUpLoaded) {
      toast({
        title: "Error",
        description: "Authentication system not loaded. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!fullName || !email || !password || !phoneNumber || !address) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to create your account.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      // Format phone number to standard E.164 format for better compatibility
      let formattedPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhoneNumber = '+1' + phoneNumber.replace(/\D/g, '');
      }

      // Try to create the user with Clerk
      await signUp.create({
        emailAddress: email,
        password,
        phoneNumber: formattedPhoneNumber,
      });

      // Prepare phone verification
      await signUp.preparePhoneNumberVerification();
      
      // Show verification step
      setShowVerification(true);
      toast({
        title: "Verification required",
        description: "Please enter the code sent to your phone.",
      });
    } catch (error) {
      console.error("SignUp error:", error);
      sendError(phoneNumber, "handleSignUp", error as any, {
        email,
        fullName,
        phoneNumber,
      });
      toast({
        title: "Error",
        description: "Something went wrong during signup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length < 6) {
      toast({
        title: "Invalid code",
        description: "Please enter all 6 digits of your verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Attempt phone verification with Clerk
      const completeSignUp = await signUp.attemptPhoneNumberVerification({
        code: verificationCode,
      });
      
      if (completeSignUp.status !== "complete") {
        toast({
          title: "Verification pending",
          description: "Please complete the verification process.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Set the user as active in Clerk
      await setActive({ session: completeSignUp.createdSessionId });
      
      // Create user record in your database
      const userId = uuidv4();
      const result = await createNewUser({
        name: fullName,
        id: userId,
        created_user_id: userId,
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : '+1' + phoneNumber.replace(/\D/g, ''),
        fullAddress: address
      });
      
      if (!result.success) {
        console.error("Failed to create user in database:", result.error);
        sendError(phoneNumber, "createUser", "Failed to create user in database", {
          userId,
          fullName,
          phoneNumber,
        });
        toast({
          title: "Account partially created",
          description: "There was an issue setting up your profile. Please contact support.",
          variant: "destructive",
        });
        // Still redirect as auth is completed
        navigate("/");
        return;
      }

      toast({
        title: "Account created",
        description: "Welcome! Your account has been created successfully.",
      });
      navigate("/");
    } catch (error) {
      console.error("Verification error:", error);
      sendError(phoneNumber, "handleVerifyCode", error as any, {
        phoneNumber,
      });
      toast({
        title: "Verification failed",
        description: "Invalid code or network issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    if (!isSignInLoaded) {
      toast({
        title: "Error",
        description: "Authentication system not loaded. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const emailField = (event.currentTarget.elements.namedItem('email-signin') as HTMLInputElement)?.value;
    const passwordField = (event.currentTarget.elements.namedItem('password-signin') as HTMLInputElement)?.value;

    if (!emailField || !passwordField) {
      toast({
        title: "Missing information",
        description: "Please provide both email and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await signIn.create({
        identifier: emailField,
        password: passwordField,
      });
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      } else {
        toast({
          title: "Additional verification required",
          description: "Please complete the verification process.",
        });
      }
    } catch (error) {
      console.error("SignIn error:", error);
      sendError("unknown", "handleSignIn", error as any, {
        email: emailField,
      });
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center px-4 max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black lowercase" style={{ fontFamily: 'Sometype Mono, monospace' }}>
            the bulletin.
          </h1>
          <div className="flex items-center justify-center mt-2 text-black">
            <Mail className="h-5 w-5" />
            <Heart className="h-4 w-4 ml-1 fill-current" />
          </div>
        </div>
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Verification</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your phone</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-full flex justify-center px-2">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
                className="gap-1 md:gap-2"
                containerClassName={isMobile ? "justify-center" : "justify-center"}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className={isMobile ? "h-10 w-10 md:h-12 md:w-12 text-lg" : "h-12 w-12 text-lg"} />
                  <InputOTPSlot index={1} className={isMobile ? "h-10 w-10 md:h-12 md:w-12 text-lg" : "h-12 w-12 text-lg"} />
                  <InputOTPSlot index={2} className={isMobile ? "h-10 w-10 md:h-12 md:w-12 text-lg" : "h-12 w-12 text-lg"} />
                  <InputOTPSlot index={3} className={isMobile ? "h-10 w-10 md:h-12 md:w-12 text-lg" : "h-12 w-12 text-lg"} />
                  <InputOTPSlot index={4} className={isMobile ? "h-10 w-10 md:h-12 md:w-12 text-lg" : "h-12 w-12 text-lg"} />
                  <InputOTPSlot index={5} className={isMobile ? "h-10 w-10 md:h-12 md:w-12 text-lg" : "h-12 w-12 text-lg"} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="space-y-4 w-full">
              <Button 
                onClick={handleVerifyCode} 
                className="w-full" 
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowVerification(false)}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground pt-2">
              Didn't receive a code? <button 
                className="text-primary font-medium hover:underline" 
                onClick={async () => {
                  try {
                    await signUp.preparePhoneNumberVerification();
                    toast({ 
                      title: "Code resent", 
                      description: "Please check your phone for a new code." 
                    });
                  } catch (error) {
                    console.error("Failed to resend code:", error);
                    sendError(phoneNumber, "resendCode", error as any, { phoneNumber });
                    toast({ 
                      title: "Failed to resend", 
                      description: "Please try again or contact support." 
                    });
                  }
                }}
                disabled={isLoading}
              >
                Resend
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-black lowercase" style={{ fontFamily: 'Sometype Mono, monospace' }}>
          the bulletin.
        </h1>
        <div className="flex items-center justify-center mt-2 text-black">
          <Mail className="h-5 w-5" />
          <Heart className="h-4 w-4 ml-1 fill-current" />
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email-signin" 
                      type="email" 
                      placeholder="name@example.com"
                      className="pl-9"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password-signin" 
                      type="password"
                      className="pl-9"
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="text-center mt-4 text-sm" style={{ color: '#D6BCFA' }}>
                No ads. No scroll. 
                <br />
                Just love. Just updates from your friends, 
                <br />
                printed for you, and delivered to your door, monthly
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      type="text"
                      className="pl-9"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email-signup" 
                      type="email"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password-signup" 
                      type="password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-signup">Phone Number</Label>
                  <div className="relative">
                    <Input 
                      id="phone-signup" 
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-signup">Address</Label>
                  <div className="relative">
                    <Input 
                      id="address-signup" 
                      type="text"
                      placeholder="Your full mailing address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Submit"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
