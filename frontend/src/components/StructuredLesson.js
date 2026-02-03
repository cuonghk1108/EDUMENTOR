import React, { useState, useRef } from 'react';
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
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ttsAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Render text with LaTeX formulas
 * Supports both inline ($...$) and block ($$...$$) math
 */
const MathText = ({ text }) => {
  if (!text) return null;

  // Split text by math delimiters
  const parts = [];
  let remaining = text;
  let key = 0;

  // Process block math first ($$...$$)
  while (remaining.includes('$$')) {
    const startIdx = remaining.indexOf('$$');
    const endIdx = remaining.indexOf('$$', startIdx + 2);
    
    if (endIdx === -1) break;

    // Add text before math
    if (startIdx > 0) {
      parts.push({ type: 'text', content: remaining.slice(0, startIdx), key: key++ });
    }

    // Add block math
    const mathContent = remaining.slice(startIdx + 2, endIdx);
    parts.push({ type: 'block', content: mathContent, key: key++ });

    remaining = remaining.slice(endIdx + 2);
  }

  // Process inline math ($...$) in remaining text
  const processInline = (str) => {
    const inlineParts = [];
    let rest = str;
    let inlineKey = 0;

    while (rest.includes('$')) {
      const start = rest.indexOf('$');
      const end = rest.indexOf('$', start + 1);

      if (end === -1) break;

      // Add text before math
      if (start > 0) {
        inlineParts.push({ type: 'text', content: rest.slice(0, start), key: `i${inlineKey++}` });
      }

      // Add inline math
      const math = rest.slice(start + 1, end);
      inlineParts.push({ type: 'inline', content: math, key: `i${inlineKey++}` });

      rest = rest.slice(end + 1);
    }

    // Add remaining text
    if (rest) {
      inlineParts.push({ type: 'text', content: rest, key: `i${inlineKey++}` });
    }

    return inlineParts;
  };

  // Add remaining text with inline math processing
  if (remaining) {
    const inlineParts = processInline(remaining);
    parts.push(...inlineParts.map(p => ({ ...p, key: key++ })));
  }

  // If no math found, process entire text for inline math
  if (parts.length === 0) {
    const inlineParts = processInline(text);
    return (
      <span>
        {inlineParts.map((part) => {
          if (part.type === 'inline') {
            try {
              return <InlineMath key={part.key} math={part.content} />;
            } catch (e) {
              return <code key={part.key} className="text-red-500">{part.content}</code>;
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
            return <pre key={part.key} className="text-red-500 bg-red-50 p-2 rounded">{part.content}</pre>;
          }
        }
        if (part.type === 'inline') {
          try {
            return <InlineMath key={part.key} math={part.content} />;
          } catch (e) {
            return <code key={part.key} className="text-red-500">{part.content}</code>;
          }
        }
        return <span key={part.key}>{part.content}</span>;
      })}
    </span>
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

  // Update audioUrl when existingAudioUrl changes
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
      // Clean text for TTS (remove LaTeX)
      const cleanText = text
        .replace(/\$\$[\s\S]*?\$\$/g, '') // Remove block math
        .replace(/\$[^$]+\$/g, '') // Remove inline math
        .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove LaTeX commands
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
            onClick={togglePlay}
            className="p-2 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
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
              // Audio file might be missing, allow regenerate
              setAudioReady(false);
              setAudioUrl(null);
            }}
          />
        </>
      ) : (
        <button
          onClick={generateAudio}
          disabled={isLoading}
          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
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
 * Collapsible section component
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
  color = 'primary' 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const colorClasses = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  return (
    <div className="mb-4 border rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex items-center justify-between ${colorClasses[color]} border-b`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5" />}
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {audioText && (
            <SectionAudio 
              text={audioText} 
              sectionName={title} 
              existingAudioUrl={existingAudioUrl}
              sectionId={sectionId}
              lessonId={lessonId}
            />
          )}
          {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
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
            <div className="p-4 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Formula card component
 */
const FormulaCard = ({ formula }) => (
  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 mb-3">
    <h4 className="font-semibold text-blue-800 mb-2">{formula.name}</h4>
    <div className="bg-white p-3 rounded-lg shadow-sm mb-2 overflow-x-auto">
      <MathText text={formula.formula} />
    </div>
    {formula.description && (
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Ý nghĩa:</span> {formula.description}
      </p>
    )}
    {formula.conditions && (
      <p className="text-sm text-gray-600">
        <span className="font-medium">Điều kiện:</span> {formula.conditions}
      </p>
    )}
  </div>
);

/**
 * Example card component
 */
const ExampleCard = ({ example, index }) => {
  const [showSolution, setShowSolution] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };

  const difficultyLabels = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó'
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-800">Ví dụ {index}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[example.difficulty] || difficultyColors.medium}`}>
          {difficultyLabels[example.difficulty] || 'Trung bình'}
        </span>
      </div>
      
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-700 mb-1">Đề bài:</p>
        <MathText text={example.problem} />
      </div>

      <button
        onClick={() => setShowSolution(!showSolution)}
        className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-2"
      >
        {showSolution ? '▼ Ẩn lời giải' : '▶ Xem lời giải'}
      </button>

      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-700 mb-2">Lời giải:</p>
              <div className="text-gray-700 whitespace-pre-wrap">
                <MathText text={example.solution} />
              </div>
              {example.answer && (
                <p className="mt-2 font-semibold text-green-800">
                  Đáp số: <MathText text={example.answer} />
                </p>
              )}
              {example.tips && (
                <p className="mt-2 text-sm text-blue-600 italic">
                  💡 Mẹo: {example.tips}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Exercise card component
 */
const ExerciseCard = ({ exercise, index }) => {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 mb-4">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-800">Bài {index}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty] || difficultyColors.medium}`}>
          {exercise.difficulty === 'easy' ? 'Dễ' : exercise.difficulty === 'hard' ? 'Khó' : 'TB'}
        </span>
      </div>

      <div className="mb-3">
        <MathText text={exercise.problem} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {exercise.hints && exercise.hints.length > 0 && (
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200"
          >
            💡 {showHints ? 'Ẩn gợi ý' : 'Xem gợi ý'}
          </button>
        )}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
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
            className="mt-3 p-3 bg-yellow-50 rounded-lg"
          >
            <p className="font-medium text-yellow-700 mb-1">Gợi ý:</p>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {exercise.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
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
            className="mt-3 p-3 bg-green-50 rounded-lg"
          >
            <p className="font-semibold text-green-700">
              Đáp số: <MathText text={exercise.answer} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Main StructuredLesson component
 */
const StructuredLesson = ({ lesson }) => {
  // Parse structured content if it's a string
  let data = lesson.structuredContent;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return (
        <div className="p-4 bg-red-50 rounded-lg text-red-700">
          Lỗi: Không thể parse nội dung bài học
        </div>
      );
    }
  }

  if (!data) {
    return null;
  }

  // Get audio sections map from lesson (if audio was generated before)
  const audioSectionsMap = {};
  if (lesson.audioSections && Array.isArray(lesson.audioSections)) {
    lesson.audioSections.forEach(section => {
      if (section.sectionId && section.url) {
        audioSectionsMap[section.sectionId] = section.url;
      }
    });
  }

  // Helper to get audio URL for a section
  const getAudioUrl = (sectionId) => audioSectionsMap[sectionId] || null;

  return (
    <div className="structured-lesson">
      {/* Title & Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h1>
        <div className="flex flex-wrap gap-2">
          {data.subject && <span className="badge-primary">{data.subject}</span>}
          {data.grade && <span className="badge-secondary">Lớp {data.grade}</span>}
          {data.chapter && <span className="badge-ghost">{data.chapter}</span>}
          {lesson.hasAudio && (
            <span className="badge bg-green-100 text-green-700">
              🔊 Có audio
            </span>
          )}
        </div>
      </div>

      {/* Key Points */}
      {data.keyPoints && data.keyPoints.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
          <h3 className="font-semibold text-primary-800 mb-2 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5" />
            Điểm quan trọng
          </h3>
          <ul className="space-y-1">
            {data.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <CheckCircleIcon className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                <MathText text={point} />
              </li>
            ))}
          </ul>
        </div>
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
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            <MathText text={data.theory} />
          </div>
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
            <FormulaCard key={i} formula={formula} />
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
            <ExampleCard key={i} example={example} index={example.id || i + 1} />
          ))}
        </CollapsibleSection>
      )}

      {/* Exercises Section */}
      {data.exercises && data.exercises.length > 0 && (
        <CollapsibleSection
          title={`Bài tập tự luyện (${data.exercises.length})`}
          icon={AcademicCapIcon}
          color="orange"
          defaultOpen={false}
        >
          {data.exercises.map((exercise, i) => (
            <ExerciseCard key={i} exercise={exercise} index={exercise.id || i + 1} />
          ))}
        </CollapsibleSection>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">📝 Tóm tắt</h3>
          <p className="text-gray-700">
            <MathText text={data.summary} />
          </p>
        </div>
      )}

      {/* Common Mistakes */}
      {data.commonMistakes && data.commonMistakes.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Lỗi thường gặp
          </h3>
          <ul className="space-y-1">
            {data.commonMistakes.map((mistake, i) => (
              <li key={i} className="text-gray-700 flex items-start gap-2">
                <span className="text-red-500">⚠</span>
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Topics */}
      {data.relatedTopics && data.relatedTopics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Chủ đề liên quan:</span>
          {data.relatedTopics.map((topic, i) => (
            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default StructuredLesson;
