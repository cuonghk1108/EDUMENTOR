import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { careerAPI } from '../services/api';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  RocketLaunchIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Career = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [showHollandTest, setShowHollandTest] = useState(false);
  const [hollandAnswers, setHollandAnswers] = useState({});
  const [searchParams, setSearchParams] = useState({
    khoiThi: '',
    estimatedScore: '',
    location: ''
  });
  const [advisorForm, setAdvisorForm] = useState({
    name: user?.name || '',
    grade: '12',
    subjects: {
      'Toán': '',
      'Ngữ văn': '',
      'Tiếng Anh': '',
      'Vật lý': '',
      'Hóa học': '',
      'Sinh học': '',
      'Lịch sử': '',
      'Địa lý': '',
      'GDCD': ''
    },
    interests: [],
    strengths: [],
    careerGoals: ''
  });

  // Fetch data
  const { data: khoiThiData } = useQuery('khoi-thi', () => 
    careerAPI.getKhoiThi().then(res => res.data)
  );
  const { data: nganhNgheData } = useQuery('nganh-nghe', () => 
    careerAPI.getNganhNghe().then(res => res.data)
  );
  const { data: xuHuongData } = useQuery('xu-huong', () => 
    careerAPI.getXuHuong().then(res => res.data)
  );
  const { data: hollandData } = useQuery('holland-test', () => 
    careerAPI.getHollandTest().then(res => res.data)
  );

  // Mutations
  const findSchoolsMutation = useMutation(
    (params) => careerAPI.findSchools(params),
    {
      onError: (err) => toast.error(err.response?.data?.error || 'Lỗi tìm kiếm')
    }
  );

  const adviceMutation = useMutation(
    (data) => careerAPI.getAdvice(data),
    {
      onSuccess: () => {
        setShowAdvisor(false);
        toast.success('Đã tạo tư vấn hướng nghiệp!');
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Lỗi tư vấn')
    }
  );

  const hollandMutation = useMutation(
    (data) => careerAPI.analyzeHolland(data),
    {
      onSuccess: () => {
        setShowHollandTest(false);
        toast.success('Đã phân tích kết quả!');
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Lỗi phân tích')
    }
  );

  const handleFindSchools = () => {
    if (!searchParams.khoiThi || !searchParams.estimatedScore) {
      toast.error('Vui lòng chọn khối thi và nhập điểm dự kiến');
      return;
    }
    findSchoolsMutation.mutate(searchParams);
  };

  const handleSubmitAdvice = () => {
    const filledSubjects = Object.entries(advisorForm.subjects)
      .filter(([_, score]) => score !== '')
      .reduce((acc, [subj, score]) => ({ ...acc, [subj]: parseFloat(score) }), {});

    if (Object.keys(filledSubjects).length < 3) {
      toast.error('Vui lòng nhập điểm ít nhất 3 môn');
      return;
    }

    adviceMutation.mutate({
      ...advisorForm,
      subjects: filledSubjects
    });
  };

  const handleSubmitHolland = () => {
    if (Object.keys(hollandAnswers).length < 12) {
      toast.error('Vui lòng trả lời ít nhất 12 câu hỏi');
      return;
    }
    hollandMutation.mutate({ answers: hollandAnswers });
  };

  const interests = [
    'Công nghệ', 'Kinh doanh', 'Y tế', 'Giáo dục', 'Nghệ thuật',
    'Khoa học', 'Xã hội', 'Thể thao', 'Du lịch', 'Truyền thông'
  ];

  const strengths = [
    'Tư duy logic', 'Sáng tạo', 'Giao tiếp', 'Lãnh đạo', 'Kiên nhẫn',
    'Làm việc nhóm', 'Độc lập', 'Chi tiết', 'Ngoại ngữ', 'Thuyết trình'
  ];

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: ChartBarIcon },
    { id: 'search', label: 'Tìm trường', icon: MagnifyingGlassIcon },
    { id: 'careers', label: 'Ngành nghề', icon: BriefcaseIcon },
    { id: 'trends', label: 'Xu hướng', icon: ArrowTrendingUpIcon },
    { id: 'result', label: 'Kết quả tư vấn', icon: LightBulbIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <RocketLaunchIcon className="w-7 h-7 text-white" />
              </div>
              Hướng nghiệp
            </h1>
            <p className="text-gray-400 mt-2">Khám phá ngành nghề phù hợp và lập kế hoạch tương lai</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHollandTest(true)}
              className="px-5 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl
                       hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ClipboardDocumentListIcon className="w-5 h-5 text-purple-400" />
              Test tính cách
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdvisor(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl
                       shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Tư vấn AI
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-medium rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
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
          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Khối thi</p>
                      <p className="text-4xl font-bold text-white mt-1">{Object.keys(khoiThiData?.data || {}).length}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <AcademicCapIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl shadow-emerald-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Ngành nghề</p>
                      <p className="text-4xl font-bold text-white mt-1">{nganhNgheData?.count || 0}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <BriefcaseIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 shadow-xl shadow-purple-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Xu hướng hot</p>
                      <p className="text-4xl font-bold text-white mt-1">{xuHuongData?.data?.topDemand?.length || 0}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 shadow-xl shadow-orange-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Kỹ năng cần</p>
                      <p className="text-4xl font-bold text-white mt-1">{xuHuongData?.data?.emergingSkills?.length || 0}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <LightBulbIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Khối thi */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <AcademicCapIcon className="w-6 h-6 text-blue-400" />
                  Các khối thi đại học
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(khoiThiData?.data || {}).slice(0, 6).map(([code, data]) => (
                    <motion.div 
                      key={code} 
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg font-bold text-sm">
                          {code}
                        </span>
                        <span className="font-medium text-white">{data.name}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{data.subjects.join(', ')}</p>
                      <p className="text-xs text-gray-500">{data.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top Ngành hot */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-400" />
                  Ngành nghề hot nhất 2024-2025
                </h2>
                <div className="space-y-4">
                  {xuHuongData?.data?.topDemand?.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-medium text-white">{item.field}</h3>
                          <p className="text-sm text-gray-400">{item.reason}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-medium border border-emerald-500/30">
                        {item.growth}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Search Schools */}
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-6 h-6 text-cyan-400" />
                  Tìm trường phù hợp theo điểm
                </h2>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Khối thi</label>
                    <select
                      value={searchParams.khoiThi}
                      onChange={(e) => setSearchParams({...searchParams, khoiThi: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="">Chọn khối thi</option>
                      {Object.keys(khoiThiData?.data || {}).map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Điểm dự kiến</label>
                    <input
                      type="number"
                      value={searchParams.estimatedScore}
                      onChange={(e) => setSearchParams({...searchParams, estimatedScore: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="VD: 25.5"
                      min="0"
                      max="30"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Khu vực</label>
                    <select
                      value={searchParams.location}
                      onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="">Tất cả</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP.HCM">TP.HCM</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFindSchools}
                      disabled={findSchoolsMutation.isLoading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl
                               shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      {findSchoolsMutation.isLoading ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="w-5 h-5" />
                          Tìm kiếm
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Results */}
                {findSchoolsMutation.data && (
                  <div className="mt-6 space-y-4">
                    <p className="text-gray-300">
                      Tìm thấy <strong className="text-cyan-400">{findSchoolsMutation.data.data.count}</strong> trường phù hợp
                    </p>
                    {findSchoolsMutation.data.data.matches.map((match, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white text-lg">{match.school}</h3>
                            <p className="text-sm text-gray-400">
                              {match.type} • {match.location}
                            </p>
                          </div>
                          <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm font-medium">
                            {match.code}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {match.majors.map((major, mIdx) => (
                            <div key={mIdx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <span className="text-gray-300">{major.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">
                                  Điểm chuẩn: <strong className="text-white">{major.score}</strong>
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  major.chance === 'Cao' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                  major.chance === 'Trung bình' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                  'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                  {major.chance}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Careers */}
          {activeTab === 'careers' && (
            <motion.div
              key="careers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {nganhNgheData?.data?.map((career, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{career.name}</h3>
                      <span className="text-sm text-gray-400">{career.category}</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      career.demand === 'Cực cao' || career.demand === 'Rất cao' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : career.demand === 'Cao' 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      Nhu cầu: {career.demand}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400" />
                      <span className="text-gray-300">Tăng trưởng: <strong className="text-emerald-400">{career.growthRate}</strong></span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">Mức lương:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                          Fresher: {career.avgSalary?.fresher || career.avgSalary?.entry}
                        </span>
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                          Senior: {career.avgSalary?.senior}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">Vị trí công việc:</p>
                      <div className="flex flex-wrap gap-2">
                        {career.jobs?.slice(0, 3).map((job, jIdx) => (
                          <span key={jIdx} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 rounded-lg text-sm border border-emerald-500/20">
                            {job}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2">{career.outlook}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Trends */}
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Emerging Skills */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <LightBulbIcon className="w-6 h-6 text-yellow-400" />
                  Kỹ năng cần thiết 2024-2030
                </h2>
                <div className="flex flex-wrap gap-3">
                  {xuHuongData?.data?.emergingSkills?.map((skill, idx) => (
                    <motion.span 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-4 py-2 bg-yellow-500/10 text-yellow-300 rounded-xl font-medium border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Declining Fields */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <ChartBarIcon className="w-6 h-6 text-red-400" />
                  Ngành nghề đang thu hẹp
                </h2>
                <div className="space-y-3">
                  {xuHuongData?.data?.decliningFields?.map((item, idx) => (
                    <div key={idx} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="font-medium text-red-300">{item.field}</p>
                      <p className="text-sm text-red-400/70 mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-emerald-400" />
                  Lời khuyên cho bạn
                </h2>
                <ul className="space-y-3">
                  {xuHuongData?.data?.advice?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* AI Advice Result */}
          {activeTab === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {adviceMutation.data ? (
                <div className="space-y-6">
                  {/* Profile Analysis */}
                  <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Phân tích hồ sơ</h2>
                    <p className="text-gray-300 mb-6">
                      {adviceMutation.data.data.aiAdvice?.profileAnalysis?.overallAssessment}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <h3 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          Điểm mạnh
                        </h3>
                        <ul className="space-y-2">
                          {adviceMutation.data.data.aiAdvice?.profileAnalysis?.academicStrengths?.map((s, i) => (
                            <li key={i} className="text-gray-300 flex items-center gap-2">
                              <StarIcon className="w-4 h-4 text-green-400" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <h3 className="font-medium text-orange-400 mb-3 flex items-center gap-2">
                          <ChevronRightIcon className="w-5 h-5" />
                          Cần cải thiện
                        </h3>
                        <ul className="space-y-2">
                          {adviceMutation.data.data.aiAdvice?.profileAnalysis?.academicWeaknesses?.map((s, i) => (
                            <li key={i} className="text-gray-300 flex items-center gap-2">
                              <ChevronRightIcon className="w-4 h-4 text-orange-400" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Career Recommendations */}
                  <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Ngành nghề phù hợp</h2>
                    <div className="space-y-4">
                      {adviceMutation.data.data.aiAdvice?.careerRecommendations?.map((career, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-emerald-500/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
                                {career.rank}
                              </span>
                              <h3 className="font-semibold text-white text-lg">{career.career}</h3>
                            </div>
                            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-medium border border-emerald-500/30">
                              Phù hợp {career.matchScore}%
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-300">
                              <strong className="text-white">Lý do:</strong> {career.reasons?.join(', ')}
                            </p>
                            {career.careerPath && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                                Lương khởi điểm: {career.careerPath.salary?.entry}
                              </div>
                            )}
                            <p className="text-gray-400">{career.marketOutlook}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Motivational */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-xl shadow-emerald-500/20">
                    <p className="text-lg text-white italic">
                      "{adviceMutation.data.data.aiAdvice?.motivationalMessage}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LightBulbIcon className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Chưa có kết quả tư vấn
                  </h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Nhấn "Tư vấn AI" để nhận tư vấn hướng nghiệp cá nhân hóa dựa trên điểm số và sở thích của bạn
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAdvisor(true)} 
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl
                             shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all inline-flex items-center gap-2"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    Tư vấn ngay
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advisor Modal */}
        <AnimatePresence>
          {showAdvisor && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-emerald-400" />
                    Tư vấn hướng nghiệp AI
                  </h2>
                  <button 
                    onClick={() => setShowAdvisor(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Họ tên</label>
                      <input
                        type="text"
                        value={advisorForm.name}
                        onChange={(e) => setAdvisorForm({...advisorForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Lớp</label>
                      <select
                        value={advisorForm.grade}
                        onChange={(e) => setAdvisorForm({...advisorForm, grade: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="10">Lớp 10</option>
                        <option value="11">Lớp 11</option>
                        <option value="12">Lớp 12</option>
                      </select>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Điểm các môn học (nhập điểm trung bình)</label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {Object.keys(advisorForm.subjects).map(subj => (
                        <div key={subj}>
                          <label className="text-xs text-gray-500">{subj}</label>
                          <input
                            type="number"
                            value={advisorForm.subjects[subj]}
                            onChange={(e) => setAdvisorForm({
                              ...advisorForm,
                              subjects: {...advisorForm.subjects, [subj]: e.target.value}
                            })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                            placeholder="0-10"
                            min="0"
                            max="10"
                            step="0.1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sở thích</label>
                    <div className="flex flex-wrap gap-2">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => setAdvisorForm(prev => ({
                            ...prev,
                            interests: prev.interests.includes(interest)
                              ? prev.interests.filter(i => i !== interest)
                              : [...prev.interests, interest]
                          }))}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            advisorForm.interests.includes(interest)
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Điểm mạnh</label>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map(strength => (
                        <button
                          key={strength}
                          type="button"
                          onClick={() => setAdvisorForm(prev => ({
                            ...prev,
                            strengths: prev.strengths.includes(strength)
                              ? prev.strengths.filter(s => s !== strength)
                              : [...prev.strengths, strength]
                          }))}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            advisorForm.strengths.includes(strength)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {strength}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Career Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mục tiêu nghề nghiệp (nếu có)</label>
                    <textarea
                      value={advisorForm.careerGoals}
                      onChange={(e) => setAdvisorForm({...advisorForm, careerGoals: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      rows="2"
                      placeholder="VD: Muốn làm lập trình viên, muốn có thu nhập cao..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setShowAdvisor(false)} 
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Hủy
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitAdvice}
                    disabled={adviceMutation.isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl
                             shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {adviceMutation.isLoading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Nhận tư vấn
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Holland Test Modal */}
        <AnimatePresence>
          {showHollandTest && hollandData && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <ClipboardDocumentListIcon className="w-6 h-6 text-purple-400" />
                      Trắc nghiệm tính cách Holland
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">{hollandData.data.description}</p>
                  </div>
                  <button 
                    onClick={() => setShowHollandTest(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {hollandData.data.questions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-white/5 border border-white/10 rounded-xl">
                      <p className="font-medium text-white mb-4">
                        {idx + 1}. {q.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            onClick={() => setHollandAnswers({...hollandAnswers, [q.id]: score})}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all min-w-[100px] ${
                              hollandAnswers[q.id] === score
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {score === 1 ? 'Rất không đồng ý' : 
                             score === 2 ? 'Không đồng ý' :
                             score === 3 ? 'Bình thường' :
                             score === 4 ? 'Đồng ý' : 'Rất đồng ý'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowHollandTest(false)} 
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Hủy
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitHolland}
                    disabled={hollandMutation.isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl
                             shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {hollandMutation.isLoading ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      'Xem kết quả'
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

export default Career;
