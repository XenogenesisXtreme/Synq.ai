import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fixtureLecture } from './lib/fixture';
import { parseLectureNote } from './lib/lecture';
import './styles.css';

const note = parseLectureNote(fixtureLecture);
const STORAGE_KEY = 'synq.workspace.source';

function Icon({ children }: { children: React.ReactNode }) { return <span className="nav-icon" aria-hidden="true">{children}</span>; }

function App() {
  const [source, setSource] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [activeTab, setActiveTab] = useState('Workspace');
  const [notice, setNotice] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, source); }, [source]);
  const announce = (message: string) => setNotice(message);
  const handleBuild = () => announce(source.trim() ? 'Source saved locally. Server generation will begin when Supabase and provider credentials are connected.' : 'Add a lecture, question, or rough note to begin.');
  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) { announce('Please choose a .txt or .md file.'); return; }
    setSource(await file.text()); announce(`${file.name} loaded into the source composer.`); event.target.value = '';
  };
  const openReview = () => setShowReview(true);
  const nav = (item: string) => { setActiveTab(item); announce(item === 'Workspace' ? 'Workspace selected.' : `${item} is ready for the next release slice.`); };

  return <div className="app-shell">
    <aside className="sidebar"><div className="wordmark"><span className="wordmark-symbol">◔</span><div><strong>synq</strong><small>LEARNING WORKSPACE</small></div></div><div className="sidebar-section-label">NAVIGATE</div><nav className="side-nav" aria-label="Workspace navigation">{['Workspace','Notebook','Lectures','Mastery'].map((item,index)=><button key={item} className={activeTab===item?'active':''} onClick={()=>nav(item)}><Icon>{['⌁','▤','▱','◔'][index]}</Icon><span>{item}</span>{item==='Workspace'&&<i/>}</button>)}</nav><div className="sidebar-footer"><button onClick={()=>announce('Feedback capture will be connected to the support route before release.')}><Icon>?</Icon>Help & feedback</button><div className="account"><span>JR</span><div><strong>Jordan R.</strong><small>Personal space</small></div><b>⌄</b></div></div></aside>
    <main className="content"><header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>›</b><strong>{activeTab === 'Workspace' ? 'Systems Thinking' : activeTab}</strong></div><div className="search-wrap">{showSearch&&<input autoFocus value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search notebook" aria-label="Search notebook"/>}<button className="search-button" aria-label="Search" onClick={()=>setShowSearch(value=>!value)}>⌕</button></div></header><div className="page-wrap">
      {notice&&<div className="toast" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss">×</button></div>}
      <section className="hero"><div><p className="date-label">WEDNESDAY, SEPTEMBER 30</p><h1>Make sense of the next thing.</h1><p className="hero-copy">Bring a lecture, question, or rough note. Synq turns it into a learning path you can return to.</p></div><span className="fixture-pill"><i/> Fixture workspace</span></section>
      <div className="dashboard-grid"><div className="primary-column"><section className="source-card card"><div className="card-heading"><div><p className="eyebrow">START A SOURCE</p><h2>What are you learning today?</h2></div><span className="sparkle">✣</span></div><textarea value={source} onChange={event=>setSource(event.target.value)} placeholder="Paste lecture text here…" aria-label="Lecture text"/><input ref={fileRef} type="file" accept=".txt,.md,text/plain,text/markdown" hidden onChange={handleFile}/><div className="source-actions"><button className="attach-button" onClick={()=>fileRef.current?.click()}>⌕ <span>Attach .txt or .md</span></button><button className="build-button" onClick={handleBuild}>✦ <span>Build notebook</span></button></div></section>
        <section className="continue-section"><div className="section-title-row"><div><p className="eyebrow">CONTINUE LEARNING</p><h2>Your notebook</h2></div><button className="library-button" onClick={()=>setShowLibrary(true)}>Open library <span>↗</span></button></div><article className="notebook-card card"><div className="notebook-main"><div className="ready-label"><i/> FIXTURE READY <span>Updated just now</span></div><h3>{note.title}</h3><p>{note.overview}</p><div className="notebook-meta"><span>{note.sections.length} sections</span><span>{note.reviewQuestions.length} review prompts</span></div><button className="read-button" onClick={()=>document.getElementById(note.sections[0].id)?.scrollIntoView({behavior:'smooth'})}>Read notebook <span>↗</span></button></div><div className="notebook-outline"><p className="eyebrow">IN THIS NOTEBOOK</p>{note.sections.map((section,index)=><a href={'#'+section.id} key={section.id}><strong>0{index+1}</strong><span>{section.heading}<small>{section.timeStart}</small></span></a>)}</div></article></section>
        <section className="lesson card" id={note.sections[0].id}><div className="lesson-heading"><div><p className="eyebrow">SECTION 01</p><h2>{note.sections[0].heading}</h2><span className="timecode">{note.sections[0].timeStart} — {note.sections[0].timeEnd}</span></div><button className="more-button" onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded}>•••</button></div><p className="lesson-copy">{note.sections[0].explanation}</p>{expanded&&<div className="expanded-note">{note.sections[0].whyItMatters}</div>}<div className="lesson-columns"><div><p className="eyebrow">KEY POINTS</p>{note.sections[0].keyPoints.map(point=><div className="key-point" key={point}><i>↗</i>{point}</div>)}</div><div><p className="eyebrow">TERMS TO KEEP</p>{note.sections[0].definitions.map(definition=><div className="term" key={definition.term}><strong>{definition.term}</strong><span>{definition.meaning}</span></div>)}</div></div></section>
      </div><aside className="right-column"><section className="side-card card"><div className="side-card-heading"><p className="eyebrow">SOURCE CONTEXT</p><button onClick={()=>announce('Source actions will include export and deletion controls in the release settings flow.')}>•••</button></div><div className="file-row"><span className="file-icon">▤</span><div><strong>systems-thinking.md</strong><small>Text source · 34 min</small></div></div><div className="signal"><p className="eyebrow">CURRENT SIGNAL <span><i/> live</span></p><p>The notebook is rendered from a validated structured fixture. Every section, visual, and transcript line keeps a stable source link.</p></div><button className="review-source" onClick={()=>announce('Source context is ready for review.')}>Review source <span>↗</span></button></section><section className="side-card card objectives"><div className="objectives-title"><p className="eyebrow">LEARNING OBJECTIVES</p><b>{note.learningObjectives.length}</b></div>{note.learningObjectives.map((objective,index)=><div className="objective" key={objective}><strong>0{index+1}</strong><span>{objective}</span></div>)}</section><section className="next-action"><p className="eyebrow">NEXT USEFUL ACTION</p><h3>Check your recall</h3><p>Three short prompts are ready when you are.</p><button className="start-review" onClick={openReview}>Start review <span>→</span></button></section></aside></div>
      </div></main>
    {showLibrary&&<div className="modal-backdrop" onClick={()=>setShowLibrary(false)}><section className="modal" onClick={event=>event.stopPropagation()}><button className="modal-close" onClick={()=>setShowLibrary(false)}>×</button><p className="eyebrow">YOUR LIBRARY</p><h2>Personal learning space</h2><p className="modal-copy">Your saved source appears here immediately in local mode. Supabase sync will make it available across devices.</p><div className="library-row"><span>▤</span><div><strong>{note.title}</strong><small>Fixture notebook · {note.sections.length} sections</small></div><button onClick={()=>{setShowLibrary(false);document.getElementById(note.sections[0].id)?.scrollIntoView({behavior:'smooth'})}}>Open</button></div></section></div>}
    {showReview&&<div className="modal-backdrop" onClick={()=>setShowReview(false)}><section className="modal review-modal" onClick={event=>event.stopPropagation()}><button className="modal-close" onClick={()=>setShowReview(false)}>×</button><p className="eyebrow">SYNQ MASTERY</p><h2>Check your recall</h2><p className="modal-copy">Answer these prompts after reading. Your attempt stays local until authenticated persistence is connected.</p>{note.reviewQuestions.map((question,index)=><div className="review-question" key={question}><strong>0{index+1}</strong><span>{question}</span><button onClick={()=>announce('Answer capture is ready for the assessment persistence slice.')}>Answer</button></div>)}</section></div>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
