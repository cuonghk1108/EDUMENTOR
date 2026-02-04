/**
 * Firebase Initialization Script for EDUMENTOR
 * Run this script once to set up initial data in Firestore
 * 
 * Usage: node scripts/initFirebase.js
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample data
const sampleUsers = [
  {
    id: 'demo-user-001',
    email: 'demo@edumentor.io.vn',
    password: 'Demo@123',
    name: 'Nguyễn Văn An',
    grade: 'Lớp 12',
    school: 'THPT Chuyên Khoa học Tự nhiên',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'demo-user-002',
    email: 'hocsinh@edumentor.io.vn',
    password: 'HocSinh@123',
    name: 'Trần Thị Bình',
    grade: 'Lớp 11',
    school: 'THPT Kim Liên',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleLessons = [
  {
    id: 'lesson-demo-001',
    userId: 'demo-user-001',
    title: 'Giới hạn của hàm số',
    subject: 'Toán học',
    grade: 'Lớp 12',
    content: {
      summary: `# Giới hạn của hàm số

## 1. Định nghĩa giới hạn
Giới hạn của hàm số f(x) khi x tiến tới a, ký hiệu lim(x→a) f(x) = L, nếu với mọi ε > 0, tồn tại δ > 0 sao cho |f(x) - L| < ε khi 0 < |x - a| < δ.

## 2. Các dạng giới hạn cơ bản
- Giới hạn hữu hạn tại một điểm
- Giới hạn vô cực
- Giới hạn tại vô cực

## 3. Các quy tắc tính giới hạn
- Quy tắc cộng, trừ, nhân, chia
- Quy tắc L'Hospital cho dạng vô định

## 4. Ví dụ minh họa
Tính lim(x→2) (x² - 4)/(x - 2) = lim(x→2) (x + 2) = 4`,
      keyPoints: [
        'Hiểu định nghĩa giới hạn theo ε-δ',
        'Nhận biết các dạng vô định 0/0, ∞/∞',
        'Áp dụng quy tắc L\'Hospital',
        'Tính giới hạn của các hàm đa thức và phân thức'
      ],
      examples: [
        {
          problem: 'Tính lim(x→0) sin(x)/x',
          solution: 'Sử dụng giới hạn cơ bản: lim(x→0) sin(x)/x = 1'
        },
        {
          problem: 'Tính lim(x→∞) (3x² + 2x)/(x² - 1)',
          solution: 'Chia cả tử và mẫu cho x²: lim = 3/1 = 3'
        }
      ]
    },
    sourceText: 'Sách giáo khoa Toán 12 - Chương 4',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'lesson-demo-002',
    userId: 'demo-user-001',
    title: 'Dao động điều hòa',
    subject: 'Vật lý',
    grade: 'Lớp 12',
    content: {
      summary: `# Dao động điều hòa

## 1. Định nghĩa
Dao động điều hòa là dao động trong đó li độ của vật là một hàm cosin (hay sin) của thời gian.

## 2. Phương trình dao động
x = A.cos(ωt + φ)

Trong đó:
- A: Biên độ (m)
- ω: Tần số góc (rad/s)
- φ: Pha ban đầu (rad)
- (ωt + φ): Pha của dao động

## 3. Các đại lượng đặc trưng
- Chu kỳ: T = 2π/ω
- Tần số: f = 1/T = ω/2π
- Vận tốc: v = -Aω.sin(ωt + φ)
- Gia tốc: a = -ω²x`,
      keyPoints: [
        'Nhận biết phương trình dao động điều hòa',
        'Xác định các đại lượng A, ω, φ từ phương trình',
        'Tính toán chu kỳ, tần số, vận tốc, gia tốc',
        'Vẽ đồ thị dao động'
      ],
      examples: [
        {
          problem: 'Một vật dao động điều hòa với phương trình x = 4cos(2πt + π/3) cm. Tính biên độ, chu kỳ và pha ban đầu.',
          solution: 'A = 4cm, ω = 2π rad/s → T = 2π/2π = 1s, φ = π/3 rad'
        }
      ]
    },
    sourceText: 'Sách giáo khoa Vật lý 12 - Chương 1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleQuizzes = [
  {
    id: 'quiz-demo-001',
    userId: 'demo-user-001',
    lessonId: 'lesson-demo-001',
    title: 'Kiểm tra: Giới hạn của hàm số',
    subject: 'Toán học',
    questions: [
      {
        id: 1,
        question: 'Tính lim(x→2) (x² - 4)/(x - 2)',
        options: ['2', '4', '0', 'Không tồn tại'],
        correctAnswer: 1,
        explanation: 'x² - 4 = (x-2)(x+2), nên (x² - 4)/(x - 2) = x + 2. Khi x → 2, ta có lim = 4'
      },
      {
        id: 2,
        question: 'lim(x→0) sin(x)/x bằng bao nhiêu?',
        options: ['0', '1', '∞', 'Không xác định'],
        correctAnswer: 1,
        explanation: 'Đây là giới hạn cơ bản quan trọng: lim(x→0) sin(x)/x = 1'
      },
      {
        id: 3,
        question: 'Dạng vô định nào KHÔNG thể áp dụng quy tắc L\'Hospital?',
        options: ['0/0', '∞/∞', '0.∞', '1^∞'],
        correctAnswer: 3,
        explanation: 'Quy tắc L\'Hospital chỉ áp dụng trực tiếp cho dạng 0/0 và ∞/∞. Dạng 1^∞ cần biến đổi trước'
      }
    ],
    totalQuestions: 3,
    createdAt: new Date()
  }
];

const sampleChatHistory = [
  {
    id: 'chat-demo-001',
    lessonId: 'lesson-demo-001',
    userId: 'demo-user-001',
    message: 'Làm sao để nhận biết dạng vô định 0/0?',
    response: 'Để nhận biết dạng vô định 0/0, em cần thay trực tiếp giá trị x → a vào cả tử và mẫu. Nếu:\n\n1. **Tử số → 0** khi x → a\n2. **Mẫu số → 0** khi x → a\n\nThì đây là dạng vô định 0/0.\n\n**Ví dụ:** lim(x→2) (x² - 4)/(x - 2)\n- Thay x = 2 vào tử: 2² - 4 = 0\n- Thay x = 2 vào mẫu: 2 - 2 = 0\n→ Đây là dạng 0/0\n\n**Cách xử lý:** Phân tích nhân tử để khử dạng vô định.',
    timestamp: new Date()
  }
];

const sampleLearningStats = [
  {
    id: 'stats-demo-001',
    lessonId: 'lesson-demo-001',
    quizId: 'quiz-demo-001',
    userId: 'demo-user-001',
    subject: 'Toán học',
    score: 85,
    totalQuestions: 3,
    correctAnswers: 2,
    answers: [
      { questionId: 1, selectedAnswer: 1, isCorrect: true },
      { questionId: 2, selectedAnswer: 1, isCorrect: true },
      { questionId: 3, selectedAnswer: 2, isCorrect: false }
    ],
    timeSpent: 300,
    completedAt: new Date()
  }
];

async function initializeFirebase() {
  console.log('🚀 Starting Firebase initialization...\n');

  try {
    // Create users
    console.log('📝 Creating sample users...');
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.collection('users').doc(user.id).set({
        ...user,
        password: hashedPassword
      });
      console.log(`   ✓ Created user: ${user.email}`);
    }

    // Create lessons
    console.log('\n📚 Creating sample lessons...');
    for (const lesson of sampleLessons) {
      await db.collection('lessons').doc(lesson.id).set(lesson);
      console.log(`   ✓ Created lesson: ${lesson.title}`);
    }

    // Create quizzes
    console.log('\n📝 Creating sample quizzes...');
    for (const quiz of sampleQuizzes) {
      await db.collection('quizzes').doc(quiz.id).set(quiz);
      console.log(`   ✓ Created quiz: ${quiz.title}`);
    }

    // Create chat history
    console.log('\n💬 Creating sample chat history...');
    for (const chat of sampleChatHistory) {
      await db.collection('chat_history').doc(chat.id).set(chat);
      console.log(`   ✓ Created chat message`);
    }

    // Create learning stats
    console.log('\n📊 Creating sample learning stats...');
    for (const stats of sampleLearningStats) {
      await db.collection('learning_stats').doc(stats.id).set(stats);
      console.log(`   ✓ Created learning stats`);
    }

    console.log('\n✅ Firebase initialization completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('   Email: demo@edumentor.vn | Password: Demo@123');
    console.log('   Email: hocsinh@edumentor.vn | Password: HocSinh@123');

  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    process.exit(1);
  }

  process.exit(0);
}

initializeFirebase();
