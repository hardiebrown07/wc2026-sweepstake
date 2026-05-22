export type Player = {
    id: string
    name: string
    teams: string[]
    created_at: string
  }
  
  export type Fine = {
    id: string
    from_player: string
    to_player: string
    off_team: string
    opp_team: string
    fine_type: 'red-card' | 'own-goal' | 'hammered'
    match_label: string
    detail: string
    match_id: string
    notified: boolean
    created_at: string
  }
  
  export type Settings = {
    id: number
    tournament_year: number
    season: number
    league_id: number
    setup_complete: boolean
  }