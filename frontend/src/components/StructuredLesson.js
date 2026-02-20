import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import {
  SpeakerWaveIcon,
  PauseIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  BeakerIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  StarIcon,
  BookmarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { ttsAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Render text with LaTeX formulas
 */
const MathText = ({ text }) => {
  if (!text) return null;

  // Pre-process text to fix common LaTeX issues
  const processedText = fixLatexFormulas(text);

  const parts = [];
  let remaining = processedText;
  let key = 0;

  while (remaining.includes('$$')) {
    const startIdx = remaining.indexOf('$$');
    const endIdx = remaining.indexOf('$$', startIdx + 2);
    
    if (endIdx === -1) break;

    if (startIdx > 0) {
      parts.push({ type: 'text', content: remaining.slice(0, startIdx), key: key++ });
    }

    const mathContent = remaining.slice(startIdx + 2, endIdx);
    parts.push({ type: 'block', content: mathContent.trim(), key: key++ });

    remaining = remaining.slice(endIdx + 2);
  }

  const processInline = (str) => {
    const inlineParts = [];
    let rest = str;
    let inlineKey = 0;

    while (rest.includes('$')) {
      const start = rest.indexOf('$');
      const end = rest.indexOf('$', start + 1);

      if (end === -1) break;

      if (start > 0) {
        inlineParts.push({ type: 'text', content: rest.slice(0, start), key: `i${inlineKey++}` });
      }

      const math = rest.slice(start + 1, end).trim();
      inlineParts.push({ type: 'inline', content: math, key: `i${inlineKey++}` });

      rest = rest.slice(end + 1);
    }

    if (rest) {
      inlineParts.push({ type: 'text', content: rest, key: `i${inlineKey++}` });
    }

    return inlineParts;
  };

  if (remaining) {
    const inlineParts = processInline(remaining);
    parts.push(...inlineParts.map(p => ({ ...p, key: key++ })));
  }

  if (parts.length === 0) {
    const inlineParts = processInline(processedText);
    return (
      <span>
        {inlineParts.map((part) => {
          if (part.type === 'inline') {
            try {
              return <InlineMath key={part.key} math={part.content} />;
            } catch (e) {
              console.warn('Failed to render inline math:', part.content, e.message);
              return <code key={part.key} className="text-red-400 bg-red-500/10 px-1 rounded">{part.content}</code>;
            }
          }
          return <span key={part.key}>{part.content}</span>;
        })}
      </span>
    );
  }

  return (
    <span>
      {parts.map((part) => {
        if (part.type === 'block') {
          try {
            return (
              <div key={part.key} className="my-4 overflow-x-auto">
                <BlockMath math={part.content} />
              </div>
            );
          } catch (e) {
            console.warn('Failed to render block math:', part.content, e.message);
            return <pre key={part.key} className="text-red-400 bg-red-500/10 p-2 rounded text-sm">{part.content}</pre>;
          }
        }
        if (part.type === 'inline') {
          try {
            return <InlineMath key={part.key} math={part.content} />;
          } catch (e) {
            console.warn('Failed to render inline math:', part.content, e.message);
            return <code key={part.key} className="text-red-400 bg-red-500/10 px-1 rounded">{part.content}</code>;
          }
        }
        return <span key={part.key}>{part.content}</span>;
      })}
    </span>
  );
};

/**
 * Fix common LaTeX formula issues
 */
function fixLatexFormulas(text) {
  if (!text) return '';
  
  let fixed = text;
  
  // Fix double-escaped LaTeX commands \\frac -> \frac
  fixed = fixed.replace(/\\\\(frac|sqrt|sum|int|lim|sin|cos|tan|log|ln|alpha|beta|gamma|delta|theta|pi|omega|leq|geq|neq|times|div|pm|mp|cdot|vec|hat|bar|dot|ddot|tilde|left|right|begin|end|text|mathrm|mathbf|partial|nabla|infty|exists|forall|amp)\b/g, '\\$1');
  
  // Fix triple+ escaped backslashes
  while (fixed.includes('\\\\\\\\')) {
    fixed = fixed.replace(/\\\\\\\\/g, '\\\\');
  }
  
  // Remove spaces after opening $ and before closing $
  fixed = fixed.replace(/\$\s+/g, '$');
  fixed = fixed.replace(/\s+\$/g, '$');
  
  // Fix spaces in {content} patterns that might have extra spaces
  fixed = fixed.replace(/\{\s+/g, '{');
  fixed = fixed.replace(/\s+\}/g, '}');
  
  // Fix escaped ampersands (common in tables)
  fixed = fixed.replace(/\\&/g, '&');
  
  // Fix double dollar signs that might be escaped
  fixed = fixed.replace(/\$\$\$/g, '$$');
  
  // Fix spaces around \\ (line breaks in environments)
  fixed = fixed.replace(/\s+\\\\\s+/g, '\\\\');
  
  return fixed;
}

/**
 * Key Point Box - Highlight important points with animation
 */
const KeyPointBox = ({ point, index }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-4 p-4 relative rounded-xl overflow-hidden group"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-transparent 
        group-hover:from-yellow-500/30 group-hover:via-orange-500/20 transition-colors" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
      
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 
          text-gray-900 flex items-center justify-center font-bold shadow-lg">
          ⭐
        </div>
        <div className="flex-1">
          <p className="text-gray-100 leading-relaxed">
            <MathText text={point} />
          </p>
        </div>
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`flex-shrink-0 p-2 rounded-lg transition-all ${
            isBookmarked 
              ? 'bg-amber-500/30 text-amber-300' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
          title="Bookmark điểm quan trọng"
        >
          <BookmarkIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Quick Check Question - Mini quiz for comprehension
 */
const QuickCheckQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const isCorrect = selected === correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold shrink-0">
          ?
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wide mb-1">Kiểm Tra Hiểu Biết</p>
          <p className="text-gray-200 font-medium"><MathText text={question} /></p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {options?.map((opt, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!isAnswered) {
                setSelected(idx);
                setIsAnswered(true);
              }
            }}
            className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all ${
              selected === idx
                ? isCorrect
                  ? 'bg-green-500/30 border-2 border-green-500 text-green-100'
                  : 'bg-red-500/30 border-2 border-red-500 text-red-100'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
            }`}
            disabled={isAnswered && selected !== idx}
          >
            <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
              style={selected === idx ? { borderColor: isCorrect ? '#10b981' : '#ef4444' } : {}}>
              {selected === idx && (isCorrect ? '✓' : '✗')}
            </div>
            <span><MathText text={opt} /></span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3 rounded-lg border-l-4 ${
              isCorrect
                ? 'bg-green-500/10 border-green-500 text-green-200'
                : 'bg-red-500/10 border-red-500 text-red-200'
            }`}
          >
            <p className="font-medium mb-1 flex items-center gap-2">
              {isCorrect ? <CheckIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
              {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
            </p>
            {explanation && (
              <p className="text-sm opacity-90"><MathText text={explanation} /></p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Interactive Note - For important notes with interactions
 */
const InteractiveNote = ({ content, type = 'note', highlighted = false }) => {
  const [isExpanded, setIsExpanded] = useState(highlighted);
  
  const typeConfig = {
    note: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', icon: '📝', color: 'text-blue-300' },
    warning: { bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30', icon: '⚠️', color: 'text-red-300' },
    success: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', icon: '✓', color: 'text-green-300' },
    tip: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', icon: '💡', color: 'text-amber-300' }
  };

  const config = typeConfig[type] || typeConfig.note;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`mb-4 p-4 rounded-xl bg-gradient-to-r ${config.bg} border ${config.border} cursor-pointer hover:shadow-lg transition-all`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1">
          <p className="text-gray-100">
            <MathText text={content} />
          </p>
        </div>
        {highlighted && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0"
          />
        )}
      </div>
    </motion.div>
  );
};

/**
 * Progress Tracker - Shows learning progress
 */
const ProgressTracker = ({ currentIndex, totalIndex }) => {
  const progress = ((currentIndex + 1) / totalIndex) * 100;
  
  return (
    <div className="fixed bottom-6 right-6 w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
      shadow-lg shadow-purple-500/50 flex items-center justify-center z-50 pointer-events-none">
      <div className="text-center">
        <div className="text-white font-bold text-2xl">{Math.round(progress)}%</div>
        <div className="text-white text-xs opacity-80">Hoàn thành</div>
      </div>
    </div>
  );
};

/**
 * Audio player for a section
 */
const SectionAudio = ({ text, sectionName, existingAudioUrl, sectionId, lessonId }) => {
  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const [audioUrl, setAudioUrl] = useState(
    existingAudioUrl ? `${baseUrl}${existingAudioUrl}` : null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(!!existingAudioUrl);
  const audioRef = useRef(null);

  React.useEffect(() => {
    if (existingAudioUrl) {
      setAudioUrl(`${baseUrl}${existingAudioUrl}`);
      setAudioReady(true);
    }
  }, [existingAudioUrl, baseUrl]);

  const generateAudio = async () => {
    if (!text) return;

    setIsLoading(true);
    try {
      const cleanText = text
        .replace(/\$\$[\s\S]*?\$\$/g, '')
        .replace(/\$[^$]+\$/g, '')
        .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const response = await ttsAPI.generate({ 
        text: cleanText.slice(0, 3000),
        voiceId: 'Natalie',
        style: 'Conversational',
        lessonId,
        sectionId
      });

      if (response.data.audio?.url) {
        setAudioUrl(`${baseUrl}${response.data.audio.url}`);
        setAudioReady(true);
        toast.success(`Tạo audio "${sectionName}" thành công!`);
      }
    } catch (error) {
      toast.error(`Lỗi tạo audio: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2">
      {audioReady && audioUrl ? (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onCanPlayThrough={() => setAudioReady(true)}
            onError={() => {
              setAudioReady(false);
              setAudioUrl(null);
            }}
          />
        </>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); generateAudio(); }}
          disabled={isLoading}
          className="p-2 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 transition-colors disabled:opacity-50"
          title="Tạo audio"
        >
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <SpeakerWaveIcon className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

/**
 * Collapsible section component - Dark Theme
 */
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true, 
  audioText, 
  existingAudioUrl,
  sectionId,
  lessonId,
  color = 'purple' 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const colorClasses = {
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-300',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-300',
    cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-300'
  };

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r ${colorClasses[color]} border-b border-white/10`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6" />}
          <span className="font-semibold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {audioText && (
            <SectionAudio 
              text={audioText} 
              sectionName={title} 
              existingAudioUrl={existingAudioUrl}
              sectionId={sectionId}
              lessonId={lessonId}
            />
          )}
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            {isOpen ? <ChevronUpIcon className="w-5 h-5 text-white" /> : <ChevronDownIcon className="w-5 h-5 text-white" />}
          </div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 text-gray-200">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Formula card component - Dark Theme
 */
const FormulaCard = ({ formula }) => (
  <div className="formula-card relative p-5 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 mb-4 overflow-hidden">
    {/* Decorative background */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full translate-y-12 -translate-x-12 blur-2xl" />
    
    <div className="relative z-10">
      <h4 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
        {formula.name}
      </h4>
      
      <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl shadow-lg mb-3 overflow-x-auto border border-white/10">
        <div className="text-center text-white">
          <MathText text={formula.formula} />
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        {formula.description && (
          <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-blue-400 mt-0.5">📝</span>
            <div>
              <span className="font-medium text-gray-300">Ý nghĩa: </span>
              <span className="text-gray-400">{formula.description}</span>
            </div>
          </div>
        )}
        {formula.conditions && (
          <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <span className="text-orange-400 mt-0.5">⚠️</span>
            <div>
              <span className="font-medium text-orange-300">Điều kiện: </span>
              <span className="text-gray-400">{formula.conditions}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * Example card component - Dark Theme
 */
const ExampleCard = ({ example, index }) => {
  const [showSolution, setShowSolution] = useState(false);

  const difficultyConfig = {
    easy: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', label: 'Dễ', icon: '🟢' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', label: 'Trung bình', icon: '🟡' },
    hard: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', label: 'Khó', icon: '🔴' }
  };

  const config = difficultyConfig[example.difficulty] || difficultyConfig.medium;

  return (
    <div className="example-card bg-gray-900/50 rounded-xl border border-white/10 mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-green-500/20">
            {index}
          </span>
          <h4 className="font-semibold text-white">Ví dụ {index}</h4>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
          {config.icon} {config.label}
        </span>
      </div>
      
      {/* Problem */}
      <div className="p-5">
        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="font-medium text-gray-400 text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
            Đề bài
          </p>
          <div className="text-gray-200">
            <MathText text={example.problem} />
          </div>
        </div>

        {/* Toggle solution button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSolution(!showSolution)}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            showSolution 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
              : 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
          }`}
        >
          {showSolution ? '👁️ Ẩn lời giải' : '✨ Xem lời giải chi tiết'}
        </motion.button>

        {/* Solution */}
        <AnimatePresence>
          {showSolution && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <p className="font-medium text-green-400 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg flex items-center justify-center text-xs shadow-lg shadow-green-500/20">✓</span>
                  Lời giải chi tiết
                </p>
                <div className="text-gray-300 space-y-3 pl-4 border-l-2 border-green-500/30">
                  <MathText text={example.solution} />
                </div>
                
                {example.answer && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                    <p className="font-bold text-green-300 flex items-center gap-2">
                      🎯 Đáp số: <span className="text-white"><MathText text={example.answer} /></span>
                    </p>
                  </div>
                )}
                
                {example.tips && (
                  <div className="mt-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-sm text-blue-300 flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      <span><strong>Mẹo:</strong> <span className="text-gray-300">{example.tips}</span></span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Exercise card component - Dark Theme
 */
const ExerciseCard = ({ exercise, index }) => {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-300 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <div className="p-5 bg-white/5 rounded-xl border-2 border-dashed border-white/20 mb-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-500/20 text-orange-300 rounded-lg flex items-center justify-center text-sm font-bold">
            {index}
          </span>
          Bài {index}
        </h4>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[exercise.difficulty] || difficultyColors.medium}`}>
          {exercise.difficulty === 'easy' ? 'Dễ' : exercise.difficulty === 'hard' ? 'Khó' : 'TB'}
        </span>
      </div>

      <div className="mb-4 text-gray-300">
        <MathText text={exercise.problem} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {exercise.hints && exercise.hints.length > 0 && (
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-xl hover:bg-yellow-500/30 border border-yellow-500/30 transition-colors"
          >
            💡 {showHints ? 'Ẩn gợi ý' : 'Xem gợi ý'}
          </button>
        )}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-sm px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 border border-green-500/30 transition-colors"
        >
          ✓ {showAnswer ? 'Ẩn đáp số' : 'Xem đáp số'}
        </button>
      </div>

      <AnimatePresence>
        {showHints && exercise.hints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
          >
            <p className="font-medium text-yellow-300 mb-2">💡 Gợi ý:</p>
            <ul className="space-y-1 text-sm text-gray-300">
              {exercise.hints.map((hint, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  {hint}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20"
          >
            <p className="font-semibold text-green-300">
              🎯 Đáp số: <span className="text-white"><MathText text={exercise.answer} /></span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Main StructuredLesson component - Dark Theme
 */
const StructuredLesson = ({ lesson }) => {
  const [viewProgress, setViewProgress] = useState(0);
  const rootRef = useRef(null);

  // Track reading progress when scrolling - MUST be before any conditional returns
  useEffect(() => {
    const handleScroll = () => {
      if (!rootRef.current) return;
      const element = rootRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const scrolled = element.parentElement?.scrollTop || window.scrollY;
      const scrollPercentage = (scrolled / (totalHeight || 1)) * 100;
      setViewProgress(Math.min(100, Math.max(0, scrollPercentage)));
    };

    const scrollContainer = rootRef.current?.parentElement || window;
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  let data = lesson.structuredContent;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return (
        <div className="p-4 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
          Lỗi: Không thể parse nội dung bài học
        </div>
      );
    }
  }

  if (!data) {
    return null;
  }

  const audioSectionsMap = {};
  if (lesson.audioSections && Array.isArray(lesson.audioSections)) {
    lesson.audioSections.forEach(section => {
      if (section.sectionId && section.url) {
        audioSectionsMap[section.sectionId] = section.url;
      }
    });
  }

  const getAudioUrl = (sectionId) => audioSectionsMap[sectionId] || null;

  return (
    <div ref={rootRef} className="structured-lesson">
      {/* Progress Tracker */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50 pointer-events-none"
        animate={{ opacity: viewProgress > 5 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
          shadow-lg shadow-purple-500/50 flex items-center justify-center">
          <div className="text-center">
            <motion.div 
              animate={{ rotateZ: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white opacity-20"
            />
            <div className="relative">
              <div className="text-white font-bold text-lg">{Math.round(viewProgress)}%</div>
              <div className="text-white text-xs opacity-80">Hoàn thành</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Title & Info */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-4">{data.title}</h1>
        <div className="flex flex-wrap gap-2">
          {data.subject && (
            <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
              {data.subject}
            </span>
          )}
          {data.grade && (
            <span className="px-4 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium border border-cyan-500/30">
              Lớp {data.grade}
            </span>
          )}
          {data.chapter && (
            <span className="px-4 py-1.5 bg-white/10 text-gray-300 rounded-full text-sm border border-white/20">
              {data.chapter}
            </span>
          )}
          {lesson.hasAudio && (
            <span className="px-4 py-1.5 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30 flex items-center gap-1">
              <SpeakerWaveIcon className="w-4 h-4" />
              Có audio
            </span>
          )}
        </div>
      </motion.div>

      {/* Key Points - Interactive */}
      {data.keyPoints && data.keyPoints.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-gray-900" />
            </div>
            <h3 className="font-semibold text-white text-lg">Điểm quan trọng cần nhớ</h3>
          </div>
          <div className="space-y-2">
            {data.keyPoints.map((point, i) => (
              <KeyPointBox key={i} point={point} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Theory Section */}
      {data.theory && (
        <CollapsibleSection
          title="Lý thuyết"
          icon={AcademicCapIcon}
          color="blue"
          audioText={data.theory}
          existingAudioUrl={getAudioUrl('theory')}
          sectionId="theory"
          lessonId={lesson._id || lesson.id}
          defaultOpen={true}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose prose-invert max-w-none whitespace-pre-wrap"
          >
            <MathText text={data.theory} />
          </motion.div>
        </CollapsibleSection>
      )}

      {/* Formulas Section */}
      {data.formulas && data.formulas.length > 0 && (
        <CollapsibleSection
          title={`Công thức (${data.formulas.length})`}
          icon={BeakerIcon}
          color="purple"
          defaultOpen={true}
        >
          {data.formulas.map((formula, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <FormulaCard formula={formula} />
            </motion.div>
          ))}
        </CollapsibleSection>
      )}

      {/* Examples Section */}
      {data.examples && data.examples.length > 0 && (
        <CollapsibleSection
          title={`Ví dụ minh họa (${data.examples.length})`}
          icon={LightBulbIcon}
          color="green"
          audioText={data.examples.map(e => `Ví dụ ${e.id}: ${e.problem}. Lời giải: ${e.solution}`).join('. ')}
          existingAudioUrl={getAudioUrl('examples')}
          sectionId="examples"
          lessonId={lesson._id || lesson.id}
          defaultOpen={true}
        >
          {data.examples.map((example, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <ExampleCard example={example} index={example.id || i + 1} />
            </motion.div>
          ))}
        </CollapsibleSection>
      )}

      {/* Exercises Section - Interactive */}
      {data.exercises && data.exercises.length > 0 && (
        <CollapsibleSection
          title={`Bài tập tự luyện (${data.exercises.length})`}
          icon={AcademicCapIcon}
          color="orange"
          defaultOpen={false}
        >
          {data.exercises.map((exercise, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <ExerciseCard exercise={exercise} index={exercise.id || i + 1} />
            </motion.div>
          ))}
        </CollapsibleSection>
      )}

      {/* Summary - Highlighted */}
      {data.summary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <InteractiveNote 
            content={data.summary}
            type="success"
            highlighted={true}
          />
        </motion.div>
      )}

      {/* Common Mistakes */}
      {data.commonMistakes && data.commonMistakes.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-red-300 mb-4 flex items-center gap-2 text-lg">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Lỗi thường gặp
          </h3>
          {data.commonMistakes.map((mistake, i) => (
            <InteractiveNote 
              key={i}
              content={mistake}
              type="warning"
            />
          ))}
        </motion.div>
      )}

      {/* Related Topics */}
      {data.relatedTopics && data.relatedTopics.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-5 bg-cyan-500/10 rounded-2xl border border-cyan-500/20"
        >
          <h4 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-wide">Chủ đề liên quan</h4>
          <div className="flex flex-wrap gap-2">
            {data.relatedTopics.map((topic, i) => (
              <motion.span 
                key={i}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-full text-sm border border-white/10 hover:border-cyan-500/30 transition-colors cursor-pointer"
              >
                {topic}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Completion Message */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 text-center"
      >
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-bold text-white mb-2 text-lg">Tuyệt vời!</h3>
        <p className="text-gray-300 text-sm">Bạn đã hoàn thành phần học lý thuyết. Hãy làm các bài tập để củng cố kiến thức!</p>
      </motion.div>
    </div>
  );
};

export default StructuredLesson;
