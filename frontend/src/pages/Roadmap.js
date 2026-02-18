import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI } from '../services/api';
import {
  MapIcon,
  CheckCircleIcon,
  ClockIcon,
  LightBulbIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  RocketLaunchIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Roadmap = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showGenerator, setShowGenerator] = useState(false);
  const [formData, setFormData] = useState({
    grade: 'Lớp 12',
    subjects: [],
    goals: '',
    studyTime: '2 giờ'
  });

  const { data: roadmapData, isLoading } = useQuery(
    ['roadmap', user?.id],
    () => roadmapAPI.get(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  const { data: recommendations } = useQuery(
    ['recommendations', user?.id],
    () => roadmapAPI.getRecommendations(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  const { data: weaknessData } = useQuery(
    ['weaknesses', user?.id],
    () => roadmapAPI.analyzeWeaknesses(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  const generateMutation = useMutation(
    (data) => roadmapAPI.generate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['roadmap', user?.id]);
        setShowGenerator(false);
        toast.success('Tạo lộ trình thành công!');
      },
      onError: () => {
        toast.error('Lỗi tạo lộ trình');
      }
    }
  );

  const handleGenerate = () => {
    if (!formData.subjects.length || !formData.goals) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    generateMutation.mutate(formData);
  };

  const subjects = [
    'Toán học', 'Vật lý', 'Hóa học', 'Sinh học',
    'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý'
  ];

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Đang tải lộ trình...</p>
        </div>
      </div>
    );
  }

  const roadmap = roadmapData?.roadmap;
  const analysis = weaknessData?.analysis;
  const recs = recommendations?.recommendations || [];

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <MapIcon className="w-7 h-7 text-white" />
              </div>
              Lộ trình học tập
            </h1>
            <p className="text-gray-400 mt-2 ml-15">Kế hoạch học tập cá nhân hóa theo năng lực của bạn</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerator(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl
                     shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            {roadmap ? 'Tạo lộ trình mới' : 'Tạo lộ trình'}
          </motion.button>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Giai đoạn</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {roadmap?.roadmap?.phases?.length || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl flex items-center justify-center">
                <RocketLaunchIcon className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Thời gian</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {roadmap?.roadmap?.duration || '--'}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-7 h-7 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Đề xuất</p>
                <p className="text-3xl font-bold text-white mt-1">{recs.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl flex items-center justify-center">
                <LightBulbIcon className="w-7 h-7 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-yellow-400" />
              Đề xuất cho bạn
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {recs.slice(0, 4).map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-gray-900/50 backdrop-blur-xl border-l-4 rounded-xl p-5 ${
                    rec.priority === 'high' ? 'border-l-red-500' :
                    rec.priority === 'medium' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      rec.type === 'weakness' ? 'bg-red-500/20' :
                      rec.type === 'strength' ? 'bg-green-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {rec.type === 'weakness' ? (
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                      ) : rec.type === 'strength' ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                      ) : (
                        <LightBulbIcon className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{rec.message}</p>
                      <p className="text-sm text-gray-400 mt-1">{rec.action}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analysis */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-cyan-400" />
              Phân tích học lực
            </h2>
            <p className="text-gray-300 mb-6">{analysis.analysis?.overall}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.analysis?.strengths?.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                  <h3 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    Điểm mạnh
                  </h3>
                  <ul className="space-y-2">
                    {analysis.analysis.strengths.map((s, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.analysis?.weaknesses?.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                  <h3 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Cần cải thiện
                  </h3>
                  <ul className="space-y-2">
                    {analysis.analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {analysis.motivationalMessage && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-xl">
                <p className="text-purple-300 font-medium">💪 {analysis.motivationalMessage}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Roadmap Display */}
        {roadmap?.roadmap ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {roadmap.roadmap.title}
              </h2>
              <p className="text-gray-300 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-purple-400" />
                Thời gian: {roadmap.roadmap.duration}
              </p>
            </div>

            {/* Phases */}
            <div className="space-y-4">
              {roadmap.roadmap.phases?.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                      <span className="text-2xl font-bold text-white">{phase.phase}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">{phase.name}</h3>
                      <p className="text-gray-400 mt-1">{phase.duration}</p>
                      
                      {phase.goals?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Mục tiêu:</h4>
                          <ul className="space-y-2">
                            {phase.goals.map((goal, i) => (
                              <li key={i} className="text-gray-400 flex items-start gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {phase.topics?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Chủ đề:</h4>
                          <div className="flex flex-wrap gap-2">
                            {phase.topics.map((topic, i) => (
                              <span
                                key={i}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                  topic.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                  topic.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                  'bg-green-500/20 text-green-300 border border-green-500/30'
                                }`}
                              >
                                {topic.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Weekly Schedule */}
            {roadmap.roadmap.weeklySchedule && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📅 Lịch học tuần</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {Object.entries(roadmap.roadmap.weeklySchedule).map(([day, activities]) => (
                    <div key={day} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                      <p className="font-medium text-purple-400 text-sm capitalize mb-2">
                        {day === 'monday' ? 'Thứ 2' :
                         day === 'tuesday' ? 'Thứ 3' :
                         day === 'wednesday' ? 'Thứ 4' :
                         day === 'thursday' ? 'Thứ 5' :
                         day === 'friday' ? 'Thứ 6' :
                         day === 'saturday' ? 'Thứ 7' : 'CN'}
                      </p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {activities?.slice(0, 2).map((a, i) => (
                          <li key={i}>• {a}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {roadmap.tips?.length > 0 && (
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <LightBulbIcon className="w-6 h-6 text-yellow-400" />
                  Mẹo học tập
                </h3>
                <ul className="space-y-2">
                  {roadmap.tips.map((tip, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <span className="text-cyan-400">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ) : !showGenerator && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapIcon className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Chưa có lộ trình học tập</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Tạo lộ trình cá nhân hóa để học hiệu quả hơn với sự hỗ trợ của AI
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerator(true)} 
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl
                       shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all inline-flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Tạo lộ trình ngay
            </motion.button>
          </motion.div>
        )}

        {/* Generator Modal */}
        <AnimatePresence>
          {showGenerator && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-purple-400" />
                    Tạo lộ trình học tập
                  </h2>
                  <button 
                    onClick={() => setShowGenerator(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Khối lớp</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="Lớp 10">Lớp 10</option>
                      <option value="Lớp 11">Lớp 11</option>
                      <option value="Lớp 12">Lớp 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Môn học quan tâm</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            formData.subjects.includes(subject)
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mục tiêu học tập</label>
                    <textarea
                      value={formData.goals}
                      onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      rows={3}
                      placeholder="VD: Đạt 8 điểm trở lên môn Toán, chuẩn bị thi THPT..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Thời gian học mỗi ngày</label>
                    <select
                      value={formData.studyTime}
                      onChange={(e) => setFormData({...formData, studyTime: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="1 giờ">1 giờ</option>
                      <option value="2 giờ">2 giờ</option>
                      <option value="3 giờ">3 giờ</option>
                      <option value="4 giờ trở lên">4 giờ trở lên</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowGenerator(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Hủy
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={generateMutation.isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl
                             shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generateMutation.isLoading ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Tạo lộ trình
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Roadmap;
