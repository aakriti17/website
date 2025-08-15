import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Brain, Home as HomeIcon, Box, BookOpen, Bot, Info, Sparkles, ShieldCheck, Inbox, ShoppingCart, CheckCircle2, X, IndianRupee, MessageSquare, ArrowRight } from "lucide-react";

// -----------------------------
// Mock Data (edit/extend freely)
// -----------------------------
const DATA = {
  topics: [
    {
      slug: "sql-injection",
      title: "SQL Injection",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
      summary:
        "Understand how SQL queries can be manipulated and how to prevent it with parameterized queries and least privilege.",
      sidebar: [
        { id: "types", label: "Types of SQLi" },
        { id: "get-based", label: "GET-based" },
        { id: "post-based", label: "POST-based" },
        { id: "blind-boolean", label: "Blind Boolean" },
        { id: "blind-time", label: "Blind Time-based" },
        { id: "error-based", label: "Error-based" },
        { id: "mitigations", label: "Mitigations" },
      ],
      content: {
        normal: `SQL Injection (SQLi) occurs when user input is concatenated into SQL statements without strict validation.\n\n**Core idea:** attacker-controlled input breaks query structure.\n\n**Symptoms:** unexpected data exposure, authentication bypass, data tampering.\n\n**Defenses:** parameterized queries (prepared statements), stored procedures (carefully), least-privilege DB users, rigorous input handling, and centralized ORM/DB layer.`,
        easy: `**Super Easy View**\n- Think of SQL like a sentence the database understands.\n- If you glue raw user text into that sentence, it might change the meaning.\n- Always keep the sentence structure fixed and plug values in safely (prepared statements).\n- Give the app only the minimal DB permissions.`,
        deep: `**Deep & Lengthy View**\n- Categories: In-band (error-based, union-based), Inferential (boolean/time blind), Out-of-band.\n- Exploit flow: reconnaissance → injection point discovery → payload crafting → exfiltration or control.\n- Prevention: strict query parameterization; static analysis; query allow-lists; RASP/WA F in layered defense.\n- Testing: use intentionally vulnerable labs in a VM; never target systems without explicit written permission.`,
      },
      projects: [
        {
          slug: "login-bypass-lab",
          title: "Login Bypass Lab (Demo)",
          price: 10,
          image:
            "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
          description:
            "A tiny vulnerable app for practicing parameterized vs concatenated queries. Run only inside a VM.",
          tools: ["Docker", "SQLite", "Node.js"],
          download: "/downloads/login-bypass-lab.zip",
        },
      ],
    },
    {
      slug: "xss",
      title: "Cross-Site Scripting (XSS)",
      image: "https://images.unsplash.com/photo-1544198365-3c3b3f8b034b?q=80&w=1200&auto=format&fit=crop",
      summary:
        "Learn reflected, stored, and DOM-based XSS, and how to prevent using context-aware encoding and CSP.",
      sidebar: [
        { id: "types", label: "Types of XSS" },
        { id: "reflected", label: "Reflected" },
        { id: "stored", label: "Stored" },
        { id: "dom", label: "DOM-based" },
        { id: "mitigations", label: "Mitigations" },
      ],
      content: {
        normal: `XSS lets attackers run scripts in a victim's browser by injecting untrusted data into pages.`,
        easy: `**Super Easy:** Never let raw user text become HTML/JS. Encode it first.`,
        deep: `**Deep:** Output-encoding by context, input validation, CSP 'strict-dynamic', nonces, template auto-escaping.`,
      },
      projects: [],
    },
  ],
};

// -----------------------------
// Utilities: localStorage helpers
// -----------------------------
const storage = {
  get(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

// -----------------------------
// Ads & Analytics (placeholders)
// -----------------------------
function useGoogleAnalytics(measurementId = "G-XXXXXXXXXX") {
  useEffect(() => {
    // Placeholder: replace with your GA4 measurement ID
    if (!window.__ga_init) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);} // eslint-disable-line
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", measurementId);
      window.__ga_init = true;
    }
  }, [measurementId]);
}

