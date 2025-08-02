import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { Link } from 'react-router-dom';
import { TicketStatus, TicketPriority, TicketFilters } from '@/types';
import { 
  Search, 
  Filter, 
  Ticket as TicketIcon, 
  Clock, 
  MessageSquare, 
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface TicketListProps {
  filterStatus?: TicketStatus;
  title?: string;
  description?: string;
}

const TicketList: React.FC<TicketListProps> = ({ 
  filterStatus, 
  title = "All Tickets",
  description = "View and manage support tickets"
}) => {
  const { user } = useAuth();
  const { tickets, categories, getFilteredTickets } = useTickets();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'priority' | 'votes'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Build filters
  const filters: TicketFilters = useMemo(() => {
    const baseFilters: TicketFilters = { search };
    
    if (filterStatus) {
      baseFilters.status = [filterStatus];
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      baseFilters.category = [selectedCategory];
    }
    
    if (selectedPriority && selectedPriority !== 'all') {
      baseFilters.priority = [selectedPriority as TicketPriority];
    }

    return baseFilters;
  }, [search, filterStatus, selectedCategory, selectedPriority]);

  // Get filtered and sorted tickets
  const filteredTickets = useMemo(() => {
    let result = getFilteredTickets(filters);

    // Filter by user role
    if (user?.role === 'end-user') {
      result = result.filter(ticket => ticket.createdBy === user.id);
    }

    // Sort tickets
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'votes':
          return b.votes - a.votes;
        default:
          return 0;
      }
    });

    return result;
  }, [getFilteredTickets, filters, user, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive text-destructive-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
          <TicketIcon className="h-8 w-8 text-primary" />
          <span>{title}</span>
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select value={sortBy} onValueChange={(value: 'recent' | 'oldest' | 'priority' | 'votes') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="votes">Most voted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
              <CardDescription>
                {filteredTickets.length === 0 
                  ? 'No tickets match your filters'
                  : `Showing ${paginatedTickets.length} of ${filteredTickets.length} tickets`
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {paginatedTickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4">
                {search || selectedCategory || selectedPriority 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No tickets have been created yet.'
                }
              </p>
              {user?.role === 'end-user' && (
                <Link to="/create-ticket">
                  <Button className="bg-gradient-primary">
                    Create Your First Ticket
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            paginatedTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block p-4 rounded-lg border hover:bg-card-hover transition-all duration-200 hover:shadow-card"
              >
                <div className="flex items-start justify-between space-x-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground line-clamp-1">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {ticket.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>#{ticket.id}</span>
                      <span>by {ticket.createdByName}</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(ticket.updatedAt)}</span>
                      </span>
                      {ticket.replies && ticket.replies.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.replies.length} replies</span>
                        </span>
                      )}
                      {ticket.votes > 0 && (
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{ticket.votes} votes</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: categories.find(c => c.id === ticket.categoryId)?.color || '#6B7280' }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {ticket.categoryName}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketList;