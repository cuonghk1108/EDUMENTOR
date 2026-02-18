const OpenAI = require('openai');

// Initialize xAI (Grok) client - API tương thích với OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

const MODEL = process.env.XAI_MODEL || 'grok-3';
const TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';
const TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'nova';

// ============================================
// PROMPT TEMPLATES
// ============================================

const PROMPTS = {
  lesson: `Bạn là gia sư THPT Việt Nam giàu kinh nghiệm và tâm huyết.
Hãy chuyển nội dung sau thành bài giảng cho học sinh trung bình khá:

YÊU CẦU:
- Sử dụng ngôn ngữ đơn giản, dễ hiểu
- Giải thích các khái niệm khó
- Đưa ra ví dụ thực tế gần gũi với học sinh
- Chia nhỏ nội dung thành các phần rõ ràng
- Có phần tóm tắt cuối bài
- Sử dụng emoji để sinh động hơn

ĐỊNH DẠNG OUTPUT:
# [Tiêu đề bài học]

## 📚 Giới thiệu
[Giới thiệu ngắn về bài học]

## 📖 Nội dung chính
[Nội dung được chia thành các phần nhỏ với heading]

## 💡 Ví dụ minh họa
[Các ví dụ cụ thể]

## 📝 Tóm tắt
[Những điểm quan trọng cần nhớ]

## 🎯 Ghi nhớ
[3-5 bullet points quan trọng nhất]

---

NỘI DUNG CẦN CHUYỂN ĐỔI:

{text}`,

  // ============================================
  // BÀI GIẢNG ĐỊNH DẠNG LaTeX
  // ============================================
  lessonLatex: `Bạn là giáo viên THPT Việt Nam + chuyên gia LaTeX.

Từ nội dung tôi cung cấp, hãy:

1. Chuyển toàn bộ bài giảng sang định dạng LaTeX.
2. Mọi công thức toán phải viết bằng LaTeX chuẩn.
3. Không viết công thức dạng text thường.
4. Phân chia rõ:
   - Tiêu đề
   - Lý thuyết
   - Ví dụ
   - Bài tập
   - Đáp án (nếu có)

========================

QUY ƯỚC BẮT BUỘC:

- Công thức inline: $...$
- Công thức riêng dòng: $$...$$
- Dùng \\frac{}{}, \\sqrt{}, \\sum, \\int, \\lim đầy đủ
- Vector: \\vec{}
- Hệ phương trình:

\\[
\\begin{cases}
...
\\end{cases}
\\]

- Ma trận:

\\[
\\begin{bmatrix}
...
\\end{bmatrix}
\\]

- Không dùng ký hiệu Unicode toán học (≤ ≥ ≠ → v.v.)

========================

CẤU TRÚC OUTPUT:

\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[vietnamese]{babel}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{geometry}
\\geometry{margin=2cm}

\\begin{document}

\\section*{Tên bài}

\\subsection*{Lý thuyết}
...

\\subsection*{Ví dụ}
...

\\subsection*{Bài tập}
...

\\end{document}

========================

YÊU CẦU:

- Viết bằng tiếng Việt.
- Diễn giải phù hợp học sinh THPT.
- Công thức phải biên dịch được.
- Không thiếu dấu ngoặc.
- Không sinh lỗi LaTeX.

========================

NỘI DUNG CẦN XỬ LÝ:

{text}

BẮT ĐẦU XUẤT LaTeX NGAY.`,

  // ============================================
  // BÀI GIẢNG ĐỊNH DẠNG JSON CẤU TRÚC
  // ============================================
  lessonStructured: `Bạn là giáo viên THPT Việt Nam + chuyên gia LaTeX.

Từ nội dung tôi cung cấp, hãy tạo bài giảng dạng JSON có cấu trúc.

========================

QUY ƯỚC CÔNG THỨC:
- Tất cả công thức toán phải viết bằng LaTeX
- Công thức inline: $...$
- Công thức block: $$...$$
- Dùng \\frac{}{}, \\sqrt{}, \\sum, \\int, \\lim đầy đủ
- Vector: \\vec{}
- Không dùng ký hiệu Unicode (≤ → \\leq, ≥ → \\geq, ≠ → \\neq)

========================

OUTPUT FORMAT (JSON):
{
  "title": "[Tiêu đề bài học]",
  "subject": "[Môn học: Toán/Lý/Hóa/...]",
  "grade": "[Lớp: 10/11/12]",
  "chapter": "[Chương]",
  "theory": "[Phần lý thuyết - giải thích dễ hiểu cho học sinh THPT, công thức dùng LaTeX]",
  "keyPoints": [
    "[Điểm quan trọng 1]",
    "[Điểm quan trọng 2]"
  ],
  "formulas": [
    {
      "name": "[Tên công thức]",
      "formula": "[Công thức LaTeX, ví dụ: $x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}$]",
      "description": "[Giải thích ý nghĩa]",
      "conditions": "[Điều kiện áp dụng]"
    }
  ],
  "examples": [
    {
      "id": 1,
      "problem": "[Đề bài - dùng LaTeX cho công thức]",
      "solution": "[Lời giải chi tiết từng bước - dùng LaTeX]",
      "answer": "[Đáp số]",
      "difficulty": "[easy/medium/hard]",
      "tips": "[Mẹo giải nhanh nếu có]"
    }
  ],
  "exercises": [
    {
      "id": 1,
      "problem": "[Đề bài tập - dùng LaTeX]",
      "hints": ["[Gợi ý 1]", "[Gợi ý 2]"],
      "answer": "[Đáp số]",
      "difficulty": "[easy/medium/hard]"
    }
  ],
  "summary": "[Tóm tắt ngắn gọn nội dung bài học]",
  "commonMistakes": [
    "[Lỗi thường gặp 1]",
    "[Lỗi thường gặp 2]"
  ],
  "relatedTopics": ["[Chủ đề liên quan 1]", "[Chủ đề liên quan 2]"]
}

========================

YÊU CẦU:
- Viết bằng tiếng Việt
- Giải thích phù hợp học sinh THPT
- Công thức LaTeX phải escape đúng trong JSON (dùng \\\\ thay vì \\)
- Ít nhất 2 công thức, 2 ví dụ, 3 bài tập
- CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC

========================

NỘI DUNG CẦN XỬ LÝ:

{text}`,

  quiz: `Bạn là giáo viên THPT Việt Nam có kinh nghiệm ra đề thi.
Từ nội dung sau, hãy tạo {count} câu hỏi trắc nghiệm chất lượng cao.

YÊU CẦU:
- Mỗi câu có 4 đáp án A, B, C, D
- Câu hỏi đa dạng về độ khó (dễ, trung bình, khó)
- Đáp án nhiễu phải hợp lý, không quá dễ loại trừ
- Bao gồm cả câu hỏi kiến thức và câu hỏi vận dụng
- Mỗi câu có giải thích ngắn gọn cho đáp án đúng

ĐỊNH DẠNG OUTPUT (JSON):
{
  "topic": "[Tên chủ đề]",
  "questions": [
    {
      "id": 1,
      "question": "[Nội dung câu hỏi]",
      "A": "[Đáp án A]",
      "B": "[Đáp án B]",
      "C": "[Đáp án C]",
      "D": "[Đáp án D]",
      "answer": "[A/B/C/D]",
      "explanation": "[Giải thích]",
      "difficulty": "[easy/medium/hard]"
    }
  ]
}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.

---

NỘI DUNG:

{text}`,

  chat: `Bạn là gia sư AI thông minh, thân thiện và kiên nhẫn cho học sinh THPT Việt Nam.

NGUYÊN TẮC:
1. Trả lời dựa trên nội dung bài học đã cung cấp
2. Nếu câu hỏi ngoài phạm vi nội dung, vẫn cố gắng hỗ trợ với kiến thức chung
3. Sử dụng ngôn ngữ đơn giản, dễ hiểu
4. Khuyến khích học sinh suy nghĩ
5. Đưa ra ví dụ khi cần thiết
6. Thân thiện nhưng vẫn chuyên nghiệp

NỘI DUNG BÀI HỌC:
{context}

---

LỊCH SỬ HỘI THOẠI:
{history}

---

CÂU HỎI CỦA HỌC SINH: {question}

Hãy trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin.`,

  analyzeWeakness: `Bạn là chuyên gia phân tích học tập.
Dựa trên dữ liệu học tập sau, hãy phân tích điểm mạnh, điểm yếu và đề xuất cải thiện.

DỮ LIỆU HỌC TẬP:
{data}

YÊU CẦU OUTPUT (JSON):
{
  "analysis": {
    "overall": "[Đánh giá tổng quan]",
    "strengths": ["[Điểm mạnh 1]", "[Điểm mạnh 2]"],
    "weaknesses": ["[Điểm yếu 1]", "[Điểm yếu 2]"],
    "knowledgeGaps": ["[Lỗ hổng kiến thức 1]", "[Lỗ hổng 2]"]
  },
  "recommendations": [
    {
      "priority": 1,
      "topic": "[Chủ đề cần học]",
      "reason": "[Lý do]",
      "suggestedActions": ["[Hành động 1]", "[Hành động 2]"]
    }
  ],
  "motivationalMessage": "[Lời động viên cho học sinh]"
}

CHỈ TRẢ VỀ JSON.`,

  roadmap: `Bạn là cố vấn học tập chuyên nghiệp cho học sinh THPT Việt Nam.
Dựa trên thông tin sau, hãy tạo lộ trình học tập cá nhân hóa.

THÔNG TIN HỌC SINH:
- Khối/Lớp: {grade}
- Môn học quan tâm: {subjects}
- Mục tiêu: {goals}
- Điểm yếu cần cải thiện: {weaknesses}
- Điểm mạnh: {strengths}
- Thời gian học/ngày: {studyTime}

YÊU CẦU OUTPUT (JSON):
{
  "roadmap": {
    "title": "[Tiêu đề lộ trình]",
    "duration": "[Thời gian dự kiến]",
    "phases": [
      {
        "phase": 1,
        "name": "[Tên giai đoạn]",
        "duration": "[Thời gian]",
        "goals": ["[Mục tiêu 1]", "[Mục tiêu 2]"],
        "topics": [
          {
            "name": "[Tên chủ đề]",
            "priority": "[high/medium/low]",
            "estimatedHours": 5,
            "resources": ["[Tài liệu 1]"]
          }
        ],
        "milestones": ["[Cột mốc 1]"]
      }
    ],
    "weeklySchedule": {
      "monday": ["[Hoạt động]"],
      "tuesday": ["[Hoạt động]"],
      "wednesday": ["[Hoạt động]"],
      "thursday": ["[Hoạt động]"],
      "friday": ["[Hoạt động]"],
      "saturday": ["[Hoạt động]"],
      "sunday": ["[Nghỉ ngơi/Ôn tập]"]
    }
  },
  "tips": ["[Mẹo học tập 1]", "[Mẹo 2]"]
}

CHỈ TRẢ VỀ JSON.`,

  // ============================================
  // PHÂN TÍCH ĐIỂM YẾU TỪ KẾT QUẢ THI THỬ
  // ============================================
  analyzeExamResults: `Bạn là chuyên gia phân tích kết quả thi TN THPT với nhiều năm kinh nghiệm.

NHIỆM VỤ: Phân tích chi tiết kết quả bài thi thử để xác định điểm yếu cần cải thiện.

KẾT QUẢ THI THỬ:
{examResults}

CHI TIẾT CÁC CÂU SAI:
{wrongAnswers}

YÊU CẦU PHÂN TÍCH:
1. Xác định các dạng bài/chủ đề học sinh làm sai nhiều nhất
2. Phân loại mức độ nghiêm trọng của từng điểm yếu
3. Tìm ra nguyên nhân có thể (thiếu kiến thức, sai sót cẩu thả, chưa hiểu sâu...)
4. Đề xuất thứ tự ưu tiên cải thiện

OUTPUT FORMAT (JSON):
{
  "overallAssessment": {
    "score": "[Điểm số]",
    "grade": "[Xếp loại: Giỏi/Khá/TB/Yếu]",
    "summary": "[Nhận xét tổng quan về kết quả]"
  },
  "weaknessAnalysis": [
    {
      "topic": "[Chủ đề/Dạng bài]",
      "subject": "[Môn học]",
      "severity": "[critical/high/medium/low]",
      "wrongCount": 3,
      "totalInTopic": 5,
      "accuracyRate": "40%",
      "specificErrors": [
        {
          "concept": "[Khái niệm sai]",
          "commonMistake": "[Lỗi phổ biến]",
          "correctApproach": "[Cách tiếp cận đúng]"
        }
      ],
      "rootCause": "[Nguyên nhân gốc rễ]",
      "priorityLevel": 1
    }
  ],
  "strengthAreas": [
    {
      "topic": "[Chủ đề mạnh]",
      "accuracyRate": "90%",
      "note": "[Ghi chú]"
    }
  ],
  "improvementPriority": [
    {
      "rank": 1,
      "topic": "[Chủ đề cần ưu tiên nhất]",
      "reason": "[Lý do ưu tiên]",
      "estimatedTimeToImprove": "[Thời gian dự kiến cải thiện]"
    }
  ],
  "learningGaps": [
    {
      "gap": "[Lỗ hổng kiến thức]",
      "prerequisite": "[Kiến thức tiên quyết cần bổ sung]",
      "impact": "[Ảnh hưởng đến các phần khác]"
    }
  ],
  "recommendations": {
    "immediate": ["[Việc cần làm ngay]"],
    "shortTerm": ["[Mục tiêu ngắn hạn 1-2 tuần]"],
    "longTerm": ["[Mục tiêu dài hạn]"]
  }
}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.`,

  // ============================================
  // TẠO LỘ TRÌNH ÔN THI CHI TIẾT THEO NGÀY
  // ============================================
  generateStudyPlan: `Bạn là cố vấn ôn thi TN THPT hàng đầu Việt Nam.

NHIỆM VỤ: Tạo kế hoạch học tập CHI TIẾT THEO TỪNG NGÀY dựa trên phân tích điểm yếu.

THÔNG TIN HỌC SINH:
- Họ tên: {studentName}
- Lớp: {grade}
- Các môn thi: {subjects}
- Ngày thi dự kiến: {examDate}
- Số ngày còn lại: {daysRemaining}
- Thời gian học mỗi ngày: {studyHoursPerDay} giờ
- Khung giờ học: {studyTimeSlots}

KẾT QUẢ PHÂN TÍCH ĐIỂM YẾU:
{weaknessAnalysis}

MỤC TIÊU ĐIỂM SỐ:
{targetScores}

YÊU CẦU:
1. Ưu tiên các chủ đề điểm yếu nghiêm trọng nhất (critical > high > medium > low)
2. Phân bổ thời gian hợp lý giữa các môn
3. Có ngày nghỉ ngơi để tránh burnout
4. Xen kẽ giữa học lý thuyết và làm bài tập
5. Có các bài test mini để đánh giá tiến độ
6. Tuần cuối dành cho ôn tổng và làm đề

OUTPUT FORMAT (JSON):
{
  "planInfo": {
    "title": "Lộ trình ôn thi TN THPT - [Tên học sinh]",
    "createdAt": "[Ngày tạo]",
    "examDate": "[Ngày thi]",
    "totalDays": [Số ngày],
    "totalStudyHours": [Tổng giờ học],
    "targetScore": "[Điểm mục tiêu]"
  },
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "Giai đoạn 1: Bổ sung kiến thức nền tảng",
      "startDay": 1,
      "endDay": 7,
      "focus": ["[Trọng tâm 1]", "[Trọng tâm 2]"],
      "expectedOutcome": "[Kết quả mong đợi cuối giai đoạn]"
    }
  ],
  "dailyPlan": [
    {
      "day": 1,
      "date": "[Thứ, ngày/tháng]",
      "phase": 1,
      "theme": "[Chủ đề chính trong ngày]",
      "sessions": [
        {
          "time": "07:00-09:00",
          "subject": "[Môn học]",
          "topic": "[Chủ đề cụ thể]",
          "activity": "[Loại hoạt động: Lý thuyết/Bài tập/Đề thi]",
          "content": "[Nội dung chi tiết cần học]",
          "materials": ["[Tài liệu 1]", "[Tài liệu 2]"],
          "targetGoal": "[Mục tiêu cụ thể của session]",
          "difficulty": "[easy/medium/hard]"
        },
        {
          "time": "09:30-11:30",
          "subject": "[Môn học khác]",
          "topic": "[Chủ đề]",
          "activity": "[Loại hoạt động]",
          "content": "[Nội dung]",
          "materials": [],
          "targetGoal": "[Mục tiêu]",
          "difficulty": "[easy/medium/hard]"
        }
      ],
      "breakTime": "11:30-14:00",
      "eveningReview": {
        "time": "20:00-21:00",
        "content": "[Nội dung ôn tập buổi tối]"
      },
      "dailyGoal": "[Mục tiêu cần đạt trong ngày]",
      "miniTest": {
        "hasTest": true,
        "testType": "[Loại test: Quiz/Đề mini/Self-check]",
        "questions": 10,
        "timeLimit": "15 phút"
      },
      "motivationalQuote": "[Câu nói động viên]",
      "notes": "[Ghi chú thêm]"
    }
  ],
  "weeklyMilestones": [
    {
      "week": 1,
      "startDay": 1,
      "endDay": 7,
      "milestones": ["[Cột mốc 1]", "[Cột mốc 2]"],
      "assessmentTest": {
        "hasTest": true,
        "description": "[Mô tả bài test đánh giá]",
        "targetScore": "[Điểm mục tiêu]"
      }
    }
  ],
  "subjectDistribution": {
    "[Môn 1]": {
      "totalHours": 20,
      "percentage": "30%",
      "focusTopics": ["[Chủ đề trọng tâm 1]"]
    }
  },
  "revisionStrategy": {
    "spaced": "[Chiến lược ôn tập ngắt quãng]",
    "lastWeek": "[Chiến lược tuần cuối]"
  },
  "tips": {
    "general": ["[Mẹo chung]"],
    "examDay": ["[Mẹo ngày thi]"],
    "stressManagement": ["[Quản lý stress]"]
  },
  "emergencyPlan": {
    "ifBehindSchedule": "[Làm gì nếu chậm tiến độ]",
    "ifTired": "[Làm gì nếu mệt mỏi]"
  }
}

LƯU Ý QUAN TRỌNG:
- Tạo lịch cho TẤT CẢ các ngày từ ngày 1 đến ngày thi
- Mỗi ngày phải có đủ các session học theo số giờ học/ngày
- Chủ nhật có thể nhẹ hơn nhưng vẫn có ôn tập
- Tuần cuối tập trung làm đề và ôn tổng

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.`,

  // ============================================
  // CẬP NHẬT LỘ TRÌNH DỰA TRÊN TIẾN ĐỘ
  // ============================================
  updateStudyPlan: `Bạn là cố vấn ôn thi thông minh.

NHIỆM VỤ: Điều chỉnh lộ trình học tập dựa trên tiến độ thực tế của học sinh.

LỘ TRÌNH HIỆN TẠI:
{currentPlan}

TIẾN ĐỘ HỌC TẬP:
- Ngày hiện tại: {currentDay}
- Các mục đã hoàn thành: {completedItems}
- Các mục chưa hoàn thành: {incompleteItems}
- Kết quả các bài test: {testResults}

PHẢN HỒI CỦA HỌC SINH:
{studentFeedback}

YÊU CẦU:
1. Đánh giá tiến độ so với kế hoạch
2. Điều chỉnh lộ trình nếu cần (dồn bài, giảm tải, hoặc tăng cường)
3. Cập nhật các ngày còn lại
4. Đề xuất thay đổi chiến lược nếu cần

OUTPUT FORMAT (JSON):
{
  "progressAssessment": {
    "onTrack": true/false,
    "completionRate": "75%",
    "summary": "[Đánh giá tiến độ]"
  },
  "adjustments": [
    {
      "type": "[reschedule/add/remove/modify]",
      "reason": "[Lý do điều chỉnh]",
      "details": "[Chi tiết điều chỉnh]"
    }
  ],
  "updatedDailyPlan": [
    {
      "day": [Số ngày],
      "date": "[Ngày]",
      "sessions": [...],
      "changes": "[Những thay đổi so với kế hoạch cũ]"
    }
  ],
  "newRecommendations": ["[Đề xuất mới]"],
  "encouragement": "[Lời động viên dựa trên tiến độ]"
}

CHỈ TRẢ VỀ JSON.`,

  // ============================================
  // TƯ VẤN HƯỚNG NGHIỆP
  // ============================================
  careerAdvice: `Bạn là chuyên gia tư vấn hướng nghiệp cho học sinh THPT Việt Nam với kiến thức sâu rộng về:
- Hệ thống giáo dục đại học Việt Nam
- Các ngành nghề và xu hướng thị trường lao động
- Tâm lý học nghề nghiệp

THÔNG TIN HỌC SINH:
{studentProfile}

KHỐI THI PHÙ HỢP (dựa trên điểm):
{recommendedKhoi}

NGÀNH NGHỀ CÓ SẴN:
{availableCareers}

XU HƯỚNG THỊ TRƯỜNG:
{marketTrends}

NHIỆM VỤ:
1. Phân tích điểm mạnh/yếu của học sinh từ điểm các môn
2. Đề xuất 3-5 ngành nghề phù hợp nhất với lý do chi tiết
3. Gợi ý các trường đại học phù hợp với mức điểm
4. Đưa ra lộ trình chuẩn bị cho từng ngành gợi ý
5. Phân tích cơ hội nghề nghiệp và thu nhập tương lai

OUTPUT FORMAT (JSON):
{
  "profileAnalysis": {
    "academicStrengths": ["[Điểm mạnh học thuật]"],
    "academicWeaknesses": ["[Điểm yếu cần cải thiện]"],
    "personalityTraits": ["[Đặc điểm tính cách phù hợp]"],
    "overallAssessment": "[Đánh giá tổng quan]"
  },
  "careerRecommendations": [
    {
      "rank": 1,
      "career": "[Tên ngành nghề]",
      "matchScore": 95,
      "reasons": ["[Lý do 1]", "[Lý do 2]"],
      "requiredSkills": ["[Kỹ năng cần có]"],
      "relatedMajors": ["[Ngành học đại học]"],
      "recommendedSchools": [
        {
          "name": "[Tên trường]",
          "major": "[Ngành cụ thể]",
          "estimatedScore": "[Điểm dự kiến]",
          "chance": "[Cao/TB/Thấp]"
        }
      ],
      "careerPath": {
        "entry": "[Vị trí khởi đầu]",
        "midLevel": "[Vị trí 3-5 năm]",
        "senior": "[Vị trí 5-10 năm]",
        "salary": {
          "entry": "[Mức lương khởi điểm]",
          "mid": "[Mức lương 3-5 năm]",
          "senior": "[Mức lương cao cấp]"
        }
      },
      "marketOutlook": "[Triển vọng thị trường]"
    }
  ],
  "preparationPlan": {
    "immediate": ["[Việc cần làm ngay]"],
    "beforeExam": ["[Chuẩn bị trước kỳ thi]"],
    "skills": ["[Kỹ năng cần rèn luyện]"]
  },
  "alternativePaths": [
    {
      "option": "[Lựa chọn thay thế]",
      "description": "[Mô tả]",
      "suitableFor": "[Phù hợp nếu...]"
    }
  ],
  "motivationalMessage": "[Lời động viên và khích lệ]",
  "importantNotes": ["[Lưu ý quan trọng]"]
}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.`
};

