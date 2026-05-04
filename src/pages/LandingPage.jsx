import { Link } from 'react-router-dom'
import { Car, ShieldCheck, Zap, Users } from 'lucide-react'
import styles from './Landing.module.css'

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <span className={styles.logo}>AUTO<span>·</span>LOC</span>
        <div className={styles.navLinks}>
          <Link to="/login"    className={styles.navLink}>Sign In</Link>
          <Link to="/register" className={styles.navCta}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroTag}>Vehicle Rental Platform</div>
        <h1 className={styles.heroTitle}>
          Drive anything.<br />
          <span className={styles.accent}>Anytime.</span>
        </h1>
        <p className={styles.heroSub}>
          Browse premium vehicles, book instantly, and manage your rentals — all in one place.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/register?role=client" className={styles.ctaPrimary}>Find a Car</Link>
          <Link to="/register?role=owner"  className={styles.ctaSecondary}>List Your Fleet →</Link>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        {[
          { icon: Car,         title: 'Browse & Reserve',  desc: 'Browse available vehicles from local agencies and reserve in seconds.' },
          { icon: ShieldCheck, title: 'Secure & Verified',  desc: 'License upload verification ensures every rental is safe and documented.' },
          { icon: Zap,         title: 'Instant Decisions',  desc: 'Agency owners confirm or reject in one click. No back-and-forth.' },
          { icon: Users,       title: 'Two-sided Platform', desc: 'Built for both clients and rental agency owners with dedicated dashboards.' },
        ].map(f => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}><f.icon size={22} /></div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.logo} style={{ fontSize: 16 }}>AUTO<span>·</span>LOC</span>
        <span className={styles.footerText}>© 2026 Auto-Loc. Built with Supabase & Vercel.</span>
      </footer>
    </div>
  )
}
