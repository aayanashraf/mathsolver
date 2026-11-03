/**
 * MathSolveIQ Universal Client-Side Localization & Translation Engine
 * Supports: English, Urdu, Hindi, Roman Urdu, Spanish, Arabic, French, German, Portuguese, Turkish
 */
(function () {
  "use strict";

  // 1. Language Definitions
  var LANGUAGES = {
    en: { name: "English", native: "English", dir: "ltr", google: "en" },
    ur: { name: "Urdu", native: "اردو", dir: "rtl", google: "ur" },
    hi: { name: "Hindi", native: "हिन्दी", dir: "ltr", google: "hi" },
    ro: { name: "Roman Urdu", native: "Roman Urdu", dir: "ltr", google: null },
    tr: { name: "Turkish", native: "Türkçe", dir: "ltr", google: "tr" },
    es: { name: "Spanish", native: "Español", dir: "ltr", google: "es" },
    ar: { name: "Arabic", native: "العربية", dir: "rtl", google: "ar" },
    fr: { name: "French", native: "Français", dir: "ltr", google: "fr" },
    de: { name: "German", native: "Deutsch", dir: "ltr", google: "de" },
    pt: { name: "Portuguese", native: "Português", dir: "ltr", google: "pt" }
  };

  // 2. High-Fidelity Vocabulary & Phrase Dictionary
  var DICTIONARY = {
    // Navigation & Headers
    "Home": {
      ur: "ہوم", hi: "होम", ro: "Home", tr: "Ana Sayfa", es: "Inicio", ar: "الرئيسية", fr: "Accueil", de: "Startseite", pt: "Início"
    },
    "Calculators": {
      ur: "کیلکولیٹرز", hi: "कैलकुलेटर", ro: "Calculators", tr: "Hesap Makineleri", es: "Calculadoras", ar: "الحاسبات", fr: "Calculatrices", de: "Rechner", pt: "Calculadoras"
    },
    "Graph": {
      ur: "گراف", hi: "ग्राफ", ro: "Graph", tr: "Grafik", es: "Gráfico", ar: "الرسم البياني", fr: "Graphique", de: "Graph", pt: "Gráfico"
    },
    "Quadratic": {
      ur: "دو درجی", hi: "द्विघात", ro: "Quadratic", tr: "İkinci Dereceden", es: "Cuadrática", ar: "معادلة تربيعية", fr: "Quadratique", de: "Quadratisch", pt: "Quadrática"
    },
    "Tools": {
      ur: "اوزار", hi: "उपकरण", ro: "Auzār (Tools)", tr: "Araçlar", es: "Herramientas", ar: "الأدوات", fr: "Outils", de: "Werkzeuge", pt: "Ferramentas"
    },
    "Learning": {
      ur: "تعلیم", hi: "अध्ययन", ro: "Learning", tr: "Öğrenme", es: "Aprendizaje", ar: "التعليم", fr: "Apprentissage", de: "Lernen", pt: "Aprendizagem"
    },
    "Practice Quizzes": {
      ur: "مشقی کوئز", hi: "अभ्यास क्विज़", ro: "Practice Quizzes", tr: "Alıştırma Testleri", es: "Cuestionarios de Práctica", ar: "اختبارات تدريبية", fr: "Quiz d'entraînement", de: "Übungsquiz", pt: "Quizzes de Prática"
    },
    "Flashcards": {
      ur: "فلیش کارڈز", hi: "फ्लैशकार्ड्स", ro: "Flashcards", tr: "Bilgi Kartları", es: "Tarjetas de Estudio", ar: "بطاقات تعليمية", fr: "Cartes mémoires", de: "Karteikarten", pt: "Cartões de Estudo"
    },
    "Formula Library": {
      ur: "فارمولا لائبریری", hi: "सूत्र लाइब्रेरी", ro: "Formula Library", tr: "Formül Kütüphanesi", es: "Biblioteca de Fórmulas", ar: "مكتبة القوانين", fr: "Bibliothèque de formules", de: "Formelsammlung", pt: "Biblioteca de Fórmulas"
    },
    "Homework Mode": {
      ur: "ہوم ورک موڈ", hi: "गृहकार्य मोड", ro: "Homework Mode", tr: "Ödev Modu", es: "Modo Tarea", ar: "وضع الواجب المنزلي", fr: "Mode devoirs", de: "Hausaufgaben-Modus", pt: "Modo Dever de Casa"
    },
    "Resources": {
      ur: "وسائل", hi: "संसाधन", ro: "Zaraye (Resources)", tr: "Kaynaklar", es: "Recursos", ar: "المصادر", fr: "Ressources", de: "Ressourcen", pt: "Recursos"
    },
    "Exam Modes (SAT/FSc/JEE)": {
      ur: "امتحانی موڈز (SAT/FSc/JEE)", hi: "परीक्षा मोड (SAT/FSc/JEE)", ro: "Exam Modes (SAT/FSc/JEE)", tr: "Sınav Modları (SAT/FSc/JEE)", es: "Modos de Examen (SAT/FSc/JEE)", ar: "أوضاع الامتحانات (SAT/FSc/JEE)", fr: "Modes d'examen (SAT/FSc/JEE)", de: "Prüfungsmodi (SAT/FSc/JEE)", pt: "Modos de Exame (SAT/FSc/JEE)"
    },
    "Video Lessons": {
      ur: "ویڈیو اسباق", hi: "वीडियो पाठ", ro: "Video Lessons", tr: "Video Dersler", es: "Lecciones en Video", ar: "دروس الفيديو", fr: "Leçons vidéo", de: "Videolektionen", pt: "Aulas em Vídeo"
    },
    "About": {
      ur: "ہمارے بارے میں", hi: "हमारे बारे में", ro: "About", tr: "Hakkında", es: "Acerca de", ar: "حول الموقع", fr: "À propos", de: "Über uns", pt: "Sobre"
    },
    "Contact": {
      ur: "رابطہ کریں", hi: "संपर्क करें", ro: "Rabta (Contact)", tr: "İletişim", es: "Contacto", ar: "اتصل بنا", fr: "Contact", de: "Kontakt", pt: "Contato"
    },
    "Privacy Policy": {
      ur: "پرائیویسی پالیسی", hi: "गोपनीयता नीति", ro: "Privacy Policy", tr: "Gizlilik Politikası", es: "Política de Privacidad", ar: "سياسة الخصوصية", fr: "Politique de confidentialité", de: "Datenschutz", pt: "Política de Privacidade"
    },
    "Terms of Service": {
      ur: "شرائط و ضوابط", hi: "सेवा की शर्तें", ro: "Terms of Service", tr: "Kullanım Şartları", es: "Términos del Servicio", ar: "شروط الخدمة", fr: "Conditions d'utilisation", de: "Nutzungsbedingungen", pt: "Termos de Serviço"
    },
    "Free AI Math Helper": {
      ur: "مفت AI ریاضی مددگار", hi: "निःशुल्क AI गणित सहायक", ro: "Muft AI Math Madadgar", tr: "Ücretsiz Yapay Zeka Matematik Yardımcısı", es: "Ayudante Matemático IA Gratuito", ar: "مساعد الرياضيات الذكي المجاني", fr: "Assistant Mathématique IA Gratuit", de: "Kostenloser KI-Mathelöser", pt: "Assistente Matemático IA Gratuito"
    },
    "Popular calculators": {
      ur: "مقبول کیلکولیٹرز", hi: "लोकप्रिय कैलकुलेटर", ro: "Mashhoor Calculators", tr: "Popüler hesap makineleri", es: "Calculadoras populares", ar: "الحاسبات الشائعة", fr: "Calculatrices populaires", de: "Beliebte Rechner", pt: "Calculadoras populares"
    },
    "How it works": {
      ur: "یہ کیسے کام کرتا ہے", hi: "यह कैसे काम करता है", ro: "Yeh kaise kaam karta hai", tr: "Nasıl çalışır", es: "Cómo funciona", ar: "كيف يعمل", fr: "Comment ça marche", de: "Wie es funktioniert", pt: "Como funciona"
    },
    "Why students pick MathSolveIQ": {
      ur: "طلباء MathSolveIQ کیوں منتخب کرتے ہیں", hi: "छात्र MathSolveIQ क्यों चुनते हैं", ro: "Tulba MathSolveIQ kyun chunte hain", tr: "Öğrenciler neden MathSolveIQ'yu seçiyor", es: "Por qué los estudiantes eligen MathSolveIQ", ar: "لماذا يختار الطلاب MathSolveIQ", fr: "Pourquoi les étudiants choisissent MathSolveIQ", de: "Warum Studenten MathSolveIQ wählen", pt: "Por que os estudantes escolhem MathSolveIQ"
    },
    "Subjects": {
      ur: "مضامین", hi: "विषय", ro: "Mazameen (Subjects)", tr: "Dersler", es: "Materias", ar: "المواد الدراسية", fr: "Matières", de: "Fächer", pt: "Disciplinas"
    },
    "Questions": {
      ur: "عمومی سوالات", hi: "अक्सर पूछे जाने वाले प्रश्न", ro: "Aam Sawalat (FAQ)", tr: "Sıkça Sorulan Sorular", es: "Preguntas Frecuentes", ar: "الأسئلة الشائعة", fr: "Questions fréquentes", de: "Häufige Fragen", pt: "Perguntas Frequentes"
    },

    // Buttons
    "Solve step by step": {
      ur: "مرحلہ وار حل کریں", hi: "चरण-दर-चरण हल करें", ro: "Marhala-war hal karein", tr: "Adım adım çöz", es: "Resolver paso a paso", ar: "حل خطوة بخطوة", fr: "Résoudre étape par étape", de: "Schritt für Schritt lösen", pt: "Resolver paso a passo"
    },
    "Solve": {
      ur: "حل کریں", hi: "हल करें", ro: "Hal karein", tr: "Çöz", es: "Resolver", ar: "حل", fr: "Résoudre", de: "Lösen", pt: "Resolver"
    },
    "💡 Get Hint": {
      ur: "💡 اشارہ لیں", hi: "💡 संकेत लें", ro: "💡 Ishārah lein", tr: "💡 İpucu Al", es: "💡 Obtener Pista", ar: "💡 احصل على تلميح", fr: "💡 Obtenir un indice", de: "💡 Hinweis erhalten", pt: "💡 Obter Dica"
    },
    "?? Get Hint": {
      ur: "💡 اشارہ لیں", hi: "💡 संकेत लें", ro: "💡 Ishārah lein", tr: "💡 İpucu Al", es: "💡 Obtener Pista", ar: "💡 احصل على تلميح", fr: "💡 Obtenir un indice", de: "💡 Hinweis erhalten", pt: "💡 Obter Dica"
    },
    "Get Hint": {
      ur: "اشارہ لیں", hi: "संकेत लें", ro: "Ishārah lein", tr: "İpucu Al", es: "Obtener Pista", ar: "احصل على تلميح", fr: "Obtenir un indice", de: "Hinweis erhalten", pt: "Obter Dica"
    },
    "📷 Photo (Upload Photo / PDF)": {
      ur: "📷 تصویر (فوٹو / PDF اپلوڈ کریں)", hi: "📷 फोटो (फोटो / PDF अपलोड करें)", ro: "📷 Photo (Photo / PDF upload karein)", tr: "📷 Fotoğraf (Fotoğraf / PDF Yükle)", es: "📷 Foto (Subir Foto / PDF)", ar: "📷 صورة (رفع صورة / PDF)", fr: "📷 Photo (Télécharger Photo / PDF)", de: "📷 Foto (Foto / PDF hochladen)", pt: "📷 Foto (Enviar Foto / PDF)"
    },
    "Upload Photo / PDF": {
      ur: "تصویر / پی ڈی ایف اپلوڈ کریں", hi: "फोटो / पीडीएफ अपलोड करें", ro: "Photo / PDF upload karein", tr: "Fotoğraf / PDF Yükle", es: "Subir Foto / PDF", ar: "رفع صورة / PDF", fr: "Télécharger Photo / PDF", de: "Foto / PDF hochladen", pt: "Enviar Foto / PDF"
    },
    "🎤 Speak": {
      ur: "🎤 بولیں", hi: "🎤 बोलें", ro: "🎤 Boliye", tr: "🎤 Konuş", es: "🎤 Hablar", ar: "🎤 تحدث", fr: "🎤 Parler", de: "🎤 Sprechen", pt: "🎤 Falar"
    },
    "＋ New problem": {
      ur: "＋ نیا سوال", hi: "＋ नया प्रश्न", ro: "＋ Naya sawāl", tr: "＋ Yeni soru", es: "＋ Nuevo problema", ar: "＋ مسألة جديدة", fr: "＋ Nouveau problème", de: "＋ Neue Aufgabe", pt: "＋ Novo problema"
    },
    "Plot": {
      ur: "پلاٹ کریں", hi: "प्लॉट करें", ro: "Plot karein", tr: "Grafiğe dök", es: "Graficar", ar: "رسم بياني", fr: "Tracer", de: "Zeichnen", pt: "Plotar"
    },
    "Reset view": {
      ur: "دوبارہ ترتیب دیں", hi: "रीसेट करें", ro: "Reset karein", tr: "Görünümü sıfırla", es: "Restablecer vista", ar: "إعادة ضبط", fr: "Réinitialiser", de: "Ansicht zurücksetzen", pt: "Redefinir visualização"
    },
    "Generate Quiz": {
      ur: "کوئز بنائیں", hi: "क्विज़ बनाएं", ro: "Quiz banayein", tr: "Test Oluştur", es: "Generar Cuestionario", ar: "إنشاء اختبار", fr: "Générer le quiz", de: "Quiz erstellen", pt: "Gerar Quiz"
    },
    "Start Exam": {
      ur: "امتحان شروع کریں", hi: "परीक्षा शुरू करें", ro: "Imtehan shuru karein", tr: "Sınavı Başlat", es: "Iniciar Examen", ar: "بدء الامتحان", fr: "Commencer l'examen", de: "Prüfung starten", pt: "Iniciar Exame" },
    "Check": {
      ur: "چیک کریں", hi: "जांचें", ro: "Check karein", tr: "Kontrol Et", es: "Comprobar", ar: "تحقق", fr: "Vérifier", de: "Prüfen", pt: "Verificar"
    },
    "Give me a problem": {
      ur: "مجھے ایک سوال دیں", hi: "मुझे एक प्रश्न दें", ro: "Mujhe sawāl dein", tr: "Bana bir soru ver", es: "Dame un problema", ar: "أعطني مسألة", fr: "Donnez-moi un problème", de: "Gib mir eine Aufgabe", pt: "Dê-me um problema"
    },
    "Show me the solution": {
      ur: "مجھے حل دکھائیں", hi: "मुझे समाधान दिखाएं", ro: "Mujhe hal dikhayein", tr: "Çözümü göster", es: "Muéstrame la solución", ar: "أرني الحل", fr: "Montrez-moi la solution", de: "Zeige mir die Lösung", pt: "Mostre-me a solução"
    },
    "Next problem": {
      ur: "اگلا سوال", hi: "अगला प्रश्न", ro: "Agla sawāl", tr: "Sonraki soru", es: "Siguiente problema", ar: "المسألة التالية", fr: "Problème suivant", de: "Nächste Aufgabe", pt: "Próximo problema"
    },
    "See my score": {
      ur: "میرا اسکور دیکھیں", hi: "मेरा स्कोर देखें", ro: "Mera score dekhein", tr: "Puanımı gör", es: "Ver mi puntuación", ar: "عرض درجاتي", fr: "Voir mon score", de: "Mein Ergebnis ansehen", pt: "Ver minha pontuação"
    },
    "Retry the ones I missed": {
      ur: "چھوٹے ہوئے سوالات دوبارہ کریں", hi: "छूटे हुए प्रश्नों को पुनः हल करें", ro: "Ghalat sawalat dobara karein", tr: "Kaçırdıklarımı tekrar dene", es: "Reintentar los que fallé", ar: "إعادة المحاولة للأسئلة الخاطئة", fr: "Réessayer les erreurs", de: "Verpasste wiederholen", pt: "Tentar novamente os que errei"
    },
    "New quiz": {
      ur: "نیا کوئز", hi: "नया क्विज़", ro: "Naya quiz", tr: "Yeni test", es: "Nuevo cuestionario", ar: "اختبار جديد", fr: "Nouveau quiz", de: "Neues Quiz", pt: "Novo quiz"
    },
    "Submit exam": {
      ur: "امتحان جمع کرائیں", hi: "परीक्षा जमा करें", ro: "Imtehan jama karein", tr: "Sınavı gönder", es: "Enviar examen", ar: "تسليم الامتحان", fr: "Soumettre l'examen", de: "Prüfung abgeben", pt: "Enviar exame"
    },
    "Clear answer": {
      ur: "جواب مٹائیں", hi: "उत्तर साफ़ करें", ro: "Jawab mitayein", tr: "Cevabı temizle", es: "Borrar respuesta", ar: "مسح الإجابة", fr: "Effacer la réponse", de: "Antwort löschen", pt: "Limpar resposta"
    },
    "Previous": {
      ur: "پچھلا", hi: "पिछला", ro: "Pichla", tr: "Önceki", es: "Anterior", ar: "السابق", fr: "Précédent", de: "Zurück", pt: "Anterior"
    },
    "Next": {
      ur: "اگلا", hi: "अगला", ro: "Agla", tr: "Sonraki", es: "Siguiente", ar: "التالي", fr: "Suivant", de: "Weiter", pt: "Próximo"
    },
    "Study now": {
      ur: "ابھی پڑھیں", hi: "अभी अध्ययन करें", ro: "Abhi padhein", tr: "Şimdi çalış", es: "Estudiar ahora", ar: "ادرس الآن", fr: "Étudier maintenant", de: "Jetzt lernen", pt: "Estudar agora"
    },
    "Reset this deck": {
      ur: "یہ ڈیک ری سیٹ کریں", hi: "इस डेक को रीसेट करें", ro: "Is deck ko reset karein", tr: "Bu desteyi sıfırla", es: "Restablecer este mazo", ar: "إعادة تعيين هذه الحزمة", fr: "Réinitialiser ce paquet", de: "Diesen Stapel zurücksetzen", pt: "Redefinir este baralho"
    },
    "Print sheet": {
      ur: "شیٹ پرنٹ کریں", hi: "शीट प्रिंट करें", ro: "Sheet print karein", tr: "Sayfayı yazdır", es: "Imprimir hoja", ar: "طباعة الورقة", fr: "Imprimer la feuille", de: "Blatt drucken", pt: "Imprimir folha"
    },
    "Copy": {
      ur: "کاپی کریں", hi: "कॉपी करें", ro: "Copy karein", tr: "Kopyala", es: "Copiar", ar: "نسخ", fr: "Copier", de: "Kopieren", pt: "Copiar"
    },

    // Modes & Prompts
    "Full solution": {
      ur: "مکمل حل", hi: "पूर्ण समाधान", ro: "Mukammal Hal", tr: "Tam çözüm", es: "Solución completa", ar: "الحل الكامل", fr: "Solution complète", de: "Vollständige Lösung", pt: "Solução completa"
    },
    "Hints only": {
      ur: "صرف اشارے", hi: "केवल संकेत", ro: "Sirf Ishare", tr: "Yalnızca ipuçları", es: "Solo pistas", ar: "تلميحات فقط", fr: "Indices seulement", de: "Nur Hinweise", pt: "Apenas dicas" },
    "Socratic": {
      ur: "سقراطی موڈ", hi: "सुकराती विधि", ro: "Socratic (Rahnumai)", tr: "Sokratik", es: "Socrático", ar: "طريقة سقراط", fr: "Socratique", de: "Sokratisch", pt: "Socrático"
    },
    "Thinking…": {
      ur: "سوچ رہا ہے…", hi: "विचार कर रहा है…", ro: "Soch raha hai…", tr: "Düşünüyor…", es: "Pensando…", ar: "جارٍ التفكير…", fr: "Réflexion en cours…", de: "Überlege…", pt: "Pensando…"
    },
    "Could not reach the solver. Try again.": {
      ur: "سرور سے رابطہ نہ ہو سکا۔ دوبارہ کوشش کریں۔", hi: "सर्वर से कनेक्ट नहीं हो सका। पुनः प्रयास करें।", ro: "Solver se rabta nahi ho saka. Dobara koshish karein.", tr: "Çözücüye ulaşılamadı. Tekrar deneyin.", es: "No se pudo conectar con el solucionador. Inténtalo de nuevo.", ar: "تعذر الاتصال بالمحلل. يرجى المحاولة مرة أخرى.", fr: "Impossible de joindre le résolveur. Réessayez.", de: "Löser nicht erreichbar. Erneut versuchen.", pt: "Não foi possível conectar ao solucionador. Tente novamente."
    },
    "Voice input is not supported in this browser.": {
      ur: "اس براؤزر میں وائس ان پٹ تعاون یافتہ نہیں ہے۔", hi: "इस ब्राउज़र में ध्वनि इनपुट समर्थित नहीं है।", ro: "Is browser mein voice input support nahi karta.", tr: "Bu tarayıcıda sesli giriş desteklenmiyor.", es: "La entrada de voz no es compatible con este navegador.", ar: "الإدخال الصوتي غير مدعوم في هذا المتصفح.", fr: "La saisie vocale n'est pas prise en charge dans ce navigateur.", de: "Spracheingabe wird von diesem Browser nicht unterstützt.", pt: "Entrada de voz não suportada neste navegador."
    },

    // Placeholders
    "Type your math problem, or tap Σ to add symbols…": {
      ur: "اپنا ریاضی کا سوال لکھیں، یا علامات کیلئے Σ دبائیں…", hi: "अपना गणितीय प्रश्न लिखें, या चिह्न जोड़ने के लिए Σ दबाएं…", ro: "Apna math sawāl likhein, ya Σ dabayein…", tr: "Matematik probleminizi yazın veya sembol eklemek için Σ'ya dokunun…", es: "Escribe tu problema matemático, o toca Σ para símbolos…", ar: "اكتب مسألتك الرياضية، أو اضغط Σ لإضافة الرموز…", fr: "Tapez votre problème de maths, ou appuyez sur Σ…", de: "Geben Sie Ihre Matheaufgabe ein oder tippen Sie auf Σ…", pt: "Digite seu problema de matemática ou toque em Σ…"
    },
    "Search, e.g. circle, derivative, log": {
      ur: "تلاش کریں، مثلاً دائرہ، ڈیریویٹیو، لاگ", hi: "खोजें, जैसे वृत्त, अवकलज, लॉग", ro: "Talash karein, maslan circle, derivative, log", tr: "Ara, örn. çember, türev, log", es: "Buscar, ej. círculo, derivada, log", ar: "بحث، مثل دائرة، مشتق، لوغاريتم", fr: "Rechercher, ex. cercle, dérivée, log", de: "Suchen, z.B. Kreis, Ableitung, Log", pt: "Pesquisar, ex. círculo, derivada, log"
    },
    "Search videos, e.g. quadratic": {
      ur: "ویڈیوز تلاش کریں، مثلاً دو درجی مساوات", hi: "वीडियो खोजें, जैसे द्विघात", ro: "Videos talash karein, maslan quadratic", tr: "Video ara, örn. ikinci dereceden", es: "Buscar videos, ej. cuadrática", ar: "بحث في الفيديوهات، مثل تربيعية", fr: "Rechercher des vidéos, ex. quadratique", de: "Videos suchen, z.B. quadratisch", pt: "Pesquisar vídeos, ex. quadrática"
    },
    "Your answer (number, or a fraction like 3/4)": {
      ur: "آپ کا جواب (نمبر، یا کسر جیسے 3/4)", hi: "आपका उत्तर (संख्या, या भिन्न जैसे 3/4)", ro: "Aap ka jawab (number, ya 3/4 jaisi fraction)", tr: "Cevabınız (sayı veya 3/4 gibi bir kesir)", es: "Tu respuesta (número, o fracción como 3/4)", ar: "إجابتك (رقم، أو كسر مثل 3/4)", fr: "Votre réponse (nombre, ou fraction comme 3/4)", de: "Ihre Antwort (Zahl oder Bruch wie 3/4)", pt: "Sua resposta (número ou fração como 3/4)"
    }
  };

  // 3. Socratic Prompt Prefixes per Language
  var PROMPT_PREFIXES = {
    hint: {
      en: "Give hints only, one at a time. Do not reveal the final answer. Problem: ",
      ur: "براہ کرم صرف ایک وقت میں ایک اشارہ دیں، حتمی جواب مت بتائیں۔ سوال: ",
      hi: "कृपया एक बार में केवल एक संकेत दें, अंतिम उत्तर प्रकट न करें। प्रश्न: ",
      ro: "Sirf ek ek karke ishārah dein, aakhri jawab mat batayein. Roman Urdu mein samjhayein. Sawāl: ",
      tr: "Yalnızca birer birer ipucu ver. Nihai cevabı açıklama. Türkçe açıkla. Problem: ",
      es: "Da solo pistas, una a la vez. No reveles la respuesta final. Explica en español. Problema: ",
      ar: "قدم تلميحات فقط، واحداً تلو الآخر. لا تكشف عن الإجابة النهائية. اشرح بالعربية. المسألة: ",
      fr: "Donnez des indices seulement, un à la fois. Ne révélez pas la réponse finale. Expliquez en français. Problème: ",
      de: "Gib nur Hinweise, einen nach dem anderen. Verrate nicht die endgültige Antwort. Auf Deutsch erklären. Aufgabe: ",
      pt: "Dê apenas dicas, uma de cada vez. Não revele a resposta final. Explique em português. Problema: "
    },
    socratic: {
      en: "Act as a Socratic tutor: ask guiding questions, never give the answer. Problem: ",
      ur: "بطور سقراطی استاد رہنمائی کریں: رہنما سوالات پوچھیں، جواب نہ دیں۔ سوال: ",
      hi: "एक सुकराती शिक्षक के रूप में कार्य करें: मार्गदर्शन करने वाले प्रश्न पूछें, कभी उत्तर न दें। प्रश्न: ",
      ro: "Socratic ustaad ki tarah rehnuma sawalat poochein, seedha jawab mat dein. Sawāl: ",
      tr: "Sokratik bir öğretmen gibi davran: yönlendirici sorular sor, asla doğrudan cevabı verme. Türkçe açıkla. Problem: ",
      es: "Actúa como un tutor socrático: haz preguntas guía, nunca des la respuesta. Explica en español. Problema: ",
      ar: "تصرف كمعلم سقراطي: اطرح أسئلة توجيهية، ولا تقدم الإجابة أبدًا. اشرح بالعربية. المسألة: ",
      fr: "Agissez comme un tuteur socratique: posez des questions directrices, ne donnez jamais la réponse. Problème: ",
      de: "Handeln Sie als sokratischer Tutor: Stellen Sie Leitfragen, geben Sie niemals die Antwort. Aufgabe: ",
      pt: "Aja como um tutor socrático: faça perguntas orientadoras, nunca dê a resposta. Problema: "
    }
  };

  // 4. State Management
  var STORAGE_KEY = "msiq_lang";
  var currentLang = localStorage.getItem(STORAGE_KEY) || "en";
  if (!LANGUAGES[currentLang]) currentLang = "en";

  // 5. Google Translate Cookie Helper
  function setGoogleTranslateCookie(lang) {
    var domain = window.location.hostname;
    var target = (lang === "ro" || lang === "en") ? "en" : lang;
    var cookieVal = "/en/" + target;
    document.cookie = "googtrans=" + cookieVal + "; path=/;";
    if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
      document.cookie = "googtrans=" + cookieVal + "; path=/; domain=" + domain + ";";
      document.cookie = "googtrans=" + cookieVal + "; path=/; domain=." + domain + ";";
    }
  }

  // 6. Direct DOM Dictionary Translation
  function translateDOM(lang) {
    var isRTL = (lang === "ur" || lang === "ar");
    document.documentElement.setAttribute("lang", lang === "ro" ? "ur-Latn" : lang);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");

    // Translate text nodes & elements matching dictionary
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var txt = node.nodeValue.trim();
      if (!txt) continue;
      if (DICTIONARY[txt] && DICTIONARY[txt][lang]) {
        node.nodeValue = node.nodeValue.replace(txt, DICTIONARY[txt][lang]);
      } else if (lang === "en") {
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

    // Translate input placeholders
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

    // Translate buttons
    document.querySelectorAll("button, a.btn, .chip").forEach(function (btn) {
      var textNode = Array.from(btn.childNodes).find(function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
      if (textNode) {
        var t = textNode.nodeValue.trim();
        if (DICTIONARY[t] && DICTIONARY[t][lang]) {
          textNode.nodeValue = textNode.nodeValue.replace(t, DICTIONARY[t][lang]);
        }
      }
    });

    // Update Socratic & Hint mode chip prefixes
    var chips = document.querySelectorAll("#modes .chip");
    if (chips.length >= 3) {
      chips[1].setAttribute("data-m", PROMPT_PREFIXES.hint[lang] || PROMPT_PREFIXES.hint.en);
      chips[2].setAttribute("data-m", PROMPT_PREFIXES.socratic[lang] || PROMPT_PREFIXES.socratic.en);
    }
  }

  // 7. Inject Google Translate Script
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
        includedLanguages: "ur,hi,es,ar,fr,de,pt,tr,en",
        autoDisplay: false
      }, "google_translate_element");
    };

    if (!document.getElementById("msiq-gte-script")) {
      var s = document.createElement("script");
      s.id = "msiq-gte-script";
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.head.appendChild(s);
    }
  }

  // 8. Trigger Translation via Widget or Reload
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    setGoogleTranslateCookie(lang);

    // Apply immediate client-side dictionary overrides
    translateDOM(lang);

    // Trigger Google Translate combo if available
    var gCombo = document.querySelector(".goog-te-combo");
    if (gCombo) {
      gCombo.value = (lang === "ro" || lang === "en") ? "en" : lang;
      gCombo.dispatchEvent(new Event("change"));
    }
  }

  // 9. Inject Universal Header Language Dropdown
  function injectDropdown() {
    if (document.getElementById("msiq-lang-wrap")) return;

    var wrap = document.createElement("div");
    wrap.id = "msiq-lang-wrap";
    wrap.className = "msiq-lang-wrap";

    var icon = document.createElement("span");
    icon.className = "msiq-lang-icon";
    icon.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>';

    var select = document.createElement("select");
    select.id = "msiq-lang-select";
    select.className = "msiq-lang-select";
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

    wrap.appendChild(icon);
    wrap.appendChild(select);

    var header = document.querySelector("header");
    var topBar = document.querySelector(".top");

    if (header) {
      var headerWrap = header.querySelector(".wrap") || header;
      var themeBtn = headerWrap.querySelector("#theme");
      if (themeBtn) {
        headerWrap.insertBefore(wrap, themeBtn);
      } else {
        headerWrap.appendChild(wrap);
      }
    } else if (topBar) {
      var subHeader = document.createElement("header");
      subHeader.className = "msiq-subpage-header";
      topBar.parentNode.insertBefore(subHeader, topBar);
      subHeader.appendChild(topBar);
      topBar.appendChild(wrap);
    }
  }

  // 10. Inject Custom Dark-Slate Theme Styles
  function injectStyles() {
    if (document.getElementById("msiq-lang-styles")) return;
    var style = document.createElement("style");
    style.id = "msiq-lang-styles";
    style.textContent = [
      ".msiq-lang-wrap {",
      "  display: inline-flex; align-items: center; gap: 6px;",
      "  background: #0b0f19; border: 1px solid #1e293b; border-radius: 10px;",
      "  padding: 4px 8px; color: #f8fafc; font-size: 13.5px; z-index: 50;",
      "  transition: border-color .15s ease, box-shadow .15s ease;",
      "}",
      ".msiq-lang-wrap:hover, .msiq-lang-wrap:focus-within {",
      "  border-color: #0f766e; box-shadow: 0 0 0 2px rgba(15,118,110,0.25);",
      "}",
      ".msiq-lang-icon svg {",
      "  width: 15px; height: 15px; stroke: #2dd4bf; fill: none; stroke-width: 2;",
      "  stroke-linecap: round; stroke-linejoin: round; display: block;",
      "}",
      ".msiq-lang-select {",
      "  background: transparent; border: none; color: #f8fafc;",
      "  font: 500 13px system-ui, -apple-system, sans-serif; cursor: pointer; outline: none;",
      "}",
      ".msiq-lang-select option { background: #0b0f19; color: #f8fafc; padding: 4px; }",
      "/* Clean up Google Translate widgets */",
      ".goog-te-banner-frame, .skiptranslate > iframe, #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }",
      "body { top: 0px !important; }",
      ".goog-te-gadget { display: none !important; }",
      "/* RTL bidirectional layout safety */",
      "[dir='rtl'] { text-align: right; }",
      "[dir='rtl'] .doc { text-align: right; }",
      "[dir='rtl'] .math, [dir='rtl'] .step, [dir='rtl'] canvas, [dir='rtl'] input[inputmode='decimal'], [dir='rtl'] .score {",
      "  direction: ltr !important; unicode-bidi: embed !important; text-align: left;",
      "}",
      "@media(max-width:899px) {",
      "  .msiq-lang-wrap { padding: 3px 6px; font-size: 12px; }",
      "  .msiq-lang-select { font-size: 12px; }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  // 11. Dynamic Content Mutation Observer (for Solver outputs, Quiz options)
  function setupObserver() {
    var observer = new MutationObserver(function (mutations) {
      if (currentLang === "en") return;
      mutations.forEach(function (m) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              var textNodes = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
              var n;
              while ((n = textNodes.nextNode())) {
                var val = n.nodeValue.trim();
                if (DICTIONARY[val] && DICTIONARY[val][currentLang]) {
                  n.nodeValue = n.nodeValue.replace(val, DICTIONARY[val][currentLang]);
                }
              }
            }
          });
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 12. Lifecycle Initialization
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
})();
