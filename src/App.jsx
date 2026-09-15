import { useMemo, useState } from 'react'
import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'
import assignmentMarkdown from '../project-assets/materials/silk_roads_class_02_assignment.md?raw'
import lecturePdf from '../project-assets/materials/silk_roads_class_01_lecture.pdf?url'
import lectureVideo from '../project-assets/materials/silk_roads_class_01_lecture.mp4?url'
import './styles.css'

function parseCsv(text) {
  const rows = []
  let row = [], value = '', quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === '"' && quoted && text[i + 1] === '"') { value += '"'; i += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { row.push(value); value = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ''
    } else value += char
  }
  if (value || row.length) { row.push(value); rows.push(row) }
  const [headers, ...data] = rows
  return data.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])))
}

const courses = parseCsv(coursesCsv)
const classes = parseCsv(classesCsv)
const instructors = parseCsv(instructorsCsv)
const materials = parseCsv(materialsCsv)
const instructorMap = Object.fromEntries(instructors.map((instructor) => [instructor.instructor_id, instructor]))
const localMaterials = {
  'materials/silk_roads_class_01_lecture.pdf': lecturePdf,
  'materials/silk_roads_class_01_lecture.mp4': lectureVideo,
  'materials/silk_roads_class_02_assignment.md': assignmentMarkdown,
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    arrow: <><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></>,
    back: <><path d="m15 18-6-6 6-6"/><path d="M9 12h11"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>,
    pdf: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 15h8M8 18h5"/></>,
    video: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3Z"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Header({ onHome, detail = false }) {
  return <header className="site-header">
    <button className="brand" onClick={onHome} aria-label="Go to course catalog">
      <span className="brand-mark"><Icon name="book" size={20}/></span>
      <span><strong>Epoch</strong><small>History, in context</small></span>
    </button>
    <nav aria-label="Primary navigation">
      <button className={!detail ? 'active' : ''} onClick={onHome}>Explore</button>
      <button onClick={onHome}>My learning</button>
      <span className="avatar">SR</span>
    </nav>
  </header>
}

