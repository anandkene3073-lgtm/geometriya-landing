import React from 'react'
import ReactDOM from 'react-dom/client'
import GeometriyaLanding from './GeometriyaLanding.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'

// Simple path check — no react-router needed for a single extra page.
// window.location.pathname is read once at load, which is fine here since
// this is a static marketing site with no in-app client-side navigation
// between routes (the only link to /privacy is a full page load from the
// footer, and "← Back to site" on the privacy page is also a full reload).
const isPrivacyPage = window.location.pathname.replace(/\/$/, '') === '/privacy';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPrivacyPage ? <PrivacyPolicy /> : <GeometriyaLanding />}
  </React.StrictMode>,
)
