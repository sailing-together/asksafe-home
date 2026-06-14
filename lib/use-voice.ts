"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* ----------------------------- Speech to text ---------------------------- */

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  )
}

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onTextRef = useRef<((text: string) => void) | null>(null)

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
    return () => {
      // Clean up any active session when unmounting.
      recognitionRef.current?.abort()
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback((onText: (text: string) => void) => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    // Permission is only requested at this point, when the user taps the button.
    const recognition = new Ctor()
    recognition.lang = "en-AU"
    recognition.interimResults = true
    recognition.continuous = true
    onTextRef.current = onText

    let finalText = ""

    recognition.onresult = (event: any) => {
      let interim = ""
      for (let i = event.resultIndex || 0; i < event.results.length; i++) {
        const transcript = event.results[i]?.[0]?.transcript || ""
        if (!transcript) continue
        if (event.results[i].isFinal) {
          finalText = [finalText, transcript].filter(Boolean).join(" ")
        } else {
          interim = [interim, transcript].filter(Boolean).join(" ")
        }
      }
      const text = [finalText, interim].filter(Boolean).join(" ").trim()
      if (text) onTextRef.current?.(text)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [])

  return { supported, listening, start, stop }
}

/* ----------------------------- Text to speech ---------------------------- */

export function useSpeechSynthesis() {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const queueRef = useRef<SpeechSynthesisUtterance[]>([])

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    )
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    queueRef.current = []
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    // Cancel anything already queued so it doesn't overlap.
    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()

    const chunks = (text.match(/[^.!?]+[.!?]*/g) ?? [text])
      .map((chunk) => chunk.trim())
      .filter(Boolean)

    const voice =
      window.speechSynthesis
        .getVoices()
        .find((candidate) => candidate.lang.toLowerCase().startsWith("en")) ??
      null

    queueRef.current = chunks.map((chunk) => {
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = "en-AU"
      utterance.rate = 0.95
      utterance.pitch = 1
      if (voice) utterance.voice = voice
      return utterance
    })

    function speakNext() {
      const utterance = queueRef.current.shift()
      if (!utterance) {
        setSpeaking(false)
        return
      }
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = speakNext
      utterance.onerror = () => {
        queueRef.current = []
        setSpeaking(false)
      }
      window.speechSynthesis.speak(utterance)
    }

    setSpeaking(true)
    speakNext()
  }, [])

  return { supported, speaking, speak, stop }
}
