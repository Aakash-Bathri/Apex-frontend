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

export function meta() {
    return [{ title: "Match - Apex" }];
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
    const [roundStatus, setRoundStatus] = useState<'PLAYING' | 'WAITING' | 'REVIEW'>('PLAYING');
    const [roundData, setRoundData] = useState<any>(null);

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
                    // Show results for finished game
                    const myPlayer = gameData.players.find((p: any) => {
                        const id = p.userId._id || p.userId;
                        return id && id.toString() === user._id;
                    });

                    // Determine winner
                    const p1 = gameData.players[0];
                    const p2 = gameData.players[1];
                    const winnerId = p1.result === "win" ? (p1.userId._id || p1.userId) :
                        (p2.result === "win" ? (p2.userId._id || p2.userId) : null);

                    setResults({
                        winner: { userId: winnerId },
                        isDraw: !winnerId,
                        ratingChanges: {
                            [user._id]: {
                                change: myPlayer?.ratingChange || 0,
                                newRating: myPlayer?.newRating || 0
                            }
                        }
                    });
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

        const handleRoundOver = (data: any) => {
            console.log("SOCKET: Round Over", data);
            setSubmitting(false);
            setRoundStatus('REVIEW');
            setRoundData(data);

            // Update scores based on payload
            if (data.results) {
                setGame((prevGame: any) => {
                    if (!prevGame) return prevGame;
                    const updatedPlayers = prevGame.players.map((p: any) => {
                        const r = data.results.find((res: any) => (p.userId._id || p.userId).toString() === res.userId);
                        if (r) {
                            return { ...p, score: r.newScore };
                        }
                        return p;
                    });
                    return { ...prevGame, players: updatedPlayers };
                });
            }

            // Auto-advance after 5 seconds
            setTimeout(() => {
                setRoundStatus('PLAYING');
                setRoundData(null);
                setSelectedAnswer(null);
                // Timer will reset in the timer effect based on new question

                setCurrentQuestionIndex((prev) => {
                    const newIndex = prev + 1;
                    currentIndexRef.current = newIndex;
                    return newIndex;
                });
            }, 5000);
        };

        const handleWaiting = () => {
            console.log("SOCKET: Waiting for opponent");
            setRoundStatus('WAITING');
        };

        const handleOpponentAnswered = () => {
            // Optional: Show toast "Opponent answered!"
            console.log("Opponent answered");
        };

        const handleGameOver = (data: any) => {
            console.log("SOCKET: Game Over", data);

            setTimeout(() => {
                setLoading(true);
                // Re-fetch to get final consistent state
                setTimeout(async () => {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/game/${gameId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const finalGame = await res.json();

                    const myPlayer = finalGame.players.find((p: any) => (p.userId._id || p.userId).toString() === user._id);
                    setGame(finalGame); // Store full game data
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
            }, 5000); // Wait for the last round review (5s) before showing Game Over
        };

        const handleError = (data: any) => {
            console.error("SOCKET ERROR:", data);
            alert("Game Error: " + data.message);
            setSubmitting(false);
            setRoundStatus('PLAYING'); // Reset if error
        };

        // socket.on("answer_result", handleAnswerResult); // Deprecated
        socket.on("round_over", handleRoundOver);
        socket.on("waiting_for_opponent", handleWaiting);
        socket.on("opponent_answered", handleOpponentAnswered);
        socket.on("game_over", handleGameOver);
        socket.on("error", handleError);

        return () => {
            // socket.off("answer_result", handleAnswerResult);
            socket.off("round_over", handleRoundOver);
            socket.off("waiting_for_opponent", handleWaiting);
            socket.off("opponent_answered", handleOpponentAnswered);
            socket.off("game_over", handleGameOver);
            socket.off("error", handleError);
        };
    }, [socket, gameId, user]);

    // Timer Logic
    useEffect(() => {
        // Only run timer if active question exists
        if (!loading && !results && game && game.questions && game.questions[currentQuestionIndex]) {
            const currentQ = game.questions[currentQuestionIndex].questionId;
            const limit = currentQ.timeLimit || 60;
            setTimeLeft(limit); // Reset timer to question's limit

            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Time's up!
                        if (!submitting) {
                            handleNextQuestion(true); // Auto-submit with empty answer
                        }
                        return limit;
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
        if (submitting || roundStatus !== 'PLAYING') return;
        setSelectedAnswer(option);
        // Auto-submit immediately
        handleNextQuestion(false, option);
    };

    const handleNextQuestion = (isTimeout = false, answer?: string) => {
        if (!game || !socket) return;

        // Prevent double submit (unless timeout logic forces it)
        if (submitting && !isTimeout) return;

        setSubmitting(true);
        // Do NOT increment index here. Wait for round_over.

        const currentQ = game.questions[currentQuestionIndex].questionId;
        const limit = currentQ.timeLimit || 60;
        const timeTaken = limit - timeLeft;
        const answerToSend = isTimeout ? "" : (answer || selectedAnswer || "");

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

        // Optimistic UI updates could go here, but we wait for 'waiting' or 'round_over'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0e27] text-white flex items-center justify-center">
                <div className="animate-pulse text-xl">Entering Arena...</div>
            </div>
        );
    }

    if (results) {
        return <GameResult results={results} currentUser={user} game={game} />;
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

    // --- RENDER HELPERS ---
    const myPlayer = game.players.find((p: any) => (p.userId._id || p.userId).toString() === user._id);
    const opponent = game.players.find((p: any) => (p.userId._id || p.userId).toString() !== user._id);

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white pb-12 relative overflow-x-hidden">
            <Navbar data={data} rank={rank} handleLogout={() => { }} />

            {/* ROUND REVIEW OVERLAY */}
            {roundStatus === 'REVIEW' && roundData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0a0e27] border border-white/10 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />

                        <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-white/90">
                            Round Results
                        </h2>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            {/* Me */}
                            <div className={`p-6 rounded-2xl border ${roundData.results.find((r: any) => r.userId === user._id)?.isCorrect ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                                <div className="text-center">
                                    <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-70">You</div>
                                    <div className="text-2xl font-bold mb-1">
                                        {roundData.results.find((r: any) => r.userId === user._id)?.answer || (roundData.results.find((r: any) => r.userId === user._id)?.timeTaken >= 60 ? "Timed Out" : "No Answer")}
                                    </div>
                                    <div className="text-sm font-bold text-cyan-400">
                                        {roundData.results.find((r: any) => r.userId === user._id)?.points > 0 ? `+${roundData.results.find((r: any) => r.userId === user._id)?.points} pts` : "0 pts"}
                                    </div>
                                </div>
                            </div>

                            {/* Opponent */}
                            <div className={`p-6 rounded-2xl border ${roundData.results.find((r: any) => r.userId !== user._id)?.isCorrect ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                                <div className="text-center">
                                    <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-70">
                                        {(opponent?.userId as any)?.name || "Opponent"}
                                    </div>
                                    <div className="text-2xl font-bold mb-1">
                                        {roundData.results.find((r: any) => r.userId !== user._id)?.answer || (roundData.results.find((r: any) => r.userId !== user._id)?.timeTaken >= 60 ? "Timed Out" : "No Answer")}
                                    </div>
                                    <div className="text-sm font-bold text-cyan-400">
                                        {roundData.results.find((r: any) => r.userId !== user._id)?.points > 0 ? `+${roundData.results.find((r: any) => r.userId !== user._id)?.points} pts` : "0 pts"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Correct Answer</div>
                            <div className="text-xl font-bold text-green-400">
                                {roundData.correctAnswer}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <div className="text-sm animate-pulse text-white/50">
                                Next round starting soon...
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-4 pt-12">
                {/* Match Header */}
                <div className="flex items-center justify-between mb-8">
                    {/* My Score */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-white/50 uppercase">You</div>
                            <div className="text-2xl font-black">{myPlayer?.score || 0}</div>
                        </div>
                    </div>

                    {/* Progress & Time */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                            <FaClock size={20} />
                            {timeLeft}s
                        </div>
                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 transition-all duration-500"
                                style={{ width: `${((currentQuestionIndex + 1) / game.questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Opponent Score */}
                    <div className="flex items-center gap-4">
                        <div className="text-left">
                            <div className="text-xs font-bold text-white/50 uppercase">
                                {(opponent?.userId as any)?.name || opponent?.name || "Opponent"}
                            </div>
                            <div className="text-2xl font-black">{opponent?.score || 0}</div>
                        </div>
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
                                disabled={submitting || roundStatus !== 'PLAYING'}
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
                <div className="flex justify-center">
                    {roundStatus === 'WAITING' && (
                        <div className="px-12 py-4 rounded-2xl bg-white/10 font-bold text-lg flex items-center gap-3 animate-pulse">
                            Waiting for opponent...
                        </div>
                    )}
                    {submitting && roundStatus === 'PLAYING' && (
                        <div className="px-12 py-4 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 font-bold text-lg flex items-center gap-3">
                            Answer Locked ✓
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function GameResult({ results, currentUser, game }: any) {
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

                {/* Question Review Section */}
                <div className="mt-12 text-left">
                    <h3 className="text-xl font-bold mb-6 text-center text-white/60 uppercase tracking-widest">Answer Review</h3>
                    <div className="space-y-4">
                        {game?.questions?.map((qObj: any, idx: number) => {
                            const question = qObj.questionId;
                            // Find user's answer
                            const myPlayer = game.players.find((p: any) => (p.userId._id || p.userId).toString() === currentUser._id);
                            const myAnswerObj = myPlayer?.answers?.find((a: any) => {
                                // Support both string and ObjectId comparison
                                const answerQId = a.questionId?._id || a.questionId;
                                const questionQId = question._id || question;
                                return answerQId.toString() === questionQId.toString();
                            });

                            const isCorrect = myAnswerObj?.isCorrect;
                            const userAnswer = myAnswerObj?.answer || "No Answer";

                            return (
                                <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                    <div className="text-sm text-white/60 font-bold mb-1">Question {idx + 1}</div>
                                    <div className="font-medium mb-2">{question.description}</div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="opacity-50">Your Answer:</span>
                                        <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                            {userAnswer}
                                        </span>
                                        {isCorrect && <FaCheck className="text-green-400" />}
                                        {!isCorrect && <FaTimes className="text-red-400" />}
                                    </div>

                                    {!isCorrect && (
                                        <div className="mt-1 text-sm text-white/40">
                                            {/* Ideally show correct answer here if available */}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
