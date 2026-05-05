export default function Input({
  label,
  id,
  error,
  hint,
  className = '',
  ...props
}) {
  // Date/number/select inputs always have a value visually, so force label to stay up
  const alwaysUp = ['date', 'number', 'time', 'month'].includes(props.type)
  const hasValue = alwaysUp || (props.value !== undefined && props.value !== null && String(props.value).length > 0)

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        placeholder=" "
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
            'pointer-events-none absolute left-3 text-[11px] uppercase tracking-[0.2em] text-text-muted transition-all',
            hasValue
              ? 'top-1'
              : 'top-3 text-sm tracking-wide text-text-muted/70 peer-focus:top-1 peer-focus:text-[11px] peer-focus:text-accent',
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