import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI } from '../services/api';
import {
  MapIcon,
  CheckCircleIcon,
  ClockIcon,
  LightBulbIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
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

  // Fetch existing roadmap
  const { data: roadmapData, isLoading } = useQuery(
    ['roadmap', user?.id],
    () => roadmapAPI.get(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  // Fetch recommendations
  const { data: recommendations } = useQuery(
    ['recommendations', user?.id],
    () => roadmapAPI.getRecommendations(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  // Fetch weakness analysis
  const { data: weaknessData } = useQuery(
    ['weaknesses', user?.id],
    () => roadmapAPI.analyzeWeaknesses(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  // Generate roadmap mutation
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
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots text-primary-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  const roadmap = roadmapData?.roadmap;
  const analysis = weaknessData?.analysis;
  const recs = recommendations?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Lộ trình học tập</h1>
          <p className="text-gray-600 mt-1">Kế hoạch học tập cá nhân hóa theo năng lực</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {roadmap ? 'Tạo lộ trình mới' : 'Tạo lộ trình'}
        </button>
      </div>

      {/* Recommendations */}
      {recs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Đề xuất cho bạn</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recs.slice(0, 4).map((rec, index) => (
              <div
                key={index}
                className={`card border-l-4 ${
                  rec.priority === 'high' ? 'border-l-red-500' :
                  rec.priority === 'medium' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    rec.type === 'weakness' ? 'bg-red-100' :
                    rec.type === 'strength' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {rec.type === 'weakness' ? (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    ) : rec.type === 'strength' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <LightBulbIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{rec.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{rec.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analysis */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Phân tích học lực</h2>
          <p className="text-gray-600 mb-4">{analysis.analysis?.overall}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.analysis?.strengths?.length > 0 && (
              <div>
                <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Điểm mạnh
                </h3>
                <ul className="space-y-1">
                  {analysis.analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.analysis?.weaknesses?.length > 0 && (
              <div>
                <h3 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Cần cải thiện
                </h3>
                <ul className="space-y-1">
                  {analysis.analysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-gray-600">• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {analysis.motivationalMessage && (
            <div className="mt-4 p-4 bg-primary-50 rounded-xl">
              <p className="text-primary-700 font-medium">💪 {analysis.motivationalMessage}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Roadmap Display */}
      {roadmap?.roadmap ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {roadmap.roadmap.title}
            </h2>
            <p className="text-gray-500 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Thời gian: {roadmap.roadmap.duration}
            </p>
          </div>

          {/* Phases */}
          {roadmap.roadmap.phases?.map((phase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="card"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary-600">{phase.phase}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                  <p className="text-sm text-gray-500">{phase.duration}</p>
                  
                  {/* Goals */}
                  {phase.goals?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Mục tiêu:</h4>
                      <ul className="space-y-1">
                        {phase.goals.map((goal, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Topics */}
                  {phase.topics?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Chủ đề:</h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.topics.map((topic, i) => (
                          <span
                            key={i}
                            className={`px-3 py-1 rounded-full text-sm ${
                              topic.priority === 'high' ? 'bg-red-100 text-red-700' :
                              topic.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
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

          {/* Weekly Schedule */}
          {roadmap.roadmap.weeklySchedule && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch học tuần</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(roadmap.roadmap.weeklySchedule).map(([day, activities]) => (
                  <div key={day} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm capitalize mb-2">
                      {day === 'monday' ? 'Thứ 2' :
                       day === 'tuesday' ? 'Thứ 3' :
                       day === 'wednesday' ? 'Thứ 4' :
                       day === 'thursday' ? 'Thứ 5' :
                       day === 'friday' ? 'Thứ 6' :
                       day === 'saturday' ? 'Thứ 7' : 'CN'}
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
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
            <div className="card bg-primary-50">
              <h3 className="text-lg font-semibold text-primary-900 mb-3">💡 Mẹo học tập</h3>
              <ul className="space-y-2">
                {roadmap.tips.map((tip, i) => (
                  <li key={i} className="text-primary-800">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ) : !showGenerator && (
        <div className="card text-center py-16">
          <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lộ trình học tập</h3>
          <p className="text-gray-500 mb-6">
            Tạo lộ trình cá nhân hóa để học hiệu quả hơn
          </p>
          <button onClick={() => setShowGenerator(true)} className="btn-primary">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Tạo lộ trình ngay
          </button>
        </div>
      )}

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tạo lộ trình học tập</h2>
            
            <div className="space-y-5">
              <div>
                <label className="label">Khối lớp</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="input"
                >
                  <option>Lớp 10</option>
                  <option>Lớp 11</option>
                  <option>Lớp 12</option>
                </select>
              </div>

              <div>
                <label className="label">Môn học quan tâm</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        formData.subjects.includes(subject)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Mục tiêu học tập</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  className="input"
                  rows={3}
                  placeholder="VD: Đạt 8 điểm trở lên môn Toán, chuẩn bị thi THPT..."
                />
              </div>

              <div>
                <label className="label">Thời gian học mỗi ngày</label>
                <select
                  value={formData.studyTime}
                  onChange={(e) => setFormData({...formData, studyTime: e.target.value})}
                  className="input"
                >
                  <option>1 giờ</option>
                  <option>2 giờ</option>
                  <option>3 giờ</option>
                  <option>4 giờ trở lên</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerator(false)}
                className="btn-ghost flex-1"
              >
                Hủy
              </button>
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isLoading}
                className="btn-primary flex-1"
              >
                {generateMutation.isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Tạo lộ trình
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