function GoogleAdSenseSlot() {
  useEffect(() => {
    // This is a placeholder; when you add your AdSense client, uncomment the below
    // (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);
  return (
    <ins
      className="adsbygoogle block w-full"
      style={{ display: "block", minHeight: 90 }}
      data-ad-client="ca-pub-XXXX" // TODO: replace with your AdSense ID
      data-ad-slot="0000000000"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

// -----------------------------
// Global Layout
// -----------------------------
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="border-t mt-12 py-10 text-sm text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>
              For education in safe, legal environments (VMs, lab networks). Do **not** attack systems without
              explicit written consent.
            </span>
          </div>
          <div className="opacity-70">© {new Date().getFullYear()} Balkar Singh • Ethical Hacking Learning</div>
        </div>
      </footer>
    </div>
  );
}

function TopNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 text-white">
            EH
          </span>
          <span>Ethical Hacking Academy</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/"><HomeIcon className="w-4 h-4 inline mr-1"/>Home</NavLink>
          <NavLink to="/material"><BookOpen className="w-4 h-4 inline mr-1"/>Material</NavLink>
          <NavLink to="/projects"><Box className="w-4 h-4 inline mr-1"/>Projects</NavLink>
          <NavLink to="/assistant"><Bot className="w-4 h-4 inline mr-1"/>AI Assistant</NavLink>
          <NavLink to="/about"><Info className="w-4 h-4 inline mr-1"/>About</NavLink>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(v=>!v)} aria-label="Toggle Menu">
          <Inbox className="w-6 h-6" />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
            <MobileLink to="/" onClick={()=>setOpen(false)}>Home</MobileLink>
            <MobileLink to="/material" onClick={()=>setOpen(false)}>Material</MobileLink>
            <MobileLink to="/projects" onClick={()=>setOpen(false)}>Projects</MobileLink>
            <MobileLink to="/assistant" onClick={()=>setOpen(false)}>AI Assistant</MobileLink>
            <MobileLink to="/about" onClick={()=>setOpen(false)}>About</MobileLink>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="text-sm text-zinc-700 hover:text-zinc-900 transition font-medium">
      {children}
    </Link>
  );
}
function MobileLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="py-2 text-zinc-800 font-medium">
      {children}
    </Link>
  );
}

// -----------------------------
// Home with Typewriter
// -----------------------------
function Typewriter({ words = [], delay = 100, hold = 1000 }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const current = words[index % words.length] || "";
    const step = () => {
      if (!deleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
        } else {
          setTimeout(() => setDeleting(true), hold);
        }
      } else {
        if (text.length > 0) {
          setText(current.slice(0, text.length - 1));
        } else {
          setDeleting(false);
          setIndex((i) => (i + 1) % words.length);
        }
      }
    };

    intervalRef.current = setTimeout(step, deleting ? 40 : delay);
    return () => clearTimeout(intervalRef.current);
  }, [text, deleting, index, words, delay, hold]);

  return (
    <span className="border-b-2 border-zinc-900 pb-1">{text}\u00A0</span>
  );
}

