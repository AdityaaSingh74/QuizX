import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../services/api';
import { PlayCircle, Clock, CheckCircle, Trophy, Target, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesData, resultsData] = await Promise.all([
          fetchApi('/quizzes'),
          fetchApi('/results'),
        ]);
        setQuizzes(quizzesData);
        setResults(resultsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  const totalAttempted = results.length;
  const averageScore = totalAttempted > 0
    ? Math.round((results.reduce((acc, r) => acc + (r.score / r.total), 0) / totalAttempted) * 100)
    : 0;

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-t-2 border-white/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-300/40 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-300/40 to-transparent rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif font-extrabold mb-3 text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
              Welcome back, {user?.display_name}! <span className="inline-block animate-bounce origin-bottom">👋</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">Ready to test your knowledge today?</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 text-center flex-1 md:min-w-[130px] border border-white shadow-sm">
              <div className="flex items-center justify-center gap-2 text-indigo-500 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Quizzes</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-800">{totalAttempted}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 text-center flex-1 md:min-w-[130px] border border-white shadow-sm">
              <div className="flex items-center justify-center gap-2 text-pink-500 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Avg Score</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-800">{averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-8 pl-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 font-serif">
            <div className="p-2.5 bg-indigo-100 rounded-2xl text-indigo-500 shadow-sm border border-white">
              <BookOpen className="w-6 h-6" />
            </div>
            Explore Quizzes
          </h2>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-[2.5rem]">
            <BookOpen className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-lg">No quizzes available at the moment.</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">Check back later for new content!</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {quizzes.map((quiz, index) => {
              const hasAttempted = results.some(r => r.quiz_id === quiz.id);
              // Generate a slight random height for masonry effect based on index
              const heights = ['h-64', 'h-72', 'h-80', 'h-64', 'h-72'];
              const customHeight = heights[index % heights.length];

              // Generate random pastel backgrounds
              const bgColors = [
                'bg-gradient-to-br from-indigo-50 to-pink-50',
                'bg-gradient-to-br from-emerald-50 to-teal-50',
                'bg-gradient-to-br from-orange-50 to-rose-50',
                'bg-gradient-to-br from-blue-50 to-indigo-50',
                'bg-gradient-to-br from-purple-50 to-pink-50'
              ];
              const customBg = bgColors[index % bgColors.length];

              return (
                <div key={quiz.id} className={`group relative break-inside-avoid ${customBg} border-[3px] border-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(8,112,184,0.1)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 overflow-hidden ${customHeight}`}>
                  {/* Decorative faint pattern */}
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/40 rounded-full blur-2xl"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${hasAttempted ? 'bg-slate-200/50 text-slate-600' : 'bg-indigo-100 text-indigo-700'}`}>
                        {hasAttempted ? 'Completed' : 'New'}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">{quiz.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 font-medium leading-relaxed">{quiz.description}</p>
                  </div>

                  <Link
                    to={`/quiz/${quiz.id}`}
                    className={`relative z-10 w-fit inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-full transition-all ${hasAttempted
                        ? 'bg-white/80 text-slate-700 hover:bg-white hover:text-indigo-600'
                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-md hover:shadow-lg'
                      }`}
                  >
                    {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
                    <PlayCircle className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-panel p-10 rounded-[2.5rem] mt-12 relative overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3 font-serif relative z-10">
          <div className="p-2.5 bg-yellow-100 rounded-2xl text-yellow-600 shadow-sm border border-white">
            <Clock className="w-6 h-6" />
          </div>
          Your Recent Attempts
        </h2>

        {results.length === 0 ? (
          <div className="text-center py-16 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200 relative z-10">
            <Clock className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-lg">You haven't attempted any quizzes yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 relative z-10">
            {results.map((result) => {
              const percentage = Math.round((result.score / result.total) * 100);
              const isExcellent = percentage >= 80;
              const isGood = percentage >= 50 && percentage < 80;

              return (
                <div key={result.id} className="bg-white/60 hover:bg-white p-5 rounded-3xl border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${isExcellent ? 'bg-green-100 text-green-600' : isGood ? 'bg-yellow-100 text-yellow-600' : 'bg-rose-100 text-rose-600'}`}>
                      {percentage}%
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 font-serif">{result.quiz_title}</h4>
                      <p className="text-sm text-slate-500 font-medium">{new Date(result.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl w-max">
                    <span className="text-sm font-bold text-slate-700">{result.score} correct</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-medium text-slate-500">{result.total} total</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
