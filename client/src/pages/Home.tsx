import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Gauge,
  Inbox,
  Library,
  Menu,
  MessageCircleQuestion,
  MoreHorizontal,
  Paperclip,
  Play,
  Search,
  Settings,
  Sparkles,
  X,
  BrainCircuit,
} from "lucide-react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { fixtureLectureNote } from "@shared/lecture-fixture";
import { lessonPathSchema } from "@shared/lesson-path";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import RecallLab from "./RecallLab";

type View = "workspace" | "notebook" | "lectures" | "mps" | "mpsPath" | "recall" | "mastery" | "help" | "settings";

const navItems: Array<{ label: string; path: string; icon: typeof Library; view: View }> = [
  { label: "Workspace", path: "/", icon: Library, view: "workspace" },
  { label: "Notebook", path: "/notebooks", icon: BookOpen, view: "notebook" },
  { label: "Lectures", path: "/lectures", icon: Inbox, view: "lectures" },
  { label: "MPS", path: "/mps", icon: Sparkles, view: "mps" },
  { label: "Recall Lab", path: "/recall", icon: BrainCircuit, view: "recall" },
  { label: "Mastery", path: "/mastery", icon: Gauge, view: "mastery" },
];

function viewFromPath(path: string): View {
  if (path.startsWith("/notebooks")) return "notebook";
  if (path.startsWith("/lectures")) return "lectures";
  if (path.startsWith("/mps/path")) return "mpsPath";
  if (path.startsWith("/mps")) return "mps";
  if (path.startsWith("/recall")) return "recall";
  if (path.startsWith("/mastery")) return "mastery";
  if (path.startsWith("/help")) return "help";
  if (path.startsWith("/settings")) return "settings";
  return "workspace";
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, loading: authLoading, logout } = useAuth();
  const utils = trpc.useUtils();
  const sourcesQuery = trpc.lectureLens.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const notebooksQuery = trpc.notebooks.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const createSource = trpc.lectureLens.create.useMutation();
  const generateNotebook = trpc.lectureLens.generate.useMutation();
  const view = viewFromPath(location);
  const [sourceText, setSourceText] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [selectedSection, setSelectedSection] = useState(fixtureLectureNote.sections[0]?.id ?? "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reviewStarted, setReviewStarted] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<number[]>([]);
  const [activeReviewQuestion, setActiveReviewQuestion] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [challengeAdDismissed, setChallengeAdDismissed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readingRef = useRef<HTMLElement>(null);
  const activeSection = useMemo(
    () => fixtureLectureNote.sections.find(section => section.id === selectedSection) ?? fixtureLectureNote.sections[0],
    [selectedSection],
  );
  const searchMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return [fixtureLectureNote.title, ...fixtureLectureNote.sections.map(section => section.heading), ...fixtureLectureNote.keyTerms.map(term => term.term)].filter(item => item.toLowerCase().includes(query));
  }, [searchQuery]);

  if (authLoading) return <LoginPage loading />;
  if (!user) return <LoginPage />;

  function navigate(path: string) {
    setLocation(path);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }

  function handleFile(file?: File) {
    if (!file) return;
    const validType = file.name.endsWith(".txt") || file.name.endsWith(".md");
    if (!validType) {
      setSourceName("Only .txt and .md files are supported");
      return;
    }
    setSourceName(file.name);
    void file.text().then(setSourceText);
  }

  async function handleProcess() {
    if (!sourceText.trim()) return;
    setErrorMessage("");
    setIsProcessing(true);
    try {
      const created = await createSource.mutateAsync({
        title: sourceName.replace(/\.(txt|md)$/i, "") || "Untitled lecture",
        content: sourceText.trim(),
        sourceType: sourceName ? "text_file" : "pasted_text",
        ...(sourceName ? { fileName: sourceName } : {}),
        ...(sourceName ? { mimeType: "text/plain" } : {}),
      });
      await generateNotebook.mutateAsync({ sourceId: created.sourceId });
      await Promise.all([utils.lectureLens.list.invalidate(), utils.notebooks.list.invalidate()]);
      setSourceText("");
      setSourceName("");
      navigate("/notebooks");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Notebook generation failed. Your source is preserved for retry.");
    } finally {
      setIsProcessing(false);
    }
  }

  function startReview() {
    setReviewStarted(true);
    navigate("/mastery");
  }

  function scrollToReading() {
    navigate("/");
    window.setTimeout(() => readingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="synq-shell">
      <aside className={`synq-rail ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="brand-lockup">
          <img src="/synq-icon.png" alt="" className="brand-mark" />
          <div><div className="brand-name">synq</div><div className="brand-caption">learning workspace</div></div>
          <button className="close-menu" type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="rail-section-label">Navigate</div>
        <nav className="rail-nav" aria-label="Primary navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = view === item.view || (item.view === "mps" && view === "mpsPath");
            return <button className={`rail-link ${isActive ? "is-active" : ""}`} key={item.label} type="button" onClick={() => navigate(item.path)}><Icon size={16} strokeWidth={1.8} /><span>{item.label}</span>{isActive && <span className="active-dot" />}</button>;
          })}
        </nav>
        <div className="rail-bottom">
          <button className={`rail-link ${view === "help" ? "is-active" : ""}`} type="button" onClick={() => navigate("/help")}><MessageCircleQuestion size={16} /><span>Help & feedback</span></button>
          <button className="profile-chip" type="button" onClick={() => setProfileOpen(value => !value)}><div className="avatar">{initials(user.name ?? user.email ?? "Learner")}</div><div><strong>{user.name ?? "Learner"}</strong><span>{user.email ?? "Manus account"}</span></div><MoreHorizontal size={16} className="muted-icon" /></button>
          {profileOpen && <div className="profile-popover"><strong>{user.name ?? "Learner"}</strong><span>{user.email ?? "Signed in with Manus"}</span><button type="button" onClick={() => { setProfileOpen(false); navigate("/settings"); }}>Open settings <Settings size={13} /></button><button type="button" onClick={() => { setProfileOpen(false); void logout(); }}>Sign out <ArrowUpRight size={13} /></button></div>}
        </div>
      </aside>

      <main className="synq-main">
        <header className="topbar">
          <div className="mobile-brand"><img src="/synq-icon.png" alt="" className="brand-mark" /><span>synq</span></div>
          <div className="breadcrumb"><span>{view === "workspace" ? "Workspace" : view === "mpsPath" ? "MPS" : view[0].toUpperCase() + view.slice(1)}</span><ChevronRight size={14} /><strong>{view === "workspace" ? "Systems Thinking" : view === "mpsPath" ? "Learning path" : fixtureLectureNote.title}</strong></div>
          <div className="topbar-actions">
            {searchOpen ? <div className="search-box"><Search size={15} /><input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search notebooks" aria-label="Search notebooks" /><button type="button" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}><X size={14} /></button>{searchMatches.length > 0 && <div className="search-results">{searchMatches.map(match => <button key={match} type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); navigate("/notebooks"); }}>{match}<ArrowUpRight size={13} /></button>)}</div>}</div> : <button className="icon-button" type="button" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={17} /></button>}
            <button className="icon-button mobile-menu" type="button" aria-label="Menu" onClick={() => setMobileMenuOpen(true)}><Menu size={17} /></button>
          </div>
        </header>

        {view === "workspace" && !challengeAdDismissed && <LearningChallengeAd navigate={navigate} dismiss={() => setChallengeAdDismissed(true)} />}
        {view === "workspace" && <WorkspaceView sourceText={sourceText} setSourceText={setSourceText} sourceName={sourceName} isProcessing={isProcessing} fileInputRef={fileInputRef} handleFile={handleFile} handleProcess={handleProcess} selectedSection={selectedSection} setSelectedSection={setSelectedSection} activeSection={activeSection} readingRef={readingRef} navigate={navigate} scrollToReading={scrollToReading} sourceOpen={sourceOpen} setSourceOpen={setSourceOpen} startReview={startReview} errorMessage={errorMessage} authLoading={authLoading} userName={user?.name ?? "learner"} latestNotebookCount={notebooksQuery.data?.length ?? 0} />}
        {view === "notebook" && <NotebookView selectedSection={selectedSection} setSelectedSection={setSelectedSection} activeSection={activeSection} readingRef={readingRef} navigate={navigate} notebooks={notebooksQuery.data ?? []} />}
        {view === "lectures" && <LecturesView navigate={navigate} sources={sourcesQuery.data ?? []} />}
        {view === "mps" && <MPSView navigate={navigate} />}
        {view === "mpsPath" && <MPSPathView navigate={navigate} notebookId={Number(location.split("/").pop())} />}
        {view === "recall" && <RecallLab />}
        {view === "mastery" && <MasteryView reviewStarted={reviewStarted} setReviewStarted={setReviewStarted} activeReviewQuestion={activeReviewQuestion} setActiveReviewQuestion={setActiveReviewQuestion} checkedQuestions={checkedQuestions} setCheckedQuestions={setCheckedQuestions} />}
        {view === "help" && <HelpView navigate={navigate} />}
        {view === "settings" && <SettingsView navigate={navigate} userName={user.name ?? "Learner"} userEmail={user.email ?? "Manus account"} />}
      </main>
    </div>
  );
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "L";
}

function LoginPage({ loading = false }: { loading?: boolean }) {
  return <main className="login-page"><div className="login-card"><img src="/synq-icon.png" alt="" className="login-mark" /><span className="eyebrow">Synq learning workspace</span><h1>Your next learning path starts here.</h1><p>Sign in with your Manus account to create private notebooks, generate MPS adventures, and keep your progress in one place.</p>{loading ? <div className="login-loading"><span className="button-spinner" /> Checking your session…</div> : <button className="primary-button login-button" type="button" onClick={() => startLogin()}>Continue with Manus <ArrowUpRight size={16} /></button>}<small>Synq never uses a shared demo profile. Your workspace belongs to your account.</small></div></main>;
}

const mpsAdventureStages = [
  { number: "01", title: "Build intuition", detail: "Meet the big idea through a simple explanation." },
  { number: "02", title: "Make connections", detail: "Link the idea to examples and nearby concepts." },
  { number: "03", title: "Practice recall", detail: "Answer a quick check so it sticks." },
  { number: "04", title: "Keep the skill", detail: "Leave with a notebook and a next review." },
];

function MPSPathView({ navigate, notebookId }: { navigate: (path: string) => void; notebookId: number }) {
  const notebookQuery = trpc.notebooks.get.useQuery({ id: notebookId }, { enabled: Number.isInteger(notebookId) && notebookId > 0, retry: false });
  const [activeNodeId, setActiveNodeId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const path = lessonPathSchema.safeParse(notebookQuery.data?.lessonPath).success ? lessonPathSchema.parse(notebookQuery.data?.lessonPath) : null;
  if (notebookQuery.isLoading) return <div className="mps-path-loading"><span className="button-spinner" /> Planning your learning path…</div>;
  if (!path) return <div className="mps-path-error"><Sparkles size={22} /><h1>Your path is still being prepared.</h1><p>Return to MPS and start another topic if this notebook was created before lesson paths were enabled.</p><button className="primary-button" type="button" onClick={() => navigate("/mps")}>Back to MPS</button></div>;
  const answerFor = (nodeId: string) => answers[nodeId];
  return <div className="mps-path-page"><div className="mps-path-header"><div><span className="eyebrow">Master Pedagogy Studio · your path</span><h1>{path.title}</h1><p>{path.overview}</p></div><div className="mps-path-header-actions"><span className="mps-time"><Clock3 size={14} /> {path.estimatedMinutes} min adventure</span><button className="secondary-button" type="button" onClick={() => navigate("/mps")}>New topic</button></div></div><div className="mps-path-layout"><main className="mps-units">{path.units.map(unit => <section className="mps-unit" key={unit.id}><div className="mps-unit-heading"><div><span className="mps-unit-label">UNIT {String(unit.position).padStart(2, "0")}</span><h2>{unit.title}</h2><p>{unit.subtitle}</p></div><span className="unit-toggle">⌃</span></div><div className="mps-node-list">{unit.nodes.map((node, nodeIndex) => { const isUnlocked = node.status !== "locked" || nodeIndex === 0; const isActive = activeNodeId === node.id; return <div className={`mps-node-wrap ${isActive ? "is-active" : ""}`} key={node.id}><button className={`mps-node ${isUnlocked ? "is-unlocked" : "is-locked"}`} type="button" disabled={!isUnlocked} onClick={() => setActiveNodeId(isActive ? "" : node.id)}><span className="mps-node-orb">{node.status === "complete" ? <Check size={14} /> : isUnlocked ? <span>{nodeIndex + 1}</span> : <Clock3 size={13} />}</span><span className="mps-node-copy"><strong>{node.title}</strong><small>{node.subtitle} · {node.durationMinutes} min</small></span><ChevronRight size={15} /></button>{isActive && <div className="mps-node-content"><span className="eyebrow">{node.kind === "practice" ? "Interactive check" : node.kind === "challenge" ? "Use the idea" : "Lesson"}</span><h3>{node.prompt}</h3>{node.options && <div className="mps-options">{node.options.map(option => <button className={answerFor(node.id) === option ? "is-selected" : ""} key={option} type="button" onClick={() => setAnswers(current => ({ ...current, [node.id]: option }))}>{option}{answerFor(node.id) === option && <Check size={14} />}</button>)}</div>}{node.kind !== "lesson" && answerFor(node.id) && <p className="mps-feedback"><Check size={14} /> Saved. Your next step will unlock when this check is complete.</p>}</div>}</div>; })}</div></section>)}</main><aside className="mps-path-aside"><div className="utility-card"><div className="utility-title"><span>Adventure progress</span><span className="count-badge">0%</span></div><div className="mps-progress-track"><span /></div><p className="utility-copy">Complete each node in order. Short lessons unlock the next useful step without overwhelming you.</p></div><div className="utility-card"><div className="utility-title"><span>Path rules</span><Sparkles size={15} /></div><div className="path-rule"><Check size={13} /> Explain before memorizing</div><div className="path-rule"><Check size={13} /> Practice after every idea</div><div className="path-rule"><Check size={13} /> Keep uncertainty visible</div></div></aside></div></div>;
}

function MPSView({ navigate }: { navigate: (path: string) => void }) {
  const [topic, setTopic] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const createSource = trpc.lectureLens.create.useMutation();
  const generateNotebook = trpc.lectureLens.generate.useMutation();
  const utils = trpc.useUtils();
  const examples = ["Quantum physics", "How AI works", "Stoic philosophy", "The Roman Empire"];

  async function startAdventure() {
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;
    setError("");
    setIsStarting(true);
    try {
      const created = await createSource.mutateAsync({
        title: `${cleanTopic} adventure`,
        content: `Create a complete beginner-friendly learning adventure about ${cleanTopic}. Start with intuition, then explain the core concepts, examples, relationships, common mistakes, and short recall questions. The learner wants a structured path they can understand and revisit.`,
        sourceType: "pasted_text",
      });
      const generated = await generateNotebook.mutateAsync({ sourceId: created.sourceId });
      await utils.notebooks.list.invalidate();
      await utils.lectureLens.list.invalidate();
      navigate(`/mps/path/${generated.notebookId}`);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Your adventure could not start yet. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  return <div className="mps-page"><section className="mps-hero"><div className="mps-hero-copy"><span className="eyebrow">Master Pedagogy Studio</span><h1>What do you want to learn?</h1><p>Type any topic and Synq will turn it into a guided adventure: small steps, useful examples, and a quick practice loop.</p><div className="mps-input-wrap"><Sparkles size={18} /><input value={topic} onChange={event => setTopic(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void startAdventure(); }} placeholder="e.g. how neural networks learn" aria-label="Topic to learn" /><button className="mps-start" type="button" disabled={!topic.trim() || isStarting} onClick={() => void startAdventure()}>{isStarting ? "Building…" : "Start adventure"}<ArrowUpRight size={15} /></button></div>{error && <p className="mps-error" role="alert">{error}</p>}<div className="mps-examples"><span>Try a topic</span>{examples.map(example => <button key={example} type="button" onClick={() => setTopic(example)}>{example}</button>)}</div></div><div className="mps-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><Sparkles size={29} /></div><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-dot dot-three" /></div></section><section className="mps-adventure"><div className="mps-section-heading"><div><span className="eyebrow">Your learning path</span><h2>Every topic becomes an adventure.</h2></div><span className="mps-time"><Clock3 size={14} /> 3–10 min steps</span></div><div className="mps-stage-grid">{mpsAdventureStages.map((stage, index) => <article className={`mps-stage ${index === 0 ? "is-first" : ""}`} key={stage.number}><span className="mps-stage-number">{stage.number}</span><div className="mps-stage-icon">{index === 0 ? <Sparkles size={18} /> : index === 1 ? <ArrowUpRight size={18} /> : index === 2 ? <MessageCircleQuestion size={18} /> : <Check size={18} />}</div><h3>{stage.title}</h3><p>{stage.detail}</p>{index < mpsAdventureStages.length - 1 && <ChevronRight className="mps-stage-arrow" size={18} />}</article>)}</div></section><section className="mps-bottom-grid"><article className="mps-promise"><span className="eyebrow">Not a lecture dump</span><h2>Learn the why, not just the words.</h2><p>Synq adapts each path to the topic with explanations, comparisons, examples, misconceptions, and moments where you have to retrieve the idea yourself.</p><button className="secondary-button" type="button" onClick={() => navigate("/mastery")}>See the practice loop <ArrowUpRight size={14} /></button></article><aside className="mps-streak"><div className="streak-badge">+1</div><span className="eyebrow">Keep your momentum</span><h3>One curious question is enough to begin.</h3><p>Come back tomorrow and Synq will know where to take you next.</p></aside></section></div>;
}

function LearningChallengeAd({ navigate, dismiss }: { navigate: (path: string) => void; dismiss: () => void }) {
  return <section className="learning-challenge" aria-label="Synq learning challenge"><div className="challenge-mascot" aria-hidden="true"><span className="mascot-eye left" /><span className="mascot-eye right" /><span className="mascot-smile" /></div><div className="challenge-copy"><span className="challenge-kicker">A tiny win counts</span><h2>Turn one idea into a 3-minute lesson.</h2><p>Build a quick learning streak: understand it, explain it, remember it.</p><div className="challenge-meta"><span>+10 focus points</span><span>1 quick recall</span><span>0 busywork</span></div></div><div className="challenge-actions"><button className="challenge-start" type="button" onClick={() => { navigate("/"); window.setTimeout(() => document.getElementById("intake-title")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60); }}>Start a sprint <ArrowUpRight size={15} /></button><button className="challenge-dismiss" type="button" aria-label="Dismiss learning challenge" onClick={dismiss}><X size={15} /></button></div></section>;
}

type WorkspaceProps = {
  sourceText: string; setSourceText: (text: string) => void; sourceName: string; isProcessing: boolean; fileInputRef: React.RefObject<HTMLInputElement | null>; handleFile: (file?: File) => void; handleProcess: () => void; selectedSection: string; setSelectedSection: (id: string) => void; activeSection: typeof fixtureLectureNote.sections[number] | undefined; readingRef: React.RefObject<HTMLElement | null>; navigate: (path: string) => void; scrollToReading: () => void; sourceOpen: boolean; setSourceOpen: (open: boolean) => void; startReview: () => void; errorMessage: string; authLoading: boolean; userName: string; latestNotebookCount: number;
};

function WorkspaceView(props: WorkspaceProps) {
  const { sourceText, setSourceText, sourceName, isProcessing, fileInputRef, handleFile, handleProcess, selectedSection, setSelectedSection, activeSection, readingRef, navigate, scrollToReading, sourceOpen, setSourceOpen, startReview, errorMessage, authLoading, userName, latestNotebookCount } = props;
  return <div className="workspace-grid"><section className="content-column"><div className="welcome-row"><div><p className="eyebrow">Wednesday, September 30</p><h1>Make sense of the next thing, {userName}.</h1><p className="lede">Bring a lecture, question, or rough note. Synq turns it into a learning path you can return to.</p></div><div className="signal-badge"><span className="signal-pulse" /> {authLoading ? "Connecting" : "Synq cloud"}</div></div><section className="intake-card" aria-labelledby="intake-title"><div className="card-heading"><div><p className="eyebrow">Start a source</p><h2 id="intake-title">What are you learning today?</h2></div><Sparkles size={20} className="lime-icon" /></div><textarea value={sourceText} onChange={event => setSourceText(event.target.value)} placeholder="Paste lecture text here…" aria-label="Lecture text" />
    <div className="intake-footer"><div className="input-meta"><button className="attach-button" type="button" onClick={() => fileInputRef.current?.click()}><Paperclip size={15} /> Attach .txt or .md</button><input ref={fileInputRef} type="file" accept=".txt,.md,text/plain,text/markdown" hidden onChange={event => handleFile(event.target.files?.[0])} />{sourceName && <span className="file-name"><FileText size={14} />{sourceName}</span>}</div><button className="primary-button" type="button" disabled={!sourceText.trim() || isProcessing} onClick={handleProcess}>{isProcessing ? <><span className="button-spinner" /> Generating</> : <><Play size={15} fill="currentColor" /> Build notebook</>}</button></div>{isProcessing && <div className="processing-line"><span className="signal-pulse" /> Source saved. Master Pedagogy is validating your learning notebook.</div>}{errorMessage && <div className="processing-line error-line" role="alert">{errorMessage}</div>}</section><div className="section-heading"><div><p className="eyebrow">Continue learning</p><h2>Your notebook</h2></div><button className="text-button" type="button" onClick={() => navigate("/notebooks")}>Open library <ArrowUpRight size={14} /></button></div><NotebookCard selectedSection={selectedSection} setSelectedSection={setSelectedSection} scrollToReading={scrollToReading} latestNotebookCount={latestNotebookCount} /><section className="reading-card" ref={readingRef}>{activeSection && <ReadingSection activeSection={activeSection} />}</section></section><UtilityColumn sourceOpen={sourceOpen} setSourceOpen={setSourceOpen} navigate={navigate} startReview={startReview} /></div>;
}

function NotebookCard({ selectedSection, setSelectedSection, scrollToReading, latestNotebookCount }: { selectedSection: string; setSelectedSection: (id: string) => void; scrollToReading: () => void; latestNotebookCount: number }) {
  return <article className="notebook-card"><div className="notebook-overview"><div className="notebook-kicker"><span className="status-chip"><Check size={12} /> {latestNotebookCount > 0 ? `${latestNotebookCount} saved` : "Demo ready"}</span><span>{latestNotebookCount > 0 ? "Synced to your workspace" : "Start with a source above"}</span></div><h2>{fixtureLectureNote.title}</h2><p>{fixtureLectureNote.overview}</p><div className="progress-line"><span /><span /><span /><span /><span /></div><div className="notebook-footer"><span><BookOpen size={14} /> {fixtureLectureNote.sections.length} sections</span><span><MessageCircleQuestion size={14} /> {fixtureLectureNote.reviewQuestions.length} review prompts</span><button className="read-button" type="button" onClick={scrollToReading}>Read notebook <ChevronRight size={15} /></button></div></div><div className="section-index"><span className="index-label">In this notebook</span>{fixtureLectureNote.sections.map((section, index) => <button key={section.id} className={`index-item ${selectedSection === section.id ? "is-selected" : ""}`} type="button" onClick={() => setSelectedSection(section.id)}><span>0{index + 1}</span><strong>{section.heading}</strong><small>{section.timeStart}</small></button>)}</div></article>;
}

function ReadingSection({ activeSection }: { activeSection: typeof fixtureLectureNote.sections[number] }) {
  return <><div className="reading-header"><div><span className="section-number">SECTION {String(fixtureLectureNote.sections.indexOf(activeSection) + 1).padStart(2, "0")}</span><h2>{activeSection.heading}</h2></div><span className="timestamp">{activeSection.timeStart} — {activeSection.timeEnd}</span></div><p className="reading-copy">{activeSection.explanation}</p><div className="reading-columns"><div><h3>Key points</h3><ul>{activeSection.keyPoints.map(point => <li key={point}>{point}</li>)}</ul></div><div><h3>Terms to keep</h3>{activeSection.definitions.length > 0 ? activeSection.definitions.map(definition => <div className="term-row" key={definition.term}><strong>{definition.term}</strong><span>{definition.meaning}</span></div>) : <p className="empty-copy">No new terms in this section.</p>}</div></div></>;
}

function UtilityColumn({ sourceOpen, setSourceOpen, navigate, startReview }: { sourceOpen: boolean; setSourceOpen: (open: boolean) => void; navigate: (path: string) => void; startReview: () => void }) {
  return <aside className="utility-column"><div className="utility-card source-card"><div className="utility-title"><span>Source context</span><MoreHorizontal size={16} /></div><div className="source-file"><div className="source-icon"><FileText size={17} /></div><div><strong>systems-thinking.md</strong><span>Text source · 34 min</span></div></div><div className="source-rule" /><div className="utility-title"><span>Current signal</span><span className="tiny-live"><span className="signal-pulse" /> live</span></div><p className="utility-copy">The notebook is rendered from a validated structured fixture. Every section, visual, and transcript line keeps a stable source link.</p><button className="secondary-button" type="button" onClick={() => setSourceOpen(!sourceOpen)}>Review source <ArrowUpRight size={14} /></button>{sourceOpen && <div className="source-detail"><span className="eyebrow">Source record</span><strong>systems-thinking.md</strong><p>4 transcript anchors · 2 linked visuals · uncertainty preserved at 00:31:44.</p><button className="text-button" type="button" onClick={() => navigate("/lectures")}>Open lecture record <ArrowUpRight size={14} /></button></div>}</div><div className="utility-card objective-card"><div className="utility-title"><span>Learning objectives</span><span className="count-badge">{fixtureLectureNote.learningObjectives.length}</span></div><ol>{fixtureLectureNote.learningObjectives.map((objective, index) => <li key={objective}><span>0{index + 1}</span>{objective}</li>)}</ol></div><div className="utility-card review-card"><div className="review-icon"><MessageCircleQuestion size={18} /></div><div><span className="eyebrow">Next useful action</span><h3>Check your recall</h3><p>Three short prompts are ready when you are.</p><button className="text-button" type="button" onClick={startReview}>Start review <ArrowUpRight size={14} /></button></div></div></aside>;
}

function NotebookView({ selectedSection, setSelectedSection, activeSection, readingRef, navigate, notebooks }: { selectedSection: string; setSelectedSection: (id: string) => void; activeSection: typeof fixtureLectureNote.sections[number] | undefined; readingRef: React.RefObject<HTMLElement | null>; navigate: (path: string) => void; notebooks: Array<{ id: number; title: string; status: string; version: number }> }) {
  return <div className="subpage-grid"><section className="content-column"><SubpageIntro eyebrow="Notebook library" title="Your learning, in one place." description="Structured notes stay readable, source-aware, and ready for the next review." action={<button className="primary-button" type="button" onClick={() => navigate("/")}><ArrowLeft size={15} /> Add a source</button>} /><div className="library-list">{notebooks.map(notebook => <button className="library-row is-current" type="button" key={notebook.id} onClick={() => navigate(`/notebooks/${notebook.id}`)}><div className="library-icon"><BookOpen size={18} /></div><div><strong>{notebook.title}</strong><span>Saved notebook · version {notebook.version}</span></div><span className="library-status">{notebook.status}</span><ChevronRight size={16} /></button>)}<button className="library-row" type="button" onClick={() => setSelectedSection(fixtureLectureNote.sections[0]?.id ?? "")}><div className="library-icon"><BookOpen size={18} /></div><div><strong>{fixtureLectureNote.title}</strong><span>{fixtureLectureNote.course} · demo notebook</span></div><span className="library-status">Demo</span><ChevronRight size={16} /></button>{notebooks.length === 0 && <div className="empty-library"><Sparkles size={19} /><strong>Build your first notebook</strong><span>Paste or upload a lecture from Workspace to create a saved learning path.</span><button className="text-button" type="button" onClick={() => navigate("/")}>Go to Workspace <ArrowUpRight size={14} /></button></div>}</div><section className="reading-card" ref={readingRef}>{activeSection && <ReadingSection activeSection={activeSection} />}</section></section><aside className="utility-column"><div className="utility-card"><div className="utility-title"><span>Notebook health</span><Check size={15} /></div><div className="health-number">92<span>%</span></div><p className="utility-copy">All sections pass the current LectureNote contract. One uncertain item remains visible for review.</p><button className="secondary-button" type="button" onClick={() => navigate("/mastery")}>Open mastery <ArrowUpRight size={14} /></button></div><div className="utility-card objective-card"><div className="utility-title"><span>Key terms</span><span className="count-badge">{fixtureLectureNote.keyTerms.length}</span></div>{fixtureLectureNote.keyTerms.map(term => <div className="term-row" key={term.term}><strong>{term.term}</strong><span>{term.meaning}</span></div>)}</div></aside></div>;
}

function LecturesView({ navigate, sources }: { navigate: (path: string) => void; sources: Array<{ id: number; title: string; sourceType: string; status: string; fileName: string | null }> }) {
  return <div className="subpage-grid"><section className="content-column"><SubpageIntro eyebrow="Lecture Lens" title="Your source records." description="Keep the original text, timestamps, and uncertainty close to the notebook they shaped." action={<button className="primary-button" type="button" onClick={() => navigate("/")}><Paperclip size={15} /> Add transcript</button>} /><div className="source-record-card">{sources.map(source => <div className="source-record-heading" key={source.id}><div className="source-icon"><FileText size={19} /></div><div><span className="status-chip"><Check size={12} /> {source.status}</span><h2>{source.fileName ?? source.title}</h2><p>{source.sourceType.replace("_", " ")} · saved to your workspace</p></div></div>)}{sources.length === 0 && <div className="empty-library"><Sparkles size={19} /><strong>No source records yet</strong><span>Build a notebook from pasted text or a .txt/.md upload.</span><button className="text-button" type="button" onClick={() => navigate("/")}>Add your first source <ArrowUpRight size={14} /></button></div>}<div className="record-stats"><div><strong>{sources.length}</strong><span>saved sources</span></div><div><strong>TXT</strong><span>supported now</span></div><div><strong>AI</strong><span>validated generation</span></div></div></div></section><aside className="utility-column"><div className="utility-card"><div className="utility-title"><span>Processing state</span><span className="tiny-live"><span className="signal-pulse" /> live</span></div><div className="state-step done"><Check size={13} /> Source record created</div><div className="state-step done"><Check size={13} /> Ownership verified</div><div className="state-step current"><Clock3 size={13} /> Master Pedagogy validates output</div></div><div className="utility-card"><div className="utility-title"><span>Source privacy</span><CircleHelp size={15} /></div><p className="utility-copy">Your source stays attached to your account and is never sent to the browser as a public asset.</p></div></aside></div>;
}

function MasteryView({ reviewStarted, setReviewStarted, activeReviewQuestion, setActiveReviewQuestion, checkedQuestions, setCheckedQuestions }: { reviewStarted: boolean; setReviewStarted: (started: boolean) => void; activeReviewQuestion: number; setActiveReviewQuestion: (index: number) => void; checkedQuestions: number[]; setCheckedQuestions: (questions: number[]) => void }) {
  const questions = fixtureLectureNote.reviewQuestions;
  const checked = checkedQuestions.includes(activeReviewQuestion);
  return <div className="subpage-grid"><section className="content-column"><SubpageIntro eyebrow="Synq Mastery" title="Practice what you just learned." description="A transparent review loop: answer, check your understanding, and return to the source when something feels uncertain." action={<span className="signal-badge"><span className="signal-pulse" /> {checkedQuestions.length}/{questions.length} checked</span>} /><div className="mastery-hero"><div className="mastery-score"><span className="eyebrow">Notebook readiness</span><strong>68<span>%</span></strong><p>Good foundation · 3 concepts ready for retrieval</p></div><div className="mastery-bars"><div><span>Feedback loops</span><i style={{ width: "82%" }} /></div><div><span>Interventions</span><i style={{ width: "61%" }} /></div><div><span>Uncertainty handling</span><i style={{ width: "45%" }} /></div></div></div><div className="review-panel"><div className="review-panel-heading"><div><span className="eyebrow">Knowledge check {activeReviewQuestion + 1} of {questions.length}</span><h2>{questions[activeReviewQuestion]}</h2></div><MessageCircleQuestion size={22} className="lime-icon" /></div>{reviewStarted || checkedQuestions.length > 0 ? <><textarea placeholder="Write a short answer in your own words…" aria-label="Knowledge check answer" /><div className="review-actions"><button className={`secondary-button ${checked ? "is-checked" : ""}`} type="button" onClick={() => { if (!checked) setCheckedQuestions([...checkedQuestions, activeReviewQuestion]); }}>{checked ? <><Check size={14} /> Checked</> : "Mark as understood"}</button><button className="primary-button" type="button" disabled={activeReviewQuestion >= questions.length - 1} onClick={() => setActiveReviewQuestion(activeReviewQuestion + 1)}>Next prompt <ChevronRight size={14} /></button></div></> : <div className="review-start"><p>Start with a one-minute recall. There is no score yet—just a place to make your understanding visible.</p><button className="primary-button" type="button" onClick={() => { setReviewStarted(true); setActiveReviewQuestion(0); }}>Begin review <Play size={14} fill="currentColor" /></button></div>}</div></section><aside className="utility-column"><div className="utility-card"><div className="utility-title"><span>Review rhythm</span><Gauge size={15} /></div><div className="streak-number">02 <span>sessions this week</span></div><div className="mini-calendar"><span className="is-done">M</span><span className="is-done">T</span><span>W</span><span>Th</span><span>F</span></div><p className="utility-copy">Short, frequent retrieval beats one long reread. Come back when the next prompt is due.</p></div><div className="utility-card"><div className="utility-title"><span>Review map</span></div>{questions.map((question, index) => <button className={`review-map-row ${activeReviewQuestion === index ? "is-active" : ""}`} type="button" key={question} onClick={() => { setReviewStarted(true); setActiveReviewQuestion(index); }}><span>0{index + 1}</span><strong>{question}</strong>{checkedQuestions.includes(index) && <Check size={13} />}</button>)}</div></aside></div>;
}

function HelpView({ navigate }: { navigate: (path: string) => void }) {
  return <div className="subpage-grid"><section className="content-column"><SubpageIntro eyebrow="Help & feedback" title="A calmer way to learn." description="Synq keeps the source, the explanation, and the next useful action connected. Here are the essentials for this first slice." action={<button className="secondary-button" type="button" onClick={() => navigate("/")}><ArrowLeft size={14} /> Back to Workspace</button>} /><div className="help-grid">{[["How intake works", "Paste text or attach a .txt/.md file. The source record stays visible while the notebook is prepared."], ["Why is this a fixture?", "This stage validates the browser contract and rendering. Provider-backed Master Pedagogy generation is the next stage."], ["Where does uncertainty go?", "Uncertain claims stay in the notebook’s uncertainty lane rather than being silently filled in."], ["Need to say something?", "Send feedback through the next product handoff; this panel is the place to record the question you want answered."]].map(([title, body]) => <article className="help-card" key={title}><CircleHelp size={17} /><h3>{title}</h3><p>{body}</p><button className="text-button" type="button" onClick={() => navigate("/")}>Return to workspace <ArrowUpRight size={14} /></button></article>)}</div></section></div>;
}

function SettingsView({ navigate, userName, userEmail }: { navigate: (path: string) => void; userName: string; userEmail: string }) {
  return <div className="subpage-grid"><section className="content-column"><SubpageIntro eyebrow="Personal space" title="Settings that stay simple." description="The first slice keeps the focus on your notebook and source. These preferences are ready for the next connected stage." action={<button className="secondary-button" type="button" onClick={() => navigate("/")}><ArrowLeft size={14} /> Back to Workspace</button>} /><div className="settings-card"><div className="settings-row"><div><strong>Source retention</strong><span>Keep source text with the notebook until you delete it.</span></div><span className="toggle is-on">On</span></div><div className="settings-row"><div><strong>Uncertainty reminders</strong><span>Keep uncertain items visible in the notebook and review flow.</span></div><span className="toggle is-on">On</span></div><div className="settings-row"><div><strong>Generation provider</strong><span>Server-side provider configuration will be connected in the next stage.</span></div><span className="settings-status">Not connected</span></div></div></section><aside className="utility-column"><div className="utility-card"><div className="utility-title"><span>Account</span><Settings size={15} /></div><div className="account-card"><div className="avatar">{initials(userName)}</div><div><strong>{userName}</strong><span>{userEmail}</span></div></div><button className="secondary-button" type="button" onClick={() => navigate("/help")}>Need help? <ArrowUpRight size={14} /></button></div></aside></div>;
}

function SubpageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action: React.ReactNode }) {
  return <div className="subpage-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></div>{action}</div>;
}
