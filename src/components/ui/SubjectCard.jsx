import { useNavigate } from 'react-router-dom'
import { colours } from '../../theme/colours'

const DEPTH = 8

export default function SubjectCard({ subject }) {
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
      onClick={() => navigate(subject.path)}
      style={{
        background: subject.bg,
        border: `3px solid ${subject.colour}`,
        borderRadius: 20,
        padding: '36px 32px',
        minWidth: 200,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        cursor: 'pointer',
        boxShadow: restShadow,
        transform: 'translateY(0)',
        transition: 'box-shadow 80ms, transform 80ms',
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
      <span style={{ fontSize: 64 }}>{subject.icon}</span>
      <span style={{ fontSize: 24, fontWeight: 700, color: subject.colour }}>
        {subject.name}
      </span>
    </button>
  )
}
