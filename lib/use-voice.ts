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
    recognition.interimResults = false
    recognition.continuous = true
    onTextRef.current = onText

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results || [])
        .slice(event.resultIndex || 0)
        .map((result: any) => result?.[0]?.transcript || "")
        .filter(Boolean)
        .join(" ")
        .trim()
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
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    // Cancel anything already queued so it doesn't overlap.
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-AU"
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }, [])

  return { supported, speaking, speak, stop }
}
