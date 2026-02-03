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
  PlayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  XMarkIcon
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

  // Fetch roadmap (includes study plan)
  const { data: roadmapData, isLoading } = useQuery(
    ['roadmap', user?.id],
    () => roadmapAPI.get(user.id).then(res => res.data),
    { enabled: !!user?.id }
  );

  // Fetch today's schedule
  const { data: todayData } = useQuery(
    ['today-schedule'],
    () => studyPlanAPI.getTodaySchedule().then(res => res.data),
    { enabled: !!user?.id }
  );

  // Analyze weakness mutation
  const analyzeMutation = useMutation(
    (data) => studyPlanAPI.analyzeWeakness(data),
    {
      onSuccess: (res) => {
        toast.success('Phân tích điểm yếu thành công!');
        queryClient.invalidateQueries(['roadmap']);
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Lỗi phân tích');
      }
    }
  );

  // Generate study plan mutation
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

  // Update progress mutation
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

  // Delete plan mutation
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
  const studyPlan = roadmap?.studyPlan;
  const progress = roadmap?.progress;
  const weaknessAnalysis = roadmap?.weaknessAnalysis;
  const todaySchedule = todayData?.schedule;

  // Calculate overall progress
  const totalDays = studyPlan?.dailyPlan?.length || 0;
  const completedDays = progress?.completedDays?.length || 0;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Lộ trình ôn thi TN THPT
          </h1>
          <p className="text-gray-600 mt-1">
            Kế hoạch học tập chi tiết theo ngày, cá nhân hóa theo điểm yếu
          </p>
        </div>
        <div className="flex gap-3">
          {!studyPlan && (
            <button
              onClick={() => analyzeMutation.mutate({})}
              disabled={analyzeMutation.isLoading}
              className="btn-secondary"
            >
              {analyzeMutation.isLoading ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Phân tích điểm yếu
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setShowGenerator(true)}
            className="btn-primary"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            {studyPlan ? 'Tạo lại lộ trình' : 'Tạo lộ trình'}
          </button>
        </div>
      </div>

      {/* Weakness Analysis Summary */}
      {weaknessAnalysis && !studyPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-l-4 border-l-orange-500"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
            Kết quả phân tích điểm yếu
          </h2>
          
          <p className="text-gray-600 mb-4">
            {weaknessAnalysis.overallAssessment?.summary}
          </p>

          {weaknessAnalysis.improvementPriority?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">Ưu tiên cải thiện:</h3>
              {weaknessAnalysis.improvementPriority.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.rank || idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.topic}</p>
                    <p className="text-sm text-gray-600">{item.reason}</p>
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
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tiến độ</p>
                  <p className="text-3xl font-bold text-primary-600">{progressPercent}%</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-600 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ngày hiện tại</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {progress?.currentDay || 1}/{totalDays}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sessions hoàn thành</p>
                  <p className="text-3xl font-bold text-green-600">
                    {progress?.completedSessions?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ngày thi</p>
                  <p className="text-xl font-bold text-gray-900">
                    {studyPlan.planInfo?.examDate || 'Chưa xác định'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { id: 'today', label: 'Hôm nay', icon: FireIcon },
              { id: 'calendar', label: 'Lịch chi tiết', icon: CalendarDaysIcon },
              { id: 'phases', label: 'Giai đoạn', icon: ChartBarIcon },
              { id: 'tips', label: 'Mẹo & Chiến lược', icon: LightBulbIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
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
                    <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-primary-100">Ngày {todaySchedule.day}</p>
                          <h2 className="text-2xl font-bold">{todaySchedule.theme}</h2>
                          <p className="text-primary-100 mt-1">{todaySchedule.dailyGoal}</p>
                        </div>
                        {todaySchedule.motivationalQuote && (
                          <div className="text-right max-w-xs">
                            <p className="text-sm italic text-primary-100">
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
                          className={`card border-l-4 ${
                            session.completed 
                              ? 'border-l-green-500 bg-green-50' 
                              : 'border-l-primary-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                                  {session.time}
                                </span>
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  session.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  session.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {session.subject}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {session.topic}
                              </h3>
                              <p className="text-gray-600 mt-1">{session.content}</p>
                              {session.targetGoal && (
                                <p className="text-sm text-primary-600 mt-2">
                                  🎯 Mục tiêu: {session.targetGoal}
                                </p>
                              )}
                            </div>
                            {!session.completed ? (
                              <button
                                onClick={() => handleCompleteSession(todaySchedule.day, idx)}
                                disabled={progressMutation.isLoading}
                                className="btn-primary ml-4"
                              >
                                <CheckCircleIcon className="w-5 h-5 mr-1" />
                                Hoàn thành
                              </button>
                            ) : (
                              <span className="flex items-center text-green-600 font-medium">
                                <CheckCircleIcon className="w-5 h-5 mr-1" />
                                Đã hoàn thành
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {todaySchedule.miniTest?.hasTest && (
                      <div className="card bg-yellow-50 border border-yellow-200">
                        <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                          <TrophyIcon className="w-5 h-5" />
                          Mini Test hôm nay
                        </h3>
                        <p className="text-yellow-700 mt-1">
                          {todaySchedule.miniTest.testType} - {todaySchedule.miniTest.questions} câu 
                          ({todaySchedule.miniTest.timeLimit})
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="card text-center py-12">
                    <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có lịch học cho hôm nay</p>
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
                      className={`card cursor-pointer ${
                        isCurrent ? 'ring-2 ring-primary-500' : ''
                      } ${dayCompleted ? 'bg-green-50' : ''}`}
                      onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            dayCompleted ? 'bg-green-500 text-white' :
                            isCurrent ? 'bg-primary-500 text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {dayCompleted ? <CheckCircleIcon className="w-5 h-5" /> : day.day}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{day.theme}</h3>
                            <p className="text-sm text-gray-500">{day.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
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
                            className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                          >
                            {day.sessions?.map((session, sIdx) => {
                              const sessionCompleted = progress?.completedSessions?.includes(`${day.day}-${sIdx}`);
                              return (
                                <div 
                                  key={sIdx}
                                  className={`p-3 rounded-lg ${
                                    sessionCompleted ? 'bg-green-100' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-sm text-gray-500">{session.time}</span>
                                      <span className="mx-2">•</span>
                                      <span className="font-medium">{session.subject}</span>
                                    </div>
                                    {sessionCompleted && (
                                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    )}
                                  </div>
                                  <p className="text-gray-700 mt-1">{session.topic}</p>
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
                    className="card"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-primary-600">
                          {phase.phaseNumber}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {phase.phaseName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ngày {phase.startDay} - {phase.endDay}
                        </p>
                        {phase.focus && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {phase.focus.map((f, i) => (
                              <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                        {phase.expectedOutcome && (
                          <p className="mt-3 text-gray-600">
                            <span className="font-medium">Kết quả mong đợi:</span> {phase.expectedOutcome}
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
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                      Mẹo học tập chung
                    </h3>
                    <ul className="space-y-2">
                      {studyPlan.tips.general.map((tip, i) => (
                        <li key={i} className="text-gray-600 flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {studyPlan.tips?.examDay && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AcademicCapIcon className="w-5 h-5 text-red-500" />
                      Mẹo ngày thi
                    </h3>
                    <ul className="space-y-2">
                      {studyPlan.tips.examDay.map((tip, i) => (
                        <li key={i} className="text-gray-600 flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {studyPlan.tips?.stressManagement && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-purple-500" />
                      Quản lý stress
                    </h3>
                    <ul className="space-y-2">
                      {studyPlan.tips.stressManagement.map((tip, i) => (
                        <li key={i} className="text-gray-600 flex items-start gap-2">
                          <span className="text-purple-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {studyPlan.revisionStrategy && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpenIcon className="w-5 h-5 text-blue-500" />
                      Chiến lược ôn tập
                    </h3>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Ôn tập ngắt quãng:</span> {studyPlan.revisionStrategy.spaced}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Tuần cuối:</span> {studyPlan.revisionStrategy.lastWeek}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa lộ trình này?')) {
                  deleteMutation.mutate();
                }
              }}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Xóa lộ trình
            </button>
          </div>
        </>
      ) : (
        /* No Study Plan - Show Generator CTA */
        <div className="card text-center py-16">
          <CalendarDaysIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có lộ trình ôn thi
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Tạo lộ trình học tập cá nhân hóa dựa trên điểm yếu của bạn, 
            với kế hoạch chi tiết từng ngày đến ngày thi
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
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Tạo lộ trình ôn thi TN THPT
              </h2>
              <button onClick={() => setShowGenerator(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Họ tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    placeholder="Nhập tên của bạn"
                  />
                </div>
                <div>
                  <label className="label">Lớp</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="input"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Các môn thi *</label>
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Ngày thi dự kiến *</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="label">Số giờ học mỗi ngày</label>
                  <select
                    value={formData.studyHoursPerDay}
                    onChange={(e) => setFormData({...formData, studyHoursPerDay: parseInt(e.target.value)})}
                    className="input"
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
                <label className="label">Khung giờ học</label>
                <input
                  type="text"
                  value={formData.studyTimeSlots}
                  onChange={(e) => setFormData({...formData, studyTimeSlots: e.target.value})}
                  className="input"
                  placeholder="VD: 7:00-11:00, 14:00-17:00, 19:00-21:00"
                />
              </div>

              {weaknessAnalysis && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    Đã có dữ liệu phân tích điểm yếu - sẽ được sử dụng để cá nhân hóa lộ trình
                  </p>
                </div>
              )}
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
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                    Đang tạo lộ trình...
                  </>
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

export default StudyPlan;
