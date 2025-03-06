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
import { Search, UserPlus, Mail, Shield, ShieldOff } from "lucide-react";
import styles from '../../styles/AdminPage.module.css';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/users');
      const data = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const sendInvite = async (email) => {
    try {
      const response = await fetch('https://beunghar-api-92744157839.asia-south1.run.app/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Handle success (maybe show a notification)
        console.log('Invitation sent successfully');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
    }
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
        <Button variant="default" onClick={() => sendInvite(prompt('Enter email address:'))}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Email</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Role</TableHead>
            <TableHead className="text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
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
                <div className={styles.actionButtons}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${user.email}`}
                    className="hover:bg-muted"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                    className="hover:bg-muted"
                  >
                    {user.isAdmin ? (
                      <ShieldOff className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 