import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleClearAndReload = async () => {
    try {
      // Limpa caches do Service Worker
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      // Remove Service Worker registrado
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map(reg => reg.unregister()))
      }

      // Limpa dados de sessão corrompidos
      localStorage.removeItem('user_access_data')

      window.location.replace('/')
    } catch (err) {
      console.error('[ErrorBoundary] Erro ao limpar cache:', err)
      window.location.replace('/')
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DA9E00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2 style={styles.title}>Algo deu errado</h2>
            <p style={styles.message}>
              Ocorreu um erro inesperado. Isso pode ser causado por uma conexão instável ou dados em cache corrompidos.
            </p>

            <div style={styles.buttons}>
              <button style={styles.primaryBtn} onClick={this.handleReload}>
                Tentar novamente
              </button>
              <button style={styles.secondaryBtn} onClick={this.handleClearAndReload}>
                Limpar cache e recarregar
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1A1A1A',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    backgroundColor: '#242424',
    borderRadius: '16px',
    padding: '40px 32px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid #333',
  },
  iconWrapper: {
    marginBottom: '20px',
  },
  title: {
    color: '#f9f9f9',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },
  message: {
    color: '#888',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 28px 0',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryBtn: {
    backgroundColor: '#DA9E00',
    color: '#1A1A1A',
    border: 'none',
    borderRadius: '10px',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
}

export default ErrorBoundary
