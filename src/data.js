import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'

const materialUrls = import.meta.glob('../project-assets/materials/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const markdownSources = import.meta.glob('../project-assets/materials/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"' && quoted && nextCharacter === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.length)) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [headers, ...values] = rows
  return values.map((valuesRow) =>
    Object.fromEntries(headers.map((header, index) => [header, valuesRow[index] ?? ''])),
  )
}

const materialPath = (filePath) => `../project-assets/${filePath}`

const instructors = parseCsv(instructorsCsv)
const classes = parseCsv(classesCsv)
const materials = parseCsv(materialsCsv).map((material) => {
  const local = !/^https?:\/\//.test(material.file_path)
  return {
    ...material,
    display_order: Number(material.display_order),
    url: local ? materialUrls[materialPath(material.file_path)] : material.file_path,
    content: material.material_type === 'md'
      ? markdownSources[materialPath(material.file_path)]
      : null,
  }
})

export const catalog = parseCsv(coursesCsv).map((course) => ({
  ...course,
  number_of_classes: Number(course.number_of_classes),
  number_of_weeks: Number(course.number_of_weeks),
  instructor: instructors.find((instructor) => instructor.instructor_id === course.instructor_id),
  classes: classes
    .filter((classItem) => classItem.course_id === course.course_id)
    .map((classItem) => ({
      ...classItem,
      week_number: Number(classItem.week_number),
      materials: materials
        .filter((material) => material.class_id === classItem.class_id)
        .sort((a, b) => a.display_order - b.display_order),
    })),
}))

