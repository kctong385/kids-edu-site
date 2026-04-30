import { buttons } from '../../theme/colours'

const DEPTH = 5

export default function BigButton({ onClick, children, variant = 'amber', disabled = false, style: extraStyle }) {
  const v = buttons[variant] || buttons.amber

  const restShadow = `0 ${DEPTH}px 0 ${v.shadow}`
  const pressShadow = `0 1px 0 ${v.shadow}`

  function applyRest(el) {
    el.style.transform = 'translateY(0)'
    el.style.boxShadow = restShadow
  }
  function applyPress(el) {
    el.style.transform = `translateY(${DEPTH - 1}px)`
    el.style.boxShadow = pressShadow
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: v.bg,
        border: `2px solid ${v.border}`,
        color: v.text,
        borderRadius: 12,
        padding: '14px 32px',
        minHeight: 52,
        minWidth: 52,
        fontSize: 16,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: restShadow,
        transform: 'translateY(0)',
        transition: 'opacity 0.15s, box-shadow 80ms, transform 80ms',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...extraStyle,
      }}
      onPointerDown={e => { if (!disabled) applyPress(e.currentTarget) }}
      onPointerUp={e => { if (!disabled) applyRest(e.currentTarget) }}
      onPointerLeave={e => { if (!disabled) applyRest(e.currentTarget) }}
    >
      {children}
    </button>
  )
}
