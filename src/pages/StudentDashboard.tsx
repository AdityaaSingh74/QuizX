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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Welcome back, {user?.display_name}! 👋</h1>
            <p className="text-indigo-100 text-lg">Ready to test your knowledge today?</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-2 text-indigo-100 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Quizzes</span>
              </div>
              <p className="text-3xl font-bold">{totalAttempted}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-2 text-indigo-100 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Avg Score</span>
              </div>
              <p className="text-3xl font-bold">{averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            Available Quizzes
          </h2>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-500 font-medium">No quizzes available at the moment.</p>
            <p className="text-sm text-slate-400 mt-1">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const hasAttempted = results.some(r => r.quiz_id === quiz.id);
              return (
                <div key={quiz.id} className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">{quiz.description}</p>
                  </div>
                  <Link
                    to={`/quiz/${quiz.id}`}
                    className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      hasAttempted 
                        ? 'bg-slate-50 text-indigo-600 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
                    <PlayCircle className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
          Your Recent Attempts
        </h2>
        
        {results.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-500 font-medium">You haven't attempted any quizzes yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => {
                  const percentage = Math.round((result.score / result.total) * 100);
                  return (
                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {result.quiz_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs ${
                            percentage >= 80 ? 'bg-green-100 text-green-800' : 
                            percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            {result.score} / {result.total}
                          </span>
                          <span className="text-gray-400 font-medium">{percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {new Date(result.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
