import { User, ScheduleEntry, Holiday, WeeklyChallenge, Achievement, Announcement, HandbookSection, LeaderboardEntry } from "./types";

// ─── Team Members (from prototypes) ───
export const MOCK_USERS: User[] = [
  {
    id: "usr_1",
    email: "jamie@idc.agency",
    firstName: "Jamie",
    lastName: "Lee",
    initials: "JL",
    role: "ADMIN",
    department: "DESIGN",
    jobTitle: "Senior Designer",
    bio: "Brand identity specialist with 6 years at IDC. Led rebrands for Acme Corp and Nova Ventures. Obsessed with type, motion, and the perfect typeface pairing. Mentor to junior designers on the team.",
    avatarGradient: "linear-gradient(135deg, #3B6FE8, #7C5CBF)",
    skills: ["Figma", "After Effects", "Brand", "Motion"],
    socialLinks: { linkedin: "#", behance: "#" },
    funFact: "Can name any font within 3 seconds",
    joinedAt: "2020-03-15",
    isActive: true,
  },
  {
    id: "usr_2",
    email: "haley@idc.agency",
    firstName: "Haley",
    lastName: "Lin",
    initials: "HL",
    role: "EMPLOYEE",
    department: "STRATEGY",
    jobTitle: "Strategy Lead",
    bio: "Growth strategist and client lead. Manages 5 key accounts and leads the sales pipeline. Former consultant at Deloitte Digital.",
    avatarGradient: "linear-gradient(135deg, #2DAE7F, #3B6FE8)",
    skills: ["Growth", "Analytics", "Asana", "Decks"],
    socialLinks: { linkedin: "#" },
    funFact: "Has visited 32 countries",
    joinedAt: "2021-06-01",
    isActive: true,
  },
  {
    id: "usr_3",
    email: "roger@idc.agency",
    firstName: "Roger",
    lastName: "Grant",
    initials: "RG",
    role: "EMPLOYEE",
    department: "VIDEO",
    jobTitle: "Video Director",
    bio: "Storyteller at heart. Directs, edits, and scores. Has shot campaigns for 20+ brands. Works best with a cold brew in hand.",
    avatarGradient: "linear-gradient(135deg, #F0A500, #E85D4A)",
    skills: ["Premiere", "DaVinci", "Directing", "Audio"],
    socialLinks: { linkedin: "#" },
    funFact: "Once edited a full commercial during a 6-hour flight",
    joinedAt: "2019-09-10",
    isActive: true,
  },
  {
    id: "usr_4",
    email: "sofia@idc.agency",
    firstName: "Sofia",
    lastName: "Reyes",
    initials: "SR",
    role: "EMPLOYEE",
    department: "DESIGN",
    jobTitle: "UI/UX Designer",
    bio: "Builds beautiful, usable digital experiences. Leads all Webflow builds and prototyping for client sites. Speaks fluent CSS.",
    avatarGradient: "linear-gradient(135deg, #7C5CBF, #E85D4A)",
    skills: ["Figma", "Webflow", "Prototyping", "CSS"],
    socialLinks: { linkedin: "#", behance: "#" },
    funFact: "Runs a design meme account with 50k followers",
    joinedAt: "2024-03-03",
    isActive: true,
  },
  {
    id: "usr_5",
    email: "jordan@idc.agency",
    firstName: "Jordan",
    lastName: "Mills",
    initials: "JM",
    role: "EMPLOYEE",
    department: "OPS",
    jobTitle: "Ops Manager",
    bio: "Keeps the trains running. Manages capacity, invoices, and tooling. Introduced Asana automation that saved 6 hours/week.",
    avatarGradient: "linear-gradient(135deg, #2DAE7F, #F0A500)",
    skills: ["Asana", "Finance", "Systems", "Notion"],
    socialLinks: { linkedin: "#" },
    funFact: "Competitive chess player ranked top 500 nationally",
    joinedAt: "2022-01-10",
    isActive: true,
  },
  {
    id: "usr_6",
    email: "priya@idc.agency",
    firstName: "Priya",
    lastName: "Nair",
    initials: "PN",
    role: "EMPLOYEE",
    department: "STRATEGY",
    jobTitle: "Content Strategist",
    bio: "Crafts narratives that convert. Manages social calendars for 4 clients and writes copy that doesn't sound like AI wrote it.",
    avatarGradient: "linear-gradient(135deg, #E85D4A, #7C5CBF)",
    skills: ["Copywriting", "SEO", "Social", "Email"],
    socialLinks: { linkedin: "#" },
    funFact: "Published poet — 2 collections and counting",
    joinedAt: "2022-08-15",
    isActive: true,
  },
  {
    id: "usr_7",
    email: "marcus@idc.agency",
    firstName: "Marcus",
    lastName: "Webb",
    initials: "MW",
    role: "EMPLOYEE",
    department: "VIDEO",
    jobTitle: "Motion Designer",
    bio: "Brings static designs to life. After Effects wizard, Lottie enthusiast. Currently obsessed with 3D motion and product renders.",
    avatarGradient: "linear-gradient(135deg, #3B6FE8, #2DAE7F)",
    skills: ["After Effects", "Cinema 4D", "Lottie"],
    socialLinks: { linkedin: "#", behance: "#" },
    funFact: "Makes custom mechanical keyboards as a hobby",
    joinedAt: "2023-04-20",
    isActive: true,
  },
  {
    id: "usr_8",
    email: "dana@idc.agency",
    firstName: "Dana",
    lastName: "Cruz",
    initials: "DC",
    role: "EMPLOYEE",
    department: "OPS",
    jobTitle: "Account Manager",
    bio: "First point of contact for 6 clients. Bridges creative and client expectations. Known for turning difficult feedback into clear briefs.",
    avatarGradient: "linear-gradient(135deg, #F0A500, #7C5CBF)",
    skills: ["Client comms", "Asana", "Reporting"],
    socialLinks: { linkedin: "#" },
    funFact: "Former improv comedy performer",
    joinedAt: "2023-07-01",
    isActive: true,
  },
];

