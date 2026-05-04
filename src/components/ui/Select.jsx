import styles from './Input.module.css'

export default function Select({ label, id, options = [], error, className = '', ...props }) {
  return (
    <div className={`${styles.field} ${className}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <select id={id} className={`${styles.input} ${error ? styles.hasError : ''}`} {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
