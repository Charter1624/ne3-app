import { useState } from 'react'

const API = 'https://ne3-api-production.up.railway.app'

function fmt(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR')
}

export default function App() {
  const [cliente, setCliente] = useState('')
  const [mail, setMail]     = useState('')
  const [fecha, setFecha]   = useState('')

  const [fg, setFg] = useState(false)
  const [ln, setLn] = useState(false)
  const [ll, setLl] = useState(false)

  const [fgData, setFgData] = useState({ linea:'29', unidades:1, meses:3, prod:850000, esp:1300000 })
  const [lnData, setLnData] = useState({ cantidad:100, meses:3, prodU:55000, espU:74000, lineas:'21-26-33-44-46-60-76' })
  const [llData, setLlData] = useState({ cantidad:10, meses:3, espU:280000, lineas:'25(1)-44(2)-76(2)-99(2)-108(3)' })

  const fgTotal = fg ? fgData.prod * fgData.unidades + fgData.esp * fgData.unidades * fgData.meses : 0
  const lnTotal = ln ? lnData.prodU * lnData.cantidad + lnData.espU * lnData.cantidad * lnData.meses : 0
  const llTotal = ll ? llData.espU * llData.cantidad * llData.meses : 0
  const total   = fgTotal + lnTotal + llTotal

  function enviar() {
    const asunto  = encodeURIComponent(`Propuesta NE3 – ${cliente}`)
    const cuerpo  = encodeURIComponent(
      `Cliente: ${cliente}\nValidez: ${fecha}\n\n` +
      (fg ? `FULLGLASS\nLínea: ${fgData.linea} | ${fgData.unidades} u. x ${fgData.meses} meses\nTotal: ${fmt(fgTotal)} + IVA\n\n` : '') +
      (ln ? `LUNETAS\n${lnData.cantidad} u. x ${lnData.meses} meses\nLíneas: ${lnData.lineas}\nTotal: ${fmt(lnTotal)} + IVA\n\n` : '') +
      (ll ? `LUNETAS LED\n${llData.cantidad} u. x ${llData.meses} meses\nLíneas: ${llData.lineas}\nTotal: ${fmt(llTotal)} + IVA\n\n` : '') +
      `TOTAL: ${fmt(total)} + IVA`
    )
    window.location.href = `mailto:${mail}?subject=${asunto}&body=${cuerpo}`
  }

  const inp = { width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', marginTop:'4px' }
  const card = { background:'white', borderRadius:'16px', padding:'16px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }
  const label = { fontSize:'12px', color:'#666', display:'block', marginTop:'8px' }
  const row2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }

  return (
    <div style={{ background:'#f5f5f5', minHeight:'100vh', padding:'16px', fontFamily:'sans-serif', maxWidth:'420px', margin:'0 auto' }}>

      <div style={{ background:'#6CBB35', borderRadius:'16px', padding:'14px 16px', marginBottom:'12px', color:'white' }}>
        <div style={{ fontSize:'18px', fontWeight:'500' }}>Nueva propuesta</div>
        <div style={{ fontSize:'12px', opacity:.8 }}>NE3 Publicidad</div>
      </div>

      <div style={card}>
        <div style={{ fontWeight:'500', marginBottom:'8px' }}>Cliente</div>
        <label style={label}>Nombre</label>
        <input style={inp} value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Ej: Coca Cola"/>
        <div style={row2}>
          <div><label style={label}>Mail destino</label><input style={inp} value={mail} onChange={e=>setMail(e.target.value)} placeholder="cliente@empresa.com"/></div>
          <div><label style={label}>Validez</label><input style={inp} value={fecha} onChange={e=>setFecha(e.target.value)} placeholder="01/04/26"/></div>
        </div>
      </div>

      {[
        { key:'fg', label:'Fullglass', active:fg, set:setFg, content:(
          <div>
            <div style={row2}>
              <div><label style={label}>Línea</label><input style={inp} value={fgData.linea} onChange={e=>setFgData({...fgData,linea:e.target.value})} /></div>
              <div><label style={label}>Unidades</label><input style={inp} type="number" value={fgData.unidades} onChange={e=>setFgData({...fgData,unidades:+e.target.value})} /></div>
            </div>
            <div style={row2}>
              <div><label style={label}>Meses</label><input style={inp} type="number" value={fgData.meses} onChange={e=>setFgData({...fgData,meses:+e.target.value})} /></div>
              <div><label style={label}>Prod/colectivo $</label><input style={inp} type="number" value={fgData.prod} onChange={e=>setFgData({...fgData,prod:+e.target.value})} /></div>
            </div>
            <label style={label}>Espacio mensual $</label>
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
              <div><label style={label}>Cantidad</label><input style={inp} type="number" value={lnData.cantidad} onChange={e=>setLnData({...lnData,cantidad:+e.target.value})} /></div>
              <div><label style={label}>Meses</label><input style={inp} type="number" value={lnData.meses} onChange={e=>setLnData({...lnData,meses:+e.target.value})} /></div>
            </div>
            <div style={row2}>
              <div><label style={label}>Prod/luneta $</label><input style={inp} type="number" value={lnData.prodU} onChange={e=>setLnData({...lnData,prodU:+e.target.value})} /></div>
              <div><label style={label}>Espacio/luneta $</label><input style={inp} type="number" value={lnData.espU} onChange={e=>setLnData({...lnData,espU:+e.target.value})} /></div>
            </div>
            <label style={label}>Líneas</label>
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
              <div><label style={label}>Cantidad</label><input style={inp} type="number" value={llData.cantidad} onChange={e=>setLlData({...llData,cantidad:+e.target.value})} /></div>
              <div><label style={label}>Meses</label><input style={inp} type="number" value={llData.meses} onChange={e=>setLlData({...llData,meses:+e.target.value})} /></div>
            </div>
            <label style={label}>Espacio/unidad $</label>
            <input style={inp} type="number" value={llData.espU} onChange={e=>setLlData({...llData,espU:+e.target.value})} />
            <label style={label}>Líneas</label>
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
        <div style={{ background:'white', borderRadius:'16px', padding:'16px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:'500' }}>Total propuesta</span>
            <span style={{ fontSize:'20px', fontWeight:'500', color:'#6CBB35' }}>{fmt(total)}</span>
          </div>
          <div style={{ fontSize:'11px', color:'#999', marginTop:'2px' }}>+ IVA</div>
        </div>
      )}

      <button
        onClick={enviar}
        disabled={!cliente || !mail || total === 0}
        style={{ width:'100%', padding:'14px', background: (!cliente||!mail||total===0) ? '#ccc' : '#6CBB35', color:'white', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'500', cursor: (!cliente||!mail||total===0) ? 'default' : 'pointer' }}
      >
        Enviar propuesta por mail
      </button>

    </div>
  )
}
