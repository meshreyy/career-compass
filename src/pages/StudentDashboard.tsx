import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Search,
  ChevronRight,
  Target
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [preferredCompanies, setPreferredCompanies] = useState<string[]>([]);
  const [otherCompanies, setOtherCompanies] = useState<string[]>([]);
  const [predictedRole, setPredictedRole] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("placement_outcomes").select("*");
      setCompanies(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    String(c.academic_year).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    const { data: skillsData } = await supabase
      .from("student_skills")
      .select("skill_name")
      .eq("student_id", user.student_id);

    const userSkills = skillsData?.map((s: any) => s.skill_name.toLowerCase()) || [];
    const preferredCompaniesInput = user.preferred_company
      ? user.preferred_company.split(",").map((c: string) => c.trim().toLowerCase())
      : [];

    try {
      const res = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: userSkills,
          companies: preferredCompaniesInput
        })
      });
      const data = await res.json();
      setPredictedRole(data.role || "");
      setSkills(data.skills || []);
      setPreferredCompanies(data.preferred_companies || []);
      setOtherCompanies(data.other_companies || []);
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans text-slate-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Target className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Career<span className="text-blue-600">Compass</span>
          </h1>
        </div>

        {user && (
          <div className="relative group">
            <button className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold shadow-md shadow-blue-200">
                {user.student_name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.student_name}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1">Student Dashboard</p>
              </div>
            </button>

            {/* DROPDOWN */}
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <UserIcon className="text-slate-400 w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{user.student_name}</p>
                  <p className="text-xs text-slate-500 truncate w-40">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl mb-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Branch</span>
                  <span className="text-slate-700">{user.branch}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Year</span>
                  <span className="text-slate-700">{user.year} Year</span>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full rounded-xl gap-2 font-bold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none shadow-none"
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-10">
        
        {/* HERO SECTION */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64 text-blue-600" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-black text-slate-800 leading-tight">
              Ready to find your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Dream Career?</span>
            </h2>
            <p className="mt-4 text-slate-500 font-medium text-lg leading-relaxed">
              Use our AI-powered engine to analyze your skills and get matched with the best career roles and companies tailored for you.
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={generating}
              className={`mt-8 h-14 px-8 rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-95 ${
                generating 
                ? "bg-slate-100 text-slate-400" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
              }`}
            >
              {generating ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  Analyzing Skills...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Generate My Recommendation
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* RESULTS SECTION */}
        <div className={`transition-all duration-700 transform ${skills.length > 0 ? "translate-y-0 opacity-100" : "opacity-60"}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* RECOMMENDED SKILLS */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                  </div>
                  Target Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {skills.length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <p className="text-sm font-medium">Results will appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100 transition-all hover:bg-indigo-100">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PREFERRED COMPANIES */}
            <Card className="border-none shadow-xl shadow-blue-200/40 rounded-[2rem] overflow-hidden bg-blue-600 text-white lg:scale-105 z-10">
              <CardHeader className="p-6 border-b border-white/10">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  Best Fit Matches
                </CardTitle>
                {predictedRole && (
                  <div className="mt-4 px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-70">AI Predicted Role</p>
                    <p className="text-xl font-black mt-1 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" /> {predictedRole}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {preferredCompanies.length === 0 ? (
                  <p className="text-sm font-medium opacity-60 text-center py-10">No matches yet</p>
                ) : (
                  <div className="space-y-3">
                    {preferredCompanies.map((c) => (
                      <div key={c} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 group hover:bg-white/20 transition-all cursor-default">
                        <span className="font-bold text-lg capitalize">{c}</span>
                        <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OTHER RECOMMENDATIONS */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  Alternative Paths
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {otherCompanies.length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <p className="text-sm font-medium">Awaiting analysis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {otherCompanies.map((c) => (
                      <div key={c} className="p-4 border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                        <p className="font-bold text-slate-800 capitalize">{c}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium italic">
                           Candidate for {predictedRole}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* COMPANIES TABLE SECTION */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Placement Records</h3>
              <p className="text-sm text-slate-500 font-medium">Browse verified outcomes from previous academic years.</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search company or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-slate-200 bg-white focus:ring-blue-600 shadow-sm"
              />
            </div>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-20 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="py-5 font-bold text-slate-600 pl-8">Company Name</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center">Applied</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center">Selected</TableHead>
                      <TableHead className="font-bold text-slate-600 text-center">Year</TableHead>
                      <TableHead className="pr-8 font-bold text-slate-600 text-right">CTC (LPA)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((c) => (
                      <TableRow key={c.id || c.placement_outcomes_id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="py-5 font-bold text-slate-700 pl-8 capitalize">
                          {c.company_name}
                        </TableCell>
                        <TableCell className="text-center font-medium text-slate-500">
                          {c.students_applied}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black">
                            {c.shortlisted_students}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold text-slate-400 text-xs">
                          {c.academic_year}
                        </TableCell>
                        <TableCell className="pr-8 text-right font-black text-slate-800">
                          ₹{c.offered_salary}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;