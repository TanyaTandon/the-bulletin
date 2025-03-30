
import React, { useState } from "react";
import Layout from "@/components/Layout";
import CreateContentForm from "@/components/CreateContentForm";
import ContentCard from "@/components/ContentCard";
import FriendsList from "@/components/FriendsList";
import { useUser, ContentType } from "@/contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image, Pencil, Plus, Filter } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { contents, activePersona, activeGroup } = useUser();
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | "all">("all");
  const [showForm, setShowForm] = useState(false);

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
      {/* Add the FriendsList component at the top */}
      <FriendsList />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Content</h1>
          <p className="text-muted-foreground">
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
              <DropdownMenuItem onClick={() => setContentTypeFilter("writing")}>
                Writing Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Hide Form" : "Create Content"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateContentForm />
        </div>
      )}

      {filteredContents.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No content yet</h3>
          <p className="text-muted-foreground mt-1">
            {showForm 
              ? "Fill out the form above to create your first piece of content" 
              : "Click 'Create Content' to add your first picture, note, or writing piece"}
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
