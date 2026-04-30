import { subjects } from '../subjects/registry'
import SubjectCard from '../components/ui/SubjectCard'
import PageWrapper from '../components/layout/PageWrapper'

export default function Home() {
  return (
    <PageWrapper>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#333', marginBottom: 8 }}>
        What do you want to learn today?
      </h1>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 40 }}>
        Pick a subject to get started!
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'center',
      }}>
        {subjects.map(subject => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </PageWrapper>
  )
}
