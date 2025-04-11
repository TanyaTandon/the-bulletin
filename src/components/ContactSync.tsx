
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Phone, Check, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock function to simulate accessing device contacts
// In a real app, this would use the device's contact API
const getMockContacts = () => {
  return [
    { name: "Taylor Swift", phone: "+12345678901" },
    { name: "Beyoncé", phone: "+13456789012" },
    { name: "Ariana Grande", phone: "+14567890123" },
    { name: "Drake", phone: "+15678901234" },
    { name: "Ed Sheeran", phone: "+16789012345" },
    { name: "Billie Eilish", phone: "+17890123456" },
    { name: "Justin Bieber", phone: "+18901234567" },
    { name: "Rihanna", phone: "+19012345678" },
  ];
};

const ContactSync = () => {
  const { importContacts, friends } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<Array<{name: string, phone: string, selected: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const existingPhones = new Set(friends.map(f => f.phone));
  
  const handleOpenContacts = async () => {
    setIsLoading(true);
    
    // Simulate delay for accessing contacts
    setTimeout(() => {
      const deviceContacts = getMockContacts().map(contact => ({
        ...contact,
        selected: false,
        isExisting: existingPhones.has(contact.phone)
      }));
      
      setContacts(deviceContacts);
      setIsLoading(false);
      setIsOpen(true);
    }, 1000);
  };

  const handleToggleContact = (index: number) => {
    const updatedContacts = [...contacts];
    updatedContacts[index].selected = !updatedContacts[index].selected;
    setContacts(updatedContacts);
  };

  const handleSelectAll = () => {
    setContacts(contacts.map(contact => ({
      ...contact,
      selected: !contact.isExisting
    })));
  };

  const handleImportContacts = () => {
    const selectedContacts = contacts.filter(contact => contact.selected);
    
    if (selectedContacts.length === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact to import",
        variant: "destructive"
      });
      return;
    }
    
    importContacts(selectedContacts);
    
    toast({
      title: "Contacts imported",
      description: `${selectedContacts.length} contact${selectedContacts.length === 1 ? '' : 's'} imported successfully`,
    });
    
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handleOpenContacts}
        disabled={isLoading}
      >
        <Phone className="h-4 w-4" />
        {isLoading ? "Accessing contacts..." : "Sync contacts"}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sync contacts</DialogTitle>
            <DialogDescription>
              Select friends from your contacts to add to your bulletin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex justify-between">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select all
            </Button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto mt-2">
            {contacts.map((contact, index) => (
              <div key={contact.phone} className="flex items-center space-x-4 py-2 border-b">
                <Checkbox
                  id={`contact-${index}`}
                  checked={contact.selected}
                  onCheckedChange={() => handleToggleContact(index)}
                  disabled={contact.isExisting}
                />
                <div className="flex items-center gap-2 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor={`contact-${index}`} className="text-sm font-medium">
                      {contact.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                {contact.isExisting && (
                  <span className="text-xs flex items-center text-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Added
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportContacts}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactSync;
