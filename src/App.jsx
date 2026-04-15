import { useState, useRef } from 'react'

const PROPOSAL_API = import.meta.env.VITE_PROPOSAL_API_URL || 'https://ne3-proposal-api-production.up.railway.app'
const NE3_API      = import.meta.env.VITE_NE3_API_URL      || 'https://ne3-api-production.up.railway.app'

function fmt(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR')
}

// ── Estilos base ──────────────────────────────────────────────
const G = '#6CBB35'
const GD = '#3B6D11'
const GL = '#f0f9e8'

const s = {
  page:  { background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px 32px', fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: '480px', margin: '0 auto' },
  header:{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)`, borderRadius: '16px', padding: '18px 20px', marginBottom: '16px', color: 'white', boxShadow: '0 4px 16px rgba(108,187,53,0.3)' },
  card:  { background: 'white', borderRadius: '14px', padding: '18px', marginBottom: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' },
  label: { fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px', marginTop: '12px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #e8e8e8', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s', background: '#fafafa' },
  row2:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  sectionTitle: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  subtotal: { background: GL, borderRadius: '9px', padding: '10px 14px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
}

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer', flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '22px', transition: '.2s',
        background: checked ? G : '#ddd',
      }}>
        <span style={{
          position: 'absolute', height: '16px', width: '16px', left: checked ? '20px' : '3px', bottom: '3px',
          background: 'white', borderRadius: '50%', transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </span>
    </label>
  )
}

// ── Input con focus highlight ─────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      {label && <span style={s.label}>{label}</span>}
      {children}
    </div>
  )
}

export default function App() {
  const [cliente, setCliente] = useState('')
  const [mail, setMail]       = useState('')
  const [fecha, setFecha]     = useState('')

  const [fg, setFg] = useState(false)
  const [ln, setLn] = useState(false)
  const [ll, setLl] = useState(false)

  const [fgData, setFgData] = useState({ linea:'29', unidades:1, meses:3, prod:850000, esp:1300000 })
  const [lnData, setLnData] = useState({ cantidad:100, meses:3, prodU:55000, espU:74000, lineas:'21-26-33-44-46-60-76' })
  const [llData, setLlData] = useState({ cantidad:10, meses:3, espU:280000, lineas:'25(1)-44(2)-76(2)-99(2)-108(3)' })

  const [logo, setLogo]           = useState(null)    // File object
  const [logoPreview, setLogoPreview] = useState(null) // data URL
  const logoRef = useRef()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [status, setStatus]   = useState(null) // { downloaded, emailSent }

  const fgTotal = fg ? fgData.prod * fgData.unidades + fgData.esp * fgData.unidades * fgData.meses : 0
  const lnTotal = ln ? lnData.prodU * lnData.cantidad + lnData.espU * lnData.cantidad * lnData.meses : 0
  const llTotal = ll ? llData.espU * llData.cantidad * llData.meses : 0
  const total   = fgTotal + lnTotal + llTotal

  function handleLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    setLogo(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function generarPPTX() {
    setLoading(true); setError(null); setStatus(null)

    const bodyData = {
      cliente, mail, fecha_validez: fecha,
      ...(fg && { fullglass:    { unidades: fgData.unidades, meses: fgData.meses, costo_produccion: fgData.prod, costo_mensual: fgData.esp } }),
      ...(ln && { lunetas:      { cantidad: lnData.cantidad, meses: lnData.meses, costo_produccion_unit: lnData.prodU, costo_mensual_unit: lnData.espU } }),
      ...(ll && { lunetas_led:  { cantidad: llData.cantidad, meses: llData.meses, costo_mensual_unit: llData.espU } }),
    }

    try {
      const form = new FormData()
      form.append('data', JSON.stringify(bodyData))
      if (logo) form.append('logo', logo)

      const res = await fetch(PROPOSAL_API + '/generate', { method: 'POST', body: form })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || 'Error generando la propuesta')
      }

      const emailSent = res.headers.get('X-Email-Sent') === 'true'
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'propuesta_' + (cliente || 'cliente').replace(/\s+/g, '_') + '.pptx'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10000)

      setStatus({ downloaded: true, emailSent })

      // Guardar en base de datos
      const productos = [fg && 'fullglass', ln && 'lunetas', ll && 'lunetas_led'].filter(Boolean)
      fetch(NE3_API + '/propuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente, mail, fecha_validez: fecha,
          productos,
          total,
          detalle: bodyData
        })
      }).catch(() => {}) // silencioso, no bloquea la descarga

    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = { ...s.input }
  const canGenerate = cliente.trim() && total > 0

  const products = [
    {
      key: 'fg', label: 'Fullglass', active: fg, set: setFg,
      content: (
        <>
          <div style={s.row2}>
            <Field label="Línea"><input style={inp} value={fgData.linea} onChange={e => setFgData({ ...fgData, linea: e.target.value })} /></Field>
            <Field label="Unidades"><input style={inp} type="number" value={fgData.unidades} onChange={e => setFgData({ ...fgData, unidades: +e.target.value })} /></Field>
          </div>
          <div style={s.row2}>
            <Field label="Meses"><input style={inp} type="number" value={fgData.meses} onChange={e => setFgData({ ...fgData, meses: +e.target.value })} /></Field>
            <Field label="Prod/colectivo $"><input style={inp} type="number" value={fgData.prod} onChange={e => setFgData({ ...fgData, prod: +e.target.value })} /></Field>
          </div>
          <Field label="Espacio mensual $"><input style={inp} type="number" value={fgData.esp} onChange={e => setFgData({ ...fgData, esp: +e.target.value })} /></Field>
          <div style={s.subtotal}>
            <span style={{ fontSize: '12px', color: GD, fontWeight: '500' }}>Total Fullglass</span>
            <span style={{ fontWeight: '700', color: GD }}>{fmt(fgTotal)}</span>
          </div>
        </>
      )
    },
    {
      key: 'ln', label: 'Lunetas', active: ln, set: setLn,
      content: (
        <>
          <div style={s.row2}>
            <Field label="Cantidad"><input style={inp} type="number" value={lnData.cantidad} onChange={e => setLnData({ ...lnData, cantidad: +e.target.value })} /></Field>
            <Field label="Meses"><input style={inp} type="number" value={lnData.meses} onChange={e => setLnData({ ...lnData, meses: +e.target.value })} /></Field>
          </div>
          <div style={s.row2}>
            <Field label="Prod/luneta $"><input style={inp} type="number" value={lnData.prodU} onChange={e => setLnData({ ...lnData, prodU: +e.target.value })} /></Field>
            <Field label="Espacio/luneta $"><input style={inp} type="number" value={lnData.espU} onChange={e => setLnData({ ...lnData, espU: +e.target.value })} /></Field>
          </div>
          <Field label="Líneas"><input style={inp} value={lnData.lineas} onChange={e => setLnData({ ...lnData, lineas: e.target.value })} /></Field>
          <div style={s.subtotal}>
            <span style={{ fontSize: '12px', color: GD, fontWeight: '500' }}>Total Lunetas</span>
            <span style={{ fontWeight: '700', color: GD }}>{fmt(lnTotal)}</span>
          </div>
        </>
      )
    },
    {
      key: 'll', label: 'Lunetas LED', active: ll, set: setLl,
      content: (
        <>
          <div style={s.row2}>
            <Field label="Cantidad"><input style={inp} type="number" value={llData.cantidad} onChange={e => setLlData({ ...llData, cantidad: +e.target.value })} /></Field>
            <Field label="Meses"><input style={inp} type="number" value={llData.meses} onChange={e => setLlData({ ...llData, meses: +e.target.value })} /></Field>
          </div>
          <Field label="Espacio/unidad $"><input style={inp} type="number" value={llData.espU} onChange={e => setLlData({ ...llData, espU: +e.target.value })} /></Field>
          <Field label="Líneas"><input style={inp} value={llData.lineas} onChange={e => setLlData({ ...llData, lineas: e.target.value })} /></Field>
          <div style={s.subtotal}>
            <span style={{ fontSize: '12px', color: GD, fontWeight: '500' }}>Total LED</span>
            <span style={{ fontWeight: '700', color: GD }}>{fmt(llTotal)}</span>
          </div>
        </>
      )
    }
  ]

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>NE3 Publicidad</div>
        <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px' }}>Generador de propuestas comerciales</div>
      </div>

      {/* Cliente */}
      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: '4px' }}>Datos del cliente</div>
        <Field label="Nombre del cliente">
          <input style={inp} value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej: Coca Cola Argentina" />
        </Field>
        <div style={s.row2}>
          <Field label="Email">
            <input style={inp} type="email" value={mail} onChange={e => setMail(e.target.value)} placeholder="cliente@empresa.com" />
          </Field>
          <Field label="Validez">
            <input style={inp} value={fecha} onChange={e => setFecha(e.target.value)} placeholder="01/05/26" />
          </Field>
        </div>
      </div>

      {/* Logo upload */}
      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: '12px' }}>Logo del cliente</div>
        <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
        {logoPreview ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoPreview} alt="logo" style={{ width: '80px', height: '50px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee', background: '#fafafa', padding: '4px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>{logo?.name}</div>
              <button onClick={() => { setLogo(null); setLogoPreview(null); logoRef.current.value = '' }}
                style={{ marginTop: '4px', fontSize: '12px', color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => logoRef.current.click()} style={{
            width: '100%', padding: '16px', border: '2px dashed #ddd', borderRadius: '10px',
            background: '#fafafa', cursor: 'pointer', color: '#888', fontSize: '13px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
            <span>Subir logo (PNG, JPG)</span>
            <span style={{ fontSize: '11px', color: '#bbb' }}>Se mostrará en la portada de la propuesta</span>
          </button>
        )}
      </div>

      {/* Productos */}
      {products.map(({ key, label, active, set, content }) => (
        <div key={key} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={s.sectionTitle}>{label}</span>
            <Toggle checked={active} onChange={e => set(e.target.checked)} />
          </div>
          {active && <div style={{ marginTop: '14px' }}>{content}</div>}
        </div>
      ))}

      {/* Total */}
      {total > 0 && (
        <div style={{ ...s.card, background: GL, border: `1px solid #c5e89a` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: '600', color: GD }}>Total propuesta</span>
            <span style={{ fontSize: '24px', fontWeight: '700', color: GD }}>{fmt(total)}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#6a8f4a', marginTop: '2px' }}>Valores sin IVA</div>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', fontSize: '13px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {status?.downloaded && !error && (
        <div style={{ background: GL, border: '1px solid #b2e08a', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', fontSize: '13px', color: GD }}>
          Propuesta descargada correctamente.
          {status.emailSent && <span> Copia enviada a <strong>{mail}</strong>.</span>}
          {!status.emailSent && mail && <span style={{ color: '#999' }}> (Email no configurado en el servidor)</span>}
        </div>
      )}

      {/* Botón */}
      <button
        onClick={generarPPTX}
        disabled={!canGenerate || loading}
        style={{
          width: '100%', padding: '15px', border: 'none', borderRadius: '12px',
          fontSize: '15px', fontWeight: '600', cursor: canGenerate && !loading ? 'pointer' : 'default',
          background: loading ? '#a0d070' : canGenerate ? `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` : '#ddd',
          color: canGenerate || loading ? 'white' : '#aaa',
          boxShadow: canGenerate && !loading ? '0 4px 14px rgba(108,187,53,0.4)' : 'none',
          transition: 'all 0.2s',
          letterSpacing: '0.2px'
        }}
      >
        {loading ? 'Generando...' : 'Descargar propuesta PowerPoint'}
      </button>

    </div>
  )
}
