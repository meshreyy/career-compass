import { useState, useEffect } from "react";
import { Search, Lightbulb, Building2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { recommendedSkills, recommendedCompanies } from "@/data/mockData";

const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch placement outcomes
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("placement_outcomes")
        .select("*");

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        console.log("DATA:", data); // ✅ Debug
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

  return (
    <div className="space-y-6">
      {/* 🔍 Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by year or location..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ⭐ Recommended Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommended Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedSkills.map((skill) => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">
                    {skill.match}%
                  </span>
                </div>
                <Progress value={skill.match} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Companies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              Recommended Companies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedCompanies.map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {company.role}
                  </p>
                </div>
                <Badge variant="secondary">
                  {company.match}% match
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 📊 Placement Outcomes Table */}
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