// Current logged-in user (Jamie Lee — Admin)
export const CURRENT_USER = MOCK_USERS[0];

// ─── Schedule (current month sample) ───
function generateScheduleEntries(): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  MOCK_USERS.forEach((user) => {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue; // skip weekends

      let type: ScheduleEntry["type"] = "IN_OFFICE";
      const rand = Math.random();
      if (rand < 0.3) type = "REMOTE";
      else if (rand < 0.05) type = "DAY_OFF";

      entries.push({
        id: `sch_${user.id}_${d}`,
        userId: user.id,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        type,
        startTime: "09:00",
        endTime: "17:00",
      });
    }
  });
  return entries;
}

export const MOCK_SCHEDULE: ScheduleEntry[] = generateScheduleEntries();

// ─── Holidays ───
export const MOCK_HOLIDAYS: Holiday[] = [
  { id: "hol_1", name: "Good Friday", date: "2026-04-03", isPaid: true },
  { id: "hol_2", name: "Easter Monday", date: "2026-04-06", isPaid: true },
  { id: "hol_3", name: "Memorial Day", date: "2026-05-25", isPaid: true },
  { id: "hol_4", name: "Independence Day", date: "2026-07-04", isPaid: true },
  { id: "hol_5", name: "Summer break", date: "2026-08-14", isPaid: true },
];

// ─── Leaderboard ───
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: "usr_3", user: MOCK_USERS[2], totalPoints: 580, weeklyDelta: 62, rank: 1, badges: ["🏆", "🎬", "🔥", "⚡"] },
  { userId: "usr_2", user: MOCK_USERS[1], totalPoints: 420, weeklyDelta: 38, rank: 2, badges: ["🎯", "🔥", "⚡"] },
  { userId: "usr_1", user: MOCK_USERS[0], totalPoints: 310, weeklyDelta: 20, rank: 3, badges: ["🎨", "🔥"] },
  { userId: "usr_4", user: MOCK_USERS[3], totalPoints: 280, weeklyDelta: 18, rank: 4, badges: ["🎨", "⚡"] },
  { userId: "usr_5", user: MOCK_USERS[4], totalPoints: 240, weeklyDelta: 14, rank: 5, badges: ["⚙️", "🔥"] },
  { userId: "usr_7", user: MOCK_USERS[6], totalPoints: 210, weeklyDelta: 10, rank: 6, badges: ["🎬"] },
  { userId: "usr_8", user: MOCK_USERS[7], totalPoints: 185, weeklyDelta: -5, rank: 7, badges: ["⭐"] },
  { userId: "usr_6", user: MOCK_USERS[5], totalPoints: 140, weeklyDelta: 0, rank: 8, badges: ["✍️"] },
];

// ─── Weekly Challenges ───
export const MOCK_CHALLENGES: WeeklyChallenge[] = [
  { id: "ch_1", title: "Post a client win to #wins", points: 15, weekStart: "2026-04-20", weekEnd: "2026-04-24", isActive: true, icon: "📢", completed: true },
  { id: "ch_2", title: "Submit Friday Game entry", points: 20, weekStart: "2026-04-20", weekEnd: "2026-04-24", isActive: true, icon: "🎮", completed: true },
  { id: "ch_3", title: "Leave feedback on a teammate's work", points: 10, weekStart: "2026-04-20", weekEnd: "2026-04-24", isActive: true, icon: "💬", completed: false },
  { id: "ch_4", title: "No-meeting morning this week", points: 15, weekStart: "2026-04-20", weekEnd: "2026-04-24", isActive: true, icon: "🌅", completed: false },
  { id: "ch_5", title: "Share a resource in #learning", points: 10, weekStart: "2026-04-20", weekEnd: "2026-04-24", isActive: true, icon: "📚", completed: false },
];

