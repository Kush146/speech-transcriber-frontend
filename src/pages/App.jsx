import React, { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import Recorder from '../components/Recorder'
import TranscriptionCard from '../components/TranscriptionCard'

const PROVIDERS = [
  { value: 'local', label: 'Local Whisper (free/offline)' },
  { value: 'mock',  label: 'Mock (demo)' },
  // { value: 'openai', label: 'OpenAI Whisper' },
  // { value: 'google', label: 'Google STT' },
]

export default function App() {
  const [items, setItems]   = useState([])
  const [provider, setProvider] = useState('local')
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)

  // tiny CSS for the animated background blobs (scoped to this component)
  const blobCSS = `
    @keyframes blob {
      0%,100% { transform: translate(0,0) scale(1); }
      33%     { transform: translate(24px,-28px) scale(1.05); }
      66%     { transform: translate(-18px,20px) scale(0.98); }
    }
    .animate-blob { animation: blob 18s ease-in-out infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-4000 { animation-delay: 4s; }
  `

  async function fetchList() {
    try {
      const { data } = await api.get('/transcriptions')
      setItems(data.transcriptions || [])
    } catch (e) {
      setError(e?.response?.data?.error || e?.message)
    }
  }
  useEffect(() => { fetchList() }, [])

  function flash(msg) {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  async function submit(file) {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const form = new FormData()
      form.append('audio', file)
      form.append('provider', provider)
      const { data } = await api.post('/transcribe', form)
      setItems(prev => [data.transcription, ...prev])
      flash('Transcribed successfully')
    } catch (e) {
      setError(e?.response?.data?.error || e?.message)
    } finally {
      setBusy(false)
    }
  }

  function openFile() {
    fileRef.current?.click()
  }

  // Drag & drop (plain JS)
  const [isOver, setIsOver] = useState(false)
  function onDragOver(e) { e.preventDefault(); setIsOver(true) }
  function onDragLeave() { setIsOver(false) }
  function onDrop(e) {
    e.preventDefault(); setIsOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) submit(f)
  }

  async function del(id) {
    try {
      await api.delete(`/transcriptions/${id}`)
      setItems(prev => prev.filter(x => x._id !== id))
    } catch (e) {
      setError(e?.response?.data?.error || e?.message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <style>{blobCSS}</style>

      {/* Animated background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[38rem] h-[38rem] rounded-full blur-3xl bg-indigo-400/30 animate-blob" />
      <div className="pointer-events-none absolute -top-28 right-[-8rem] w-[32rem] h-[32rem] rounded-full blur-3xl bg-emerald-400/25 animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-1/3 w-[34rem] h-[34rem] rounded-full blur-3xl bg-fuchsia-400/20 animate-blob animation-delay-4000" />

      {/* Tinted gradient background (pastel) */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-100 via-fuchsia-100 to-sky-100" />

      {/* Content above the background */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-black text-white grid place-items-center font-bold">STT</div>
              <div>
                <h1 className="text-lg font-semibold leading-tight">Speech-to-Text</h1>
                <p className="text-xs text-gray-500">Fast offline Whisper transcription</p>
              </div>
            </div>

            <div className="hidden md:flex items-center text-xs text-gray-500 gap-4">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Python STT
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> Node API
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> React UI
              </span>
            </div>
          </div>
        </header>

        {/* Notice / Error */}
        <div className="max-w-6xl mx-auto px-4 pt-3">
          {notice && (
            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-2">
              {notice}
            </div>
          )}
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <section className="max-w-6xl mx-auto px-4 py-5">
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-sm p-4 md:p-6 transition">
            <div className="grid md:grid-cols-3 gap-4 items-center">
              {/* Provider selector */}
              <div>
                <label className="text-xs text-gray-500">Transcription Provider</label>
                <div className="mt-1">
                  <select
                    className="w-full px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    disabled={busy}
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Upload audio</label>
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={openFile}
                    disabled={busy}
                    className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60 transition transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Upload File
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="audio/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) submit(f)
                    }}
                  />
                </div>
              </div>

              {/* Recorder */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Record right here</label>
                <div className="mt-1">
                  <Recorder onSubmit={submit} disabled={busy} />
                </div>
              </div>
            </div>

            {/* Drag & drop area */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`mt-5 rounded-2xl border-2 border-dashed p-6 text-center transition-all
                ${isOver ? 'bg-indigo-50 border-indigo-300 ring-4 ring-indigo-100'
                         : 'bg-gray-50 border-gray-200'}`}
            >
              <p className="text-sm text-gray-600">
                Drag & drop audio here, or <button onClick={openFile} className="underline">browse</button>
              </p>
              {busy && <div className="mt-3 text-xs text-gray-500 animate-pulse">Transcribing…</div>}
            </div>
          </div>
        </section>

        {/* History */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-lg font-semibold mb-3">History</h2>

          {items.length === 0 ? (
            <div className="rounded-2xl border bg-white/80 backdrop-blur p-8 text-center text-gray-500">
              No transcriptions yet. Upload a file or record audio to begin.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {items.map(t => (
                <TranscriptionCard
                  key={t._id}
                  item={t}
                  onDelete={() => del(t._id)}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t bg-white/70 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500 flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} STT Demo</span>
            <span>•</span>
            <span>Offline Whisper via faster-whisper</span>
            <span>•</span>
            <span>MongoDB persistence</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
