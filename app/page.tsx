"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  name: string;
  email: string;
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
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snowflakes, setSnowflakes] = useState<React.CSSProperties[]>([]);
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

  const checkAssignment = async (userId: string) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      const response = await fetch(`/api/${userId}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSuccess("Please check your email for to know your match!");
      }
    } catch (error) {
      setError("Failed to find participant:" + error);
    } finally {
      setLoading(false);
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

      <Card className="w-full max-w-md relative z-10 bg-opacity-90">
        <CardHeader>
          <CardTitle className="flex justify-center items-center text-2xl font-bold text-center text-primary">
            🎅🏼 Secret Santa Participant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Select onValueChange={(value) => setId(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your name" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => checkAssignment(id)} className="w-full">
                <span className={loading ? "text-transparent" : ""}>
                  Check my assignment
                </span>
                {loading && (
                  <span className="absolute flex items-center justify-center w-full h-full text-grey-400">
                    <LoaderCircle className="animate-spin" />
                  </span>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default">
                <AlertTitle className="font-bold text-primary text-center">
                  Email sent successful
                </AlertTitle>
                <AlertDescription className="text-center">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
