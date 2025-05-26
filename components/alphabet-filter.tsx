"use client"

import { Button } from "@/components/ui/button"

interface AlphabetFilterProps {
  activeLetter: string | null
  onLetterClick: (letter: string | null) => void
}

export function AlphabetFilter({ activeLetter, onLetterClick }: AlphabetFilterProps) {
  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  return (
    <div className="flex flex-wrap gap-1 mb-6">
      <Button
        variant={activeLetter === null ? "default" : "outline"}
        size="sm"
        onClick={() => onLetterClick(null)}
        className="min-w-8"
      >
        All
      </Button>
      {alphabet.map((letter) => (
        <Button
          key={letter}
          variant={activeLetter === letter ? "default" : "outline"}
          size="sm"
          onClick={() => onLetterClick(letter)}
          className="min-w-8"
        >
          {letter}
        </Button>
      ))}
    </div>
  )
}
