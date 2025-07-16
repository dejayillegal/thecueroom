import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getBasePath } from "@/lib/router-config";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Headphones, 
  Mail, 
  Clock, 
  User, 
  Calendar, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  UserCheck,
  MessageSquare,
  Settings,
  ArrowLeft,
  Shield
} from "lucide-react";
import type { SupportTicket } from "@shared/schema";

const statusColors = {
  open: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", 
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  urgent: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
};

export default function AdminSupportPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-pulse">Loading support dashboard...</div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Admin privileges required</p>
        </div>
      </div>
    );
  }

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/support/tickets", selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      const response = await apiRequest("GET", `/api/support/tickets?${params}`);
      return response.json();
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<SupportTicket> }) => {
      const response = await apiRequest("PATCH", `/api/support/tickets/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({
        title: "Ticket Updated",
        description: "Support ticket has been updated successfully!",
      });
      setShowTicketDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/support/tickets/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({
        title: "Ticket Deleted",
        description: "Support ticket has been deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; ticketId: number }) => {
      const response = await apiRequest("POST", "/api/auth/admin-reset-password", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({
        title: "Password Reset Successful",
        description: `Temporary password sent to ${data.email}. User can login and change password.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (ticketId: number, newStatus: string) => {
    updateTicketMutation.mutate({
      id: ticketId,
      updates: { status: newStatus }
    });
  };

  const handlePriorityChange = (ticketId: number, newPriority: string) => {
    updateTicketMutation.mutate({
      id: ticketId,
      updates: { priority: newPriority }
    });
  };

  const handleTicketAction = (ticket: SupportTicket, action: string) => {
    switch (action) {
      case "view":
        setSelectedTicket(ticket);
        setShowTicketDialog(true);
        break;
      case "resolve":
        updateTicketMutation.mutate({
          id: ticket.id,
          updates: { status: "resolved" }
        });
        break;
      case "close":
        updateTicketMutation.mutate({
          id: ticket.id,
          updates: { status: "closed" }
        });
        break;
      case "assign":
        // For now, assign to current admin - could be enhanced with user selection
        updateTicketMutation.mutate({
          id: ticket.id,
          updates: { status: "in_progress" }
        });
        break;
      case "reset_password":
        if (confirm(`Are you sure you want to reset the password for ${ticket.email}? A temporary password will be sent to their email.`)) {
          resetPasswordMutation.mutate({
            email: ticket.email,
            ticketId: ticket.id
          });
        }
        break;
      case "delete":
        if (confirm("Are you sure you want to delete this support ticket?")) {
          deleteTicketMutation.mutate(ticket.id);
        }
        break;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const ticketCounts = {
    all: tickets.length,
    open: tickets.filter((t: SupportTicket) => t.status === "open").length,
    in_progress: tickets.filter((t: SupportTicket) => t.status === "in_progress").length,
    resolved: tickets.filter((t: SupportTicket) => t.status === "resolved").length,
    closed: tickets.filter((t: SupportTicket) => t.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = getBasePath() + '/admin'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Panel
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Admin Access</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Headphones className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Underground Support Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage support requests from the underground community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{ticketCounts.all}</div>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{ticketCounts.open}</div>
              <p className="text-xs text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{ticketCounts.in_progress}</div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{ticketCounts.resolved}</div>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">{ticketCounts.closed}</div>
              <p className="text-xs text-muted-foreground">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({ticketCounts.all})</TabsTrigger>
            <TabsTrigger value="open">Open ({ticketCounts.open})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({ticketCounts.in_progress})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({ticketCounts.resolved})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({ticketCounts.closed})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Support Tickets */}
        <div className="space-y-4">
          {ticketsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading support tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                <p className="text-muted-foreground">
                  {selectedStatus === "all" 
                    ? "No support tickets found. The underground is running smoothly!" 
                    : `No tickets with status "${selectedStatus}"`}
                </p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket: SupportTicket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">#{ticket.id} - {ticket.subject}</h3>
                            <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {ticket.firstName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {ticket.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {ticket.description}
                            </p>
                          )}
                          
                          {ticket.resolution && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                              <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">Resolution:</p>
                              <p className="text-sm text-green-700 dark:text-green-300">{ticket.resolution}</p>
                              {ticket.tempPassword && (
                                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                  <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">🔐 Admin Only - Temporary Password:</p>
                                  <code className="text-sm font-mono text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded select-all">
                                    {ticket.tempPassword}
                                  </code>
                                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                    User must change this password on first login
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={ticket.priority} onValueChange={(value) => handlePriorityChange(ticket.id, value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTicketAction(ticket, "view")}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTicketAction(ticket, "assign")}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Assign to Me
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTicketAction(ticket, "resolve")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTicketAction(ticket, "close")}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Close Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTicketAction(ticket, "reset_password")}
                            className="text-blue-600"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTicketAction(ticket, "delete")}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Ticket Details Dialog */}
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Ticket #{selectedTicket?.id} - {selectedTicket?.subject}
              </DialogTitle>
              <DialogDescription>
                Support request details and resolution management
              </DialogDescription>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(value) => {
                        setSelectedTicket({ ...selectedTicket, status: value });
                        handleStatusChange(selectedTicket.id, value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Priority</Label>
                    <Select 
                      value={selectedTicket.priority} 
                      onValueChange={(value) => {
                        setSelectedTicket({ ...selectedTicket, priority: value });
                        handlePriorityChange(selectedTicket.id, value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>User Information</Label>
                  <div className="bg-muted/50 p-3 rounded-lg mt-1">
                    <p><strong>Name:</strong> {selectedTicket.firstName}</p>
                    <p><strong>Email:</strong> {selectedTicket.email}</p>
                    <p><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedTicket.description && (
                  <div>
                    <Label>Description</Label>
                    <div className="bg-muted/50 p-3 rounded-lg mt-1">
                      <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="resolution">Resolution Notes</Label>
                  <Textarea
                    id="resolution"
                    placeholder="Add resolution notes or next steps..."
                    value={selectedTicket.resolution || ""}
                    onChange={(e) => setSelectedTicket({ ...selectedTicket, resolution: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    updateTicketMutation.mutate({
                      id: selectedTicket.id,
                      updates: { resolution: selectedTicket.resolution }
                    });
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
