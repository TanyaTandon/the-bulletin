
import React, { useState } from "react";
import Layout from "@/components/Layout";
import CreateContentForm from "@/components/CreateContentForm";
import ContentCard from "@/components/ContentCard";
import TypewriterText from "@/components/TypewriterText";
import SocialConnections from "@/components/SocialConnections";
import { useUser, ContentType } from "@/contexts/UserContext";
import { Filter } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { contents, activeGroup } = useUser();
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | "all">("all");

  // Filter contents based on selected criteria
  const filteredContents = contents.filter(content => {
    // Filter by content type
    if (contentTypeFilter !== "all" && content.type !== contentTypeFilter) {
      return false;
    }
    
    // Filter by active group if one is selected
    if (activeGroup && content.groupId !== activeGroup.id) {
      return false;
    }
    
    return true;
  });

  return (
    <Layout>
      <TypewriterText text="Hey Jackson. Welcome to the bulletin. Upload notes, pictures, writing pieces, art, month summaries and we will curate a bulletin and physically mail it to your friends." />
      
      {/* Add the SocialConnections component */}
      <SocialConnections />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xs font-bold tracking-tight text-primary">Share your April adventures with your friends</h1>
          <p className="text-xs text-muted-foreground">
            {activeGroup 
              ? `Showing ${activeGroup.name} group content`
              : "Showing all your content"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setContentTypeFilter("all")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setContentTypeFilter("picture")}>
                Pictures Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setContentTypeFilter("note")}>
                Notes Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setContentTypeFilter("calendar")}>
                Calendar Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-8">
        <CreateContentForm />
      </div>

      {filteredContents.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <p className="text-xl font-medium text-muted-foreground">No content</p>
          </div>
          <h3 className="text-lg font-medium">No content yet</h3>
          <p className="text-muted-foreground mt-1">
            Create your first piece of content using the form above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Index;
