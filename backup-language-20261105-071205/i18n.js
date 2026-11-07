/**
 * MathSolveIQ Universal Client-Side Localization & Translation Engine v2
 * Languages: English, Urdu, Hindi, Roman Urdu, Turkish, Spanish, Arabic,
 *            French, German, Portuguese, Bengali, Punjabi, Chinese (Simplified)
 */
(function () {
  "use strict";

  // ─── 1. Language Definitions ────────────────────────────────────────────────
  var LANGUAGES = {
    en: { name: "English",            native: "English",    dir: "ltr", google: "en"    },
    ur: { name: "Urdu",               native: "اردو",       dir: "rtl", google: "ur"    },
    hi: { name: "Hindi",              native: "हिन्दी",    dir: "ltr", google: "hi"    },
    ro: { name: "Roman Urdu",         native: "Roman Urdu", dir: "ltr", google: null    },
    tr: { name: "Turkish",            native: "Türkçe",     dir: "ltr", google: "tr"    },
    es: { name: "Spanish",            native: "Español",    dir: "ltr", google: "es"    },
    ar: { name: "Arabic",             native: "العربية",    dir: "rtl", google: "ar"    },
    fr: { name: "French",             native: "Français",   dir: "ltr", google: "fr"    },
    de: { name: "German",             native: "Deutsch",    dir: "ltr", google: "de"    },
    pt: { name: "Portuguese",         native: "Português",  dir: "ltr", google: "pt"    },
    bn: { name: "Bengali",            native: "বাংলা",      dir: "ltr", google: "bn"    },
    pa: { name: "Punjabi",            native: "ਪੰਜਾਬੀ",    dir: "ltr", google: "pa"    },
    zh: { name: "Chinese (Simplified)",native: "中文",       dir: "ltr", google: "zh-CN" }
  };

  // ─── 2. Dictionary ──────────────────────────────────────────────────────────
  var DICTIONARY = {
    "Home": {
      ur:"ہوم", hi:"होम", ro:"Home", tr:"Ana Sayfa", es:"Inicio",
      ar:"الرئيسية", fr:"Accueil", de:"Startseite", pt:"Início",
      bn:"হোম", pa:"ਹੋਮ", zh:"主页"
    },
    "Calculators": {
      ur:"کیلکولیٹرز", hi:"कैलकुलेटर", ro:"Calculators", tr:"Hesap Makineleri",
      es:"Calculadoras", ar:"الحاسبات", fr:"Calculatrices", de:"Rechner",
      pt:"Calculadoras", bn:"ক্যালকুলেটর", pa:"ਕੈਲਕੁਲੇਟਰ", zh:"计算器"
    },
    "Graph": {
      ur:"گراف", hi:"ग्राफ", ro:"Graph", tr:"Grafik", es:"Gráfico",
      ar:"الرسم البياني", fr:"Graphique", de:"Graph", pt:"Gráfico",
      bn:"গ্রাফ", pa:"ਗ੍ਰਾਫ", zh:"图表"
    },
    "Quadratic": {
      ur:"دو درجی", hi:"द्विघात", ro:"Quadratic", tr:"İkinci Dereceden",
      es:"Cuadrática", ar:"معادلة تربيعية", fr:"Quadratique", de:"Quadratisch",
      pt:"Quadrática", bn:"দ্বিঘাত", pa:"ਵਰਗੀ", zh:"二次方程"
    },
    "Tools": {
      ur:"اوزار", hi:"उपकरण", ro:"Tools", tr:"Araçlar", es:"Herramientas",
      ar:"الأدوات", fr:"Outils", de:"Werkzeuge", pt:"Ferramentas",
      bn:"সরঞ্জাম", pa:"ਸੰਦ", zh:"工具"
    },
    "Formulas": {
      ur:"فارمولے", hi:"सूत्र", ro:"Formulas", tr:"Formüller", es:"Fórmulas",
      ar:"القوانين", fr:"Formules", de:"Formeln", pt:"Fórmulas",
      bn:"সূত্র", pa:"ਫਾਰਮੂਲੇ", zh:"公式"
    },
    "Learning": {
      ur:"تعلیم", hi:"अध्ययन", ro:"Learning", tr:"Öğrenme", es:"Aprendizaje",
      ar:"التعليم", fr:"Apprentissage", de:"Lernen", pt:"Aprendizagem",
      bn:"শিক্ষা", pa:"ਸਿੱਖਣਾ", zh:"学习"
    },
    "Practice Quizzes": {
      ur:"مشقی کوئز", hi:"अभ्यास क्विज़", ro:"Practice Quizzes",
      tr:"Alıştırma Testleri", es:"Cuestionarios de Práctica",
      ar:"اختبارات تدريبية", fr:"Quiz d'entraînement", de:"Übungsquiz",
      pt:"Quizzes de Prática", bn:"অনুশীলন কুইজ", pa:"ਅਭਿਆਸ ਕੁਇਜ਼", zh:"练习测验"
    },
    "Flashcards": {
      ur:"فلیش کارڈز", hi:"फ्लैशकार्ड्स", ro:"Flashcards",
      tr:"Bilgi Kartları", es:"Tarjetas de Estudio",
      ar:"بطاقات تعليمية", fr:"Cartes mémoires", de:"Karteikarten",
      pt:"Cartões de Estudo", bn:"ফ্ল্যাশকার্ড", pa:"ਫਲੈਸ਼ਕਾਰਡ", zh:"抽认卡"
    },
    "Formula Library": {
      ur:"فارمولا لائبریری", hi:"सूत्र लाइब्रेरी", ro:"Formula Library",
      tr:"Formül Kütüphanesi", es:"Biblioteca de Fórmulas",
      ar:"مكتبة القوانين", fr:"Bibliothèque de formules", de:"Formelsammlung",
      pt:"Biblioteca de Fórmulas", bn:"সূত্র লাইব্রেরি", pa:"ਫਾਰਮੂਲਾ ਲਾਇਬ੍ਰੇਰੀ", zh:"公式库"
    },
    "Homework Mode": {
      ur:"ہوم ورک موڈ", hi:"गृहकार्य मोड", ro:"Homework Mode",
      tr:"Ödev Modu", es:"Modo Tarea",
      ar:"وضع الواجب المنزلي", fr:"Mode devoirs", de:"Hausaufgaben-Modus",
      pt:"Modo Dever de Casa", bn:"হোমওয়ার্ক মোড", pa:"ਹੋਮਵਰਕ ਮੋਡ", zh:"作业模式"
    },
    "Resources": {
      ur:"وسائل", hi:"संसाधन", ro:"Resources", tr:"Kaynaklar", es:"Recursos",
      ar:"المصادر", fr:"Ressources", de:"Ressourcen", pt:"Recursos",
      bn:"রিসোর্স", pa:"ਸਰੋਤ", zh:"资源"
    },
    "Exam Modes (SAT/FSc/JEE)": {
      ur:"امتحانی موڈز (SAT/FSc/JEE)", hi:"परीक्षा मोड (SAT/FSc/JEE)",
      ro:"Exam Modes (SAT/FSc/JEE)", tr:"Sınav Modları (SAT/FSc/JEE)",
      es:"Modos de Examen (SAT/FSc/JEE)", ar:"أوضاع الامتحانات (SAT/FSc/JEE)",
      fr:"Modes d'examen (SAT/FSc/JEE)", de:"Prüfungsmodi (SAT/FSc/JEE)",
      pt:"Modos de Exame (SAT/FSc/JEE)", bn:"পরীক্ষা মোড (SAT/FSc/JEE)",
      pa:"ਪ੍ਰੀਖਿਆ ਮੋਡ (SAT/FSc/JEE)", zh:"考试模式 (SAT/FSc/JEE)"
    },
    "Video Lessons": {
      ur:"ویڈیو اسباق", hi:"वीडियो पाठ", ro:"Video Lessons",
      tr:"Video Dersler", es:"Lecciones en Video",
      ar:"دروس الفيديو", fr:"Leçons vidéo", de:"Videolektionen",
      pt:"Aulas em Vídeo", bn:"ভিডিও পাঠ", pa:"ਵੀਡੀਓ ਸਬਕ", zh:"视频课程"
    },
    "Back to the solver": {
      ur:"سولور پر واپس جائیں", hi:"सॉल्वर पर वापस जाएं", ro:"Solver par wapas jayein",
      tr:"Çözücüye dön", es:"Volver al solucionador",
      ar:"العودة إلى الحلّال", fr:"Retour au résolveur", de:"Zurück zum Löser",
      pt:"Voltar ao solucionador", bn:"সলভারে ফিরে যান", pa:"ਸੋਲਵਰ ਤੇ ਵਾਪਸ ਜਾਓ", zh:"返回求解器"
    },
    "All calculators": {
      ur:"تمام کیلکولیٹرز", hi:"सभी कैलकुलेटर", ro:"Saare calculators",
      tr:"Tüm hesap makineleri", es:"Todas las calculadoras",
      ar:"جميع الحاسبات", fr:"Toutes les calculatrices", de:"Alle Rechner",
      pt:"Todas as calculadoras", bn:"সব ক্যালকুলেটর", pa:"ਸਾਰੇ ਕੈਲਕੁਲੇਟਰ", zh:"全部计算器"
    },
    "Browse all calculators →": {
      ur:"تمام کیلکولیٹرز دیکھیں ←", hi:"सभी कैलकुलेटर देखें →",
      ro:"Saare calculators dekhein →", tr:"Tüm hesap makinelerine göz at →",
      es:"Ver todas las calculadoras →", ar:"تصفح جميع الحاسبات ←",
      fr:"Toutes les calculatrices →", de:"Alle Rechner ansehen →",
      pt:"Ver todas as calculadoras →", bn:"সব ক্যালকুলেটর দেখুন →",
      pa:"ਸਾਰੇ ਕੈਲਕੁਲੇਟਰ ਦੇਖੋ →", zh:"浏览所有计算器 →"
    },
    "About": {
      ur:"ہمارے بارے میں", hi:"हमारे बारे में", ro:"About", tr:"Hakkında",
      es:"Acerca de", ar:"حول الموقع", fr:"À propos", de:"Über uns",
      pt:"Sobre", bn:"আমাদের সম্পর্কে", pa:"ਸਾਡੇ ਬਾਰੇ", zh:"关于"
    },
    "Contact": {
      ur:"رابطہ کریں", hi:"संपर्क करें", ro:"Contact", tr:"İletişim",
      es:"Contacto", ar:"اتصل بنا", fr:"Contact", de:"Kontakt",
      pt:"Contato", bn:"যোগাযোগ", pa:"ਸੰਪਰਕ", zh:"联系我们"
    },
    "Privacy Policy": {
      ur:"پرائیویسی پالیسی", hi:"गोपनीयता नीति", ro:"Privacy Policy",
      tr:"Gizlilik Politikası", es:"Política de Privacidad",
      ar:"سياسة الخصوصية", fr:"Politique de confidentialité", de:"Datenschutz",
      pt:"Política de Privacidade", bn:"গোপনীয়তা নীতি", pa:"ਪ੍ਰਾਈਵੇਸੀ ਨੀਤੀ", zh:"隐私政策"
    },
    "Terms of Service": {
      ur:"شرائط و ضوابط", hi:"सेवा की शर्तें", ro:"Terms of Service",
      tr:"Kullanım Şartları", es:"Términos del Servicio",
      ar:"شروط الخدمة", fr:"Conditions d'utilisation", de:"Nutzungsbedingungen",
      pt:"Termos de Serviço", bn:"সেবার শর্তাবলী", pa:"ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ", zh:"服务条款"
    },
    "Free AI Math Helper": {
      ur:"مفت AI ریاضی مددگار", hi:"निःशुल्क AI गणित सहायक",
      ro:"Muft AI Math Madadgar", tr:"Ücretsiz Yapay Zeka Matematik Yardımcısı",
      es:"Ayudante Matemático IA Gratuito", ar:"مساعد الرياضيات الذكي المجاني",
      fr:"Assistant Mathématique IA Gratuit", de:"Kostenloser KI-Mathelöser",
      pt:"Assistente Matemático IA Gratuito", bn:"বিনামূল্যে AI গণিত সহায়ক",
      pa:"ਮੁਫ਼ਤ AI ਗਣਿਤ ਸਹਾਇਕ", zh:"免费AI数学助手"
    },
    "Solve": {
      ur:"حل کریں", hi:"हल करें", ro:"Hal karein", tr:"Çöz", es:"Resolver",
      ar:"حل", fr:"Résoudre", de:"Lösen", pt:"Resolver",
      bn:"সমাধান করুন", pa:"ਹੱਲ ਕਰੋ", zh:"解答"
    },
    "Solve step by step": {
      ur:"مرحلہ وار حل کریں", hi:"चरण-दर-चरण हल करें", ro:"Marhala-war hal karein",
      tr:"Adım adım çöz", es:"Resolver paso a paso",
      ar:"حل خطوة بخطوة", fr:"Résoudre étape par étape", de:"Schritt für Schritt lösen",
      pt:"Resolver paso a paso", bn:"ধাপে ধাপে সমাধান", pa:"ਕਦਮ ਦਰ ਕਦਮ ਹੱਲ ਕਰੋ", zh:"逐步解答"
    },
    "💡 Get Hint": {
      ur:"💡 اشارہ لیں", hi:"💡 संकेत लें", ro:"💡 Ishārah lein",
      tr:"💡 İpucu Al", es:"💡 Obtener Pista",
      ar:"💡 احصل على تلميح", fr:"💡 Obtenir un indice", de:"💡 Hinweis erhalten",
      pt:"💡 Obter Dica", bn:"💡 ইঙ্গিত নিন", pa:"💡 ਸੰਕੇਤ ਲਓ", zh:"💡 获取提示"
    },
    "Get Hint": {
      ur:"اشارہ لیں", hi:"संकेत लें", ro:"Ishārah lein",
      tr:"İpucu Al", es:"Obtener Pista",
      ar:"احصل على تلميح", fr:"Obtenir un indice", de:"Hinweis erhalten",
      pt:"Obter Dica", bn:"ইঙ্গিত নিন", pa:"ਸੰਕੇਤ ਲਓ", zh:"获取提示"
    },
    "Upload Photo / PDF": {
      ur:"تصویر / پی ڈی ایف اپلوڈ کریں", hi:"फोटो / पीडीएफ अपलोड करें",
      ro:"Photo / PDF upload karein", tr:"Fotoğraf / PDF Yükle",
      es:"Subir Foto / PDF", ar:"رفع صورة / PDF", fr:"Télécharger Photo / PDF",
      de:"Foto / PDF hochladen", pt:"Enviar Foto / PDF",
      bn:"ছবি / PDF আপলোড করুন", pa:"ਫੋਟੋ / PDF ਅੱਪਲੋਡ ਕਰੋ", zh:"上传照片/PDF"
    },
    "🎤 Speak": {
      ur:"🎤 بولیں", hi:"🎤 बोलें", ro:"🎤 Boliye", tr:"🎤 Konuş",
      es:"🎤 Hablar", ar:"🎤 تحدث", fr:"🎤 Parler", de:"🎤 Sprechen",
      pt:"🎤 Falar", bn:"🎤 বলুন", pa:"🎤 ਬੋਲੋ", zh:"🎤 说话"
    },
    "＋ New problem": {
      ur:"＋ نیا سوال", hi:"＋ नया प्रश्न", ro:"＋ Naya sawāl",
      tr:"＋ Yeni soru", es:"＋ Nuevo problema",
      ar:"＋ مسألة جديدة", fr:"＋ Nouveau problème", de:"＋ Neue Aufgabe",
      pt:"＋ Novo problema", bn:"＋ নতুন সমস্যা", pa:"＋ ਨਵੀਂ ਸਮੱਸਿਆ", zh:"＋ 新问题"
    },
    "Plot": {
      ur:"پلاٹ کریں", hi:"प्लॉट करें", ro:"Plot karein", tr:"Grafiğe dök",
      es:"Graficar", ar:"رسم بياني", fr:"Tracer", de:"Zeichnen",
      pt:"Plotar", bn:"প্লট করুন", pa:"ਪਲਾਟ ਕਰੋ", zh:"绘图"
    },
    "Generate Quiz": {
      ur:"کوئز بنائیں", hi:"क्विज़ बनाएं", ro:"Quiz banayein",
      tr:"Test Oluştur", es:"Generar Cuestionario",
      ar:"إنشاء اختبار", fr:"Générer le quiz", de:"Quiz erstellen",
      pt:"Gerar Quiz", bn:"কুইজ তৈরি করুন", pa:"ਕੁਇਜ਼ ਬਣਾਓ", zh:"生成测验"
    },
    "Start Exam": {
      ur:"امتحان شروع کریں", hi:"परीक्षा शुरू करें", ro:"Imtehan shuru karein",
      tr:"Sınavı Başlat", es:"Iniciar Examen",
      ar:"بدء الامتحان", fr:"Commencer l'examen", de:"Prüfung starten",
      pt:"Iniciar Exame", bn:"পরীক্ষা শুরু করুন", pa:"ਪ੍ਰੀਖਿਆ ਸ਼ੁਰੂ ਕਰੋ", zh:"开始考试"
    },
    "Check": {
      ur:"چیک کریں", hi:"जांचें", ro:"Check karein", tr:"Kontrol Et",
      es:"Comprobar", ar:"تحقق", fr:"Vérifier", de:"Prüfen",
      pt:"Verificar", bn:"যাচাই করুন", pa:"ਜਾਂਚ ਕਰੋ", zh:"检查"
    },
    "Next": {
      ur:"اگلا", hi:"अगला", ro:"Agla", tr:"Sonraki",
      es:"Siguiente", ar:"التالي", fr:"Suivant", de:"Weiter",
      pt:"Próximo", bn:"পরবর্তী", pa:"ਅਗਲਾ", zh:"下一个"
    },
    "Previous": {
      ur:"پچھلا", hi:"पिछला", ro:"Pichla", tr:"Önceki",
      es:"Anterior", ar:"السابق", fr:"Précédent", de:"Zurück",
      pt:"Anterior", bn:"পূর্ববর্তী", pa:"ਪਿਛਲਾ", zh:"上一个"
    },
    "New quiz": {
      ur:"نیا کوئز", hi:"नया क्विज़", ro:"Naya quiz", tr:"Yeni test",
      es:"Nuevo cuestionario", ar:"اختبار جديد", fr:"Nouveau quiz", de:"Neues Quiz",
      pt:"Novo quiz", bn:"নতুন কুইজ", pa:"ਨਵਾਂ ਕੁਇਜ਼", zh:"新测验"
    },
    "Copy": {
      ur:"کاپی کریں", hi:"कॉपी करें", ro:"Copy karein", tr:"Kopyala",
      es:"Copiar", ar:"نسخ", fr:"Copier", de:"Kopieren",
      pt:"Copiar", bn:"কপি করুন", pa:"ਕਾਪੀ ਕਰੋ", zh:"复制"
    },
    "Print sheet": {
      ur:"شیٹ پرنٹ کریں", hi:"शीट प्रिंट करें", ro:"Sheet print karein",
      tr:"Sayfayı yazdır", es:"Imprimir hoja",
      ar:"طباعة الورقة", fr:"Imprimer la feuille", de:"Blatt drucken",
      pt:"Imprimir folha", bn:"শীট প্রিন্ট করুন", pa:"ਸ਼ੀਟ ਪ੍ਰਿੰਟ ਕਰੋ", zh:"打印表格"
    },
    "Thinking…": {
      ur:"سوچ رہا ہے…", hi:"विचार कर रहा है…", ro:"Soch raha hai…",
      tr:"Düşünüyor…", es:"Pensando…",
      ar:"جارٍ التفكير…", fr:"Réflexion en cours…", de:"Überlege…",
      pt:"Pensando…", bn:"ভাবছে…", pa:"ਸੋਚ ਰਿਹਾ ਹੈ…", zh:"思考中…"
    },
    "Could not reach the solver. Try again.": {
      ur:"سرور سے رابطہ نہ ہو سکا۔ دوبارہ کوشش کریں۔",
      hi:"सर्वर से कनेक्ट नहीं हो सका। पुनः प्रयास करें।",
      ro:"Solver se rabta nahi ho saka. Dobara koshish karein.",
      tr:"Çözücüye ulaşılamadı. Tekrar deneyin.",
      es:"No se pudo conectar con el solucionador. Inténtalo de nuevo.",
      ar:"تعذر الاتصال بالمحلل. يرجى المحاولة مرة أخرى.",
      fr:"Impossible de joindre le résolveur. Réessayez.",
      de:"Löser nicht erreichbar. Erneut versuchen.",
      pt:"Não foi possível conectar ao solucionador. Tente novamente.",
      bn:"সমাধানকারীতে পৌঁছানো যায়নি। আবার চেষ্টা করুন।",
      pa:"ਸੋਲਵਰ ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਹੋਈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      zh:"无法连接到求解器。请重试。"
    },
    "Type your math problem, or tap Σ to add symbols…": {
      ur:"اپنا ریاضی کا سوال لکھیں، یا علامات کیلئے Σ دبائیں…",
      hi:"अपना गणितीय प्रश्न लिखें, या चिह्न जोड़ने के लिए Σ दबाएं…",
      ro:"Apna math sawāl likhein, ya Σ dabayein…",
      tr:"Matematik probleminizi yazın veya sembol eklemek için Σ'ya dokunun…",
      es:"Escribe tu problema matemático, o toca Σ para símbolos…",
      ar:"اكتب مسألتك الرياضية، أو اضغط Σ لإضافة الرموز…",
      fr:"Tapez votre problème de maths, ou appuyez sur Σ…",
      de:"Geben Sie Ihre Matheaufgabe ein oder tippen Sie auf Σ…",
      pt:"Digite seu problema de matemática ou toque em Σ…",
      bn:"আপনার গণিতের সমস্যা টাইপ করুন, বা Σ চাপুন…",
      pa:"ਆਪਣੀ ਗਣਿਤ ਦੀ ਸਮੱਸਿਆ ਲਿਖੋ, ਜਾਂ Σ ਦਬਾਓ…",
      zh:"输入数学问题，或点击Σ添加符号…"
    }
  };

  // ─── 3. Socratic Prompt Prefixes ────────────────────────────────────────────
  var PROMPT_PREFIXES = {
    hint: {
      en: "Give hints only, one at a time. Do not reveal the final answer. Problem: ",
      ur: "براہ کرم صرف ایک وقت میں ایک اشارہ دیں، حتمی جواب مت بتائیں۔ سوال: ",
      hi: "कृपया एक बार में केवल एक संकेत दें, अंतिम उत्तर प्रकट न करें। प्रश्न: ",
      ro: "Sirf ek ek karke ishārah dein, aakhri jawab mat batayein. Sawāl: ",
      tr: "Yalnızca birer birer ipucu ver. Nihai cevabı açıklama. Problem: ",
      es: "Da solo pistas, una a la vez. No reveles la respuesta final. Problema: ",
      ar: "قدم تلميحات فقط، واحداً تلو الآخر. لا تكشف عن الإجابة النهائية. المسألة: ",
      fr: "Donnez des indices seulement, un à la fois. Ne révélez pas la réponse finale. Problème: ",
      de: "Gib nur Hinweise, einen nach dem anderen. Verrate nicht die endgültige Antwort. Aufgabe: ",
      pt: "Dê apenas dicas, uma de cada vez. Não revele a resposta final. Problema: ",
      bn: "শুধুমাত্র একবারে একটি ইঙ্গিত দিন। চূড়ান্ত উত্তর প্রকাশ করবেন না। সমস্যা: ",
      pa: "ਸਿਰਫ਼ ਇੱਕ ਵਾਰ ਵਿੱਚ ਇੱਕ ਸੰਕੇਤ ਦਿਓ। ਅੰਤਿਮ ਜਵਾਬ ਨਾ ਦੱਸੋ। ਸਮੱਸਿਆ: ",
      zh: "每次只给一个提示，不要揭示最终答案。问题："
    },
    socratic: {
      en: "Act as a Socratic tutor: ask guiding questions, never give the answer. Problem: ",
      ur: "بطور سقراطی استاد رہنمائی کریں: رہنما سوالات پوچھیں، جواب نہ دیں۔ سوال: ",
      hi: "एक सुकराती शिक्षक के रूप में कार्य करें: प्रश्न पूछें, कभी उत्तर न दें। प्रश्न: ",
      ro: "Socratic ustaad ki tarah rehnuma sawalat poochein, seedha jawab mat dein. Sawāl: ",
      tr: "Sokratik bir öğretmen gibi davran: yönlendirici sorular sor, asla cevabı verme. Problem: ",
      es: "Actúa como un tutor socrático: haz preguntas guía, nunca des la respuesta. Problema: ",
      ar: "تصرف كمعلم سقراطي: اطرح أسئلة توجيهية، ولا تقدم الإجابة أبدًا. المسألة: ",
      fr: "Agissez comme un tuteur socratique: posez des questions directrices, ne donnez jamais la réponse. Problème: ",
      de: "Handeln Sie als sokratischer Tutor: Stellen Sie Leitfragen, geben Sie niemals die Antwort. Aufgabe: ",
      pt: "Aja como um tutor socrático: faça perguntas orientadoras, nunca dê a resposta. Problema: ",
      bn: "সক্রেটিক টিউটর হিসেবে কাজ করুন: গাইডিং প্রশ্ন করুন, কখনো উত্তর দেবেন না। সমস্যা: ",
      pa: "ਸੁਕਰਾਤਿਕ ਅਧਿਆਪਕ ਵਜੋਂ ਕੰਮ ਕਰੋ: ਮਾਰਗਦਰਸ਼ਕ ਪ੍ਰਸ਼ਨ ਪੁੱਛੋ, ਕਦੇ ਜਵਾਬ ਨਾ ਦਿਓ। ਸਮੱਸਿਆ: ",
      zh: "作为苏格拉底式导师：提问引导，从不直接给出答案。问题："
    }
  };

  // ─── 4. State ───────────────────────────────────────────────────────────────
  var STORAGE_KEY = "msiq_lang";
  var currentLang = localStorage.getItem(STORAGE_KEY) || "en";
  if (!LANGUAGES[currentLang]) currentLang = "en";

  // ─── 5. Google Translate Cookie ─────────────────────────────────────────────
  function setGoogleTranslateCookie(lang) {
    var target = (lang === "ro" || lang === "en") ? "en" : LANGUAGES[lang].google || lang;
    var cookieVal = "/en/" + target;
    document.cookie = "googtrans=" + cookieVal + "; path=/;";
    var domain = window.location.hostname;
    if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
      document.cookie = "googtrans=" + cookieVal + "; path=/; domain=" + domain + ";";
      document.cookie = "googtrans=" + cookieVal + "; path=/; domain=." + domain + ";";
    }
  }

  // ─── 6. DOM Dictionary Translation ──────────────────────────────────────────
  function translateDOM(lang) {
    var isRTL = (lang === "ur" || lang === "ar");
    document.documentElement.setAttribute("lang", lang === "ro" ? "ur-Latn" : lang);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");

    // Walk text nodes
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      // Skip the dropdown we injected so it doesn't get re-translated
      if (node.parentElement && node.parentElement.closest && node.parentElement.closest("#msiq-lang-wrap")) continue;
      var txt = node.nodeValue.trim();
      if (!txt) continue;
      if (DICTIONARY[txt] && DICTIONARY[txt][lang]) {
        node.nodeValue = node.nodeValue.replace(txt, DICTIONARY[txt][lang]);
      } else if (lang === "en") {
        // Reverse lookup — restore English
        for (var orig in DICTIONARY) {
          for (var l in DICTIONARY[orig]) {
            if (DICTIONARY[orig][l] === txt) {
              node.nodeValue = node.nodeValue.replace(txt, orig);
              break;
            }
          }
        }
      }
    }

    // Input placeholders
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(function (el) {
      var p = el.getAttribute("placeholder");
      if (!p) return;
      if (DICTIONARY[p] && DICTIONARY[p][lang]) {
        el.setAttribute("data-orig-ph", el.getAttribute("data-orig-ph") || p);
        el.setAttribute("placeholder", DICTIONARY[p][lang]);
      } else if (lang === "en" && el.getAttribute("data-orig-ph")) {
        el.setAttribute("placeholder", el.getAttribute("data-orig-ph"));
      }
    });

    // Buttons
    document.querySelectorAll("button, a.btn, .chip").forEach(function (btn) {
      if (btn.id === "msiq-lang-wrap" || (btn.closest && btn.closest("#msiq-lang-wrap"))) return;
      var textNode = Array.from(btn.childNodes).find(function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
      if (textNode) {
        var t = textNode.nodeValue.trim();
        if (DICTIONARY[t] && DICTIONARY[t][lang]) {
          textNode.nodeValue = textNode.nodeValue.replace(t, DICTIONARY[t][lang]);
        }
      }
    });

    // Socratic / Hint chips
    var chips = document.querySelectorAll("#modes .chip");
    if (chips.length >= 3) {
      chips[1].setAttribute("data-m", PROMPT_PREFIXES.hint[lang] || PROMPT_PREFIXES.hint.en);
      chips[2].setAttribute("data-m", PROMPT_PREFIXES.socratic[lang] || PROMPT_PREFIXES.socratic.en);
    }
  }

  // ─── 7. Google Translate Widget ──────────────────────────────────────────────
  function triggerGoogleTranslate(lang, retries) {
    retries = retries || 0;
    if (retries > 20) return; // give up after ~6s
    var target = (lang === "ro" || lang === "en") ? "en" : (LANGUAGES[lang] && LANGUAGES[lang].google ? LANGUAGES[lang].google : lang);
    var combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = target;
      combo.dispatchEvent(new Event("change"));
    } else {
      setTimeout(function () { triggerGoogleTranslate(lang, retries + 1); }, 300);
    }
  }

  function initGoogleTranslate() {
    if (window._msiqGTEInit) return;
    window._msiqGTEInit = true;

    var container = document.getElementById("google_translate_element");
    if (!container) {
      container = document.createElement("div");
      container.id = "google_translate_element";
      container.style.display = "none";
      document.body.appendChild(container);
    }

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: "ur,hi,bn,pa,zh-CN,tr,es,ar,fr,de,pt,en",
        autoDisplay: false
      }, "google_translate_element");
      // Re-apply stored language once widget is ready
      if (currentLang !== "en") {
        setTimeout(function () { triggerGoogleTranslate(currentLang); }, 600);
      }
    };

    if (!document.getElementById("msiq-gte-script")) {
      var s = document.createElement("script");
      s.id = "msiq-gte-script";
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.head.appendChild(s);
    }
  }

  // ─── 8. Apply Language ───────────────────────────────────────────────────────
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    setGoogleTranslateCookie(lang);
    translateDOM(lang);
    triggerGoogleTranslate(lang);
    // Update the select in case called programmatically
    var sel = document.getElementById("msiq-lang-select");
    if (sel && sel.value !== lang) sel.value = lang;
  }

  // ─── 9. Inject Styles ───────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("msiq-lang-styles")) return;
    var css = [
      "/* === MathSolveIQ Language Selector === */",
      "#msiq-lang-wrap {",
      "  display: inline-flex; align-items: center; gap: 5px;",
      "  background: var(--card, #fff); border: 1px solid var(--line, #e3e7ec);",
      "  border-radius: 999px; padding: 4px 10px 4px 8px;",
      "  color: var(--ink, #1a2233);",
      "  box-shadow: 0 1px 4px rgba(0,0,0,0.08);",
      "  cursor: pointer; transition: border-color .18s, box-shadow .18s;",
      "  flex-shrink: 0; z-index: 9999;",
      "}",
      "#msiq-lang-wrap:hover, #msiq-lang-wrap:focus-within {",
      "  border-color: var(--acc, #0f766e);",
      "  box-shadow: 0 0 0 3px var(--acc2, rgba(15,118,110,.15));",
      "}",
      "#msiq-lang-wrap svg {",
      "  width: 14px; height: 14px; stroke: var(--acc, #0f766e);",
      "  fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;",
      "  display: block; flex-shrink: 0;",
      "}",
      "#msiq-lang-select {",
      "  background: transparent; border: none;",
      "  color: var(--ink, #1a2233); font: 500 12px/1 system-ui, -apple-system, sans-serif;",
      "  cursor: pointer; outline: none; max-width: 130px;",
      "}",
      "#msiq-lang-select option { background: var(--card, #fff); color: var(--ink, #1a2233); }",
      /* Floating position for index.html */
      "#msiq-lang-wrap.msiq-floating {",
      "  position: fixed; top: 14px; right: 20px; z-index: 9999;",
      "}",
      "@media(max-width: 899px) {",
      "  #msiq-lang-wrap.msiq-floating {",
      "    top: 10px; right: 52px;",
      "  }",
      "  #msiq-lang-select { max-width: 100px; font-size: 11px; }",
      "}",
      /* Hide Google Translate UI clutter */
      ".goog-te-banner-frame, .skiptranslate > iframe, #goog-gt-tt,",
      ".goog-te-balloon-frame, .goog-tooltip, .goog-tooltip-table-cell { display: none !important; }",
      "body { top: 0 !important; }",
      ".goog-te-gadget { display: none !important; }",
      /* RTL safety */
      "[dir='rtl'] { text-align: right; }",
      "[dir='rtl'] .math, [dir='rtl'] .step, [dir='rtl'] canvas,",
      "[dir='rtl'] input[inputmode='decimal'], [dir='rtl'] .score {",
      "  direction: ltr !important; unicode-bidi: embed !important; text-align: left;",
      "}"
    ].join("\n");
    var style = document.createElement("style");
    style.id = "msiq-lang-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── 10. Build & Place the Dropdown ─────────────────────────────────────────
  function injectDropdown() {
    if (document.getElementById("msiq-lang-wrap")) return;

    // Build the pill widget
    var wrap = document.createElement("div");
    wrap.id = "msiq-lang-wrap";

    // Globe SVG icon
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", "12"); c.setAttribute("cy", "12"); c.setAttribute("r", "10");
    var p1 = document.createElementNS(svgNS, "path");
    p1.setAttribute("d", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z");
    var p2 = document.createElementNS(svgNS, "path");
    p2.setAttribute("d", "M2 12h20");
    svg.appendChild(c); svg.appendChild(p1); svg.appendChild(p2);

    // Select element
    var select = document.createElement("select");
    select.id = "msiq-lang-select";
    select.setAttribute("aria-label", "Select language");

    Object.keys(LANGUAGES).forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = LANGUAGES[code].native + " (" + LANGUAGES[code].name + ")";
      if (code === currentLang) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", function () {
      applyLanguage(this.value);
    });

    wrap.appendChild(svg);
    wrap.appendChild(select);

    // ── Placement Logic ──
    // index.html has #page-home — use fixed floating pill (doesn't disturb sidebar)
    var isIndex = !!document.getElementById("page-home");
    var topBar  = document.querySelector(".top");

    if (isIndex) {
      wrap.classList.add("msiq-floating");
      document.body.appendChild(wrap);
    } else if (topBar) {
      // Subpages: append into .top bar (flex row → goes to right)
      topBar.appendChild(wrap);
    } else {
      // Fallback: floating
      wrap.classList.add("msiq-floating");
      document.body.appendChild(wrap);
    }
  }

  // ─── 11. MutationObserver for dynamic content ────────────────────────────────
  function setupObserver() {
    var observer = new MutationObserver(function (mutations) {
      if (currentLang === "en") return;
      mutations.forEach(function (m) {
        if (!m.addedNodes || !m.addedNodes.length) return;
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.id === "msiq-lang-wrap") return; // skip our own widget
          var tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
          var n;
          while ((n = tw.nextNode())) {
            var val = n.nodeValue.trim();
            if (DICTIONARY[val] && DICTIONARY[val][currentLang]) {
              n.nodeValue = n.nodeValue.replace(val, DICTIONARY[val][currentLang]);
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── 12. Bootstrap ───────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    injectDropdown();
    initGoogleTranslate();
    if (currentLang !== "en") {
      applyLanguage(currentLang);
    }
    setupObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose so external code can call msiqLang.apply("ur") if needed
  window.msiqLang = { apply: applyLanguage, current: function () { return currentLang; } };
})();
