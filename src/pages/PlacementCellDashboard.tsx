import { useState, useCallback } from "react";
import { Upload, X, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { placementStats, departmentStats } from "@/data/mockData";
import { supabase } from "@/lib/supabaseClient";

const barConfig = {
  selected: { label: "Students Selected", color: "hsl(var(--chart-1))" },
};

const pieColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-4))",
];

const PlacementCellDashboard = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [chartData, setChartData] = useState([]);

  // 📂 FILE HANDLER
  const handleFile = useCallback((file) => {
    if (!file.name.endsWith(".csv")) {
      alert("Only CSV files are allowed.");
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;

      const rows = text
        .split("\n")
        .map((r) => r.split(",").map(c => c.trim()));

      setPreviewData(rows.slice(0, 6));

      const headers = rows[0];
      const dataRows = rows.slice(1);

      // 🔥 SMART COLUMN DETECTION
      const companyIndex = headers.findIndex(h =>
        /company|name|org/i.test(h)
      );

      const selectedIndex = headers.findIndex(h =>
        /selected|placed|hired|students/i.test(h)
      );

      if (companyIndex === -1 || selectedIndex === -1) {
        alert("Could not detect required columns.\nCheck CSV headers.");
        console.log("Headers found:", headers);
        return;
      }

      // 🔥 FORMAT DATA
      const formatted = dataRows
        .filter(row => row.length > 1)
        .map(row => ({
          company: row[companyIndex],
          selected: Number(row[selectedIndex]) || 0,
        }));

      setChartData(formatted);
    };

    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // 🔥 SUBMIT TO ADMIN
  const handleSubmit = async () => {
    if (!uploadedFile || previewData.length === 0) {
      alert("Upload CSV first");
      return;
    }

    const { error } = await supabase.from("approvals").insert([
      {
        file_name: uploadedFile.name,
        uploaded_by: "Placement Cell",
        records: previewData.length,
        status: "pending",
        data: previewData,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Failed to send ❌");
    } else {
      alert("Sent for approval ✅");
      setUploadedFile(null);
      setPreviewData([]);
      setChartData([]);
    }
  };

  const depData = departmentStats.map((d) => ({
    ...d,
    rate: Math.round((d.placed / d.total) * 100),
  }));

  return (
    <div className="space-y-6">

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5 text-primary" />
            Upload Placement Data (CSV)
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!uploadedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
                ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv";
                input.onchange = (e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                };
                input.click();
              }}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm">
                Drag & drop CSV or <span className="text-primary">click</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* File Info */}
              <div className="flex justify-between border p-3 rounded">
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewData([]);
                    setChartData([]);
                  }}
                >
                  <X />
                </Button>
              </div>

              {/* Preview */}
              {previewData.length > 0 && (
                <table className="w-full text-xs border">
                  <thead>
                    <tr>
                      {previewData[0].map((h, i) => (
                        <th key={i} className="p-2 border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((c, j) => (
                          <td key={j} className="p-2 border">{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Submit */}
              <Button className="w-full" onClick={handleSubmit}>
                <Upload className="h-4 w-4 mr-2" />
                Submit for Approval
              </Button>

            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Company-wise Selections
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ChartContainer config={barConfig} className="h-[300px]">
              <BarChart data={chartData.length ? chartData : placementStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="company" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="selected" fill="var(--color-selected)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* PIE CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Placement Rate</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={depData} dataKey="rate" nameKey="department">
                  {depData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PlacementCellDashboard;