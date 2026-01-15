import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useRouteLoaderData, redirect } from "react-router";
import { FaClock, FaTrophy, FaChevronRight, FaCheck, FaTimes } from "react-icons/fa";
import Navbar from "../../components/navbar";
import { getRankInfo } from "../../utils/rankUtils";
import { useSocket } from "~/context/SocketContext";

export async function clientLoader() {
    const token = localStorage.getItem("token");
    if (!token) return redirect("/login");
    return null;
}

export default function GameRoom() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const data: any = useRouteLoaderData("protected-layout");
    const user = data?.user;
    const { socket } = useSocket();

    const [game, setGame] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60);
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState<any>(null);

    // Keep active question index in ref to avoid closure staleness in socket listeners
    const currentIndexRef = useRef(0);
    const timerRef = useRef<any>(null);

    // Initial Load via REST (Hydration)
    useEffect(() => {
        const fetchGame = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/game/${gameId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Game not found");
                const gameData = await res.json();
                console.log("DEBUG: fetchGame response:", gameData);

                if (!user) {
                    console.error("User not found in loader data");
                    navigate("/login");
                    return;
                }

                // Check if user is in this game
                const isPlayer = gameData.players.some((p: any) => {
                    const id = p.userId._id || p.userId;
                    // Debug Log
                    console.log(`Checking player: ${id} vs Me: ${user._id}`);
                    return id && id.toString() === user._id;
                });

                if (!isPlayer) {
                    console.error("Player mismatch!", {
                        myId: user._id,
                        gamePlayers: gameData.players
                    });
                    alert("You are not part of this game");
                    navigate("/dashboard");
                    return;
                }

                if (gameData.status === "FINISHED") {
                    // TODO: Logic for finished game view if reloaded
                }

                setGame(gameData);
                setLoading(false);

                // Hydrate progress
                const myPlayer = gameData.players.find((p: any) => {
                    const id = p.userId._id || p.userId;
                    return id && id.toString() === user._id;
                });
                const myProgress = myPlayer?.answers?.length || 0;

                setCurrentQuestionIndex(myProgress);
                currentIndexRef.current = myProgress;

            } catch (error) {
                console.error("Failed to fetch game inside match.tsx:", error);
                // Don't auto-navigate away during debug to see error in console
                // navigate("/dashboard"); 
            }
        };
        fetchGame();
    }, [gameId, user]);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket || !user) return;

        const handleAnswerResult = (data: any) => {
            console.log("SOCKET: Answer Result Received", data);
            const { isCorrect, points, newScore } = data;

            // Move to next question safely
            setSubmitting(false);

            // Use ref to check if we are already ahead (idempotency check on client too)
            // But simpler is to just increment functional state

            setGame((prevGame: any) => {
                if (!prevGame) return prevGame;
                // Update local score just in case we wan to show it
                const updatedPlayers = prevGame.players.map((p: any) => {
                    if ((p.userId._id || p.userId).toString() === user._id) {
                        return { ...p, score: newScore };
                    }
                    return p;
                });
                return { ...prevGame, players: updatedPlayers };
            });

            // Increment question index
            setCurrentQuestionIndex((prev) => {
                const newIndex = prev + 1;
                currentIndexRef.current = newIndex;
                return newIndex;
            });

            setSelectedAnswer(null);
            setTimeLeft(60);
        };

        const handleGameOver = (data: any) => {
            console.log("SOCKET: Game Over", data);
            setLoading(true);

            // Re-fetch to get final consistent state
            setTimeout(async () => {
                const token = localStorage.getItem("token");
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/game/${gameId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const finalGame = await res.json();

                const myPlayer = finalGame.players.find((p: any) => (p.userId._id || p.userId).toString() === user._id);
                setResults({
                    winner: { userId: data.winnerId },
                    isDraw: !data.winnerId,
                    ratingChanges: {
                        [user._id]: {
                            change: myPlayer?.ratingChange || 0,
                            newRating: myPlayer?.newRating || 0
                        }
                    }
                });
                setLoading(false);
            }, 1000);
        };

        const handleError = (data: any) => {
            console.error("SOCKET ERROR:", data);
            alert("Game Error: " + data.message);
            setSubmitting(false);
        };

        socket.on("answer_result", handleAnswerResult);
        socket.on("game_over", handleGameOver);
        socket.on("error", handleError);

        return () => {
            socket.off("answer_result", handleAnswerResult);
            socket.off("game_over", handleGameOver);
            socket.off("error", handleError);
        };
    }, [socket, gameId, user]);

    // Timer Logic
    useEffect(() => {
        // Only run timer if active question exists
        if (!loading && !results && game && game.questions && game.questions[currentQuestionIndex]) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Time's up!
                        if (!submitting) {
                            handleNextQuestion(true); // Auto-submit with empty answer
                        }
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [loading, currentQuestionIndex, results, submitting]); // Depend on submitting to stop restart loop if stuck

    const handleAnswerSelect = (option: string) => {
        if (submitting) return;
        setSelectedAnswer(option);
    };

    const handleNextQuestion = (isTimeout = false) => {
        if (!game || !socket) return;

        // Prevent double submit (unless timeout logic forces it)
        if (submitting && !isTimeout) return;

        setSubmitting(true);

        const currentQ = game.questions[currentQuestionIndex].questionId;
        const timeTaken = 60 - timeLeft;
        const answerToSend = isTimeout ? "" : (selectedAnswer || "");

        console.log("Submitting Answer:", {
            gameId,
            questionId: currentQ._id,
            answer: answerToSend
        });

        socket.emit("submit_answer", {
            gameId,
            questionId: currentQ._id,
            answer: answerToSend, // Client now sends text
            timeTaken
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center">
                <div className="animate-pulse text-xl">Entering Arena...</div>
            </div>
        );
    }

    if (results) {
        return <GameResult results={results} currentUser={user} />;
    }

    if (!game || !game.questions || !game.questions[currentQuestionIndex]) {
        // Wait for result or just show loading
        return (
            <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center">
                <div className="text-xl">Waiting for results...</div>
            </div>
        );
    }

    const currentQuestion = game.questions[currentQuestionIndex].questionId;
    const rank = getRankInfo(data?.stats?.overall?.rating || 0).rank;

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white pb-12">
            <Navbar data={data} rank={rank} handleLogout={() => { }} />

            <main className="max-w-4xl mx-auto px-4 pt-12">
                {/* Match Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-bold text-white/40 uppercase tracking-widest">
                            Question {currentQuestionIndex + 1} of {game.questions.length}
                        </div>
                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 transition-all duration-500"
                                style={{ width: `${((currentQuestionIndex + 1) / game.questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                        <FaClock size={20} />
                        {timeLeft}s
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />

                    <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight relative">
                        {currentQuestion.description}
                    </h2>

                    <div className="grid grid-cols-1 gap-4 relative">
                        {currentQuestion.options.map((option: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswerSelect(option.text)}
                                disabled={submitting}
                                className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 text-left ${selectedAnswer === option.text
                                    ? 'border-cyan-400 bg-cyan-400/10 text-white'
                                    : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 text-white/70'
                                    }`}
                            >
                                <span className="text-lg font-medium">{option.text}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAnswer === option.text ? 'border-cyan-400 bg-cyan-400' : 'border-white/20'
                                    }`}>
                                    {selectedAnswer === option.text && <FaCheck className="text-[#0a0e27] text-xs" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex justify-end">
                    <button
                        onClick={() => handleNextQuestion(false)}
                        disabled={submitting || !selectedAnswer}
                        className={`px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 ${selectedAnswer && !submitting
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        {submitting ? 'Submitting...' : currentQuestionIndex === game.questions.length - 1 ? 'Finish Match' : 'Next Question'}
                        <FaChevronRight size={16} />
                    </button>
                </div>
            </main>
        </div>
    );
}

function GameResult({ results, currentUser }: any) {
    const navigate = useNavigate();
    const isWinner = results.winner?.userId === currentUser?._id;
    const isDraw = results.isDraw;

    const ratingChange = results.ratingChanges?.[currentUser?._id]?.change || 0;
    const newRating = results.ratingChanges?.[currentUser?._id]?.newRating || 0;

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />

                <div className="mb-8">
                    {isWinner ? (
                        <div className="inline-block p-6 rounded-full bg-yellow-400/10 text-yellow-400 mb-6 animate-bounce">
                            <FaTrophy size={64} />
                        </div>
                    ) : isDraw ? (
                        <div className="text-6xl mb-6">🤝</div>
                    ) : (
                        <div className="text-6xl mb-6">💀</div>
                    )}

                    <h1 className="text-5xl font-black mb-2 tracking-tighter italic">
                        {isWinner ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT'}
                    </h1>
                    <p className="text-white/40 uppercase tracking-[0.3em] font-bold text-sm">
                        Match Results
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-12">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                        <div className="text-white/40 text-xs uppercase font-black mb-2 tracking-widest">Final Rating</div>
                        <div className="text-4xl font-black">{newRating}</div>
                        <div className={`text-lg font-bold ${ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {ratingChange >= 0 ? '+' : ''}{ratingChange}
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                        <div className="text-white/40 text-xs uppercase font-black mb-2 tracking-widest">Final Rank</div>
                        <div className={`text-2xl font-black ${getRankInfo(newRating).rank.color}`}>
                            {getRankInfo(newRating).rank.name}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full py-5 rounded-2xl bg-white text-[#0a0e27] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate("/leaderboard")}
                        className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                    >
                        View Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
}
