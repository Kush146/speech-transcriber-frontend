import React from 'react'
import { motion } from 'framer-motion'

export default function TranscriptionCard({ item, onDelete }) {
  const created = item.createdAt || item.created_at
  const text = item.text || ''

  function copyText() {
    if (!text.trim()) return
    navigator.clipboard?.writeText(text)
  }
  function downloadTxt() {
    const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `transcription-${item._id || Date.now()}.txt`
    document.body.appendChild(a); a.click(); a.remove()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 250, damping: 24 }}
      className="glass rounded-2xl shadow-sm p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-gray-500">{created ? new Date(created).toLocaleString() : ''}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded bg-gray-100">{item.provider}</span>
          <button onClick={copyText} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">Copy</button>
          <button onClick={downloadTxt} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">Download</button>
          <button onClick={onDelete} className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>

      <div className="font-medium leading-7 whitespace-pre-wrap break-words">
        {text && text.trim()
          ? text
          : <span className="text-gray-400">— no speech detected —</span>}
      </div>
    </motion.div>
  )
}
