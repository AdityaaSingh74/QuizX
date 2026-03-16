import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../services/api';
import { CheckCircle, AlertCircle, ArrowLeft, HelpCircle, Trophy, Clock } from 'lucide-react';

export default function QuizAttempt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await fetchApi(`/quizzes/${id}/questions`);
        setQuestions(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && Object.keys(answers).length < questions.length) {
      if (!confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const data = await fetchApi('/results', {
        method: 'POST',
        body: JSON.stringify({ quiz_id: id, answers }),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (loading || result || submitting || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, result, submitting, questions.length]);

  useEffect(() => {
    if (timeLeft === 0 && !submitting && !result && questions.length > 0) {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl shadow-xl border border-red-100 mt-10">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Return to Dashboard
        </button>
      </div>
    );
  }

  if (result) {
    const percentage = Math.round((result.score / result.total) * 100);
    const isSuccess = percentage >= 70;

    return (
      <div className="max-w-xl mx-auto text-center py-16 px-8 bg-white rounded-3xl shadow-xl border border-gray-100 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-white"></div>
        
        <div className="relative z-10">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
            {isSuccess ? <Trophy className="w-12 h-12" /> : <CheckCircle className="w-12 h-12" />}
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className="text-lg text-gray-500 mb-8">Here's how you did</p>
          
          <div className="bg-slate-50 rounded-2xl p-8 mb-8 border border-slate-100">
            <div className="flex justify-center items-end gap-2 mb-2">
              <span className={`text-6xl font-black ${isSuccess ? 'text-green-600' : 'text-yellow-600'}`}>
                {percentage}%
              </span>
            </div>
            <p className="text-gray-600 font-medium text-lg">
              You scored <span className="font-bold text-gray-900">{result.score}</span> out of <span className="font-bold text-gray-900">{result.total}</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl shadow-xl border border-gray-100 mt-10">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Questions Yet</h2>
        <p className="text-gray-600 mb-8">This quiz doesn't have any questions configured.</p>
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Return to Dashboard
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-200"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Quiz
          </button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border font-bold ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white border-gray-200 text-gray-700'}`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <CheckCircle className={`w-4 h-4 ${answeredCount === questions.length ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm font-bold text-gray-700 hidden sm:inline">
              {answeredCount} <span className="text-gray-400 font-medium">/ {questions.length} Answered</span>
            </span>
            <span className="text-sm font-bold text-gray-700 sm:hidden">
              {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Question Number Badge */}
            <div className="absolute top-0 left-0 w-12 h-12 bg-indigo-50 rounded-br-3xl flex items-center justify-center">
              <span className="text-indigo-600 font-bold">{index + 1}</span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-6 mt-4 sm:mt-0 sm:ml-8 leading-relaxed">
              {q.text}
            </h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, optIndex) => {
                const isSelected = answers[q.id] === optKey;
                const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                
                return (
                  <label
                    key={optKey}
                    className={`group relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100/50'
                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 border-2 transition-colors ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : 'border-gray-300 text-gray-500 group-hover:border-indigo-400'
                    }`}>
                      <span className="text-sm font-bold">{optionLetter}</span>
                    </div>
                    
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={optKey}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(q.id, optKey)}
                      className="sr-only" // Hide the actual radio button
                    />
                    <span className={`text-base flex-1 ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}`}>
                      {q[optKey]}
                    </span>
                    
                    {/* Selected Indicator */}
                    <div className={`absolute right-4 w-4 h-4 rounded-full transition-transform duration-200 ${
                      isSelected ? 'scale-100 bg-indigo-600' : 'scale-0'
                    }`}></div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center sm:justify-end">
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className={`relative overflow-hidden group px-10 py-4 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${
            submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
            {!submitting && <CheckCircle className="w-5 h-5" />}
          </span>
          {/* Shine effect */}
          {!submitting && (
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
          )}
        </button>
      </div>
    </div>
  );
}