// ─── Achievements ───
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: "ach_1", name: "Top of the week", description: "Rank #1 for a full week", icon: "🏆", points: 100, unlocked: true },
  { id: "ach_2", name: "On fire", description: "3-week winning streak", icon: "🔥", points: 50, unlocked: true },
  { id: "ach_3", name: "Design head", description: "Submit 10 challenges", icon: "🎨", points: 60, unlocked: true },
  { id: "ach_4", name: "Director's cut", description: "Win 5 Friday Games", icon: "🎬", points: 75, unlocked: true },
  { id: "ach_5", name: "Speed demon", description: "Complete all weekly challenges", icon: "⚡", points: 40, unlocked: false },
  { id: "ach_6", name: "Big brain", description: "Share 10 resources in #learning", icon: "🧠", points: 45, unlocked: false },
  { id: "ach_7", name: "All-star", description: "Top 3 for an entire month", icon: "🌟", points: 150, unlocked: false },
  { id: "ach_8", name: "Team player", description: "Give feedback 20 times", icon: "🤝", points: 50, unlocked: false },
];

// ─── Announcements ───
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_1",
    title: "Q2 Kickoff — Monday 10am",
    body: "Join us for the Q2 kickoff meeting. We'll cover new client onboards, team goals, and some exciting updates to the portal.",
    priority: "HIGH",
    authorId: "usr_1",
    author: MOCK_USERS[0],
    createdAt: "2026-04-18T10:00:00Z",
  },
  {
    id: "ann_2",
    title: "New project management workflow",
    body: "Starting next week, all client projects will use the new Asana template. Jordan will send training invites by EOD Friday.",
    priority: "NORMAL",
    authorId: "usr_5",
    author: MOCK_USERS[4],
    createdAt: "2026-04-16T14:30:00Z",
  },
  {
    id: "ann_3",
    title: "Friday Games: Design Roast 🎨",
    body: "This week's Friday Game is Design Roast — redesign a terrible UI as badly as possible. Submissions close Thursday. Voting Friday 9am.",
    priority: "LOW",
    authorId: "usr_1",
    author: MOCK_USERS[0],
    createdAt: "2026-04-15T09:00:00Z",
  },
];

// ─── Handbook ───
export const MOCK_HANDBOOK: HandbookSection[] = [
  {
    id: "hb_1",
    title: "Welcome to IDC",
    slug: "welcome",
    category: "Getting started",
    icon: "👋",
    sortOrder: 1,
    content: `Welcome to IDC! We're a design agency that partners with brands to build beautiful, functional digital experiences.\n\nThis handbook is your go-to resource for how we work, our values, tools, and policies. If something's missing, ping Jordan in #ops.`,
  },
  {
    id: "hb_2",
    title: "Our Values",
    slug: "values",
    category: "Getting started",
    icon: "💎",
    sortOrder: 2,
    content: `## Our Core Values\n\n1. **Craft over speed** — We take the time to do things right.\n2. **Direct communication** — Say what you mean, kindly.\n3. **Client partnership** — We're an extension of their team.\n4. **Continuous learning** — Share what you learn in #learning.\n5. **Fun matters** — Friday Games exist for a reason.`,
  },
  {
    id: "hb_3",
    title: "Working Hours",
    slug: "working-hours",
    category: "Working here",
    icon: "🕐",
    sortOrder: 3,
    content: `## Standard Hours\n\n- **Core hours**: 10am — 4pm (your timezone)\n- **Full day**: 8 hours\n- **Flexibility**: Start between 8am–10am\n\n## Remote Work\n\n- 2 remote days per week (your choice)\n- Must be in-office Tuesday & Thursday\n- Fully remote weeks need manager approval`,
  },
  {
    id: "hb_4",
    title: "Communication",
    slug: "communication",
    category: "Working here",
    icon: "💬",
    sortOrder: 4,
    content: `## Channels\n\n| Channel | Purpose |\n|---------|--------|\n| #general | Team-wide updates |\n| #wins | Client wins and celebrations |\n| #learning | Resources and articles |\n| #random | Off-topic fun |\n| #ops | Operations and process |\n\n## Response times\n\n- Slack: within 2 hours during core hours\n- Email: within 24 hours\n- Urgent: call or text directly`,
  },
  {
    id: "hb_5",
    title: "Tools We Use",
    slug: "tools",
    category: "Working here",
    icon: "🛠️",
    sortOrder: 5,
    content: `## Design\n- Figma (primary)\n- After Effects\n- Illustrator\n\n## Project Management\n- Asana\n- Notion (internal docs)\n\n## Communication\n- Slack\n- Zoom\n- Google Workspace\n\n## Development\n- Webflow\n- GitHub\n- VS Code`,
  },
  {
    id: "hb_6",
    title: "Time Off & PTO",
    slug: "pto",
    category: "Policies",
    icon: "🏖️",
    sortOrder: 6,
    content: `## PTO Policy\n\n- **Annual PTO**: 20 days\n- **Sick days**: 5 days\n- **Company holidays**: 8 days (see schedule)\n\n## Requesting Time Off\n\n1. Submit via the Schedule page (at least 2 weeks notice)\n2. Your manager will approve/reject within 48 hours\n3. Update your schedule once approved\n\n## Carry-over\n\nUp to 5 unused PTO days carry over to the next year.`,
  },
];
