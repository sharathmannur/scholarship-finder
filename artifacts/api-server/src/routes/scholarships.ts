import { Router, type IRouter } from "express";
import {
  CreateApplicationBody,
  GetScholarshipParams,
  ListScholarshipsQueryParams,
  MarkNotificationReadParams,
  SaveScholarshipParams,
  UpdateApplicationBody,
  UpdateApplicationParams,
  UpdateProfileBody,
} from "@workspace/api-zod";

type Scholarship = {
  id: number;
  title: string;
  provider: string;
  description: string;
  amount: string;
  currency: string;
  deadline: string;
  educationLevel: string;
  field: string;
  type: string;
  location: string;
  applicationUrl?: string;
  benefits: string[];
  requiredDocuments: string[];
  eligibilityCriteria: string[];
  minimumPercentage?: number;
  maximumFamilyIncome?: number;
  featured: boolean;
  matchScore: number;
  status: string;
};

type Profile = {
  name: string;
  email: string;
  educationLevel: string;
  field: string;
  state: string;
  category: string;
  familyIncome?: number;
  percentage?: number;
  gender?: string;
  institution?: string;
  completion: number;
  missing: string[];
};

type Application = {
  id: number;
  scholarshipId: number;
  scholarshipTitle: string;
  provider: string;
  status: string;
  appliedDate: string | null;
  deadline: string;
  notes: string;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const applicationLinks = [
  "https://example.com/official-scholarship-application",
];

const scholarshipSeeds: Array<Omit<Scholarship, "id" | "matchScore">> = [
  {
    title: "Future Engineers Scholarship",
    provider: "Scholarship Finder Demo Foundation",
    description:
      "Demo scholarship for students building a strong foundation in engineering and technology.",
    amount: "₹75,000",
    currency: "INR",
    deadline: "2026-10-18",
    educationLevel: "Undergraduate",
    field: "Engineering",
    type: "Private",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Tuition support", "Mentor sessions", "Career workshops"],
    requiredDocuments: ["Academic transcripts", "Income certificate", "Statement of purpose"],
    eligibilityCriteria: ["Undergraduate engineering student", "Minimum 75% aggregate"],
    minimumPercentage: 75,
    maximumFamilyIncome: 800000,
    featured: true,
    status: "Open",
  },
  {
    title: "Digital India Student Grant",
    provider: "Scholarship Finder Demo Collective",
    description:
      "Demo grant supporting students who want to use technology to solve community problems.",
    amount: "₹50,000",
    currency: "INR",
    deadline: "2026-10-04",
    educationLevel: "Undergraduate",
    field: "Computer Science",
    type: "Government",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Project grant", "Cloud credits", "Peer community"],
    requiredDocuments: ["Enrollment proof", "Project outline", "Identity proof"],
    eligibilityCriteria: ["Any computer science undergraduate", "Minimum 70% aggregate"],
    minimumPercentage: 70,
    maximumFamilyIncome: 1000000,
    featured: true,
    status: "Open",
  },
  {
    title: "Young Innovators Scholarship",
    provider: "Scholarship Finder Demo Foundation",
    description:
      "Demo support for students with a practical idea that can improve everyday life.",
    amount: "₹1,00,000",
    currency: "INR",
    deadline: "2026-11-02",
    educationLevel: "Undergraduate",
    field: "Any Field",
    type: "Corporate",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Annual stipend", "Innovation showcase", "Expert feedback"],
    requiredDocuments: ["Academic transcripts", "Project portfolio", "Reference letter"],
    eligibilityCriteria: ["Open to all undergraduate fields", "Submit an innovation proposal"],
    minimumPercentage: 65,
    maximumFamilyIncome: 1200000,
    featured: true,
    status: "Open",
  },
  {
    title: "Women in Technology Scholarship",
    provider: "Scholarship Finder Demo Network",
    description:
      "Demo scholarship for women pursuing a technology degree and building an inclusive future.",
    amount: "₹90,000",
    currency: "INR",
    deadline: "2026-09-30",
    educationLevel: "Undergraduate",
    field: "Computer Science",
    type: "Corporate",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Tuition support", "Women-in-tech network", "Leadership coaching"],
    requiredDocuments: ["Academic transcripts", "Identity proof", "Personal essay"],
    eligibilityCriteria: ["Women in technology programs", "Minimum 72% aggregate"],
    minimumPercentage: 72,
    maximumFamilyIncome: 900000,
    featured: true,
    status: "Open",
  },
  {
    title: "Rural Student Education Grant",
    provider: "Scholarship Finder Demo Trust",
    description:
      "Demo grant for students from rural communities who need help continuing higher education.",
    amount: "₹60,000",
    currency: "INR",
    deadline: "2026-10-11",
    educationLevel: "Undergraduate",
    field: "Any Field",
    type: "NGO",
    location: "Rural India",
    applicationUrl: applicationLinks[0],
    benefits: ["Annual education grant", "Device allowance", "Local mentor"],
    requiredDocuments: ["Residence proof", "Income certificate", "Enrollment proof"],
    eligibilityCriteria: ["Rural background", "Family income below ₹6 lakh"],
    minimumPercentage: 60,
    maximumFamilyIncome: 600000,
    featured: false,
    status: "Open",
  },
  {
    title: "STEM Excellence Scholarship",
    provider: "Scholarship Finder Demo Foundation",
    description:
      "Demo award for high-achieving students studying science, technology, engineering, or mathematics.",
    amount: "₹1,25,000",
    currency: "INR",
    deadline: "2026-12-08",
    educationLevel: "Postgraduate",
    field: "Science",
    type: "University",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Research allowance", "Conference support", "Faculty mentorship"],
    requiredDocuments: ["Degree certificate", "Research statement", "Two references"],
    eligibilityCriteria: ["Postgraduate STEM student", "Minimum 80% aggregate"],
    minimumPercentage: 80,
    maximumFamilyIncome: 1500000,
    featured: false,
    status: "Open",
  },
  {
    title: "First-Generation Learner Award",
    provider: "Scholarship Finder Demo Trust",
    description:
      "Demo award helping first-generation college students stay focused on their degree.",
    amount: "₹45,000",
    currency: "INR",
    deadline: "2026-10-27",
    educationLevel: "Undergraduate",
    field: "Any Field",
    type: "NGO",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Study grant", "Peer support", "Application guidance"],
    requiredDocuments: ["Enrollment proof", "Family declaration", "Academic transcripts"],
    eligibilityCriteria: ["First-generation learner", "Family income below ₹8 lakh"],
    minimumPercentage: 60,
    maximumFamilyIncome: 800000,
    featured: false,
    status: "Open",
  },
  {
    title: "Maharashtra Merit Bursary",
    provider: "Scholarship Finder Demo Foundation",
    description:
      "Demo bursary for Maharashtra students with consistent academic performance.",
    amount: "₹40,000",
    currency: "INR",
    deadline: "2026-09-28",
    educationLevel: "Class 12",
    field: "Any Field",
    type: "Government",
    location: "Maharashtra",
    applicationUrl: applicationLinks[0],
    benefits: ["Annual bursary", "Exam preparation support"],
    requiredDocuments: ["Domicile proof", "Class 10 marksheet", "Income certificate"],
    eligibilityCriteria: ["Maharashtra resident", "Minimum 78% aggregate"],
    minimumPercentage: 78,
    maximumFamilyIncome: 700000,
    featured: false,
    status: "Open",
  },
  {
    title: "Healthcare Pathways Scholarship",
    provider: "Scholarship Finder Demo Network",
    description:
      "Demo scholarship for students preparing for careers that strengthen community health.",
    amount: "₹1,10,000",
    currency: "INR",
    deadline: "2026-11-19",
    educationLevel: "Undergraduate",
    field: "Medicine",
    type: "Private",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Tuition support", "Clinical exposure", "Mentor network"],
    requiredDocuments: ["Academic transcripts", "Admission letter", "Income certificate"],
    eligibilityCriteria: ["Medicine or allied health student", "Minimum 75% aggregate"],
    minimumPercentage: 75,
    maximumFamilyIncome: 1000000,
    featured: false,
    status: "Open",
  },
  {
    title: "Commerce Leaders Fellowship",
    provider: "Scholarship Finder Demo Collective",
    description:
      "Demo fellowship for commerce students interested in ethical business and finance.",
    amount: "₹80,000",
    currency: "INR",
    deadline: "2026-10-21",
    educationLevel: "Postgraduate",
    field: "Commerce",
    type: "Corporate",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Fellowship stipend", "Industry project", "Leadership series"],
    requiredDocuments: ["Degree certificate", "Resume", "Statement of purpose"],
    eligibilityCriteria: ["Postgraduate commerce student", "Minimum 70% aggregate"],
    minimumPercentage: 70,
    maximumFamilyIncome: 1400000,
    featured: false,
    status: "Open",
  },
  {
    title: "Creative Arts Access Grant",
    provider: "Scholarship Finder Demo Trust",
    description:
      "Demo grant that keeps creative education accessible for students with strong portfolios.",
    amount: "₹55,000",
    currency: "INR",
    deadline: "2026-11-07",
    educationLevel: "Diploma",
    field: "Arts",
    type: "NGO",
    location: "All India",
    applicationUrl: applicationLinks[0],
    benefits: ["Course support", "Portfolio review", "Materials allowance"],
    requiredDocuments: ["Portfolio", "Enrollment proof", "Income certificate"],
    eligibilityCriteria: ["Arts or design diploma student", "Submit a creative portfolio"],
    minimumPercentage: 55,
    maximumFamilyIncome: 700000,
    featured: false,
    status: "Open",
  },
];

const extraSeeds = [
  ["AI & Data Science Starter Award", "AI & Data Science", "Undergraduate"],
  ["Law & Justice Student Grant", "Law", "Undergraduate"],
  ["Management Futures Scholarship", "Management", "Postgraduate"],
  ["Science Research Access Grant", "Science", "Undergraduate"],
  ["Class 10 Bright Futures Award", "Any Field", "Class 10"],
  ["Class 12 Next Step Scholarship", "Any Field", "Class 12"],
  ["Diploma Skills Scholarship", "Any Field", "Diploma"],
  ["PhD Discovery Fellowship", "Science", "PhD"],
  ["Computer Science Community Grant", "Computer Science", "Undergraduate"],
  ["Engineering Women Changemakers Award", "Engineering", "Undergraduate"],
  ["Rural STEM Bridge Scholarship", "Engineering", "Undergraduate"],
  ["Inclusive Education Access Grant", "Any Field", "Undergraduate"],
] as const;

let scholarships: Scholarship[] = scholarshipSeeds.map((scholarship, index) => ({
  ...scholarship,
  id: index + 1,
  matchScore: [92, 88, 84, 79, 74, 71, 67, 63, 61, 59, 56, 53][index] ?? 50,
}));

scholarships = scholarships.concat(
  extraSeeds.map(([title, field, educationLevel], index) => ({
    id: scholarshipSeeds.length + index + 1,
    title,
    provider: "Scholarship Finder Demo Collective",
    description: `Demo scholarship for students exploring ${field.toLowerCase()} and planning their next academic step.`,
    amount: `₹${35 + index * 5},000`,
    currency: "INR",
    deadline: `2026-${String(10 + (index % 3)).padStart(2, "0")}-${String(12 + index).padStart(2, "0")}`,
    educationLevel,
    field,
    type: index % 2 === 0 ? "Private" : "NGO",
    location: index % 3 === 0 ? "All India" : "Maharashtra",
    applicationUrl: applicationLinks[0],
    benefits: ["Education support", "Mentorship"],
    requiredDocuments: ["Academic transcripts", "Identity proof"],
    eligibilityCriteria: [`Current ${educationLevel.toLowerCase()} student`, "Review official demo criteria"],
    minimumPercentage: 60,
    maximumFamilyIncome: 900000,
    featured: index < 2,
    matchScore: 50 - index,
    status: "Open",
  })),
);

let profile: Profile = {
  name: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  educationLevel: "Undergraduate",
  field: "Computer Science",
  state: "Maharashtra",
  category: "Open",
  familyIncome: 540000,
  percentage: 82,
  gender: "Male",
  institution: "Pune Institute of Technology",
  completion: 85,
  missing: ["Income certificate"],
};

let savedIds = new Set<number>([1, 4, 7]);
let applications: Application[] = [
  {
    id: 1,
    scholarshipId: 2,
    scholarshipTitle: "Digital India Student Grant",
    provider: "Scholarship Finder Demo Collective",
    status: "Applied",
    appliedDate: "2026-09-12",
    deadline: "2026-10-04",
    notes: "Uploaded project outline and income certificate.",
  },
  {
    id: 2,
    scholarshipId: 5,
    scholarshipTitle: "Rural Student Education Grant",
    provider: "Scholarship Finder Demo Trust",
    status: "Preparing",
    appliedDate: null,
    deadline: "2026-10-11",
    notes: "Need to request residence proof.",
  },
];
let notifications: Notification[] = [
  {
    id: 1,
    title: "Deadline approaching",
    message: "Women in Technology Scholarship closes on 30 September.",
    type: "deadline",
    read: false,
    createdAt: "2026-09-24T09:00:00.000Z",
  },
  {
    id: 2,
    title: "New match found",
    message: "A new demo scholarship matches your Computer Science profile.",
    type: "match",
    read: false,
    createdAt: "2026-09-23T13:30:00.000Z",
  },
  {
    id: 3,
    title: "Profile looks strong",
    message: "Add your income certificate to reach 100% completion.",
    type: "profile",
    read: true,
    createdAt: "2026-09-21T08:15:00.000Z",
  },
];

function calculateProfileCompletion(next: Profile): Profile {
  const checks = [
    ["name", next.name],
    ["education level", next.educationLevel],
    ["field of study", next.field],
    ["state", next.state],
    ["category", next.category],
    ["family income", next.familyIncome],
    ["academic percentage", next.percentage],
    ["gender", next.gender],
    ["institution", next.institution],
  ] as const;
  const missing = checks.filter(([, value]) => value === undefined || value === "").map(([label]) => label);
  return {
    ...next,
    completion: Math.round(((checks.length - missing.length) / checks.length) * 100),
    missing,
  };
}

function scoreScholarship(scholarship: Scholarship) {
  let score = 55;
  const reasons: string[] = [];
  const missingRequirements: string[] = [];
  if (scholarship.educationLevel === profile.educationLevel || scholarship.educationLevel === "Any Field") {
    score += 15;
    reasons.push("Your education level matches");
  }
  if (scholarship.field === profile.field || scholarship.field === "Any Field") {
    score += 12;
    reasons.push("Your field of study matches");
  }
  if (!scholarship.minimumPercentage || (profile.percentage ?? 0) >= scholarship.minimumPercentage) {
    score += 10;
    reasons.push("Your academic percentage meets the requirement");
  } else {
    missingRequirements.push(`Minimum percentage is ${scholarship.minimumPercentage}%`);
  }
  if (!scholarship.maximumFamilyIncome || (profile.familyIncome ?? Number.POSITIVE_INFINITY) <= scholarship.maximumFamilyIncome) {
    score += 8;
    reasons.push("Your family income is within the stated limit");
  } else {
    missingRequirements.push("Family income is above the stated limit");
  }
  return {
    ...scholarship,
    matchScore: Math.min(99, score),
    reasons,
    missingRequirements,
  };
}

function getRecommendations() {
  return scholarships
    .map(scoreScholarship)
    .sort((a, b) => b.matchScore - a.matchScore);
}

function getScholarship(id: number) {
  return scholarships.find((scholarship) => scholarship.id === id);
}

const router: IRouter = Router();

router.get("/scholarships", (req, res) => {
  const query = ListScholarshipsQueryParams.parse(req.query);
  let result = scholarships.filter((scholarship) => {
    const searchable = `${scholarship.title} ${scholarship.provider} ${scholarship.field} ${scholarship.description} ${scholarship.educationLevel}`.toLowerCase();
    return (
      (!query.search || searchable.includes(query.search.toLowerCase())) &&
      (!query.educationLevel || scholarship.educationLevel === query.educationLevel) &&
      (!query.field || scholarship.field === query.field) &&
      (!query.type || scholarship.type === query.type) &&
      (query.featured === undefined || scholarship.featured === query.featured)
    );
  });
  if (query.sort === "amount") result = result.sort((a, b) => Number(b.amount.replace(/\D/g, "")) - Number(a.amount.replace(/\D/g, "")));
  if (query.sort === "deadline") result = result.sort((a, b) => a.deadline.localeCompare(b.deadline));
  if (query.sort === "alphabetical") result = result.sort((a, b) => a.title.localeCompare(b.title));
  if (query.sort === "match") result = result.sort((a, b) => b.matchScore - a.matchScore);
  res.json(result);
});

router.get("/scholarships/:id", (req, res) => {
  const { id } = GetScholarshipParams.parse(req.params);
  const scholarship = getScholarship(id);
  if (!scholarship) return res.status(404).json({ error: "Scholarship not found" });
  return res.json(scoreScholarship(scholarship));
});

router.get("/profile", (_req, res) => res.json(profile));

router.put("/profile", (req, res) => {
  const input = UpdateProfileBody.parse(req.body);
  profile = calculateProfileCompletion({ ...profile, ...input });
  res.json(profile);
});

router.get("/recommendations", (_req, res) => res.json(getRecommendations()));

router.get("/saved", (_req, res) => {
  res.json([...savedIds].map(getScholarship).filter(Boolean).map((item) => scoreScholarship(item as Scholarship)));
});

router.post("/saved/:scholarshipId", (req, res) => {
  const { scholarshipId } = SaveScholarshipParams.parse(req.params);
  const scholarship = getScholarship(scholarshipId);
  if (!scholarship) return res.status(404).json({ error: "Scholarship not found" });
  savedIds.add(scholarshipId);
  return res.json(scoreScholarship(scholarship));
});

router.delete("/saved/:scholarshipId", (req, res) => {
  const { scholarshipId } = SaveScholarshipParams.parse(req.params);
  savedIds.delete(scholarshipId);
  res.status(204).send();
});

router.get("/applications", (_req, res) => res.json(applications));

router.post("/applications", (req, res) => {
  const input = CreateApplicationBody.parse(req.body);
  const scholarship = getScholarship(input.scholarshipId);
  if (!scholarship) return res.status(404).json({ error: "Scholarship not found" });
  const application: Application = {
    id: Math.max(0, ...applications.map((item) => item.id)) + 1,
    scholarshipId: scholarship.id,
    scholarshipTitle: scholarship.title,
    provider: scholarship.provider,
    status: input.status,
    appliedDate: input.status === "Applied" ? new Date().toISOString().slice(0, 10) : null,
    deadline: scholarship.deadline,
    notes: input.notes ?? "",
  };
  applications = [application, ...applications];
  return res.status(201).json(application);
});

router.put("/applications/:id", (req, res) => {
  const { id } = UpdateApplicationParams.parse(req.params);
  const input = UpdateApplicationBody.parse(req.body);
  const index = applications.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ error: "Application not found" });
  const existing = applications[index];
  const updated: Application = {
    ...existing,
    ...input,
    appliedDate: input.status === "Applied" && !existing.appliedDate ? new Date().toISOString().slice(0, 10) : existing.appliedDate,
  };
  applications[index] = updated;
  return res.json(updated);
});

router.get("/notifications", (_req, res) => res.json(notifications));

router.post("/notifications/:id/read", (req, res) => {
  const { id } = MarkNotificationReadParams.parse(req.params);
  const index = notifications.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ error: "Notification not found" });
  notifications[index] = { ...notifications[index], read: true };
  return res.json(notifications[index]);
});

router.get("/dashboard", (_req, res) => {
  const recommendations = getRecommendations();
  res.json({
    recommendedCount: recommendations.length,
    savedCount: savedIds.size,
    appliedCount: applications.filter((item) => item.status === "Applied").length,
    upcomingDeadlines: scholarships.filter((item) => item.deadline <= "2026-10-31").length,
    profile,
    topMatches: recommendations.slice(0, 3),
    applications,
  });
});

export default router;