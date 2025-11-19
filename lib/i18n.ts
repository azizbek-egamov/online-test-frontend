// Uzbek localization strings
export const uz = {
  // Navigation & Header
  logo: "O'qish Testi",
  logout: "Chiqish",
  myTests: "Mening testlarim",
  profile: "Profil",

  // Landing Page
  welcome: "Salom! O'qishni sinashga tayyormi?",
  welcomeDesc:
    "Ushbu platformada siz turli mavzular bo'yicha testlarni bajarish va o'qish ko'nikmalarini oshirish imkoniyatiga ega bo'lasiz.",
  login: "Kirish",
  signup: "Ro'yxatdan o'tish",

  // Auth
  name: "Ismingiz",
  email: "Elektron pochta",
  password: "Parol",
  confirmPassword: "Parolni tasdiqlang",
  signupBtn: "Ro'yxatdan o'tish",
  loginBtn: "Kirish",
  signupSuccess: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
  loginSuccess: "Muvaffaqiyatli kirgansiz!",
  errorInvalidEmail: "Email noto'g'ri",
  errorPasswordMismatch: "Parollar mos kelmadi",
  errorEmptyFields: "Barcha maydonlarni to'ldiring",
  errorUserExists: "Bu email allaqachon ro'yxatdan o'tgan",

  // Dashboard
  availableTests: "Mavjud testlar",
  noTests: "Hozircha testlar mavjud emas",
  duration: "Vaqti",
  start: "Boshlash",
  minutes: "daqiqa",

  // Test Reading
  read: "O'qib ber",
  readText: "Matnni ovozli o'qish",
  pause: "Pauza",
  stop: "To'xtat",
  largeText: "Katta shrift",

  // Test Questions
  question: "Savol",
  of: "/",
  markAnswers: "Barcha savollarni belgilang",
  allAnswered: "Barcha savollar javoblanagan",
  previous: "Oldingi",
  next: "Keyingi",
  submit: "Tekshirish",
  answered: "Javoblanagan",
  notAnswered: "Javoblanmagan",

  // Results
  yourScore: "Sizning natijangiz",
  correct: "To'g'ri",
  incorrect: "Xato",
  percentage: "%",
  review: "Ko'rib chiqish",
  reviewQuestion: "Savol",
  yourAnswer: "Sizning javobingiz",
  correctAnswer: "To'g'ri javob",
  explanation: "Izoh",
  retake: "Yana bir bor bajarish",
  backHome: "Bosh sahifaga qaytish",

  // History/Profile
  testHistory: "Test tarixi",
  date: "Sana",
  score: "Natija",
  view: "Ko'rish",
  noHistory: "Siz hali testlarni bajarmagansiz",

  // Messages
  confirmLeave: "Test bajarishni to'xtatmoqchimisiz?",
  unsavedChanges: "Belgilangan o'zgarishlar saqlanmadi",
  yes: "Ha",
  no: "Yo'q",
} as const

export const en = {
  // Navigation & Header
  logo: "Reading Test",
  logout: "Logout",
  myTests: "My Tests",
  profile: "Profile",

  // Landing Page
  welcome: "Welcome! Ready to take a test?",
  welcomeDesc: "Take various reading tests to improve your reading skills.",
  login: "Login",
  signup: "Sign Up",

  // Auth
  name: "Name",
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm Password",
  signupBtn: "Sign Up",
  loginBtn: "Login",
  signupSuccess: "Signed up successfully!",
  loginSuccess: "Logged in successfully!",
  errorInvalidEmail: "Invalid email",
  errorPasswordMismatch: "Passwords do not match",
  errorEmptyFields: "Please fill in all fields",
  errorUserExists: "User already exists",

  // Dashboard
  availableTests: "Available Tests",
  noTests: "No tests available",
  duration: "Duration",
  start: "Start",
  minutes: "minutes",

  // Test Reading
  read: "Read Aloud",
  readText: "Read text with voice",
  pause: "Pause",
  stop: "Stop",
  largeText: "Large Text",

  // Test Questions
  question: "Question",
  of: "/",
  markAnswers: "Please answer all questions",
  allAnswered: "All questions answered",
  previous: "Previous",
  next: "Next",
  submit: "Submit",
  answered: "Answered",
  notAnswered: "Not Answered",

  // Results
  yourScore: "Your Score",
  correct: "Correct",
  incorrect: "Incorrect",
  percentage: "%",
  review: "Review",
  reviewQuestion: "Question",
  yourAnswer: "Your Answer",
  correctAnswer: "Correct Answer",
  explanation: "Explanation",
  retake: "Retake Test",
  backHome: "Back to Home",

  // History/Profile
  testHistory: "Test History",
  date: "Date",
  score: "Score",
  view: "View",
  noHistory: "You haven't taken any tests yet",

  // Messages
  confirmLeave: "Are you sure you want to leave this test?",
  unsavedChanges: "You have unsaved changes",
  yes: "Yes",
  no: "No",
} as const

export type TranslationKey = keyof typeof uz
