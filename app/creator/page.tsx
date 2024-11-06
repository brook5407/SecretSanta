"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyPopper, Trash2 } from "lucide-react";
import { LoaderCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Assignment {
  giver: User;
  receiver: User;
}

const Snowflake = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute text-white text-opacity-80 pointer-events-none select-none snowflake"
    style={style}
  >
    ❄
  </div>
);

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [snowflakes, setSnowflakes] = useState<React.CSSProperties[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createSnowflakes = () => {
      const newSnowflakes = Array.from({ length: 50 }, () => ({
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 5 + 5}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random(),
        fontSize: `${Math.random() * 10 + 10}px`,
      }));
      setSnowflakes(newSnowflakes);
    };

    createSnowflakes();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const deleteParticipant = async (userId: number) => {
    try {
      const response = await fetch(`/api/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove user from local state
        setUsers(users.filter((user) => user.id !== userId));
        // Clear assignments if they exist
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to delete participant:", error);
    }
  };

  const addParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail && !users.some((user) => user.email === newEmail)) {
      try {
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName, email: newEmail }),
        });

        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser]);
          setNewName("");
          setNewEmail("");
        }
      } catch (error) {
        console.error("Failed to add participant:", error);
      }
    }
  };

  const generateAssignments = async () => {
    if (users.length < 2) {
      alert("You need at least 2 participants to generate assignments.");
      return;
    }

    const shuffled = [...users].sort(() => 0.5 - Math.random());
    const newAssignments = shuffled.map((user, index) => ({
      giverId: user.id,
      receiverId: shuffled[(index + 1) % shuffled.length].id,
    }));

    try {
      const response = await fetch("/api", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAssignments),
      });

      if (response.ok) {
        const savedAssignments = await response.json();
        setAssignments(savedAssignments);
      }
    } catch (error) {
      console.error("Failed to save assignments:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {snowflakes.map((style, i) => (
          <Snowflake key={i} style={style} />
        ))}
      </div>
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        .snowflake {
          position: absolute;
          top: -20px;
          animation: snowfall linear infinite;
        }
      `}</style>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Secret Santa Organizer
          </CardTitle>
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
            <Button type="submit" className="w-full">
              Add Participant
            </Button>
          </form>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Participants:</h2>
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between bg-secondary/20 p-2 rounded-md"
                >
                  <span>
                    {user.name} ({user.email})
                  </span>
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

          <Button onClick={generateAssignments} className="w-full mb-4">
            <span className={loading ? "text-transparent" : ""}>
              Generate Assignments
            </span>
            {loading && (
              <span className="absolute flex items-center justify-center w-full h-full text-grey-400">
                <LoaderCircle className="animate-spin" />
              </span>
            )}
          </Button>

          {assignments.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2 flex justify-center items-center">
                <PartyPopper />
                Generate completed
                <PartyPopper />
              </h2>
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
  );
}
