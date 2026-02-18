import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { studyPlanAPI, roadmapAPI } from '../services/api';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  XMarkIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const StudyPlan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('today');
  const [showGenerator, setShowGenerator] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    grade: '12',
    subjects: ['Toán', 'Ngữ văn', 'Tiếng Anh'],
    examDate: '',
    studyHoursPerDay: 4,
    studyTimeSlots: '7:00-11:00, 14:00-17:00, 19:00-21:00',
    targetScores: {}
  });

  const { data: roadmapData, isLoading } = useQuery(
    ['roadmap', user?.id],
    () => roadmapAPI.get(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  const { data: todayData } = useQuery(
    ['today-schedule'],
    () => studyPlanAPI.getTodaySchedule().then(res => res.data),
    { enabled: !!user?.id }
  );

  const analyzeMutation = useMutation(
    (data) => studyPlanAPI.analyzeWeakness(data),
    {
      onSuccess: () => {
        toast.success('Phân tích điểm yếu thành công!');
        queryClient.invalidateQueries(['roadmap']);
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Lỗi phân tích');
      }
    }
  );

  const generateMutation = useMutation(
    (data) => studyPlanAPI.generate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['roadmap']);
        queryClient.invalidateQueries(['today-schedule']);
        setShowGenerator(false);
        toast.success('Tạo lộ trình ôn thi thành công!');
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Lỗi tạo lộ trình');
      }
    }
  );

  const progressMutation = useMutation(
    (data) => studyPlanAPI.updateProgress(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['roadmap']);
        queryClient.invalidateQueries(['today-schedule']);
        toast.success('Đã cập nhật tiến độ!');
      }
    }
  );

  const deleteMutation = useMutation(
    () => studyPlanAPI.delete(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['roadmap']);
        queryClient.invalidateQueries(['today-schedule']);
        toast.success('Đã xóa lộ trình');
      }
    }
  );

  const handleGenerate = () => {
    if (!formData.examDate) {
      toast.error('Vui lòng chọn ngày thi');
      return;
    }
    generateMutation.mutate(formData);
  };

  const handleCompleteSession = (dayNumber, sessionIndex) => {
    progressMutation.mutate({
      dayNumber,
      sessionIndex,
      completed: true
    });
  };

  const subjects = [
    'Toán', 'Vật lý', 'Hóa học', 'Sinh học',
    'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý', 'GDCD'
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
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Đang tải lộ trình...</p>
        </div>
      </div>
    );
  }

  const roadmap = roadmapData?.roadmap;
  const studyPlan = roadmap?.studyPlan;
  const progress = roadmap?.progress;
  const weaknessAnalysis = roadmap?.weaknessAnalysis;
  const todaySchedule = todayData?.schedule;

  const totalDays = studyPlan?.dailyPlan?.length || 0;
  const completedDays = progress?.completedDays?.length || 0;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const tabs = [
    { id: 'today', label: 'Hôm nay', icon: FireIcon },
    { id: 'calendar', label: 'Lịch chi tiết', icon: CalendarDaysIcon },
    { id: 'phases', label: 'Giai đoạn', icon: ChartBarIcon },
    { id: 'tips', label: 'Mẹo & Chiến lược', icon: LightBulbIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-7 h-7 text-white" />
              </div>
              Lộ trình ôn thi TN THPT
            </h1>
            <p className="text-gray-400 mt-2">Kế hoạch học tập chi tiết theo ngày, cá nhân hóa theo điểm yếu</p>
          </div>
          <div className="flex gap-3">
            {!studyPlan && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => analyzeMutation.mutate({})}
                disabled={analyzeMutation.isLoading}
                className="px-5 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl
                         hover:bg-white/10 transition-all flex items-center gap-2"
              >
                {analyzeMutation.isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ChartBarIcon className="w-5 h-5 text-cyan-400" />
                    Phân tích điểm yếu
                  </>
                )}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerator(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl
                       shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              {studyPlan ? 'Tạo lại lộ trình' : 'Tạo lộ trình'}
            </motion.button>
          </div>
        </motion.div>

        {/* Weakness Analysis Summary */}
        {weaknessAnalysis && !studyPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-400" />
              Kết quả phân tích điểm yếu
            </h2>
            
            <p className="text-gray-300 mb-4">
              {weaknessAnalysis.overallAssessment?.summary}
            </p>

            {weaknessAnalysis.improvementPriority?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-orange-300">Ưu tiên cải thiện:</h3>
                {weaknessAnalysis.improvementPriority.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.rank || idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{item.topic}</p>
                      <p className="text-sm text-gray-400">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Study Plan Content */}
        {studyPlan ? (
          <>
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Tiến độ</p>
                    <p className="text-3xl font-bold text-cyan-400">{progressPercent}%</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-7 h-7 text-cyan-400" />
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  />
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
                    <p className="text-gray-400 text-sm">Ngày hiện tại</p>
                    <p className="text-3xl font-bold text-white">
                      {progress?.currentDay || 1}<span className="text-lg text-gray-500">/{totalDays}</span>
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl flex items-center justify-center">
                    <CalendarDaysIcon className="w-7 h-7 text-blue-400" />
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
                    <p className="text-gray-400 text-sm">Sessions hoàn thành</p>
                    <p className="text-3xl font-bold text-green-400">
                      {progress?.completedSessions?.length || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-7 h-7 text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ngày thi</p>
                    <p className="text-xl font-bold text-white">
                      {studyPlan.planInfo?.examDate || 'Chưa xác định'}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-7 h-7 text-red-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 font-medium rounded-xl transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {/* Today's Schedule */}
              {activeTab === 'today' && (
                <motion.div
                  key="today"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {todaySchedule ? (
                    <>
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 shadow-xl shadow-cyan-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-cyan-100 text-sm">Ngày {todaySchedule.day}</p>
                            <h2 className="text-2xl font-bold text-white">{todaySchedule.theme}</h2>
                            <p className="text-cyan-100 mt-1">{todaySchedule.dailyGoal}</p>
                          </div>
                          {todaySchedule.motivationalQuote && (
                            <div className="text-right max-w-xs hidden md:block">
                              <p className="text-sm italic text-cyan-100">
                                "{todaySchedule.motivationalQuote}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {todaySchedule.sessions?.map((session, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-gray-900/50 backdrop-blur-xl border rounded-2xl p-5 ${
                              session.completed 
                                ? 'border-green-500/30 bg-green-500/5' 
                                : 'border-white/10 hover:border-cyan-500/30'
                            } transition-colors`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm font-medium text-gray-300">
                                    {session.time}
                                  </span>
                                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                    session.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                                    session.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-red-500/20 text-red-300'
                                  }`}>
                                    {session.subject}
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                  {session.topic}
                                </h3>
                                <p className="text-gray-400 mt-1">{session.content}</p>
                                {session.targetGoal && (
                                  <p className="text-sm text-cyan-400 mt-3 flex items-center gap-2">
                                    <TrophyIcon className="w-4 h-4" />
                                    Mục tiêu: {session.targetGoal}
                                  </p>
                                )}
                              </div>
                              {!session.completed ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCompleteSession(todaySchedule.day, idx)}
                                  disabled={progressMutation.isLoading}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl
                                           shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all flex items-center gap-2"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                  Hoàn thành
                                </motion.button>
                              ) : (
                                <span className="flex items-center text-green-400 font-medium px-4 py-2 bg-green-500/20 rounded-xl">
                                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                                  Đã hoàn thành
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {todaySchedule.miniTest?.hasTest && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
                          <h3 className="font-semibold text-yellow-300 flex items-center gap-2">
                            <TrophyIcon className="w-5 h-5" />
                            Mini Test hôm nay
                          </h3>
                          <p className="text-yellow-200/70 mt-2">
                            {todaySchedule.miniTest.testType} - {todaySchedule.miniTest.questions} câu 
                            ({todaySchedule.miniTest.timeLimit})
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl text-center py-16">
                      <CalendarDaysIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Không có lịch học cho hôm nay</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Calendar View */}
              {activeTab === 'calendar' && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {studyPlan.dailyPlan?.map((day, idx) => {
                    const isExpanded = expandedDay === day.day;
                    const dayCompleted = progress?.completedDays?.includes(day.day);
                    const isCurrent = day.day === (progress?.currentDay || 1);

                    return (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`bg-gray-900/50 backdrop-blur-xl border rounded-2xl cursor-pointer transition-all ${
                          isCurrent ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 
                          dayCompleted ? 'border-green-500/30' : 'border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                      >
                        <div className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                              dayCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' :
                              isCurrent ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white' :
                              'bg-white/10 text-gray-400'
                            }`}>
                              {dayCompleted ? <CheckCircleIcon className="w-6 h-6" /> : day.day}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{day.theme}</h3>
                              <p className="text-sm text-gray-400">{day.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 px-3 py-1 bg-white/5 rounded-lg">
                              {day.sessions?.length || 0} sessions
                            </span>
                            {isExpanded ? (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-5 pb-5 border-t border-white/10 pt-4 space-y-3"
                            >
                              {day.sessions?.map((session, sIdx) => {
                                const sessionCompleted = progress?.completedSessions?.includes(`${day.day}-${sIdx}`);
                                return (
                                  <div 
                                    key={sIdx}
                                    className={`p-4 rounded-xl ${
                                      sessionCompleted ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400">{session.time}</span>
                                        <span className="text-gray-600">•</span>
                                        <span className="font-medium text-white">{session.subject}</span>
                                      </div>
                                      {sessionCompleted && (
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                      )}
                                    </div>
                                    <p className="text-gray-300 mt-2">{session.topic}</p>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Phases */}
              {activeTab === 'phases' && (
                <motion.div
                  key="phases"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {studyPlan.phases?.map((phase, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-start gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                          <span className="text-2xl font-bold text-white">
                            {phase.phaseNumber}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white">
                            {phase.phaseName}
                          </h3>
                          <p className="text-gray-400 mt-1">
                            Ngày {phase.startDay} - {phase.endDay}
                          </p>
                          {phase.focus && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {phase.focus.map((f, i) => (
                                <span key={i} className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                          {phase.expectedOutcome && (
                            <p className="mt-4 text-gray-300">
                              <span className="font-medium text-white">Kết quả mong đợi:</span> {phase.expectedOutcome}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Tips */}
              {activeTab === 'tips' && (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {studyPlan.tips?.general && (
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                        Mẹo học tập chung
                      </h3>
                      <ul className="space-y-3">
                        {studyPlan.tips.general.map((tip, i) => (
                          <li key={i} className="text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-400">💡</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {studyPlan.tips?.examDay && (
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <AcademicCapIcon className="w-5 h-5 text-red-400" />
                        Mẹo ngày thi
                      </h3>
                      <ul className="space-y-3">
                        {studyPlan.tips.examDay.map((tip, i) => (
                          <li key={i} className="text-gray-300 flex items-start gap-2">
                            <span className="text-red-400">🎯</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {studyPlan.tips?.stressManagement && (
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-purple-400" />
                        Quản lý stress
                      </h3>
                      <ul className="space-y-3">
                        {studyPlan.tips.stressManagement.map((tip, i) => (
                          <li key={i} className="text-gray-300 flex items-start gap-2">
                            <span className="text-purple-400">🧘</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {studyPlan.revisionStrategy && (
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <BookOpenIcon className="w-5 h-5 text-blue-400" />
                        Chiến lược ôn tập
                      </h3>
                      <div className="space-y-3">
                        <p className="text-gray-300">
                          <span className="font-medium text-white">Ôn tập ngắt quãng:</span><br/>
                          <span className="text-gray-400">{studyPlan.revisionStrategy.spaced}</span>
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium text-white">Tuần cuối:</span><br/>
                          <span className="text-gray-400">{studyPlan.revisionStrategy.lastWeek}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delete button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa lộ trình này?')) {
                    deleteMutation.mutate();
                  }
                }}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Xóa lộ trình
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDaysIcon className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Chưa có lộ trình ôn thi
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Tạo lộ trình học tập cá nhân hóa dựa trên điểm yếu của bạn, 
              với kế hoạch chi tiết từng ngày đến ngày thi
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerator(true)} 
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl
                       shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all inline-flex items-center gap-2"
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
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <RocketLaunchIcon className="w-6 h-6 text-cyan-400" />
                    Tạo lộ trình ôn thi TN THPT
                  </h2>
                  <button 
                    onClick={() => setShowGenerator(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Họ tên</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="Nhập tên của bạn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Lớp</label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="10">Lớp 10</option>
                        <option value="11">Lớp 11</option>
                        <option value="12">Lớp 12</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Các môn thi *</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            formData.subjects.includes(subject)
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ngày thi dự kiến *</label>
                      <input
                        type="date"
                        value={formData.examDate}
                        onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Số giờ học mỗi ngày</label>
                      <select
                        value={formData.studyHoursPerDay}
                        onChange={(e) => setFormData({...formData, studyHoursPerDay: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value={2}>2 giờ</option>
                        <option value={3}>3 giờ</option>
                        <option value={4}>4 giờ</option>
                        <option value={5}>5 giờ</option>
                        <option value={6}>6 giờ trở lên</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Khung giờ học</label>
                    <input
                      type="text"
                      value={formData.studyTimeSlots}
                      onChange={(e) => setFormData({...formData, studyTimeSlots: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="VD: 7:00-11:00, 14:00-17:00, 19:00-21:00"
                    />
                  </div>

                  {weaknessAnalysis && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-green-300 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        Đã có dữ liệu phân tích điểm yếu - sẽ được sử dụng để cá nhân hóa lộ trình
                      </p>
                    </div>
                  )}
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
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl
                             shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generateMutation.isLoading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Đang tạo lộ trình...
                      </>
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

export default StudyPlan;