// ============================================
// AI SERVICE FUNCTIONS
// ============================================

const aiService = {
  /**
   * Generate lesson from text content
   */
  async generateLesson(text, options = {}) {
    try {
      const prompt = PROMPTS.lesson.replace('{text}', text);
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là gia sư AI chuyên nghiệp cho học sinh THPT Việt Nam.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Generate lesson error:', error);
      throw new Error(`Lỗi tạo bài giảng: ${error.message}`);
    }
  },

  /**
   * Generate lesson in LaTeX format
   * Chuyển đổi nội dung sang định dạng LaTeX chuẩn cho Toán/Lý/Hóa
   */
  async generateLessonLatex(text, options = {}) {
    try {
      const prompt = PROMPTS.lessonLatex.replace('{text}', text);
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là giáo viên THPT + chuyên gia LaTeX. Luôn viết công thức toán học bằng LaTeX chuẩn. Không dùng ký hiệu Unicode toán học.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 6000,
        temperature: options.temperature || 0.3 // Lower temperature for more consistent LaTeX
      });

      const latexContent = response.choices[0].message.content;
      
      // Validate LaTeX basic structure
      const hasDocumentClass = latexContent.includes('\\documentclass');
      const hasBeginDocument = latexContent.includes('\\begin{document}');
      const hasEndDocument = latexContent.includes('\\end{document}');
      
      return {
        success: true,
        content: latexContent,
        format: 'latex',
        isComplete: hasDocumentClass && hasBeginDocument && hasEndDocument,
        usage: response.usage
      };
    } catch (error) {
      console.error('Generate LaTeX lesson error:', error);
      throw new Error(`Lỗi tạo bài giảng LaTeX: ${error.message}`);
    }
  },

  /**
   * Convert existing lesson content to LaTeX
   */
  async convertToLatex(lessonContent, options = {}) {
    try {
      const prompt = `Chuyển đổi bài giảng sau sang định dạng LaTeX chuẩn.

QUY TẮC:
- Công thức inline: $...$
- Công thức block: $$...$$ hoặc \\[...\\]
- Sử dụng \\frac{}{}, \\sqrt{}, \\sum, \\int đầy đủ
- Hệ phương trình: \\begin{cases}...\\end{cases}
- Không dùng ký hiệu Unicode (≤ → \\leq, ≥ → \\geq, ≠ → \\neq, v.v.)

BÀI GIẢNG CẦN CHUYỂN:

${lessonContent}

CHỈ OUTPUT PHẦN LATEX (không cần documentclass nếu là đoạn nhỏ).`;
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia LaTeX. Chuyển đổi nội dung sang LaTeX chuẩn, đảm bảo compile được.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: 0.2
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        format: 'latex',
        usage: response.usage
      };
    } catch (error) {
      console.error('Convert to LaTeX error:', error);
      throw new Error(`Lỗi chuyển đổi LaTeX: ${error.message}`);
    }
  },

  /**
   * Generate lesson in structured JSON format with LaTeX formulas
   */
  async generateLessonStructured(text, options = {}) {
    try {
      const prompt = PROMPTS.lessonStructured.replace('{text}', text);
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là giáo viên THPT + chuyên gia LaTeX. Trả về JSON hợp lệ với công thức LaTeX được escape đúng.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 6000,
        temperature: options.temperature || 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const structured = JSON.parse(content);
      
      return {
        success: true,
        lesson: structured,
        format: 'json',
        usage: response.usage
      };
    } catch (error) {
      console.error('Generate structured lesson error:', error);
      throw new Error(`Lỗi tạo bài giảng JSON: ${error.message}`);
    }
  },

  /**
   * Generate both LaTeX and JSON versions of lesson
   */
  async generateLessonComplete(text, options = {}) {
    try {
      // Generate both formats in parallel
      const [latexResult, jsonResult, markdownResult] = await Promise.all([
        this.generateLessonLatex(text, options),
        this.generateLessonStructured(text, options),
        this.generateLesson(text, options)
      ]);

      return {
        success: true,
        content: markdownResult.content, // Markdown content
        latexContent: latexResult.content, // LaTeX content
        structuredContent: jsonResult.lesson, // JSON structured
        usage: {
          markdown: markdownResult.usage,
          latex: latexResult.usage,
          json: jsonResult.usage
        }
      };
    } catch (error) {
      console.error('Generate complete lesson error:', error);
      throw new Error(`Lỗi tạo bài giảng: ${error.message}`);
    }
  },

  /**
   * Generate quiz questions from content
   */
  async generateQuiz(text, count = 5, options = {}) {
    try {
      const prompt = PROMPTS.quiz
        .replace('{text}', text)
        .replace('{count}', count.toString());
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là giáo viên tạo đề thi. Luôn trả về JSON hợp lệ.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 3000,
        temperature: options.temperature || 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const quiz = JSON.parse(content);
      
      return {
        success: true,
        quiz,
        usage: response.usage
      };
    } catch (error) {
      console.error('Generate quiz error:', error);
      throw new Error(`Lỗi tạo quiz: ${error.message}`);
    }
  },

  /**
   * Chat with AI tutor
   */
  async chat(question, context = '', history = [], options = {}) {
    try {
      // Format history for prompt
      const historyText = history
        .slice(-10) // Last 10 messages
        .map(m => `${m.role === 'user' ? 'Học sinh' : 'Gia sư'}: ${m.content}`)
        .join('\n');

      const prompt = PROMPTS.chat
        .replace('{context}', context || 'Không có nội dung cụ thể.')
        .replace('{history}', historyText || 'Chưa có lịch sử hội thoại.')
        .replace('{question}', question);
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là gia sư AI thân thiện và kiên nhẫn cho học sinh THPT.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 1500,
        temperature: options.temperature || 0.8
      });

      return {
        success: true,
        response: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error(`Lỗi chat: ${error.message}`);
    }
  },

  /**
   * Analyze student weaknesses
   */
  async analyzeWeaknesses(learningData, options = {}) {
    try {
      const prompt = PROMPTS.analyzeWeakness
        .replace('{data}', JSON.stringify(learningData, null, 2));
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia phân tích học tập. Trả về JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.5,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      return {
        success: true,
        analysis,
        usage: response.usage
      };
    } catch (error) {
      console.error('Analyze weaknesses error:', error);
      throw new Error(`Lỗi phân tích: ${error.message}`);
    }
  },

  /**
   * Generate personalized learning roadmap
   */
  async generateRoadmap(studentInfo, options = {}) {
    try {
      let prompt = PROMPTS.roadmap;
      
      // Replace placeholders
      for (const [key, value] of Object.entries(studentInfo)) {
        const placeholder = `{${key}}`;
        const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
        prompt = prompt.replace(placeholder, valueStr);
      }
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là cố vấn học tập. Trả về JSON lộ trình học tập.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 3000,
        temperature: options.temperature || 0.6,
        response_format: { type: "json_object" }
      });

      const roadmap = JSON.parse(response.choices[0].message.content);
      
      return {
        success: true,
        roadmap,
        usage: response.usage
      };
    } catch (error) {
      console.error('Generate roadmap error:', error);
      throw new Error(`Lỗi tạo lộ trình: ${error.message}`);
    }
  },

  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(text, options = {}) {
    try {
      const response = await openai.audio.speech.create({
        model: options.model || TTS_MODEL,
        voice: options.voice || TTS_VOICE,
        input: text,
        speed: options.speed || 1.0
      });

      // Get audio buffer
      const buffer = Buffer.from(await response.arrayBuffer());
      
      return {
        success: true,
        audioBuffer: buffer,
        format: 'mp3'
      };
    } catch (error) {
      console.error('TTS error:', error);
      throw new Error(`Lỗi tạo audio: ${error.message}`);
    }
  },

  /**
   * Summarize text content
   */
  async summarize(text, options = {}) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia tóm tắt nội dung giáo dục.'
          },
          {
            role: 'user',
            content: `Tóm tắt nội dung sau thành các điểm chính ngắn gọn:\n\n${text}`
          }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: 0.5
      });

      return {
        success: true,
        summary: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Summarize error:', error);
      throw new Error(`Lỗi tóm tắt: ${error.message}`);
    }
  },

  /**
   * Phân tích điểm yếu từ kết quả bài thi thử
   */
  async analyzeExamResults(examResults, wrongAnswers, options = {}) {
    try {
      const prompt = PROMPTS.analyzeExamResults
        .replace('{examResults}', JSON.stringify(examResults, null, 2))
        .replace('{wrongAnswers}', JSON.stringify(wrongAnswers, null, 2));

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia phân tích kết quả thi TN THPT. Luôn trả về JSON hợp lệ.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const analysis = JSON.parse(content);

      return {
        success: true,
        analysis,
        usage: response.usage
      };
    } catch (error) {
      console.error('Analyze exam results error:', error);
      throw new Error(`Lỗi phân tích kết quả: ${error.message}`);
    }
  },

  /**
   * Tạo lộ trình ôn thi chi tiết theo ngày
   */
  async generateStudyPlan(studentInfo, weaknessAnalysis, options = {}) {
    try {
      const prompt = PROMPTS.generateStudyPlan
        .replace('{studentName}', studentInfo.name || 'Học sinh')
        .replace('{grade}', studentInfo.grade || '12')
        .replace('{subjects}', studentInfo.subjects?.join(', ') || 'Toán, Văn, Anh')
        .replace('{examDate}', studentInfo.examDate || 'Chưa xác định')
        .replace('{daysRemaining}', studentInfo.daysRemaining?.toString() || '30')
        .replace('{studyHoursPerDay}', studentInfo.studyHoursPerDay?.toString() || '4')
        .replace('{studyTimeSlots}', studentInfo.studyTimeSlots || '7:00-11:00, 14:00-17:00, 19:00-21:00')
        .replace('{weaknessAnalysis}', JSON.stringify(weaknessAnalysis, null, 2))
        .replace('{targetScores}', JSON.stringify(studentInfo.targetScores || {}, null, 2));

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là cố vấn ôn thi TN THPT hàng đầu. Luôn trả về JSON hợp lệ với kế hoạch chi tiết.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 8000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const studyPlan = JSON.parse(content);

      return {
        success: true,
        studyPlan,
        usage: response.usage
      };
    } catch (error) {
      console.error('Generate study plan error:', error);
      throw new Error(`Lỗi tạo lộ trình: ${error.message}`);
    }
  },

  /**
   * Cập nhật lộ trình dựa trên tiến độ
   */
  async updateStudyPlan(currentPlan, progress, studentFeedback, options = {}) {
    try {
      const prompt = PROMPTS.updateStudyPlan
        .replace('{currentPlan}', JSON.stringify(currentPlan, null, 2))
        .replace('{currentDay}', progress.currentDay?.toString() || '1')
        .replace('{completedItems}', JSON.stringify(progress.completedItems || [], null, 2))
        .replace('{incompleteItems}', JSON.stringify(progress.incompleteItems || [], null, 2))
        .replace('{testResults}', JSON.stringify(progress.testResults || [], null, 2))
        .replace('{studentFeedback}', studentFeedback || 'Không có phản hồi');

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là cố vấn ôn thi thông minh. Luôn trả về JSON hợp lệ.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 6000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const updatedPlan = JSON.parse(content);

      return {
        success: true,
        updatedPlan,
        usage: response.usage
      };
    } catch (error) {
      console.error('Update study plan error:', error);
      throw new Error(`Lỗi cập nhật lộ trình: ${error.message}`);
    }
  },

  /**
   * Tư vấn hướng nghiệp bằng AI
   */
  async getCareerAdvice(studentProfile, contextData, options = {}) {
    try {
      const prompt = PROMPTS.careerAdvice
        .replace('{studentProfile}', JSON.stringify(studentProfile, null, 2))
        .replace('{recommendedKhoi}', JSON.stringify(contextData.recommendedKhoi, null, 2))
        .replace('{availableCareers}', contextData.availableCareers?.join(', ') || '')
        .replace('{marketTrends}', JSON.stringify(contextData.marketTrends, null, 2));

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia tư vấn hướng nghiệp hàng đầu Việt Nam. Luôn trả về JSON hợp lệ với tư vấn chi tiết và thực tế.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 6000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const advice = JSON.parse(content);

      return {
        success: true,
        advice,
        usage: response.usage
      };
    } catch (error) {
      console.error('Get career advice error:', error);
      throw new Error(`Lỗi tư vấn hướng nghiệp: ${error.message}`);
    }
  },

  /**
   * Xử lý yêu cầu tùy chỉnh từ người dùng
   * Cho phép người dùng nhập prompt bất kỳ để AI xử lý
   */
  async generateWithCustomPrompt(userPrompt, outputType = 'lesson', outputFormat = 'markdown', options = {}) {
    try {
      let systemPrompt = 'Bạn là một AI giáo dục thông minh, giúp đỡ học sinh THPT Việt Nam.';
      const userMessage = userPrompt;

      switch (outputType) {
        case 'lesson':
          systemPrompt = 'Bạn là gia sư AI giàu kinh nghiệm, giúp tạo bài giảng chất lượng cao cho học sinh THPT Việt Nam. Sử dụng ngôn ngữ đơn giản, dễ hiểu với ví dụ minh họa cụ thể.';
          break;
        case 'quiz':
          systemPrompt = 'Bạn là giáo viên ra đề thi giỏi. Tạo các câu hỏi trắc nghiệm chất lượng cao với các đáp án nhiễu hợp lý.';
          break;
        case 'note':
          systemPrompt = 'Bạn là chuyên gia tóm tắt. Tạo ghi chú học tập ngắn gọn, dễ nhớ, chỉ giữ lại những điểm quan trọng nhất.';
          break;
        case 'summary':
          systemPrompt = 'Bạn là chuyên gia tóm tắt nội dung. Tóm tắt bài viết/nội dung thành những phần chính, súc tích.';
          break;
        default:
          systemPrompt = 'Bạn là một AI giáo dục thông minh, giúp đỡ học sinh THPT Việt Nam.';
      }

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7
      });

      const content = response.choices[0].message.content;

      let processedContent = content;
      if (outputFormat === 'json' && outputType === 'quiz') {
        try {
          processedContent = JSON.parse(content);
        } catch (e) {
          processedContent = content;
        }
      }

      return {
        success: true,
        content: processedContent,
        format: outputFormat,
        type: outputType,
        usage: response.usage
      };
    } catch (error) {
      console.error('Custom AI generation error:', error);
      throw new Error(`Lỗi xử lý yêu cầu tùy chỉnh: ${error.message}`);
    }
  }
};

module.exports = aiService;
