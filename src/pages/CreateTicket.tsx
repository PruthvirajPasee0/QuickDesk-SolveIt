import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { useNavigate } from 'react-router-dom';
import { TicketPriority } from '@/types';
import { Plus, FileText, AlertCircle, Upload, X, FileImage } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CreateTicket: React.FC = () => {
  const { user } = useAuth();
  const { categories, createTicket } = useTickets();
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const category = categories.find(c => c.id === categoryId);
      
      // Convert files to base64 for storage (in a real app, you'd upload to a server)
      const attachmentUrls: string[] = [];
      for (const file of attachments) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        attachmentUrls.push(base64);
      }
      
      const ticketId = await createTicket({
        subject,
        description,
        status: 'open',
        priority,
        categoryId,
        categoryName: category?.name || 'General',
        createdBy: user.id,
        createdByName: user.name,
        attachments: attachmentUrls
      });

      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isImage && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were skipped",
        description: "Only image files under 5MB are allowed",
        variant: "destructive",
      });
    }

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Plus className="h-8 w-8 text-primary" />
            <span>Create Support Ticket</span>
          </h1>
          <p className="text-muted-foreground">
            Describe your issue and our support team will help you resolve it quickly.
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Ticket Details</span>
            </CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us assist you better.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
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

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: TicketPriority) => setPriority(value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-muted" />
                        <span>Low - General inquiry</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>Medium - Standard issue</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-warning" />
                        <span>High - Urgent issue</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <span>Critical - System down</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or relevant information."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={8}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: The more details you provide, the faster we can help you resolve the issue.
                </p>
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">Image files only (PNG, JPG, GIF up to 5MB)</p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attached Files ({attachments.length}/5)</p>
                      <div className="grid gap-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-md">
                            <div className="flex items-center space-x-2">
                              <FileImage className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-xs">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning for critical priority */}
              {priority === 'critical' && (
                <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">Critical Priority Notice</p>
                    <p className="text-xs text-muted-foreground">
                      Please only use critical priority for system outages or issues that completely prevent business operations.
                      Our team will be notified immediately and will respond within 1 hour.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-primary hover:bg-primary-dark transition-all duration-200"
                  disabled={loading || !subject.trim() || !description.trim() || !categoryId}
                >
                  {loading ? 'Creating Ticket...' : 'Create Ticket'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicket;