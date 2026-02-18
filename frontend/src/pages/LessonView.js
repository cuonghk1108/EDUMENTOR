import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { lessonAPI, ttsAPI, quizAPI, streakAPI } from '../services/api';
import StructuredLesson from '../components/StructuredLesson';
import CustomizePromptModal from '../components/CustomizePromptModal';
import MathRenderer from '../components/MathRenderer';
import {
  BookOpenIcon,
  CheckCircleIcon,
  SpeakerWaveIcon,
  PauseIcon,
  PlayIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [viewMode, setViewMode] = useState('structured');
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const audioRef = React.useRef(null);
  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Fetch lesson
  const { data: lesson, isLoading, error } = useQuery(
    ['lesson', lessonId],
    () => lessonAPI.getById(lessonId).then(res => res.data.lesson),
    { enabled: !!lessonId }
  );

  // Set audio URL from existing lesson audio
  React.useEffect(() => {
    if (lesson?.hasAudio && lesson?.audioIds?.length > 0) {
      setAudioUrl(`${baseUrl}/api/tts/${lesson.audioIds[0]}`);
    }
  }, [lesson, baseUrl]);

  // Record streak when viewing lesson
  useEffect(() => {
    if (lesson) {
      streakAPI.record('lesson_view', 5).catch(err => {
        console.log('Streak record failed:', err);
      });
    }
  }, [lesson]);

  // Mark complete mutation
  const completeMutation = useMutation(
    () => lessonAPI.markComplete(lessonId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['lesson', lessonId]);
        queryClient.invalidateQueries('lessons');
        toast.success('Đã đánh dấu hoàn thành!');
      }
    }
  );

  // Generate quiz mutation
  const quizMutation = useMutation(
    () => quizAPI.generate({
      text: lesson.originalText || lesson.content,
      count: 5,
      topic: lesson.title,
      lessonId: lesson.id
    }),
    {
      onSuccess: (data) => {
        toast.success('Tạo quiz thành công!');
        navigate(`/quiz/${data.data.quiz.id}`);
      },
      onError: () => {
        toast.error('Lỗi tạo quiz');
      }
    }
  );

  // Generate TTS
  const handleGenerateTTS = async () => {
    if (!lesson?.content) return;

    setAudioLoading(true);
    try {
      const text = lesson.content.replace(/[#*_\[\]]/g, '').slice(0, 4000);
      
      const response = await ttsAPI.generate({ 
        text, 
        voice: 'nova',
        lessonId: lesson._id || lesson.id
      });
      
      if (response.data.audio?.url) {
        const fullUrl = `${baseUrl}${response.data.audio.url}`;
        setAudioUrl(fullUrl);
        queryClient.invalidateQueries(['lesson', lessonId]);
        toast.success('Tạo audio thành công!');
      }
    } catch (error) {
      toast.error('Lỗi tạo audio');
    } finally {
      setAudioLoading(false);
    }
  };

  // Customize lesson with prompt
  const customizeMutation = useMutation(
    (prompt) => lessonAPI.customize(lessonId, { customPrompt: prompt }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['lesson', lessonId]);
        setIsCustomizeModalOpen(false);
        toast.success('Bài giảng đã được cập nhật theo yêu cầu của bạn!');
      },
      onError: () => {
        toast.error('Lỗi cập nhật bài giảng. Vui lòng thử lại.');
      }
    }
  );

  // Play/Pause audio
  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
        <p className="text-gray-400">Đang tải bài học...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpenIcon className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-red-400 mb-6 text-lg">Không tìm thấy bài học</p>
        <Link 
          to="/lessons" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white"
        >
          Về danh sách bài học
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/lessons" 
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                {lesson.subject}
              </span>
              {lesson.chapter && (
                <span className="text-gray-500">• {lesson.chapter}</span>
              )}
              {lesson.completed && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  <CheckCircleIcon className="w-3 h-3" />
                  Hoàn thành
                </span>
              )}
            </div>
            <h1 className="text-3xl font-display font-bold text-white">
              {lesson.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4"
      >
        {/* Audio Section */}
        {audioUrl ? (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
            <div>
              <p className="text-sm font-medium text-white">Audio bài giảng</p>
              <p className="text-xs text-gray-500">Nhấn để {isPlaying ? 'tạm dừng' : 'phát'}</p>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <button
            onClick={handleGenerateTTS}
            disabled={audioLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {audioLoading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <SpeakerWaveIcon className="w-5 h-5" />
            )}
            {audioLoading ? 'Đang tạo...' : 'Tạo audio bài giảng'}
          </button>
        )}

        <div className="flex-1" />

        {/* Customize Lesson Button */}
        <button
          onClick={() => setIsCustomizeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
          Yêu cầu dạy thêm
        </button>

        {/* Quiz Button */}
        <button
          onClick={() => quizMutation.mutate()}
          disabled={quizMutation.isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
        >
          {quizMutation.isLoading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <SparklesIcon className="w-5 h-5" />
          )}
          Tạo Quiz
        </button>

        {/* Complete Button */}
        {!lesson.completed && (
          <button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Đánh dấu hoàn thành
          </button>
        )}
      </motion.div>

      {/* Lesson Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/50 border border-white/5 rounded-2xl p-6"
      >
        {/* View Mode Tabs */}
        {(lesson.structuredContent || lesson.latexContent) && (
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
            {lesson.structuredContent && (
              <button
                onClick={() => setViewMode('structured')}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'structured'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4" />
                Bài giảng
              </button>
            )}
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'markdown'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpenIcon className="w-4 h-4" />
              Markdown
            </button>
            {lesson.latexContent && (
              <button
                onClick={() => setViewMode('latex')}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'latex'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CodeBracketIcon className="w-4 h-4" />
                LaTeX
              </button>
            )}
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'structured' && lesson.structuredContent ? (
          <StructuredLesson lesson={lesson} />
        ) : viewMode === 'latex' && lesson.latexContent ? (
          <div className="latex-content">
            <pre className="bg-gray-950 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap border border-white/10">
              {lesson.latexContent}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(lesson.latexContent);
                toast.success('Đã copy LaTeX!');
              }}
              className="mt-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              📋 Copy LaTeX
            </button>
          </div>
        ) : (
          <div className="markdown-content prose prose-invert max-w-none">
            <MathRenderer content={lesson.content} />
          </div>
        )}
      </motion.div>

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-between">
        <Link 
          to="/lessons" 
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Danh sách bài học
        </Link>

        <Link 
          to="/chat" 
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          Có thắc mắc? Hỏi AI ngay
        </Link>
      </div>

      {/* Customize Prompt Modal */}
      <CustomizePromptModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onSubmit={(prompt) => customizeMutation.mutate(prompt)}
        isLoading={customizeMutation.isLoading}
        lessonTitle={lesson.title}
      />
    </div>
  );
};

export default LessonView;
