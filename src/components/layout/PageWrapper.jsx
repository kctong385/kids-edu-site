export default function PageWrapper({ children }) {
  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '32px 24px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  )
}
