export const companiesVisited = [
  { id: 1, name: "Google", salary: "₹25,00,000", applied: 120, shortlisted: 45, selected: 12, experience: "0-2 years", location: "Bangalore" },
  { id: 2, name: "Microsoft", salary: "₹22,00,000", applied: 98, shortlisted: 38, selected: 10, experience: "0-1 years", location: "Hyderabad" },
  { id: 3, name: "Amazon", salary: "₹20,00,000", applied: 150, shortlisted: 52, selected: 15, experience: "0-2 years", location: "Bangalore" },
  { id: 4, name: "Infosys", salary: "₹6,50,000", applied: 200, shortlisted: 120, selected: 80, experience: "Fresher", location: "Pune" },
  { id: 5, name: "TCS", salary: "₹7,00,000", applied: 180, shortlisted: 100, selected: 70, experience: "Fresher", location: "Mumbai" },
  { id: 6, name: "Wipro", salary: "₹6,00,000", applied: 160, shortlisted: 90, selected: 60, experience: "Fresher", location: "Chennai" },
  { id: 7, name: "Adobe", salary: "₹18,00,000", applied: 80, shortlisted: 30, selected: 8, experience: "0-2 years", location: "Noida" },
  { id: 8, name: "Flipkart", salary: "₹16,00,000", applied: 110, shortlisted: 40, selected: 10, experience: "0-1 years", location: "Bangalore" },
];

export const recommendedSkills = [
  { name: "Data Structures & Algorithms", match: 92 },
  { name: "React.js", match: 88 },
  { name: "Python", match: 85 },
  { name: "Machine Learning", match: 78 },
  { name: "System Design", match: 75 },
  { name: "SQL & Databases", match: 72 },
];

export const recommendedCompanies = [
  { name: "Google", role: "SDE Intern", match: 95 },
  { name: "Microsoft", role: "Software Engineer", match: 90 },
  { name: "Amazon", role: "SDE-1", match: 87 },
  { name: "Adobe", role: "Member Technical Staff", match: 82 },
  { name: "Flipkart", role: "Backend Engineer", match: 80 },
];

export const placementStats = [
  { company: "Google", selected: 12, department: "CSE" },
  { company: "Microsoft", selected: 10, department: "CSE" },
  { company: "Amazon", selected: 15, department: "CSE" },
  { company: "Infosys", selected: 80, department: "All" },
  { company: "TCS", selected: 70, department: "All" },
  { company: "Wipro", selected: 60, department: "All" },
  { company: "Adobe", selected: 8, department: "CSE" },
  { company: "Flipkart", selected: 10, department: "IT" },
];

export const departmentStats = [
  { department: "CSE", placed: 85, total: 120 },
  { department: "IT", placed: 60, total: 100 },
  { department: "ECE", placed: 45, total: 90 },
  { department: "ME", placed: 30, total: 80 },
  { department: "EE", placed: 25, total: 70 },
];

export const pendingApprovals = [
  { id: 1, fileName: "placement_data_2026_batch1.csv", uploadedBy: "Dr. Sharma", uploadedAt: "2026-03-25", records: 150, status: "pending" as const },
  { id: 2, fileName: "placement_data_2026_batch2.csv", uploadedBy: "Prof. Kumar", uploadedAt: "2026-03-26", records: 200, status: "pending" as const },
  { id: 3, fileName: "internship_data_summer2026.csv", uploadedBy: "Dr. Sharma", uploadedAt: "2026-03-27", records: 80, status: "pending" as const },
];

export const approvedData = [
  { id: 1, studentName: "Rahul Verma", company: "Google", package: "₹25,00,000", department: "CSE", status: "placed" as const },
  { id: 2, studentName: "Priya Singh", company: "Microsoft", package: "₹22,00,000", department: "CSE", status: "placed" as const },
  { id: 3, studentName: "Amit Patel", company: "Amazon", package: "₹20,00,000", department: "IT", status: "placed" as const },
  { id: 4, studentName: "Sneha Gupta", company: "Infosys", package: "₹6,50,000", department: "ECE", status: "placed" as const },
  { id: 5, studentName: "Vikram Rao", company: "TCS", package: "₹7,00,000", department: "ME", status: "placed" as const },
];
