import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Plus, Trash2, Edit, ChevronDown, ChevronUp, Users, BookOpen, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDesc, setNewQuizDesc] = useState('');
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, any[]>>({});

  // New Question State
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'option_a',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle) return;
    try {
      await fetchApi('/quizzes', {
        method: 'POST',
        body: JSON.stringify({ title: newQuizTitle, description: newQuizDesc }),
      });
      setNewQuizTitle('');
      setNewQuizDesc('');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to create quiz', error);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await fetchApi(`/quizzes/${id}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete quiz', error);
    }
  };

  const toggleQuizExpand = async (quizId: string) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      return;
    }
    setExpandedQuiz(quizId);
    if (!questions[quizId]) {
      try {
        const qData = await fetchApi(`/quizzes/${quizId}/questions`);
        setQuestions(prev => ({ ...prev, [quizId]: qData }));
      } catch (error) {
        console.error('Failed to fetch questions', error);
      }
    }
  };

  const handleAddQuestion = async (quizId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/quizzes/${quizId}/questions`, {
        method: 'POST',
        body: JSON.stringify(newQuestion),
      });
      // Refresh questions
      const qData = await fetchApi(`/quizzes/${quizId}/questions`);
      setQuestions(prev => ({ ...prev, [quizId]: qData }));
      setNewQuestion({
        text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'option_a'
      });
    } catch (error) {
      console.error('Failed to add question', error);
    }
  };

  const handleDeleteQuestion = async (quizId: string, questionId: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await fetchApi(`/questions/${questionId}`, { method: 'DELETE' });
      const qData = await fetchApi(`/quizzes/${quizId}/questions`);
      setQuestions(prev => ({ ...prev, [quizId]: qData }));
    } catch (error) {
      console.error('Failed to delete question', error);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  const totalQuizzes = quizzes.length;
  const totalAttempts = results.length;
  const uniqueStudents = new Set(results.map(r => r.user_id)).size;

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-t-2 border-white/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-300/40 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-300/40 to-transparent rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif font-extrabold mb-3 text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-lg font-medium">Manage quizzes and view student performance.</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 text-center flex-1 md:min-w-[120px] border border-white shadow-sm hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-center gap-2 text-indigo-500 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Quizzes</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-800">{totalQuizzes}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 text-center flex-1 md:min-w-[120px] border border-white shadow-sm hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-center gap-2 text-teal-500 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Students</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-800">{uniqueStudents}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 text-center flex-1 md:min-w-[120px] border border-white shadow-sm hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-center gap-2 text-pink-500 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Attempts</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-800">{totalAttempts}</p>
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
            Manage Quizzes
          </h2>
        </div>

        <form onSubmit={handleCreateQuiz} className="mb-10 p-8 glass-panel rounded-[2.5rem] border border-white">
          <h3 className="text-xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Plus className="w-5 h-5" />
            </div>
            Create New Quiz
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Quiz Title</label>
              <input
                type="text"
                placeholder="e.g., Introduction to React"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                className="w-full px-5 py-4 bg-white/60 border-2 border-transparent rounded-full focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="Brief description of the quiz"
                value={newQuizDesc}
                onChange={(e) => setNewQuizDesc(e.target.value)}
                className="w-full px-5 py-4 bg-white/60 border-2 border-transparent rounded-full focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5" /> Create Quiz
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {quizzes.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-[2.5rem]">
              <BookOpen className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold text-lg">No quizzes created yet.</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Use the form above to create your first quiz.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm overflow-hidden transition-all hover:shadow-xl group">
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/80 transition-colors cursor-pointer gap-4"
                  onClick={() => toggleQuizExpand(quiz.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                    {quiz.description && <p className="text-sm text-slate-500 mt-2 font-medium">{quiz.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 bg-white/50 p-2 rounded-2xl w-max border border-slate-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                      className="p-3 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-colors"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="p-3 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                      {expandedQuiz === quiz.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {expandedQuiz === quiz.id && (
                  <div className="p-8 border-t-2 border-slate-100/50 bg-slate-50/50">
                    <div className="mb-10">
                      <h4 className="font-serif font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
                        <div className="p-2 bg-pink-100 rounded-xl text-pink-600">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        Existing Questions
                      </h4>

                      {questions[quiz.id]?.length === 0 ? (
                        <p className="text-sm text-slate-500 font-medium italic bg-white/80 p-6 rounded-2xl border border-white">No questions added yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {questions[quiz.id]?.map((q, idx) => (
                            <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col md:flex-row gap-6 hover:-translate-y-1 transition-transform">
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-pink-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner border border-white">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-serif font-bold text-lg text-slate-900 mb-4 bg-slate-50 p-4 rounded-2xl">{q.text}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  <div className={`p-4 rounded-2xl border-2 transition-colors ${q.correct_option === 'option_a' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'border-slate-100 text-slate-600 bg-white'}`}>
                                    <span className="font-bold text-slate-400 mr-2">A.</span> {q.option_a}
                                  </div>
                                  <div className={`p-4 rounded-2xl border-2 transition-colors ${q.correct_option === 'option_b' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'border-slate-100 text-slate-600 bg-white'}`}>
                                    <span className="font-bold text-slate-400 mr-2">B.</span> {q.option_b}
                                  </div>
                                  <div className={`p-4 rounded-2xl border-2 transition-colors ${q.correct_option === 'option_c' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'border-slate-100 text-slate-600 bg-white'}`}>
                                    <span className="font-bold text-slate-400 mr-2">C.</span> {q.option_c}
                                  </div>
                                  <div className={`p-4 rounded-2xl border-2 transition-colors ${q.correct_option === 'option_d' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'border-slate-100 text-slate-600 bg-white'}`}>
                                    <span className="font-bold text-slate-400 mr-2">D.</span> {q.option_d}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteQuestion(quiz.id, q.id)}
                                className="flex-shrink-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 w-12 h-12 flex items-center justify-center rounded-2xl transition-colors md:self-start bg-slate-50 border border-slate-100"
                                title="Delete Question"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Question Form */}
                    <form onSubmit={(e) => handleAddQuestion(quiz.id, e)} className="glass-panel p-8 rounded-[2rem] border-[3px] border-white relative mt-8">
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-500 rounded-2xl -rotate-12 flex items-center justify-center text-white shadow-lg">
                        <Plus className="w-6 h-6" />
                      </div>
                      <h5 className="font-serif font-bold text-slate-800 mb-6 text-lg ml-6">Add New Question</h5>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Question Text</label>
                          <input
                            type="text"
                            placeholder="What is..."
                            required
                            value={newQuestion.text}
                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                            className="w-full px-5 py-4 bg-white/60 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Option A</label>
                            <input type="text" required value={newQuestion.option_a} onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })} className="w-full px-5 py-3 bg-white/60 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Option B</label>
                            <input type="text" required value={newQuestion.option_b} onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })} className="w-full px-5 py-3 bg-white/60 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Option C</label>
                            <input type="text" required value={newQuestion.option_c} onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })} className="w-full px-5 py-3 bg-white/60 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Option D</label>
                            <input type="text" required value={newQuestion.option_d} onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })} className="w-full px-5 py-3 bg-white/60 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm" />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white">
                          <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Correct Answer</label>
                            <select
                              value={newQuestion.correct_option}
                              onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value })}
                              className="px-6 py-3 bg-white/80 border-2 border-transparent rounded-full font-bold text-indigo-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer shadow-sm"
                            >
                              <option value="option_a">Option A</option>
                              <option value="option_b">Option B</option>
                              <option value="option_c">Option C</option>
                              <option value="option_d">Option D</option>
                            </select>
                          </div>
                          <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-md hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto">
                            Save Question
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-panel p-10 rounded-[2.5rem] mt-12 relative overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3 font-serif relative z-10">
          <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm border border-white">
            <Users className="w-6 h-6" />
          </div>
          Student Results
        </h2>

        {results.length === 0 ? (
          <div className="text-center py-16 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200 relative z-10">
            <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-lg">No results recorded yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 relative z-10">
            {results.map((result) => {
              const percentage = Math.round((result.score / result.total) * 100);
              const isExcellent = percentage >= 80;
              const isGood = percentage >= 50 && percentage < 80;

              return (
                <div key={result.id} className="bg-white/60 hover:bg-white p-5 rounded-3xl border border-white flex flex-col sm:flex-row sm:items-center gap-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Student</span>
                      <span className="font-bold text-lg text-slate-900">{result.user_name}</span>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Quiz</span>
                      <span className="font-serif font-bold text-slate-800">{result.quiz_title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:ml-auto">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl w-max border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{result.score} correct</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-sm font-medium text-slate-500">{result.total} total</span>
                    </div>

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner border border-white ${isExcellent ? 'bg-emerald-100 text-emerald-600' : isGood ? 'bg-yellow-100 text-yellow-600' : 'bg-rose-100 text-rose-600'}`}>
                      {percentage}%
                    </div>
                  </div>

                  <div className="w-full sm:w-auto text-right mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent">
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(result.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
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
