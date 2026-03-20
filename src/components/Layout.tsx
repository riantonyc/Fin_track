import { Outlet, NavLink, Link } from 'react-router-dom'
import { Home, ListOrdered, Wallet, Calculator, Settings as SettingsIcon, TrendingUp } from 'lucide-react'

const navItems = [
  { to: '/',            icon: Home,           label: 'Beranda',     end: true },
  { to: '/history',     icon: ListOrdered,    label: 'Riwayat' },
  { to: '/wallets',     icon: Wallet,         label: 'Dompet' },
  { to: '/calculator',  icon: Calculator,     label: 'Kalkulator' },
]

export function Layout() {
  return (
    <div className="layout-root">
      {/* ─── DESKTOP: Sidebar kiri ─────────────────────────────────── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span>FinTrack</span>
        </div>

        {/* Nav items */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings footer */}
        <div className="sidebar-footer">
          <Link to="/settings" className="sidebar-nav-item">
            <SettingsIcon className="w-5 h-5 flex-shrink-0" />
            <span>Pengaturan</span>
          </Link>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────── */}
      <div className="layout-content">
        {/* Mobile-only top header */}
        <header className="mobile-header">
          <div className="mobile-header-brand">
            <TrendingUp className="w-5 h-5" />
            <span>FinTrack</span>
          </div>
          <Link to="/settings" className="mobile-header-settings">
            <SettingsIcon className="w-5 h-5" />
          </Link>
        </header>

        {/* Page content */}
        <main className="page-main">
          <div className="page-content">
            <Outlet />
          </div>
        </main>

        {/* Mobile-only bottom nav */}
        <nav className="mobile-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
