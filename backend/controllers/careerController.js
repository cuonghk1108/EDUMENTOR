const aiService = require('../services/aiService');
const { KHOI_THI, DIEM_CHUAN_2025, NGANH_NGHE, XU_HUONG_LAO_DONG, HOLLAND_TEST } = require('../data/careerData');

/**
 * Lấy danh sách khối thi (GDPT 2018)
 */
exports.getKhoiThi = async (req, res) => {
  try {
    const { isNew, highlight } = req.query;
    
    let khoiThiList = Object.entries(KHOI_THI).map(([code, data]) => ({
      code,
      ...data
    }));

    // Filter only new blocks (GDPT 2018)
    if (isNew === 'true') {
      khoiThiList = khoiThiList.filter(k => k.isNew);
    }

    // Filter highlighted blocks
    if (highlight === 'true') {
      khoiThiList = khoiThiList.filter(k => k.highlight);
    }

    res.json({
      success: true,
      total: khoiThiList.length,
      newBlocks: khoiThiList.filter(k => k.isNew).length,
      data: KHOI_THI,
      list: khoiThiList
    });
  } catch (error) {
    console.error('Get khoi thi error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lấy điểm chuẩn các trường 2025
 */
exports.getDiemChuan = async (req, res) => {
  try {
    const { school, major, khoiThi, minScore, maxScore, trend, isNew } = req.query;
    
    let results = Object.entries(DIEM_CHUAN_2025).map(([name, data]) => ({
      name,
      ...data
    }));

    // Filter by school name
    if (school) {
      results = results.filter(s => 
        s.name.toLowerCase().includes(school.toLowerCase())
      );
    }

    // Filter by khoi thi
    if (khoiThi) {
      results = results.map(s => ({
        ...s,
        majors: s.majors.filter(m => m.code === khoiThi)
      })).filter(s => s.majors.length > 0);
    }

    // Filter by major name
    if (major) {
      results = results.map(s => ({
        ...s,
        majors: s.majors.filter(m => 
          m.name.toLowerCase().includes(major.toLowerCase())
        )
      })).filter(s => s.majors.length > 0);
    }

    // Filter by score range
    if (minScore || maxScore) {
      const min = parseFloat(minScore) || 0;
      const max = parseFloat(maxScore) || 30;
      results = results.map(s => ({
        ...s,
        majors: s.majors.filter(m => m.score >= min && m.score <= max)
      })).filter(s => s.majors.length > 0);
    }

    // Filter by trend (tăng, giảm, giữ, mới)
    if (trend) {
      results = results.map(s => ({
        ...s,
        majors: s.majors.filter(m => m.trend && m.trend.includes(trend))
      })).filter(s => s.majors.length > 0);
    }

    // Filter only new khoi thi (GDPT 2018)
    if (isNew === 'true') {
      const newKhoiCodes = Object.entries(KHOI_THI)
        .filter(([_, data]) => data.isNew)
        .map(([code]) => code);
      results = results.map(s => ({
        ...s,
        majors: s.majors.filter(m => newKhoiCodes.includes(m.code))
      })).filter(s => s.majors.length > 0);
    }

    res.json({
      success: true,
      year: 2025,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Get diem chuan error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lấy thông tin ngành nghề
 */
exports.getNganhNghe = async (req, res) => {
  try {
    const { category, demand } = req.query;
    
    let results = Object.entries(NGANH_NGHE).map(([name, data]) => ({
      name,
      ...data
    }));

    if (category) {
      results = results.filter(n => 
        n.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (demand) {
      results = results.filter(n => 
        n.demand.toLowerCase().includes(demand.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Get nganh nghe error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lấy xu hướng thị trường lao động
 */
exports.getXuHuong = async (req, res) => {
  try {
    res.json({
      success: true,
      data: XU_HUONG_LAO_DONG
    });
  } catch (error) {
    console.error('Get xu huong error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lấy bài test Holland
 */
exports.getHollandTest = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        description: HOLLAND_TEST.description,
        types: HOLLAND_TEST.types,
        questions: HOLLAND_TEST.questions
      }
    });
  } catch (error) {
    console.error('Get Holland test error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Phân tích kết quả test Holland
 */
exports.analyzeHollandResult = async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: score (1-5) }

    if (!answers || Object.keys(answers).length < 12) {
      return res.status(400).json({
        error: 'Vui lòng trả lời ít nhất 12 câu hỏi'
      });
    }

    // Tính điểm cho mỗi type
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    
    HOLLAND_TEST.questions.forEach(q => {
      if (answers[q.id]) {
        scores[q.type] += parseInt(answers[q.id]);
      }
    });

    // Sắp xếp và lấy top 3 types
    const sortedTypes = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => ({
        type,
        score,
        ...HOLLAND_TEST.types[type]
      }));

    // Tạo Holland code (3 chữ cái đầu)
    const hollandCode = sortedTypes.map(t => t.type).join('');

    res.json({
      success: true,
      result: {
        hollandCode,
        scores,
        topTypes: sortedTypes,
        recommendedCareers: sortedTypes.flatMap(t => t.careers).slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Analyze Holland error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Tư vấn hướng nghiệp bằng AI
 */
exports.getCareerAdvice = async (req, res) => {
  try {
    const {
      name,
      grade,
      subjects, // Điểm các môn { 'Toán': 8.5, 'Văn': 7.0, ... }
      interests, // Sở thích
      strengths, // Điểm mạnh
      weaknesses, // Điểm yếu
      hollandCode, // Kết quả test Holland
      preferredLocation,
      financialSituation,
      careerGoals
    } = req.body;

    if (!subjects || Object.keys(subjects).length === 0) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp điểm các môn học'
      });
    }

    // Chuẩn bị dữ liệu cho AI
    const studentProfile = {
      name: name || 'Học sinh',
      grade: grade || '12',
      subjects,
      interests: interests || [],
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      hollandCode: hollandCode || 'Chưa làm test',
      preferredLocation: preferredLocation || 'Không giới hạn',
      financialSituation: financialSituation || 'Bình thường',
      careerGoals: careerGoals || 'Chưa rõ'
    };

    // Tìm khối thi phù hợp dựa trên điểm
    const subjectScores = subjects;
    const recommendedKhoi = [];

    Object.entries(KHOI_THI).forEach(([code, data]) => {
      const totalScore = data.subjects.reduce((sum, subj) => {
        return sum + (subjectScores[subj] || 0);
      }, 0);
      if (totalScore > 0) {
        recommendedKhoi.push({
          code,
          name: data.name,
          subjects: data.subjects,
          totalScore,
          avgScore: (totalScore / data.subjects.length).toFixed(2)
        });
      }
    });

    recommendedKhoi.sort((a, b) => b.totalScore - a.totalScore);

    // Gọi AI để phân tích và tư vấn
    const result = await aiService.getCareerAdvice(studentProfile, {
      recommendedKhoi: recommendedKhoi.slice(0, 5),
      availableCareers: Object.keys(NGANH_NGHE),
      marketTrends: XU_HUONG_LAO_DONG.topDemand.slice(0, 5)
    });

    res.json({
      success: true,
      profile: studentProfile,
      recommendedKhoi: recommendedKhoi.slice(0, 5),
      aiAdvice: result.advice,
      usage: result.usage
    });
  } catch (error) {
    console.error('Get career advice error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Tìm trường phù hợp theo điểm
 */
exports.findMatchingSchools = async (req, res) => {
  try {
    const { khoiThi, estimatedScore, location, type } = req.query;

    if (!khoiThi || !estimatedScore) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp khối thi và điểm dự kiến'
      });
    }

    const score = parseFloat(estimatedScore);
    const matches = [];

    Object.entries(DIEM_CHUAN_2025).forEach(([schoolName, schoolData]) => {
      // Filter by location
      if (location && !schoolData.location.toLowerCase().includes(location.toLowerCase())) {
        return;
      }

      // Filter by type
      if (type && schoolData.type !== type) {
        return;
      }

      // Find matching majors
      const matchingMajors = schoolData.majors.filter(m => {
        return m.code === khoiThi && score >= m.score - 2; // Cho phép thấp hơn 2 điểm
      });

      if (matchingMajors.length > 0) {
        matches.push({
          school: schoolName,
          code: schoolData.code,
          type: schoolData.type,
          location: schoolData.location,
          majors: matchingMajors.map(m => ({
            ...m,
            chance: score >= m.score ? 'Cao' : 
                    score >= m.score - 1 ? 'Trung bình' : 'Thấp',
            gap: (score - m.score).toFixed(2)
          }))
        });
      }
    });

    // Sắp xếp theo cơ hội đỗ
    matches.sort((a, b) => {
      const aMaxGap = Math.max(...a.majors.map(m => parseFloat(m.gap)));
      const bMaxGap = Math.max(...b.majors.map(m => parseFloat(m.gap)));
      return bMaxGap - aMaxGap;
    });

    res.json({
      success: true,
      query: { khoiThi, estimatedScore: score, location, type },
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Find matching schools error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * So sánh ngành nghề
 */
exports.compareCarers = async (req, res) => {
  try {
    const { careers } = req.body; // Array of career names

    if (!careers || careers.length < 2) {
      return res.status(400).json({
        error: 'Vui lòng chọn ít nhất 2 ngành để so sánh'
      });
    }

    const comparison = careers.map(careerName => {
      const career = NGANH_NGHE[careerName];
      if (!career) {
        return { name: careerName, error: 'Không tìm thấy ngành này' };
      }
      return {
        name: careerName,
        ...career
      };
    }).filter(c => !c.error);

    if (comparison.length < 2) {
      return res.status(400).json({
        error: 'Không tìm thấy đủ ngành để so sánh'
      });
    }

    res.json({
      success: true,
      comparison
    });
  } catch (error) {
    console.error('Compare careers error:', error);
    res.status(500).json({ error: error.message });
  }
};
