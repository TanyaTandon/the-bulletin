import React, { useState } from "react";
import { useUser } from "@/providers/contexts/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const CreateGroupForm: React.FC = () => {
  const { personas, addGroup } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your group.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPersonas.length === 0) {
      toast({
        title: "Members Required",
        description: "Please select at least one persona for the group.",
        variant: "destructive",
      });
      return;
    }

    const groupMembers = personas.filter((persona) =>
      selectedPersonas.includes(persona.id)
    );

    addGroup({
      name: name.trim(),
      description: description.trim(),
      members: groupMembers,
    });

    toast({
      title: "Group Created",
      description: "Your new group has been created successfully.",
    });

    navigate("/");
  };

  const togglePersona = (personaId: string) => {
    setSelectedPersonas((prev) =>
      prev.includes(personaId)
        ? prev.filter((id) => id !== personaId)
        : [...prev, personaId]
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Group</CardTitle>
        <CardDescription>
          Create a new group to collaborate with different personas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a short description for this group..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Select Personas for this Group</Label>
            <div className="space-y-2">
              {personas.map((persona) => (
                <div key={persona.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`persona-${persona.id}`}
                    checked={selectedPersonas.includes(persona.id)}
                    onCheckedChange={() => togglePersona(persona.id)}
                  />
                  <Label htmlFor={`persona-${persona.id}`}>
                    {persona.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={handleSubmit} className="w-full">
          Create Group
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateGroupForm;
