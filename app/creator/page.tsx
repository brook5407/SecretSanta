'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartyPopper, Trash2 } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
}

interface Assignment {
  giver: User
  receiver: User
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const deleteParticipant = async (userId: number) => {
    try {
      const response = await fetch(`/api/${userId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove user from local state
        setUsers(users.filter(user => user.id !== userId))
        // Clear assignments if they exist
        setAssignments([])
      }
    } catch (error) {
      console.error('Failed to delete participant:', error)
    }
  }

  const addParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newName && newEmail && !users.some(user => user.email === newEmail)) {
      try {
        const response = await fetch('/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName, email: newEmail }),
        })
        
        if (response.ok) {
          const newUser = await response.json()
          setUsers([...users, newUser])
          setNewName('')
          setNewEmail('')
        }
      } catch (error) {
        console.error('Failed to add participant:', error)
      }
    }
  }

  const generateAssignments = async () => {
    if (users.length < 2) {
      alert('You need at least 2 participants to generate assignments.')
      return
    }

    const shuffled = [...users].sort(() => 0.5 - Math.random())
    const newAssignments = shuffled.map((user, index) => ({
      giverId: user.id,
      receiverId: shuffled[(index + 1) % shuffled.length].id
    }))

    try {
      const response = await fetch('/api', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignments),
      })

      if (response.ok) {
        const savedAssignments = await response.json()
        setAssignments(savedAssignments)
      }
    } catch (error) {
      console.error('Failed to save assignments:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Secret Santa Organizer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addParticipant} className="mb-4 space-y-2">
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter participant name"
              className="flex-grow"
            />
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter participant email"
              className="flex-grow"
            />
            <Button type="submit" className="w-full">Add Participant</Button>
          </form>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Participants:</h2>
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between bg-secondary/20 p-2 rounded-md">
                  <span>{user.name} ({user.email})</span>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => deleteParticipant(user.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={generateAssignments} className="w-full mb-4">Generate Assignments</Button>

          {assignments.length > 0 && (
            <div>
            <h2 className="text-2xl font-semibold mb-2 flex justify-center items-center"><PartyPopper />Generate completed<PartyPopper/></h2>
              {/* <h2 className="text-xl font-semibold mb-2">Secret Santa Assignments:</h2>
              <ul className="space-y-2">
                {assignments.map((assignment, index) => (
                  <li key={index} className="bg-secondary/20 p-2 rounded-md">
                    {assignment.giver.name} gives a gift to {assignment.receiver.name}
                  </li>
                ))}
              </ul> */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
