
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

// Mock data for profiles
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '123-456-7890',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '555-123-4567',
    created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '3',
    name: 'Bob Johnson',
    phone: '789-012-3456',
    created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

const UserProfilesTable = () => {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return mock data
      setProfiles(mockProfiles);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Failed to load profiles',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Profiles</h2>
        <Button variant="outline" size="sm" onClick={fetchProfiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableCaption>Mock data - Supabase integration disabled</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                </TableRow>
              ))
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No profiles found
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.phone || 'N/A'}</TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserProfilesTable;
