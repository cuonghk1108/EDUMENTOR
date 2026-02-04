/**
 * DỮ LIỆU HƯỚNG NGHIỆP - EDUMENTOR
 * Bao gồm: Khối thi, Điểm chuẩn, Ngành nghề, Xu hướng thị trường lao động
 * Cập nhật: 2025 - Theo chương trình GDPT 2018
 */

// ==================== KHỐI THI ĐẠI HỌC (GDPT 2018) ====================
// Các môn: Toán, Ngữ văn, Ngoại ngữ (bắt buộc) + Vật lý, Hóa học, Sinh học, 
// Lịch sử, Địa lý, GDKT&PL, Tin học, Công nghệ (lựa chọn)
const KHOI_THI = {
  // === KHỐI A - KHOA HỌC TỰ NHIÊN ===
  A00: {
    name: 'Khối A00',
    subjects: ['Toán', 'Vật lý', 'Hóa học'],
    description: 'Khối thi truyền thống cho các ngành Kỹ thuật, Công nghệ, Khoa học tự nhiên',
    careers: ['Kỹ sư', 'Kiến trúc sư', 'Nhà khoa học', 'Lập trình viên'],
    isGDPT2018: true
  },
  A01: {
    name: 'Khối A01',
    subjects: ['Toán', 'Vật lý', 'Tiếng Anh'],
    description: 'Phù hợp ngành Công nghệ thông tin, Kỹ thuật quốc tế, Điện tử viễn thông',
    careers: ['Lập trình viên', 'Kỹ sư phần mềm', 'Data Scientist', 'AI Engineer'],
    isGDPT2018: true
  },
  A02: {
    name: 'Khối A02',
    subjects: ['Toán', 'Vật lý', 'Sinh học'],
    description: 'Phù hợp ngành Kỹ thuật y sinh, Công nghệ sinh học',
    careers: ['Kỹ sư y sinh', 'Chuyên viên công nghệ sinh học', 'Nghiên cứu viên'],
    isGDPT2018: true
  },
  A03: {
    name: 'Khối A03',
    subjects: ['Toán', 'Vật lý', 'Lịch sử'],
    description: 'Phù hợp ngành Kiến trúc, Quy hoạch đô thị',
    careers: ['Kiến trúc sư', 'Quy hoạch viên', 'Nhà nghiên cứu'],
    isGDPT2018: true
  },
  A04: {
    name: 'Khối A04',
    subjects: ['Toán', 'Vật lý', 'Địa lý'],
    description: 'Phù hợp ngành Trắc địa, Địa chất, Kỹ thuật môi trường',
    careers: ['Kỹ sư trắc địa', 'Kỹ sư địa chất', 'Kỹ sư môi trường'],
    isGDPT2018: true
  },
  A05: {
    name: 'Khối A05',
    subjects: ['Toán', 'Hóa học', 'Lịch sử'],
    description: 'Phù hợp ngành Khoa học vật liệu, Bảo tồn di sản',
    careers: ['Kỹ sư vật liệu', 'Chuyên viên bảo tồn', 'Nghiên cứu viên'],
    isGDPT2018: true
  },
  A06: {
    name: 'Khối A06',
    subjects: ['Toán', 'Hóa học', 'Địa lý'],
    description: 'Phù hợp ngành Công nghệ hóa, Môi trường',
    careers: ['Kỹ sư hóa học', 'Kỹ sư môi trường', 'Chuyên viên năng lượng'],
    isGDPT2018: true
  },
  A07: {
    name: 'Khối A07',
    subjects: ['Toán', 'Lịch sử', 'Địa lý'],
    description: 'Phù hợp ngành Kinh tế, Quản trị, Quy hoạch',
    careers: ['Chuyên viên kinh tế', 'Quy hoạch viên', 'Nhà nghiên cứu'],
    isGDPT2018: true
  },
  A08: {
    name: 'Khối A08',
    subjects: ['Toán', 'Lịch sử', 'GDKT&PL'],
    description: 'Phù hợp ngành Luật, Kinh tế, Quản lý nhà nước',
    careers: ['Luật sư', 'Chuyên viên pháp lý', 'Công chức'],
    isGDPT2018: true,
    isNew: true
  },
  A09: {
    name: 'Khối A09',
    subjects: ['Toán', 'Địa lý', 'GDKT&PL'],
    description: 'Phù hợp ngành Kinh tế, Quản lý đô thị, Bất động sản',
    careers: ['Chuyên viên kinh tế', 'Quản lý bất động sản', 'Công chức'],
    isGDPT2018: true,
    isNew: true
  },
  A10: {
    name: 'Khối A10',
    subjects: ['Toán', 'Vật lý', 'GDKT&PL'],
    description: 'Phù hợp ngành Kỹ thuật - Kinh tế, Quản lý công nghiệp',
    careers: ['Kỹ sư công nghiệp', 'Quản lý sản xuất', 'Chuyên viên kinh tế kỹ thuật'],
    isGDPT2018: true,
    isNew: true
  },
  A11: {
    name: 'Khối A11',
    subjects: ['Toán', 'Hóa học', 'GDKT&PL'],
    description: 'Phù hợp ngành Kinh tế hóa chất, Quản lý môi trường',
    careers: ['Kỹ sư hóa', 'Chuyên viên môi trường', 'Quản lý doanh nghiệp hóa chất'],
    isGDPT2018: true,
    isNew: true
  },
  A12: {
    name: 'Khối A12 (MỚI - CNTT)',
    subjects: ['Toán', 'Vật lý', 'Tin học'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Dành riêng cho ngành CNTT, Trí tuệ nhân tạo, Khoa học dữ liệu',
    careers: ['AI Engineer', 'Data Scientist', 'Software Engineer', 'Blockchain Developer'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  A13: {
    name: 'Khối A13 (MỚI - CNTT)',
    subjects: ['Toán', 'Tin học', 'Tiếng Anh'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành CNTT quốc tế, Startup công nghệ',
    careers: ['Full-stack Developer', 'Product Manager', 'Tech Lead', 'Entrepreneur'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  A14: {
    name: 'Khối A14 (MỚI)',
    subjects: ['Toán', 'Tin học', 'Hóa học'],
    description: 'Phù hợp ngành Tin sinh học, Hóa tin, Dược phẩm số',
    careers: ['Chuyên viên tin sinh học', 'Kỹ sư hóa tin', 'Data Analyst y dược'],
    isGDPT2018: true,
    isNew: true
  },
  A15: {
    name: 'Khối A15 (MỚI)',
    subjects: ['Toán', 'Tin học', 'Sinh học'],
    description: 'Phù hợp ngành Tin sinh học, Công nghệ sinh học số',
    careers: ['Bioinformatics Engineer', 'Computational Biologist', 'Healthcare AI'],
    isGDPT2018: true,
    isNew: true
  },
  A16: {
    name: 'Khối A16 (MỚI)',
    subjects: ['Toán', 'Tin học', 'GDKT&PL'],
    description: 'Phù hợp ngành Fintech, Luật công nghệ, E-commerce',
    careers: ['Fintech Developer', 'Legal Tech', 'E-commerce Manager'],
    isGDPT2018: true,
    isNew: true
  },

  // === KHỐI B - Y DƯỢC, SINH HỌC ===
  B00: {
    name: 'Khối B00',
    subjects: ['Toán', 'Hóa học', 'Sinh học'],
    description: 'Khối thi cho ngành Y Dược, Nông nghiệp, Môi trường, Công nghệ sinh học',
    careers: ['Bác sĩ', 'Dược sĩ', 'Nhà sinh học', 'Kỹ sư nông nghiệp'],
    isGDPT2018: true
  },
  B01: {
    name: 'Khối B01',
    subjects: ['Toán', 'Sinh học', 'Lịch sử'],
    description: 'Phù hợp ngành Sinh học tiến hóa, Bảo tồn',
    careers: ['Nhà sinh học', 'Chuyên viên bảo tồn', 'Nghiên cứu viên'],
    isGDPT2018: true
  },
  B02: {
    name: 'Khối B02',
    subjects: ['Toán', 'Sinh học', 'Địa lý'],
    description: 'Phù hợp ngành Sinh thái, Môi trường, Nông nghiệp',
    careers: ['Kỹ sư môi trường', 'Chuyên viên sinh thái', 'Kỹ sư nông nghiệp'],
    isGDPT2018: true
  },
  B03: {
    name: 'Khối B03',
    subjects: ['Toán', 'Sinh học', 'Ngữ văn'],
    description: 'Phù hợp ngành Tâm lý học, Công tác xã hội y tế',
    careers: ['Nhà tâm lý', 'Công tác xã hội', 'Chuyên viên truyền thông y tế'],
    isGDPT2018: true
  },
  B04: {
    name: 'Khối B04',
    subjects: ['Toán', 'Sinh học', 'GDKT&PL'],
    description: 'Phù hợp ngành Quản lý y tế, Kinh doanh dược phẩm',
    careers: ['Quản lý bệnh viện', 'Kinh doanh dược', 'Chuyên viên pháp chế y tế'],
    isGDPT2018: true,
    isNew: true
  },
  B05: {
    name: 'Khối B05 (MỚI)',
    subjects: ['Toán', 'Sinh học', 'Tin học'],
    description: '⭐ KHỐI MỚI - Ngành Tin sinh học, Y tế số, AI trong Y khoa',
    careers: ['Health Tech Engineer', 'Medical AI', 'Digital Health Specialist'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  B08: {
    name: 'Khối B08',
    subjects: ['Toán', 'Sinh học', 'Tiếng Anh'],
    description: 'Phù hợp ngành Y Dược quốc tế, Nghiên cứu sinh học',
    careers: ['Bác sĩ quốc tế', 'Nghiên cứu viên', 'Dược sĩ quốc tế'],
    isGDPT2018: true
  },

  // === KHỐI C - KHOA HỌC XÃ HỘI ===
  C00: {
    name: 'Khối C00',
    subjects: ['Ngữ văn', 'Lịch sử', 'Địa lý'],
    description: 'Khối thi cho ngành Xã hội, Nhân văn, Báo chí, Du lịch',
    careers: ['Nhà báo', 'Luật sư', 'Giáo viên', 'Nhà nghiên cứu xã hội'],
    isGDPT2018: true
  },
  C01: {
    name: 'Khối C01',
    subjects: ['Ngữ văn', 'Toán', 'Vật lý'],
    description: 'Phù hợp ngành Báo chí đa phương tiện, Truyền thông số',
    careers: ['Nhà báo đa phương tiện', 'Content Creator', 'Digital Media'],
    isGDPT2018: true
  },
  C02: {
    name: 'Khối C02',
    subjects: ['Ngữ văn', 'Toán', 'Hóa học'],
    description: 'Phù hợp ngành Sư phạm, Truyền thông khoa học',
    careers: ['Giáo viên', 'Biên tập viên khoa học', 'Chuyên viên truyền thông'],
    isGDPT2018: true
  },
  C03: {
    name: 'Khối C03',
    subjects: ['Ngữ văn', 'Toán', 'Lịch sử'],
    description: 'Phù hợp ngành Luật, Báo chí, Quan hệ công chúng',
    careers: ['Luật sư', 'Nhà báo', 'PR Specialist'],
    isGDPT2018: true
  },
  C04: {
    name: 'Khối C04',
    subjects: ['Ngữ văn', 'Toán', 'Địa lý'],
    description: 'Phù hợp ngành Du lịch, Kinh tế, Quản trị',
    careers: ['Quản lý du lịch', 'Chuyên viên kinh tế', 'Event Manager'],
    isGDPT2018: true
  },
  C05: {
    name: 'Khối C05',
    subjects: ['Ngữ văn', 'Vật lý', 'Hóa học'],
    description: 'Phù hợp ngành Sư phạm đa môn, Giáo dục STEM',
    careers: ['Giáo viên STEM', 'Chuyên viên giáo dục', 'Biên tập viên'],
    isGDPT2018: true
  },
  C14: {
    name: 'Khối C14',
    subjects: ['Ngữ văn', 'Toán', 'GDKT&PL'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành Luật, Quản lý nhà nước, Chính trị học',
    careers: ['Luật sư', 'Công chức', 'Chuyên viên pháp chế', 'Nhà hoạch định chính sách'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  C15: {
    name: 'Khối C15',
    subjects: ['Ngữ văn', 'Lịch sử', 'GDKT&PL'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành Luật, Chính trị, Quốc tế',
    careers: ['Luật sư', 'Nhà ngoại giao', 'Chuyên viên chính sách', 'Nghiên cứu viên'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  C16: {
    name: 'Khối C16',
    subjects: ['Ngữ văn', 'Địa lý', 'GDKT&PL'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành Kinh tế, Quản lý đô thị, Du lịch',
    careers: ['Chuyên viên kinh tế', 'Quản lý du lịch', 'Quy hoạch viên'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  C17: {
    name: 'Khối C17 (MỚI)',
    subjects: ['Ngữ văn', 'Lịch sử', 'Tin học'],
    description: 'Phù hợp ngành Truyền thông số, Lưu trữ học số, Digital Humanities',
    careers: ['Digital Archivist', 'Content Strategist', 'Digital Historian'],
    isGDPT2018: true,
    isNew: true
  },
  C18: {
    name: 'Khối C18 (MỚI)',
    subjects: ['Ngữ văn', 'Địa lý', 'Tin học'],
    description: 'Phù hợp ngành GIS, Du lịch số, Smart City',
    careers: ['GIS Analyst', 'Travel Tech', 'Smart City Specialist'],
    isGDPT2018: true,
    isNew: true
  },

  // === KHỐI D - ĐA NGÀNH ===
  D01: {
    name: 'Khối D01',
    subjects: ['Toán', 'Ngữ văn', 'Tiếng Anh'],
    description: 'Khối thi phổ biến nhất, đa ngành nghề: Kinh tế, Marketing, Ngoại giao',
    careers: ['Kinh tế', 'Marketing', 'Ngoại giao', 'Du lịch', 'Ngôn ngữ'],
    isGDPT2018: true
  },
  D07: {
    name: 'Khối D07',
    subjects: ['Toán', 'Hóa học', 'Tiếng Anh'],
    description: 'Phù hợp ngành Y Dược quốc tế, Hóa học ứng dụng',
    careers: ['Dược sĩ', 'Kỹ sư hóa học', 'Nghiên cứu sinh'],
    isGDPT2018: true
  },
  D08: {
    name: 'Khối D08',
    subjects: ['Toán', 'Sinh học', 'Tiếng Anh'],
    description: 'Phù hợp ngành Y Dược quốc tế, Công nghệ sinh học',
    careers: ['Bác sĩ', 'Dược sĩ', 'Kỹ sư sinh học'],
    isGDPT2018: true
  },
  D09: {
    name: 'Khối D09',
    subjects: ['Toán', 'Lịch sử', 'Tiếng Anh'],
    description: 'Phù hợp ngành Quốc tế học, Du lịch, Ngoại giao',
    careers: ['Nhà ngoại giao', 'Quản lý du lịch', 'Nghiên cứu quốc tế'],
    isGDPT2018: true
  },
  D10: {
    name: 'Khối D10',
    subjects: ['Toán', 'Địa lý', 'Tiếng Anh'],
    description: 'Phù hợp ngành Logistics, Du lịch quốc tế',
    careers: ['Logistics Manager', 'Travel Consultant', 'Trade Specialist'],
    isGDPT2018: true
  },
  D14: {
    name: 'Khối D14',
    subjects: ['Ngữ văn', 'Lịch sử', 'Tiếng Anh'],
    description: 'Phù hợp ngành Luật quốc tế, Quan hệ quốc tế, Báo chí',
    careers: ['Luật sư quốc tế', 'Nhà ngoại giao', 'Biên phiên dịch', 'Nhà báo'],
    isGDPT2018: true
  },
  D15: {
    name: 'Khối D15',
    subjects: ['Ngữ văn', 'Địa lý', 'Tiếng Anh'],
    description: 'Phù hợp ngành Du lịch quốc tế, Việt Nam học, Văn hóa',
    careers: ['Hướng dẫn viên du lịch', 'Quản lý khách sạn', 'Nghiên cứu văn hóa'],
    isGDPT2018: true
  },
  D66: {
    name: 'Khối D66 (MỚI)',
    subjects: ['Ngữ văn', 'GDKT&PL', 'Tiếng Anh'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành Luật quốc tế, Thương mại quốc tế',
    careers: ['Luật sư quốc tế', 'Trade Lawyer', 'Compliance Officer'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  D84: {
    name: 'Khối D84 (MỚI)',
    subjects: ['Toán', 'GDKT&PL', 'Tiếng Anh'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành Kinh tế quốc tế, Tài chính, Fintech',
    careers: ['Financial Analyst', 'Fintech Developer', 'International Business'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  D96: {
    name: 'Khối D96 (MỚI)',
    subjects: ['Toán', 'Tin học', 'Tiếng Anh'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành CNTT quốc tế, AI, Data Science',
    careers: ['Global Software Engineer', 'AI Researcher', 'Data Scientist'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },

  // === KHỐI NĂNG KHIẾU ===
  H00: {
    name: 'Khối H00',
    subjects: ['Ngữ văn', 'Năng khiếu VHNT 1', 'Năng khiếu VHNT 2'],
    description: 'Khối thi năng khiếu Nghệ thuật: Sân khấu, Điện ảnh, Mỹ thuật',
    careers: ['Họa sĩ', 'Nhà thiết kế', 'Đạo diễn', 'Diễn viên'],
    isGDPT2018: true
  },
  H01: {
    name: 'Khối H01',
    subjects: ['Toán', 'Ngữ văn', 'Năng khiếu'],
    description: 'Phù hợp ngành Thiết kế đồ họa, Kiến trúc',
    careers: ['Graphic Designer', 'Kiến trúc sư', 'UI/UX Designer'],
    isGDPT2018: true
  },
  V00: {
    name: 'Khối V00',
    subjects: ['Toán', 'Vật lý', 'Vẽ mỹ thuật'],
    description: 'Khối thi Kiến trúc, Xây dựng, Thiết kế nội thất',
    careers: ['Kiến trúc sư', 'Thiết kế nội thất', 'Quy hoạch đô thị'],
    isGDPT2018: true
  },
  V01: {
    name: 'Khối V01',
    subjects: ['Toán', 'Ngữ văn', 'Vẽ mỹ thuật'],
    description: 'Phù hợp ngành Thiết kế, Mỹ thuật ứng dụng',
    careers: ['Industrial Designer', 'Brand Designer', 'Creative Director'],
    isGDPT2018: true
  },

  // === KHỐI CÔNG NGHỆ (MỚI GDPT 2018) ===
  T00: {
    name: 'Khối T00 (MỚI)',
    subjects: ['Toán', 'Vật lý', 'Công nghệ'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành Kỹ thuật, Tự động hóa, Robotics',
    careers: ['Robotics Engineer', 'Automation Engineer', 'Industrial Engineer'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  T01: {
    name: 'Khối T01 (MỚI)',
    subjects: ['Toán', 'Tin học', 'Công nghệ'],
    description: '⭐ KHỐI MỚI GDPT 2018 - Ngành IoT, Embedded Systems, Mechatronics',
    careers: ['IoT Engineer', 'Embedded Developer', 'Mechatronics Engineer'],
    isGDPT2018: true,
    isNew: true,
    highlight: true
  },
  T02: {
    name: 'Khối T02 (MỚI)',
    subjects: ['Toán', 'Sinh học', 'Công nghệ'],
    description: 'Phù hợp ngành Công nghệ thực phẩm, Nông nghiệp công nghệ cao',
    careers: ['Food Technologist', 'AgriTech Engineer', 'Bioprocess Engineer'],
    isGDPT2018: true,
    isNew: true
  }
};

// ==================== ĐIỂM CHUẨN CÁC TRƯỜNG TOP 2025 ====================
// Cập nhật theo kỳ tuyển sinh 2025 - Áp dụng chương trình GDPT 2018
const DIEM_CHUAN_2025 = {
  // ========== NHÓM TRƯỜNG Y DƯỢC ==========
  'Đại học Y Hà Nội': {
    code: 'YHN',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Y khoa',
    majors: [
      { name: 'Y khoa', code: 'B00', score: 27.72, quota: 450, trend: 'tăng' },
      { name: 'Y khoa', code: 'B05', score: 27.45, quota: 50, trend: 'mới', note: 'Khối mới Tin-Sinh' },
      { name: 'Răng Hàm Mặt', code: 'B00', score: 27.05, quota: 85, trend: 'tăng' },
      { name: 'Y học dự phòng', code: 'B00', score: 25.10, quota: 130, trend: 'tăng' },
      { name: 'Dược học', code: 'B00', score: 26.45, quota: 220, trend: 'tăng' },
      { name: 'Điều dưỡng', code: 'B00', score: 24.85, quota: 160, trend: 'tăng' },
      { name: 'Y học cổ truyền', code: 'B00', score: 25.50, quota: 80, trend: 'giữ' }
    ]
  },
  'Đại học Y Dược TP.HCM': {
    code: 'YDS',
    type: 'Công lập',
    location: 'TP.HCM',
    ranking: 'Top 1 Y khoa phía Nam',
    majors: [
      { name: 'Y khoa', code: 'B00', score: 27.50, quota: 520, trend: 'tăng' },
      { name: 'Dược học', code: 'B00', score: 26.80, quota: 320, trend: 'tăng' },
      { name: 'Răng Hàm Mặt', code: 'B00', score: 26.95, quota: 110, trend: 'tăng' },
      { name: 'Y học cổ truyền', code: 'B00', score: 25.25, quota: 100, trend: 'giữ' },
      { name: 'Kỹ thuật y học', code: 'B00', score: 24.50, quota: 150, trend: 'giữ' }
    ]
  },
  'Đại học Dược Hà Nội': {
    code: 'DHN',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Dược',
    majors: [
      { name: 'Dược học', code: 'B00', score: 26.75, quota: 600, trend: 'tăng' },
      { name: 'Dược học', code: 'A00', score: 26.50, quota: 200, trend: 'tăng' },
      { name: 'Hóa dược', code: 'A00', score: 25.85, quota: 80, trend: 'giữ' }
    ]
  },

  // ========== NHÓM TRƯỜNG BÁCH KHOA - CÔNG NGHỆ ==========
  'Đại học Bách khoa Hà Nội': {
    code: 'BKA',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Kỹ thuật',
    majors: [
      { name: 'Trí tuệ nhân tạo', code: 'A00', score: 29.15, quota: 120, trend: 'tăng mạnh' },
      { name: 'Trí tuệ nhân tạo', code: 'A12', score: 28.90, quota: 80, trend: 'mới', note: 'Khối mới Tin học' },
      { name: 'Khoa học máy tính', code: 'A00', score: 28.82, quota: 220, trend: 'tăng' },
      { name: 'Khoa học máy tính', code: 'A12', score: 28.65, quota: 80, trend: 'mới' },
      { name: 'Kỹ thuật máy tính', code: 'A00', score: 28.50, quota: 200, trend: 'tăng' },
      { name: 'Công nghệ thông tin', code: 'A01', score: 28.20, quota: 380, trend: 'tăng' },
      { name: 'Công nghệ thông tin', code: 'A13', score: 28.00, quota: 120, trend: 'mới' },
      { name: 'An toàn thông tin', code: 'A00', score: 27.85, quota: 100, trend: 'tăng' },
      { name: 'Khoa học dữ liệu', code: 'A00', score: 28.45, quota: 80, trend: 'mới' },
      { name: 'Kỹ thuật điện', code: 'A00', score: 27.00, quota: 220, trend: 'tăng' },
      { name: 'Kỹ thuật điện tử viễn thông', code: 'A00', score: 27.25, quota: 180, trend: 'tăng' },
      { name: 'Kỹ thuật cơ khí', code: 'A00', score: 25.80, quota: 320, trend: 'giữ' },
      { name: 'Cơ điện tử', code: 'A00', score: 26.95, quota: 150, trend: 'tăng' },
      { name: 'Cơ điện tử', code: 'T01', score: 26.75, quota: 50, trend: 'mới' },
      { name: 'Kỹ thuật hóa học', code: 'A00', score: 25.55, quota: 160, trend: 'giữ' },
      { name: 'Kỹ thuật xây dựng', code: 'A00', score: 24.50, quota: 250, trend: 'giảm' },
      { name: 'Kỹ thuật ô tô', code: 'A00', score: 26.25, quota: 120, trend: 'tăng' },
      { name: 'Kỹ thuật năng lượng', code: 'A00', score: 25.75, quota: 100, trend: 'giữ' }
    ]
  },
  'Đại học Bách khoa TP.HCM': {
    code: 'BKS',
    type: 'Công lập',
    location: 'TP.HCM',
    ranking: 'Top 1 Kỹ thuật phía Nam',
    majors: [
      { name: 'Khoa học máy tính', code: 'A00', score: 28.40, quota: 200, trend: 'tăng' },
      { name: 'Trí tuệ nhân tạo', code: 'A00', score: 28.75, quota: 100, trend: 'tăng mạnh' },
      { name: 'Trí tuệ nhân tạo', code: 'A12', score: 28.50, quota: 60, trend: 'mới' },
      { name: 'Công nghệ thông tin', code: 'A01', score: 27.80, quota: 320, trend: 'tăng' },
      { name: 'Kỹ thuật điện tử viễn thông', code: 'A00', score: 26.55, quota: 220, trend: 'giữ' },
      { name: 'Kỹ thuật cơ khí', code: 'A00', score: 25.20, quota: 300, trend: 'giữ' },
      { name: 'Cơ điện tử', code: 'A00', score: 26.50, quota: 150, trend: 'tăng' },
      { name: 'Kỹ thuật ô tô', code: 'A00', score: 26.00, quota: 150, trend: 'tăng' }
    ]
  },
  'Đại học Công nghệ - ĐHQGHN': {
    code: 'UET',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 3 CNTT',
    majors: [
      { name: 'Trí tuệ nhân tạo', code: 'A00', score: 28.55, quota: 100, trend: 'tăng mạnh' },
      { name: 'Trí tuệ nhân tạo', code: 'A12', score: 28.30, quota: 50, trend: 'mới' },
      { name: 'Khoa học máy tính', code: 'A00', score: 28.25, quota: 170, trend: 'tăng' },
      { name: 'Công nghệ thông tin', code: 'A00', score: 28.00, quota: 420, trend: 'tăng' },
      { name: 'Công nghệ thông tin', code: 'A13', score: 27.75, quota: 100, trend: 'mới' },
      { name: 'Khoa học dữ liệu', code: 'A00', score: 28.10, quota: 60, trend: 'mới' },
      { name: 'Hệ thống thông tin', code: 'A00', score: 26.80, quota: 130, trend: 'giữ' },
      { name: 'Công nghệ kỹ thuật điện tử', code: 'A00', score: 26.25, quota: 160, trend: 'giữ' },
      { name: 'Kỹ thuật robot', code: 'A00', score: 27.00, quota: 80, trend: 'tăng' },
      { name: 'An toàn thông tin', code: 'A00', score: 27.50, quota: 100, trend: 'tăng' }
    ]
  },
  'Đại học Công nghệ Thông tin - ĐHQG TP.HCM': {
    code: 'UIT',
    type: 'Công lập',
    location: 'TP.HCM',
    ranking: 'Top 3 CNTT phía Nam',
    majors: [
      { name: 'Trí tuệ nhân tạo', code: 'A00', score: 28.20, quota: 120, trend: 'tăng mạnh' },
      { name: 'Trí tuệ nhân tạo', code: 'A12', score: 27.95, quota: 80, trend: 'mới' },
      { name: 'Khoa học máy tính', code: 'A00', score: 27.85, quota: 200, trend: 'tăng' },
      { name: 'Kỹ thuật phần mềm', code: 'A00', score: 27.50, quota: 250, trend: 'tăng' },
      { name: 'Công nghệ thông tin', code: 'A01', score: 27.20, quota: 400, trend: 'tăng' },
      { name: 'An toàn thông tin', code: 'A00', score: 27.00, quota: 150, trend: 'tăng' },
      { name: 'Khoa học dữ liệu', code: 'A00', score: 27.65, quota: 100, trend: 'mới' },
      { name: 'Hệ thống thông tin', code: 'A00', score: 26.50, quota: 180, trend: 'giữ' },
      { name: 'Mạng máy tính', code: 'A00', score: 26.25, quota: 150, trend: 'giữ' }
    ]
  },
  'Đại học FPT': {
    code: 'FPT',
    type: 'Tư thục',
    location: 'Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn',
    ranking: 'Top 1 Tư thục CNTT',
    note: 'Xét học bạ + phỏng vấn, không cần điểm thi THPT',
    majors: [
      { name: 'Trí tuệ nhân tạo', code: 'A00', score: 24.00, quota: 1200, trend: 'tăng mạnh' },
      { name: 'Trí tuệ nhân tạo', code: 'A12', score: 23.80, quota: 600, trend: 'mới' },
      { name: 'Kỹ thuật phần mềm', code: 'A01', score: 23.50, quota: 2000, trend: 'tăng' },
      { name: 'An toàn thông tin', code: 'A00', score: 22.50, quota: 800, trend: 'tăng' },
      { name: 'Công nghệ thông tin', code: 'A00', score: 23.00, quota: 2500, trend: 'tăng' },
      { name: 'Thiết kế đồ họa', code: 'D01', score: 21.00, quota: 800, trend: 'giữ' },
      { name: 'Quản trị kinh doanh', code: 'D01', score: 21.00, quota: 1500, trend: 'giữ' },
      { name: 'Marketing số', code: 'D01', score: 21.50, quota: 600, trend: 'tăng' },
      { name: 'Ngôn ngữ Anh', code: 'D01', score: 21.00, quota: 400, trend: 'giữ' },
      { name: 'Ngôn ngữ Nhật', code: 'D01', score: 21.50, quota: 500, trend: 'tăng' },
      { name: 'Ngôn ngữ Hàn', code: 'D01', score: 22.00, quota: 400, trend: 'tăng' }
    ]
  },

  // ========== NHÓM TRƯỜNG KINH TẾ ==========
  'Đại học Kinh tế Quốc dân': {
    code: 'NEU',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Kinh tế',
    majors: [
      { name: 'Kinh tế', code: 'D01', score: 27.80, quota: 420, trend: 'tăng' },
      { name: 'Kinh tế số', code: 'D01', score: 28.00, quota: 100, trend: 'mới' },
      { name: 'Kinh tế số', code: 'A13', score: 27.50, quota: 50, trend: 'mới' },
      { name: 'Tài chính - Ngân hàng', code: 'A00', score: 27.55, quota: 380, trend: 'tăng' },
      { name: 'Tài chính công nghệ (Fintech)', code: 'A00', score: 27.85, quota: 80, trend: 'mới' },
      { name: 'Tài chính công nghệ (Fintech)', code: 'A16', score: 27.60, quota: 40, trend: 'mới' },
      { name: 'Kế toán', code: 'D01', score: 27.10, quota: 320, trend: 'giữ' },
      { name: 'Kiểm toán', code: 'A00', score: 27.25, quota: 200, trend: 'giữ' },
      { name: 'Quản trị kinh doanh', code: 'D01', score: 27.30, quota: 420, trend: 'tăng' },
      { name: 'Marketing', code: 'D01', score: 26.80, quota: 220, trend: 'giữ' },
      { name: 'Kinh tế quốc tế', code: 'D01', score: 27.45, quota: 170, trend: 'tăng' },
      { name: 'Thương mại điện tử', code: 'D01', score: 27.20, quota: 120, trend: 'tăng' },
      { name: 'Logistics', code: 'D01', score: 26.95, quota: 100, trend: 'tăng' }
    ]
  },
  'Đại học Ngoại thương': {
    code: 'FTU',
    type: 'Công lập',
    location: 'Hà Nội, TP.HCM',
    ranking: 'Top 1 Kinh doanh quốc tế',
    majors: [
      { name: 'Kinh tế đối ngoại', code: 'D01', score: 28.10, quota: 320, trend: 'tăng' },
      { name: 'Kinh doanh quốc tế', code: 'D01', score: 27.80, quota: 280, trend: 'tăng' },
      { name: 'Tài chính quốc tế', code: 'A00', score: 27.55, quota: 220, trend: 'tăng' },
      { name: 'Luật kinh tế quốc tế', code: 'D01', score: 27.00, quota: 170, trend: 'giữ' },
      { name: 'Luật kinh tế quốc tế', code: 'D66', score: 26.80, quota: 50, trend: 'mới' },
      { name: 'Kế toán', code: 'D01', score: 26.75, quota: 200, trend: 'giữ' },
      { name: 'Logistics và Quản lý chuỗi cung ứng', code: 'D01', score: 27.35, quota: 150, trend: 'tăng mạnh' },
      { name: 'Ngôn ngữ Anh', code: 'D01', score: 27.50, quota: 200, trend: 'tăng' }
    ]
  },
  'Đại học Kinh tế TP.HCM (UEH)': {
    code: 'UEH',
    type: 'Công lập',
    location: 'TP.HCM',
    ranking: 'Top 1 Kinh tế phía Nam',
    majors: [
      { name: 'Kinh tế', code: 'D01', score: 27.25, quota: 350, trend: 'tăng' },
      { name: 'Tài chính - Ngân hàng', code: 'A00', score: 27.00, quota: 320, trend: 'tăng' },
      { name: 'Fintech', code: 'A00', score: 27.40, quota: 100, trend: 'mới' },
      { name: 'Quản trị kinh doanh', code: 'D01', score: 26.85, quota: 380, trend: 'giữ' },
      { name: 'Marketing', code: 'D01', score: 26.50, quota: 250, trend: 'giữ' },
      { name: 'Kế toán', code: 'D01', score: 26.60, quota: 280, trend: 'giữ' },
      { name: 'Kinh doanh quốc tế', code: 'D01', score: 27.10, quota: 200, trend: 'tăng' },
      { name: 'Logistics', code: 'D01', score: 26.95, quota: 150, trend: 'tăng' }
    ]
  },

  // ========== NHÓM TRƯỜNG SƯ PHẠM ==========
  'Đại học Sư phạm Hà Nội': {
    code: 'SPH',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Sư phạm',
    note: 'Miễn học phí + Hỗ trợ sinh hoạt phí',
    majors: [
      { name: 'Sư phạm Toán học', code: 'A00', score: 27.00, quota: 220, trend: 'tăng' },
      { name: 'Sư phạm Vật lý', code: 'A00', score: 26.25, quota: 160, trend: 'tăng' },
      { name: 'Sư phạm Hóa học', code: 'A00', score: 26.00, quota: 160, trend: 'tăng' },
      { name: 'Sư phạm Sinh học', code: 'B00', score: 25.75, quota: 140, trend: 'giữ' },
      { name: 'Sư phạm Ngữ văn', code: 'C00', score: 26.55, quota: 200, trend: 'tăng' },
      { name: 'Sư phạm Lịch sử', code: 'C00', score: 25.80, quota: 120, trend: 'giữ' },
      { name: 'Sư phạm Địa lý', code: 'C00', score: 25.50, quota: 120, trend: 'giữ' },
      { name: 'Sư phạm Tiếng Anh', code: 'D01', score: 27.30, quota: 220, trend: 'tăng' },
      { name: 'Sư phạm Tin học', code: 'A00', score: 25.85, quota: 100, trend: 'tăng' },
      { name: 'Sư phạm Tin học', code: 'A12', score: 25.60, quota: 50, trend: 'mới' },
      { name: 'Sư phạm GDKT&PL', code: 'C15', score: 25.00, quota: 80, trend: 'mới' },
      { name: 'Giáo dục Tiểu học', code: 'D01', score: 26.80, quota: 300, trend: 'tăng' },
      { name: 'Giáo dục Mầm non', code: 'D01', score: 25.50, quota: 250, trend: 'giữ' },
      { name: 'Tâm lý học giáo dục', code: 'D01', score: 26.25, quota: 100, trend: 'tăng' }
    ]
  },
  'Đại học Sư phạm TP.HCM': {
    code: 'SPS',
    type: 'Công lập',
    location: 'TP.HCM',
    ranking: 'Top 1 Sư phạm phía Nam',
    note: 'Miễn học phí + Hỗ trợ sinh hoạt phí',
    majors: [
      { name: 'Sư phạm Toán học', code: 'A00', score: 26.50, quota: 200, trend: 'tăng' },
      { name: 'Sư phạm Vật lý', code: 'A00', score: 25.75, quota: 140, trend: 'giữ' },
      { name: 'Sư phạm Hóa học', code: 'A00', score: 25.50, quota: 140, trend: 'giữ' },
      { name: 'Sư phạm Sinh học', code: 'B00', score: 25.25, quota: 120, trend: 'giữ' },
      { name: 'Sư phạm Ngữ văn', code: 'C00', score: 26.00, quota: 180, trend: 'tăng' },
      { name: 'Sư phạm Tiếng Anh', code: 'D01', score: 26.85, quota: 200, trend: 'tăng' },
      { name: 'Sư phạm Tin học', code: 'A00', score: 25.35, quota: 80, trend: 'tăng' },
      { name: 'Giáo dục Tiểu học', code: 'D01', score: 26.25, quota: 280, trend: 'tăng' }
    ]
  },

  // ========== NHÓM TRƯỜNG LUẬT ==========
  'Đại học Luật Hà Nội': {
    code: 'LHN',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Luật',
    majors: [
      { name: 'Luật', code: 'D01', score: 27.15, quota: 520, trend: 'tăng' },
      { name: 'Luật', code: 'C14', score: 26.85, quota: 150, trend: 'mới' },
      { name: 'Luật kinh tế', code: 'D01', score: 27.30, quota: 320, trend: 'tăng' },
      { name: 'Luật kinh tế', code: 'C15', score: 27.00, quota: 100, trend: 'mới' },
      { name: 'Luật quốc tế', code: 'D14', score: 26.80, quota: 170, trend: 'giữ' },
      { name: 'Luật quốc tế', code: 'D66', score: 26.55, quota: 80, trend: 'mới' },
      { name: 'Luật Thương mại quốc tế', code: 'D01', score: 27.00, quota: 100, trend: 'tăng' }
    ]
  },
  'Đại học Luật TP.HCM': {
    code: 'LTS',
    type: 'Công lập',
    location: 'TP.HCM',
    ranking: 'Top 1 Luật phía Nam',
    majors: [
      { name: 'Luật', code: 'D01', score: 26.65, quota: 480, trend: 'tăng' },
      { name: 'Luật', code: 'C14', score: 26.35, quota: 120, trend: 'mới' },
      { name: 'Luật kinh tế', code: 'D01', score: 26.85, quota: 300, trend: 'tăng' },
      { name: 'Luật quốc tế', code: 'D14', score: 26.30, quota: 150, trend: 'giữ' }
    ]
  },

  // ========== NHÓM TRƯỜNG ĐA NGÀNH TOP ==========
  'Đại học Quốc gia Hà Nội - Khoa Các KHLN': {
    code: 'QHI',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 5 Đa ngành',
    majors: [
      { name: 'Quan hệ quốc tế', code: 'D01', score: 27.50, quota: 150, trend: 'tăng' },
      { name: 'Kinh tế quốc tế', code: 'D01', score: 27.20, quota: 120, trend: 'tăng' },
      { name: 'Luật học', code: 'D01', score: 26.80, quota: 180, trend: 'giữ' },
      { name: 'Quản trị và kinh doanh', code: 'D01', score: 26.60, quota: 200, trend: 'giữ' }
    ]
  },
  'Đại học Khoa học Xã hội và Nhân văn - ĐHQGHN': {
    code: 'QHS',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Xã hội nhân văn',
    majors: [
      { name: 'Báo chí', code: 'D01', score: 26.75, quota: 180, trend: 'tăng' },
      { name: 'Truyền thông đa phương tiện', code: 'D01', score: 27.00, quota: 100, trend: 'tăng' },
      { name: 'Quan hệ công chúng', code: 'D01', score: 26.50, quota: 120, trend: 'giữ' },
      { name: 'Tâm lý học', code: 'D01', score: 26.80, quota: 150, trend: 'tăng' },
      { name: 'Xã hội học', code: 'C00', score: 25.50, quota: 100, trend: 'giữ' },
      { name: 'Ngôn ngữ Anh', code: 'D01', score: 27.25, quota: 200, trend: 'tăng' },
      { name: 'Đông phương học', code: 'D01', score: 26.00, quota: 120, trend: 'giữ' },
      { name: 'Du lịch', code: 'D15', score: 25.80, quota: 100, trend: 'giữ' }
    ]
  },
  'Học viện Ngoại giao': {
    code: 'HNG',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Ngoại giao',
    majors: [
      { name: 'Quan hệ quốc tế', code: 'D01', score: 27.85, quota: 200, trend: 'tăng' },
      { name: 'Kinh tế quốc tế', code: 'D01', score: 27.50, quota: 150, trend: 'tăng' },
      { name: 'Luật quốc tế', code: 'D14', score: 27.20, quota: 120, trend: 'tăng' },
      { name: 'Truyền thông quốc tế', code: 'D01', score: 26.95, quota: 80, trend: 'tăng' },
      { name: 'Ngôn ngữ Anh', code: 'D01', score: 27.30, quota: 100, trend: 'tăng' }
    ]
  },

  // ========== NHÓM TRƯỜNG KIẾN TRÚC - NGHỆ THUẬT ==========
  'Đại học Kiến trúc Hà Nội': {
    code: 'KTH',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Kiến trúc',
    majors: [
      { name: 'Kiến trúc', code: 'V00', score: 26.00, quota: 220, trend: 'tăng' },
      { name: 'Quy hoạch vùng và đô thị', code: 'V00', score: 24.50, quota: 110, trend: 'giữ' },
      { name: 'Thiết kế nội thất', code: 'H00', score: 25.00, quota: 170, trend: 'tăng' },
      { name: 'Thiết kế đồ họa', code: 'H01', score: 24.50, quota: 120, trend: 'giữ' },
      { name: 'Xây dựng', code: 'A00', score: 23.50, quota: 200, trend: 'giảm' }
    ]
  },
  'Đại học Mỹ thuật Việt Nam': {
    code: 'MTV',
    type: 'Công lập',
    location: 'Hà Nội',
    ranking: 'Top 1 Mỹ thuật',
    majors: [
      { name: 'Hội họa', code: 'H00', score: 23.50, quota: 80, trend: 'giữ' },
      { name: 'Đồ họa', code: 'H00', score: 23.00, quota: 60, trend: 'giữ' },
      { name: 'Điêu khắc', code: 'H00', score: 22.50, quota: 40, trend: 'giữ' },
      { name: 'Thiết kế thời trang', code: 'H00', score: 24.00, quota: 50, trend: 'tăng' }
    ]
  }
};

// ==================== NGÀNH NGHỀ & XU HƯỚNG THỊ TRƯỜNG ====================
const NGANH_NGHE = {
  'Công nghệ thông tin': {
    category: 'Công nghệ',
    demand: 'Rất cao',
    growthRate: '+25%/năm',
    avgSalary: {
      fresher: '10-15 triệu',
      junior: '15-25 triệu',
      middle: '25-40 triệu',
      senior: '40-70 triệu',
      leader: '70-150 triệu'
    },
    skills: ['Lập trình', 'Tư duy logic', 'Tiếng Anh', 'Làm việc nhóm'],
    jobs: [
      'Lập trình viên (Developer)',
      'Kỹ sư phần mềm (Software Engineer)',
      'Chuyên viên phân tích dữ liệu (Data Analyst)',
      'Quản trị hệ thống (System Admin)',
      'Tester/QA Engineer'
    ],
    outlook: 'Ngành hot nhất hiện nay với nhu cầu tuyển dụng liên tục tăng. Đặc biệt các vị trí về AI, Machine Learning, Cloud rất khan hiếm nhân lực.',
    topCompanies: ['FPT', 'Viettel', 'VNG', 'Vingroup', 'Google', 'Microsoft']
  },
  'Trí tuệ nhân tạo (AI)': {
    category: 'Công nghệ',
    demand: 'Cực cao',
    growthRate: '+40%/năm',
    avgSalary: {
      fresher: '15-25 triệu',
      junior: '25-40 triệu',
      middle: '40-70 triệu',
      senior: '70-120 triệu',
      leader: '120-200+ triệu'
    },
    skills: ['Python', 'Toán cao cấp', 'Machine Learning', 'Deep Learning', 'Tiếng Anh'],
    jobs: [
      'AI Engineer',
      'Machine Learning Engineer',
      'Data Scientist',
      'NLP Engineer',
      'Computer Vision Engineer'
    ],
    outlook: 'Ngành nghề tương lai với tiềm năng phát triển vô hạn. Việt Nam đang thiếu hụt nghiêm trọng nhân lực AI chất lượng cao.',
    topCompanies: ['VinAI', 'FPT AI', 'Zalo AI', 'OpenAI', 'Google DeepMind']
  },
  'Y khoa': {
    category: 'Y tế',
    demand: 'Cao',
    growthRate: '+8%/năm',
    avgSalary: {
      intern: '5-8 triệu',
      resident: '8-15 triệu',
      specialist: '20-50 triệu',
      senior: '50-100 triệu',
      professor: '100+ triệu'
    },
    skills: ['Kiến thức y học', 'Giao tiếp', 'Tâm lý', 'Tiếng Anh chuyên ngành'],
    jobs: [
      'Bác sĩ đa khoa',
      'Bác sĩ chuyên khoa',
      'Bác sĩ phẫu thuật',
      'Nghiên cứu y học',
      'Quản lý bệnh viện'
    ],
    outlook: 'Nghề nghiệp ổn định, được xã hội trọng vọng. Đầu tư thời gian học dài (6-12 năm) nhưng thu nhập và vị thế cao.',
    topCompanies: ['Vinmec', 'Bệnh viện Bạch Mai', 'Bệnh viện 108', 'FV Hospital']
  },
  'Tài chính - Ngân hàng': {
    category: 'Kinh tế',
    demand: 'Cao',
    growthRate: '+12%/năm',
    avgSalary: {
      fresher: '8-12 triệu',
      junior: '12-20 triệu',
      middle: '20-35 triệu',
      senior: '35-60 triệu',
      manager: '60-150 triệu'
    },
    skills: ['Phân tích tài chính', 'Excel', 'Tiếng Anh', 'Giao tiếp', 'Chịu áp lực'],
    jobs: [
      'Chuyên viên tín dụng',
      'Chuyên viên đầu tư',
      'Phân tích tài chính',
      'Quản lý quỹ',
      'Tư vấn tài chính'
    ],
    outlook: 'Ngành truyền thống với nền tảng vững chắc. Fintech đang tạo ra nhiều cơ hội mới cho người trẻ.',
    topCompanies: ['Vietcombank', 'BIDV', 'Techcombank', 'VPBank', 'MB Bank']
  },
  'Marketing - Truyền thông': {
    category: 'Kinh doanh',
    demand: 'Cao',
    growthRate: '+15%/năm',
    avgSalary: {
      fresher: '7-12 triệu',
      junior: '12-18 triệu',
      middle: '18-30 triệu',
      senior: '30-50 triệu',
      director: '50-100 triệu'
    },
    skills: ['Sáng tạo', 'Viết content', 'Digital Marketing', 'Phân tích dữ liệu', 'Tiếng Anh'],
    jobs: [
      'Digital Marketing',
      'Content Creator',
      'Brand Manager',
      'Social Media Specialist',
      'SEO/SEM Specialist'
    ],
    outlook: 'Digital Marketing và Social Media đang bùng nổ. Cơ hội làm việc với các thương hiệu lớn và startup.',
    topCompanies: ['VNG', 'Shopee', 'Lazada', 'Unilever', 'P&G', 'Vingroup']
  },
  'Luật': {
    category: 'Xã hội',
    demand: 'Trung bình',
    growthRate: '+6%/năm',
    avgSalary: {
      intern: '5-8 triệu',
      junior: '10-18 triệu',
      middle: '18-35 triệu',
      senior: '35-70 triệu',
      partner: '100+ triệu'
    },
    skills: ['Tư duy logic', 'Viết văn', 'Giao tiếp', 'Tiếng Anh pháp lý', 'Đàm phán'],
    jobs: [
      'Luật sư',
      'Công chứng viên',
      'Thẩm phán',
      'Chuyên viên pháp lý doanh nghiệp',
      'Tư vấn pháp luật'
    ],
    outlook: 'Nghề nghiệp uy tín, đặc biệt cần thiết khi hội nhập quốc tế. Luật sư doanh nghiệp và M&A có thu nhập cao.',
    topCompanies: ['VILAF', 'Baker McKenzie', 'Freshfields', 'Công ty luật nội địa']
  },
  'Thiết kế đồ họa': {
    category: 'Sáng tạo',
    demand: 'Cao',
    growthRate: '+18%/năm',
    avgSalary: {
      fresher: '6-10 triệu',
      junior: '10-16 triệu',
      middle: '16-28 triệu',
      senior: '28-50 triệu',
      art_director: '50-100 triệu'
    },
    skills: ['Adobe Creative Suite', 'UI/UX', 'Sáng tạo', 'Tư duy thẩm mỹ'],
    jobs: [
      'Graphic Designer',
      'UI/UX Designer',
      'Motion Designer',
      'Art Director',
      'Brand Designer'
    ],
    outlook: 'Nhu cầu tăng cao với sự phát triển của digital. UI/UX Designer đặc biệt hot trong ngành công nghệ.',
    topCompanies: ['VNG', 'Grab', 'Shopee', 'Agency lớn', 'Startup']
  },
  'Du lịch - Khách sạn': {
    category: 'Dịch vụ',
    demand: 'Cao',
    growthRate: '+20%/năm (sau COVID)',
    avgSalary: {
      fresher: '6-9 triệu',
      junior: '9-15 triệu',
      middle: '15-25 triệu',
      senior: '25-45 triệu',
      gm: '50-100 triệu'
    },
    skills: ['Tiếng Anh', 'Giao tiếp', 'Xử lý tình huống', 'Ngoại ngữ khác'],
    jobs: [
      'Hướng dẫn viên du lịch',
      'Quản lý khách sạn',
      'Event Planner',
      'Tour Operator',
      'F&B Manager'
    ],
    outlook: 'Ngành phục hồi mạnh sau COVID. Việt Nam là điểm đến hấp dẫn với du khách quốc tế.',
    topCompanies: ['Vinpearl', 'Sun Group', 'Marriott', 'Accor', 'Saigontourist']
  }
};

// ==================== XU HƯỚNG THỊ TRƯỜNG LAO ĐỘNG 2025-2030 ====================
const XU_HUONG_LAO_DONG = {
  topDemand: [
    {
      field: 'Trí tuệ nhân tạo & Machine Learning',
      growth: '+45%',
      reason: 'ChatGPT và Generative AI bùng nổ, chuyển đổi số toàn diện',
      hotJobs: ['AI Engineer', 'Prompt Engineer', 'MLOps Engineer', 'AI Product Manager', 'AI Ethics Specialist'],
      salary: '30-150 triệu/tháng'
    },
    {
      field: 'An ninh mạng (Cybersecurity)',
      growth: '+35%',
      reason: 'Tấn công mạng tăng mạnh, Luật An ninh mạng siết chặt',
      hotJobs: ['Security Engineer', 'Penetration Tester', 'SOC Analyst', 'Cloud Security', 'CISO'],
      salary: '25-100 triệu/tháng'
    },
    {
      field: 'Khoa học dữ liệu & Analytics',
      growth: '+40%',
      reason: 'Mọi doanh nghiệp cần data-driven decision',
      hotJobs: ['Data Scientist', 'Data Engineer', 'Analytics Manager', 'Business Intelligence'],
      salary: '25-80 triệu/tháng'
    },
    {
      field: 'Y tế & Công nghệ y tế',
      growth: '+20%',
      reason: 'Dân số già hóa, nhu cầu chăm sóc sức khỏe + Telemedicine',
      hotJobs: ['Bác sĩ AI', 'Health Tech Developer', 'Chuyên viên dinh dưỡng', 'Y tá quốc tế'],
      salary: '15-100 triệu/tháng'
    },
    {
      field: 'Năng lượng tái tạo & ESG',
      growth: '+30%',
      reason: 'Cam kết Net Zero 2050, FDI xanh tăng mạnh',
      hotJobs: ['ESG Specialist', 'Kỹ sư năng lượng mặt trời', 'Carbon Analyst', 'Sustainability Manager'],
      salary: '20-70 triệu/tháng'
    },
    {
      field: 'Fintech & Digital Banking',
      growth: '+35%',
      reason: 'Số hóa tài chính, thanh toán không tiền mặt, crypto',
      hotJobs: ['Blockchain Developer', 'Risk Analyst', 'Product Manager Fintech', 'Compliance Officer'],
      salary: '25-100 triệu/tháng'
    },
    {
      field: 'E-commerce & Logistics',
      growth: '+25%',
      reason: 'Thương mại điện tử tiếp tục tăng, xuất khẩu qua sàn',
      hotJobs: ['E-commerce Manager', 'Supply Chain Analyst', 'Last-mile Delivery Tech', 'Marketplace Specialist'],
      salary: '15-50 triệu/tháng'
    },
    {
      field: 'Chip & Semiconductor',
      growth: '+50%',
      reason: 'Việt Nam thành hub sản xuất chip, NVIDIA, Intel đầu tư',
      hotJobs: ['IC Design Engineer', 'Verification Engineer', 'Process Engineer', 'Embedded Developer'],
      salary: '30-120 triệu/tháng'
    }
  ],
  
  emergingSkills2025: [
    {
      skill: 'AI & Prompt Engineering',
      importance: 'Cực kỳ quan trọng',
      reason: 'Biết sử dụng AI tool hiệu quả là kỹ năng bắt buộc mọi ngành'
    },
    {
      skill: 'Cloud Computing (AWS/Azure/GCP)',
      importance: 'Rất quan trọng',
      reason: '90% doanh nghiệp chuyển lên cloud'
    },
    {
      skill: 'Low-code/No-code Development',
      importance: 'Quan trọng',
      reason: 'Tự động hóa quy trình, citizen developer tăng'
    },
    {
      skill: 'Cybersecurity Basics',
      importance: 'Quan trọng',
      reason: 'Mọi nhân viên cần hiểu biết an ninh mạng cơ bản'
    },
    {
      skill: 'Data Literacy',
      importance: 'Quan trọng',
      reason: 'Đọc hiểu và phân tích dữ liệu là kỹ năng nền tảng'
    },
    {
      skill: 'Tiếng Anh + 1 ngoại ngữ',
      importance: 'Rất quan trọng',
      reason: 'Hội nhập quốc tế, remote work toàn cầu'
    },
    {
      skill: 'Green Skills & ESG Knowledge',
      importance: 'Đang tăng',
      reason: 'Doanh nghiệp cần nhân sự hiểu về phát triển bền vững'
    },
    {
      skill: 'Critical Thinking & Problem Solving',
      importance: 'Cực kỳ quan trọng',
      reason: 'AI làm được nhiều việc, con người cần tư duy phản biện'
    }
  ],
  
  decliningFields: [
    {
      field: 'Nhân viên nhập liệu thủ công',
      reason: 'AI và RPA tự động hóa hoàn toàn',
      timeline: '2025-2027'
    },
    {
      field: 'Kế toán viên cơ bản',
      reason: 'Phần mềm AI kế toán thay thế công việc routine',
      timeline: '2026-2028'
    },
    {
      field: 'Giao dịch viên ngân hàng',
      reason: 'Mobile banking, chatbot AI, ATM thông minh',
      timeline: '2025-2027'
    },
    {
      field: 'Biên/Phiên dịch văn bản đơn giản',
      reason: 'AI dịch thuật đạt chất lượng cao (GPT-4, Google Translate)',
      timeline: '2025-2026'
    },
    {
      field: 'Tư vấn bán hàng cơ bản',
      reason: 'Chatbot AI, recommendation engine thay thế',
      timeline: '2026-2028'
    },
    {
      field: 'Thiết kế đồ họa cơ bản',
      reason: 'AI generative (Midjourney, DALL-E) làm nhanh hơn',
      timeline: '2025-2027'
    }
  ],
  
  salaryTrend2025: {
    tech_ai: { range: '30-150 triệu', trend: 'Tăng 20-30%/năm' },
    tech_general: { range: '15-60 triệu', trend: 'Tăng 15-20%/năm' },
    healthcare: { range: '15-100 triệu', trend: 'Tăng 10-15%/năm' },
    finance: { range: '12-80 triệu', trend: 'Tăng 12-18%/năm' },
    marketing_digital: { range: '10-50 triệu', trend: 'Tăng 10-15%/năm' },
    manufacturing: { range: '8-30 triệu', trend: 'Tăng 5-8%/năm' },
    education: { range: '8-30 triệu', trend: 'Tăng 8-12%/năm' },
    service: { range: '7-25 triệu', trend: 'Tăng 6-10%/năm' }
  },
  
  advice2025: [
    '🤖 Học cách sử dụng AI tools (ChatGPT, Copilot, Midjourney) - đây là kỹ năng BẮT BUỘC',
    '💻 Dù làm ngành gì, cũng nên biết cơ bản về lập trình/no-code',
    '🌍 Tiếng Anh IELTS 6.5+ mở ra cơ hội việc làm quốc tế, lương cao gấp 2-3 lần',
    '📊 Data literacy - biết đọc và phân tích dữ liệu là lợi thế lớn',
    '🔐 Hiểu biết cơ bản về cybersecurity để bảo vệ bản thân và công ty',
    '🌱 Tìm hiểu về ESG, phát triển bền vững - xu hướng tuyển dụng mới',
    '🧠 Phát triển Critical Thinking - điều AI không thể thay thế',
    '💼 Thực tập từ năm 2-3 đại học, xây dựng portfolio/GitHub',
    '🔗 Xây dựng personal brand trên LinkedIn, network sớm',
    '📚 Học suốt đời - kiến thức lỗi thời sau 3-5 năm trong thời đại AI'
  ],
  
  gdpt2018Impact: {
    description: 'Chương trình GDPT 2018 tạo ra những thay đổi lớn cho thế hệ học sinh 2025+',
    changes: [
      {
        aspect: 'Khối thi mới có Tin học',
        impact: 'A12, A13, D96... phù hợp với ngành CNTT, AI - ngành hot nhất hiện nay',
        advantage: 'Học sinh giỏi Tin có thêm nhiều lựa chọn xét tuyển'
      },
      {
        aspect: 'Khối thi có GDKT&PL',
        impact: 'C14, C15, D66, D84... phù hợp ngành Luật, Kinh tế, Quản lý',
        advantage: 'Học sinh khối C, D có thêm môn lựa chọn thực tế'
      },
      {
        aspect: 'Khối thi có Công nghệ',
        impact: 'T00, T01, T02... phù hợp ngành Kỹ thuật, Robotics, IoT',
        advantage: 'Học sinh yêu thích thực hành có thêm cơ hội'
      },
      {
        aspect: 'Tự chọn môn linh hoạt',
        impact: 'Có thể tổ hợp môn theo thế mạnh cá nhân',
        advantage: 'Phù hợp xu hướng cá nhân hóa giáo dục'
      }
    ],
    recommendation: 'Học sinh nên chọn tổ hợp có Tin học hoặc Tiếng Anh để có lợi thế trong tương lai AI'
  }
};

// ==================== BÀI TEST TÍNH CÁCH NGHỀ NGHIỆP (HOLLAND) ====================
const HOLLAND_TEST = {
  description: 'Trắc nghiệm Holland giúp xác định xu hướng nghề nghiệp phù hợp với tính cách',
  types: {
    R: {
      name: 'Realistic (Thực tế)',
      traits: ['Thích làm việc với máy móc, công cụ', 'Ưa hoạt động ngoài trời', 'Thực tế, ít nói'],
      careers: ['Kỹ sư', 'Kiến trúc sư', 'Thợ điện', 'Nông nghiệp', 'Thể thao']
    },
    I: {
      name: 'Investigative (Nghiên cứu)',
      traits: ['Thích phân tích, tìm hiểu', 'Tư duy logic mạnh', 'Độc lập, tò mò'],
      careers: ['Nhà khoa học', 'Bác sĩ', 'Lập trình viên', 'Nghiên cứu sinh', 'Phân tích dữ liệu']
    },
    A: {
      name: 'Artistic (Nghệ thuật)',
      traits: ['Sáng tạo, giàu tưởng tượng', 'Yêu nghệ thuật', 'Cảm xúc phong phú'],
      careers: ['Họa sĩ', 'Nhà thiết kế', 'Nhạc sĩ', 'Nhà văn', 'Diễn viên']
    },
    S: {
      name: 'Social (Xã hội)',
      traits: ['Thích giúp đỡ người khác', 'Giao tiếp tốt', 'Kiên nhẫn, đồng cảm'],
      careers: ['Giáo viên', 'Y tá', 'Tư vấn viên', 'Nhân sự', 'Công tác xã hội']
    },
    E: {
      name: 'Enterprising (Doanh nhân)',
      traits: ['Thích lãnh đạo, thuyết phục', 'Tự tin, năng động', 'Mạo hiểm, tham vọng'],
      careers: ['Doanh nhân', 'Quản lý', 'Sales', 'Luật sư', 'Chính trị gia']
    },
    C: {
      name: 'Conventional (Quy củ)',
      traits: ['Cẩn thận, tỉ mỉ', 'Thích công việc có tổ chức', 'Đáng tin cậy'],
      careers: ['Kế toán', 'Thư ký', 'Ngân hàng', 'Hành chính', 'Kiểm toán']
    }
  },
  questions: [
    { id: 1, text: 'Bạn thích sửa chữa đồ vật hơn là nói chuyện với người khác?', type: 'R' },
    { id: 2, text: 'Bạn thích giải các bài toán khó và câu đố logic?', type: 'I' },
    { id: 3, text: 'Bạn thường xuyên vẽ, viết hoặc chơi nhạc?', type: 'A' },
    { id: 4, text: 'Bạn thích giúp đỡ và lắng nghe vấn đề của người khác?', type: 'S' },
    { id: 5, text: 'Bạn thích thuyết phục và dẫn dắt mọi người?', type: 'E' },
    { id: 6, text: 'Bạn thích công việc có quy trình rõ ràng, chi tiết?', type: 'C' },
    { id: 7, text: 'Bạn thích làm việc ngoài trời hơn trong văn phòng?', type: 'R' },
    { id: 8, text: 'Bạn thích đọc sách khoa học và nghiên cứu?', type: 'I' },
    { id: 9, text: 'Bạn thích diễn xuất hoặc biểu diễn trước đám đông?', type: 'A' },
    { id: 10, text: 'Bạn thích làm việc nhóm hơn làm việc một mình?', type: 'S' },
    { id: 11, text: 'Bạn muốn tự kinh doanh trong tương lai?', type: 'E' },
    { id: 12, text: 'Bạn thích sắp xếp, tổ chức mọi thứ gọn gàng?', type: 'C' },
    { id: 13, text: 'Bạn thích thể thao và các hoạt động thể chất?', type: 'R' },
    { id: 14, text: 'Bạn thích phân tích dữ liệu và số liệu?', type: 'I' },
    { id: 15, text: 'Bạn có óc thẩm mỹ và quan tâm đến thiết kế?', type: 'A' },
    { id: 16, text: 'Bạn thích dạy học hoặc hướng dẫn người khác?', type: 'S' },
    { id: 17, text: 'Bạn thích đàm phán và thương lượng?', type: 'E' },
    { id: 18, text: 'Bạn thích làm việc với giấy tờ, hồ sơ?', type: 'C' }
  ]
};

module.exports = {
  KHOI_THI,
  DIEM_CHUAN_2025,
  NGANH_NGHE,
  XU_HUONG_LAO_DONG,
  HOLLAND_TEST
};
