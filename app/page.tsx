"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const SIDEBAR_PREF_KEY = "abcis-sidebar-collapsed";
const DRAWER_QUERY = "(max-width: 900px)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function useFocusTrap(active: boolean, containerRef: { current: HTMLElement | null }) {
  useEffect(() => {
    const root = containerRef.current;
    if (!active || !root) return;
    const selector = "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [active, containerRef]);
}

function useScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.classList.toggle("scroll-locked", locked);
    return () => document.body.classList.remove("scroll-locked");
  }, [locked]);
}

type Role = "Admin" | "Principal" | "Teacher" | "Student" | "Parent" | "Librarian";
type ModuleKey = "Dashboard" | "Students" | "Attendance" | "Academics" | "Assignments" | "Exams & Results" | "Timetable" | "Finance" | "Library" | "Events" | "Online Classes" | "Messages" | "Reports" | "Users & Roles" | "Audit Trail" | "Profile";

const roles: { role: Role; name: string; email: string; initials: string; subtitle: string }[] = [
  { role: "Admin", name: "Nusrat Jahan", email: "admin@abcis.edu.bd", initials: "NJ", subtitle: "School Administrator" },
  { role: "Principal", name: "Dr. Farhana Rahman", email: "principal@abcis.edu.bd", initials: "FR", subtitle: "Principal" },
  { role: "Teacher", name: "Mahmud Hasan", email: "teacher@abcis.edu.bd", initials: "MH", subtitle: "Mathematics Faculty" },
  { role: "Student", name: "Ariana Islam", email: "student@abcis.edu.bd", initials: "AI", subtitle: "Grade 10 · O Level" },
  { role: "Parent", name: "Imran Islam", email: "parent@abcis.edu.bd", initials: "II", subtitle: "Parent of Ariana Islam" },
  { role: "Librarian", name: "Samira Kabir", email: "library@abcis.edu.bd", initials: "SK", subtitle: "Head Librarian" },
];

const roleModules: Record<Role, ModuleKey[]> = {
  Admin: ["Dashboard", "Students", "Attendance", "Academics", "Exams & Results", "Timetable", "Finance", "Library", "Events", "Messages", "Reports", "Users & Roles", "Audit Trail", "Profile"],
  Principal: ["Dashboard", "Students", "Attendance", "Academics", "Exams & Results", "Timetable", "Finance", "Library", "Events", "Messages", "Reports", "Users & Roles", "Audit Trail", "Profile"],
  Teacher: ["Dashboard", "Students", "Attendance", "Academics", "Assignments", "Exams & Results", "Timetable", "Online Classes", "Messages", "Reports", "Profile"],
  Student: ["Dashboard", "Attendance", "Academics", "Assignments", "Exams & Results", "Timetable", "Finance", "Library", "Events", "Online Classes", "Messages", "Profile"],
  Parent: ["Dashboard", "Attendance", "Academics", "Assignments", "Exams & Results", "Timetable", "Finance", "Library", "Events", "Messages", "Profile"],
  Librarian: ["Dashboard", "Students", "Library", "Events", "Messages", "Reports", "Profile"],
};

const iconPaths: Record<string, string[]> = {
  Dashboard: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"], Students: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"], Attendance: ["M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"], Academics: ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM8 7h8M8 11h6"], Assignments: ["M9 5h6M9 9h6M9 13h4M5 3h14v18H5z"], "Exams & Results": ["M12 2l3 6 6 .9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 8.9 9 8z"], Timetable: ["M3 5h18v16H3zM16 3v4M8 3v4M3 10h18"], Finance: ["M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"], Library: ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM9 3v14"], Events: ["M3 5h18v16H3zM16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"], "Online Classes": ["M15 10l5-3v10l-5-3v4H3V6h12z"], Messages: ["M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"], Reports: ["M4 19V9M10 19V5M16 19v-7M22 19V2"], "Users & Roles": ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M19 8v6M16 11h6"], "Audit Trail": ["M9 11l3 3L22 4M3 5v16h16v-7"], Profile: ["M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"], search: ["M21 21l-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"], bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"], ai: ["M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"], arrow: ["M5 12h14M13 6l6 6-6 6"], chevron: ["M6 9l6 6 6-6"], "chevron-left": ["M15 18l-6-6 6-6"], "chevron-right": ["M9 18l6-6-6-6"], menu: ["M4 7h16M4 12h16M4 17h16"], close: ["M6 6l12 12M18 6L6 18"], plus: ["M12 5v14M5 12h14"], download: ["M12 3v12M7 10l5 5 5-5M5 21h14"], logout: ["M10 17l5-5-5-5M15 12H3M15 3h6v18h-6"], more: ["M5 12h.01M12 12h.01M19 12h.01"], panel: ["M4 5h16v14H4zM10 5v14"], globe: ["M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z"], mic: ["M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM19 11v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8"], smile: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"], sparkle: ["M12 3l1.4 5.2L18 9.6l-4.6 1.4L12 16l-1.4-5-4.6-1.4 4.6-1.4zM18.5 14.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"], play: ["M8 5v14l11-7z"], video: ["M15 10l6-3v10l-6-3v3H3V7h12z"], edit: ["M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"], clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2"], check: ["M5 12l5 5L20 7"], star: ["M12 2l3 6 6 .9-4.5 4.4 1.1 6.2L12 16.8 6.4 19.5 7.5 13.3 3 8.9 9 8z"], bolt: ["M13 2L4 14h7l-1 8 9-12h-7l1-8z"],
};
function Icon({ name, size = 20 }: { name: string; size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{(iconPaths[name] ?? iconPaths.Dashboard).map((d, i) => <path key={i} d={d} />)}</svg>; }
function MeetLogo({ size = 18 }: { size?: number }) {
  return <img src="/meet-logo.svg" alt="" width={Math.round(size * (87.5 / 72))} height={size} className="meet-logo" />;
}

const campusData = { "Narayanganj Campus": { students: "1,284", attendance: "94.8%", staff: "86", fee: "৳ 42.8L" }, "Uttara Campus": { students: "612", attendance: "95.3%", staff: "43", fee: "৳ 21.4L" } };
const students = [
  { id: "ABC-25-1042", name: "Ariana Islam", grade: "Grade 10 · A", guardian: "Imran Islam", attendance: "96%", status: "Active" }, { id: "ABC-25-1108", name: "Rayan Chowdhury", grade: "Grade 9 · B", guardian: "Sadia Chowdhury", attendance: "93%", status: "Active" }, { id: "ABC-25-0921", name: "Nafisa Ahmed", grade: "Grade 11 · A", guardian: "Fahim Ahmed", attendance: "98%", status: "Active" }, { id: "ABC-25-1184", name: "Tahmid Rahman", grade: "Grade 8 · C", guardian: "Afsana Rahman", attendance: "87%", status: "Review" }, { id: "ABC-25-0832", name: "Zara Khan", grade: "Grade 12 · A", guardian: "Saiful Khan", attendance: "95%", status: "Active" },
];
const notifications = [{ title: "Monthly attendance report is ready", time: "10 minutes ago", color: "blue" }, { title: "12 fee payments received today", time: "42 minutes ago", color: "green" }, { title: "Library stock audit needs review", time: "2 hours ago", color: "orange" }];
const aiResponses: Record<string, string> = {
  fee: "In the last 6 months, fee collection reached ৳3.74 crore—94.2% of billed fees. Collection improved 3.8% compared with the previous six-month period. Grade 9 has the largest outstanding balance at ৳6.4 lakh.", attendance: "Average attendance over the last 6 months was 94.6%. September was highest at 96.1%; November was lowest at 92.8%. Grade 8-C has remained below the 90% review threshold for three consecutive weeks.", result: "The most recent term shows a 5.4% improvement in overall pass rate. Mathematics improved most (+8.2%), while English Language needs attention in Grade 7. Twelve students qualify for targeted academic support.", library: "During the last 6 months, 4,218 books were issued and 3,986 returned. 41 items are overdue today. Science and fiction titles account for 58% of all borrowing, and February was the busiest month.", default: "I found matching records across attendance, academics, finance, and activity history. For this prototype, try asking about six-month fee collection, attendance trends, exam performance, or overdue library books.",
};

const avatarPhotos: Record<string, string> = {
  "Nusrat Jahan": "/avatars/nusrat-jahan.jpg",
  "Dr. Farhana Rahman": "/avatars/farhana-rahman.jpg",
  "Farhana Rahman": "/avatars/farhana-rahman.jpg",
  "Mahmud Hasan": "/avatars/mahmud-hasan.jpg",
  "Ariana Islam": "/avatars/ariana-islam.jpg",
  "Imran Islam": "/avatars/imran-islam.jpg",
  "Samira Kabir": "/avatars/samira-kabir.jpg",
  "Rayan Chowdhury": "/avatars/rayan-chowdhury.jpg",
  "Nafisa Ahmed": "/avatars/nafisa-ahmed.jpg",
  "Tahmid Rahman": "/avatars/tahmid-rahman.jpg",
  "Zara Khan": "/avatars/zara-khan.jpg",
  "Adnan Karim": "/avatars/adnan-karim.jpg",
  "Mehzabin Noor": "/avatars/mehzabin-noor.jpg",
  "Samiul Haque": "/avatars/samiul-haque.jpg",
  "Sarah Ahmed": "/avatars/sarah-ahmed.jpg",
  "Rashed Khan": "/avatars/rashed-khan.jpg",
  "Nadia Karim": "/avatars/nadia-karim.jpg",
  "Ariana Islam · Parent": "/avatars/imran-islam.jpg",
};
function getAvatar(name: string) { return avatarPhotos[name] ?? ""; }
function Avatar({ name, initials = "", className = "" }: { name?: string; initials?: string; className?: string }) {
  const src = (name && getAvatar(name)) || "";
  const fallback = initials || (name ? name.split(" ").map((part) => part[0]).join("").slice(0, 2) : "");
  return <span className={`avatar ${className}`}>{src ? <img src={src} alt="" /> : fallback}</span>;
}

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("admin@abcis.edu.bd"); const [password, setPassword] = useState("demo1234"); const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (!window.localStorage.getItem("abcis-intro-seen")) setShowIntro(true);
  }, []);
  function dismissIntro() {
    window.localStorage.setItem("abcis-intro-seen", "1");
    setShowIntro(false);
  }
  function submit(e: FormEvent) { e.preventDefault(); const match = roles.find((r) => r.email === email); onLogin(match?.role ?? "Admin"); }
  return <main className="login-page">
    <section className="login-story"><div className="story-orb orb-one" /><div className="story-orb orb-two" /><img src="/abcis-logo.png" alt="ABC International School" className="login-logo" /><div className="login-copy"><span className="eyebrow light">ABCIS SCHOOL OS · SINCE 1997</span><h1>One school.<br /><em>Everything connected.</em></h1><p>A single, intelligent workspace for learning, administration, finance, examinations, communication, and campus life.</p><div className="story-points"><div><strong>1,896</strong><span>Student records</span></div><div><strong>2</strong><span>Connected campuses</span></div><div><strong>6</strong><span>Purpose-built portals</span></div></div></div><p className="login-foot">Exploration Through Education <span>•</span> We care for your children as you do</p></section>
    <section className="login-panel"><div className="login-box"><div className="mobile-brand"><img src="/abcis-logo.png" alt="ABC International School" /><span className="eyebrow">ABCIS SCHOOL OS · SINCE 1997</span><p>A connected workspace for learning, administration and campus life.</p></div><span className="eyebrow login-welcome">WELCOME BACK</span><h2>Sign in to SchoolOS</h2><p>Access your ABC International School workspace.</p><form onSubmit={submit}><label>Email address<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label><label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label><div className="form-row"><label className="check"><input type="checkbox" defaultChecked /> Remember me</label><button type="button" className="text-button">Forgot password?</button></div><button className="primary-button login-button" type="submit">Sign in <Icon name="arrow" size={17} /></button></form><div className="quick-head"><span>QUICK DEMO ACCESS</span><span>Select a role</span></div><div className="quick-grid">{roles.map((item) => <button key={item.role} onClick={() => onLogin(item.role)} className="quick-role"><Avatar name={item.name} /><span><strong>{item.role}</strong><small>{item.name}</small></span><Icon name="arrow" size={14} /></button>)}</div><p className="security-note"><span>●</span> Secure demo environment · No real student data</p></div></section>
    {showIntro && <div className="intro-overlay"><div className="intro-card"><button className="icon-button intro-close" aria-label="Close introduction" onClick={dismissIntro}><Icon name="close" /></button><div className="intro-mark"><Icon name="ai" size={24} /></div><span className="eyebrow">WELCOME TO THE PROTOTYPE</span><h3>Your school day, simplified.</h3><p>Choose any demo role to see a tailored portal. Every major function from student registration to exams, fees, attendance, library operations and reports is ready to explore.</p><div className="intro-features"><span>Role-based workspaces</span><span>Interactive workflows</span><span>Historical AI insights</span></div><button className="primary-button" onClick={dismissIntro}>Explore SchoolOS <Icon name="arrow" size={17} /></button></div></div>}
  </main>;
}

