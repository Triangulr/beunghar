import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import styles from '../styles/AdminPage.module.css';
import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Image from 'next/image';
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Eye, Pencil, Trash2 } from "lucide-react"
import ModuleManager from './admin/moduleManager';

function VisitorCard() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [visitorData, setVisitorData] = useState([]);
  const [timeSpan, setTimeSpan] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState({ percentage: 0, increasing: true });

  useEffect(() => {
    const generateTimePoints = (timeSpan, data) => {
      const points = [];
      const now = new Date();
      
      switch(timeSpan) {
        case '24h':
          // For 24h view, use the time strings directly
          return data;
        case '7d':
          // Generate last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            points.push({
              date: date.toLocaleDateString(),
              visitors: data[0]?.visitors || 0 // Use the current visitor count
            });
          }
          break;
        case '30d':
          // Generate last 30 days
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            points.push({
              date: date.toLocaleDateString(),
              visitors: data[0]?.visitors || 0 // Use the current visitor count
            });
          }
          break;
      }
      return points;
    };

    const fetchVisitorStats = async () => {
      try {
        const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/visitor-stats?time_span=${timeSpan}`);
        const data = await response.json();
        console.log('Raw visitor data:', data);
        
        setVisitorCount(data.uniqueVisitors);
        
        // Generate appropriate data points based on timeSpan
        const localVisitorData = generateTimePoints(timeSpan, data.visitorData);
        
        console.log('Processed visitor data:', localVisitorData);
        setVisitorData(localVisitorData);
        
        // Calculate trend
        if (data.visitorData.length >= 2) {
          const latest = data.visitorData[data.visitorData.length - 1].visitors;
          const previous = data.visitorData[data.visitorData.length - 2].visitors;
          const change = previous === 0 ? 0 : ((latest - previous) / previous) * 100;
          setTrend({
            percentage: Math.abs(change).toFixed(1),
            increasing: change > 0
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching visitor stats:', error);
        setLoading(false);
      }
    };

    fetchVisitorStats();
  }, [timeSpan]);

  return (
    <Card className={styles.statsCard}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
        <Select value={timeSpan} onValueChange={setTimeSpan}>
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Time span" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-8">
          {loading ? "Loading..." : visitorCount}
        </div>
        <div className="h-[200px] w-full">
          {!loading && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          {trend.increasing ? (
            <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>
            {trend.increasing ? "Up" : "Down"} by {trend.percentage}% from previous period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function PremiumMembersCard() {
  const [memberCount, setMemberCount] = useState(0);
  const [memberData, setMemberData] = useState([]);
  const [timeSpan, setTimeSpan] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState({ percentage: 0, increasing: true });

  useEffect(() => {
    const generateTimePoints = (timeSpan, currentMembers) => {
      const points = [];
      const now = new Date();
      
      switch(timeSpan) {
        case '24h':
          // Generate hourly points for last 24 hours
          for (let i = 23; i >= 0; i--) {
            const date = new Date(now);
            date.setHours(date.getHours() - i);
            points.push({
              date: date.getHours() + ':00',
              members: currentMembers
            });
          }
          break;
        case '7d':
          // Generate daily points for last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            points.push({
              date: date.toLocaleDateString(),
              members: currentMembers
            });
          }
          break;
        case '30d':
          // Generate daily points for last 30 days
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            points.push({
              date: date.toLocaleDateString(),
              members: currentMembers
            });
          }
          break;
      }
      return points;
    };

    const fetchMemberStats = async () => {
      try {
        const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/member-stats?time_span=${timeSpan}`);
        const data = await response.json();
        console.log('Member stats response:', data);

        setMemberCount(data.premiumMembers);
        
        // If memberData is empty, generate time points
        if (!data.memberData || data.memberData.length === 0) {
          const generatedData = generateTimePoints(timeSpan, data.premiumMembers);
          setMemberData(generatedData);
        } else {
          setMemberData(data.memberData);
        }
        
        // Set a static trend for now since we're using generated data
        setTrend({
          percentage: 0,
          increasing: true
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching member stats:', error);
        const generatedData = generateTimePoints(timeSpan, 2);
        setMemberData(generatedData);
        setMemberCount(2);
        setLoading(false);
      }
    };

    fetchMemberStats();
  }, [timeSpan]);

  return (
    <Card className={styles.statsCard}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Premium Members</CardTitle>
        <Select value={timeSpan} onValueChange={setTimeSpan}>
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Time span" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-8">
          {loading ? "Loading..." : memberCount}
        </div>
        <div className="h-[200px] w-full">
          {!loading && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          {trend.increasing ? (
            <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>
            {trend.increasing ? "Up" : "Down"} by {trend.percentage}% from previous period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueCard() {
  const [revenue, setRevenue] = useState(69420);
  const [revenueData, setRevenueData] = useState([
    { date: '2024-03-01', revenue: 65000 },
    { date: '2024-03-02', revenue: 66500 },
    { date: '2024-03-03', revenue: 67800 },
    { date: '2024-03-04', revenue: 68200 },
    { date: '2024-03-05', revenue: 69420 },
  ]);
  const [timeSpan, setTimeSpan] = useState("24h");
  const [loading, setLoading] = useState(false);
  const [trend, setTrend] = useState({ percentage: 6.8, increasing: true });

  return (
    <Card className={styles.statsCard}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
        <Select value={timeSpan} onValueChange={setTimeSpan}>
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Time span" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-8">
          ${revenue.toLocaleString()}
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
          <span>
            Up by {trend.percentage}% from previous period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [modules, setModules] = useState([
    {
      id: 1,
      title: 'Module 1',
      description: 'Introduction to Basics',
      status: 'active',
      students: 150,
      lastUpdated: '2024-03-15'
    },
    {
      id: 2,
      title: 'Module 2',
      description: 'Advanced Techniques',
      status: 'active',
      students: 120,
      lastUpdated: '2024-03-14'
    },
    {
      id: 3,
      title: 'Module 3',
      description: 'Master the Skills',
      status: 'active',
      students: 85,
      lastUpdated: '2024-03-13'
    }
  ]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(`https://beunghar-api-92744157839.asia-south1.run.app/api/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.emailAddresses[0].emailAddress
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin === true || data.isAdmin === "true");
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setLoading(false);
      }
    };

    if (isLoaded) {
      checkAdminStatus();
    }
  }, [user, isLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded || loading) {
    return (
      <div className={`${styles.loaderContainer} ${fadeOut ? styles.fadeOut : ''}`}>
        <span className={styles.loader}></span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={styles.notSignedIn}>
        <div className={styles.signInContainer}>
          <h1>Admin Area</h1>
          <p>Please sign in to access the admin dashboard</p>
          <div className={styles.signInButtonWrapper}>
            <SignInButton mode="modal">
              <button className={styles.signInButton}>
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.unauthorizedContainer}>
        <div className={styles.unauthorizedContent}>
          <div className={styles.errorCode}>403</div>
          <h1>Access Denied</h1>
          <p>Sorry, you don't have permission to access this area.</p>
          <Link href="/" className={styles.homeLink}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.leftSection}>
            <div className={styles.logo}>
              <Link href="/">
                <Image 
                  src="/logo/Beunghar-FINAL1.png"
                  alt="Beunghar Logo"
                  width={40}
                  height={40}
                />
              </Link>
            </div>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => setActiveView('dashboard')}
                    style={{ cursor: 'pointer' }}
                  >
                    Dashboard
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()}
                    onClick={() => setActiveView('modules')}
                    style={{ cursor: 'pointer' }}
                  >
                    Modules
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className={styles.userButtonContainer} style={{ cursor: 'pointer' }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <div className={styles.mainContent}>
        {activeView === 'dashboard' ? (
          <div className={styles.cardGrid}>
            <VisitorCard />
            <PremiumMembersCard />
            <RevenueCard />
          </div>
        ) : activeView === 'modules' ? (
          <ModuleManager />
        ) : null}
      </div>
    </div>
  );
}
