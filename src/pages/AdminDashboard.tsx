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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Admin Dashboard</h1>
            <p className="text-slate-300 text-lg">Manage quizzes and view student performance.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-2 text-slate-300 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Quizzes</span>
              </div>
              <p className="text-3xl font-bold">{totalQuizzes}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-2 text-slate-300 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Students</span>
              </div>
              <p className="text-3xl font-bold">{uniqueStudents}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-2 text-slate-300 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Attempts</span>
              </div>
              <p className="text-3xl font-bold">{totalAttempts}</p>
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
            Manage Quizzes
          </h2>
        </div>
        
        <form onSubmit={handleCreateQuiz} className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Create New Quiz
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title</label>
              <input
                type="text"
                placeholder="e.g., Introduction to React"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="Brief description of the quiz"
                value={newQuizDesc}
                onChange={(e) => setNewQuizDesc(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" /> Create Quiz
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 font-medium">No quizzes created yet.</p>
              <p className="text-sm text-slate-400 mt-1">Use the form above to create your first quiz.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-indigo-200">
                <div 
                  className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => toggleQuizExpand(quiz.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">{quiz.title}</h3>
                    {quiz.description && <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                      {expandedQuiz === quiz.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {expandedQuiz === quiz.id && (
                  <div className="p-6 border-t border-slate-200 bg-slate-50/50">
                    <div className="mb-6">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Existing Questions
                      </h4>
                      
                      {questions[quiz.id]?.length === 0 ? (
                        <p className="text-sm text-slate-500 italic bg-white p-4 rounded-xl border border-slate-200">No questions added yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {questions[quiz.id]?.map((q, idx) => (
                            <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 mb-3">{q.text}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div className={`p-2 rounded-lg border ${q.correct_option === 'option_a' ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'border-slate-100 text-slate-600'}`}>
                                    <span className="font-semibold mr-2">A.</span> {q.option_a}
                                  </div>
                                  <div className={`p-2 rounded-lg border ${q.correct_option === 'option_b' ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'border-slate-100 text-slate-600'}`}>
                                    <span className="font-semibold mr-2">B.</span> {q.option_b}
                                  </div>
                                  <div className={`p-2 rounded-lg border ${q.correct_option === 'option_c' ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'border-slate-100 text-slate-600'}`}>
                                    <span className="font-semibold mr-2">C.</span> {q.option_c}
                                  </div>
                                  <div className={`p-2 rounded-lg border ${q.correct_option === 'option_d' ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'border-slate-100 text-slate-600'}`}>
                                    <span className="font-semibold mr-2">D.</span> {q.option_d}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteQuestion(quiz.id, q.id)}
                                className="flex-shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors self-start"
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
                    <form onSubmit={(e) => handleAddQuestion(quiz.id, e)} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      <h5 className="font-bold text-slate-800 mb-4">Add New Question</h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                          <input
                            type="text"
                            placeholder="What is..."
                            required
                            value={newQuestion.text}
                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Option A</label>
                            <input type="text" required value={newQuestion.option_a} onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Option B</label>
                            <input type="text" required value={newQuestion.option_b} onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Option C</label>
                            <input type="text" required value={newQuestion.option_c} onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Option D</label>
                            <input type="text" required value={newQuestion.option_d} onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-700">Correct Answer:</label>
                            <select
                              value={newQuestion.correct_option}
                              onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value })}
                              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                              <option value="option_a">Option A</option>
                              <option value="option_b">Option B</option>
                              <option value="option_c">Option C</option>
                              <option value="option_d">Option D</option>
                            </select>
                          </div>
                          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
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

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          Student Results
        </h2>
        
        {results.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-500 font-medium">No results recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {results.map((result) => {
                  const percentage = Math.round((result.score / result.total) * 100);
                  return (
                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {result.user_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {result.quiz_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs ${
                            percentage >= 80 ? 'bg-green-100 text-green-800' : 
                            percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            {result.score} / {result.total}
                          </span>
                          <span className="text-slate-400 font-medium">{percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(result.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
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
