import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Payload Analytics Plugin Dev</h1>
      <p>This is a development environment for testing the Payload Analytics Plugin.</p>
      <p>
        <Link href="/admin">Go to Admin Panel</Link>
      </p>
      <p>Once in the admin panel, click on "Analytics" in the navigation to view the dashboard.</p>
    </main>
  )
}