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
import { Search, Shield, ShieldOff, ChevronLeft, ChevronRight, MoreVertical, Crown, UserX, Loader2, CircleOff, Lock } from "lucide-react";
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

const getLastSeenText = (lastActiveAt) => {
  if (!lastActiveAt) return 'Never';
  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  const diffTime = Math.abs(now - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 'Today' : `${diffDays} days ago`;
};

const UserActionsModal = ({ user, onToggleAdmin, onTogglePremium, onToggleBan, affiliatorsMap = {} }) => {
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);
  const [isBanLoading, setIsBanLoading] = useState(false);

  // Defensive check for user data
  if (!user || typeof user !== 'object') {
    console.error('Invalid user data:', user);
    return null;
  }

  // Ensure required properties exist with defaults
  const userData = {
    name: user.name || 'Unknown User',
    isAdmin: !!user.isAdmin,
    membershipStatus: user.membershipStatus || 'free',
    status: user.status || 'active',
    banned: !!user.banned,
    locked: !!user.locked
  };

  // Get the affiliator's name if available
  const affiliatorName = user.affiliatorId ? affiliatorsMap[user.affiliatorId] : null;

  const handleToggleAdmin = async () => {
    setIsAdminLoading(true);
    try {
      await onToggleAdmin?.();
    } finally {
      setIsAdminLoading(false);
      setIsOpen(false);
    }
  };

  const handleTogglePremium = async () => {
    setIsPremiumLoading(true);
    try {
      await onTogglePremium?.();
    } finally {
      setIsPremiumLoading(false);
      setIsOpen(false);
    }
  };

  const handleToggleBan = async () => {
    setIsBanLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/toggle-ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': currentUser.id
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle ban status');
      }

      const result = await response.json();
      
      // Call the parent component's handler with the new ban status
      await onToggleBan?.(user.id, result.banned);
      
      toast({
        title: "Success",
        description: `User has been ${result.banned ? 'banned' : 'unbanned'} successfully.`,
        duration: 2000,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error toggling ban status:', error);
      toast({
        title: "Error",
        description: "Failed to update user ban status. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsBanLoading(false);
    }
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-700/60"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 w-full max-w-lg bg-background p-6 rounded-lg shadow-lg border-2 border-border"
            >
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">User Actions</h3>
                  <p className="text-sm text-muted-foreground">Manage {userData.name}'s account settings</p>
                  
                  {user.affiliatorId && (
                    <div className="mt-2 pt-4 border-t border-border">
                      <p className="text-sm font-medium">Affiliate Information:</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        <p>Referred by: {affiliatorName || user.affiliatorId}</p>
                        {user.affiliatedAt && (
                          <p>Date: {new Date(user.affiliatedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}
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
                      onClick={handleToggleAdmin}
                      disabled={isAdminLoading}
                      className="min-w-[120px]"
                    >
                      {isAdminLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : userData.isAdmin ? (
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
                      onClick={handleTogglePremium}
                      disabled={isPremiumLoading}
                      className="min-w-[120px]"
                    >
                      {isPremiumLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : userData.membershipStatus === 'premium' ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
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

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Account Status</h4>
                      <p className="text-sm text-muted-foreground">
                        {userData.banned ? 'Unban this user and restore access?' : 'Ban this user from accessing the platform?'}
                      </p>
                      {userData.locked && (
                        <p className="text-sm text-destructive mt-1">
                          Note: This account is also locked by Clerk.
                        </p>
                      )}
                    </div>
                    <Button
                      variant={userData.banned ? "outline" : "destructive"}
                      size="sm"
                      onClick={handleToggleBan}
                      disabled={isBanLoading || userData.locked}
                      className="min-w-[120px]"
                    >
                      {isBanLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : userData.banned ? (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Unban User
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Ban User
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
            </motion.div>
          </motion.div>
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
  const [affiliatorsMap, setAffiliatorsMap] = useState({});
  
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

    // Build a map of affiliator IDs to names for quick lookup
    buildAffiliatorsMap(filtered);
  }, [searchTerm, users, itemsPerPage]);

  // Create a map of affiliator IDs to names
  const buildAffiliatorsMap = (userList) => {
    const affiliatorsMap = {};
    // First pass: collect all user IDs and names
    userList.forEach(user => {
      if (user.id) {
        affiliatorsMap[user.id] = user.name || 'Unknown User';
      }
    });
    setAffiliatorsMap(affiliatorsMap);
  };

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

  const handleToggleBan = async (userId, isBanned) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          banned: isBanned,
          status: isBanned ? 'inactive' : 'active'
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
  };

  // Get current page users
  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
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
            <TableHead className="text-muted-foreground">Last Seen</TableHead>
            <TableHead className="text-muted-foreground">Role</TableHead>
            <TableHead className="text-muted-foreground">Membership</TableHead>
            <TableHead className="text-muted-foreground">Referred By</TableHead>
            <TableHead className="text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrentPageUsers().map((user) => (
            <TableRow key={user.id} className="border-border hover:bg-muted/50">
              <TableCell className="text-foreground">
                <div className="flex items-center gap-2">
                  {user.name}
                  {user.banned && (
                    <div className="group relative">
                      <CircleOff className="w-4 h-4 text-destructive" />
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Banned User
                      </span>
                    </div>
                  )}
                  {user.locked && (
                    <div className="group relative">
                      <Lock className="w-4 h-4 text-destructive" />
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Locked by Clerk
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.last_active_at ? 'success' : 'secondary'}>
                  {getLastSeenText(user.last_active_at)}
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
                {user.affiliatorId ? (
                  <div className="group relative cursor-help">
                    <Badge 
                      variant="outline" 
                      className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                    >
                      {affiliatorsMap[user.affiliatorId] || 'Unknown Referrer'}
                    </Badge>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      <div>By: {affiliatorsMap[user.affiliatorId] || 'Unknown'}</div>
                      <div>ID: {user.affiliatorId}</div>
                      <div>Date: {user.affiliatedAt ? new Date(user.affiliatedAt).toLocaleDateString() : 'Unknown'}</div>
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
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
                    onToggleBan={handleToggleBan}
                    affiliatorsMap={affiliatorsMap}
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