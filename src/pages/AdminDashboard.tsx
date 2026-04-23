import { useState, useEffect } from "react";
import { FileCheck, Users, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";

const AdminDashboard = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectMsg, setRejectMsg] = useState("");
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);

  // 🔥 FETCH DATA
  const fetchData = async () => {
    setLoading(true);

    try {
      // Pending approvals
      const { data: pendingData } = await supabase
        .from("approvals")
        .select("*")
        .eq("status", "pending");
      setPending(pendingData || []);

      // Approved data
      const { data: approvedData } = await supabase
        .from("placement_outcomes")
        .select("*");
      setApproved(approvedData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ APPROVE
  const handleApprove = async (item: any) => {
    try {
      const rows = item.data; // CSV data

      // convert CSV → DB rows
      const formatted = rows.slice(1).map((r: string[]) => ({
        company_name: r[0],
        students_applied: r[1],
        shortlisted_students: r[2],
        academic_year: r[3],
        offered_salary: r[4],
      }));

      // insert into placement_outcomes
      await supabase.from("placement_outcomes").insert(formatted);

      // update status
      await supabase
        .from("approvals")
        .update({ status: "approved" })
        .eq("id", item.id);

      fetchData();
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  // ❌ REJECT
  const handleReject = async (id: number) => {
    if (!rejectMsg.trim()) return; // don't allow empty rejection

    try {
      await supabase
        .from("approvals")
        .update({
          status: "rejected",
          message: rejectMsg,
        })
        .eq("id", id);

      setRejectMsg("");
      setSelectedRejectId(null);
      fetchData();
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* 🔹 PENDING */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck className="h-5 w-5 text-primary" />
            Pending Approvals
            {pending.length > 0 && (
              <Badge variant="destructive">{pending.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {pending.length === 0 ? (
            <p className="text-center">No pending approvals</p>
          ) : (
            pending.map((item) => (
              <div key={item.id} className="border p-4 mb-3 rounded">

                <p className="font-medium">{item.file_name}</p>

                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleApprove(item)}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setSelectedRejectId(item.id)}
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>

                {/* 🔥 REJECT MESSAGE BOX */}
                {selectedRejectId === item.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className="w-full border p-2 rounded"
                      placeholder="Enter rejection reason..."
                      value={rejectMsg}
                      onChange={(e) => setRejectMsg(e.target.value)}
                    />
                    <Button onClick={() => handleReject(item.id)}>
                      Submit Rejection
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ✅ APPROVED DATA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" />
            Approved Data
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center">Loading approved data...</p>
          ) : approved.length === 0 ? (
            <p className="text-center">No approved data yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Students Applied</TableHead>
                  <TableHead>Shortlisted Students</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Offered Salary</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {approved.map((r) => (
                  <TableRow key={r.id || r.placement_outcomes_id}>
                    <TableCell>{r.company_name}</TableCell>
                    <TableCell>{r.students_applied}</TableCell>
                    <TableCell>{r.shortlisted_students}</TableCell>
                    <TableCell>{r.academic_year}</TableCell>
                    <TableCell>{r.offered_salary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminDashboard;