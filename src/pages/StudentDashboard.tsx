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

import { supabase } from "@/lib/supabaseClient";

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

  // LOAD USER
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // FETCH APPROVED DATA (placement outcomes)
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("placement_outcomes")
        .select("*");

      setCompanies(data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  // FILTER TABLE
  const filteredCompanies = companies.filter((c) =>
    String(c.academic_year).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // GENERATE RECOMMENDATION
  const handleGenerate = async () => {
    if (!user) return;

    setGenerating(true);

    const { data: skillsData } = await supabase
      .from("student_skills")
      .select("skill_name")
      .eq("student_id", user.student_id);

    const userSkills = skillsData.map((s: any) => s.skill_name.toLowerCase());

    const preferredCompaniesInput = user.preferred_company
      ? user.preferred_company.split(",").map((c: string) => c.trim().toLowerCase())
      : [];

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

    setGenerating(false);
  };

  return (
    <div className="space-y-6">

      {/* NAVBAR */}
      <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
        <h1 className="text-lg font-semibold">Career Compass</h1>

        {user && (
          <div className="relative group">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold cursor-pointer">
              {user.student_name?.charAt(0).toUpperCase()}
            </div>

            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                            transition-all duration-200 z-50">

              <p className="font-semibold">{user.student_name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <hr className="my-2" />
              <p className="text-sm">Branch: {user.branch}</p>
              <p className="text-sm">Year: {user.year}</p>
            </div>
          </div>
        )}
      </div>

      {/* GENERATE BUTTON */}
      <div className="flex justify-center">
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate Recommendation"}
        </Button>
      </div>

      {/* ================= SKILLS SECTION ================= */}
      <div id="skills">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">

          {/* SKILLS */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Click on Generate Recommendation button to generate recommendation.
                </p>
              ) : (
                skills.map((s) => (
                  <div key={s} className="border p-2 rounded mb-2">{s}</div>
                ))
              )}
            </CardContent>
          </Card>

          {/* PREFERRED */}
          <Card>
            <CardHeader>
              <CardTitle>Your Preferred Companies</CardTitle>
              {predictedRole && (
                <p className="text-sm text-blue-600 font-medium">
                  Predicted Role: {predictedRole}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {preferredCompanies.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Click on Generate Recommendation button to generate recommendation.
                </p>
              ) : (
                preferredCompanies.map((c) => (
                  <div key={c} className="border p-2 rounded mb-2">
                    {c} - {predictedRole}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* OTHER */}
          <Card>
            <CardHeader>
              <CardTitle>You Can Also Apply Here</CardTitle>
            </CardHeader>
            <CardContent>
              {otherCompanies.map((c) => (
                <div key={c} className="border p-2 rounded mb-2">
                  {c} - {predictedRole}
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ================= COMPANIES SECTION ================= */}
      <div id="companies">
        <Card>
          <CardHeader>
            <CardTitle>Placement Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
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
                  {filteredCompanies.map((c) => (
                    <TableRow key={c.id || c.placement_outcomes_id}>
                      <TableCell>{c.company_name}</TableCell>
                      <TableCell>{c.students_applied}</TableCell>
                      <TableCell>{c.shortlisted_students}</TableCell>
                      <TableCell>{c.academic_year}</TableCell>
                      <TableCell>{c.offered_salary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default StudentDashboard;