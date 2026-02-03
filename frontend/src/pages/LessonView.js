import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { lessonAPI, ttsAPI, quizAPI } from '../services/api';
import StructuredLesson from '../components/StructuredLesson';
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
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [viewMode, setViewMode] = useState('structured'); // 'structured' | 'markdown' | 'latex'
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
      // Use the first audio file for the main player
      setAudioUrl(`${baseUrl}/api/tts/${lesson.audioIds[0]}`);
    }
  }, [lesson, baseUrl]);

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
      // Get first 4000 characters for TTS
      const text = lesson.content.replace(/[#*_\[\]]/g, '').slice(0, 4000);
      
      const response = await ttsAPI.generate({ 
        text, 
        voice: 'nova',
        lessonId: lesson._id || lesson.id
      });
      
      if (response.data.audio?.url) {
        const fullUrl = `${baseUrl}${response.data.audio.url}`;
        setAudioUrl(fullUrl);
        // Invalidate lesson query to refresh audioIds
        queryClient.invalidateQueries(['lesson', lessonId]);
        toast.success('Tạo audio thành công!');
      }
    } catch (error) {
      toast.error('Lỗi tạo audio');
    } finally {
      setAudioLoading(false);
    }
  };

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
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Không tìm thấy bài học</p>
        <Link to="/lessons" className="btn-primary">
          Về danh sách bài học
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to="/lessons" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Quay lại danh sách
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-primary">{lesson.subject}</span>
              {lesson.chapter && <span className="text-gray-400">• {lesson.chapter}</span>}
              {lesson.completed && (
                <span className="badge-success">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Hoàn thành
                </span>
              )}
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              {lesson.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-8 flex flex-wrap items-center gap-4"
      >
        {/* Audio Section */}
        {audioUrl ? (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-200 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900">Audio bài giảng</p>
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
            className="btn-ghost"
          >
            {audioLoading ? (
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <SpeakerWaveIcon className="w-5 h-5 mr-2" />
            )}
            {audioLoading ? 'Đang tạo...' : 'Tạo audio bài giảng'}
          </button>
        )}

        <div className="flex-1" />

        {/* Quiz Button */}
        <button
          onClick={() => quizMutation.mutate()}
          disabled={quizMutation.isLoading}
          className="btn-secondary"
        >
          {quizMutation.isLoading ? (
            <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <SparklesIcon className="w-5 h-5 mr-2" />
          )}
          Tạo Quiz
        </button>

        {/* Complete Button */}
        {!lesson.completed && (
          <button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isLoading}
            className="btn-primary"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Đánh dấu hoàn thành
          </button>
        )}
      </motion.div>

      {/* Lesson Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        {/* View Mode Tabs */}
        {(lesson.structuredContent || lesson.latexContent) && (
          <div className="flex border-b border-gray-200 mb-4">
            {lesson.structuredContent && (
              <button
                onClick={() => setViewMode('structured')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  viewMode === 'structured'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                Bài giảng
              </button>
            )}
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                viewMode === 'markdown'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpenIcon className="w-4 h-4 inline mr-1" />
              Markdown
            </button>
            {lesson.latexContent && (
              <button
                onClick={() => setViewMode('latex')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  viewMode === 'latex'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CodeBracketIcon className="w-4 h-4 inline mr-1" />
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
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
              {lesson.latexContent}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(lesson.latexContent);
                toast.success('Đã copy LaTeX!');
              }}
              className="mt-2 btn-ghost text-sm"
            >
              📋 Copy LaTeX
            </button>
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        )}
      </motion.div>

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-between">
        <Link to="/lessons" className="btn-ghost">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Danh sách bài học
        </Link>

        <Link to="/chat" className="btn-outline">
          Có thắc mắc? Hỏi AI ngay
        </Link>
      </div>
    </div>
  );
};

export default LessonView;
