import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
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

  const [user, setUser] = useState(null);

  const [skills, setSkills] = useState([]);
  const [preferredCompanies, setPreferredCompanies] = useState([]);
  const [otherCompanies, setOtherCompanies] = useState([]);

  const [predictedRole, setPredictedRole] = useState("");
  const [missingPreferred, setMissingPreferred] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // ======================
  // LOAD USER
  // ======================

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

  }, []);

  // ======================
  // FETCH TABLE DATA
  // ======================

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

  // ======================
  // FILTER TABLE
  // ======================

  const filteredCompanies = companies.filter((c) =>
    String(c.academic_year)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (c.job_location_offered || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // ======================
  // GENERATE RECOMMENDATION
  // ======================

  const handleGenerate = async () => {

    if (!user) return;

    setGenerating(true);

    const { data: skillsData } = await supabase
      .from("student_skills")
      .select("skill_name")
      .eq("student_id", user.student_id);

    const userSkills = skillsData.map((s) =>
      s.skill_name.toLowerCase()
    );

    const preferredCompanies = user.preferred_company
      ? user.preferred_company
          .split(",")
          .map((c) => c.trim().toLowerCase())
      : [];

    const res = await fetch("http://127.0.0.1:5000/recommend", {

      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        skills: userSkills,
        companies: preferredCompanies
      })

    });

    const data = await res.json();

    setPredictedRole(data.role || "");
    setSkills(data.skills || []);

    setPreferredCompanies(data.preferred_companies || []);
    setOtherCompanies(data.other_companies || []);

    setMissingPreferred(data.preferred_missing);

    setGenerating(false);

  };

  return (

    <div className="space-y-6">

      {/* PROFILE */}

      {user && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
          </CardHeader>

          <CardContent>
            <p><strong>Name:</strong> {user.student_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Branch:</strong> {user.branch}</p>
            <p><strong>Year:</strong> {user.year}</p>
          </CardContent>
        </Card>
      )}

      {/* SEARCH */}

      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />

        <Input
          placeholder="Search by year or location..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GENERATE BUTTON */}

      <div className="flex justify-center">
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate Recommendation"}
        </Button>
      </div>

      {/* RECOMMENDATION CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">

        {/* SKILLS */}

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
          </CardHeader>

          <CardContent>

            {skills.length === 0 ? (
              <p>No skills yet</p>
            ) : (
              skills.map((s) => (
                <div key={s} className="border p-2 rounded mb-2">
                  {s}
                </div>
              ))
            )}

          </CardContent>
        </Card>

        {/* PREFERRED COMPANIES */}

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

            {missingPreferred ? (

              <p className="text-sm text-gray-600">
                We currently don't have role data for your preferred companies.
                We're expanding our dataset.
              </p>

            ) : (

              <p className="text-sm">
                {preferredCompanies.join(", ")}
              </p>

            )}

          </CardContent>
        </Card>

        {/* OTHER COMPANIES */}

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

      {/* TABLE */}

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
                  <TableHead>Year</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Shortlisted</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {filteredCompanies.map((c) => (
                  <TableRow key={c.placement_outcomes_id}>
                    <TableCell>{c.academic_year}</TableCell>
                    <TableCell>{c.offered_salary}</TableCell>
                    <TableCell>{c.students_applied}</TableCell>
                    <TableCell>{c.shortlisted_students}</TableCell>
                    <TableCell>{c.job_location_offered}</TableCell>
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