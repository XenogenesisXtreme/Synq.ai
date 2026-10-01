import React from 'react';
import { createRoot } from 'react-dom/client';
import { fixtureLecture } from './lib/fixture';
import { parseLectureNote } from './lib/lecture';
import './styles.css';

const note = parseLectureNote(fixtureLecture);

function App() {
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">S</span><span>synq<span className="brand-dot">.</span>ai</span></div><span className="topbar-label">WORKSPACE / NOTEBOOK</span><button className="profile">AR</button></header>
    <main className="workspace">
      <aside className="outline"><p className="eyebrow">LECTURE LENS</p><h2>Notebook outline</h2><p className="outline-meta">{note.sections.length} sections · 34 min</p><nav>{note.sections.map((section, index) => <a href={'#' + section.id} key={section.id}><span>0{index + 1}</span>{section.heading}</a>)}</nav><div className="progress-card"><div className="progress-label"><span>Reading progress</span><strong>0%</strong></div><div className="progress-track"><div /></div><p>Move through the lesson at your own pace.</p></div></aside>
      <article className="notebook"><div className="notebook-kicker"><span className="status-dot" /> COMPLETED NOTEBOOK <span className="divider">/</span> {note.course}</div><h1>{note.title}</h1><p className="overview">{note.overview}</p><section className="objectives"><p className="eyebrow">BY THE END OF THIS NOTEBOOK</p><div className="objective-list">{note.learningObjectives.map((objective, index) => <div key={objective}><span>0{index + 1}</span><p>{objective}</p></div>)}</div></section>{note.sections.map((section, index) => <section className="lesson-section" id={section.id} key={section.id}><div className="section-number">0{index + 1}</div><div className="section-content"><div className="section-meta">{section.timeStart} — {section.timeEnd}</div><h2>{section.heading}</h2><p>{section.explanation}</p><div className="key-points"><p className="eyebrow">KEY IDEAS</p>{section.keyPoints.map(point => <div className="point" key={point}><span>↗</span><span>{point}</span></div>)}</div>{section.definitions.map(definition => <div className="callout definition" key={definition.term}><p className="callout-label">DEFINITION</p><strong>{definition.term}</strong><p>{definition.meaning}</p></div>)}{section.formulas.map(formula => <div className="formula" key={formula}>{formula}</div>)}{section.selfCheck?.map(question => <div className="callout check" key={question}><p className="callout-label">PAUSE & RECALL</p><strong>{question}</strong><button>Reveal later</button></div>)}</div></section>)}</article>
      <aside className="right-rail"><div className="rail-card"><p className="eyebrow">QUICK REVIEW</p><h3>{note.reviewQuestions.length} questions waiting</h3><p>Test your recall after reading the core explanation.</p><button className="primary-button">Start review <span>→</span></button></div><div className="rail-card terms"><p className="eyebrow">KEY TERMS</p>{note.keyTerms.map(term => <div key={term.term}><strong>{term.term}</strong><p>{term.meaning}</p></div>)}</div></aside>
    </main>
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
