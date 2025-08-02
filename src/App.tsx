import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TicketProvider } from "@/contexts/TicketContext";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Main App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// App Routes
const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }
  
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Ticket Routes */}
        <Route path="/tickets" element={<TicketList />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/tickets/open" element={
          <TicketList 
            filterStatus="open" 
            title="Open Tickets" 
            description="Tickets awaiting response from support team"
          />
        } />
        <Route path="/tickets/in-progress" element={
          <TicketList 
            filterStatus="in-progress" 
            title="In Progress Tickets" 
            description="Tickets currently being worked on"
          />
        } />
        <Route path="/tickets/resolved" element={
          <TicketList 
            filterStatus="resolved" 
            title="Resolved Tickets" 
            description="Tickets that have been resolved"
          />
        } />
        
        {/* User-specific routes */}
        {user.role === 'end-user' && (
          <>
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/my-tickets" element={
              <TicketList 
                title="My Tickets" 
                description="Tickets you have submitted"
              />
            } />
          </>
        )}
        
        {/* Agent-specific routes */}
        {(user.role === 'support-agent' || user.role === 'admin') && (
          <Route path="/my-tickets" element={
            <TicketList 
              title="Assigned to Me" 
              description="Tickets assigned to you"
            />
          } />
        )}
        
        {/* Admin-specific routes */}
        {user.role === 'admin' && (
          <>
            <Route path="/categories" element={<Categories />} />
            <Route path="/users" element={<Users />} />
          </>
        )}
        
        {/* Settings route - available to all users */}
        <Route path="/settings" element={<Settings />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
