export default function Select({ label, id, options = [], error, className = '', ...props }) {
  const hasValue = props.value !== undefined && props.value !== null && String(props.value).length > 0

  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        className={[
          'peer w-full appearance-none rounded-xl border bg-bg-card/60 px-3 pb-2 pt-5 text-sm text-text-primary outline-none transition-all',
          'border-white/10 focus:border-accent focus:ring-2 focus:ring-accent/30',
          error ? 'border-danger/70 focus:border-danger focus:ring-danger/30' : '',
        ].join(' ')}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {label && (
        <label
          htmlFor={id}
          className={[
            'pointer-events-none absolute left-3 top-1 text-[11px] uppercase tracking-[0.2em] text-text-muted transition-all',
            'peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-accent',
            hasValue ? 'top-1 text-[11px]' : 'top-3 text-sm text-text-muted/70',
          ].join(' ')}
        >
          {label}
        </label>
      )}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">▾</span>
      {error && <span className="mt-2 block text-xs text-danger">{error}</span>}
    </div>
  )
}