function Catalog({ onSelect }) {
  const [search, setSearch] = useState('')
  const [instructor, setInstructor] = useState('all')
  const [length, setLength] = useState('all')
  const filtered = useMemo(() => courses.filter((course) => {
    const teacher = instructorMap[course.instructor_id]
    const haystack = `${course.name} ${course.short_description} ${teacher.name}`.toLowerCase()
    const matchesSearch = haystack.includes(search.toLowerCase())
    const matchesInstructor = instructor === 'all' || course.instructor_id === instructor
    const matchesLength = length === 'all' || (length === 'short' ? Number(course.number_of_weeks) <= 5 : Number(course.number_of_weeks) > 5)
    return matchesSearch && matchesInstructor && matchesLength
  }), [search, instructor, length])

  const featuredImage = courses.find((course) => course.course_id === 'HIST111')?.image_url
  const totalClasses = courses.reduce((sum, course) => sum + Number(course.number_of_classes), 0)
  return <div className="catalog-page">
    <Header onHome={() => {}} />
    <main>
      <section className="hero" style={{ '--hero-image': `url("${featuredImage}")` }}>
        <div className="eyebrow"><span/> THE PAST IS NEVER PAST</div>
        <h1>Find your place<br/>in <em>history.</em></h1>
        <p>Learn from leading historians. Follow the ideas, people, and exchanges that shaped the world we live in.</p>
        <div className="search-box">
          <Icon name="search" size={21}/>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search eras, places, or ideas" aria-label="Search courses"/>
          <button onClick={() => document.querySelector('.course-grid')?.scrollIntoView({ behavior: 'smooth' })}>Explore courses <span>→</span></button>
        </div>
        <div className="hero-facts"><span>{courses.length} curator-led courses</span><i/> <span>{totalClasses} classes</span><i/> <span>Learn at your own pace</span></div>
      </section>

      <section className="catalog-section">
        <div className="section-heading">
          <div><span className="kicker">COURSE CATALOG</span><h2>Journeys through time</h2></div>
          <p>{filtered.length} {filtered.length === 1 ? 'course' : 'courses'}</p>
        </div>
        <div className="filters" aria-label="Course filters">
          <label>Instructor<select value={instructor} onChange={(event) => setInstructor(event.target.value)}><option value="all">All instructors</option>{instructors.map(item => <option key={item.instructor_id} value={item.instructor_id}>{item.name}</option>)}</select></label>
          <label>Duration<select value={length} onChange={(event) => setLength(event.target.value)}><option value="all">Any duration</option><option value="short">5 weeks</option><option value="long">6+ weeks</option></select></label>
          {(search || instructor !== 'all' || length !== 'all') && <button className="clear" onClick={() => {setSearch(''); setInstructor('all'); setLength('all')}}>Clear filters</button>}
        </div>
        {filtered.length ? <div className="course-grid">{filtered.map((course) => {
          const teacher = instructorMap[course.instructor_id]
          return <article className="course-card" key={course.course_id} onClick={() => onSelect(course)}>
            <div className="card-image"><img src={course.image_url} alt=""/><span>{course.course_id}</span></div>
            <div className="card-body">
              <div className="card-meta"><span><Icon name="calendar" size={15}/>{course.number_of_weeks} weeks</span><span><Icon name="book" size={15}/>{course.number_of_classes} classes</span></div>
              <h3>{course.name}</h3>
              <p>{course.short_description}</p>
              <footer><span><img src={teacher.photo_url} alt=""/>{teacher.name}</span><button aria-label={`Open ${course.name}`}>→</button></footer>
            </div>
          </article>
        })}</div> : <div className="empty"><h3>No histories found</h3><p>Try widening your search or clearing the filters.</p></div>}
      </section>
    </main>
    <footer className="site-footer"><span>Epoch</span><p>History, thoughtfully taught.</p><small>© 2026 Epoch Learning</small></footer>
  </div>
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function MarkdownView({ content }) {
  const lines = content.split('\n')
  const nodes = []
  let list = []
  const flush = () => { if (list.length) { nodes.push(<ol key={`list-${nodes.length}`}>{list.map((item, i) => <li key={i}>{item}</li>)}</ol>); list = [] } }
  lines.forEach((line, index) => {
    if (/^\d+\. /.test(line)) { list.push(line.replace(/^\d+\. /, '')); return }
    flush()
    if (line.startsWith('# ')) nodes.push(<h1 key={index}>{line.slice(2)}</h1>)
    else if (line.startsWith('## ')) nodes.push(<h2 key={index}>{line.slice(3)}</h2>)
    else if (line.startsWith('|')) nodes.push(<div className="md-table-row" key={index}>{line.split('|').filter(Boolean).map((cell, i) => <span key={i}>{cell.replace(/\*\*/g, '').trim()}</span>)}</div>)
    else if (line.trim() && !/^\|?[-:| ]+\|?$/.test(line)) {
      const parts = line.split(/(\*\*.*?\*\*)/g)
      nodes.push(<p key={index}>{parts.map((part, i) => part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part)}</p>)
    }
  })
  flush()
  return <article className="markdown-view">{nodes}</article>
}

function MaterialViewer({ course, selected }) {
  if (!selected) return <div className="course-cover">
    <img src={course.image_url} alt=""/>
    <div className="cover-shade"/>
    <div className="cover-content"><span className="kicker">FEATURED COURSE</span><h1>{course.name}</h1><p>{course.long_description}</p><small>Choose a material from the syllabus to begin</small></div>
  </div>
  const source = localMaterials[selected.file_path] ?? selected.file_path
  return <div className="material-view">
    <div className="viewer-header"><div><span>{selected.material_type.toUpperCase()}</span><h2>{selected.material_title}</h2></div><a href={selected.material_type === 'md' ? undefined : source} target="_blank" rel="noreferrer">Open externally ↗</a></div>
    <div className="viewer-body">
      {selected.material_type === 'pdf' && <iframe title={selected.material_title} src={source}/>}
      {selected.material_type === 'video' && <video src={source} controls/>}
      {selected.material_type === 'youtube' && <iframe className="youtube" title={selected.material_title} src={`https://www.youtube.com/embed/${new URL(selected.file_path).pathname.slice(1)}`} allowFullScreen/>}
      {selected.material_type === 'md' && <MarkdownView content={source}/>}
    </div>
  </div>
}

function CoursePage({ course, onBack }) {
  const [collapsed, setCollapsed] = useState(false)
  const [selected, setSelected] = useState(null)
  const teacher = instructorMap[course.instructor_id]
  const sessions = classes.filter(item => item.course_id === course.course_id)
  const courseMaterials = materials.filter(item => item.course_id === course.course_id)
  return <div className="detail-page">
    <Header onHome={onBack} detail/>
    <main className={collapsed ? 'course-layout collapsed' : 'course-layout'}>
      <aside className="course-sidebar">
        <div className="sidebar-top"><button className="back-button" onClick={onBack}><Icon name="back"/> Catalog</button><button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand course information' : 'Collapse course information'}><Icon name="panel"/></button></div>
        <div className="sidebar-content">
          <span className="course-code">{course.course_id}</span>
          <h1>{course.name}</h1>
          <div className="instructor"><img src={teacher.photo_url} alt=""/><div><span>Instructor</span><strong>{teacher.name}</strong></div></div>
          <div className="course-stats"><span><Icon name="calendar"/>{course.number_of_weeks} weeks</span><span><Icon name="book"/>{course.number_of_classes} classes</span></div>
          <section className="syllabus"><div><span className="kicker">SYLLABUS</span><h2>Course schedule</h2></div>
            <div className="schedule-head"><span>Week / Date</span><span>Class content</span></div>
            {sessions.map((session) => {
              const items = courseMaterials.filter(material => material.class_id === session.class_id)
              return <div className="session" key={session.class_id}>
                <div className="session-date"><b>{session.week_number.padStart(2, '0')}</b><span>{formatDate(session.date)}</span></div>
                <div className="session-content"><h3>{session.class_name.replace(/^Class \d+:\s*/, '')}</h3>
                  {items.length > 0 ? <ul>{items.map(material => <li key={material.material_id}><button className={selected?.material_id === material.material_id ? 'selected' : ''} onClick={() => setSelected(material)}><span className={`material-icon ${material.material_type}`}><Icon name={material.material_type === 'youtube' ? 'link' : material.material_type === 'md' ? 'file' : material.material_type}/></span><span>{material.material_title}<small>{material.material_type === 'md' ? 'Assignment' : material.material_type === 'youtube' ? 'External video' : material.material_type === 'pdf' ? 'PDF reading' : 'Lecture video'}</small></span></button></li>)}</ul> : <span className="coming">Materials coming soon</span>}
                </div>
              </div>
            })}
          </section>
        </div>
      </aside>
      {collapsed && <button className="expand-tab" onClick={() => setCollapsed(false)}><Icon name="panel"/><span>Course & syllabus</span></button>}
      <section className="viewer"><MaterialViewer course={course} selected={selected}/></section>
    </main>
  </div>
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  return selectedCourse ? <CoursePage course={selectedCourse} onBack={() => setSelectedCourse(null)}/> : <Catalog onSelect={setSelectedCourse}/>
}
