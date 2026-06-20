import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, Feather, LogIn, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthModal } from "../components/AuthModal";
import { questions, PASS_SCORE, TOTAL_QUESTIONS } from "../lib/assessmentQuestions";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../lib/supabase";

type Phase = "intro" | "quiz" | "result";

export const Assessment = () => {
  const { user, session } = useAuth();
  const hasActiveSession = Boolean(user && session?.access_token);
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [prevResult, setPrevResult] = useState<any>(null);
  const [loadingPrev, setLoadingPrev] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setSaveError("");
    setPhase("intro");
    setAnswers({});
    setCurrentIndex(0);
    setPrevResult(null);
    if (!hasActiveSession) { setLoadingPrev(false); return; }
    setLoadingPrev(true);
    authApi<{ result?: any }>("/quiz-result")
      .then(d => { setPrevResult(d.result); setLoadingPrev(false); })
      .catch(() => setLoadingPrev(false));
  }, [hasActiveSession]);

  const handleAnswer = (qId: number, optIdx: number) => {
    if (phase !== "quiz") return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const beginQuiz = () => {
    if (!hasActiveSession) {
      setSaveError("登录状态已失效，请重新登录后再参加考核");
      setAuthOpen(true);
      return;
    }
    setAnswers({});
    setScore(0);
    setPassed(false);
    setSaveError("");
    setCurrentIndex(0);
    setPhase("quiz");
  };

  const goNext = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1) setCurrentIndex(i => i + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleSubmit = async () => {
    setSaveError("");
    if (Object.keys(answers).length < TOTAL_QUESTIONS) return;
    if (!hasActiveSession) {
      setSaveError("登录状态已失效，请重新登录后再提交考核");
      setAuthOpen(true);
      return;
    }
    const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
    const finalScore = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const didPass = finalScore >= PASS_SCORE;

    setSubmitting(true);
    try {
      await authApi("/quiz-result", {
        method: "POST",
        body: {
          score: finalScore,
          total_score: 100,
          passed: didPass,
          single_correct: correctCount,
          multiple_correct: 0,
          answers,
        },
      });
      // 保存后立即读回确认，避免接口假成功导致用户中心和名册入口仍显示未考核。
      const verifyData = await authApi<{ result?: any }>("/quiz-result");
      if (!verifyData.result) {
        setSaveError("考核结果保存后读取失败，请稍后重试");
        return;
      }
      setScore(Number(verifyData.result.score ?? finalScore));
      setPassed(Boolean(verifyData.result.passed));
      setPrevResult(verifyData.result);
      setPhase("result");
    } catch (e) {
      console.log("save quiz result error:", e);
      setSaveError("考核结果保存失败，请检查网络后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const answered = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const canGoNext = currentAnswer !== undefined;
  const canSubmit = answered === TOTAL_QUESTIONS && currentAnswer !== undefined;
  const progress = Math.round(((currentIndex + 1) / TOTAL_QUESTIONS) * 100);

  if (loadingPrev) return <div className="flex items-center justify-center py-32 text-[var(--ink-mid)]">加载中…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* 页面标题 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest text-[var(--ink-gold)]">
          <Feather className="w-3.5 h-3.5" /> <span>问心考核</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink-deep)]">问心考核</h1>
        <p className="mt-2 text-sm text-[var(--ink-mid)]">以金典为镜，照见入派初心</p>
      </div>

      {/* 未登录时只展示登录引导，不提前展示题目。 */}
      {!hasActiveSession && phase === "intro" && (
        <div className="bg-[var(--ink-parchment)] rounded-2xl p-8 border border-[var(--ink-deep)]/8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--ink-gold)]/15 flex items-center justify-center mb-4">
            <LogIn className="w-7 h-7 text-[var(--ink-gold)]" />
          </div>
          <h3 className="font-serif text-xl font-medium text-[var(--ink-deep)] mb-3">请先登录再参加考核</h3>
          <p className="text-sm text-[var(--ink-mid)] leading-relaxed mb-6">
            问心考核结果需要保存到您的问云账号。登录后即可逐题作答，通过后可继续申请登记入册。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setAuthOpen(true)}
              className="flex-1 bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white text-sm">
              <LogIn className="w-4 h-4 mr-2" /> 登录后考核
            </Button>
            <Link to="/charter" className="flex-1">
              <Button variant="outline" className="w-full border-[var(--ink-deep)]/20 text-[var(--ink-deep)] text-sm">
                <BookOpen className="w-4 h-4 mr-2" /> 先读金典
              </Button>
            </Link>
          </div>
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="login" />
        </div>
      )}

      {/* 历史成绩提示 */}
      {hasActiveSession && prevResult && phase === "intro" && (
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
                去登记 <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* 考核说明 */}
      {hasActiveSession && phase === "intro" && (
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
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/charter" className="flex-1">
              <Button variant="outline" className="w-full border-[var(--ink-deep)]/20 text-[var(--ink-deep)] text-sm">
                <BookOpen className="w-4 h-4 mr-2" /> 先读金典
              </Button>
            </Link>
            <Button onClick={beginQuiz} className="flex-1 bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white text-sm">
              开始考核
            </Button>
          </div>
        </div>
      )}

      {/* 单题作答 */}
      {hasActiveSession && phase === "quiz" && currentQuestion && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-[var(--ink-mid)] mb-2">
            <span>第 {currentIndex + 1} / {TOTAL_QUESTIONS} 题</span>
            <div className="flex items-center gap-2">
              <span>已答 {answered} 题</span>
              <div className="w-28 h-1.5 rounded-full bg-[var(--ink-deep)]/10 overflow-hidden">
                <div className="h-full rounded-full bg-[var(--ink-gold)] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className={`bg-[var(--ink-parchment)] rounded-2xl p-6 border transition-all ${currentAnswer !== undefined
              ? "border-[var(--ink-gold)]/30" : "border-[var(--ink-deep)]/8"
              }`}>
            <p className="font-medium text-[var(--ink-deep)] text-sm mb-4 leading-relaxed">
              <span className="text-[var(--ink-gold)] mr-2">{currentIndex + 1}.</span>{currentQuestion.question}
            </p>
            <div className="space-y-2">
              {currentQuestion.options.map((opt, oi) => (
                <button key={oi} onClick={() => handleAnswer(currentQuestion.id, oi)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${currentAnswer === oi
                    ? "bg-[var(--ink-gold)]/20 border border-[var(--ink-gold)]/50 text-[var(--ink-deep)] font-medium"
                    : "bg-white/50 border border-[var(--ink-deep)]/8 text-[var(--ink-mid)] hover:border-[var(--ink-deep)]/20 hover:bg-white/80"
                    }`}>
                  <span className="text-[var(--ink-gold)]/70 mr-2">{["A", "B", "C", "D"][oi]}.</span>{opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}
              className="sm:w-28 border-[var(--ink-deep)]/20 text-[var(--ink-deep)]">
              <ChevronLeft className="w-4 h-4 mr-1" /> 上一题
            </Button>
            {currentIndex < TOTAL_QUESTIONS - 1 ? (
              <Button onClick={goNext} disabled={!canGoNext}
                className="flex-1 bg-[var(--ink-deep)] hover:bg-[var(--ink-mid)] text-[var(--ink-parchment)] py-3">
                下一题 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit || submitting}
                className="flex-1 bg-[var(--ink-deep)] hover:bg-[var(--ink-mid)] text-[var(--ink-parchment)] py-3">
                {submitting ? "提交中…" : canSubmit ? "提交答案" : "请先作答本题"}
              </Button>
            )}
          </div>
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-500">
              {saveError}
            </div>
          )}
        </div>
      )}

      {/* 结果页只显示分数和金典阅读入口，不展示题目答案。 */}
      {hasActiveSession && phase === "result" && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 bg-[var(--ink-gold)]/15">
            <Feather className="w-12 h-12 text-[var(--ink-gold)]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--ink-deep)] mb-2">
            本次问心得分
          </h2>
          <p className="text-4xl font-bold text-[var(--ink-gold)] my-4">{score}<span className="text-lg text-[var(--ink-mid)] ml-1">分</span></p>
          <p className="text-sm text-[var(--ink-mid)] mb-8 leading-relaxed">
            问心之后，可回到《立派金典》继续温习门派约定，再按自己的节奏前往名册登记。
          </p>
          {saveError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-500">
              {saveError}
            </div>
          )}

          <Link to="/charter">
            <Button className="bg-[var(--ink-gold)] hover:bg-[var(--ink-gold)]/90 text-white">
              <BookOpen className="w-4 h-4 mr-2" /> 阅读立派金典
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
