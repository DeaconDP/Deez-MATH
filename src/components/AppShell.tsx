import { NavLink, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand" end>
          <img src="/glyph.svg" alt="" width={24} height={24} />
          Deez-MATH
        </NavLink>
        <nav className="nav-links" aria-label="Primary">
          <NavLink
            to="/breakthroughs"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            style={({ isActive }) => ({ color: isActive ? 'var(--fg)' : undefined })}
          >
            Advances
          </NavLink>
          <NavLink
            to="/applications"
            style={({ isActive }) => ({ color: isActive ? 'var(--fg)' : undefined })}
          >
            Apps
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
