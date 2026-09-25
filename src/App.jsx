import { useEffect, useMemo, useState } from 'react'
import { catalog } from './data'

const iconPaths = {
  arrowLeft: '<path d="m15 18-6-6 6-6"/><path d="M21 12H9"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect width="18" height="18" x="3" y="4" rx="2"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
}

function Icon({ name, size = 18 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
    />
  )
}

const formatDate = (date) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date}T12:00:00Z`))

const materialLabel = {
  pdf: 'PDF', video: 'Video', youtube: 'Video', md: 'Assignment',
}

function Header({ activeCourse, onHome }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={onHome} aria-label="Return to course catalog">
        <span className="brand-mark"><Icon name="book" size={21} /></span>
        <span>Past / Present</span>
      </button>
      <nav className="primary-nav" aria-label="Primary navigation">
        <button className="nav-link is-active" onClick={onHome}>Courses</button>
      </nav>
      <div className="header-actions">
        <span className="course-code">{activeCourse ? activeCourse.course_id : `${catalog.length} COURSES`}</span>
      </div>
    </header>
  )
}

function CourseCard({ course, onSelect }) {
  return (
    <article className="course-card" onClick={() => onSelect(course)}>
      <div className="card-image-wrap">
        <img src={course.image_url} alt="" className="card-image" />
        <span className="card-code">{course.course_id}</span>
      </div>
      <div className="card-body">
        <p className="eyebrow">{course.number_of_weeks} week course</p>
        <h3>{course.name}</h3>
        <p className="card-description">{course.short_description}</p>
        <div className="card-footer">
          <div className="instructor-mini">
            <img src={course.instructor.photo_url} alt="" />
            <span>{course.instructor.name}</span>
          </div>
          <span className="class-count">{course.number_of_classes} classes <Icon name="chevronRight" size={16} /></span>
        </div>
      </div>
    </article>
  )
}

function Catalog({ onSelect }) {
  const [query, setQuery] = useState('')
  const [instructor, setInstructor] = useState('all')
  const [duration, setDuration] = useState('all')

  const instructors = useMemo(() => [...new Map(catalog.map((course) => [
    course.instructor.instructor_id, course.instructor,
  ])).values()], [])

  const filtered = catalog.filter((course) => {
    const searchable = `${course.name} ${course.short_description} ${course.instructor.name}`.toLowerCase()
    return searchable.includes(query.toLowerCase())
      && (instructor === 'all' || course.instructor_id === instructor)
      && (duration === 'all' || course.number_of_weeks === Number(duration))
  })

  const clearFilters = () => {
    setQuery('')
    setInstructor('all')
    setDuration('all')
  }

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <div className="hero-copy">
          <p className="eyebrow">Explore the human story</p>
          <h1>History is not behind us.<br /><em>It’s how we got here.</em></h1>
          <p>Scholar-led courses that bring the past into focus—through evidence, ideas, and the people who lived it.</p>
        </div>
        <div className="hero-ornament" aria-hidden="true">
          <span>EST.</span><strong>12</strong><span>COURSES</span>
        </div>
      </section>

      <section className="catalog-content">
        <div className="section-heading">
          <div><p className="eyebrow">Course catalog</p><h2>Choose your next chapter</h2></div>
          <p>{catalog.length} courses · Ancient worlds to the modern age</p>
        </div>

        <div className="filter-bar">
          <label className="search-field">
            <Icon name="search" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, topics, or instructors" />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search"><Icon name="close" size={15} /></button>}
          </label>
          <label className="select-field"><Icon name="user" size={16} /><select value={instructor} onChange={(event) => setInstructor(event.target.value)}><option value="all">All instructors</option>{instructors.map((item) => <option key={item.instructor_id} value={item.instructor_id}>{item.name}</option>)}</select></label>
          <label className="select-field"><Icon name="clock" size={16} /><select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="all">Any duration</option><option value="5">5 weeks</option><option value="6">6 weeks</option><option value="7">7 weeks</option><option value="8">8 weeks</option></select></label>
        </div>

        <div className="results-row"><span>{filtered.length} {filtered.length === 1 ? 'course' : 'courses'}</span><span><Icon name="filter" size={14} /> Curated history curriculum</span></div>
        {filtered.length ? (
          <div className="course-grid">{filtered.map((course) => <CourseCard key={course.course_id} course={course} onSelect={onSelect} />)}</div>
        ) : (
          <div className="empty-state"><span>∴</span><h3>No courses found</h3><p>Try a broader search or reset your filters.</p><button onClick={clearFilters}>Reset filters</button></div>
        )}
      </section>
    </main>
  )
}

function InlineText({ text }) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
  )
}

function MarkdownDocument({ source }) {
  const lines = source.trim().split('\n')
  const blocks = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line) { index += 1; continue }
    if (line.startsWith('|') && lines[index + 1]?.includes('---')) {
      const headers = line.split('|').filter(Boolean).map((cell) => cell.trim())
      index += 2
      const rows = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(lines[index].split('|').filter(Boolean).map((cell) => cell.trim()))
        index += 1
      }
      blocks.push(<table key={`table-${index}`}><thead><tr>{headers.map((cell) => <th key={cell}><InlineText text={cell} /></th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><InlineText text={cell} /></td>)}</tr>)}</tbody></table>)
      continue
    }
    if (/^\d+\. /.test(line)) {
      const items = []
      while (index < lines.length && /^\d+\. /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\. /, ''))
        index += 1
      }
      blocks.push(<ol key={`ol-${index}`}>{items.map((item) => <li key={item}><InlineText text={item} /></li>)}</ol>)
      continue
    }
    if (line.startsWith('# ')) blocks.push(<h1 key={index}>{line.slice(2)}</h1>)
    else if (line.startsWith('## ')) blocks.push(<h2 key={index}>{line.slice(3)}</h2>)
    else blocks.push(<p key={index}><InlineText text={line.replace(/  $/, '')} /></p>)
    index += 1
  }
  return <article className="markdown-document">{blocks}</article>
}

function youtubeEmbed(url) {
  const id = new URL(url).pathname.replace('/', '')
  return `https://www.youtube.com/embed/${id}`
}

