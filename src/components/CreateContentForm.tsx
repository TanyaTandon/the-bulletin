import React, { useState } from "react";
import { useUser, ContentType } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Image, Users, Calendar, Heart, Filter } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

const CreateContentForm: React.FC = () => {
  const { activeGroup, addContent, contents, personas } = useUser();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<ContentType>("note");
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [shareOption, setShareOption] = useState("everyone");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarNote, setCalendarNote] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  
  const calendarDates = contents
    .filter(item => item.type === "calendar")
    .map(item => {
      const [dateString] = item.content.split('|');
      return new Date(dateString);
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && contentType !== "picture" && contentType !== "calendar") {
      toast({
        title: "Content Required",
        description: "Please add some content.",
        variant: "destructive",
      });
      return;
    }

    let finalContent = "";
    if (contentType === "picture") {
      if (imagePreview.length > 4) {
        toast({
          title: "Too many images",
          description: "Please select a maximum of 4 images. Only the first 4 will be used.",
        });
        finalContent = imagePreview.slice(0, 4).join('|');
      } else if (imagePreview.length === 0) {
        toast({
          title: "No Images Selected",
          description: "Please select at least one image.",
          variant: "destructive",
        });
        return;
      } else {
        finalContent = imagePreview.join('|');
      }
    } else if (contentType === "calendar") {
      finalContent = date ? `${date.toISOString()}|note:${calendarNote}` : new Date().toISOString();
    } else {
      finalContent = content.trim();
    }

    addContent({
      type: contentType,
      title: title.trim() || (contentType === "calendar" ? `Event on ${date ? format(date, "MMMM d, yyyy") : "today"}` : "Untitled"),
      content: finalContent,
      createdBy: {
        personaId: "p1",
        personaName: "Default Persona",
      },
      groupId: activeGroup?.id,
    });

    toast({
      title: "Content Created",
      description: "Your content has been created successfully.",
    });

    setTitle("");
    setContent("");
    setImagePreview([]);
    setCalendarNote("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      if (fileArray.length > 4) {
        toast({
          title: "Too many images",
          description: "Please select a maximum of 4 images. Only the first 4 will be processed.",
        });
      }
      
      const imagesToProcess = fileArray.slice(0, 4);
      
      setImagePreview([]);
      
      imagesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFriendSelection = (personaId: string) => {
    setSelectedFriends(current => 
      current.includes(personaId)
        ? current.filter(id => id !== personaId)
        : [...current, personaId]
    );
  };

  const isDateWithHeart = (date: Date) => {
    return calendarDates.some(calDate => 
      calDate.getDate() === date.getDate() && 
      calDate.getMonth() === date.getMonth() && 
      calDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xs">Create Content</CardTitle>
        <CardDescription>
          {activeGroup && `in ${activeGroup.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            
            {shareOption === "selected" && (
              <div className="mt-2">
                <Popover open={showFriendsList} onOpenChange={setShowFriendsList}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-between"
                      onClick={() => setShowFriendsList(!showFriendsList)}
                    >
                      <span>
                        {selectedFriends.length > 0 
                          ? `${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''} selected`
                          : 'Select friends to share with'}
                      </span>
                      <Filter className="h-4 w-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-4">
                    <div className="mb-2 pb-2 border-b">
                      <h4 className="font-medium">Select Friends</h4>
                      <p className="text-xs text-muted-foreground">Choose who you want to share with</p>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {personas.filter(p => p.id !== "p1").map(persona => (
                        <div key={persona.id} className="flex items-center space-x-2 p-1 hover:bg-muted rounded">
                          <Checkbox 
                            id={`friend-${persona.id}`}
                            checked={selectedFriends.includes(persona.id)}
                            onCheckedChange={() => handleFriendSelection(persona.id)}
                          />
                          <Label 
                            htmlFor={`friend-${persona.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {persona.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedFriends.length > 0 && (
                      <div className="mt-3 pt-2 border-t flex justify-between items-center">
                        <span className="text-sm">{selectedFriends.length} selected</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedFriends([])}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your content (optional)"
            />
          </div>

          <Tabs defaultValue="note" onValueChange={(value) => setContentType(value as ContentType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="note" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Note
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

            <TabsContent value="picture" className="space-y-2">
              <Label htmlFor="picture-upload">
                Please add 1-4 pictures
              </Label>
              <Input
                id="picture-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
                multiple
              />
              
              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative h-48 bg-muted rounded-md overflow-hidden">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
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
                  modifiers={{
                    withHeart: calendarDates
                  }}
                  modifiersStyles={{
                    withHeart: {
                      color: "#E66767",
                      fontWeight: "bold"
                    }
                  }}
                  components={{
                    DayContent: ({ date, displayMonth }) => {
                      const hasHeart = isDateWithHeart(date);
                      return (
                        <div className="flex flex-col items-center justify-center h-full">
                          <span>{date.getDate()}</span>
                          {hasHeart && <Heart className="h-3 w-3 text-red-400 mt-0.5" />}
                        </div>
                      );
                    }
                  }}
                />
                {date && (
                  <div className="mt-4 p-3 bg-muted rounded-md w-full">
                    <p className="font-medium">Selected Date:</p>
                    <p>{format(date, "MMMM d, yyyy")}</p>
                    
                    <div className="mt-3">
                      <Label htmlFor="calendar-note" className="block mb-2">Add a note for this date:</Label>
                      <Textarea
                        id="calendar-note"
                        value={calendarNote}
                        onChange={(e) => setCalendarNote(e.target.value)}
                        placeholder="What's happening on this day?"
                        rows={3}
                        className="w-full"
                      />
                    </div>
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