function Home() {
  useGoogleAnalytics();
  const words = [
    "An AI Assistant",
    "Summarized Notes",
    "Super Easy Notes",
    "Lengthy Notes",
    "Ethical Hacking Projects",
  ];
  return (
    <div className="flex flex-col items-center justify-center text-center gap-8 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight"
      >
        Learn Ethical Hacking the Right Way
      </motion.h1>

      <p className="text-lg text-zinc-700">This website contains <Typewriter words={words} delay={90} hold={900} /></p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-6">
        <Feature icon={<BookOpen className="w-5 h-5"/>} title="Organized Material" desc="Clear theory + practical guidance." />
        <Feature icon={<Brain className="w-5 h-5"/>} title="AI Assistant" desc="Ask questions, find topics fast." />
        <Feature icon={<Box className="w-5 h-5"/>} title="Hands-on Projects" desc="Practice safely in a VM lab." />
        <Feature icon={<Sparkles className="w-5 h-5"/>} title="Easy → Deep" desc="Pick your difficulty level." />
      </div>

      <div className="w-full mt-8">
        <GoogleAdSenseSlot />
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5 flex items-start gap-3">
        <div className="rounded-xl p-2 bg-zinc-100">{icon}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-zinc-600">{desc}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------
// Material (catalog) page
// -----------------------------
function Material() {
  const topics = DATA.topics;
  return (
    <div className="space-y-8">
      <Header title="Material" subtitle="Summarized notes with images. Click to view details and pick your depth." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((t) => (
          <TopicCard key={t.slug} topic={t} />
        ))}
      </div>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-600 mt-1">{subtitle}</p>}
      </div>
      <div className="hidden sm:block w-72">
        <SiteSearch compact />
      </div>
    </div>
  );
}

function TopicCard({ topic }) {
  return (
    <Link to={`/material/${topic.slug}`} className="group">
      <Card className="overflow-hidden rounded-2xl shadow-sm">
        <div className="h-40 bg-zinc-200 overflow-hidden">
          <img src={topic.image} alt={topic.title} className="w-full h-full object-cover group-hover:scale-105 transition"/>
        </div>
        <CardContent className="p-4">
          <div className="font-semibold mb-1 flex items-center gap-2">{topic.title}</div>
          <p className="text-sm text-zinc-600 line-clamp-2">{topic.summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

// -----------------------------
// Topic details with Sidebar + Tabs
// -----------------------------
function TopicDetails() {
  const { slug } = useParams();
  const topic = DATA.topics.find((t) => t.slug === slug);
  const navigate = useNavigate();

  if (!topic) return <div>Topic not found.</div>;

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8">
      <aside className="space-y-3 sticky top-24 self-start h-max">
        <div className="text-xs uppercase text-zinc-500 font-semibold">On this topic</div>
        <ul className="space-y-1">
          {topic.sidebar.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-sm text-zinc-700 hover:text-zinc-900">{s.label}</a>
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="w-full mt-3" onClick={() => navigate(-1)}>Back</Button>
      </aside>

      <div>
        <h1 className="text-3xl font-extrabold mb-2">{topic.title}</h1>
        <p className="text-zinc-700 mb-6">{topic.summary}</p>

        <div id="types" className="scroll-mt-24">
          <Tabs defaultValue="normal">
            <TabsList>
              <TabsTrigger value="normal">Normal</TabsTrigger>
              <TabsTrigger value="easy">Super Easy</TabsTrigger>
              <TabsTrigger value="deep">Deep & Lengthy</TabsTrigger>
            </TabsList>
            <TabsContent value="normal">
              <Prose>{topic.content.normal}</Prose>
            </TabsContent>
            <TabsContent value="easy">
              <Prose>{topic.content.easy}</Prose>
            </TabsContent>
            <TabsContent value="deep">
              <Prose>{topic.content.deep}</Prose>
            </TabsContent>
          </Tabs>
        </div>

        {/* Section Anchors for Sidebar */}
        <SectionAnchor id="get-based" title="GET-based SQL Injection" />
        <Prose>
          {`GET-based SQLi targets query parameters in URLs. Use prepared statements and strict allow-lists for parameters. Never echo raw DB errors to users.`}
        </Prose>

        <SectionAnchor id="post-based" title="POST-based SQL Injection" />
        <Prose>
          {`POST-based SQLi hides payloads in request bodies. Server-side validation and parameterized ORM calls remain essential.`}
        </Prose>

        <SectionAnchor id="blind-boolean" title="Blind Boolean-based" />
        <Prose>
          {`Responses differ only in true/false behavior. Defense still relies on parameterization and minimizing conditional leakage.`}
        </Prose>

        <SectionAnchor id="blind-time" title="Blind Time-based" />
        <Prose>
          {`Timing differences (e.g., SLEEP) reveal data indirectly. Mitigate by removing injectable concatenation and normalizing error handling.`}
        </Prose>

        <SectionAnchor id="error-based" title="Error-based" />
        <Prose>
          {`DB error messages are leveraged to extract data. Avoid detailed error output in production; use generic user errors and server-side logs.`}
        </Prose>

        <SectionAnchor id="mitigations" title="Mitigations" />
        <ul className="list-disc pl-6 text-zinc-800 space-y-2">
          <li>Parameterized queries / prepared statements</li>
          <li>Least-privilege DB accounts</li>
          <li>Centralized query builders/ORMs with safe defaults</li>
          <li>Input handling + output encoding for UI</li>
          <li>Systematic testing in isolated VMs or labs</li>
        </ul>
      </div>
    </div>
  );
}

function SectionAnchor({ id, title }) {
  return (
    <h3 id={id} className="scroll-mt-24 text-xl font-bold mt-10 mb-2">{title}</h3>
  );
}

function Prose({ children }) {
  return (
    <div className="prose prose-zinc max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: markdownToHtml(String(children)) }} />
  );
}

// Tiny markdown → HTML (headings, bold, lists, newlines)
function markdownToHtml(md) {
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '<br/><br/>' )
}

// -----------------------------
// Projects (catalog) + detail with ₹10 purchase gate
// -----------------------------
function Projects() {
  const projects = DATA.topics.flatMap((t) => t.projects.map((p) => ({...p, topic: t.title, topicSlug: t.slug})));
  return (
    <div className="space-y-8">
      <Header title="Projects" subtitle="Practice ethically in your own VM lab. Each ZIP contains starter code & instructions." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.topicSlug}/${project.slug}`} className="group">
      <Card className="overflow-hidden rounded-2xl shadow-sm">
        <div className="h-40 bg-zinc-200 overflow-hidden">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition"/>
        </div>
        <CardContent className="p-4">
          <div className="font-semibold mb-1 flex items-center gap-2">{project.title}</div>
          <div className="text-sm text-zinc-600 flex items-center gap-2">
            <IndianRupee className="w-4 h-4"/> {project.price} • {project.topic}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProjectDetails() {
  const { topicSlug, projectSlug } = useParams();
  const topic = DATA.topics.find((t) => t.slug === topicSlug);
  const project = topic?.projects.find((p) => p.slug === projectSlug);
  const navigate = useNavigate();

  const purchases = storage.get("purchases", {});
  const owned = project ? Boolean(purchases[project.slug]) : false;

  if (!project) return <div>Project not found.</div>;

  const handleBuy = () => {
    // Placeholder checkout: Mark as purchased.
    const updated = { ...purchases, [project.slug]: true };
    storage.set("purchases", updated);
    alert("Payment simulation complete: ₹" + project.price + "\n(Integrate Razorpay/UPI for real payments.)");
    window.location.reload();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-10">
      <div>
        <h1 className="text-3xl font-extrabold mb-2">{project.title}</h1>
        <p className="text-zinc-700 mb-6">{project.description}</p>

        <h3 className="text-xl font-semibold mb-2">Tools included</h3>
        <ul className="list-disc pl-6 space-y-1 mb-6">
          {project.tools.map((t) => <li key={t}>{t}</li>)}
        </ul>

        <div className="rounded-xl border p-4">
          <h4 className="font-semibold mb-2">Download</h4>
          {owned ? (
            <a href={project.download} className="inline-flex items-center gap-2 text-white bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl">
              <Download className="w-4 h-4"/> Download ZIP
            </a>
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={handleBuy} className="inline-flex items-center gap-2">
                <ShoppingCart className="w-4 h-4"/> Buy & Download • <IndianRupee className="w-4 h-4"/> {project.price}
              </Button>
              <div className="text-xs text-zinc-600">Test purchase only. Add real payment gateway to charge ₹{project.price}.</div>
            </div>
          )}
        </div>

        <Button variant="secondary" className="mt-6" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="space-y-4">
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 text-sm text-zinc-700">Practice **only** inside a virtual machine or isolated lab network.</CardContent></Card>
        <GoogleAdSenseSlot />
      </div>
    </div>
  );
}

// -----------------------------
// AI Assistant + Dynamic Search with suggestions
// -----------------------------
function SiteSearch({ compact=false }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const allEntries = useMemo(() => {
    const topics = DATA.topics.map(t => ({ type: "topic", title: t.title, slug: t.slug }));
    const projects = DATA.topics.flatMap(t => t.projects.map(p => ({ type: "project", title: p.title, slug: `${t.slug}/${p.slug}` })));
    return [...topics, ...projects];
  }, []);

  const suggestions = useMemo(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return allEntries.filter(e => e.title.toLowerCase().includes(lower)).slice(0, 6);
  }, [q, allEntries]);

  const go = (e) => {
    e.preventDefault();
    if (suggestions[0]) {
      const s = suggestions[0];
      navigate(s.type === "topic" ? `/material/${s.slug}` : `/projects/${s.slug}`);
    } else if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={go} className={`flex items-center gap-2 ${compact ? '' : 'mb-2'}`}>
        <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search topics, projects..." className="w-full"/>
        <Button type="submit" variant="secondary"><Search className="w-4 h-4"/></Button>
      </form>
      {suggestions.length > 0 && (
        <div className="absolute z-40 mt-1 w-full rounded-xl border bg-white shadow">
          {suggestions.map((s) => (
            <button key={s.slug}
              onClick={() => navigate(s.type === "topic" ? `/material/${s.slug}` : `/projects/${s.slug}`)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2">
              <ArrowRight className="w-4 h-4"/> {s.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Assistant() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Ask about topics or projects. I can find materials and summarize." },
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const respond = (text) => {
    const db = DATA.topics;
    const foundTopic = db.find(t => t.title.toLowerCase().includes(text.toLowerCase()));
    const foundProj = db.flatMap(t=>t.projects.map(p=>({p, t}))).find(({p})=>p.title.toLowerCase().includes(text.toLowerCase()));

    let reply = "I searched your content: ";
    if (foundTopic) reply += `Found topic **${foundTopic.title}**.\nOpen: /material/${foundTopic.slug}`;
    else if (foundProj) reply += `Found project **${foundProj.p.title}**.\nOpen: /projects/${foundProj.t.slug}/${foundProj.p.slug}`;
    else reply += "No exact match. Try keywords like 'SQL Injection' or 'Login Bypass Lab'.";

    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: reply }]);
    setInput("");
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-8">
      <aside className="space-y-4">
        <Header title="AI Assistant" subtitle="Type to search and get directions to content." />
        <SiteSearch />
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-4 text-sm text-zinc-700">Tip: Ask for a topic name or project title.</CardContent></Card>
      </aside>
      <div className="rounded-2xl border bg-white">
        <div className="p-4 border-b flex items-center gap-2"><Bot className="w-4 h-4"/> Simple Assistant</div>
        <div className="p-4 space-y-4 max-h-[50vh] overflow-auto">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-xl ${m.role === 'assistant' ? 'bg-zinc-50' : 'bg-white border'}`}>
              <div className="prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(m.content) }} />
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <form onSubmit={(e)=>{e.preventDefault(); respond(input);}} className="flex items-center gap-2">
            <Input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask about topics/projects..."/>
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// About with Legal Notice + Comments (localStorage)
// -----------------------------
function About() {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(storage.get("comments", []));

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    const entry = { id: Date.now(), name: name.trim(), comment: comment.trim(), ts: new Date().toISOString() };
    const list = [entry, ...comments].slice(0, 100);
    setComments(list);
    storage.set("comments", list);
    setName(""); setComment("");
  };

  return (
    <div className="space-y-8">
      <Header title="About" subtitle="By Balkar Singh" />
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-zinc-800 leading-relaxed">
            I am **Balkar Singh** and I created this website for ethical hacking learners to understand concepts clearly.
            You'll find theory and practical projects to try **inside a virtual machine** at home.
          </p>
          <div className="rounded-xl border p-4 bg-white">
            <h3 className="font-semibold mb-2">Legal Notice</h3>
            <p className="text-sm text-zinc-700">
              This website is for **educational purposes** only. Use ethical hacking techniques in safe environments like
              virtual machines and isolated lab networks. **Do not** attempt to access or attack any system without
              the owner's explicit written consent. The author is not responsible for misuse.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white">
            <div className="p-4 border-b flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Comments</div>
            <div className="p-4 space-y-4 max-h-[40vh] overflow-auto">
              {comments.length === 0 && <div className="text-sm text-zinc-600">No comments yet. Be the first!</div>}
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-zinc-50">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-sm text-zinc-700 whitespace-pre-wrap">{c.comment}</div>
                  <div className="text-xs text-zinc-500 mt-1">{new Date(c.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <form onSubmit={submit} className="space-y-2">
                <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name"/>
                <textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Your comment" className="w-full border rounded-xl p-2 min-h-[90px]"></textarea>
                <div className="flex items-center gap-2">
                  <Button type="submit" className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Post</Button>
                  <Button type="button" variant="secondary" onClick={()=>{setName("");setComment("");}} className="inline-flex items-center gap-2"><X className="w-4 h-4"/> Clear</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Simple search results page (fallback)
// -----------------------------
function SearchResults() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const results = useMemo(() => {
    const lower = q.toLowerCase();
    const topics = DATA.topics.filter(t => t.title.toLowerCase().includes(lower));
    const projects = DATA.topics.flatMap(t => t.projects.map(p=>({p, t}))).filter(({p})=>p.title.toLowerCase().includes(lower));
    return { topics, projects };
  }, [q]);

  return (
    <div className="space-y-6">
      <Header title={`Search: ${q}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.topics.map(t => <TopicCard key={t.slug} topic={t} />)}
        {results.projects.map(({p, t}) => (
          <ProjectCard key={p.slug} project={{...p, topic: t.title, topicSlug: t.slug}} />
        ))}
      </div>
    </div>
  );
}

// -----------------------------
// App
// -----------------------------
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/material" element={<Material/>} />
          <Route path="/material/:slug" element={<TopicDetails/>} />
          <Route path="/projects" element={<Projects/>} />
          <Route path="/projects/:topicSlug/:projectSlug" element={<ProjectDetails/>} />
          <Route path="/assistant" element={<Assistant/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/search" element={<SearchResults/>} />
        </Routes>
      </Layout>
    </Router>
  );
}
