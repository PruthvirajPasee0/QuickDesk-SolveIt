import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { TicketStatus } from '@/types';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Clock, 
  User,
  Send,
  Tag,
  Calendar,
  Edit
} from 'lucide-react';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, voteTicket, addReply, updateTicketStatus, assignTicket, categories } = useTickets();

  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The ticket you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/tickets')}>
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const category = categories.find(c => c.id === ticket.categoryId);
  const hasVoted = user ? ticket.votedBy.includes(user.id) : false;

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

  const handleVote = (isUpvote: boolean) => {
    if (!user) return;
    voteTicket(ticket.id, isUpvote);
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !user) return;
    
    setIsSubmittingReply(true);
    addReply(ticket.id, replyContent);
    setReplyContent('');
    setIsSubmittingReply(false);
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (user?.role === 'support-agent' && newStatus === 'in-progress' && !ticket.assignedTo) {
      // Auto-assign to current agent
      assignTicket(ticket.id, user.id, user.name);
    } else {
      updateTicketStatus(ticket.id, newStatus);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const canModifyTicket = user && (
    user.role === 'admin' || 
    user.role === 'support-agent' || 
    (user.role === 'end-user' && ticket.createdBy === user.id)
  );

  const canChangeStatus = user && (user.role === 'admin' || user.role === 'support-agent');

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        {canChangeStatus && (
          <Select 
            value={ticket.status} 
            onValueChange={(value: TicketStatus) => handleStatusChange(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Ticket Details */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  #{ticket.id}
                </Badge>
                {category && (
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-muted-foreground">{category.name}</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Created by {ticket.createdByName}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(ticket.createdAt)}</span>
                </span>
                {ticket.assignedToName && (
                  <span className="flex items-center space-x-1">
                    <Tag className="h-4 w-4" />
                    <span>Assigned to {ticket.assignedToName}</span>
                  </span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className={`${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </Badge>
                <Badge className={`${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </Badge>
              </div>
              
              {/* Voting */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(true)}
                  className={`${hasVoted ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                  disabled={!user}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {ticket.votes}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose max-w-none space-y-4">
            <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
            
            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-foreground">Attachments ({ticket.attachments.length})</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {ticket.attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                        onClick={() => window.open(attachment, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(attachment, '_blank')}
                          className="shadow-lg"
                        >
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Replies ({ticket.replies?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.replies && ticket.replies.length > 0 ? (
            ticket.replies.map((reply) => (
              <div key={reply.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {reply.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{reply.userName}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            reply.userRole === 'admin' ? 'bg-destructive text-destructive-foreground' :
                            reply.userRole === 'support-agent' ? 'bg-warning text-warning-foreground' :
                            'bg-primary text-primary-foreground'
                          }`}
                        >
                          {reply.userRole === 'support-agent' ? 'Agent' : 
                           reply.userRole === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                        {reply.isInternal && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <p className="text-foreground whitespace-pre-wrap pl-11">{reply.content}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No replies yet. Be the first to respond!
            </p>
          )}

          {/* Add Reply */}
          {canModifyTicket && ticket.status !== 'closed' && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Add a reply</h4>
              <Textarea
                placeholder="Type your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmittingReply}
                  className="bg-gradient-primary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmittingReply ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketDetail;