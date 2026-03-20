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
      <div className="max-w-md mx-auto text-center py-16 px-8 glass-panel rounded-[2.5rem] mt-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 hover:rotate-0 transition-all shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4 tracking-tight">Oops!</h2>
          <p className="text-slate-500 mb-10 font-medium">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-full px-8 py-4 text-sm font-bold rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 mr-3" /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const percentage = Math.round((result.score / result.total) * 100);
    const isSuccess = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-10 glass-panel rounded-[3rem] mt-16 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.05)] border-2 border-white/80">
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none ${isSuccess ? 'bg-green-200' : 'bg-yellow-200'}`}></div>
        <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full mix-blend-multiply filter blur-2xl opacity-40 pointer-events-none ${isSuccess ? 'bg-emerald-200' : 'bg-orange-200'}`}></div>

        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Quiz Result</p>
          <div className={`w-32 h-32 mx-auto rounded-[2rem] flex items-center justify-center mb-10 shadow-lg transform rotate-6 hover:rotate-12 transition-all duration-300 border-4 border-white ${isSuccess ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-emerald-600' : 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-500'}`}>
            {isSuccess ? <Trophy className="w-16 h-16 drop-shadow-sm" /> : <CheckCircle className="w-16 h-16 drop-shadow-sm" />}
          </div>

          <h2 className="text-5xl font-serif font-extrabold text-slate-800 mb-4 tracking-tight">
            {isSuccess ? 'Outstanding!' : 'Good Effort!'}
          </h2>
          <p className="text-xl text-slate-500 mb-12 font-medium">Here's how you performed</p>

          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 mb-12 border border-white shadow-sm inline-block min-w-[300px]">
            <div className="flex justify-center items-end gap-2 mb-4">
              <span className={`text-8xl font-black tracking-tighter ${isSuccess ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-green-600' : 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 to-orange-500'}`}>
                {percentage}%
              </span>
            </div>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-wide">
              Score: <span className="font-bold text-slate-900">{result.score}</span> / {result.total}
            </p>
          </div>

          <div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 text-sm font-bold rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5 mr-3" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-8 glass-panel rounded-[2.5rem] mt-16">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white">
          <HelpCircle className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4 tracking-tight">No Questions Yet</h2>
        <p className="text-slate-500 mb-10 font-medium">This quiz doesn't have any questions configured.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center w-full px-8 py-4 text-sm font-bold rounded-full text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 mr-3" /> Return to Dashboard
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto pb-20 relative px-4 sm:px-0 mt-4">
      {/* Floating Header */}
      <div className="sticky top-6 z-30 glass-panel rounded-full py-4 px-6 mb-12 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors font-bold bg-white/60 px-5 py-2.5 rounded-full shadow-sm hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="flex-1 px-8 hidden md:block">
            {/* Minimal Progress Bar */}
            <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full transition-all duration-700 ease-spring"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-colors shadow-sm ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse border-red-100' : 'bg-white/80 text-slate-700 border-white'}`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="flex items-center justify-center w-12 h-12 bg-white/80 rounded-full shadow-sm border border-white">
              <span className="text-sm font-bold text-slate-700">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {questions.map((q, index) => (
          <div key={q.id} className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border-[3px] border-white relative">
            {/* Question Number Badge */}
            <div className="absolute top-8 left-8 w-12 h-12 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-2xl flex items-center justify-center border border-white shadow-sm transform -rotate-3">
              <span className="text-indigo-600 font-bold text-xl">{index + 1}</span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-slate-800 mb-10 pl-16 sm:pl-20 leading-snug">
              {q.text}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, optIndex) => {
                const isSelected = answers[q.id] === optKey;
                const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D

                return (
                  <label
                    key={optKey}
                    className={`group relative flex items-center p-5 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 ${isSelected
                      ? 'border-indigo-400 bg-white/80 shadow-[0_10px_30px_rgba(99,102,241,0.15)] transform scale-[1.02]'
                      : 'border-transparent bg-white/40 hover:bg-white hover:border-indigo-100 hover:shadow-md'
                      }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mr-5 border-2 transition-colors ${isSelected
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-white bg-slate-100 text-slate-400 group-hover:border-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                      }`}>
                      <span className="text-base font-bold">{optionLetter}</span>
                    </div>

                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={optKey}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(q.id, optKey)}
                      className="sr-only" // Hide the actual radio button
                    />
                    <span className={`text-lg flex-1 font-medium transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                      {q[optKey]}
                    </span>

                    {/* Selected Indicator Ring */}
                    <div className={`absolute inset-0 border-2 rounded-[2rem] pointer-events-none transition-all duration-300 ${isSelected ? 'border-indigo-400 scale-100 opacity-100' : 'border-transparent scale-95 opacity-0'
                      }`}></div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center sticky bottom-8 z-30">
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className={`relative overflow-hidden group px-12 py-5 text-white font-bold text-lg rounded-full transition-all shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-900/30 w-full sm:w-auto ${submitting ? 'bg-slate-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 hover:shadow-[0_15px_50px_rgba(0,0,0,0.3)]'
            }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-3 tracking-wide">
            {submitting ? 'Submitting...' : 'Complete Quiz'}
            {!submitting && <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />}
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
