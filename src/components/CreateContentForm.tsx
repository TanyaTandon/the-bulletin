
import React, { useState } from "react";
import { useUser, ContentType } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Image, Pencil, Users, Calendar } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const CreateContentForm: React.FC = () => {
  const { activePersona, activeGroup, addContent } = useUser();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<ContentType>("note");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shareOption, setShareOption] = useState("everyone");
  const [imageSize, setImageSize] = useState("medium"); // New state for image size
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activePersona) {
      toast({
        title: "No Active Persona",
        description: "Please select a persona before creating content.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your content.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && contentType !== "picture" && contentType !== "calendar") {
      toast({
        title: "Content Required",
        description: "Please add some content.",
        variant: "destructive",
      });
      return;
    }

    addContent({
      type: contentType,
      title: title.trim(),
      content: contentType === "picture" 
        ? (imagePreview ? `${imagePreview}|size:${imageSize}` : "") 
        : contentType === "calendar"
        ? date ? date.toISOString() : new Date().toISOString()
        : content.trim(),
      createdBy: {
        personaId: activePersona.id,
        personaName: activePersona.name,
      },
      groupId: activeGroup?.id,
    });

    toast({
      title: "Content Created",
      description: "Your content has been created successfully.",
    });

    // Reset form
    setTitle("");
    setContent("");
    setImagePreview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Content</CardTitle>
        <CardDescription>
          Share as {activePersona?.name || "No Persona Selected"}
          {activeGroup && ` in ${activeGroup.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Share options */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Share with
            </Label>
            <RadioGroup
              defaultValue="everyone"
              value={shareOption}
              onValueChange={setShareOption}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="everyone" id="everyone" />
                <Label htmlFor="everyone" className="cursor-pointer">Everyone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected" className="cursor-pointer">Selected Friends</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your content"
            />
          </div>

          <Tabs defaultValue="note" onValueChange={(value) => setContentType(value as ContentType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="note" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Note
              </TabsTrigger>
              <TabsTrigger value="writing" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Writing
              </TabsTrigger>
              <TabsTrigger value="picture" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Picture
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="note" className="space-y-2">
              <Label htmlFor="note-content">Note Content</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your month summary or special messages to your friends"
                rows={5}
              />
            </TabsContent>

            <TabsContent value="writing" className="space-y-2">
              <Label htmlFor="writing-content">Writing Content</Label>
              <Textarea
                id="writing-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your month summary or special messages to your friends"
                rows={10}
              />
            </TabsContent>

            <TabsContent value="picture" className="space-y-2">
              <Label htmlFor="picture-upload">Upload Picture</Label>
              <Input
                id="picture-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              
              {/* Image size selection */}
              <div className="mt-4">
                <Label htmlFor="image-size">Image Size</Label>
                <RadioGroup
                  defaultValue="medium"
                  value={imageSize}
                  onValueChange={setImageSize}
                  className="flex flex-col space-y-1 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small" className="cursor-pointer">Small (thumbnail)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer">Medium (half-page)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large" className="cursor-pointer">Large (full-page)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-2">
              <Label>Select a date for your April calendar</Label>
              <div className="flex flex-col items-center p-4 border rounded-md bg-card">
                <p className="text-sm text-muted-foreground mb-4">
                  Mark an important date in April 2025 to share with your friends
                </p>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  defaultMonth={new Date(2025, 3)} // April 2025
                  month={new Date(2025, 3)}
                  className="p-3 pointer-events-auto border bg-background rounded-md shadow-sm"
                  styles={{
                    month: { width: "100%" },
                    caption: { color: "#F472B6" },
                    day_today: { backgroundColor: "#FEC6A1", fontWeight: "bold" },
                    day_selected: { backgroundColor: "#E5DEFF", color: "#333", fontWeight: "bold" },
                  }}
                />
                {date && (
                  <div className="mt-4 p-3 bg-muted rounded-md text-center w-full">
                    <p className="font-medium">Selected Date:</p>
                    <p>{format(date, "MMMM d, yyyy")}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={handleSubmit} className="w-full">
          Create {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateContentForm;
