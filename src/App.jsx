import { useEffect, useMemo, useState } from 'react'
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
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1 }
      else quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field); field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(field); field = ''
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
    } else field += char
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const [headers, ...values] = rows
  return values.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])))
}

const courses = parseCsv(coursesCsv)
const classes = parseCsv(classesCsv)
const instructors = parseCsv(instructorsCsv)
const materials = parseCsv(materialsCsv)
const instructorsById = Object.fromEntries(instructors.map((item) => [item.instructor_id, item]))
const materialSources = {
  'materials/silk_roads_class_01_lecture.pdf': lecturePdf,
  'materials/silk_roads_class_01_lecture.mp4': lectureVideo,
  'materials/silk_roads_class_02_assignment.md': assignmentMarkdown,
}

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    left: <path d="m15 18-6-6 6-6"/>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></>,
    play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M6 9l-2 3 2 3"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    cap: <><path d="m2 10 10-5 10 5-10 5Z"/><path d="M6 12.5V17c3 2.5 9 2.5 12 0v-4.5M22 10v6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Header({ onHome, detail }) {
  return <header className="topbar">
    <button className="brand" onClick={onHome} aria-label="Go to course catalog">
      <span className="brand-mark"><Icon name="cap" size={22}/></span>
      <span>Chronicle<span>Academy</span></span>
    </button>
    <nav className="main-nav" aria-label="Main navigation">
      <button className={!detail ? 'active' : ''} onClick={onHome}>Explore Courses</button>
      <button>My Learning</button>
      <button>Reading Room</button>
    </nav>
    <div className="header-actions">
      <button className="round-button" aria-label="Search"><Icon name="search"/></button>
      <button className="avatar-button" aria-label="Open profile"><span>AS</span></button>
    </div>
  </header>
}

function Catalog({ onSelect }) {
  const [query, setQuery] = useState('')
  const [instructor, setInstructor] = useState('all')
  const [length, setLength] = useState('all')
  const [sort, setSort] = useState('featured')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = courses.filter((course) => {
      const teacher = instructorsById[course.instructor_id]
      const matchesQuery = !needle || [course.name, course.short_description, teacher?.name].some((value) => value?.toLowerCase().includes(needle))
      const matchesInstructor = instructor === 'all' || course.instructor_id === instructor
      const matchesLength = length === 'all' || (length === 'short' ? Number(course.number_of_weeks) <= 5 : Number(course.number_of_weeks) >= 6)
      return matchesQuery && matchesInstructor && matchesLength
    })
    if (sort === 'az') return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'duration') return [...filtered].sort((a, b) => Number(a.number_of_weeks) - Number(b.number_of_weeks))
    return filtered
  }, [query, instructor, length, sort])

  return <>
    <section className="catalog-hero">
      <div className="eyebrow"><span/>Explore the human story</div>
      <h1>History is not the past.<br/>It’s how we <em>understand</em> the present.</h1>
      <p>Learn from leading historians through evidence, ideas, and the stories that shaped our world.</p>
      <div className="hero-search">
        <Icon name="search" size={21}/>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search eras, events, or ideas…" aria-label="Search courses"/>
        <button onClick={() => document.querySelector('.catalog-content')?.scrollIntoView({ behavior: 'smooth' })}>Search</button>
      </div>
    </section>

    <main className="catalog-content">
      <div className="catalog-heading">
        <div><p className="section-kicker">CURATED COURSES</p><h2>Explore the catalog</h2><p>Discover a course and begin your journey through time.</p></div>
        <div className="course-count"><strong>{visible.length}</strong><span>courses<br/>available</span></div>
      </div>
      <div className="filter-row">
        <div className="filters">
          <label>Instructor<select value={instructor} onChange={(e) => setInstructor(e.target.value)}><option value="all">All instructors</option>{instructors.map((item) => <option key={item.instructor_id} value={item.instructor_id}>{item.name}</option>)}</select></label>
          <label>Duration<select value={length} onChange={(e) => setLength(e.target.value)}><option value="all">Any length</option><option value="short">5 weeks</option><option value="long">6+ weeks</option></select></label>
        </div>
        <label className="sort-label">Sort by<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="az">A–Z</option><option value="duration">Duration</option></select></label>
      </div>

      {visible.length ? <div className="course-grid">
        {visible.map((course) => {
          const teacher = instructorsById[course.instructor_id]
          const featured = course.course_id === 'HIST111'
          return <article className={`course-card ${featured ? 'featured-card' : ''}`} key={course.course_id} onClick={() => onSelect(course)}>
            <div className="card-image-wrap">
              <img src={course.image_url} alt="" className="card-image"/>
              <span className="course-code">{course.course_id}</span>
              {featured && <span className="featured-label">FEATURED</span>}
            </div>
            <div className="card-body">
              <p className="card-era">{getEra(course.name)}</p>
              <h3>{course.name}</h3>
              <p className="card-description">{course.short_description}</p>
              <div className="card-instructor"><img src={teacher.photo_url} alt=""/><div><span>Instructor</span><strong>{teacher.name}</strong></div></div>
              <div className="card-footer"><span><Icon name="calendar" size={16}/>{course.number_of_weeks} weeks</span><span><Icon name="book" size={16}/>{course.number_of_classes} classes</span><button aria-label={`View ${course.name}`}><Icon name="arrow" size={18}/></button></div>
            </div>
          </article>
        })}
      </div> : <div className="empty-state"><Icon name="search" size={30}/><h3>No courses found</h3><p>Try a different search or filter.</p></div>}
    </main>
    <footer><div className="footer-brand"><span className="brand-mark"><Icon name="cap" size={20}/></span><strong>ChronicleAcademy</strong></div><p>History belongs to everyone.</p><span>© 2026 Chronicle Academy</span></footer>
  </>
}

