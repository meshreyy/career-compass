

## Campus Placement Hub — UI Prototype

A role-based campus placement dashboard using the blue color palette (#F8F9FB → #71A5DE) with mock data and a single sidebar that switches between Student, Placement Cell, and Admin views.

### Color System
Update the design system to use the provided blue palette:
- Background: #F8F9FB
- Cards/surfaces: #E1ECF7
- Accents: #AECBEB, #83B0E1
- Primary: #71A5DE

### Sidebar Navigation
- Role tabs at the top (Student / Placement Cell / Admin) to switch dashboards
- Menu items change based on selected role
- Collapsible sidebar with icons

### Student Dashboard
1. **Search Bar** — search companies by name, role, location
2. **Recommended Skills Card** — list of skills with match percentage (mock data)
3. **Recommended Companies Card** — company logos/names based on profile (mock data)
4. **Companies Visited College Table** — columns: Company Name, Offered Salary, Students Applied, Students Shortlisted, Students Selected, Experience Level, Job Location, Action (View Details button)

### Placement Cell Dashboard
1. **CSV Upload Card** — drag-and-drop or file picker restricted to .csv files for uploading student placement records, with file validation and preview
2. **Placement Statistics Card** — charts/graphs showing placement data (bar chart for company-wise selections, pie chart for department-wise placement rate) using recharts with mock data

### Admin Dashboard
1. **Pending Approvals Card** — list of uploaded placement data awaiting verification, with Approve/Reject buttons
2. **Approved Data Table** — table of verified placement records with status badges

### Pages & Routing
- `/` — Student Dashboard (default)
- `/placement-cell` — Placement Cell Dashboard
- `/admin` — Admin Dashboard
- All wrapped in a shared layout with the role-switching sidebar

