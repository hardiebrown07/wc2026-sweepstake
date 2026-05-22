'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Player, Fine } from '@/lib/types'

const TEAMS_2026 = [
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

const TEAMS_2022 = [
  {s:1,n:"Argentina",f:"🇦🇷"},{s:2,n:"France",f:"🇫🇷"},{s:3,n:"England",f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
  {s:4,n:"Brazil",f:"🇧🇷"},{s:5,n:"Spain",f:"🇪🇸"},{s:6,n:"Germany",f:"🇩🇪"},
  {s:7,n:"Portugal",f:"🇵🇹"},{s:8,n:"Netherlands",f:"🇳🇱"},{s:9,n:"Belgium",f:"🇧🇪"},
  {s:10,n:"Croatia",f:"🇭🇷"},{s:11,n:"Morocco",f:"🇲🇦"},{s:12,n:"Uruguay",f:"🇺🇾"},
  {s:13,n:"USA",f:"🇺🇸"},{s:14,n:"Mexico",f:"🇲🇽"},{s:15,n:"Denmark",f:"🇩🇰"},
  {s:16,n:"Japan",f:"🇯🇵"},{s:17,n:"South Korea",f:"🇰🇷"},{s:18,n:"Senegal",f:"🇸🇳"},
  {s:19,n:"Poland",f:"🇵🇱"},{s:20,n:"Switzerland",f:"🇨🇭"},{s:21,n:"Australia",f:"🇦🇺"},
  {s:22,n:"Ecuador",f:"🇪🇨"},{s:23,n:"Tunisia",f:"🇹🇳"},{s:24,n:"Canada",f:"🇨🇦"},
  {s:25,n:"Iran",f:"🇮🇷"},{s:26,n:"Saudi Arabia",f:"🇸🇦"},{s:27,n:"Ghana",f:"🇬🇭"},
  {s:28,n:"Serbia",f:"🇷🇸"},{s:29,n:"Costa Rica",f:"🇨🇷"},{s:30,n:"Cameroon",f:"🇨🇲"},
  {s:31,n:"Qatar",f:"🇶🇦"},{s:32,n:"Wales",f:"🏴󠁧󠁢󠁷󠁬󠁳󠁿"},
]

const POTS_2026 = [
  {label:"Pot 1 — Favourites",    color:"#1a6b3a", range:[1,12]},
  {label:"Pot 2 — Strong Nations",color:"#1a3a6b", range:[13,24]},
  {label:"Pot 3 — Dark Horses",   color:"#c8960a", range:[25,36]},
  {label:"Pot 4 — Underdogs",     color:"#c0392b", range:[37,48]},
]

const POTS_2022 = [
  {label:"Pot 1 — Favourites",    color:"#1a6b3a", range:[1,8]},
  {label:"Pot 2 — Strong Nations",color:"#1a3a6b", range:[9,16]},
  {label:"Pot 3 — Dark Horses",   color:"#c8960a", range:[17,24]},
  {label:"Pot 4 — Underdogs",     color:"#c0392b", range:[25,32]},
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

type Mode = '2022' | '2026'

interface GroupEntry { name:string; flag:string; p:number; w:number; d:number; l:number; gf:number; ga:number; gd:number; pts:number; rank:number }
interface BracketMatch { id:number; round:string; home:string; homeFlag:string; homeScore:number|null; away:string; awayFlag:string; awayScore:number|null; winner:string|null; status:string; penHome:number|null; penAway:number|null }

export default function Home() {
  const [page, setPage] = useState(3)
  const [mode, setMode] = useState<Mode>('2026')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminInput, setAdminInput] = useState('')
  const [adminError, setAdminError] = useState(false)
  const [playerNames, setPlayerNames] = useState<string[]>(Array(16).fill(''))
  const [players, setPlayers] = useState<Player[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [assign, setAssign] = useState<Record<string, string[]>>({})
  const [dragTeam, setDragTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('squads')
  const [groups, setGroups] = useState<GroupEntry[][]>([])
  const [bracket, setBracket] = useState<BracketMatch[]>([])
  const [tournamentLoading, setTournamentLoading] = useState(false)

  const TEAMS = mode === '2022' ? TEAMS_2022 : TEAMS_2026
  const POTS  = mode === '2022' ? POTS_2022  : POTS_2026
  const TEAMS_PER_PLAYER = mode === '2022' ? 2 : 3
  const TOTAL_TEAMS = mode === '2022' ? 32 : 48

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (activeTab === 'groups' || activeTab === 'bracket') loadTournamentData()
  }, [activeTab, mode])

  async function loadData() {
    setLoading(true)
    const [playersRes, finesRes, settingsRes] = await Promise.all([
      supabase.from('players').select('*').order('created_at'),
      supabase.from('fines').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 1).single(),
    ])
    if (playersRes.data) {
      setPlayers(playersRes.data)
      const a: Record<string, string[]> = {}
      playersRes.data.forEach((p: Player) => { a[p.name] = p.teams })
      setAssign(a)
    }
    if (finesRes.data) setFines(finesRes.data)
    if (settingsRes.data) {
      const m = settingsRes.data.mode as Mode
      if (m) setMode(m)
      if (settingsRes.data.setup_complete) setPage(3)
    }
    setLoading(false)
  }

  async function loadTournamentData() {
    setTournamentLoading(true)
    try {
      const res = await fetch(`/api/tournament-data?season=${mode}`)
      const data = await res.json()
      if (data.groups) setGroups(data.groups)
      if (data.bracket) setBracket(data.bracket)
    } catch (e) { console.error(e) }
    setTournamentLoading(false)
  }

  function tryAdminLogin() {
    if (adminInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAdmin(true); setShowAdminModal(false)
      setAdminInput(''); setAdminError(false); setPage(1)
    } else { setAdminError(true) }
  }

  async function switchMode(newMode: Mode) {
    setMode(newMode)
    setAssign({})
    setPlayerNames(Array(16).fill(''))
    setGroups([]); setBracket([])
    await supabase.from('settings').update({ mode: newMode, setup_complete: false }).eq('id', 1)
  }

  const activePlayers = playerNames.filter(Boolean)
  function autoFillNames() { setPlayerNames(shuffle(SAMPLE_NAMES).slice(0, 16)) }

  function goToAssign() {
    if (activePlayers.length < 2) { alert('Enter at least 2 players.'); return }
    if (activePlayers.length * TEAMS_PER_PLAYER > TOTAL_TEAMS) {
      alert(`Too many players for ${mode} mode.`); return
    }
    const a: Record<string, string[]> = {}
    activePlayers.forEach(p => { a[p] = assign[p] || [] })
    setAssign(a); setPage(2)
  }

  const allAssigned = Object.values(assign).flat()
  const allFull = activePlayers.every(p => (assign[p] || []).length >= TEAMS_PER_PLAYER)
  const assignedCount = allAssigned.length
  const needed = activePlayers.length * TEAMS_PER_PLAYER

  function onDrop(player: string) {
    if (!dragTeam || allAssigned.includes(dragTeam)) return
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
        newAssign[p] = [...(newAssign[p] || []), remaining[ri]]; ri++
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
      await supabase.from('settings').update({ mode, setup_complete: true }).eq('id', 1)
      await loadData(); setPage(3); setIsAdmin(false)
    } else alert('Error saving')
    setSaving(false)
  }

  async function runImport() {
    setImporting(true); setImportResult(null)
    const res = await fetch('/api/import-2022')
    const data = await res.json()
    setImportResult(data.finesInserted !== undefined
      ? `✅ Done! ${data.finesInserted} fines imported across ${data.fixturesProcessed} fixtures.`
      : `❌ Error: ${JSON.stringify(data)}`)
    await loadData()
    setImporting(false)
  }

  function getTeamData(name: string) {
    return TEAMS_2022.find(t=>t.n===name) || TEAMS_2026.find(t=>t.n===name)
  }

  function getOwner(teamName: string) {
    for (const [p, teams] of Object.entries(assign)) {
      if (teams.includes(teamName)) return p
    }
    return null
  }

  const netFines: Record<string, number> = {}
  players.forEach(p => { netFines[p.name] = 0 })
  fines.forEach(f => {
    if (netFines[f.from_player] !== undefined) netFines[f.from_player]--
    if (netFines[f.to_player] !== undefined) netFines[f.to_player]++
  })

  const finesByType = {
    redCards: fines.filter(f => f.fine_type === 'red-card'),
    ownGoals: fines.filter(f => f.fine_type === 'own-goal'),
    hammered: fines.filter(f => f.fine_type === 'hammered'),
  }

  const noData = players.length === 0
  const modeBg = mode === '2022' ? '#1a3a6b' : '#1a1508'
  const modeLabel = mode === '2022' ? '⚙️ Test Mode — Qatar 2022' : '🏆 WC 2026'

  const ROUND_ORDER = ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final']
  const bracketRounds = ROUND_ORDER.map(r => ({
    label: r,
    matches: bracket.filter(m => m.round === r)
  })).filter(r => r.matches.length > 0)
  const thirdPlace = bracket.filter(m => m.round === '3rd Place Final')

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5f0e8',fontFamily:'sans-serif',color:'#9a8f7a'}}>
      Loading...
    </div>
  )

  return (
    <div style={{fontFamily:"'Archivo',sans-serif",background:'#f5f0e8',minHeight:'100vh',color:'#1a1508'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@300;400;500;600&family=Roboto+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input{font-family:inherit;}
        .chip{display:inline-flex;align-items:center;gap:5px;background:#fff;border:1.5px solid #ddd5c0;border-radius:6px;padding:5px 9px;cursor:grab;font-size:.75rem;font-weight:500;transition:all .12s;user-select:none;margin:3px;}
        .chip:hover{border-color:#1a1508;box-shadow:0 2px 8px rgba(0,0,0,.1);transform:translateY(-1px);}
        .chip.used{background:#e8f5ee;border-color:#1a6b3a;color:#1a6b3a;cursor:default;opacity:.6;}
        .chip.used:hover{transform:none;box-shadow:none;}
        .dz{background:#fff;border:1.5px dashed #c8bfa8;border-radius:8px;padding:9px 11px;min-height:80px;transition:all .15s;}
        .dz.drag-over{border-color:#1a6b3a;border-style:solid;background:#e8f5ee;}
        .dz.full{border-style:solid;border-color:#ddd5c0;}
        .ac{display:inline-flex;align-items:center;gap:4px;background:#f0ebe0;border:1px solid #ddd5c0;border-radius:5px;padding:3px 7px;font-size:.7rem;cursor:pointer;transition:all .12s;margin:2px;}
        .ac:hover{border-color:#c0392b;background:#fdecea;color:#c0392b;}
        .tab{padding:7px 16px;border:none;background:transparent;font-family:'Roboto Mono',monospace;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:#9a8f7a;cursor:pointer;border-radius:5px;transition:all .15s;}
        .tab.active{background:#1a1508;color:#fff;}
        .tab.fines{color:#c0392b;}
        .tab.fines.active{background:#c0392b;color:#fff;}
        .btn{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:8px;border:none;cursor:pointer;font-family:'Archivo',sans-serif;font-size:.85rem;font-weight:600;transition:all .15s;}
        .btn-dark{background:#1a1508;color:#fff;}
        .btn-outline{background:transparent;color:#1a1508;border:1.5px solid #c8bfa8;}
        .btn-outline:hover{border-color:#1a1508;}
        .btn-green{background:#1a6b3a;color:#fff;}
        .btn-gold{background:#b8860a;color:#fff;}
        .btn-red{background:#c0392b;color:#fff;}
        .btn-blue{background:#1a3a6b;color:#fff;}
        .btn:disabled{opacity:.35;cursor:not-allowed;}
        table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #ddd5c0;}
        th{background:#1a1508;color:#fff;font-family:'Roboto Mono',monospace;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;padding:10px 14px;text-align:left;font-weight:500;}
        th.r{text-align:right;}
        td{padding:10px 14px;border-bottom:1px solid #ddd5c0;font-size:.84rem;}
        td.r{text-align:right;font-family:'Roboto Mono',monospace;font-size:.78rem;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#f0ebe0;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;}
        .modal{background:#fff;border-radius:12px;padding:32px;width:380px;max-width:90vw;}
        .fine-section{margin-bottom:24px;}
        .fine-section-hdr{display:flex;align-items:center;gap:8px;font-family:'Roboto Mono',monospace;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:#9a8f7a;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #ddd5c0;}
        .fine-card{display:flex;align-items:flex-start;gap:12px;background:#fff;border:1px solid #ddd5c0;border-radius:8px;padding:12px 14px;margin-bottom:8px;}
        .fine-card:hover{border-color:#c8bfa8;}
        .fine-icon{width:34px;height:34px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .fine-icon.rc{background:#fdecea;}
        .fine-icon.og{background:#fff3cd;}
        .fine-icon.hm{background:#e8eef8;}
        .fine-body{flex:1;}
        .fine-match{font-size:.82rem;font-weight:600;margin-bottom:2px;}
        .fine-detail{font-size:.74rem;color:#9a8f7a;font-family:'Roboto Mono',monospace;}
        .fine-arrow{display:flex;align-items:center;gap:6px;font-size:.78rem;margin-top:6px;}
        .fine-from{color:#c0392b;font-weight:600;}
        .fine-to{color:#1a6b3a;font-weight:600;}
        .grp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px;}
        .grp-card{background:#fff;border:1px solid #ddd5c0;border-radius:8px;overflow:hidden;}
        .grp-hd{padding:8px 14px;background:#1a3a6b;color:#fff;font-family:'Roboto Mono',monospace;font-size:.7rem;letter-spacing:.1em;display:flex;align-items:center;justify-content:space-between;}
        .grp-tbl{width:100%;border-collapse:collapse;}
        .grp-tbl th{background:transparent;color:#9a8f7a;font-family:'Roboto Mono',monospace;font-size:.58rem;letter-spacing:.08em;padding:5px 8px;border-bottom:1px solid #ddd5c0;text-transform:uppercase;}
        .grp-tbl th.r{text-align:right;}
        .grp-tbl td{padding:6px 8px;border-bottom:1px solid rgba(221,213,192,.4);font-size:.76rem;}
        .grp-tbl td.r{text-align:right;font-family:'Roboto Mono',monospace;font-size:.7rem;}
        .grp-tbl tr:last-child td{border-bottom:none;}
        .grp-tbl tr.q td:first-child{border-left:3px solid #1a6b3a;font-weight:600;}
        .owner-tag{font-family:'Roboto Mono',monospace;font-size:.58rem;color:#9a8f7a;display:block;}
        .bracket-wrap{overflow-x:auto;padding-bottom:16px;}
        .rounds-row{display:flex;align-items:flex-start;gap:0;}
        .round-col{display:flex;flex-direction:column;min-width:168px;}
        .round-lbl{font-family:'Roboto Mono',monospace;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#9a8f7a;padding:0 8px 10px;text-align:center;}
        .matches-col{display:flex;flex-direction:column;gap:8px;padding:0 8px;justify-content:space-around;flex:1;}
        .ko-match{background:#fff;border:1px solid #ddd5c0;border-radius:7px;padding:7px 10px;min-width:150px;}
        .ko-match.has-winner .ko-team.winner{background:#e8f5ee;border-radius:4px;}
        .ko-team{display:flex;align-items:center;gap:6px;padding:3px 4px;font-size:.74rem;}
        .ko-flag{font-size:.9rem;flex-shrink:0;}
        .ko-name{flex:1;font-weight:500;}
        .ko-score{font-family:'Roboto Mono',monospace;font-size:.74rem;font-weight:700;min-width:14px;text-align:right;}
        .ko-sep{height:1px;background:#ddd5c0;margin:3px 0;}
        .ko-pen{font-family:'Roboto Mono',monospace;font-size:.58rem;color:#9a8f7a;text-align:center;margin-top:3px;}
        .ko-owner{font-family:'Roboto Mono',monospace;font-size:.58rem;color:#1a6b3a;text-align:center;margin-top:2px;}
        .r-conn{width:20px;display:flex;align-items:center;justify-content:center;padding-top:20px;color:#ddd5c0;font-size:1.1rem;}
      `}</style>

      {/* ADMIN MODAL */}
      {showAdminModal && (
        <div className="modal-bg" onClick={() => setShowAdminModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.3rem',marginBottom:'6px'}}>Admin Access</div>
            <div style={{fontSize:'.82rem',color:'#9a8f7a',marginBottom:'20px'}}>Enter the admin password to manage the sweepstake.</div>
            <input type="password" placeholder="Password" value={adminInput}
              onChange={e=>{setAdminInput(e.target.value);setAdminError(false)}}
              onKeyDown={e=>e.key==='Enter'&&tryAdminLogin()}
              style={{width:'100%',padding:'10px 14px',border:`1.5px solid ${adminError?'#c0392b':'#ddd5c0'}`,borderRadius:'8px',fontSize:'.9rem',outline:'none',marginBottom:'8px'}}
              autoFocus/>
            {adminError && <div style={{fontSize:'.75rem',color:'#c0392b',marginBottom:'8px'}}>Incorrect password</div>}
            <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
              <button className="btn btn-outline" style={{flex:1}} onClick={()=>setShowAdminModal(false)}>Cancel</button>
              <button className="btn btn-dark" style={{flex:1}} onClick={tryAdminLogin}>Enter</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{background:modeBg,color:'#fff',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'58px',position:'sticky',top:0,zIndex:500,transition:'background .3s'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.05rem',letterSpacing:'.06em'}}>
            WC<span style={{color:'#e8c43a'}}>{mode}</span> SWEEPSTAKE
          </div>
          <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'3px 10px',borderRadius:'20px',fontFamily:"'Roboto Mono',monospace",fontSize:'.62rem',background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.7)'}}>
            {modeLabel}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {isAdmin && (
            <div style={{display:'flex',alignItems:'center',gap:'4px',fontFamily:"'Roboto Mono',monospace",fontSize:'.65rem',letterSpacing:'.08em',textTransform:'uppercase'}}>
              {[{n:'Players',p:1},{n:'Assign',p:2},{n:'Results',p:3}].map(({n,p})=>(
                <div key={p} onClick={()=>setPage(p)} style={{padding:'4px 12px',borderRadius:'4px',cursor:'pointer',
                  color:page===p?'#fff':p<page?'#e8c43a':'rgba(255,255,255,.3)',
                  background:page===p?'rgba(255,255,255,.08)':'transparent',
                  border:page===p?'1px solid rgba(255,255,255,.15)':'1px solid transparent'}}>
                  {p}. {n}
                </div>
              ))}
            </div>
          )}
          {isAdmin
            ? <button className="btn btn-red" style={{padding:'6px 14px',fontSize:'.75rem'}} onClick={()=>{setIsAdmin(false);setPage(3)}}>Exit Admin</button>
            : <button className="btn btn-outline" style={{padding:'6px 14px',fontSize:'.75rem',color:'rgba(255,255,255,.4)',borderColor:'rgba(255,255,255,.15)'}} onClick={()=>setShowAdminModal(true)}>Admin</button>
          }
        </div>
      </header>

      {/* PAGE 1 */}
      {page===1 && isAdmin && (
        <div style={{maxWidth:'820px',margin:'0 auto',padding:'48px 40px'}}>
          <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'#9a8f7a',marginBottom:'8px'}}>Admin · Step 1 of 2</div>
          <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'3.5rem',lineHeight:'.95',marginBottom:'16px'}}>SETUP</div>
          <div style={{background:'#fff',border:'1px solid #ddd5c0',borderRadius:'10px',padding:'18px 20px',marginBottom:'28px'}}>
            <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.7rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9a8f7a',marginBottom:'12px'}}>Tournament Mode</div>
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
              {(['2022','2026'] as Mode[]).map(m => (
                <button key={m} onClick={()=>switchMode(m)} style={{
                  padding:'12px 24px',borderRadius:'8px',border:'none',cursor:'pointer',
                  fontFamily:"'Archivo',sans-serif",fontSize:'.88rem',fontWeight:600,textAlign:'left',
                  background:mode===m?(m==='2022'?'#1a3a6b':'#1a1508'):'#f0ebe0',
                  color:mode===m?'#fff':'#9a8f7a',transition:'all .2s',
                }}>
                  {m==='2022'?'⚙️ Qatar 2022 — Test Mode':'🏆 World Cup 2026 — Live'}
                  <div style={{fontSize:'.7rem',fontWeight:400,marginTop:'2px',opacity:.8}}>
                    {m==='2022'?'32 teams · 2 per player':'48 teams · 3 per player'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{color:'#4a4030',fontSize:'.88rem',lineHeight:'1.6',marginBottom:'28px'}}>
            {mode==='2022'?'Testing with Qatar 2022 data. After setup use the Import button on Page 3 to load all fines.':'Live mode for WC 2026. Each player gets 3 teams.'}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'9px',marginBottom:'28px'}}>
            {Array.from({length:16},(_,i)=>(
              <div key={i} style={{background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',padding:'10px 12px',display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.68rem',color:'#9a8f7a',minWidth:'18px'}}>{String(i+1).padStart(2,'0')}</span>
                <input style={{background:'transparent',border:'none',outline:'none',fontSize:'.85rem',color:'#1a1508',width:'100%'}}
                  placeholder={`Player ${i+1}`} value={playerNames[i]}
                  onChange={e=>{const n=[...playerNames];n[i]=e.target.value.trim();setPlayerNames(n)}} maxLength={20}/>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'9px',flexWrap:'wrap'}}>
            <button className="btn btn-outline" onClick={()=>setPlayerNames(Array(16).fill(''))}>Clear</button>
            <button className="btn btn-gold" onClick={autoFillNames}>🎲 Auto-fill</button>
            <button className="btn btn-dark" onClick={goToAssign}>Next: Assign Teams →</button>
          </div>
        </div>
      )}

      {/* PAGE 2 */}
      {page===2 && isAdmin && (
        <div style={{display:'flex',flexDirection:'column',minHeight:'calc(100vh - 58px)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 290px',flex:1}}>
            <div style={{padding:'24px 28px',borderRight:'1px solid #ddd5c0',overflowY:'auto'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px'}}>
                <h2 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.4rem'}}>{TOTAL_TEAMS} Teams — {mode==='2022'?'Qatar 2022':'WC 2026'}</h2>
                <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.72rem',color:'#9a8f7a',background:'#f0ebe0',padding:'3px 10px',borderRadius:'20px',border:'1px solid #ddd5c0'}}>{TOTAL_TEAMS-assignedCount} remaining</span>
              </div>
              {POTS.map(pot=>{
                const potTeams=TEAMS.filter(t=>t.s>=pot.range[0]&&t.s<=pot.range[1])
                return (
                  <div key={pot.label} style={{marginBottom:'20px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px',fontFamily:"'Roboto Mono',monospace",fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase',color:'#9a8f7a',marginBottom:'8px',paddingBottom:'7px',borderBottom:'1px solid #ddd5c0'}}>
                      <div style={{width:'18px',height:'3px',borderRadius:'2px',background:pot.color}}/>{pot.label}
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap'}}>
                      {potTeams.map(t=>{
                        const used=allAssigned.includes(t.n)
                        return <div key={t.n} className={`chip${used?' used':''}`} draggable={!used} onDragStart={()=>!used&&setDragTeam(t.n)}>
                          <span>{t.f}</span><span>{t.n}</span><span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.55rem',color:'#9a8f7a'}}>#{t.s}</span>
                        </div>
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{padding:'16px',background:'#f0ebe0',overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px'}}>
                <h3 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'.95rem'}}>Players</h3>
                <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.65rem',color:'#9a8f7a'}}>{activePlayers.filter(p=>(assign[p]||[]).length>=TEAMS_PER_PLAYER).length}/{activePlayers.length} full</span>
              </div>
              {activePlayers.map(p=>{
                const teams=assign[p]||[]; const full=teams.length>=TEAMS_PER_PLAYER
                return <div key={p} className={`dz${full?' full':''}`}
                  onDragOver={e=>{if(!full){e.preventDefault();e.currentTarget.classList.add('drag-over')}}}
                  onDragLeave={e=>e.currentTarget.classList.remove('drag-over')}
                  onDrop={e=>{e.currentTarget.classList.remove('drag-over');onDrop(p)}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                    <span style={{fontWeight:600,fontSize:'.82rem'}}>{p}</span>
                    <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.62rem',padding:'1px 6px',borderRadius:'10px',background:full?'#e8f5ee':'#f0ebe0',color:full?'#1a6b3a':'#9a8f7a'}}>{teams.length}/{TEAMS_PER_PLAYER}</span>
                  </div>
                  <div>
                    {teams.length===0?<span style={{fontSize:'.72rem',color:'#9a8f7a',fontStyle:'italic'}}>Drop teams here</span>
                      :teams.map(tn=>{const td=getTeamData(tn);return <span key={tn} className="ac" onClick={()=>unassign(tn,p)}><span>{td?.f}</span><span>{tn}</span></span>})}
                  </div>
                </div>
              })}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 28px',background:'#fff',borderTop:'1px solid #ddd5c0',flexWrap:'wrap',gap:'10px'}}>
            <div style={{fontSize:'.8rem',color:'#9a8f7a'}}>
              {allFull?<strong style={{color:'#1a1508'}}>All assigned!</strong>:<><strong style={{color:'#1a1508'}}>{needed-assignedCount} teams</strong> left</>}
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <button className="btn btn-outline" onClick={()=>setPage(1)}>← Back</button>
              <button className="btn btn-gold" onClick={autoAssign}>Auto-assign remaining</button>
              <button className="btn btn-green" disabled={!allFull||saving} onClick={saveAndContinue}>{saving?'Saving...':'Save & Go Live →'}</button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 3 */}
      {page===3 && (
        <div style={{padding:'28px 36px',maxWidth:'1400px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'22px',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'#9a8f7a',marginBottom:'4px'}}>
                {mode==='2022'?'Qatar 2022 · Test Mode':'WC 2026 · Live'}
              </div>
              <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.7rem'}}>SWEEPSTAKE HQ</div>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
              {isAdmin && mode==='2022' && (
                <button className="btn btn-blue" onClick={runImport} disabled={importing} style={{fontSize:'.82rem',padding:'8px 16px'}}>
                  {importing?'Importing...':'⬇ Import 2022 Data'}
                </button>
              )}
              <button className="btn btn-outline" onClick={loadData}>↻ Refresh</button>
            </div>
          </div>

          {importResult && (
            <div style={{background:'#e8f5ee',border:'1px solid #a0d8b0',borderRadius:'8px',padding:'12px 16px',marginBottom:'20px',fontSize:'.85rem',color:'#1a6b3a'}}>
              {importResult}
            </div>
          )}

          {noData ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'50vh',textAlign:'center',gap:'16px'}}>
              <div style={{fontSize:'4rem'}}>⚽</div>
              <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.8rem'}}>The Sweepstake Awaits</div>
              <div style={{fontSize:'.9rem',color:'#9a8f7a',maxWidth:'400px',lineHeight:1.6}}>Setup hasn't happened yet. Hit Admin in the top right to run the draw.</div>
            </div>
          ) : (
            <>
              {/* TABS */}
              <div style={{display:'flex',gap:'3px',background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',padding:'3px',width:'fit-content',marginBottom:'28px',flexWrap:'wrap'}}>
                {['squads','table','groups','bracket','fines'].map(t=>(
                  <button key={t} className={`tab${t==='fines'?' fines':''}${activeTab===t?' active':''}`} onClick={()=>setActiveTab(t)}>
                    {t==='fines'?'🍺 Fines':t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>

              {/* SQUADS */}
              {activeTab==='squads' && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
                  {players.map((p,i)=>(
                    <div key={p.id} style={{background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',overflow:'hidden'}}>
                      <div style={{padding:'10px 14px',background:modeBg,color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'.88rem'}}>{p.name}</span>
                        <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.62rem',opacity:.4}}>{i+1}</span>
                      </div>
                      <div style={{padding:'9px 12px',display:'flex',flexDirection:'column',gap:'5px'}}>
                        {p.teams.map(tn=>{
                          const td=getTeamData(tn)
                          return <div key={tn} style={{display:'flex',alignItems:'center',gap:'7px',padding:'5px 7px',background:'#f0ebe0',borderRadius:'5px',border:'1px solid #ddd5c0',fontSize:'.78rem',fontWeight:500}}>
                            <span>{td?.f}</span><span>{tn}</span>
                            <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.58rem',color:'#9a8f7a',marginLeft:'auto'}}>#{td?.s}</span>
                          </div>
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TABLE */}
              {activeTab==='table' && (
                <div>
                  <p style={{fontSize:'.8rem',color:'#9a8f7a',marginBottom:'16px',fontStyle:'italic'}}>Net pints — positive means pints coming your way.</p>
                  <table>
                    <thead><tr>
                      <th style={{width:'36px'}}>#</th><th>Player</th><th>Teams</th><th className="r">Net Pints 🍺</th>
                    </tr></thead>
                    <tbody>
                      {players.map(p=>({...p,net:netFines[p.name]||0})).sort((a,b)=>b.net-a.net).map((p,i)=>(
                        <tr key={p.id}>
                          <td style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.7rem',color:'#9a8f7a'}}>{i+1}</td>
                          <td><strong>{p.name}</strong></td>
                          <td style={{fontSize:'.78rem'}}>{p.teams.map(tn=>{const td=getTeamData(tn);return <span key={tn} style={{marginRight:'6px'}}>{td?.f} {tn}</span>})}</td>
                          <td className="r">
                            <span style={{display:'inline-flex',alignItems:'center',gap:'4px',
                              background:p.net>0?'#e8f5ee':p.net<0?'#fdecea':'#f0ebe0',
                              color:p.net>0?'#1a6b3a':p.net<0?'#c0392b':'#9a8f7a',
                              border:`1px solid ${p.net>0?'#a0d8b0':p.net<0?'#e8c0c0':'#ddd5c0'}`,
                              borderRadius:'6px',padding:'3px 10px',fontFamily:"'Roboto Mono',monospace",fontSize:'.82rem',fontWeight:700}}>
                              {p.net>0?`+${p.net}`:p.net} 🍺
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* GROUPS */}
              {activeTab==='groups' && (
                <div>
                  {tournamentLoading ? (
                    <div style={{textAlign:'center',padding:'60px',color:'#9a8f7a'}}>Loading group data...</div>
                  ) : groups.length === 0 ? (
                    <div style={{textAlign:'center',padding:'60px',color:'#9a8f7a'}}>No group data available yet.</div>
                  ) : (
                    <div className="grp-grid">
                      {groups.map((group, gi) => (
                        <div key={gi} className="grp-card">
                          <div className="grp-hd">
                            <span>GROUP {String.fromCharCode(65+gi)}</span>
                            <span style={{opacity:.5,fontSize:'.58rem'}}>Top 2 qualify</span>
                          </div>
                          <table className="grp-tbl">
                            <thead><tr>
                              <th>Team</th>
                              <th className="r">P</th><th className="r">W</th><th className="r">D</th><th className="r">L</th>
                              <th className="r">GF</th><th className="r">GA</th><th className="r">GD</th><th className="r">Pts</th>
                            </tr></thead>
                            <tbody>
                              {group.map((t, ti) => {
                                const owner = getOwner(t.name)
                                const gd = t.gd > 0 ? `+${t.gd}` : String(t.gd)
                                return (
                                  <tr key={t.name} className={ti < 2 ? 'q' : ''}>
                                    <td>
                                      <span style={{marginRight:'4px'}}>{t.flag}</span>
                                      <strong>{t.name}</strong>
                                      {owner && <span className="owner-tag">{owner}</span>}
                                    </td>
                                    <td className="r">{t.p}</td>
                                    <td className="r">{t.w}</td>
                                    <td className="r">{t.d}</td>
                                    <td className="r">{t.l}</td>
                                    <td className="r">{t.gf}</td>
                                    <td className="r">{t.ga}</td>
                                    <td className="r" style={{color:t.gd>0?'#1a6b3a':t.gd<0?'#c0392b':'inherit'}}>{gd}</td>
                                    <td className="r"><strong>{t.pts}</strong></td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BRACKET */}
              {activeTab==='bracket' && (
                <div>
                  {tournamentLoading ? (
                    <div style={{textAlign:'center',padding:'60px',color:'#9a8f7a'}}>Loading bracket data...</div>
                  ) : bracket.length === 0 ? (
                    <div style={{textAlign:'center',padding:'60px',color:'#9a8f7a'}}>No bracket data available yet.</div>
                  ) : (
                    <>
                      <div className="bracket-wrap">
                        <div className="rounds-row">
                          {bracketRounds.map((round, ri) => (
                            <div key={round.label} style={{display:'flex',alignItems:'stretch'}}>
                              <div className="round-col">
                                <div className="round-lbl">{round.label}</div>
                                <div className="matches-col">
                                  {round.matches.map(m => {
                                    const hasPen = m.penHome !== null && m.penAway !== null
                                    const ownerW = m.winner ? getOwner(m.winner) : null
                                    return (
                                      <div key={m.id} className={`ko-match${m.winner?' has-winner':''}`}>
                                        <div className={`ko-team${m.winner===m.home?' winner':''}`}>
                                          <span className="ko-flag">{m.homeFlag}</span>
                                          <span className="ko-name">{m.home}</span>
                                          <span className="ko-score">{m.homeScore ?? '-'}</span>
                                        </div>
                                        <div className="ko-sep"/>
                                        <div className={`ko-team${m.winner===m.away?' winner':''}`}>
                                          <span className="ko-flag">{m.awayFlag}</span>
                                          <span className="ko-name">{m.away}</span>
                                          <span className="ko-score">{m.awayScore ?? '-'}</span>
                                        </div>
                                        {hasPen && <div className="ko-pen">Pens {m.penHome}–{m.penAway}</div>}
                                        {ownerW && <div className="ko-owner">⬆ {ownerW}</div>}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                              {ri < bracketRounds.length - 1 && <div className="r-conn">›</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                      {thirdPlace.length > 0 && (
                        <div style={{marginTop:'24px'}}>
                          <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.62rem',color:'#9a8f7a',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'8px'}}>3rd Place</div>
                          {thirdPlace.map(m => {
                            const hasPen = m.penHome !== null && m.penAway !== null
                            const ownerW = m.winner ? getOwner(m.winner) : null
                            return (
                              <div key={m.id} className={`ko-match${m.winner?' has-winner':''}`} style={{maxWidth:'180px'}}>
                                <div className={`ko-team${m.winner===m.home?' winner':''}`}>
                                  <span className="ko-flag">{m.homeFlag}</span>
                                  <span className="ko-name">{m.home}</span>
                                  <span className="ko-score">{m.homeScore ?? '-'}</span>
                                </div>
                                <div className="ko-sep"/>
                                <div className={`ko-team${m.winner===m.away?' winner':''}`}>
                                  <span className="ko-flag">{m.awayFlag}</span>
                                  <span className="ko-name">{m.away}</span>
                                  <span className="ko-score">{m.awayScore ?? '-'}</span>
                                </div>
                                {hasPen && <div className="ko-pen">Pens {m.penHome}–{m.penAway}</div>}
                                {ownerW && <div className="ko-owner">⬆ {ownerW}</div>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* FINES */}
              {activeTab==='fines' && (
                <div>
                  {/* Hero */}
                  <div style={{background:modeBg,color:'#fff',borderRadius:'12px',padding:'28px 32px',marginBottom:'28px',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',right:'-10px',top:'-18px',fontSize:'9rem',opacity:.07,pointerEvents:'none',lineHeight:1}}>🍺</div>
                    <h2 style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.8rem',marginBottom:'4px'}}>The Pint Ledger</h2>
                    <p style={{fontSize:'.85rem',color:'rgba(255,255,255,.55)',maxWidth:'420px',lineHeight:1.5}}>
                      Red card, own goal, or lose by 4+ — you buy the opposing player a pint. Max 1 pint per game.
                    </p>
                    <div style={{background:'#e8c43a',color:'#1a1508',borderRadius:'10px',padding:'14px 24px',display:'inline-block',marginTop:'16px',textAlign:'center'}}>
                      <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'2.2rem',lineHeight:1}}>{fines.length}</div>
                      <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.65rem',letterSpacing:'.08em',textTransform:'uppercase',marginTop:'2px',opacity:.7}}>Pints in Play</div>
                    </div>
                  </div>

                  {fines.length === 0 ? (
                    <div style={{background:'#fff',border:'1px solid #ddd5c0',borderRadius:'8px',padding:'40px',textAlign:'center',color:'#9a8f7a'}}>
                      <div style={{fontSize:'2rem',marginBottom:'8px'}}>🙌</div>
                      <div>No fines yet.{mode==='2022'&&isAdmin?' Use the Import 2022 Data button above.':''}</div>
                    </div>
                  ) : (
                    <>
                      {/* Net table */}
                      <div style={{marginBottom:'32px'}}>
                        <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:'1.1rem',marginBottom:'6px'}}>Net Pint Ledger</div>
                        <p style={{fontSize:'.78rem',color:'#9a8f7a',marginBottom:'14px',fontStyle:'italic'}}>Positive = pints coming your way. Negative = pints you owe.</p>
                        <table>
                          <thead><tr>
                            <th style={{width:'36px'}}>#</th><th>Player</th><th>Teams</th>
                            <th className="r">Buying</th><th className="r">Receiving</th><th className="r">Net</th>
                          </tr></thead>
                          <tbody>
                            {players.map(p=>({...p,net:netFines[p.name]||0,
                              buying:fines.filter(f=>f.from_player===p.name).length,
                              receiving:fines.filter(f=>f.to_player===p.name).length,
                            })).sort((a,b)=>b.net-a.net).map((p,i)=>(
                              <tr key={p.id}>
                                <td style={{fontFamily:"'Roboto Mono',monospace",fontSize:'.7rem',color:'#9a8f7a'}}>{i+1}</td>
                                <td><strong>{p.name}</strong></td>
                                <td style={{fontSize:'.76rem'}}>{p.teams.map(tn=>{const td=getTeamData(tn);return <span key={tn} style={{marginRight:'5px'}}>{td?.f} {tn}</span>})}</td>
                                <td className="r" style={{color:p.buying>0?'#c0392b':'#9a8f7a'}}>{p.buying > 0 ? `${p.buying} 🍺` : '—'}</td>
                                <td className="r" style={{color:p.receiving>0?'#1a6b3a':'#9a8f7a'}}>{p.receiving > 0 ? `+${p.receiving} 🍺` : '—'}</td>
                                <td className="r">
                                  <span style={{display:'inline-flex',alignItems:'center',gap:'4px',
                                    background:p.net>0?'#e8f5ee':p.net<0?'#fdecea':'#f0ebe0',
                                    color:p.net>0?'#1a6b3a':p.net<0?'#c0392b':'#9a8f7a',
                                    border:`1px solid ${p.net>0?'#a0d8b0':p.net<0?'#e8c0c0':'#ddd5c0'}`,
                                    borderRadius:'6px',padding:'3px 10px',fontFamily:"'Roboto Mono',monospace",fontSize:'.82rem',fontWeight:700}}>
                                    {p.net>0?`+${p.net}`:p.net} 🍺
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Breakdown by type */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
                        <div>
                          {/* Red cards */}
                          <div className="fine-section">
                            <div className="fine-section-hdr">
                              <span>🟥</span> Red Cards <span style={{marginLeft:'auto',background:'#fdecea',color:'#c0392b',borderRadius:'4px',padding:'1px 7px'}}>{finesByType.redCards.length}</span>
                            </div>
                            {finesByType.redCards.length === 0
                              ? <div style={{fontSize:'.8rem',color:'#9a8f7a',fontStyle:'italic'}}>None triggered</div>
                              : finesByType.redCards.map(f => (
                                <div key={f.id} className="fine-card">
                                  <div className="fine-icon rc">🟥</div>
                                  <div className="fine-body">
                                    <div className="fine-match">{f.match_label}</div>
                                    <div className="fine-detail">{f.detail}</div>
                                    <div className="fine-arrow">
                                      <span className="fine-from">{f.from_player}</span>
                                      <span style={{color:'#9a8f7a'}}>→</span>
                                      <span className="fine-to">{f.to_player}</span>
                                      <span style={{color:'#9a8f7a',marginLeft:'4px'}}>🍺</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>

                          {/* Own goals */}
                          <div className="fine-section">
                            <div className="fine-section-hdr">
                              <span>🤦</span> Own Goals <span style={{marginLeft:'auto',background:'#fff3cd',color:'#b8860a',borderRadius:'4px',padding:'1px 7px'}}>{finesByType.ownGoals.length}</span>
                            </div>
                            {finesByType.ownGoals.length === 0
                              ? <div style={{fontSize:'.8rem',color:'#9a8f7a',fontStyle:'italic'}}>None triggered</div>
                              : finesByType.ownGoals.map(f => (
                                <div key={f.id} className="fine-card">
                                  <div className="fine-icon og">🤦</div>
                                  <div className="fine-body">
                                    <div className="fine-match">{f.match_label}</div>
                                    <div className="fine-detail">{f.detail}</div>
                                    <div className="fine-arrow">
                                      <span className="fine-from">{f.from_player}</span>
                                      <span style={{color:'#9a8f7a'}}>→</span>
                                      <span className="fine-to">{f.to_player}</span>
                                      <span style={{color:'#9a8f7a',marginLeft:'4px'}}>🍺</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        {/* Hammerings */}
                        <div>
                          <div className="fine-section">
                            <div className="fine-section-hdr">
                              <span>💀</span> Hammerings (lost by 4+) <span style={{marginLeft:'auto',background:'#e8eef8',color:'#1a3a6b',borderRadius:'4px',padding:'1px 7px'}}>{finesByType.hammered.length}</span>
                            </div>
                            {finesByType.hammered.length === 0
                              ? <div style={{fontSize:'.8rem',color:'#9a8f7a',fontStyle:'italic'}}>None triggered</div>
                              : finesByType.hammered.map(f => (
                                <div key={f.id} className="fine-card">
                                  <div className="fine-icon hm">💀</div>
                                  <div className="fine-body">
                                    <div className="fine-match">{f.match_label}</div>
                                    <div className="fine-detail">{f.detail}</div>
                                    <div className="fine-arrow">
                                      <span className="fine-from">{f.from_player}</span>
                                      <span style={{color:'#9a8f7a'}}>→</span>
                                      <span className="fine-to">{f.to_player}</span>
                                      <span style={{color:'#9a8f7a',marginLeft:'4px'}}>🍺</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
