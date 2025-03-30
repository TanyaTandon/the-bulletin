
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const CreatePersonaForm: React.FC = () => {
  const { addPersona } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your persona.",
        variant: "destructive",
      });
      return;
    }

    addPersona({
      name: name.trim(),
      bio: bio.trim(),
    });

    toast({
      title: "Persona Created",
      description: "Your new persona has been created successfully.",
    });

    navigate("/");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Persona</CardTitle>
        <CardDescription>
          Create a new persona to share content under different identities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Persona Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter persona name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio for this persona..."
              rows={3}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={handleSubmit} className="w-full">
          Create Persona
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreatePersonaForm;
