import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Shield, ShieldOff, ChevronLeft, ChevronRight, MoreVertical, Crown, CrownOff } from "lucide-react";
import styles from '../../styles/AdminPage.module.css';
import { useUser } from '@clerk/nextjs';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

const API_BASE_URL = 'https://beunghar-api-92744157839.asia-south1.run.app';

const UserActionsModal = ({ user, onToggleAdmin, onTogglePremium }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Defensive check for user data
  if (!user || typeof user !== 'object') {
    console.error('Invalid user data:', user);
    return null;
  }

  // Ensure required properties exist with defaults
  const userData = {
    name: user.name || 'Unknown User',
    isAdmin: !!user.isAdmin,
    membershipStatus: user.membershipStatus || 'free'
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="hover:bg-muted"
        onClick={() => setIsOpen(true)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            
            <div
              className="relative z-50 w-full max-w-lg bg-background p-6 rounded-lg shadow-lg"
            >
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">User Actions</h3>
                  <p className="text-sm text-muted-foreground">Manage {userData.name}'s account settings</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Admin Status</h4>
                      <p className="text-sm text-muted-foreground">
                        {userData.isAdmin ? 'Currently an admin. Remove admin privileges?' : 'Grant admin privileges to this user?'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onToggleAdmin?.();
                        setIsOpen(false);
                      }}
                      className="min-w-[120px]"
                    >
                      {userData.isAdmin ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-2" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Premium Status</h4>
                      <p className="text-sm text-muted-foreground">
                        {userData.membershipStatus === 'premium' ? 'Remove premium benefits?' : 'Grant premium membership?'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onTogglePremium?.();
                        setIsOpen(false);
                      }}
                      className="min-w-[120px]"
                    >
                      {userData.membershipStatus === 'premium' ? (
                        <>
                          <CrownOff className="w-4 h-4 mr-2" />
                          Remove Premium
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Make Premium
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function UserManager() {
  const { user } = useUser();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const email = user?.email || '';
      const name = user?.name || '';
      const searchTermLower = searchTerm.toLowerCase();
      
      return email.toLowerCase().includes(searchTermLower) ||
             name.toLowerCase().includes(searchTermLower);
    });
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchTerm, users, itemsPerPage]);

  const fetchUsers = async () => {
    try {
      // First sync the current user to get their admin status
      const syncResponse = await fetch(`${API_BASE_URL}/api/sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress.emailAddress
        }),
      });

      const syncData = await syncResponse.json();
      
      if (!syncData.isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this page.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      // Get all users from the backend
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'user-id': user.id
        }
      });
      const data = await response.json();
      
      setUsers(data.users);
      setFilteredUsers(data.users);
      setTotalPages(Math.ceil(data.users.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (response.ok) {
        // Update local state
        const updatedUsers = users.map(user => {
          if (user.id === userId) {
            return { ...user, isAdmin: !currentStatus };
          }
          return user;
        });
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        toast({
          title: "Success",
          description: `User admin status ${!currentStatus ? 'enabled' : 'disabled'}.`,
          duration: 2000,
        });
      } else {
        throw new Error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: "Error",
        description: "Failed to update admin status. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const togglePremiumStatus = async (userId, isPremium) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/toggle-premium`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id
        },
        body: JSON.stringify({ isPremium: !isPremium }),
      });

      if (response.ok) {
        // Update local state
        const updatedUsers = users.map(user => {
          if (user.id === userId) {
            return { ...user, membershipStatus: !isPremium ? 'premium' : 'free' };
          }
          return user;
        });
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        toast({
          title: "Success",
          description: `User premium status ${!isPremium ? 'enabled' : 'disabled'}.`,
          duration: 2000,
        });
      } else {
        throw new Error('Failed to update premium status');
      }
    } catch (error) {
      console.error('Error toggling premium status:', error);
      toast({
        title: "Error",
        description: "Failed to update premium status. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Get current page users
  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={`${styles.userManagerContainer} bg-background border border-border`}>
      <div className={styles.userManagerHeader}>
        <div className={`${styles.searchContainer} bg-background border-border`}>
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.searchInput} text-foreground placeholder:text-muted-foreground bg-transparent`}
          />
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Users per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Email</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Role</TableHead>
            <TableHead className="text-muted-foreground">Membership</TableHead>
            <TableHead className="text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrentPageUsers().map((user) => (
            <TableRow key={user.id} className="border-border hover:bg-muted/50">
              <TableCell className="text-foreground">{user.name}</TableCell>
              <TableCell className="text-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isAdmin ? 'destructive' : 'default'}>
                  {user.isAdmin ? 'Admin' : 'User'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.membershipStatus === 'premium' ? 'success' : 'secondary'}>
                  {user.membershipStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <div className={styles.actionButtons}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${user.email}`}
                    className="hover:bg-muted"
                  >
                    Email
                  </Button>
                  <UserActionsModal
                    user={user}
                    onToggleAdmin={() => toggleAdminStatus(user.id, user.isAdmin)}
                    onTogglePremium={() => togglePremiumStatus(user.id, user.membershipStatus === 'premium')}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 