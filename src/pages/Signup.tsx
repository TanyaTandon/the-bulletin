
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, Lock, User, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const handleNextStep = () => {
    if (step === 1 && !email) {
      toast({
        title: "Email required",
        description: "Please enter your email to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !password) {
      toast({
        title: "Password required",
        description: "Please create a password to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 3 && !name) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSignUp();
    }
  };
  
  const handleSignUp = async () => {
    await signUp(email, password, name, phone);
    navigate("/");
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold lowercase" style={{ fontFamily: 'Courier New, monospace' }}>the bulletin.</h1>
          </div>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Follow the steps below to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step >= i ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i}
                </div>
                <div className={`text-xs ${step === i ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {i === 1 && "Account"}
                  {i === 2 && "Password"}
                  {i === 3 && "Profile"}
                </div>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 555-5555"
                    className="pl-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create a password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Use at least 8 characters with a mix of letters, numbers & symbols.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This is how you'll appear to your friends on the bulletin.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevStep}
            disabled={step === 1}
            className={step === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNextStep} disabled={loading}>
            {step < 3 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              loading ? "Creating account..." : "Complete Setup"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {step <= 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/signin")}>
              Sign in
            </Button>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignUp;
