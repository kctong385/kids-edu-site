import { useParams } from 'react-router-dom'
import { subjects } from '../subjects/registry'
import TopicCard from '../components/ui/TopicCard'
import PageWrapper from '../components/layout/PageWrapper'

export default function SubjectHub() {
  const { subject: subjectId } = useParams()
  const subject = subjects.find(s => s.id === subjectId)

  if (!subject) {
    return <PageWrapper><p>Subject not found.</p></PageWrapper>
  }

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <span style={{ fontSize: 48 }}>{subject.icon}</span>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: subject.colour, margin: 0 }}>
          {subject.name}
        </h1>
      </div>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 40 }}>
        Choose a topic to practise!
      </p>

      {subject.topics.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 18 }}>Topics coming soon!</p>
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          justifyContent: 'center',
        }}>
          {subject.topics.map(topic => (
            <TopicCard key={topic.id} topic={topic} subject={subject} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
