import { useState, useEffect } from "react";
import { Link } from "react-router";
import { CheckCircle, XCircle, ArrowRight, Feather, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { questions, PASS_SCORE, TOTAL_QUESTIONS } from "../lib/assessmentQuestions";
import { useAuth } from "../context/AuthContext";
import { API, authHeaders } from "../lib/supabase";

type Phase = "intro" | "quiz" | "result";

export const Assessment = () => {
  const { user, session } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prevResult, setPrevResult] = useState<any>(null);
  const [loadingPrev, setLoadingPrev] = useState(true);

  useEffect(() => {
    if (!user || !session) { setLoadingPrev(false); return; }
    fetch(`${API}/quiz-result`, { headers: authHeaders(session.access_token) })
      .then(r => r.json())
      .then(d => { setPrevResult(d.result); setLoadingPrev(false); })
      .catch(() => setLoadingPrev(false));
  }, [user, session]);

  const handleAnswer = (qId: number, optIdx: number) => {
    if (phase !== "quiz") return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async () => {
    const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
    const finalScore = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const didPass = finalScore >= PASS_SCORE;
    setScore(finalScore);
    setPassed(didPass);
    setPhase("result");

    if (user && session) {
      setSubmitting(true);
      try {
        await fetch(`${API}/quiz-result`, {
          method: "POST",
          headers: authHeaders(session.access_token),
          body: JSON.stringify({ score: finalScore, passed: didPass }),
        });
        setPrevResult({ score: finalScore, passed: didPass });
      } catch (e) {
        console.log("save quiz result error:", e);
      }
      setSubmitting(false);
    }
  };

  const answered = Object.keys(answers).length;
  const canSubmit = answered === TOTAL_QUESTIONS;

  if (loadingPrev) return <div className="flex items-center justify-center py-32 text-[var(--ink-mid)]">加载中…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest text-[var(--ink-gold)]">
          <Feather className="w-3.5 h-3.5" /> <span>问心考核</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink-deep)]">问心考核</h1>
        <p className="mt-2 text-sm text-[var(--ink-mid)]">以金典为镜，照见入派初心</p>
      </div>

      {/* Previous Result Banner */}
      {prevResult && phase === "intro" && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${prevResult.passed
          ? "bg-[var(--ink-green)]/10 border border-[var(--ink-green)]/20"
          : "bg-[var(--ink-gold)]/10 border border-[var(--ink-gold)]/20"
          }`}>
          {prevResult.passed
            ? <CheckCircle className="w-5 h-5 text-[var(--ink-green)] shrink-0" />
            : <AlertCircle className="w-5 h-5 text-[var(--ink-gold)] shrink-0" />
          }
          <div>
            <p className="text-sm font-medium text-[var(--ink-deep)]">
              {prevResult.passed ? `您已通过考核（${prevResult.score}分）` : `上次考核得分：${prevResult.score}分（须达80分）`}
            </p>
            <p className="text-xs text-[var(--ink-mid)]">
              {prevResult.passed ? "可前往问云名册登记入册" : "可重新作答"}
            </p>
          </div>
          {prevResult.passed && (
            <Link to="/members" className="ml-auto shrink-0">
              <Button size="sm" className="bg-[var(--ink-green)] hover:bg-[var(--ink-green)]/90 text-white text-xs">
                去登记 <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Intro Phase */}
      {phase === "intro" && (
        <div className="bg-[var(--ink-parchment)] rounded-2xl p-8 border border-[var(--ink-deep)]/8">
          <h3 className="font-serif text-lg font-medium text-[var(--ink-deep)] mb-4">考核说明</h3>
          <ul className="space-y-2 text-sm text-[var(--ink-mid)] leading-relaxed mb-6">
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-gold)] mt-0.5">✦</span>
              共 {TOTAL_QUESTIONS} 道单选题，均来自《立派金典》
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-gold)] mt-0.5">✦</span>
              答对 {Math.ceil(TOTAL_QUESTIONS * PASS_SCORE / 100)} 题及以上（{PASS_SCORE}分）即为通过
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-gold)] mt-0.5">✦</span>
              通过后方可申请登记入册
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-gold)] mt-0.5">✦</span>
              建议先阅读《立派金典》再作答
            </li>
          </ul>
          {!user && (
            <div className="mb-4 p-3 bg-[var(--ink-gold)]/10 rounded-xl text-xs text-[var(--ink-gold)]">
              请先登录，以保存您的考核结果
            </div>
          )}
          <div className="flex gap-3">
            <Link to="/charter" className="flex-1">
              <Button variant="outline" className="w-full border-[var(--ink-deep)]/20 text-[var(--ink-deep)] text-sm">
                先读金典
              </Button>
            </Link>
            <Button onClick={() => setPhase("quiz")} className="flex-1 bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white text-sm">
              开始考核
            </Button>
          </div>
        </div>
      )}

      {/* Quiz Phase */}
      {phase === "quiz" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-[var(--ink-mid)] mb-2">
            <span>已答 {answered} / {TOTAL_QUESTIONS} 题</span>
            <div className="w-32 h-1.5 rounded-full bg-[var(--ink-deep)]/10 overflow-hidden">
              <div className="h-full rounded-full bg-[var(--ink-gold)] transition-all" style={{ width: `${(answered / TOTAL_QUESTIONS) * 100}%` }} />
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={q.id} className={`bg-[var(--ink-parchment)] rounded-2xl p-6 border transition-all ${answers[q.id] !== undefined
              ? "border-[var(--ink-gold)]/30" : "border-[var(--ink-deep)]/8"
              }`}>
              <p className="font-medium text-[var(--ink-deep)] text-sm mb-4 leading-relaxed">
                <span className="text-[var(--ink-gold)] mr-2">{qi + 1}.</span>{q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => handleAnswer(q.id, oi)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${answers[q.id] === oi
                      ? "bg-[var(--ink-gold)]/20 border border-[var(--ink-gold)]/50 text-[var(--ink-deep)] font-medium"
                      : "bg-white/50 border border-[var(--ink-deep)]/8 text-[var(--ink-mid)] hover:border-[var(--ink-deep)]/20 hover:bg-white/80"
                      }`}>
                    <span className="text-[var(--ink-gold)]/70 mr-2">{["A", "B", "C", "D"][oi]}.</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}
            className="w-full bg-[var(--ink-deep)] hover:bg-[var(--ink-mid)] text-[var(--ink-parchment)] py-3">
            {submitting ? "提交中…" : canSubmit ? "提交答案" : `还有 ${TOTAL_QUESTIONS - answered} 题未作答`}
          </Button>
        </div>
      )}

      {/* Result Phase */}
      {phase === "result" && (
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${passed
            ? "bg-[var(--ink-green)]/15" : "bg-red-50"
            }`}>
            {passed
              ? <CheckCircle className="w-12 h-12 text-[var(--ink-green)]" />
              : <XCircle className="w-12 h-12 text-red-400" />
            }
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--ink-deep)] mb-2">
            {passed ? "问心有得，恭喜通过" : "缘未至，再研金典"}
          </h2>
          <p className="text-4xl font-bold text-[var(--ink-gold)] my-4">{score}<span className="text-lg text-[var(--ink-mid)] ml-1">分</span></p>
          <p className="text-sm text-[var(--ink-mid)] mb-2">
            答对 {questions.filter(q => answers[q.id] === q.answer).length} / {TOTAL_QUESTIONS} 题
          </p>
          <p className="text-sm text-[var(--ink-mid)] mb-8">
            {passed ? "您已通过问心考核，可前往名册登记入册" : `需达${PASS_SCORE}分方可通过，建议重读《立派金典》后再试`}
          </p>

          {/* Correct/Wrong Review */}
          <div className="text-left space-y-2 mb-8">
            {questions.map((q, qi) => {
              const userAns = answers[q.id];
              const correct = userAns === q.answer;
              return (
                <div key={q.id} className={`p-3 rounded-xl text-xs flex items-start gap-2 ${correct ? "bg-[var(--ink-green)]/8" : "bg-red-50"}`}>
                  {correct
                    ? <CheckCircle className="w-3.5 h-3.5 text-[var(--ink-green)] shrink-0 mt-0.5" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-[var(--ink-deep)] font-medium mb-0.5">{qi + 1}. {q.question}</p>
                    {!correct && (
                      <p className="text-red-500">正确答案：{q.options[q.answer]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setPhase("intro"); setAnswers({}); }}
              className="flex-1 border-[var(--ink-deep)]/20 text-[var(--ink-deep)]">
              {passed ? "再次作答" : "重新考核"}
            </Button>
            {passed && (
              <Link to="/members" className="flex-1">
                <Button className="w-full bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white">
                  前往登记入册
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
