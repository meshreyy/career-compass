import { useState } from "react";
import { Search, Lightbulb, Building2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { companiesVisited, recommendedSkills, recommendedCompanies } from "@/data/mockData";

const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companiesVisited.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies by name, role, location..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Recommended Cards */}
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
                  <span className="text-muted-foreground">{skill.match}%</span>
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
                  <p className="text-sm text-muted-foreground">{company.role}</p>
                </div>
                <Badge variant="secondary">{company.match}% match</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Companies Visited College */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Companies Visited College</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Offered Salary</TableHead>
                <TableHead className="text-center">Applied</TableHead>
                <TableHead className="text-center">Shortlisted</TableHead>
                <TableHead className="text-center">Selected</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Location</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.salary}</TableCell>
                  <TableCell className="text-center">{c.applied}</TableCell>
                  <TableCell className="text-center">{c.shortlisted}</TableCell>
                  <TableCell className="text-center">{c.selected}</TableCell>
                  <TableCell>{c.experience}</TableCell>
                  <TableCell>{c.location}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
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

export default StudentDashboard;