function getEra(name) {
  if (name.includes('Ancient')) return 'ANCIENT WORLDS'
  if (name.includes('Medieval') || name.includes('Silk')) return 'CONNECTED WORLDS'
  if (name.includes('World War')) return 'MODERN CONFLICT'
  if (name.includes('South Asia')) return 'GLOBAL EMPIRES'
  return 'MAKING THE MODERN WORLD'
}

function MaterialIcon({ type }) {
  const iconName = type === 'video' || type === 'youtube' ? 'play' : type === 'youtube' ? 'link' : 'file'
  return <span className={`material-icon type-${type}`}><Icon name={iconName} size={16}/></span>
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function formatYear(date) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function CourseDetail({ course, onBack }) {
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const courseClasses = classes.filter((item) => item.course_id === course.course_id)
  const teacher = instructorsById[course.instructor_id]
  const classMaterials = Object.groupBy ? Object.groupBy(materials.filter((item) => item.course_id === course.course_id), (item) => item.class_id) : materials.filter((item) => item.course_id === course.course_id).reduce((acc, item) => ({ ...acc, [item.class_id]: [...(acc[item.class_id] || []), item] }), {})
  const selectedClass = selectedMaterial && courseClasses.find((item) => item.class_id === selectedMaterial.class_id)

  useEffect(() => { window.scrollTo(0, 0) }, [course.course_id])

  return <main className="detail-page">
    <div className="detail-toolbar">
      <button className="back-button" onClick={onBack}><Icon name="left" size={17}/> Course catalog</button>
      <div className="toolbar-center"><span>{course.course_id}</span><strong>{course.name}</strong></div>
      <div className="progress-wrap"><span>Course progress</span><div className="progress-line"><i/></div><strong>0%</strong></div>
    </div>
    <div className={`course-workspace ${panelOpen ? '' : 'panel-closed'}`}>
      <aside className="course-panel">
        <button className="collapse-button" onClick={() => setPanelOpen(false)} aria-label="Collapse course information"><Icon name="panel" size={19}/></button>
        <div className="course-summary">
          <p className="detail-kicker">{getEra(course.name)}</p>
          <h1>{course.name}</h1>
          <p>{course.long_description}</p>
          <div className="course-facts">
            <span><Icon name="calendar"/ ><strong>{course.number_of_weeks} weeks</strong><small>Course length</small></span>
            <span><Icon name="book"/><strong>{course.number_of_classes} classes</strong><small>Twice weekly</small></span>
          </div>
          <div className="instructor-detail"><img src={teacher.photo_url} alt={teacher.name}/><div><small>YOUR INSTRUCTOR</small><strong>{teacher.name}</strong><a href={`mailto:${teacher.email}`}>{teacher.email}</a></div></div>
        </div>
        <section className="syllabus">
          <div className="syllabus-title"><div><p>COURSE SYLLABUS</p><h2>Classes & materials</h2></div><span>{courseClasses.length} classes</span></div>
          <div className="syllabus-table">
            <div className="syllabus-head"><span>WEEK</span><span>DATE</span><span>CLASS CONTENT</span></div>
            {courseClasses.map((item) => {
              const attached = classMaterials[item.class_id] || []
              return <div className="syllabus-row" key={item.class_id}>
                <div className="week-number"><strong>{item.week_number.padStart(2, '0')}</strong></div>
                <div className="class-date"><strong>{formatDate(item.date)}</strong><span>{formatYear(item.date)}</span></div>
                <div className="class-content"><h3>{item.class_name.replace(/^Class \d+: /, '')}</h3>
                  {attached.length > 0 ? <div className="material-list">{attached.sort((a,b) => Number(a.display_order) - Number(b.display_order)).map((material) => <button key={material.material_id} className={selectedMaterial?.material_id === material.material_id ? 'selected' : ''} onClick={() => setSelectedMaterial(material)}><MaterialIcon type={material.material_type}/><span><strong>{material.material_title}</strong><small>{material.material_type === 'md' ? 'ASSIGNMENT' : material.material_type.toUpperCase()}</small></span><Icon name="chevron" size={15}/></button>)}</div> : <p className="no-materials">Materials coming soon</p>}
                </div>
              </div>
            })}
          </div>
        </section>
      </aside>
      <section className="viewer-panel">
        {!panelOpen && <button className="expand-button" onClick={() => setPanelOpen(true)}><Icon name="panel" size={18}/> Show course</button>}
        {selectedMaterial ? <MaterialViewer material={selectedMaterial} course={course} classItem={selectedClass} onClose={() => setSelectedMaterial(null)}/> : <CourseCover course={course} teacher={teacher}/>} 
      </section>
    </div>
  </main>
}

function CourseCover({ course, teacher }) {
  return <div className="course-cover">
    <img src={course.image_url} alt={course.name}/><div className="cover-shade"/>
    <div className="cover-content"><p>{course.course_id} · {getEra(course.name)}</p><h2>{course.name}</h2><span className="cover-rule"/><div className="cover-instructor"><img src={teacher.photo_url} alt=""/><span><small>LED BY</small><strong>{teacher.name}</strong></span></div><p className="cover-hint"><span>←</span> Select a material from the syllabus to begin</p></div>
    <div className="cover-quote">“The past is never dead.<br/>It’s not even past.”<span>— William Faulkner</span></div>
  </div>
}

function MaterialViewer({ material, course, classItem, onClose }) {
  const source = materialSources[material.file_path] || material.file_path
  const typeLabel = material.material_type === 'md' ? 'Assignment' : material.material_type === 'youtube' ? 'Video' : material.material_type === 'pdf' ? 'Reading' : 'Lecture video'
  let body
  if (material.material_type === 'pdf') body = <iframe title={material.material_title} src={source}/>
  else if (material.material_type === 'video') body = <div className="video-wrap"><video controls preload="metadata" src={source}/></div>
  else if (material.material_type === 'youtube') {
    const id = new URL(material.file_path).pathname.slice(1)
    body = <div className="video-wrap"><iframe title={material.material_title} src={`https://www.youtube.com/embed/${id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>
  } else body = <MarkdownDocument text={source}/>
  return <div className="material-viewer">
    <div className="viewer-header"><div><span><MaterialIcon type={material.material_type}/>{typeLabel} · {classItem?.class_name.split(':')[0]}</span><h2>{material.material_title}</h2></div><button onClick={onClose} aria-label="Close material"><Icon name="close" size={20}/></button></div>
    <div className={`viewer-body viewer-${material.material_type}`}>{body}</div>
    <div className="viewer-foot"><span>{course.course_id}</span><span>{classItem?.class_name}</span></div>
  </div>
}

function MarkdownDocument({ text }) {
  const lines = text.split('\n')
  const content = []
  let list = []
  const flush = () => { if (list.length) { content.push(<ol key={`list-${content.length}`}>{list.map((item, i) => <li key={i}>{inlineMd(item)}</li>)}</ol>); list = [] } }
  lines.forEach((line, index) => {
    if (/^\d+\. /.test(line)) { list.push(line.replace(/^\d+\. /, '')); return }
    flush()
    if (line.startsWith('# ')) content.push(<h1 key={index}>{line.slice(2)}</h1>)
    else if (line.startsWith('## ')) content.push(<h2 key={index}>{line.slice(3)}</h2>)
    else if (line.startsWith('**Prompt:**')) content.push(<blockquote key={index}>{inlineMd(line)}</blockquote>)
    else if (line.startsWith('|')) {
      if (!line.includes('---')) content.push(<p className="table-line" key={index}>{line.split('|').filter(Boolean).map((cell, i) => <span key={i}>{inlineMd(cell.trim())}</span>)}</p>)
    } else if (line.trim()) content.push(<p key={index}>{inlineMd(line)}</p>)
  })
  flush()
  return <article className="markdown-document">{content}</article>
}

function inlineMd(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, index) => part.startsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part)
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(() => courses.find((course) => course.course_id === window.location.hash.slice(1)) || null)
  const selectCourse = (course) => { setSelectedCourse(course); window.location.hash = course.course_id; window.scrollTo(0, 0) }
  const goHome = () => { setSelectedCourse(null); history.replaceState(null, '', window.location.pathname); window.scrollTo(0, 0) }
  return <div className="app"><Header onHome={goHome} detail={Boolean(selectedCourse)}/>{selectedCourse ? <CourseDetail course={selectedCourse} onBack={goHome}/> : <Catalog onSelect={selectCourse}/>}</div>
}
