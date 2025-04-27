
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Content, useUser } from "@/contexts/UserContext";
import { Image, FileText, Pencil } from "lucide-react";
import { format } from "date-fns";

interface ContentCardProps {
  content: Content;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const { getPersonaById, getGroupById } = useUser();

  const persona = getPersonaById(content.createdBy.personaId);
  const group = content.groupId ? getGroupById(content.groupId) : null;

  const renderIcon = () => {
    switch (content.type) {
      case "picture":
        return <Image className="h-5 w-5 text-accent" />;
      case "note":
        return <FileText className="h-5 w-5 text-primary" />;
      case "writing":
        return <Pencil className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (content.type) {
      case "picture":
        return (
          <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
            <img
              src={content.content}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "note":
        return (
          <div className="p-4 bg-yellow-50 rounded-md">
            <p className="whitespace-pre-wrap">{content.content}</p>
          </div>
        );
      case "writing":
        return (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{content.content}</p>
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <div className="mr-2">{renderIcon()}</div>
        <div className="flex-1">
          <CardTitle className="text-lg">{content.title}</CardTitle>
          <CardDescription>
            {format(new Date(content.createdAt), "MMM d, yyyy")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {renderContent()}
      </CardContent>
      <CardFooter className="pt-2 border-t text-sm text-muted-foreground">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback>
              {persona?.name.substring(0, 2) || "?"}
            </AvatarFallback>
          </Avatar>
          <span>
            {persona?.name} {group && `· ${group.name}`}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
