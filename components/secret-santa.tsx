'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SecretSanta() {
  const [participants, setParticipants] = useState<string[]>([])
  const [newParticipant, setNewParticipant] = useState('')
  const [assignments, setAssignments] = useState<{giver: string, receiver: string}[]>([])

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    if (newParticipant && !participants.includes(newParticipant)) {
      setParticipants([...participants, newParticipant])
      setNewParticipant('')
    }
  }

  const generateAssignments = () => {
    if (participants.length < 2) {
      alert('You need at least 2 participants to generate assignments.')
      return
    }

    const shuffled = [...participants].sort(() => 0.5 - Math.random())
    const assignments = shuffled.map((participant, index) => ({
      giver: participant,
      receiver: shuffled[(index + 1) % shuffled.length]
    }))
    setAssignments(assignments)
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Secret Santa Organizer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addParticipant} className="mb-4 flex gap-2">
            <Input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="Enter participant name"
              className="flex-grow"
            />
            <Button type="submit">Add</Button>
          </form>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Participants:</h2>
            <ul className="list-disc pl-5">
              {participants.map((participant, index) => (
                <li key={index}>{participant}</li>
              ))}
            </ul>
          </div>

          <Button onClick={generateAssignments} className="w-full mb-4">Generate Assignments</Button>

          {assignments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Secret Santa Assignments:</h2>
              <ul className="list-disc pl-5">
                {assignments.map((assignment, index) => (
                  <li key={index}>{assignment.giver} gives a gift to {assignment.receiver}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}