function MaterialViewer({ course, material, onReset }) {
  if (!material) {
    return (
      <div className="course-cover">
        <img src={course.image_url} alt={`Cover for ${course.name}`} />
        <div className="cover-gradient" />
        <div className="cover-caption"><p className="eyebrow">Now viewing</p><h2>{course.name}</h2><p>Select a resource in the syllabus to begin.</p></div>
      </div>
    )
  }

  return (
    <div className="material-shell">
      <div className="material-toolbar">
        <div><span className={`type-pill type-${material.material_type}`}>{materialLabel[material.material_type]}</span><strong>{material.material_title}</strong></div>
        <div className="toolbar-actions">
          <a href={material.url} target="_blank" rel="noreferrer" aria-label="Open material in a new tab"><Icon name="external" size={16} /></a>
          <button onClick={onReset} aria-label="Close material"><Icon name="close" size={17} /></button>
        </div>
      </div>
      <div className="material-canvas">
        {material.material_type === 'pdf' && <iframe className="document-frame" src={`${material.url}#view=FitH`} title={material.material_title} />}
        {material.material_type === 'video' && <div className="video-wrap"><video controls src={material.url}>Your browser does not support video.</video></div>}
        {material.material_type === 'youtube' && <div className="video-wrap"><iframe src={youtubeEmbed(material.url)} title={material.material_title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>}
        {material.material_type === 'md' && <MarkdownDocument source={material.content} />}
      </div>
    </div>
  )
}

function MaterialButton({ material, selected, onSelect }) {
  const icon = ['video', 'youtube'].includes(material.material_type) ? 'play' : 'document'
  return (
    <button className={`material-link ${selected ? 'is-selected' : ''}`} onClick={() => onSelect(material)}>
      <span className="material-icon"><Icon name={icon} size={15} /></span>
      <span><small>{materialLabel[material.material_type]}</small>{material.material_title}</span>
      <Icon name="chevronRight" size={15} />
    </button>
  )
}

function CourseWorkspace({ course, onBack }) {
  const [collapsed, setCollapsed] = useState(false)
  const [material, setMaterial] = useState(null)

  return (
    <main className={`course-workspace ${collapsed ? 'is-collapsed' : ''}`}>
      <section className="course-panel">
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand course information' : 'Collapse course information'}><Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} /></button>
        <div className="collapsed-rail"><button onClick={onBack}><Icon name="arrowLeft" /></button><span>{course.course_id}</span><strong>SYLLABUS</strong></div>
        <div className="course-panel-content">
          <button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={17} /> All courses</button>
          <div className="course-intro">
            <p className="eyebrow">{course.course_id} · {course.number_of_weeks} weeks</p>
            <h1>{course.name}</h1>
            <p>{course.long_description}</p>
            <div className="instructor-card">
              <img src={course.instructor.photo_url} alt={course.instructor.name} />
              <div><small>COURSE INSTRUCTOR</small><strong>{course.instructor.name}</strong><a href={`mailto:${course.instructor.email}`}>{course.instructor.email}</a></div>
              <div className="course-facts"><span><Icon name="calendar" size={15} /> {course.number_of_classes} classes</span><span><Icon name="clock" size={15} /> {course.number_of_weeks} weeks</span></div>
            </div>
          </div>

          <div className="syllabus-heading"><div><p className="eyebrow">Course schedule</p><h2>Syllabus</h2></div><span>{course.number_of_classes} class meetings</span></div>
          <div className="syllabus-table-wrap">
            <table className="syllabus-table">
              <thead><tr><th>Week</th><th>Date</th><th>Class content</th></tr></thead>
              <tbody>{course.classes.map((classItem) => (
                <tr key={classItem.class_id}>
                  <td><span className="week-number">{String(classItem.week_number).padStart(2, '0')}</span></td>
                  <td><time dateTime={classItem.date}>{formatDate(classItem.date)}</time></td>
                  <td><h3>{classItem.class_name.replace(/^Class \d+: /, '')}</h3>{classItem.materials.length > 0 ? <div className="materials-list">{classItem.materials.map((item) => <MaterialButton key={item.material_id} material={item} selected={item.material_id === material?.material_id} onSelect={setMaterial} />)}</div> : <p className="no-materials">Materials coming soon</p>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="viewer-panel" aria-live="polite"><MaterialViewer course={course} material={material} onReset={() => setMaterial(null)} /></section>
    </main>
  )
}

export default function App() {
  const courseFromHash = () => catalog.find((course) => `#course/${course.course_id}` === window.location.hash)
  const [activeCourse, setActiveCourse] = useState(courseFromHash() || null)

  useEffect(() => {
    const syncHash = () => setActiveCourse(courseFromHash() || null)
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  const selectCourse = (course) => {
    window.location.hash = `course/${course.course_id}`
    setActiveCourse(course)
    window.scrollTo(0, 0)
  }
  const showCatalog = () => {
    window.history.pushState('', document.title, window.location.pathname + window.location.search)
    setActiveCourse(null)
    window.scrollTo(0, 0)
  }

  return <><Header activeCourse={activeCourse} onHome={showCatalog} />{activeCourse ? <CourseWorkspace key={activeCourse.course_id} course={activeCourse} onBack={showCatalog} /> : <Catalog onSelect={selectCourse} />}</>
}
