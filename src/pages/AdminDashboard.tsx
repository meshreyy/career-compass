import { useState, useEffect } from "react";
import { FileCheck, Users, Check, X, ClipboardList, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectMsgs, setRejectMsgs] = useState({});
  const [selectedRejectId, setSelectedRejectId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from("approvals")
        .select("*")
        .eq("status", "pending");

      if (pendingError) console.error("PENDING FETCH ERROR:", pendingError);
      else setPending(pendingData || []);

      const { data: approvedData, error: approvedError } = await supabase
        .from("placement_outcomes")
        .select("*");

      if (approvedError) console.error("APPROVED FETCH ERROR:", approvedError);
      else setApproved(approvedData || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (item) => {
    try {
      if (!item.data?.length) {
        alert("No data to approve");
        return;
      }

      const formatted = item.data.map((r) => ({
        company_name: r.company,
        students_applied: Number(r.applied) || 0,
        shortlisted_students: Number(r.selected) || 0,
        academic_year: r.year,
        offered_salary: Number(r.salary) || 0,
      }));

      const { error: insertError } = await supabase
        .from("placement_outcomes")
        .insert(formatted);

      if (insertError) {
        console.error("INSERT ERROR:", insertError);
        alert("Insert failed");
        return;
      }

      const { error: updateError } = await supabase
        .from("approvals")
        .update({ status: "approved" })
        .eq("id", item.id);

      if (updateError) {
        console.error("APPROVAL STATUS UPDATE ERROR:", updateError);
        alert("Failed to update approval status");
        return;
      }

      setPending((prev) => prev.filter((p) => p.id !== item.id));
      fetchData();
      alert("Approved successfully");
    } catch (err) {
      console.error("APPROVE ERROR:", err);
      alert("Something went wrong while approving");
    }
  };

  const handleReject = async (item) => {
    const msgToSend = rejectMsgs[item.id];
    if (!msgToSend?.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("rejection")
        .insert([{ file_name: item.file_name, rejected_msg: msgToSend.trim() }]);

      if (insertError) {
        console.error("REJECTION INSERT ERROR:", insertError);
        alert("Failed to save rejection reason");
        return;
      }

      const { data: updatedRows, error: updateError } = await supabase
        .from("approvals")
        .update({ status: "rejected" })
        .eq("id", item.id)
        .select();

      if (updateError) {
        alert("Failed to update status to rejected");
        return;
      }

      setPending((prev) => prev.filter((p) => p.id !== item.id));
      setRejectMsgs((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
      setSelectedRejectId(null);
      alert("File rejected successfully");
    } catch (err) {
      console.error("REJECT ERROR:", err);
      alert("Something went wrong while rejecting");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Admin <span className="text-blue-600">Verification</span>
          </h1>
          <p className="text-slate-500 font-medium">Verify placement records and manage database integrity.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-700">{approved.length} Records</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-slate-100/50 p-6 md:p-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="p-2 bg-amber-100 rounded-xl">
              <FileCheck className="h-6 w-6 text-amber-600" />
            </div>
            Pending Approvals
            {pending.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-3 py-1 rounded-full animate-pulse">
                {pending.length} New
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center py-10 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium">Fetching submissions...</p>
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-semibold text-lg">No pending approvals found</p>
              <p className="text-slate-300 text-sm">Everything is currently up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pending.map((item) => (
                <div key={item.id} className="group border border-slate-100 bg-white/50 p-6 rounded-3xl hover:shadow-xl hover:border-blue-100 transition-all duration-300 animate-in slide-in-from-bottom-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Review</p>
                      </div>
                      <p className="text-xl font-extrabold text-slate-700">{item.file_name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleApprove(item)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-6 rounded-2xl shadow-lg shadow-emerald-100 transition-transform active:scale-95"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Approve
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => setSelectedRejectId((prev) => prev === item.id ? null : item.id)}
                        className="bg-white hover:bg-red-50 text-red-500 border border-red-100 font-bold px-6 py-6 rounded-2xl shadow-sm transition-transform active:scale-95"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {selectedRejectId === item.id && (
                    <div className="mt-6 p-6 bg-red-50/50 rounded-[2rem] border border-red-100 animate-in zoom-in-95 duration-300">
                      <h4 className="text-red-700 font-bold mb-3 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Rejection Reason
                      </h4>
                      <textarea
                        className="w-full bg-white border border-red-100 p-4 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-300 outline-none transition-all min-h-[120px] text-slate-700 placeholder:text-red-200 shadow-inner"
                        placeholder="Explain why this data doesn't meet the requirements..."
                        value={rejectMsgs[item.id] || ""}
                        onChange={(e) =>
                          setRejectMsgs((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                      />

                      <div className="flex gap-3 mt-4">
                        <Button onClick={() => handleReject(item)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 rounded-xl shadow-lg shadow-red-200">
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-slate-500 hover:bg-white rounded-xl"
                          onClick={() => setSelectedRejectId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Data Section */}
      <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-slate-100/50 p-6 md:p-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            Verified Outcome History
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-10 text-center text-slate-400">Updating records...</div>
          ) : approved.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-medium italic">No approved data history available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-600 py-6 pl-10">Company Name</TableHead>
                    <TableHead className="font-bold text-slate-600 py-6">Applied</TableHead>
                    <TableHead className="font-bold text-slate-600 py-6">Shortlisted</TableHead>
                    <TableHead className="font-bold text-slate-600 py-6">Academic Year</TableHead>
                    <TableHead className="font-bold text-slate-600 py-6 pr-10 text-right">LPA (Salary)</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {approved.map((r, idx) => (
                    <TableRow key={r.id} className="group border-slate-50 hover:bg-blue-50/40 transition-colors">
                      <TableCell className="font-bold text-slate-700 py-5 pl-10 capitalize">
                        {r.company_name}
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold px-3">
                            {r.students_applied}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                         <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold px-3">
                            {r.shortlisted_students}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium py-5">{r.academic_year}</TableCell>
                      <TableCell className="py-5 pr-10 text-right">
                        <span className="text-blue-600 font-black">
                          {/* CRASH FIX: Added null check and fallback for salary */}
                          {r.offered_salary ? `₹${Number(r.offered_salary).toLocaleString()}` : "N/A"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .animate-in { animation: fadeIn 0.8s ease-out; }
        .slide-in-from-bottom-4 { animation: slideInUp 0.5s ease-out both; }
        
        tr:hover td { color: #1e293b !important; }
        
        .overflow-x-auto::-webkit-scrollbar { height: 6px; }
        .overflow-x-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-x-auto::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;