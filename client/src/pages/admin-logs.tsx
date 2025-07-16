import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Filter, Search, User, Calendar, Activity, ArrowLeft, Shield } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getBasePath } from "@/lib/router-config";

interface UserLog {
  id: number;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: string;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    stageName: string;
  };
}

export default function AdminLogsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<UserLog | null>(null);

  const { data: allLogs = [], isLoading: allLogsLoading } = useQuery({
    queryKey: ["/api/admin/logs/all"],
    enabled: !selectedUserId,
  });

  const { data: userLogs = [], isLoading: userLogsLoading } = useQuery({
    queryKey: ["/api/admin/logs/users", selectedUserId],
    enabled: !!selectedUserId,
  });

  const logs = (selectedUserId ? userLogs : allLogs) as UserLog[];
  const isLoading = selectedUserId ? userLogsLoading : allLogsLoading;

  const filteredLogs = logs.filter((log: UserLog) => {
    const severityMatch = severityFilter === "all" || log.severity === severityFilter;
    const actionMatch = !actionFilter || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    return severityMatch && actionMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "destructive";
      case "warn": return "secondary";
      case "info": return "default";
      case "debug": return "outline";
      default: return "default";
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("login")) return <User className="h-4 w-4" />;
    if (action.includes("profile")) return <User className="h-4 w-4" />;
    if (action.includes("post") || action.includes("comment")) return <Activity className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const uniqueUsers = Array.from(
    new Set((allLogs as UserLog[]).map((log: UserLog) => log.user))
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="mb-6">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Activity Logs</h1>
              <p className="text-muted-foreground">Monitor user operations with detailed timestamps and debug information</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredLogs.length} log entries
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">User</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {uniqueUsers.map((user: any) => (
                      <SelectItem key={user.id} value={user.id || `user-${Math.random()}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.username || 'Unknown'}</span>
                          <span className="text-sm text-muted-foreground">
                            ({user.stageName || 'No stage name'})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Severity</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Action</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by action..."
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedUserId("");
                    setSeverityFilter("all");
                    setActionFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found matching the current filters
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: UserLog) => (
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUserId(log.userId)}
                        className="p-0 h-auto font-normal"
                      >
                        <div className="text-left">
                          <div className="font-medium text-primary hover:underline">
                            {log.user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.user.stageName}
                          </div>
                        </div>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-mono text-sm">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(log.severity) as any}>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {log.ipAddress}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Log Details</DialogTitle>
                            <DialogDescription>Detailed information about this user activity log entry</DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">User Information</h4>
                                  <div className="text-sm space-y-1 mt-2">
                                    <div><strong>Username:</strong> {selectedLog.user.username}</div>
                                    <div><strong>Stage Name:</strong> {selectedLog.user.stageName}</div>
                                    <div><strong>Email:</strong> {selectedLog.user.email}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Technical Details</h4>
                                  <div className="text-sm space-y-1 mt-2">
                                    <div><strong>IP:</strong> {selectedLog.ipAddress}</div>
                                    <div><strong>Timestamp:</strong> {format(new Date(selectedLog.createdAt), "PPpp")}</div>
                                    <div><strong>Severity:</strong> {selectedLog.severity}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium">Action Details</h4>
                                <div className="bg-muted p-3 rounded-md mt-2">
                                  <pre className="text-sm whitespace-pre-wrap">{selectedLog.details}</pre>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium">User Agent</h4>
                                <div className="bg-muted p-3 rounded-md mt-2">
                                  <code className="text-xs">{selectedLog.userAgent}</code>
                                </div>
                              </div>

                              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <div>
                                  <h4 className="font-medium">Metadata</h4>
                                  <div className="bg-muted p-3 rounded-md mt-2">
                                    <pre className="text-xs">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}