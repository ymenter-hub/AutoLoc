export default function Input({
  label,
  id,
  error,
  hint,
  className = '',
  ...props
}) {
  const hasValue = props.value !== undefined && props.value !== null && String(props.value).length > 0

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        placeholder={props.placeholder ?? ' '}
        className={[
          'peer w-full rounded-xl border bg-bg-card/60 px-3 pb-2 pt-5 text-sm text-text-primary outline-none transition-all',
          'border-white/10 focus:border-accent focus:ring-2 focus:ring-accent/30',
          error ? 'border-danger/70 focus:border-danger focus:ring-danger/30' : '',
        ].join(' ')}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className={[
            'pointer-events-none absolute left-3 top-1 text-[11px] uppercase tracking-[0.2em] text-text-muted transition-all',
            'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-wide peer-placeholder-shown:text-text-muted/70',
            'peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-accent',
            hasValue ? 'top-1 text-[11px] text-text-muted' : '',
          ].join(' ')}
        >
          {label}
        </label>
      )}
      {error && <span className="mt-2 block text-xs text-danger">{error}</span>}
      {hint && !error && <span className="mt-2 block text-xs text-text-muted">{hint}</span>}
    </div>
  )
}
