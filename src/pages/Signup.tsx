import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Heart } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Error",
        description: "Please fill in all address fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Account created",
        description: "Welcome! Your account has been created successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-black lowercase" style={{ fontFamily: 'Sometype Mono, monospace' }}>
          the bulletin.
        </h1>
        <div className="flex items-center justify-center mt-2 text-black">
          <Mail className="h-5 w-5" />
          <Heart className="h-4 w-4 ml-1 fill-current" />
        </div>
      </div>
      <Card className="w-[380px]">
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
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="fullName"
                      type="text"
                      className="pl-9"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email"
                      type="email"
                      className="pl-9"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password"
                      type="password"
                      className="pl-9"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input 
                    id="street"
                    type="text"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City/Town</Label>
                  <Input 
                    id="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="San Francisco"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="California"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input 
                    id="zipCode"
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="94105"
                    pattern="[0-9]{5}"
                    title="Five digit zip code"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
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
