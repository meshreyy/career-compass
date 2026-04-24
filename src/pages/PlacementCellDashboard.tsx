import { useEffect, useState, useCallback } from "react";
import { Upload, X, BarChart3, AlertCircle, CheckCircle2, FileText, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";

const barConfig = {
  selected: {
    label: "Students Selected",
    color: "hsl(221.2 83.2% 53.3%)", // Modern Blue
  },
};

const PlacementCellDashboard = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [loadingChart, setLoadingChart] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rejections, setRejections] = useState([]);
  const [loadingRejections, setLoadingRejections] = useState(true);
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  useEffect(() => {
    loadLatestApprovedData();
    loadRejectedMessages();
  }, []);

  const loadLatestApprovedData = async () => {
    setLoadingChart(true);
    try {
      const { data, error } = await supabase
        .from("approvals")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("LOAD APPROVED ERROR:", error);
        return;
      }

      if (data && data.length > 0) {
        setChartData(data[0].data || []);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("UNEXPECTED APPROVED LOAD ERROR:", err);
    } finally {
      setLoadingChart(false);
    }
  };

  const loadRejectedMessages = async () => {
    setLoadingRejections(true);
    try {
      const { data, error } = await supabase
        .from("rejection")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("LOAD REJECTION ERROR:", error);
        return;
      }
      setRejections(data || []);
    } catch (err) {
      console.error("UNEXPECTED REJECTION LOAD ERROR:", err);
    } finally {
      setLoadingRejections(false);
    }
  };

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Only CSV files are allowed.");
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || "");
      if (!text) {
        alert("File reading failed");
        return;
      }

      const rows = text
        .split(/\r?\n/)
        .filter((r) => r.trim() !== "")
        .map((r) => r.split(/,|\t/).map((c) => c.trim()));

      if (!rows.length) {
        alert("Empty CSV file");
        return;
      }

      setPreviewData(rows.slice(0, 6));
      const headers = rows[0];
      const dataRows = rows.slice(1);

      const companyIndex = headers.findIndex((h) => h.toLowerCase().includes("company"));
      const appliedIndex = headers.findIndex((h) => h.toLowerCase().includes("applied"));
      const selectedIndex = headers.findIndex((h) => h.toLowerCase().includes("selected") || h.toLowerCase().includes("shortlisted"));
      const yearIndex = headers.findIndex((h) => h.toLowerCase().includes("year"));
      const salaryIndex = headers.findIndex((h) => h.toLowerCase().includes("salary"));

      if (companyIndex === -1 || appliedIndex === -1 || selectedIndex === -1 || yearIndex === -1 || salaryIndex === -1) {
        alert("CSV format incorrect.\nRequired columns: Company, Applied, Selected, Year, Salary");
        setChartData([]);
        return;
      }

      const formatted = dataRows.filter((row) => row.length > 1).map((row) => ({
        company: row[companyIndex] || "",
        applied: Number(row[appliedIndex]) || 0,
        selected: Number(row[selectedIndex]) || 0,
        year: row[yearIndex] || "",
        salary: Number(row[salaryIndex]) || 0,
      }));
      setChartData(formatted);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChooseFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e) => {
      const target = e.target;
      const file = target.files && target.files[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setChartData([]);
  };

  const handleSubmit = async () => {
    try {
      if (!uploadedFile || previewData.length === 0 || chartData.length === 0) {
        alert("Upload CSV first");
        return;
      }
      setSubmitting(true);
      const { data, error } = await supabase
        .from("approvals")
        .insert([{
          file_name: uploadedFile.name,
          uploaded_by: "Placement Cell",
          records: chartData.length,
          status: "pending",
          data: chartData,
        }])
        .select();

      if (error) {
        alert("Error: " + error.message);
        return;
      }
      alert("Sent for approval");
      setUploadedFile(null);
      setPreviewData([]);
    } catch (err) {
      alert("Unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledgeRejection = async (item) => {
    if (!item?.id) return;
    try {
      setAcknowledgingId(item.id);
      const { error } = await supabase.from("rejection").delete().eq("id", item.id);
      if (error) {
        alert("Failed to remove rejection message");
        return;
      }
      setRejections((prev) => prev.filter((r) => r.id !== item.id));
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Placement <span className="text-blue-600">Cell</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage and upload student placement outcomes.</p>
        </div>
      </div>

      {/* Rejected Messages Section */}
      {rejections.length > 0 && (
        <Card className="border-none shadow-xl shadow-red-100/50 bg-red-50/50 backdrop-blur-xl rounded-[2rem] border-l-4 border-l-red-500 overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-red-800">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Rejection Alerts
              <Badge variant="destructive" className="ml-2 px-2.5 py-0.5 rounded-full bg-red-600">
                {rejections.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {rejections.map((item) => (
                <div key={item.id} className="bg-white/80 border border-red-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-2 italic">
                      <FileText className="h-4 w-4 text-red-400" /> {item.file_name}
                    </p>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      <span className="text-red-500 font-bold uppercase text-[10px]">Reason:</span> {item.rejected_msg}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAcknowledgeRejection(item)}
                    disabled={acknowledgingId === item.id}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-6"
                  >
                    {acknowledgingId === item.id ? "Clearing..." : "Acknowledge"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              Submit New Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {!uploadedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={handleChooseFile}
                className={`group border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 ${
                  dragOver ? "border-blue-500 bg-blue-50/50 shadow-inner" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/20"
                }`}
              >
                <div className="p-5 bg-slate-50 group-hover:bg-blue-100 rounded-full transition-colors">
                  <Upload className="h-10 w-10 text-slate-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700">Drag & drop CSV files</p>
                  <p className="text-sm text-slate-400 mt-1">or click to browse your computer</p>
                </div>
                <div className="mt-4 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Required: Company, Applied, Selected, Year, Salary
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[200px]">{uploadedFile.name}</p>
                      <p className="text-xs font-bold text-blue-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="hover:bg-red-50 hover:text-red-500 rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {previewData.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/80">
                        <tr>
                          {previewData[0].map((h, i) => (
                            <th key={i} className="p-3 font-bold text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {previewData.slice(1).map((row, i) => (
                          <tr key={i} className="bg-white/50">
                            {row.map((c, j) => (
                              <td key={j} className="p-3 text-slate-500">{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Button 
                  className="w-full py-7 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-transform active:scale-95" 
                  onClick={handleSubmit} 
                  disabled={submitting}
                >
                  {submitting ? "Uploading to Server..." : "Submit for Approval"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-extrabold text-slate-800">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              Success Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {loadingChart ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-6 bg-slate-50 rounded-full">
                  <Database className="h-10 w-10 text-slate-300" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">No Approved Data</p>
                  <p className="text-sm text-slate-400">Charts will populate once the admin approves your uploads.</p>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-1000">
                <ChartContainer config={barConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="company" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontWeight: 600, fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                      <ChartTooltip cursor={{ fill: '#f8fafc' }} content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="selected" 
                        fill="url(#barGradient)" 
                        radius={[10, 10, 0, 0]} 
                        barSize={40}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fadeIn 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default PlacementCellDashboard;