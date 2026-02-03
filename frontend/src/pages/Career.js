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
  ClipboardDocumentListIcon
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

  // Find schools mutation
  const findSchoolsMutation = useMutation(
    (params) => careerAPI.findSchools(params),
    {
      onError: (err) => toast.error(err.response?.data?.error || 'Lỗi tìm kiếm')
    }
  );

  // Get advice mutation
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

  // Holland test mutation
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Hướng nghiệp
          </h1>
          <p className="text-gray-600 mt-1">
            Khám phá ngành nghề phù hợp và lập kế hoạch tương lai
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHollandTest(true)}
            className="btn-secondary"
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
            Test tính cách
          </button>
          <button
            onClick={() => setShowAdvisor(true)}
            className="btn-primary"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Tư vấn AI
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Tổng quan', icon: ChartBarIcon },
          { id: 'search', label: 'Tìm trường', icon: MagnifyingGlassIcon },
          { id: 'careers', label: 'Ngành nghề', icon: BriefcaseIcon },
          { id: 'trends', label: 'Xu hướng', icon: ArrowTrendingUpIcon },
          { id: 'result', label: 'Kết quả tư vấn', icon: LightBulbIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
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
              <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Khối thi</p>
                    <p className="text-3xl font-bold">{Object.keys(khoiThiData?.data || {}).length}</p>
                  </div>
                  <AcademicCapIcon className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Ngành nghề</p>
                    <p className="text-3xl font-bold">{nganhNgheData?.count || 0}</p>
                  </div>
                  <BriefcaseIcon className="w-10 h-10 text-green-200" />
                </div>
              </div>
              <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Xu hướng hot</p>
                    <p className="text-3xl font-bold">{xuHuongData?.data?.topDemand?.length || 0}</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-10 h-10 text-purple-200" />
                </div>
              </div>
              <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Kỹ năng cần</p>
                    <p className="text-3xl font-bold">{xuHuongData?.data?.emergingSkills?.length || 0}</p>
                  </div>
                  <LightBulbIcon className="w-10 h-10 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Khối thi */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-6 h-6 text-primary-600" />
                Các khối thi đại học
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(khoiThiData?.data || {}).slice(0, 6).map(([code, data]) => (
                  <div key={code} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded font-medium text-sm">
                        {code}
                      </span>
                      <span className="font-medium text-gray-900">{data.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{data.subjects.join(', ')}</p>
                    <p className="text-xs text-gray-500">{data.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Ngành hot */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                Ngành nghề hot nhất 2024-2025
              </h2>
              <div className="space-y-3">
                {xuHuongData?.data?.topDemand?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.field}</h3>
                        <p className="text-sm text-gray-500">{item.reason}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      {item.growth}
                    </span>
                  </div>
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
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tìm trường phù hợp theo điểm
              </h2>
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="label">Khối thi</label>
                  <select
                    value={searchParams.khoiThi}
                    onChange={(e) => setSearchParams({...searchParams, khoiThi: e.target.value})}
                    className="input"
                  >
                    <option value="">Chọn khối thi</option>
                    {Object.keys(khoiThiData?.data || {}).map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Điểm dự kiến</label>
                  <input
                    type="number"
                    value={searchParams.estimatedScore}
                    onChange={(e) => setSearchParams({...searchParams, estimatedScore: e.target.value})}
                    className="input"
                    placeholder="VD: 25.5"
                    min="0"
                    max="30"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Khu vực</label>
                  <select
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                    className="input"
                  >
                    <option value="">Tất cả</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP.HCM">TP.HCM</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleFindSchools}
                    disabled={findSchoolsMutation.isLoading}
                    className="btn-primary w-full"
                  >
                    {findSchoolsMutation.isLoading ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                        Tìm kiếm
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results */}
              {findSchoolsMutation.data && (
                <div className="mt-6 space-y-4">
                  <p className="text-gray-600">
                    Tìm thấy <strong>{findSchoolsMutation.data.data.count}</strong> trường phù hợp
                  </p>
                  {findSchoolsMutation.data.data.matches.map((match, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{match.school}</h3>
                          <p className="text-sm text-gray-500">
                            {match.type} • {match.location}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm font-medium">
                          {match.code}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {match.majors.map((major, mIdx) => (
                          <div key={mIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{major.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                Điểm chuẩn: <strong>{major.score}</strong>
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                major.chance === 'Cao' ? 'bg-green-100 text-green-700' :
                                major.chance === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {major.chance}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{career.name}</h3>
                    <span className="text-sm text-gray-500">{career.category}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    career.demand === 'Cực cao' || career.demand === 'Rất cao' 
                      ? 'bg-green-100 text-green-700' 
                      : career.demand === 'Cao' 
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    Nhu cầu: {career.demand}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                    <span>Tăng trưởng: <strong className="text-green-600">{career.growthRate}</strong></span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Mức lương:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        Fresher: {career.avgSalary?.fresher || career.avgSalary?.entry}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        Senior: {career.avgSalary?.senior}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Vị trí công việc:</p>
                    <div className="flex flex-wrap gap-1">
                      {career.jobs?.slice(0, 3).map((job, jIdx) => (
                        <span key={jIdx} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs">
                          {job}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{career.outlook}</p>
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
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                Kỹ năng cần thiết 2024-2030
              </h2>
              <div className="flex flex-wrap gap-2">
                {xuHuongData?.data?.emergingSkills?.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Declining Fields */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-red-500" />
                Ngành nghề đang thu hẹp
              </h2>
              <div className="space-y-3">
                {xuHuongData?.data?.decliningFields?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-800">{item.field}</p>
                    <p className="text-sm text-red-600">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice */}
            <div className="card bg-gradient-to-br from-primary-50 to-secondary-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-primary-600" />
                Lời khuyên cho bạn
              </h2>
              <ul className="space-y-2">
                {xuHuongData?.data?.advice?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân tích hồ sơ</h2>
                  <p className="text-gray-600 mb-4">
                    {adviceMutation.data.data.aiAdvice?.profileAnalysis?.overallAssessment}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">Điểm mạnh</h3>
                      <ul className="space-y-1">
                        {adviceMutation.data.data.aiAdvice?.profileAnalysis?.academicStrengths?.map((s, i) => (
                          <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="font-medium text-orange-800 mb-2">Cần cải thiện</h3>
                      <ul className="space-y-1">
                        {adviceMutation.data.data.aiAdvice?.profileAnalysis?.academicWeaknesses?.map((s, i) => (
                          <li key={i} className="text-sm text-orange-700 flex items-center gap-2">
                            <ChevronRightIcon className="w-4 h-4" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Career Recommendations */}
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Ngành nghề phù hợp</h2>
                  <div className="space-y-4">
                    {adviceMutation.data.data.aiAdvice?.careerRecommendations?.map((career, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                              {career.rank}
                            </span>
                            <h3 className="font-semibold text-gray-900">{career.career}</h3>
                          </div>
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                            Phù hợp {career.matchScore}%
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            <strong>Lý do:</strong> {career.reasons?.join(', ')}
                          </p>
                          {career.careerPath && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              Lương khởi điểm: {career.careerPath.salary?.entry}
                            </div>
                          )}
                          <p className="text-gray-500">{career.marketOutlook}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivational */}
                <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                  <p className="text-lg italic">
                    "{adviceMutation.data.data.aiAdvice?.motivationalMessage}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="card text-center py-16">
                <LightBulbIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có kết quả tư vấn
                </h3>
                <p className="text-gray-500 mb-6">
                  Nhấn "Tư vấn AI" để nhận tư vấn hướng nghiệp cá nhân hóa
                </p>
                <button onClick={() => setShowAdvisor(true)} className="btn-primary">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Tư vấn ngay
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advisor Modal */}
      {showAdvisor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Tư vấn hướng nghiệp AI
              </h2>
              <button onClick={() => setShowAdvisor(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Họ tên</label>
                  <input
                    type="text"
                    value={advisorForm.name}
                    onChange={(e) => setAdvisorForm({...advisorForm, name: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Lớp</label>
                  <select
                    value={advisorForm.grade}
                    onChange={(e) => setAdvisorForm({...advisorForm, grade: e.target.value})}
                    className="input"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className="label">Điểm các môn học (nhập điểm trung bình)</label>
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
                        className="input"
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
                <label className="label">Sở thích</label>
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
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        advisorForm.interests.includes(interest)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div>
                <label className="label">Điểm mạnh</label>
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
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        advisorForm.strengths.includes(strength)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {strength}
                    </button>
                  ))}
                </div>
              </div>

              {/* Career Goals */}
              <div>
                <label className="label">Mục tiêu nghề nghiệp (nếu có)</label>
                <textarea
                  value={advisorForm.careerGoals}
                  onChange={(e) => setAdvisorForm({...advisorForm, careerGoals: e.target.value})}
                  className="input"
                  rows="2"
                  placeholder="VD: Muốn làm lập trình viên, muốn có thu nhập cao..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdvisor(false)} className="btn-ghost flex-1">
                Hủy
              </button>
              <button
                onClick={handleSubmitAdvice}
                disabled={adviceMutation.isLoading}
                className="btn-primary flex-1"
              >
                {adviceMutation.isLoading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Nhận tư vấn
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Holland Test Modal */}
      {showHollandTest && hollandData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Trắc nghiệm tính cách Holland
                </h2>
                <p className="text-sm text-gray-500">{hollandData.data.description}</p>
              </div>
              <button onClick={() => setShowHollandTest(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {hollandData.data.questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-3">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => setHollandAnswers({...hollandAnswers, [q.id]: score})}
                        className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                          hollandAnswers[q.id] === score
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
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
              <button onClick={() => setShowHollandTest(false)} className="btn-ghost flex-1">
                Hủy
              </button>
              <button
                onClick={handleSubmitHolland}
                disabled={hollandMutation.isLoading}
                className="btn-primary flex-1"
              >
                {hollandMutation.isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  'Xem kết quả'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Career;