function App({ initialRole, onLogout }: { initialRole: Role; onLogout: () => void }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [module, setModule] = useState<ModuleKey>("Dashboard");
  const [campus, setCampus] = useState<keyof typeof campusData>("Narayanganj Campus");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toast, setToast] = useState("");
  const user = roles.find((r) => r.role === role)!;
  const isDrawer = useMediaQuery(DRAWER_QUERY);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerWasOpen = useRef(false);

  useFocusTrap(isDrawer && drawerOpen, sidebarRef);
  useScrollLock(drawerOpen || aiOpen || searchOpen);

  useEffect(() => { setModule("Dashboard"); }, [role]);
  useEffect(() => { window.localStorage.setItem("abcis-demo-role", role); }, [role]);
  useEffect(() => {
    if (window.localStorage.getItem(SIDEBAR_PREF_KEY) === "1") setDesktopCollapsed(true);
  }, []);
  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_PREF_KEY, desktopCollapsed ? "1" : "0");
  }, [desktopCollapsed]);
  useEffect(() => { if (!isDrawer) setDrawerOpen(false); }, [isDrawer]);
  useEffect(() => {
    if (drawerOpen && !drawerWasOpen.current) closeButtonRef.current?.focus();
    else if (!drawerOpen && drawerWasOpen.current && isDrawer) menuButtonRef.current?.focus();
    drawerWasOpen.current = drawerOpen;
  }, [drawerOpen, isDrawer]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setNoticeOpen(false); setMoreOpen(false); setDrawerOpen(false); setAiOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!moreOpen && !noticeOpen) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".more-wrap, .notice-wrap")) { setMoreOpen(false); setNoticeOpen(false); }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [moreOpen, noticeOpen]);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2800); }
  function go(next: ModuleKey) { setModule(next); setDrawerOpen(false); setMoreOpen(false); }
  function CampusSelect({ id }: { id?: string }) {
    return (
      <select id={id} className="campus-select" value={campus} onChange={(e) => setCampus(e.target.value as keyof typeof campusData)} aria-label="Select campus">
        <option>Narayanganj Campus</option>
        <option>Uttara Campus</option>
      </select>
    );
  }
  function RoleSelect({ id }: { id?: string }) {
    return (
      <select id={id} value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Switch demo role">
        {roles.map((item) => <option key={item.role}>{item.role}</option>)}
      </select>
    );
  }

  return (
    <div className={`app-shell${desktopCollapsed ? " sidebar-collapsed" : ""}${drawerOpen ? " drawer-open" : ""}`}>
      {drawerOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />}
      <aside
        ref={sidebarRef}
        id="app-sidebar"
        className={`sidebar${drawerOpen ? " open" : ""}${desktopCollapsed ? " collapsed" : ""}`}
        aria-label="Workspace navigation"
        aria-hidden={isDrawer && !drawerOpen}
        inert={isDrawer && !drawerOpen ? true : undefined}
      >
        <div className="side-brand">
          <img src="/abcis-logo.png" alt="ABCIS" />
          <span className="brand-copy"><strong>SchoolOS</strong><small>Management Suite</small></span>
          <button ref={closeButtonRef} className="icon-button mobile-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation"><Icon name="close" /></button>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!desktopCollapsed}
            aria-controls="app-sidebar"
            onClick={() => setDesktopCollapsed((value) => !value)}
          >
            <Icon name={desktopCollapsed ? "chevron-right" : "chevron-left"} size={16} />
          </button>
        </div>
        <nav>
          <p className="nav-section-label">WORKSPACE</p>
          {roleModules[role].map((item) => (
            <button key={item} type="button" onClick={() => go(item)} className={module === item ? "active" : ""} aria-current={module === item ? "page" : undefined} data-tooltip={item} title={desktopCollapsed && !isDrawer ? item : undefined}>
              <Icon name={item} size={20} />
              <span className="nav-label">{item}</span>
              {item === "Messages" && <b className="nav-count" aria-label="3 unread messages">3</b>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button type="button" className="ai-side" onClick={() => setAiOpen(true)} data-tooltip="Ask ABCIS Assist" aria-label="Ask ABCIS Assist">
            <span className="ai-mini"><Icon name="ai" size={18} /></span>
            <span className="ai-copy"><strong>Ask ABCIS Assist</strong><small>Search school history</small></span>
          </button>
          <div className="side-user">
            <Avatar name={user.name} />
            <span className="user-copy"><strong>{user.name}</strong><small>{user.subtitle}</small></span>
            <button type="button" aria-label="Sign out" data-tooltip="Sign out" onClick={onLogout}><Icon name="logout" size={18} /></button>
          </div>
        </div>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <button ref={menuButtonRef} className="icon-button menu-button" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation" aria-expanded={drawerOpen} aria-controls="app-sidebar"><Icon name="menu" /></button>
          <div className="top-title"><span>ABCIS</span><strong>{module}</strong></div>
          <div className="breadcrumb"><span>ABCIS</span><b>/</b><strong>{module}</strong></div>
          <button className="search-trigger" type="button" onClick={() => setSearchOpen(true)} aria-label="Search SchoolOS">
            <Icon name="search" size={18} />
            <span>Search students, reports, records...</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="top-actions">
            <CampusSelect />
            <div className="notice-wrap">
              <button className="icon-button notice-button" type="button" onClick={() => { setNoticeOpen((value) => !value); setMoreOpen(false); }} aria-label="Notifications" aria-expanded={noticeOpen} aria-controls="notice-popover"><Icon name="bell" /><i /></button>
              {noticeOpen && <Notifications onClose={() => setNoticeOpen(false)} />}
            </div>
            <button className="ai-button" type="button" onClick={() => setAiOpen(true)} aria-label="Ask ABCIS Assist"><Icon name="ai" size={17} /><span>Ask ABCIS Assist</span></button>
            <div className="role-switch"><Avatar name={user.name} /><RoleSelect /></div>
            <div className="more-wrap">
              <button className="icon-button more-button" type="button" aria-label="More actions" aria-expanded={moreOpen} aria-controls="top-more-panel" onClick={() => { setMoreOpen((value) => !value); setNoticeOpen(false); }}><Icon name="more" /></button>
              {moreOpen && (
                <div id="top-more-panel" className="more-panel" role="menu">
                  <label htmlFor="more-campus">Campus<CampusSelect id="more-campus" /></label>
                  <label htmlFor="more-role">Demo role<RoleSelect id="more-role" /></label>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="workspace">{module === "Dashboard" ? <Dashboard role={role} campus={campus} go={go} notify={notify} onAsk={() => setAiOpen(true)} /> : <ModulePage module={module} role={role} notify={notify} />}</main>
      </section>
      {aiOpen && <AICompanion role={role} onClose={() => setAiOpen(false)} />}
      {searchOpen && <GlobalSearch role={role} go={go} onClose={() => setSearchOpen(false)} />}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}

function Notifications({ onClose }: { onClose: () => void }) { return <div id="notice-popover" className="popover notifications" role="dialog" aria-label="Notifications"><div className="popover-head"><strong>Notifications</strong><button onClick={onClose}>Mark all read</button></div>{notifications.map((n) => <div className="notification" key={n.title}><i className={n.color} /><span><strong>{n.title}</strong><small>{n.time}</small></span></div>)}<button className="popover-link">View notification centre <Icon name="arrow" size={14} /></button></div>; }

function Dashboard({ role, campus, go, notify, onAsk }: { role: Role; campus: keyof typeof campusData; go: (m: ModuleKey) => void; notify: (s: string) => void; onAsk: () => void }) {
  const [activeSlot, setActiveSlot] = useState("10:00 am");
  const data = campusData[campus];
  const slots = ["08:00 am", "10:00 am", "12:00 pm", "02:00 pm", "04:00 pm"];
  const classes = [
    { title: "English Language", time: "08:15 am", room: "Room 302", tone: "pink", icon: "Academics", lane: "a", left: "3%", slot: "08:00 am" },
    { title: "Mathematics", time: "10:30 am", room: "Room 204", tone: "blue", icon: "Exams & Results", lane: "b", left: "23%", slot: "10:00 am" },
    { title: "Science Lab", time: "01:45 pm", room: "Lab 02", tone: "mint", icon: "Attendance", lane: "a", left: "58%", slot: "02:00 pm" },
  ];
  const content = {
    Admin: { title: "Good morning, Nusrat.", sub: "Here is today’s operational picture across ABCIS.", label: "ADMINISTRATION OVERVIEW" }, Principal: { title: "Good morning, Dr. Farhana.", sub: "Your school is running smoothly. Three items need your attention.", label: "LEADERSHIP OVERVIEW" }, Teacher: { title: "Good morning, Mahmud.", sub: "You have 4 classes and 2 submissions to review today.", label: "TEACHING OVERVIEW" }, Student: { title: "Welcome back, Ariana!", sub: "Keep your momentum going—your attendance is excellent this term.", label: "MY LEARNING" }, Parent: { title: "Good morning, Imran.", sub: "Ariana is on track. Here is her latest academic and campus update.", label: "CHILD OVERVIEW" }, Librarian: { title: "Good morning, Samira.", sub: "18 books are due today and 3 reservations are ready to collect.", label: "LIBRARY OVERVIEW" },
  }[role];
  const kpis = role === "Librarian" ? [["8,642", "Books in catalogue", "+126 this term", "blue"], ["1,124", "Active members", "82% students", "purple"], ["41", "Overdue books", "7 high priority", "orange"], ["218", "Issues this week", "+12% vs last week", "green"]] : role === "Student" || role === "Parent" ? [["96%", "Attendance", "+2.4% this term", "green"], ["A−", "Overall grade", "Top 12% of class", "purple"], ["04", "Active assignments", "2 due this week", "orange"], ["৳ 0", "Outstanding fees", "Paid through June", "blue"]] : role === "Teacher" ? [["124", "My students", "4 sections", "blue"], ["94.7%", "Class attendance", "+1.8% this month", "green"], ["18", "Pending reviews", "6 due today", "orange"], ["04", "Classes today", "Next at 10:30", "purple"]] : [[data.students, "Active students", "+42 this term", "blue"], [data.attendance, "Attendance today", "+1.2% vs last week", "green"], [data.fee, "Fees this month", "94.2% collected", "purple"], [data.staff, "Faculty & staff", "97% present", "orange"]];
  const quick = role === "Admin" || role === "Principal" ? [["Register student", "Students"], ["Record payment", "Finance"], ["Publish notice", "Messages"], ["Generate report", "Reports"]] : role === "Teacher" ? [["Take attendance", "Attendance"], ["Create assignment", "Assignments"], ["Upload notes", "Academics"], ["Create exam", "Exams & Results"]] : role === "Librarian" ? [["Issue book", "Library"], ["Return book", "Library"], ["Add title", "Library"], ["Plan event", "Events"]] : [["View timetable", "Timetable"], ["Check results", "Exams & Results"], ["Open library", "Library"], ["Send message", "Messages"]];
  const insightCopy = {
    Admin: { highlight: "Grade 8-C attendance is 89.4% this week, below the 90% review threshold.", prompts: ["Which classes had low attendance?", "Show fee collection for 6 months"] },
    Principal: { highlight: "Fee collection is 94.2% this month. Grade 9 still holds ৳6.4L outstanding.", prompts: ["Summarise exam performance", "Which classes had low attendance?", "What needs my decision today?"] },
    Teacher: { highlight: "6 assignment reviews are due today, and Grade 10-A Mathematics starts at 10:30.", prompts: ["Explain today’s Physics lesson in simple terms", "Which students need extra support?"] },
    Student: { highlight: "You have 2 assignments due this week. Physics is next after Mathematics.", prompts: ["Explain today’s Physics lesson in simple terms", "What homework is due this week?"] },
    Parent: { highlight: "Ariana’s attendance is 96% this term. Two assignments are due this week.", prompts: ["How is Ariana performing this term?", "Are any fees outstanding?"] },
    Librarian: { highlight: "41 books are overdue today, and 3 reserved titles are ready for pickup.", prompts: ["How many library books are overdue?", "Which titles circulated most this month?"] },
  }[role];
  const pulse = campus === "Narayanganj Campus"
    ? { staff: "83 / 86", gaps: "02", visitors: "03", assembly: "11:15 am", present: "94.8%", cover: [{ name: "Sarah Ahmed", detail: "Grade 8 English · absent", extra: "Covered by Nadia" }, { name: "Rashed Khan", detail: "Physics · arriving late", extra: "In by 10:15" }] }
    : { staff: "42 / 43", gaps: "01", visitors: "01", assembly: "12:40 pm", present: "95.3%", cover: [{ name: "Nadia Karim", detail: "Grade 6 · on leave", extra: "Covered by Adnan" }] };
  const [prompt, setPrompt] = useState(insightCopy.prompts[0]);
  useEffect(() => { setPrompt(insightCopy.prompts[0]); }, [role]);
  return <div className="dashboard">
    <section className="welcome-row"><div><span className="eyebrow">{content.label}</span><h1>{content.title}</h1><p>{content.sub}</p></div><div className="date-chip"><span>THURSDAY</span><strong>20</strong><small>August 2026</small></div></section>
    <section className="kpi-grid">{kpis.map(([value, label, detail, color]) => <article className="kpi-card" key={label}><div className={`kpi-icon ${color}`}><Icon name={label.includes("Books") ? "Library" : label.includes("Attendance") ? "Attendance" : label.includes("Fees") ? "Finance" : "Students"} /></div><span>{label}</span><strong>{value}</strong><small className={color === "orange" ? "warn" : ""}>{detail}</small><div className={`spark ${color}`}><i /><i /><i /><i /><i /><i /></div></article>)}</section>
    <div className="dashboard-grid">
      {role === "Principal" ? (
        <section className="panel schedule-panel pulse-panel">
          <div className="panel-head schedule-toolbar">
            <h2>Today’s school pulse</h2>
            <div className="schedule-toolbar-actions">
              <button type="button" className="today-chip" aria-label="Today’s campus pulse">Today <Icon name="chevron" size={14} /></button>
              <button type="button" className="icon-button" aria-label="Open timetable" onClick={() => go("Timetable")}><Icon name="plus" size={16} /></button>
            </div>
          </div>
          <div className="pulse-stats">
            {[
              { label: "Staff present", value: pulse.staff, tone: "4", icon: "Users & Roles" },
              { label: "Coverage gaps", value: pulse.gaps, tone: "3", icon: "Attendance" },
              { label: "Visitors today", value: pulse.visitors, tone: "1", icon: "Students" },
              { label: "Next assembly", value: pulse.assembly, tone: "2", icon: "Events" },
            ].map((item) => (
              <article key={item.label} className="pulse-stat">
                <span className={`course-icon tone-${item.tone}`}><Icon name={item.icon} size={16} /></span>
                <span><small>{item.label}</small><b>{item.value}</b></span>
              </article>
            ))}
          </div>
          <div className="pulse-cover">
            <div className="pulse-cover-copy">
              <b>Staff coverage</b>
              <small>{pulse.cover.length} {pulse.cover.length === 1 ? "issue" : "issues"} on {campus.replace(" Campus", "")} this morning</small>
            </div>
            <div className="pulse-cover-list">
              {pulse.cover.map((item) => (
                <div key={item.name}>
                  <Avatar name={item.name} />
                  <span><b>{item.name}</b><small>{item.detail}</small></span>
                  <em>{item.extra}</em>
                </div>
              ))}
            </div>
          </div>
          <div className="pulse-events">
            {[
              { title: "Board briefing", time: "09:00 am", place: "Conference room", tone: "blue", icon: "Reports" },
              { title: "Grade 9 fee review", time: "11:30 am", place: "Accounts office", tone: "pink", icon: "Finance" },
              { title: "Fire drill", time: "02:00 pm", place: campus.replace(" Campus", ""), tone: "mint", icon: "Events" },
            ].map((item) => (
              <article key={item.title} className={`pulse-event ${item.tone}`}>
                <span className="class-icon"><Icon name={item.icon} size={16} /></span>
                <span><b>{item.title}</b><small>{item.time} · {item.place}</small></span>
              </article>
            ))}
          </div>
          <div className="schedule-foot"><span><i className="present" /> {pulse.present} present today</span><span>Next bell in <b>28 minutes</b></span></div>
        </section>
      ) : (
        <section className="panel schedule-panel">
          <div className="panel-head schedule-toolbar">
            <h2>{role === "Student" || role === "Parent" ? "My Schedule" : "Today at ABCIS"}</h2>
            <div className="schedule-toolbar-actions">
              <button type="button" className="today-chip" aria-label="Today’s schedule">Today <Icon name="chevron" size={14} /></button>
              <button type="button" className="icon-button" aria-label="Open full timetable" onClick={() => go("Timetable")}><Icon name="plus" size={16} /></button>
            </div>
          </div>
          <div className="schedule-scroll">
            <div className="schedule-times" role="tablist" aria-label="Schedule times">
              {slots.map((slot) => (
                <button key={slot} type="button" role="tab" aria-selected={activeSlot === slot} className={`time-chip${activeSlot === slot ? " active" : ""}`} onClick={() => setActiveSlot(slot)}>{slot}</button>
              ))}
            </div>
            <div className="schedule-board">
              <div className="schedule-rails">{slots.map((slot) => <span key={slot} className={activeSlot === slot ? "active" : ""} />)}</div>
              {classes.map((item) => (
                <article key={item.title} className={`class-card ${item.tone} lane-${item.lane}${activeSlot === item.slot ? " current" : ""}`} style={{ left: item.left }}>
                  <i className="class-pin" aria-hidden="true" />
                  <span className="class-icon"><Icon name={item.icon} size={16} /></span>
                  <span><b>{item.title}</b><small>{item.time} · {item.room}</small></span>
                </article>
              ))}
            </div>
          </div>
          <div className="schedule-foot"><span><i className="present" /> 94.8% present today</span><span>Next bell in <b>28 minutes</b></span></div>
        </section>
      )}
      {role === "Student" ? (
        <section className="panel quick-panel upcoming-panel">
          <PanelHead title="Upcoming Classes" action="View All" onClick={() => go("Online Classes")} />
          <div className="upcoming-list">
            <article className="upcoming-card live">
              <div className="upcoming-main">
                <span className="upcoming-icon live"><Icon name="bell" size={16} /></span>
                <div>
                  <b>Artificial Intelligence</b>
                  <small><Icon name="clock" size={13} /> 04:00 – 5:00 pm</small>
                </div>
              </div>
              <div className="avatar-stack">
                {["Nafisa Ahmed", "Rayan Chowdhury", "Zara Khan"].map((name) => <Avatar key={name} name={name} />)}
                <em>+12</em>
              </div>
              <button type="button" className="connect-class" onClick={() => go("Online Classes")}><MeetLogo size={18} /> Connect to Class</button>
            </article>
            {[
              { title: "English Literature", time: "08:15 – 9:15 am", people: ["Tahmid Rahman", "Mehzabin Noor", "Adnan Karim"], extra: "+19" },
              { title: "Physics", time: "10:30 – 11:30 am", people: ["Samiul Haque", "Nafisa Ahmed", "Rayan Chowdhury"], extra: "+5" },
            ].map((item) => (
              <article key={item.title} className="upcoming-card">
                <span className="upcoming-icon"><Icon name="bell" size={16} /></span>
                <div>
                  <b>{item.title}</b>
                  <small><Icon name="clock" size={13} /> {item.time}</small>
                </div>
                <div className="avatar-stack">
                  {item.people.map((name) => <Avatar key={name} name={name} />)}
                  <em>{item.extra}</em>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : role === "Principal" ? (
        <section className="panel quick-panel decision-panel">
          <PanelHead title="Awaiting your decision" action="View all" onClick={() => go("Messages")} />
          <div className="upcoming-list">
            <article className="upcoming-card live">
              <div className="upcoming-main">
                <span className="upcoming-icon live"><Icon name="Users & Roles" size={16} /></span>
                <div>
                  <b>Leave request</b>
                  <small><Icon name="clock" size={13} /> Mahmud Hasan · 21 Aug</small>
                </div>
              </div>
              <div className="avatar-stack">
                {["Mahmud Hasan", "Nusrat Jahan"].map((name) => <Avatar key={name} name={name} />)}
                <em>Maths cover set</em>
              </div>
              <button type="button" className="connect-class decide-approve" onClick={() => notify("Leave approved for Mahmud Hasan")}>Approve leave</button>
            </article>
            {[
              { title: "Fee concession", detail: "Ariana Islam · ৳12,400", extra: "Review", go: "Finance" as ModuleKey },
              { title: "Exam notice", detail: "Term II timetable ready", extra: "Publish", go: "Messages" as ModuleKey },
            ].map((item) => (
              <article key={item.title} className="upcoming-card">
                <span className="upcoming-icon"><Icon name="bell" size={16} /></span>
                <div>
                  <b>{item.title}</b>
                  <small><Icon name="clock" size={13} /> {item.detail}</small>
                </div>
                <button type="button" className="decision-chip" onClick={() => go(item.go)}>{item.extra}</button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel quick-panel"><PanelHead title="Quick actions" /><div className="quick-actions">{quick.map(([label, target], i) => <button key={label} onClick={() => go(target as ModuleKey)}><span className={`quick-action-icon tone-${i + 1}`}><Icon name={target} /></span><b>{label}</b><Icon name="arrow" size={15} /></button>)}</div></section>
      )}
      <section className="panel insight-panel ai-insights">
        <div className="ai-insights-head">
          <h2>AI Insights</h2>
          <span className="ai-powered">Powered By Ascend</span>
        </div>
        <button type="button" className="ai-highlight" onClick={() => { setPrompt(insightCopy.prompts[0]); onAsk(); }}>
          <span className="ai-highlight-icon"><Icon name="sparkle" size={16} /></span>
          <span>
            <b>Today’s reading</b>
            <small>{insightCopy.highlight}</small>
          </span>
        </button>
        <div className="ai-suggestions">
          {insightCopy.prompts.map((item) => (
            <button type="button" key={item} onClick={() => { setPrompt(item); onAsk(); }}>{item}</button>
          ))}
        </div>
        <form className="ai-prompt" onSubmit={(e) => { e.preventDefault(); onAsk(); }}>
          <input name="insight" value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Ask AI Insights" />
          <div className="ai-prompt-tools">
            <div className="ai-prompt-left">
              <button type="button" className="ai-plus" aria-label="Add context"><Icon name="plus" size={13} /></button>
              <button type="button" className="ai-search-chip" onClick={onAsk}><Icon name="globe" size={14} /> Search</button>
            </div>
            <div className="ai-prompt-right">
              <button type="button" aria-label="Ask ABCIS Assist" onClick={onAsk}><Icon name="sparkle" size={16} /></button>
              <button type="button" aria-label="Voice input" onClick={onAsk}><Icon name="mic" size={16} /></button>
            </div>
          </div>
        </form>
      </section>
      {role === "Student" ? (
        <section className="panel attention-panel courses-panel">
          <PanelHead title="My Courses" action="View All" onClick={() => go("Academics")} />
          <div className="course-list">
            {[
              { title: "Computer Science", topic: "Data Structures & Algorithms", time: "1:32:55", tone: "1", icon: "Online Classes" },
              { title: "Further Mathematics", topic: "Algebra & Functions", time: "0:48:20", tone: "2", icon: "Exams & Results" },
              { title: "English Language", topic: "Essay: Climate action", time: "1:12:10", tone: "3", icon: "Academics" },
              { title: "Physics", topic: "Waves & Optics", time: "0:54:40", tone: "4", icon: "bolt" },
              { title: "Chemistry", topic: "Organic compounds", time: "1:05:15", tone: "5", icon: "Library" },
            ].map((course) => (
              <button type="button" key={course.title} className="course-item" onClick={() => go("Academics")}>
                <span className={`course-icon tone-${course.tone}`}><Icon name={course.icon} size={18} /></span>
                <span><b>{course.title}</b><small>{course.topic}</small></span>
                <time>{course.time}</time>
                <i className="play-button" aria-hidden="true"><Icon name="play" size={12} /></i>
              </button>
            ))}
          </div>
        </section>
      ) : role === "Principal" ? (
        <section className="panel attention-panel health-panel">
          <PanelHead title="Academic health" action="View all" onClick={() => go("Reports")} />
          <div className="health-list">
            {[
              { title: "Grade 8-C", topic: "Attendance below 90% threshold", value: "89.4%", bar: 89, tone: "3", icon: "Attendance", status: "Below", go: "Attendance" as ModuleKey },
              { title: "Grade 9", topic: "Outstanding fees this month", value: "৳6.4L", bar: 72, tone: "5", icon: "Finance", status: "Watch", go: "Finance" as ModuleKey },
              { title: "Grade 10", topic: "Term average holding at A−", value: "A−", bar: 91, tone: "4", icon: "Exams & Results", status: "On track", go: "Exams & Results" as ModuleKey },
              { title: "Grade 11", topic: "Exam readiness this term", value: "92%", bar: 92, tone: "1", icon: "Academics", status: "Strong", go: "Academics" as ModuleKey },
            ].map((item) => (
              <button type="button" key={item.title} className="health-item" onClick={() => go(item.go)}>
                <span className={`course-icon tone-${item.tone}`}><Icon name={item.icon} size={18} /></span>
                <span>
                  <b>{item.title}</b>
                  <small>{item.topic}</small>
                  <i className="health-bar"><i style={{ width: `${item.bar}%` }} /></i>
                </span>
                <em className={`health-chip tone-${item.tone}`}>{item.status}</em>
                <strong>{item.value}</strong>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel attention-panel"><PanelHead title="Needs attention" action="View all" /><div className="attention-list"><button onClick={() => go("Finance")}><i className="orange" /><span><b>18 fee accounts overdue</b><small>৳ 3.2L outstanding this month</small></span><em>Review</em></button><button onClick={() => go("Attendance")}><i className="red" /><span><b>Grade 8-C below threshold</b><small>89.4% attendance this week</small></span><em>Review</em></button><button onClick={() => go("Library")}><i className="purple" /><span><b>Library stock audit</b><small>Due Friday, 21 August</small></span><em>Open</em></button></div></section>
      )}
      {role === "Student" ? (
        <section className="panel activity-panel student-profile-panel">
          <div className="panel-head">
            <h2>Profile</h2>
            <button type="button" className="profile-edit" aria-label="Edit profile" onClick={() => go("Profile")}><Icon name="edit" size={15} /></button>
          </div>
          <div className="student-profile">
            <div className="student-profile-top">
              <span className="avatar-ring"><Avatar name="Ariana Islam" className="student-profile-avatar" /></span>
              <div>
                <b>Ariana Islam</b>
                <small>ABC International School</small>
              </div>
              <span className="rank-badge"><Icon name="star" size={12} /> 3rd Ranking</span>
            </div>
            <div className="streak-card">
              <strong><em>6</em> Days Learning Streak</strong>
              <div className="streak-days">
                {[["Su", "done"], ["Mo", "done"], ["Tu", "done"], ["We", "done"], ["Th", "today"], ["Fr", "next"], ["Sa", "next"]].map(([day, state]) => (
                  <span key={day} className={state}>
                    <b>{day}</b>
                    {state === "done" ? <i className="check"><Icon name="check" size={11} /></i> : <i />}
                  </span>
                ))}
              </div>
            </div>
            <div className="achievement-list">
              <div className="achievement-item">
                <span className="achievement-icon orange"><Icon name="bolt" size={15} /></span>
                <span><b>Quick Learner</b><small>Completed 5 lessons</small></span>
                <em>+100 XP</em>
              </div>
              <div className="achievement-item">
                <span className="achievement-icon purple"><Icon name="Timetable" size={15} /></span>
                <span><b>Consistent</b><small>7 day study streak</small></span>
                <em>+200 XP</em>
              </div>
            </div>
          </div>
        </section>
      ) : role === "Principal" ? (
        <section className="panel activity-panel campus-panel">
          <PanelHead title="Campus snapshot" action="Reports" onClick={() => go("Reports")} />
          <div className="campus-snap">
            <div className="campus-compare">
              {(Object.entries(campusData) as [keyof typeof campusData, (typeof campusData)[keyof typeof campusData]][]).map(([name, item]) => (
                <article key={name} className={`campus-mini${campus === name ? " active" : ""}`}>
                  <span>{name.replace(" Campus", "")}</span>
                  <strong>{item.students}</strong>
                  <small>students</small>
                  <div className="campus-mini-meta">
                    <em>{item.attendance}</em>
                    <em>{item.fee}</em>
                  </div>
                </article>
              ))}
            </div>
            <div className="campus-look">
              <span className="achievement-icon orange"><Icon name="bolt" size={15} /></span>
              <span><b>Look here first</b><small>Grade 9 fees and Grade 8-C attendance need a principal review today.</small></span>
            </div>
            <div className="campus-feed">
              <div><Avatar name="Dr. Farhana Rahman" /><span><b>Term result published</b><small>Grade 9 Mathematics</small></span><time>8:55 AM</time></div>
              <div><Avatar name="Nusrat Jahan" /><span><b>Board pack ready</b><small>Attendance and collection summary</small></span><time>8:10 AM</time></div>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel activity-panel"><PanelHead title="Recent activity" action="Audit trail" onClick={() => roleModules[role].includes("Audit Trail") ? go("Audit Trail") : notify("Activity timeline opened")} /><div className="activity-list"><div><Avatar name="Mahmud Hasan" /><span><b>Attendance updated</b><small>Grade 10-A · by Mahmud Hasan</small></span><time>9:42 AM</time></div><div><Avatar name="Rayan Chowdhury" /><span><b>Fee payment received</b><small>ABC-25-1108 · ৳24,500</small></span><time>9:18 AM</time></div><div><Avatar name="Dr. Farhana Rahman" /><span><b>Term result published</b><small>Grade 9 Mathematics</small></span><time>8:55 AM</time></div></div></section>
      )}
    </div>
  </div>;
}

function PanelHead({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="panel-head"><h2>{title}</h2>{action && <button onClick={onClick}>{action} <Icon name="arrow" size={14} /></button>}</div>; }

function ModulePage({ module, role, notify }: { module: ModuleKey; role: Role; notify: (s: string) => void }) {
  const [filter, setFilter] = useState(""); const [modal, setModal] = useState("");
  const titleCopy: Record<ModuleKey, string> = { Dashboard: "", Students: "Manage registration, profiles, guardians, IDs and student discipline.", Attendance: "Monitor daily attendance, trends and threshold alerts.", Academics: "Manage subjects, notes, class resources and learning progress.", Assignments: "Create, distribute, submit and review class assignments.", "Exams & Results": "Plan examinations, enrol students, set questions and publish results.", Timetable: "Coordinate class, examination and faculty schedules.", Finance: "Manage fees, receipts, salary payments and account status.", Library: "Run the catalogue, borrowing, renewals, returns and inventory.", Events: "Organise school activities, reading programmes and participation.", "Online Classes": "Schedule, conduct and manage connected classes.", Messages: "Secure communication among school, teachers, students and guardians.", Reports: "Generate decision-ready academic and operational reports.", "Users & Roles": "Register users, generate IDs and control role-based access.", "Audit Trail": "Review sensitive actions and changes across the platform.", Profile: "View and update account details, preferences and security." };
  const primaryAction: Record<ModuleKey, string> = { Dashboard: "", Students: "Register student", Attendance: "Take attendance", Academics: "Upload notes", Assignments: "Create assignment", "Exams & Results": "Create exam", Timetable: "Add schedule", Finance: "Record payment", Library: "Issue book", Events: "Create event", "Online Classes": "Schedule class", Messages: "New message", Reports: "Generate report", "Users & Roles": "Register user", "Audit Trail": "Export log", Profile: "Edit profile" };
  if (role === "Student" || role === "Parent") { primaryAction.Attendance = ""; primaryAction.Academics = "Download notes"; primaryAction.Assignments = role === "Student" ? "Submit assignment" : ""; primaryAction["Exams & Results"] = role === "Student" ? "Enroll in exam" : ""; primaryAction.Timetable = ""; primaryAction.Finance = "Pay fees"; primaryAction.Library = "Issue or renew book"; primaryAction.Events = "Join event"; primaryAction["Online Classes"] = role === "Student" ? "Join class" : ""; }
  if (role === "Librarian") { primaryAction.Students = ""; primaryAction.Reports = "Generate library report"; }
  const action = primaryAction[module];
  function exportData() { const csv = "Record,Status,Updated\nABCIS SchoolOS export,Complete,20 Aug 2026"; const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const a = document.createElement("a"); a.href = url; a.download = `abcis-${module.toLowerCase().replaceAll(" ", "-")}.csv`; a.click(); URL.revokeObjectURL(url); notify(`${module} export downloaded`); }
  return <div className="module-page"><section className="page-heading"><div><span className="eyebrow">{role.toUpperCase()} WORKSPACE</span><h1>{module}</h1><p>{titleCopy[module]}</p></div><div className="heading-actions"><button className="secondary-button" onClick={exportData}><Icon name="download" size={17} /> Export</button>{action && <button className="primary-button" onClick={() => setModal(action)}><Icon name="plus" size={17} /> {action}</button>}</div></section><ModuleContent module={module} role={role} filter={filter} setFilter={setFilter} notify={notify} />{modal && <ActionModal title={modal} module={module} onClose={() => setModal("")} onSave={() => { notify(`${modal} completed successfully`); setModal(""); }} />}</div>;
}

function Toolbar({ filter, setFilter, label = "Search records..." }: { filter: string; setFilter: (s: string) => void; label?: string }) { return <div className="table-toolbar"><div className="field-search"><Icon name="search" size={17} /><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={label} /></div><select aria-label="Filter records"><option>All records</option><option>Active</option><option>Needs review</option></select><button className="filter-button">More filters</button></div>; }

function ModuleContent({ module, role, filter, setFilter, notify }: { module: ModuleKey; role: Role; filter: string; setFilter: (s: string) => void; notify: (s: string) => void }) {
  if (module === "Students") return <><div className="mini-stats"><Stat value="1,896" label="Total students" /><Stat value="42" label="New this term" /><Stat value="18" label="Profiles to review" /><Stat value="98.7%" label="Active profiles" /></div><section className="panel data-panel"><Toolbar filter={filter} setFilter={setFilter} label="Search name, ID or guardian..." /><div className="table-wrap"><table><thead><tr><th>Student</th><th>Student ID</th><th>Class</th><th>Guardian</th><th>Attendance</th><th>Status</th><th>Action</th></tr></thead><tbody>{students.filter((s) => `${s.name} ${s.id} ${s.guardian}`.toLowerCase().includes(filter.toLowerCase())).map((s) => <tr key={s.id}><td data-label="Student"><div className="person-cell"><Avatar name={s.name} /><strong>{s.name}</strong></div></td><td data-label="Student ID"><code>{s.id}</code></td><td data-label="Class">{s.grade}</td><td data-label="Guardian">{s.guardian}</td><td data-label="Attendance"><strong>{s.attendance}</strong></td><td data-label="Status"><Status value={s.status} /></td><td data-label="Action"><button className="row-action" onClick={() => notify(`${s.name}'s profile opened`)}>View</button></td></tr>)}</tbody></table></div></section></>;
  if (module === "Attendance") return <><div className="mini-stats"><Stat value="94.8%" label="Present today" /><Stat value="84" label="Absent today" /><Stat value="21" label="Late arrivals" /><Stat value="3" label="Classes under 90%" /></div><section className="attendance-board panel"><div className="attendance-top"><div><h3>Grade 10 · Section A</h3><p>20 August 2026 · 32 students</p></div><div className="attendance-legend"><span><i className="present" /> Present 29</span><span><i className="late" /> Late 2</span><span><i className="absent" /> Absent 1</span></div></div><div className="student-check-grid">{students.concat([{...students[0], id:"6", name:"Adnan Karim"},{...students[1], id:"7", name:"Mehzabin Noor"},{...students[2], id:"8", name:"Samiul Haque"}]).map((s, i) => <button key={s.id} onClick={(e) => e.currentTarget.classList.toggle("marked")} className={i === 3 ? "absent-card" : i === 4 ? "late-card" : "marked"}><Avatar name={s.name} /><span><b>{s.name}</b><small>{i === 3 ? "Absent" : i === 4 ? "Late · 08:17" : "Present"}</small></span><i>✓</i></button>)}</div><div className="board-footer"><span>Last saved 2 minutes ago</span><button className="primary-button" onClick={() => notify("Attendance saved for Grade 10-A")}>Save attendance</button></div></section></>;
  if (module === "Finance") {
    const family = role === "Student" || role === "Parent";
    return <><div className="mini-stats">{family ? <><Stat value="৳ 0" label="Outstanding balance" /><Stat value="৳ 24,500" label="Last payment" /><Stat value="30 Jun" label="Paid through" /><Stat value="04" label="Receipts available" /></> : <><Stat value="৳ 64.2L" label="Billed this month" /><Stat value="৳ 60.5L" label="Collected" /><Stat value="৳ 3.7L" label="Outstanding" /><Stat value="৳ 18.4L" label="Salary payable" /></>}</div><div className="two-panels"><section className="panel"><PanelHead title={family ? "Payment history" : "Recent fee transactions"} action={family ? "Download receipts" : "View ledger"} onClick={() => notify("Fee receipt downloaded")} /><div className="transaction-list">{(family ? [["June tuition","Receipt ABC-R-8842","৳ 24,500","Net banking"],["May tuition","Receipt ABC-R-8418","৳ 24,500","Net banking"],["Examination fee","Receipt ABC-R-8091","৳ 8,000","Card"],["April tuition","Receipt ABC-R-7740","৳ 24,500","Net banking"]] : [["Ariana Islam","Tuition · June","৳ 24,500","Net banking"],["Rayan Chowdhury","Exam fee","৳ 8,000","Cash"],["Nafisa Ahmed","Tuition · June","৳ 26,000","Cheque"],["Zara Khan","Library fine","৳ 750","Net banking"]]).map((x,i)=><div key={x[0]}>{getAvatar(x[0]) ? <Avatar name={x[0]} /> : <span className={`money-icon tone-${(i%4)+1}`}>৳</span>}<span><b>{x[0]}</b><small>{x[1]} · {x[3]}</small></span><strong>{x[2]}</strong><Status value="Paid" /></div>)}</div></section><section className="panel"><PanelHead title={family ? "Fee account" : "Salary disbursement"} action={family ? "Fee details" : "Payroll report"} /><div className="payroll-progress"><div><span>{family ? "Academic year 2026" : "June 2026 payroll"}</span><b>{family ? "100%" : "86%"}</b></div><progress value={family ? 100 : 86} max="100" /><p>{family ? "All issued fees have been paid" : "113 of 129 staff payments processed"}</p></div><div className="payment-methods">{(family ? [["Tuition","Paid"],["Exam","Paid"],["Library","Clear"]] : [["Cash","8 pending"],["Cheque","3 pending"],["Net banking","5 pending"]]).map(x=><button key={x[0]} onClick={() => notify(`${x[0]} details opened`)}><b>{x[0]}</b><small>{x[1]}</small></button>)}</div></section></div></>;
  }
  if (module === "Library") return <><div className="mini-stats"><Stat value="8,642" label="Catalogue titles" /><Stat value="218" label="Issued this week" /><Stat value="41" label="Overdue" /><Stat value="3" label="Reserved for pickup" /></div><section className="panel data-panel"><Toolbar filter={filter} setFilter={setFilter} label="Search title, author or ISBN..."/><div className="book-grid">{[["The Cambridge Encyclopedia","David Crystal","Reference","Available"],["A Brief History of Time","Stephen Hawking","Science","Issued"],["The Old Man and the Sea","Ernest Hemingway","Literature","Available"],["IGCSE Mathematics","Karen Morrison","Academic","Reserved"],["Bangladesh: A Legacy of Blood","Anthony Mascarenhas","History","Available"],["Introduction to Algorithms","Cormen et al.","Technology","Issued"]].filter(x=>x.join(" ").toLowerCase().includes(filter.toLowerCase())).map((book,i)=><article key={book[0]}><div className={`book-cover book-${i+1}`}><span>ABCIS<br/>LIBRARY</span><b>{book[0].split(" ").slice(0,3).join(" ")}</b></div><div><small>{book[2]}</small><h3>{book[0]}</h3><p>{book[1]}</p><Status value={book[3]} /><button onClick={()=>notify(`${book[0]} record opened`)}>Details <Icon name="arrow" size={13}/></button></div></article>)}</div></section></>;
  if (module === "Timetable") return <section className="panel timetable-panel"><div className="week-head"><div><button>‹</button><strong>17–23 August 2026</strong><button>›</button></div><button className="secondary-button">Today</button></div><div className="week-grid"><span /><b>Monday<small>17 Aug</small></b><b>Tuesday<small>18 Aug</small></b><b>Wednesday<small>19 Aug</small></b><b className="today">Thursday<small>20 Aug</small></b><b>Friday<small>21 Aug</small></b>{["08:00","09:30","11:00","12:30","02:00"].map((time,i)=><div className="week-row" key={time}><span>{time}</span>{[0,1,2,3,4].map((d)=><div key={d}>{(i+d)%3===0&&<article className={`slot tone-${(i%4)+1}`}><b>{["Mathematics","English","Physics","ICT"][i%4]}</b><small>Grade {8+(d%3)} · R{201+d}</small></article>}</div>)}</div>)}</div></section>;
  if (module === "Profile") return <ProfilePage role={role} notify={notify} />;
  return <GenericModule module={module} notify={notify} />;
}

function GenericModule({ module, notify }: { module: ModuleKey; notify: (s: string) => void }) {
  const content: Record<string, { stats: string[][]; rows: string[][]; headers: string[] }> = {
    Academics: { stats: [["42","Active subjects"],["186","Notes & resources"],["12","Grades covered"],["96%","Curriculum mapped"]], headers:["Subject","Class","Teacher","Resources","Progress","Status"], rows:[["Mathematics","Grade 10-A","Mahmud Hasan","18 files","78%","On track"],["English Language","Grade 10-A","Sarah Ahmed","24 files","72%","On track"],["Physics","Grade 10-A","Rashed Khan","16 files","68%","Review"],["ICT","Grade 10-A","Nadia Karim","21 files","81%","On track"]]},
    Assignments: { stats: [["04","Active"],["02","Due this week"],["18","To review"],["92%","Submission rate"]], headers:["Assignment","Subject","Class","Due date","Submissions","Status"], rows:[["Algebra practice set","Mathematics","Grade 10-A","22 Aug","28 / 32","Open"],["Essay: Climate action","English","Grade 10-A","24 Aug","21 / 32","Open"],["Forces lab report","Physics","Grade 10-A","18 Aug","32 / 32","Review"],["Database worksheet","ICT","Grade 10-A","28 Aug","12 / 32","Draft"]]},
    "Exams & Results": { stats: [["06","Upcoming exams"],["1,764","Students enrolled"],["86.4%","Pass rate"],["12","Results pending"]], headers:["Examination","Grade","Date","Students","Result status","Action"], rows:[["Midterm Mathematics","Grade 10","30 Aug","154","Questions ready","Manage"],["English Language Test","Grade 9","01 Sep","162","Draft","Manage"],["Physics Practical","Grade 11","03 Sep","88","Students added","Manage"],["Term II Results","Grade 8","Published","178","Published","View"]]},
    Events: { stats: [["08","Upcoming"],["324","Participants"],["03","This month"],["06","Clubs involved"]], headers:["Event","Date","Venue","Coordinator","Participants","Status"], rows:[["Inter-house debate","24 Aug","School auditorium","Sarah Ahmed","86","Registration"],["Science fair 2026","02 Sep","Main campus","Rashed Khan","124","Planning"],["Library reading circle","27 Aug","Central library","Samira Kabir","32","Open"],["Parent conference","05 Sep","Both campuses","Administration","82","Scheduled"]]},
    "Online Classes": { stats: [["04","Today"],["16","This week"],["96%","Join rate"],["38h","Recorded lessons"]], headers:["Class","Teacher","Time","Students","Platform","Status"], rows:[["Grade 10 Mathematics","Mahmud Hasan","10:30 AM","32","ABCIS Live","Starting soon"],["Grade 9 English","Sarah Ahmed","12:00 PM","34","ABCIS Live","Scheduled"],["Grade 11 Physics","Rashed Khan","02:15 PM","28","ABCIS Live","Scheduled"],["Grade 8 ICT","Nadia Karim","04:00 PM","31","ABCIS Live","Recorded"]]},
    Messages: { stats: [["03","Unread"],["18","This week"],["06","Groups"],["98%","Delivery rate"]], headers:["Conversation","Participants","Last message","Time","Priority","Status"], rows:[["Grade 10-A guardians","32 parents","Term schedule shared","10:42 AM","Normal","Unread"],["Academic committee","8 staff","Agenda confirmed","Yesterday","High","Read"],["Ariana Islam · Parent","Imran Islam","Thank you, noted.","Yesterday","Normal","Read"],["Library volunteers","12 members","Event roster updated","18 Aug","Normal","Read"]]},
    Reports: { stats: [["14","Report types"],["06","Scheduled"],["23","Generated this month"],["100%","Verified data"]], headers:["Report","Category","Period","Owner","Last generated","Action"], rows:[["Student attendance summary","Attendance","Monthly","Admin","Today","Generate"],["Fee collection & arrears","Finance","Monthly","Accounts","Yesterday","Generate"],["Academic performance","Academics","Term II","Principal","18 Aug","Generate"],["Library circulation","Library","Monthly","Librarian","15 Aug","Generate"]]},
    "Users & Roles": { stats: [["2,168","User accounts"],["129","Staff profiles"],["06","Permission roles"],["07","Pending invites"]], headers:["User","Role","Campus","Last active","Access","Status"], rows:[["Nusrat Jahan","Admin","Both","Now","Full administration","Active"],["Dr. Farhana Rahman","Principal","Both","12 min ago","Leadership","Active"],["Mahmud Hasan","Teacher","Narayanganj","18 min ago","Academic","Active"],["Samira Kabir","Librarian","Narayanganj","1 hour ago","Library","Active"]]},
    "Audit Trail": { stats: [["1,842","Actions this month"],["18","Sensitive actions"],["00","Security flags"],["365d","Retention"]], headers:["Action","User","Module","Record","Time","Source"], rows:[["Updated attendance","Mahmud Hasan","Attendance","Grade 10-A","Today · 9:42","Web portal"],["Recorded fee payment","Nusrat Jahan","Finance","ABC-25-1108","Today · 9:18","Web portal"],["Published result","Dr. Farhana Rahman","Exams","Grade 9 Math","Today · 8:55","Web portal"],["Renewed book","Samira Kabir","Library","LIB-009842","Yesterday","Web portal"]]},
  };
  const d = content[module] ?? content.Academics;
  return <><div className="mini-stats">{d.stats.map(([v,l])=><Stat key={l} value={v} label={l}/>)}</div><section className="panel data-panel"><div className="table-toolbar"><div className="field-search"><Icon name="search" size={17}/><input placeholder={`Search ${module.toLowerCase()}...`}/></div><select><option>All records</option><option>Active</option><option>Archived</option></select><button className="filter-button">More filters</button></div><div className="table-wrap"><table><thead><tr>{d.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{d.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} data-label={d.headers[j]}>{j===row.length-1 ? <button className="row-action" onClick={()=>notify(`${module} record opened`)}>{cell}</button> : j===row.length-2 ? <Status value={cell}/> : getAvatar(cell) ? <div className="person-cell"><Avatar name={cell} /><strong>{cell}</strong></div> : <span className={j===0?"strong-cell":""}>{cell}</span>}</td>)}</tr>)}</tbody></table></div></section></>;
}

function ProfilePage({ role, notify }: { role: Role; notify: (s: string) => void }) {
  const user = roles.find((item) => item.role === role) ?? roles[0];
  return <div className="profile-layout"><section className="panel profile-card"><div className="profile-cover"/><Avatar name={user.name} className="profile-avatar"/><h2>{user.name}</h2><p>{user.subtitle}</p><Status value="Active"/><div className="profile-meta"><span><small>Employee ID</small><b>ABC-ST-0042</b></span><span><small>Campus</small><b>Both campuses</b></span><span><small>Joined</small><b>12 January 2021</b></span></div></section><section className="panel profile-form"><PanelHead title="Personal information" action="Account activity"/><div className="form-grid"><label>Full name<input defaultValue={user.name}/></label><label>Email address<input defaultValue={user.email}/></label><label>Phone number<input defaultValue="+880 17 0000 0000"/></label><label>Designation<input defaultValue={user.subtitle}/></label><label className="wide">Address<input defaultValue="Narayanganj, Dhaka, Bangladesh"/></label></div><button className="primary-button" onClick={()=>notify("Profile updated successfully")}>Save changes</button></section></div>;
}
function Stat({ value, label }: { value: string; label: string }) { return <article className="mini-stat"><span>{label}</span><strong>{value}</strong><small>Updated today</small></article>; }
function Status({ value }: { value: string }) { const cls = ["Review","Overdue","Draft","Absent"].includes(value) ? "warning" : ["Issued","Reserved","Unread","Registration","Planning"].includes(value) ? "info" : "success"; return <span className={`status ${cls}`}><i />{value}</span>; }

function ActionModal({ title, module, onClose, onSave }: { title: string; module: ModuleKey; onClose: () => void; onSave: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLFormElement>(null);
  useFocusTrap(true, dialogRef);
  useEffect(() => { closeRef.current?.focus(); }, []);
  return (
    <div className="modal-backdrop">
      <form ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="action-modal-title" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <div className="modal-head">
          <div><span className="eyebrow">{module.toUpperCase()}</span><h2 id="action-modal-title">{title}</h2></div>
          <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <p>Complete the details below. This interactive prototype will add the action to the activity timeline.</p>
          <div className="form-grid">
            <label>Record title<input required placeholder={`Enter ${title.toLowerCase()} details`} /></label>
            <label>Effective date<input required type="date" defaultValue="2026-08-20" /></label>
            <label className="wide">Notes<textarea placeholder="Add an optional note for the record" /></label>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">Confirm {title.toLowerCase()}</button>
        </div>
      </form>
    </div>
  );
}

function AICompanion({ role, onClose }: { role: Role; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([{ from: "ai", text: `Hello! I’m ABCIS Assist. I can securely search the school’s read-only records and explain historical data for your ${role.toLowerCase()} workspace. What would you like to know?` }]);
  const [thinking, setThinking] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(true, drawerRef);
  useEffect(() => { closeRef.current?.focus(); }, []);
  function ask(text = query) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setQuery("");
    setThinking(true);
    window.setTimeout(() => {
      const q = text.toLowerCase();
      const key = q.includes("fee") || q.includes("payment") ? "fee" : q.includes("attendance") || q.includes("absent") ? "attendance" : q.includes("result") || q.includes("exam") || q.includes("performance") ? "result" : q.includes("book") || q.includes("library") ? "library" : "default";
      setMessages((m) => [...m, { from: "ai", text: aiResponses[key] }]);
      setThinking(false);
    }, 650);
  }
  return (
    <div className="drawer-backdrop">
      <button className="drawer-scrim" onClick={onClose} aria-label="Close ABCIS Assist" />
      <aside ref={drawerRef} className="ai-drawer" role="dialog" aria-modal="true" aria-labelledby="ai-drawer-title">
        <div className="ai-head">
          <div className="ai-title">
            <span><Icon name="ai" /></span>
            <div><b id="ai-drawer-title">ABCIS Assist</b><small><i /> Connected to school records</small></div>
          </div>
          <button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close ABCIS Assist"><Icon name="close" /></button>
        </div>
        <div className="ai-context"><span>READ-ONLY DATA COMPANION</span><p>Ask plain-language questions across attendance, fees, academics, library, users and activity history.</p><div><b>History available</b><strong>12 months</strong></div></div>
        <div className="ai-messages">
          {messages.map((m, i) => <div key={i} className={`chat ${m.from}`}>{m.from === "ai" && <span className="chat-mark"><Icon name="ai" size={15} /></span>}<p>{m.text}</p></div>)}
          {thinking && <div className="chat ai"><span className="chat-mark"><Icon name="ai" size={15} /></span><p className="typing"><i /><i /><i /></p></div>}
        </div>
        <div className="suggestions"><span>TRY ASKING</span>{["Show fee collection for the last 6 months", "Which classes had low attendance?", "Summarise the latest exam performance", "How many library books are overdue?"].map((s) => <button onClick={() => ask(s)} key={s}>{s}<Icon name="arrow" size={13} /></button>)}</div>
        <form className="ai-input" onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about school data or history..." />
          <button aria-label="Send question"><Icon name="arrow" size={18} /></button>
          <small>ABCIS Assist can make mistakes. Verify critical information.</small>
        </form>
      </aside>
    </div>
  );
}

function GlobalSearch({ role, go, onClose }: { role: Role; go: (m: ModuleKey)=>void; onClose:()=>void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => roleModules[role].filter((x) => x.toLowerCase().includes(q.toLowerCase())), [q, role]);
  return (
    <div className="search-backdrop" onMouseDown={onClose}>
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search SchoolOS" onMouseDown={(e) => e.stopPropagation()}>
        <div className="global-input"><Icon name="search" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ABCIS SchoolOS..." aria-label="Search SchoolOS" /><kbd>ESC</kbd></div>
        <div className="search-results"><span>{q ? "MATCHING RESULTS" : "QUICK NAVIGATION"}</span>{results.map((m) => <button key={m} onClick={() => { go(m); onClose(); }}><span className="result-icon"><Icon name={m} /></span><span><b>{m}</b><small>Open the {m.toLowerCase()} workspace</small></span><Icon name="arrow" size={16} /></button>)}</div>
        <div className="search-footer"><span>↑↓ Navigate</span><span>↵ Open</span><span>esc Close</span></div>
      </div>
    </div>
  );
}

function BootScreen() {
  return (
    <div className="app-boot" aria-busy="true" aria-live="polite">
      <img src="/abcis-logo.png" alt="ABCIS SchoolOS" />
    </div>
  );
}

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const key = window.localStorage.getItem("abcis-demo-role") as Role | null;
    if (key && roles.some((item) => item.role === key)) setRole(key);
    setReady(true);
  }, []);
  function login(next: Role) { window.localStorage.setItem("abcis-demo-role", next); setRole(next); }
  function logout() { window.localStorage.removeItem("abcis-demo-role"); setRole(null); }
  if (!ready) return <BootScreen />;
  return role ? <App initialRole={role} onLogout={logout} /> : <Login onLogin={login} />;
}
