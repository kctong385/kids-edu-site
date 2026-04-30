import { useNavigate } from 'react-router-dom'
import { colours } from '../../theme/colours'

const DEPTH = 6

export default function TopicCard({ topic, subject }) {
  const navigate = useNavigate()
  const shadow = colours[subject.id]?.shadow ?? '#888'

  const restShadow  = `0 ${DEPTH}px 0 ${shadow}`
  const hoverShadow = `0 ${DEPTH + 2}px 0 ${shadow}`
  const pressShadow = `0 1px 0 ${shadow}`

  function applyRest(el) {
    el.style.transform = 'translateY(0)'
    el.style.boxShadow = restShadow
  }
  function applyHover(el) {
    el.style.transform = 'translateY(-2px)'
    el.style.boxShadow = hoverShadow
  }
  function applyPress(el) {
    el.style.transform = `translateY(${DEPTH - 1}px)`
    el.style.boxShadow = pressShadow
  }

  return (
    <button
      onClick={() => navigate(topic.path)}
      style={{
        background: subject.bg,
        border: `3px solid ${subject.colour}`,
        borderRadius: 16,
        padding: '28px 24px',
        minWidth: 180,
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: 'pointer',
        boxShadow: restShadow,
        transform: 'translateY(0)',
        transition: 'box-shadow 80ms, transform 80ms',
        textAlign: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onPointerEnter={e => applyHover(e.currentTarget)}
      onPointerLeave={e => applyRest(e.currentTarget)}
      onPointerDown={e => applyPress(e.currentTarget)}
      onPointerUp={e => {
        if (e.currentTarget.matches(':hover')) applyHover(e.currentTarget)
        else applyRest(e.currentTarget)
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 700, color: subject.colour }}>
        {topic.name}
      </span>
      <span style={{ fontSize: 14, color: '#666', lineHeight: 1.4 }}>
        {topic.desc}
      </span>
    </button>
  )
}
