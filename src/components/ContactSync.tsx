import React, { useState } from "react";
import { useUser } from "@/providers/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Phone, Check, UserPlus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

// Mock function to check if users exist in our database
// In a real app, this would call an API
const checkExistingUsers = (phones: string[]) => {
  // Simulate some existing users
  const existingInDatabase = ["+12345678901", "+15678901234", "+18901234567"];
  const results = phones.map((phone) => ({
    phone,
    exists: existingInDatabase.includes(phone),
  }));
  return results;
};

interface ContactSyncProps {
  showResults?: boolean;
}

const ContactSync: React.FC<ContactSyncProps> = ({ showResults = false }) => {
  const { importContacts, friends } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<
    Array<{
      name: string;
      phone: string;
      selected: boolean;
      isExisting?: boolean;
      inDatabase?: boolean;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncedContacts, setSyncedContacts] = useState<
    Array<{
      name: string;
      phone: string;
      inDatabase: boolean;
    }>
  >([]);
  const [hasSynced, setHasSynced] = useState(false);

  const existingPhones = new Set(friends.map((f) => f.phone));

  const handleOpenContacts = async () => {
    setIsLoading(true);

    // Simulate delay for accessing contacts
    setTimeout(() => {
      const deviceContacts = getMockContacts();

      // Check which contacts exist in our database
      const phones = deviceContacts.map((c) => c.phone);
      const existingUsers = checkExistingUsers(phones);

      const mappedContacts = deviceContacts.map((contact) => {
        const existingUser = existingUsers.find(
          (u) => u.phone === contact.phone
        );
        return {
          ...contact,
          selected: false,
          isExisting: existingPhones.has(contact.phone),
          inDatabase: existingUser?.exists || false,
        };
      });

      setContacts(mappedContacts);
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
    setContacts(
      contacts.map((contact) => ({
        ...contact,
        selected: !contact.isExisting,
      }))
    );
  };

  const handleImportContacts = () => {
    const selectedContacts = contacts.filter((contact) => contact.selected);

    if (selectedContacts.length === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact to import",
        variant: "destructive",
      });
      return;
    }

    importContacts(selectedContacts);

    // Save sync results for display if needed
    const syncResults = contacts.map((contact) => ({
      name: contact.name,
      phone: contact.phone,
      inDatabase: contact.inDatabase || false,
    }));

    setSyncedContacts(syncResults);
    setHasSynced(true);

    toast({
      title: "Contacts imported",
      description: `${selectedContacts.length} contact${
        selectedContacts.length === 1 ? "" : "s"
      } imported successfully`,
    });

    setIsOpen(false);
  };

  return (
    <>
      {showResults && hasSynced ? (
        <div className="mt-6 rounded-md border p-4">
          <h3 className="text-lg font-medium mb-3">Synced Contacts</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {syncedContacts.map((contact, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {contact.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contact.phone}
                    </p>
                  </div>
                </div>
                {contact.inDatabase ? (
                  <span className="text-xs flex items-center text-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    User exists
                  </span>
                ) : (
                  <span className="text-xs flex items-center text-gray-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not in app
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleOpenContacts}
          disabled={isLoading}
        >
          <Phone className="h-4 w-4" />
          {isLoading ? "Accessing contacts..." : "Sync contacts"}
        </Button>
      )}

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
              <div
                key={contact.phone}
                className="flex items-center space-x-4 py-2 border-b"
              >
                <Checkbox
                  id={`contact-${index}`}
                  checked={contact.selected}
                  onCheckedChange={() => handleToggleContact(index)}
                  disabled={contact.isExisting}
                />
                <div className="flex items-center gap-2 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {contact.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label
                      htmlFor={`contact-${index}`}
                      className="text-sm font-medium"
                    >
                      {contact.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {contact.phone}
                    </p>
                  </div>
                </div>
                {contact.isExisting ? (
                  <span className="text-xs flex items-center text-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Added
                  </span>
                ) : contact.inDatabase ? (
                  <span className="text-xs flex items-center text-blue-600">
                    <Check className="h-3 w-3 mr-1" />
                    In app
                  </span>
                ) : null}
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
