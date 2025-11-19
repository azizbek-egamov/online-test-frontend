// Static test data - can be loaded from JSON files in production

export interface TestQuestion {
  id: string
  text: string
  options: Array<{
    key: "A" | "B" | "C" | "D"
    text: string
  }>
  correct: "A" | "B" | "C" | "D"
  explanation: string
}

export interface TestContent {
  id: string
  title: string
  description: string
  text: string
  duration: number
  questions: TestQuestion[]
}

export const testData: TestContent[] = [
  {
    id: "test_001",
    title: "Kambag'alning donoligi",
    description: "Matnni o'qing va savollarni javoblab chiqing",
    duration: 15,
    text: `Bir boy har kuni kambag'al qoʻshnisini masxara qilar edi. Kambag'al odam doimo sabr qilar edi. Bir kun boy odam kambag'al qoʻshnisiga: "Meni ayit, seni nima unchalik behis qilgan?" deb so'radi.

Kambag'al odam joyda turdi va unga dedi: "Mening behisligim bizning oʻrtamizda tushunlik emas. Siz boy bo'lsangiz ham, meni g'ussalab qiʻlasiz. Men ko'pi bora har nimaga maslahat beradigan odam sifatida o'ylagandim. Lekin men ancha yosh va kambag'alman. Shuning uchun siz meni haqida nima o'ylasangiz ham, men sizni yaxshi odamlar qatoriga qo'yaman."

Boy odam uning so'zlarini eshitib, uning devonligini tushundi. Kambag'al odam haqida uning fikri o'zgarib ketdi. Andan keyin boy odam kambag'al qoʻshnisiga yordam berdi va ular do'stlar bo'lib qoldilar.`,
    questions: [
      {
        id: "q1",
        text: "Boy odam kambag'al qoʻshnisiga nima uchun masxara qilar edi?",
        options: [
          { key: "A", text: "Chunki kambag'al odam xalaqchisi edi" },
          { key: "B", text: "Chunki kambag'al odam donoligi boy odam xushisiga kelmas edi" },
          { key: "C", text: "Chunki kambag'al odam boy odam ga pul bor edi" },
          { key: "D", text: "Chunki kambag'al odam o'ziga nisbatan boy odam fikrini qilmas edi" },
        ],
        correct: "B",
        explanation: "Matndan ko'rinib turadi, boy odam kambag'al qoʻshnisining donoligi va sabriga hali berilmagan.",
      },
      {
        id: "q2",
        text: "Kambag'al odam boy odam ga nima deb aytdi?",
        options: [
          { key: "A", text: "Menga pul ber" },
          { key: "B", text: "Men maslahat beradigan odam bo'lishni istayman" },
          {
            key: "C",
            text: "Men yosh va kambag'alman, shuning uchun siz meni yaxshi odamlar qatoriga qo'yashingiz kerak",
          },
          { key: "D", text: "Meni qoshni qilishni istamaysiz" },
        ],
        correct: "C",
        explanation: "Kambag'al odam boy odam ga o'z devonligini va yoshligini aytdi.",
      },
      {
        id: "q3",
        text: "Hikoyat qanday tugadi?",
        options: [
          { key: "A", text: "Boy odam va kambag'al odam jang qildilar" },
          { key: "B", text: "Boy odam kambag'al odam ga pul berdi" },
          { key: "C", text: "Boy odam uning so'zlarini tushundi va ular do'stlar bo'lib qoldilar" },
          { key: "D", text: "Kambag'al odam shahardan ketib chiqdi" },
        ],
        correct: "C",
        explanation:
          "Matnning oxirida aytilishicha, boy odam uning so'zlarini eshitib, uning devonligini tushundi va ular do'stlar bo'lib qoldilar.",
      },
      {
        id: "q4",
        text: "Kambag'al odam qanday xislatga ega edi?",
        options: [
          { key: "A", text: "Sabr va devonlik" },
          { key: "B", text: "Faqat boy" },
          { key: "C", text: "Faqat kambag'al" },
          { key: "D", text: "Faqat masxara" },
        ],
        correct: "A",
        explanation: "Matnda ko'rsatilgan, kambag'al odam doimo sabr qilar edi va devona edi.",
      },
    ],
  },
  {
    id: "test_002",
    title: "Kitoblar va Bilim",
    description: "Kitoblarning ahamiyati haqida o'qing va javob bering",
    duration: 12,
    text: `Kitoblar insoniyatning eng qimmatli boyligidir. Ular o'z ichida turli xil bilim, tajriba va hikmatni saqlaydi. Kitoblarni o'qish orqali biz boshqa odamlarning hayoti, fikrlari va eʻtiqodlari bilan tanishamiz.

Kitoblarni o'qish tamomedullohmi? Yo'q. Kitoblarni o'qish - bu aql-idrok rivojlanishining eng yaxshi usuli. Har bir kitob bizga yangi narsalarni o'rgatadi. Biron kitobdan xolis chiqan odam o'sha kitobning muallifi bilan suhbatga tushibtdi, deyish mumkin.

Shuning uchun har bir odam, ayniqsa yoshlar, kuniga kamida yarim soat kitob o'qishga amal qilishlari kerak. Kitoblar orqali biz dunyoning har bir butkasini o'rganishimiz mumkin. Kitoblar - bu eng yaxshi do'stlar.`,
    questions: [
      {
        id: "q1",
        text: "Kitoblar nima saqleydi?",
        options: [
          { key: "A", text: "Faqat o'yin va kulgak" },
          { key: "B", text: "Bilim, tajriba va hikmat" },
          { key: "C", text: "Faqat qo'shiqlar" },
          { key: "D", text: "Faqat ertaklar" },
        ],
        correct: "B",
        explanation: "Matn boshlangichida aytilishicha, kitoblar bilim, tajriba va hikmatni saqlaydi.",
      },
      {
        id: "q2",
        text: "Kitob o'qish qanday qo'llanilishi mumkin?",
        options: [
          { key: "A", text: "Vaqt o'tkazish uchun" },
          { key: "B", text: "Aql-idrok rivojlanishining eng yaxshi usuli sifatida" },
          { key: "C", text: "Faqat o'yinchoq sifatida" },
          { key: "D", text: "Hech nimaga foyda qilmaydi" },
        ],
        correct: "B",
        explanation: "Matnda kitobni o'qish aql-idrok rivojlanishining eng yaxshi usuli deyilgan.",
      },
      {
        id: "q3",
        text: "Yoshlar kuniga qancha kitob o'qishlari kerak?",
        options: [
          { key: "A", text: "Bugun kitob" },
          { key: "B", text: "Bir soat" },
          { key: "C", text: "Yarim soat" },
          { key: "D", text: "Shutkasiga o'qish shart emas" },
        ],
        correct: "C",
        explanation: "Matnda yoshlar kuniga kamida yarim soat kitob o'qishga amal qilishlari kerak, deyilgan.",
      },
      {
        id: "q4",
        text: "Matn oxirida kitoblar haqida nima aytiladi?",
        options: [
          { key: "A", text: "Kitoblar - bu eng yomon do'stlar" },
          { key: "B", text: "Kitoblar - bu eng yaxshi do'stlar" },
          { key: "C", text: "Kitoblar - bu qandaydir narsa" },
          { key: "D", text: "Kitoblar haqida hech narsa aytilmadi" },
        ],
        correct: "B",
        explanation: "Matnning oxirida 'Kitoblar - bu eng yaxshi do'stlar' deyilgan.",
      },
    ],
  },
]
