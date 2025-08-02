import React, { createContext, useContext, useEffect, useState } from 'react';
import { Ticket, TicketReply, Category, TicketStatus, TicketPriority, TicketFilters } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface TicketContextType {
  tickets: Ticket[];
  categories: Category[];
  loading: boolean;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'votedBy' | 'replies'>) => Promise<string>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, assignedTo?: string) => void;
  assignTicket: (ticketId: string, agentId: string, agentName: string) => void;
  voteTicket: (ticketId: string, isUpvote: boolean) => void;
  addReply: (ticketId: string, content: string, isInternal?: boolean) => void;
  getFilteredTickets: (filters: TicketFilters) => Ticket[];
  createCategory: (name: string, description: string, color: string) => void;
  deleteCategory: (categoryId: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Initialize with demo data
  useEffect(() => {
    const storedCategories = localStorage.getItem('quickdesk_categories');
    if (!storedCategories) {
      const demoCategories: Category[] = [
        {
          id: '1',
          name: 'Technical Support',
          description: 'Hardware and software issues',
          color: '#3B82F6',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Account & Billing',
          description: 'Account management and billing inquiries',
          color: '#10B981',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Feature Request',
          description: 'New feature suggestions and improvements',
          color: '#8B5CF6',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Bug Report',
          description: 'Software bugs and glitches',
          color: '#EF4444',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('quickdesk_categories', JSON.stringify(demoCategories));
      setCategories(demoCategories);
    } else {
      setCategories(JSON.parse(storedCategories));
    }

    const storedTickets = localStorage.getItem('quickdesk_tickets');
    if (!storedTickets) {
      const demoTickets: Ticket[] = [
        {
          id: '1',
          subject: 'Unable to login to my account',
          description: 'I have been trying to login to my account for the past hour but keep getting an "invalid credentials" error, even though I am using the correct password.',
          status: 'open',
          priority: 'high',
          categoryId: '2',
          categoryName: 'Account & Billing',
          createdBy: '3',
          createdByName: 'End User',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          votes: 3,
          votedBy: ['3'],
          replies: [],
        },
        {
          id: '2',
          subject: 'Feature request: Dark mode support',
          description: 'It would be great if the application had a dark mode option for better usability during night hours.',
          status: 'in-progress',
          priority: 'medium',
          categoryId: '3',
          categoryName: 'Feature Request',
          createdBy: '3',
          createdByName: 'End User',
          assignedTo: '2',
          assignedToName: 'Support Agent',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          votes: 8,
          votedBy: ['3'],
          replies: [
            {
              id: '1',
              ticketId: '2',
              userId: '2',
              userName: 'Support Agent',
              userRole: 'support-agent',
              content: 'Thanks for the suggestion! We are currently working on implementing dark mode support. This will be available in our next major update.',
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            }
          ],
        },
      ];
      localStorage.setItem('quickdesk_tickets', JSON.stringify(demoTickets));
      setTickets(demoTickets);
    } else {
      setTickets(JSON.parse(storedTickets));
    }

    setLoading(false);
  }, []);

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'votedBy' | 'replies'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const newTicket: Ticket = {
      ...ticketData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      votedBy: [],
      replies: [],
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem('quickdesk_tickets', JSON.stringify(updatedTickets));

    toast({
      title: "Ticket created successfully",
      description: `Ticket #${newTicket.id} has been created and assigned to the support team.`,
    });

    return newTicket.id;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, assignedTo?: string) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        const updatedTicket = {
          ...ticket,
          status,
          updatedAt: new Date().toISOString(),
          ...(assignedTo && { assignedTo }),
        };
        return updatedTicket;
      }
      return ticket;
    });

    setTickets(updatedTickets);
    localStorage.setItem('quickdesk_tickets', JSON.stringify(updatedTickets));

    toast({
      title: "Ticket updated",
      description: `Ticket status changed to ${status}`,
    });
  };

  const assignTicket = (ticketId: string, agentId: string, agentName: string) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          assignedTo: agentId,
          assignedToName: agentName,
          status: 'in-progress' as TicketStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    localStorage.setItem('quickdesk_tickets', JSON.stringify(updatedTickets));

    toast({
      title: "Ticket assigned",
      description: `Ticket assigned to ${agentName}`,
    });
  };

  const voteTicket = (ticketId: string, isUpvote: boolean) => {
    if (!user) return;

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        const hasVoted = ticket.votedBy.includes(user.id);
        let newVotes = ticket.votes;
        let newVotedBy = [...ticket.votedBy];

        if (hasVoted) {
          // Remove vote
          newVotes -= 1;
          newVotedBy = newVotedBy.filter(id => id !== user.id);
        } else if (isUpvote) {
          // Add upvote
          newVotes += 1;
          newVotedBy.push(user.id);
        }

        return {
          ...ticket,
          votes: newVotes,
          votedBy: newVotedBy,
          updatedAt: new Date().toISOString(),
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    localStorage.setItem('quickdesk_tickets', JSON.stringify(updatedTickets));
  };

  const addReply = (ticketId: string, content: string, isInternal = false) => {
    if (!user) return;

    const reply: TicketReply = {
      id: Math.random().toString(36).substr(2, 9),
      ticketId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      content,
      createdAt: new Date().toISOString(),
      isInternal,
    };

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          replies: [...(ticket.replies || []), reply],
          updatedAt: new Date().toISOString(),
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    localStorage.setItem('quickdesk_tickets', JSON.stringify(updatedTickets));

    toast({
      title: "Reply added",
      description: "Your reply has been added to the ticket",
    });
  };

  const getFilteredTickets = (filters: TicketFilters): Ticket[] => {
    return tickets.filter(ticket => {
      if (filters.status && filters.status.length > 0 && !filters.status.includes(ticket.status)) {
        return false;
      }
      if (filters.category && filters.category.length > 0 && !filters.category.includes(ticket.categoryId)) {
        return false;
      }
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(ticket.priority)) {
        return false;
      }
      if (filters.assignedTo && filters.assignedTo.length > 0 && (!ticket.assignedTo || !filters.assignedTo.includes(ticket.assignedTo))) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          ticket.subject.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.createdByName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const createCategory = (name: string, description: string, color: string) => {
    const newCategory: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      color,
      createdAt: new Date().toISOString(),
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem('quickdesk_categories', JSON.stringify(updatedCategories));

    toast({
      title: "Category created",
      description: `Category "${name}" has been created successfully`,
    });
  };

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    localStorage.setItem('quickdesk_categories', JSON.stringify(updatedCategories));

    toast({
      title: "Category deleted",
      description: "Category has been deleted successfully",
    });
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        categories,
        loading,
        createTicket,
        updateTicketStatus,
        assignTicket,
        voteTicket,
        addReply,
        getFilteredTickets,
        createCategory,
        deleteCategory,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};