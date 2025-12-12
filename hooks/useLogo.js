import { useState, useEffect } from 'react'

export function useLogo() {
  const [logo, setLogo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/footer')
        if (response.ok) {
          const data = await response.json()
          setLogo(data.logo)
        } else {
          throw new Error('Failed to fetch footer data')
        }
      } catch (err) {
        console.error('Error fetching logo:', err)
        setError('Failed to load logo')
        // Set default logo data on error
        setLogo({
          url: null,
          alt_text: 'VisaFly Logo',
          company_name: 'VisaFly'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [])

  return { logo, loading, error }
}