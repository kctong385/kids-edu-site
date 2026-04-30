import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  return (
    <header style={{
      background: '#fff',
      borderBottom: '2px solid #EEE',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 22,
          fontWeight: 800,
          color: '#333',
          padding: '8px 0',
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        🎓 Learn with Me
      </button>
    </header>
  )
}
