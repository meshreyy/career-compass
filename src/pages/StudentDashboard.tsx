import { useState, useEffect } from "react";
import { Search, Lightbulb, Building2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [skills, setSkills] = useState<any[]>([]);
  const [companiesRec, setCompaniesRec] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  // 🔥 Fetch placement data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("placement_outcomes")
        .select("*");

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setCompanies(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // 🔍 Search filter
  const filteredCompanies = companies.filter((c) =>
    String(c.academic_year)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (c.job_location_offered || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // 🚀 Generate Recommendation
  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const studentId = 1; // ⚠️ Replace with logged-in student later

      // 1️⃣ Fetch student skills
      const { data: skillsData, error: skillsError } = await supabase
        .from("student_skills")
        .select("skill_name")
        .eq("student_id", studentId);

      if (skillsError) {
        console.error("Error fetching skills:", skillsError);
        return;
      }

      const userSkills = skillsData.map((s) =>
        s.skill_name.toLowerCase()
      );

      // 2️⃣ Fetch preferred companies
      const { data: studentData, error: studentError } = await supabase
        .from("student")
        .select("preferred_company")
        .eq("student_id", studentId)
        .single();

      if (studentError) {
        console.error("Error fetching student:", studentError);
        return;
      }

      const preferredCompanies = studentData?.preferred_company
        ? studentData.preferred_company
            .split(",")
            .map((c) => c.trim().toLowerCase())
        : [];

      // 3️⃣ Call Flask API
      const res = await fetch("http://localhost:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: userSkills,
          companies: preferredCompanies,
        }),
      });

      if (!res.ok) {
        throw new Error("API not reachable");
      }

      const data = await res.json();

      // 4️⃣ Update UI
      setSkills(
        data.skills.map((s: string) => ({
          name: s,
        }))
      );

      setCompaniesRec(
        data.companies.map((c: string) => ({
          name: c,
          role: data.role,
        }))
      );
    } catch (err) {
      console.error("Error:", err);
    }

    setGenerating(false);
  };

  return (
    <div className="space-y-6">

      {/* 🔍 Search */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by year or location..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 🚀 Generate Button */}
      <div className="flex justify-center">
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate Recommendation"}
        </Button>
      </div>

      {/* ⭐ Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">

        {/* Skills Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommended Skills
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                Click "Generate Recommendation"
              </p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between border rounded-md p-2"
                >
                  <span className="font-medium">{skill.name}</span>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Companies Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              Recommended Companies
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {companiesRec.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                Click "Generate Recommendation"
              </p>
            ) : (
              companiesRec.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {company.role}
                    </p>
                  </div>
                  <Badge variant="outline">Recommended</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 📊 Placement Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Placement Outcomes
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading data...
            </p>
          ) : filteredCompanies.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No data found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Salary (LPA)</TableHead>
                  <TableHead className="text-center">
                    Applied
                  </TableHead>
                  <TableHead className="text-center">
                    Shortlisted
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCompanies.map((c) => (
                  <TableRow key={c.placement_outcomes_id}>
                    <TableCell className="font-medium">
                      {c.academic_year}
                    </TableCell>

                    <TableCell>{c.offered_salary}</TableCell>

                    <TableCell className="text-center">
                      {c.students_applied}
                    </TableCell>

                    <TableCell className="text-center">
                      {c.shortlisted_students}
                    </TableCell>

                    <TableCell>
                      {c.job_location_offered}
                    </TableCell>

                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>

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

export default StudentDashboard;