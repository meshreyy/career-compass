import { useState } from "react";
import { FileCheck, Users, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { pendingApprovals as initialPending, approvedData } from "@/data/mockData";

const AdminDashboard = () => {
  const [pending, setPending] = useState(initialPending);

  const handleApprove = (id: number) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReject = (id: number) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck className="h-5 w-5 text-primary" />
            Pending Approvals
            {pending.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pending.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pending approvals. All data has been reviewed.
            </p>
          ) : (
            <div className="space-y-3">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {item.uploadedBy} · {item.uploadedAt} · {item.records} records
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(item.id)}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" />
            Verified Placement Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.company}</TableCell>
                  <TableCell>{record.package}</TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>
                    <Badge className="bg-primary/20 text-primary border-0">
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
