interface KpiTileProps {
  label: string
  value: string | number
  hint: string
  highlight?: boolean
}

export function KpiTile({ label, value, hint, highlight = false }: KpiTileProps) {
  return (
    <div className={highlight ? 'kpi kpi--highlight' : 'kpi'}>
      <dt className="kpi__label">{label}</dt>
      <dd className="kpi__value">{value}</dd>
      <dd className="kpi__hint">{hint}</dd>
    </div>
  )
}
