import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Recorder({ onSubmit, disabled }) {
  const [rec, setRec] = useState(null)
  const [recording, setRecording] = useState(false)

  useEffect(() => () => { rec?.stop?.() }, [rec])

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const r = new MediaRecorder(stream)
    const chunks = []
    r.ondataavailable = e => chunks.push(e.data)
    r.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const file = new File([blob], `rec-${Date.now()}.webm`, { type: 'audio/webm' })
      onSubmit?.(file)
      stream.getTracks().forEach(t => t.stop())
    }
    setRec(r); r.start(); setRecording(true)
  }
  function stop(){ rec?.stop(); setRecording(false) }

  const cls = recording
    ? 'px-4 py-2 rounded-xl bg-red-600 text-white'
    : 'px-4 py-2 rounded-xl border bg-white hover:bg-gray-50'

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={!recording ? { y: -1 } : {}}
      className={cls + ' disabled:opacity-60'}
      onClick={recording ? stop : start}
      disabled={disabled}
    >
      {recording ? 'Stop' : 'Record'}
    </motion.button>
  )
}
