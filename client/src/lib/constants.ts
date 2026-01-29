export const ROLES = ["developer", "designer", "full-stack", "other"] as const;

export const ROLE_LABELS: Record<string, string> = {
  developer: "Developer",
  designer: "Designer",
  "full-stack": "Full-Stack",
  other: "Other",
};

export const SKILLS = [
  "React", "Vue", "Angular", "Next.js", "Svelte",
  "Node.js", "Express", "Django", "Flask", "FastAPI",
  "Rails", "Laravel", "Spring Boot",
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "Ruby", "PHP", "Swift", "Kotlin",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes",
  "Figma", "Sketch", "Adobe XD",
  "UI Design", "UX Research", "Prototyping", "Design Systems",
  "iOS", "Android", "React Native", "Flutter",
  "GraphQL", "REST API", "WebSockets",
  "CI/CD", "DevOps", "Testing",
  "Machine Learning", "Data Science",
];

export const PROJECT_TYPES = [
  { value: "startup", label: "Startup" },
  { value: "freelance", label: "Freelance (client project)" },
];

export const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "in_progress", label: "In Progress" },
  { value: "client_signed", label: "Client Signed" },
];

export const PROJECT_ROLES = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "UI/UX Designer" },
  { value: "full-stack", label: "Full-Stack" },
];

export const DURATIONS = [
  { value: "2_weeks", label: "2 weeks" },
  { value: "4_weeks", label: "4 weeks" },
  { value: "8_plus_weeks", label: "8+ weeks" },
];

export const GOALS = [
  { value: "mvp", label: "MVP" },
  { value: "delivery", label: "Delivery" },
  { value: "revenue", label: "Revenue" },
];

export const LOCATIONS = [
  { value: "remote", label: "Remote" },
  { value: "in_person", label: "In-person" },
  { value: "both", label: "Both" },
];

export const WORK_PREFERENCES = [
  { value: "startup", label: "Startup" },
  { value: "freelance", label: "Freelance" },
  { value: "both", label: "Both" },
];

export const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "America/Toronto", "America/Vancouver",
  "America/Sao_Paulo", "America/Argentina/Buenos_Aires", "America/Mexico_City",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome",
  "Europe/Amsterdam", "Europe/Stockholm", "Europe/Warsaw", "Europe/Lisbon",
  "Europe/Moscow", "Europe/Istanbul",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Asia/Hong_Kong",
  "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
  "Africa/Cairo", "Africa/Lagos", "Africa/Johannesburg",
];
