import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 44331

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(express.json())

// Mock data
// Mock data
const mockFestivals = [
  { name: 'Glastonbury 2024', id: 'glastonbury2024', url: 'https://www.glastonburyfestivals.co.uk', startDate: '2024-06-26', printAdvisory: 1, totalActs: 147 },
  { name: 'Coachella 2024', id: 'coachella2024', url: 'https://www.coachella.com', startDate: '2024-04-12', printAdvisory: 0, totalActs: 85 },
  { name: 'Reading 2024', id: 'reading2024', url: 'https://www.readingfestival.com', startDate: '2024-08-23', printAdvisory: 2, totalActs: 90 },
  { name: 'Leeds 2024', id: 'leeds2024', url: 'https://www.leedsfestival.com', startDate: '2024-08-23', printAdvisory: 2, totalActs: 90 },
]

// Auth endpoints
app.get('/authentication/profile', (req, res) => {
  // Simulate not logged in initially, or logged in based on some logic. 
  // For simplicity, let's say not logged in by default, but we can toggle or just return 401.
  // To test login flow, we might want to return 401 initially.
  res.status(401).json({ error: 'Not logged in' })
})

app.get('/authentication/login', (req, res) => {
  res.json({
    loginUrl: `http://localhost:5173/?login=success`, // Redirect back to app with a param to simulate login
  })
})

app.post('/authentication/logout', (req, res) => {
  res.json({ success: true })
})

// Clashfinder endpoints
app.get('/clashfinders/list/all', (req, res) => {
  res.json(mockFestivals)
})

// Festival matching endpoints
app.get('/festivalmatching/:festival', (req, res) => {
  const { festival } = req.params
  res.json({
    url: `https://clashfinder.com/s/${festival}/?hl1=artist1,artist2`,
    matchedArtistsCount: 35,
    matchedTracksCount: 142,
    tracksPerShow: 0.42,
    rankingMessage: "142 potential tracks across 35 artists from your playlist, 0.42 per show.",
    festival: {
      name: `${festival} Festival`,
      id: festival,
      url: `https://clashfinder.com/s/${festival}/`,
      startDate: new Date(Date.now() + (60 * 60 * 24 * 30 * 1000)).toISOString(),
      printAdvisory: 1,
      totalActs: 150
    }
  })
})

app.get('/festivalmatching/:festival/playlist', (req, res) => {
  const { festival } = req.params
  res.json({
    url: `https://clashfinder.com/s/${festival}/?hl1=artist1,artist2,artist3`,
    matchedArtistsCount: 28,
    matchedTracksCount: 98,
    tracksPerShow: 0.35,
    rankingMessage: "98 potential tracks across 28 artists from your playlist, 0.35 per show.",
    festival: {
      name: `${festival} Festival`,
      id: festival,
      url: `https://clashfinder.com/s/${festival}/`,
      startDate: new Date(Date.now() + (60 * 60 * 24 * 45 * 1000)).toISOString(),
      printAdvisory: 2,
      totalActs: 120
    }
  })
})

// Year-based festival matching endpoints
app.get('/festivalmatching/by-year/:year', (req, res) => {
  const { year } = req.params
  const yearNum = parseInt(year)

  // Generate mock array of festival matches for the year
  // Data is returned unsorted - frontend will handle sorting
  const mockMatches = Array.from({ length: 15 }, (_, i) => {
    const festivalNum = i + 1
    const baseScore = 200 - (i * 10)
    return {
      url: `https://clashfinder.com/s/festival${yearNum}-${festivalNum}/?hl1=artist${festivalNum}`,
      matchedArtistsCount: Math.floor(50 - (i * 2)),
      matchedTracksCount: baseScore,
      tracksPerShow: parseFloat((0.5 - (i * 0.02)).toFixed(2)),
      rankingMessage: `${baseScore} potential tracks across ${50 - (i * 2)} artists from your playlist, ${(0.5 - (i * 0.02)).toFixed(2)} per show.`,
      festival: {
        name: `Festival ${festivalNum} ${year}`,
        id: `festival${yearNum}-${festivalNum}`,
        url: `https://clashfinder.com/s/festival${yearNum}-${festivalNum}/`,
        startDate: new Date(`${year}-${String(i % 12 + 1).padStart(2, '0')}-15T00:00:00`).toISOString(),
        printAdvisory: Math.floor(Math.random() * 5),
        totalActs: 100 + i * 10
      }
    }
  })

  res.json(mockMatches)
})

app.get('/festivalmatching/by-year/:year/playlist', (req, res) => {
  const { year } = req.params
  const yearNum = parseInt(year)

  // Generate mock array of festival matches for the year (playlist mode)
  // Data is returned unsorted - frontend will handle sorting
  const mockMatches = Array.from({ length: 12 }, (_, i) => {
    const festivalNum = i + 1
    const baseScore = 180 - (i * 12)
    return {
      url: `https://clashfinder.com/s/festival${yearNum}-p${festivalNum}/?hl1=artist${festivalNum}`,
      matchedArtistsCount: Math.floor(40 - (i * 2)),
      matchedTracksCount: baseScore,
      tracksPerShow: parseFloat((0.45 - (i * 0.025)).toFixed(2)),
      rankingMessage: `${baseScore} potential tracks across ${40 - (i * 2)} artists from your playlist, ${(0.45 - (i * 0.025)).toFixed(2)} per show.`,
      festival: {
        name: `Festival ${festivalNum} ${year}`,
        id: `festival${yearNum}-p${festivalNum}`,
        url: `https://clashfinder.com/s/festival${yearNum}-p${festivalNum}/`,
        startDate: new Date(`${year}-${String(i % 12 + 1).padStart(2, '0')}-20T00:00:00`).toISOString(),
        printAdvisory: Math.floor(Math.random() * 5),
        totalActs: 90 + i * 5
      }
    }
  })

  res.json(mockMatches)
})

app.listen(PORT, () => {
  console.log(`🎵 Mock backend running on http://localhost:${PORT}`)
})
