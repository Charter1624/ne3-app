import { useState } from 'react'

const PROPOSAL_API = import.meta.env.VITE_PROPOSAL_API_URL || 'http://localhost:8000'

function fmt(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR')
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

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fgTotal = fg ? fgData.prod * fgData.unidades + fgData.esp * fgData.unidades * fgData.meses : 0
  const lnTotal = ln ? lnData.prodU * lnData.cantidad + lnData.espU * lnData.cantidad * lnData.meses : 0
  const llTotal = ll ? llData.espU * llData.cantidad * llData.meses : 0
  const total   = fgTotal + lnTotal + llTotal

  async function generarPPTX() {
    setLoading(true); setError(null)
    const body = {
      cliente, fecha_validez: fecha,
      ...(fg && { fullglass: { meses:fgData.meses, costo_produccion:fgData.prod*fgData.unidades, costo_mensual:fgData.esp*fgData.unidades }}),
      ...(ln && { lunetas: { cantidad:lnData.cantidad, meses:lnData.meses, costo_produccion_unit:lnData.prodU, costo_mensual_unit:lnData.espU }}),
      ...(ll && { lunetas_led: { cantidad:llData.cantidad, meses:llData.meses, costo_mensual_unit:llData.espU }}),
    }
    try {
      const res = await fetch(PROPOSAL_API+'/generate', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({detail:res.statusText}))
        throw new Error(err.detail||'Error generando la propuesta')
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'propuesta_' + cliente.replace(/\s+/g,'_') + '.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inp   = { width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginTop:'4px', boxSizing:'border-box' }
  const card  = { background:'white', borderRadius:'16px', padding:'16px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }
  const lbl   = { fontSize:'12px', color:'#666', display:'block', marginTop:'8px' }
  const row2  = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }
  const canGenerate = cliente && total > 0
  const btnBg = loading ? '#a0d070' : canGenerate ? '#6CBB35' : '#ccc'

  return (
    <div style={{ background:'#f5f5f5', minHeight:'100vh', padding:'16px', fontFamily:'sans-serif', maxWidth:'420px', margin:'0 auto' }}>

      <div style={{ background:'#6CBB35', borderRadius:'16px', padding:'14px 16px', marginBottom:'12px', color:'white' }}>
        <div style={{ fontSize:'18px', fontWeight:'500' }}>Nueva propuesta</div>
        <div style={{ fontSize:'12px', opacity:.8 }}>NE3 Publicidad</div>
      </div>

      <div style={card}>
        <div style={{ fontWeight:'500', marginBottom:'8px' }}>Cliente</div>
        <label style={lbl}>Nombre</label>
        <input style={inp} value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Ej: Coca Cola"/>
        <div style={row2}>
          <div><label style={lbl}>Mail destino</label><input style={inp} value={mail} onChange={e=>setMail(e.target.value)} placeholder="cliente@empresa.com"/></div>
          <div><label style={lbl}>Validez</label><input style={inp} value={fecha} onChange={e=>setFecha(e.target.value)} placeholder="01/04/26"/></div>
        </div>
      </div>

      {[
        { key:'fg', label:'Fullglass', active:fg, set:setFg, content:(
          <div>
            <div style={row2}>
              <div><label style={lbl}>Línea</label><input style={inp} value={fgData.linea} onChange={e=>setFgData({...fgData,linea:e.target.value})} /></div>
              <div><label style={lbl}>Unidades</label><input style={inp} type="number" value={fgData.unidades} onChange={e=>setFgData({...fgData,unidades:+e.target.value})} /></div>
            </div>
            <div style={row2}>
              <div><label style={lbl}>Meses</label><input style={inp} type="number" value={fgData.meses} onChange={e=>setFgData({...fgData,meses:+e.target.value})} /></div>
              <div><label style={lbl}>Prod/colectivo $</label><input style={inp} type="number" value={fgData.prod} onChange={e=>setFgData({...fgData,prod:+e.target.value})} /></div>
            </div>
            <label style={lbl}>Espacio mensual $</label>
            <input style={inp} type="number" value={fgData.esp} onChange={e=>setFgData({...fgData,esp:+e.target.value})} />
            <div style={{ background:'#f0f9e8', borderRadius:'8px', padding:'8px', marginTop:'8px', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'12px', color:'#3B6D11' }}>Total Fullglass</span>
              <span style={{ fontWeight:'500', color:'#27500A' }}>{fmt(fgTotal)}</span>
            </div>
          </div>
        )},
        { key:'ln', label:'Lunetas', active:ln, set:setLn, content:(
          <div>
            <div style={row2}>
              <div><label style={lbl}>Cantidad</label><input style={inp} type="number" value={lnData.cantidad} onChange={e=>setLnData({...lnData,cantidad:+e.target.value})} /></div>
              <div><label style={lbl}>Meses</label><input style={inp} type="number" value={lnData.meses} onChange={e=>setLnData({...lnData,meses:+e.target.value})} /></div>
            </div>
            <div style={row2}>
              <div><label style={lbl}>Prod/luneta $</label><input style={inp} type="number" value={lnData.prodU} onChange={e=>setLnData({...lnData,prodU:+e.target.value})} /></div>
              <div><label style={lbl}>Espacio/luneta $</label><input style={inp} type="number" value={lnData.espU} onChange={e=>setLnData({...lnData,espU:+e.target.value})} /></div>
            </div>
            <label style={lbl}>Líneas</label>
            <input style={inp} value={lnData.lineas} onChange={e=>setLnData({...lnData,lineas:e.target.value})} />
            <div style={{ background:'#f0f9e8', borderRadius:'8px', padding:'8px', marginTop:'8px', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'12px', color:'#3B6D11' }}>Total Lunetas</span>
              <span style={{ fontWeight:'500', color:'#27500A' }}>{fmt(lnTotal)}</span>
            </div>
          </div>
        )},
        { key:'ll', label:'Lunetas LED', active:ll, set:setLl, content:(
          <div>
            <div style={row2}>
              <div><label style={lbl}>Cantidad</label><input style={inp} type="number" value={llData.cantidad} onChange={e=>setLlData({...llData,cantidad:+e.target.value})} /></div>
              <div><label style={lbl}>Meses</label><input style={inp} type="number" value={llData.meses} onChange={e=>setLlData({...llData,meses:+e.target.value})} /></div>
            </div>
            <label style={lbl}>Espacio/unidad $</label>
            <input style={inp} type="number" value={llData.espU} onChange={e=>setLlData({...llData,espU:+e.target.value})} />
            <label style={lbl}>Líneas</label>
            <input style={inp} value={llData.lineas} onChange={e=>setLlData({...llData,lineas:e.target.value})} />
            <div style={{ background:'#f0f9e8', borderRadius:'8px', padding:'8px', marginTop:'8px', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'12px', color:'#3B6D11' }}>Total LED</span>
              <span style={{ fontWeight:'500', color:'#27500A' }}>{fmt(llTotal)}</span>
            </div>
          </div>
        )}
      ].map(({ key, label, active, set, content }) => (
        <div key={key} style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:'500' }}>{label}</span>
            <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}>
              <span style={{ fontSize:'12px', color:'#666' }}>Incluir</span>
              <input type="checkbox" checked={active} onChange={e=>set(e.target.checked)} />
            </label>
          </div>
          {active && <div style={{ marginTop:'12px' }}>{content}</div>}
        </div>
      ))}

      {total > 0 && (
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:'500' }}>Total propuesta</span>
            <span style={{ fontSize:'20px', fontWeight:'500', color:'#6CBB35' }}>{fmt(total)}</span>
          </div>
          <div style={{ fontSize:'11px', color:'#999', marginTop:'2px' }}>+ IVA</div>
        </div>
      )}

      {error && (
        <div style={{ background:'#fff0f0', border:'1px solid #fcc', borderRadius:'12px', padding:'12px', marginBottom:'12px', fontSize:'13px', color:'#c00' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={generarPPTX}
        disabled={!canGenerate || loading}
        style={{ width:'100%', padding:'14px', background:btnBg, color:'white', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'500', cursor: canGenerate && !loading ? 'pointer' : 'default' }}
      >
        {loading ? 'Generando presentación...' : 'Descargar propuesta PowerPoint'}
      </button>

    </div>
  )
}