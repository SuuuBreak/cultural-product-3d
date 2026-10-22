import { lazy, Suspense } from 'react'
import CinematicExperience from './cinematic/CinematicExperience'

const Explorer = lazy(() => import('./App'))

export default function ExperienceRouter() {
  const exploring = window.location.pathname.replace(/\/$/, '') === '/explore'
  return exploring
    ? <Suspense fallback={<p style={{ padding: 40, color: '#d7b980', background: '#141210' }}>正在打开三维展厅…</p>}><Explorer /></Suspense>
    : <CinematicExperience />
}
