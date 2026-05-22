'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Player, Fine } from '@/lib/types'

// ══ 2026 WORLD CUP TEAMS ══
const TEAMS = [
  {s:1,n:"Argentina",f:"🇦🇷"},{s:2,n:"France",f:"🇫🇷"},{s:3,n:"England",f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
  {s:4,n:"Brazil",f:"🇧🇷"},{s:5,n:"Spain",f:"🇪🇸"},{s:6,n:"Germany",f:"🇩🇪"},
  {s:7,n:"Portugal",f:"🇵🇹"},{s:8,n:"Netherlands",f:"🇳🇱"},{s:9,n:"Belgium",f:"🇧🇪"},
  {s:10,n:"Croatia",f:"🇭🇷"},{s:11,n:"Morocco",f:"🇲🇦"},{s:12,n:"Uruguay",f:"🇺🇾"},
  {s:13,n:"USA",f:"🇺🇸"},{s:14,n:"Mexico",f:"🇲🇽"},{s:15,n:"Canada",f:"🇨🇦"},
  {s:16,n:"Japan",f:"🇯🇵"},{s:17,n:"South Korea",f:"🇰🇷"},{s:18,n:"Senegal",f:"🇸🇳"},
  {s:19,n:"Denmark",f:"🇩🇰"},{s:20,n:"Switzerland",f:"🇨🇭"},{s:21,n:"Colombia",f:"🇨🇴"},
  {s:22,n:"Ecuador",f:"🇪🇨"},{s:23,n:"Austria",f:"🇦🇹"},{s:24,n:"Turkey",f:"🇹🇷"},
  {s:25,n:"Australia",f:"🇦🇺"},{s:26,n:"Iran",f:"🇮🇷"},{s:27,n:"Saudi Arabia",f:"🇸🇦"},
  {s:28,n:"Egypt",f:"🇪🇬"},{s:29,n:"Serbia",f:"🇷🇸"},{s:30,n:"Poland",f:"🇵🇱"},
  {s:31,n:"Hungary",f:"🇭🇺"},{s:32,n:"Ukraine",f:"🇺🇦"},{s:33,n:"Nigeria",f:"🇳🇬"},
  {s:34,n:"Ivory Coast",f:"🇨🇮"},{s:35,n:"Cameroon",f:"🇨🇲"},{s:36,n:"Ghana",f:"🇬🇭"},
  {s:37,n:"Chile",f:"🇨🇱"},{s:38,n:"Paraguay",f:"🇵🇾"},{s:39,n:"Venezuela",f:"🇻🇪"},
  {s:40,n:"Peru",f:"🇵🇪"},{s:41,n:"Bolivia",f:"🇧🇴"},{s:42,n:"Slovakia",f:"🇸🇰"},
  {s:43,n:"Czech Republic",f:"🇨🇿"},{s:44,n:"Scotland",f:"🏴󠁧󠁢󠁳󠁣󠁴󠁿"},{s:45,n:"Algeria",f:"🇩🇿"},
  {s:46,n:"Mali",f:"🇲🇱"},{s:47,n:"Panama",f:"🇵🇦"},{s:48,n:"New Zealand",f:"🇳🇿"},
]

const POTS = [
  {label:"Pot 1 — Favourites",    color:"#1a6b3a", range:[1,12]},
  {label:"Pot 2 — Strong Nations",color:"#1a3a6b", range:[13,24]},
  {label:"Pot 3 — Dark Horses",   color:"#c8960a", range:[25,36]},
  {label:"Pot 4 — Underdogs",     color:"#c0392b", range:[37,48]},
]

const SAMPLE_NAMES = ['Hardie','Jamie','Callum','Ross','Liam','Eilidh','Fraser','Megan','Craig','Iona','Gregor','Niamh','Duncan','Fiona','Angus','Isla']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Home() {
  const [page, setPage] = useState(1)
  const [playerNames, setPlayerNames] = useState<string[]>(Array(16).fill(''))
  const [players, setPlayers] = useState<Player[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [assign, setAssign] = useState<Record<string, string[]>>({})
  const [dragTeam, setDragTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('squads')
  const [setupComplete, setSetupComplete] = useState(false)

  const TEAMS_PER_PLAYER = 3

  // Load data from Supabase on mount
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [playersRes, finesRes, settingsRes] = await Promise.all([
      supabase.from('players').select('*').order('created_at'),
      supabase.from('fines').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 1).single(),
    ])
    if (playersRes.data && playersRes.data.length > 0) {
      setPlayers(playersRes.data)
      const a: Record<string, string[]> = {}
      playersRes.data.forEach((p: Player) => { a[p.name] = p.teams })
      setAssign(a)
    }
    if (finesRes.data) setFines(finesRes.data)
    if (settingsRes.data?.setup_complete) {
      setSetupComplete(true)
      setPage(3)
    }
    setLoading(false)
  }

  // ── PAGE 1 ──
  const activePlayers = playerNames.filter(Boolean)

  function autoFillNames() {
    const names = shuffle(SAMPLE_NAMES).slice(0, 16)
    setPlayerNames(names)
  }

  function goToAssign() {
    if (activePlayers.length < 2) { alert('Enter at least 2 players.'); return }
    const a: Record<string, string[]> = {}
    activePlayers.forEach(p => { a[p] = assign[p] || [] })
    setAssign(a)
    setPage(2)
  }

  // ── PAGE 2 ──
  const allAssigned = Object.values(assign).flat()
  const allFull = activePlayers.every(p => (assign[p] || []).length >= TEAMS_PER_PLAYER)
  const assignedCount = allAssigned.length
  const needed = activePlayers.length * TEAMS_PER_PLAYER

  function onDragStart(teamName: string) { setDragTeam(teamName) }

  function onDrop(player: string) {
    if (!dragTeam) return
    if (allAssigned.includes(dragTeam)) return
    const current = assign[player] || []
    if (current.length >= TEAMS_PER_PLAYER) return
    setAssign(prev => ({ ...prev, [player]: [...current, dragTeam] }))
    setDragTeam(null)
  }

  function unassign(teamName: string, player: string) {
    setAssign(prev => ({ ...prev, [player]: prev[player].filter(t => t !== teamName) }))
  }

  function autoAssign() {
    const remaining = shuffle(TEAMS.map(t => t.n).filter(n => !allAssigned.includes(n)))
    let ri = 0
    const newAssign = { ...assign }
    activePlayers.forEach(p => {
      while ((newAssign[p] || []).length < TEAMS_PER_PLAYER && ri < remaining.length) {
        newAssign[p] = [...(newAssign[p] || []), remaining[ri]]
        ri++
      }
    })
    setAssign(newAssign)
  }

  async function saveAndContinue() {
    setSaving(true)
    const payload = activePlayers.map(name => ({ name, teams: assign[name] || [] }))
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players: payload }),
    })
    if (res.ok) {
      await loadData()
      setPage(3)
      setSetupComplete(true)
    } else {
      alert('Error saving — check console')
    }
    setSaving(false)
  }

  // ── PAGE 3 helpers ──
  function getOwner(teamName: string): string | null {
    for (const [p, teams] of Object.entries(assign)) {
      if (teams.includes(teamName)) return p
    }
    return null
  }

  function getTeamData(name: string) {
    return TEAMS.find(t => t.n === name)
  }

  // Net fines per player
  const netFines: Record<string, number> = {}
  activePlayers.forEach(p => { netFines[p] = 0 })
  fines.forEach(f => {
    if (netFines[f.from_player] !== undefined) netFines[f.from_player]--
    if (netFines[f.to_player] !== undefined) netFines[f.to_player]++
  })

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5f0e8',fontFamily:'sans-serif',fontSize:'1.1rem',color:'#9a8f7a'}}>
      Loading sweepstake data...
    </div>
  )

  return (
    <div style={{fontFamily:"'Archivo', sans-serif",background:'#f5f0e8',minHeight:'100vh',color:'#1a1508'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@300;400;500;600&family=Roboto+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input{font-family:inherit;}
        .chip{display:inline-flex;align-items:center;gap:5px;background:#fff;border:1.5px solid #ddd5c0;border-radius:6px;padding:5px 9px;cursor:grab;font-size:.75rem;font-weight:500;transition:all .12s;user-select:none;margin:3px;}
        .chip:hover{border-color:#1a1508;box-shadow:0 2px 8px rgba(0,0,0,.1);transform:translateY(-1px);}
        .chip.used{background:#e8f5ee;border-color:#1a6b3a;color:#1a6b3a;cursor:default;opacity:.6;}
        .chip.used:hover{transform:none;box-shadow:none;}
        .dz{background:#fff;border:1.5px dashed #c8bfa8;border-radius:8px;padding:9px 11px;min-height:80px;transition:all .15s;}
        .dz.hover{border-color:#1a6b3a;border-style:solid;background:#e8f5ee;}
        .dz.full{border-style:solid;border-color:#ddd5c0;}
        .ac{display:inline-flex;align-items:center;gap:4px;background:#f0ebe0;border:1px solid #ddd5c0;border-radius:5px;padding:3px 7px;font-size:.7rem;cursor:pointer;transition:all .12s;margin:2px;}
        .ac:hover{border-color:#c0392b;background:#fdecea;color:#c0392b;}
        .tab{padding:7px 18px;border:none;background:transparent;font-family:'Roboto Mono',monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:#9a8f7a;cursor:pointer;border-radius:5px;transition:all .15s;}
        .tab.active{background:#1a1508;color:#fff;}
        .tab.fines{color:#c0392b;}
        .tab.fines.active{background:#c0392b;color:#fff;}
        .btn{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:8px;border:none;cursor:pointer;font-family:'Archivo',sans-serif;font-size:.85rem;font-weight:600;transition:all .15s;}
        .btn-dark{background:#1a1508;color:#fff;}
        .btn-dark:hover{background:#2d2510;transform:translateY(-1px);}
        .btn-outline{background:transparent;color:#1a1508;border:1.5px solid #c8bfa8;}
        .btn-outline:hover{border-color:#1a1508;}
        .btn-green{background:#1a6b3a;color:#fff;}
        .btn-green:hover{background:#145530;transform:translateY(-1px);}
        .btn-gold{background:#b8860a;color:#fff;}
        .btn-gold:hover{background:#a07208;transform:translateY(-1px);}
        .btn:disabled{opacity:.35;cursor:not-allowed;transform:none!important;}
        table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #ddd5c0;}
        th{background:#1a1508;color:#fff;font-family:'Roboto Mono',monospace;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;padding:10px 14px;text-align:left;font-weight:500;}
        th.r{text-align:right;}
        td{padding:11px 14px;border-bottom:1px solid #ddd5c0;font-size:.85rem;vertical-align:middle;}
        td.r{text-align:right;font-family:'Roboto Mono',monospace;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#f0ebe0;}
      `}</style>

      {/* HEADER */}
      <header style={{background:'#1a1508',color:'#fff',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'58px',position:'sticky',top:0,zIndex:500}}>
        <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.05rem',letterSpacing:'.06em'}}>
          WC<span style={{color:'#e8c43a'}}>2026</span> SWEEPSTAKE
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'4px',fontFamily:"'Roboto Mono',monospace",fontSize:'.68rem',letterSpacing:'.08em',textTransform:'uppercase'}}>
          {[{n:'Players',p:1},{n:'Assign',p:2},{n:'Results',p:3}].map(({n,p})=>(
            <div key={p} style={{padding:'5px 14px',borderRadius:'4px',color: page===p?'#fff': p<page?'#e8c43a':'rgba(255,255,255,.3)',background: page===p?'rgba(255,255,255,.08)':'transparent',border: page===p?'1px solid rgba(255,255,255,.15)':'1px solid transparent'}}>
              {p}. {n}
            </div>
          ))}
        </div>
      </header>

      {/* ══ PAGE 1 ══ */}
      {page === 1 && (
        <div style={{maxWidth:'780px',margin:'0 auto',padding:'48px 40px'}}>
          <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'#9a8f7a',marginBottom:'8px'}}>Step 1 of 3</div>
          <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'3.5rem',lineHeight:'.95',marginBottom:'8px'}}>WHO'S<br/>PLAYING?</div>
          <div style={{color:'#4a4030',fontSize:'.88rem',lineHeight:'1.6',marginBottom:'40px'}}>Enter up to 16 players. Each gets {TEAMS_PER_PLAYER} teams from the 48-team World Cup 2026.</div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'9px',marginBottom:'28px'}}>
            {Array.from({length:16},(_,i)=>(
              <div key={i} style={{background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',padding:'10px 12px',display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.68rem',color:'#9a8f7a',minWidth:'18px'}}>{String(i+1).padStart(2,'0')}</span>
                <input
                  style={{background:'transparent',border:'none',outline:'none',fontSize:'.85rem',color:'#1a1508',width:'100%'}}
                  placeholder={`Player ${i+1}`}
                  value={playerNames[i]}
                  onChange={e => {
                    const n = [...playerNames]
                    n[i] = e.target.value.trim()
                    setPlayerNames(n)
                  }}
                  maxLength={20}
                />
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:'9px',flexWrap:'wrap'}}>
            <button className="btn btn-outline" onClick={() => setPlayerNames(Array(16).fill(''))}>Clear</button>
            <button className="btn btn-gold" onClick={autoFillNames}>🎲 Auto-fill Names</button>
            <button className="btn btn-dark" onClick={goToAssign}>Next: Assign Teams →</button>
          </div>
        </div>
      )}

      {/* ══ PAGE 2 ══ */}
      {page === 2 && (
        <div style={{display:'flex',flexDirection:'column',minHeight:'calc(100vh - 58px)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 290px',flex:1}}>
            {/* Teams Pool */}
            <div style={{padding:'24px 28px',borderRight:'1px solid #ddd5c0',overflowY:'auto'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px'}}>
                <h2 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.4rem'}}>48 Teams — WC 2026</h2>
                <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.72rem',color:'#9a8f7a',background:'#f0ebe0',padding:'3px 10px',borderRadius:'20px',border:'1px solid #ddd5c0'}}>
                  {48 - assignedCount} remaining
                </span>
              </div>
              {POTS.map(pot => {
                const potTeams = TEAMS.filter(t => t.s >= pot.range[0] && t.s <= pot.range[1])
                return (
                  <div key={pot.label} style={{marginBottom:'20px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px',fontFamily:"'Roboto Mono',monospace",fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9a8f7a',marginBottom:'8px',paddingBottom:'7px',borderBottom:'1px solid #ddd5c0'}}>
                      <div style={{width:'18px',height:'3px',borderRadius:'2px',background:pot.color}}/>
                      {pot.label}
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap'}}>
                      {potTeams.map(t => {
                        const used = allAssigned.includes(t.n)
                        return (
                          <div
                            key={t.n}
                            className={`chip${used?' used':''}`}
                            draggable={!used}
                            onDragStart={() => !used && onDragStart(t.n)}
                          >
                            <span>{t.f}</span><span>{t.n}</span>
                            <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.55rem',color:'#9a8f7a'}}>#{t.s}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Player Drop Zones */}
            <div style={{padding:'16px',background:'#f0ebe0',overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px'}}>
                <h3 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'.95rem'}}>Players</h3>
                <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.65rem',color:'#9a8f7a'}}>
                  {activePlayers.filter(p=>(assign[p]||[]).length>=TEAMS_PER_PLAYER).length}/{activePlayers.length} full
                </span>
              </div>
              {activePlayers.map(p => {
                const teams = assign[p] || []
                const full = teams.length >= TEAMS_PER_PLAYER
                return (
                  <div
                    key={p}
                    className={`dz${full?' full':''}`}
                    onDragOver={e => { if(!full) e.preventDefault(); e.currentTarget.classList.add('hover') }}
                    onDragLeave={e => e.currentTarget.classList.remove('hover')}
                    onDrop={e => { e.currentTarget.classList.remove('hover'); onDrop(p) }}
                  >
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                      <span style={{fontWeight:600,fontSize:'.82rem'}}>{p}</span>
                      <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.62rem',padding:'1px 6px',borderRadius:'10px',background: full?'#e8f5ee':'#f0ebe0',color: full?'#1a6b3a':'#9a8f7a'}}>
                        {teams.length}/{TEAMS_PER_PLAYER}
                      </span>
                    </div>
                    <div>
                      {teams.length === 0
                        ? <span style={{fontSize:'.72rem',color:'#9a8f7a',fontStyle:'italic'}}>Drop teams here</span>
                        : teams.map(tn => {
                            const td = getTeamData(tn)
                            return (
                              <span key={tn} className="ac" onClick={() => unassign(tn, p)}>
                                <span>{td?.f}</span><span>{tn}</span>
                              </span>
                            )
                          })
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 28px',background:'#fff',borderTop:'1px solid #ddd5c0',flexWrap:'wrap',gap:'10px'}}>
            <div style={{fontSize:'.8rem',color:'#9a8f7a'}}>
              {allFull
                ? <strong style={{color:'#1a1508'}}>All assigned! Ready to save.</strong>
                : <><strong style={{color:'#1a1508'}}>{needed - assignedCount} teams</strong> left to assign</>
              }
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <button className="btn btn-outline" onClick={() => setPage(1)}>← Back</button>
              <button className="btn btn-gold" onClick={autoAssign}>Auto-assign remaining</button>
              <button className="btn btn-green" disabled={!allFull || saving} onClick={saveAndContinue}>
                {saving ? 'Saving...' : 'Save & View Results →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PAGE 3 ══ */}
      {page === 3 && (
        <div style={{padding:'28px 36px',maxWidth:'1400px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'22px',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'#9a8f7a',marginBottom:'4px'}}>WC 2026 · Live</div>
              <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.7rem'}}>SWEEPSTAKE HQ</div>
            </div>
            {!setupComplete && <button className="btn btn-outline" onClick={() => setPage(2)}>← Back</button>}
            <button className="btn btn-outline" onClick={loadData}>↻ Refresh</button>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:'3px',background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',padding:'3px',width:'fit-content',marginBottom:'28px'}}>
            {['squads','table','fines'].map(t => (
              <button key={t} className={`tab${t==='fines'?' fines':''}${activeTab===t?' active':''}`} onClick={() => setActiveTab(t)}>
                {t === 'fines' ? '🍺 Fines' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* SQUADS TAB */}
          {activeTab === 'squads' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
              {players.map((p, i) => (
                <div key={p.id} style={{background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',background:'#1a1508',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'.88rem'}}>{p.name}</span>
                    <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.62rem',opacity:.4}}>{i+1}</span>
                  </div>
                  <div style={{padding:'9px 12px',display:'flex',flexDirection:'column',gap:'5px'}}>
                    {p.teams.map(tn => {
                      const td = getTeamData(tn)
                      return (
                        <div key={tn} style={{display:'flex',alignItems:'center',gap:'7px',padding:'5px 7px',background:'#f0ebe0',borderRadius:'5px',border:'1px solid #ddd5c0',fontSize:'.78rem',fontWeight:500}}>
                          <span>{td?.f}</span><span>{tn}</span>
                          <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.58rem',color:'#9a8f7a',marginLeft:'auto'}}>#{td?.s}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TABLE TAB */}
          {activeTab === 'table' && (
            <div>
              <p style={{fontSize:'.8rem',color:'#9a8f7a',marginBottom:'16px',fontStyle:'italic'}}>Players ranked by net pints — positive means pints coming your way.</p>
              <table>
                <thead>
                  <tr>
                    <th style={{width:'36px'}}>#</th>
                    <th>Player</th>
                    <th>Teams</th>
                    <th className="r">Net Pints 🍺</th>
                  </tr>
                </thead>
                <tbody>
                  {players
                    .map(p => ({...p, net: netFines[p.name] || 0}))
                    .sort((a,b) => b.net - a.net)
                    .map((p, i) => (
                      <tr key={p.id}>
                        <td style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.7rem',color:'#9a8f7a'}}>{i+1}</td>
                        <td><strong>{p.name}</strong></td>
                        <td style={{fontSize:'.78rem'}}>
                          {p.teams.map(tn => {
                            const td = getTeamData(tn)
                            return <span key={tn} style={{marginRight:'6px'}}>{td?.f} {tn}</span>
                          })}
                        </td>
                        <td className="r">
                          <span style={{
                            display:'inline-flex',alignItems:'center',gap:'4px',
                            background: p.net > 0 ? '#e8f5ee' : p.net < 0 ? '#fdecea' : '#f0ebe0',
                            color: p.net > 0 ? '#1a6b3a' : p.net < 0 ? '#c0392b' : '#9a8f7a',
                            border: `1px solid ${p.net > 0 ? '#a0d8b0' : p.net < 0 ? '#e8c0c0' : '#ddd5c0'}`,
                            borderRadius:'6px',padding:'3px 10px',
                            fontFamily:"'Roboto Mono',monospace",fontSize:'.82rem',fontWeight:700
                          }}>
                            {p.net > 0 ? `+${p.net}` : p.net} 🍺
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* FINES TAB */}
          {activeTab === 'fines' && (
            <div>
              <div style={{background:'#1a1508',color:'#fff',borderRadius:'12px',padding:'28px 32px',marginBottom:'28px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',right:'-10px',top:'-18px',fontSize:'9rem',opacity:.07,pointerEvents:'none',lineHeight:1}}>🍺</div>
                <h2 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.8rem',marginBottom:'4px'}}>The Pint Ledger</h2>
                <p style={{fontSize:'.85rem',color:'rgba(255,255,255,.55)',maxWidth:'380px',lineHeight:1.5}}>
                  Your team gets a red card, scores an own goal, or loses by 4+ goals — you buy the opposing player a pint. Max 1 pint per game.
                </p>
                <div style={{background:'#e8c43a',color:'#1a1508',borderRadius:'10px',padding:'14px 24px',display:'inline-block',marginTop:'16px',textAlign:'center'}}>
                  <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'2.2rem',lineHeight:1}}>{fines.length}</div>
                  <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.65rem',letterSpacing:'.08em',textTransform:'uppercase',marginTop:'2px',opacity:.7}}>Pints in Play</div>
                </div>
              </div>

              {fines.length === 0 ? (
                <div style={{background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',padding:'40px',textAlign:'center',color:'#9a8f7a'}}>
                  <div style={{fontSize:'2rem',marginBottom:'8px'}}>🍺</div>
                  <div style={{fontSize:'.9rem'}}>No fines yet — tournament hasn't started or everyone's behaving.</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Type</th><th>Match</th><th>Detail</th>
                      <th>Buys</th><th>Receives</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map(f => (
                      <tr key={f.id}>
                        <td>
                          <span style={{fontSize:'1rem'}}>
                            {f.fine_type === 'red-card' ? '🟥' : f.fine_type === 'own-goal' ? '🤦' : '💀'}
                          </span>
                        </td>
                        <td style={{fontSize:'.78rem'}}>{f.match_label}</td>
                        <td style={{fontSize:'.78rem',color:'#4a4030'}}>{f.detail}</td>
                        <td><strong style={{color:'#c0392b'}}>{f.from_player}</strong></td>
                        <td><strong style={{color:'#1a6b3a'}}>{f.to_player}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
