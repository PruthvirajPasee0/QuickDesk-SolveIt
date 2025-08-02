import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { 
  LayoutDashboard, 
  Ticket, 
  Plus, 
  Users, 
  Settings, 
  Tag,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const { user } = useAuth();
  const { tickets } = useTickets();
  const location = useLocation();

  const isCollapsed = state === 'collapsed';
  const isActive = (path: string) => location.pathname === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-sidebar-accent transition-colors";

  // Calculate ticket counts
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const myTickets = user ? tickets.filter(t => 
    (user.role === 'end-user' && t.createdBy === user.id) ||
    (user.role === 'support-agent' && t.assignedTo === user.id)
  ).length : 0;

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null,
      roles: ['admin', 'support-agent', 'end-user']
    },
    {
      title: 'All Tickets',
      icon: Ticket,
      path: '/tickets',
      badge: openTickets > 0 ? openTickets : null,
      roles: ['admin', 'support-agent']
    },
    {
      title: 'My Tickets',
      icon: MessageSquare,
      path: '/my-tickets',
      badge: myTickets > 0 ? myTickets : null,
      roles: ['end-user', 'support-agent']
    },
    {
      title: 'Create Ticket',
      icon: Plus,
      path: '/create-ticket',
      badge: null,
      roles: ['end-user']
    },
    {
      title: 'Open Tickets',
      icon: Clock,
      path: '/tickets/open',
      badge: openTickets > 0 ? openTickets : null,
      roles: ['admin', 'support-agent']
    },
    {
      title: 'In Progress',
      icon: BarChart3,
      path: '/tickets/in-progress',
      badge: inProgressTickets > 0 ? inProgressTickets : null,
      roles: ['admin', 'support-agent']
    },
    {
      title: 'Resolved',
      icon: CheckCircle,
      path: '/tickets/resolved',
      badge: null,
      roles: ['admin', 'support-agent']
    },
    {
      title: 'Categories',
      icon: Tag,
      path: '/categories',
      badge: null,
      roles: ['admin']
    },
    {
      title: 'Users',
      icon: Users,
      path: '/users',
      badge: null,
      roles: ['admin']
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      badge: null,
      roles: ['admin', 'support-agent', 'end-user']
    }
  ];

  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const mainItems = filteredItems.slice(0, user?.role === 'end-user' ? 4 : 7);
  const settingsItems = filteredItems.slice(user?.role === 'end-user' ? 4 : 7);

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getNavCls}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        {settingsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.path} className={getNavCls}>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};