import { NextResponse } from 'next/server'

const API_KEY = process.env.API_FOOTBALL_KEY!

export async function GET() {
  // Check specific fixtures we know should have fines
  const checks = [
    { id: 855757, label: 'South Korea vs Ghana' },      // Ghana red card
    { id: 855761, label: 'Ecuador vs Senegal' },         // Ecuador red card  
    { id: 855756, label: 'Cameroon vs Serbia' },         // Serbia red card
    { id: 871850, label: 'France vs Australia' },        // Australia OG
    { id: 855740, label: 'Morocco vs Croatia' },         // Morocco OG
    { id: 978488, label: 'France vs Morocco SF' },       // Morocco OG
  ]

  const results = []
  for (const check of checks) {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/events?fixture=${check.id}`,
      { headers: { 'x-apisports-key': API_KEY }, cache: 'no-store' }
    )
    const data = await res.json()
    const interesting = (data.response || []).filter((e: any) =>
      (e.type === 'Card' && e.detail === 'Red Card') ||
      (e.type === 'Goal' && e.detail === 'Own Goal')
    )
    results.push({ fixture: check.label, id: check.id, events: interesting })
  }

  return NextResponse.json(results)
}

