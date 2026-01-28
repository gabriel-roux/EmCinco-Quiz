import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "pt-BR" | "es";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  currency: "BRL" | "USD";
  currencySymbol: string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const spanishCountries = [
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GQ", 
  "GT", "HN", "MX", "NI", "PA", "PY", "PE", "PR", "ES", "UY", "VE"
];

async function detectLocale(): Promise<Locale> {
  try {
    const response = await fetch("https://ipapi.co/json/", { 
      signal: AbortSignal.timeout(3000) 
    });
    const data = await response.json();
    const countryCode = data.country_code;
    
    if (spanishCountries.includes(countryCode)) {
      return "es";
    }
    return "pt-BR";
  } catch {
    const browserLang = navigator.language || "";
    if (browserLang.startsWith("es")) {
      return "es";
    }
    return "pt-BR";
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pt-BR");
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    // Verificar parametro da URL primeiro (?locale=es ou ?locale=pt-BR)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLocale = urlParams.get("locale");
    if (urlLocale === "es" || urlLocale === "pt-BR") {
      setLocale(urlLocale);
      localStorage.setItem("emcinco_locale", urlLocale);
      setIsDetecting(false);
      return;
    }

    const savedLocale = localStorage.getItem("emcinco_locale") as Locale;
    if (savedLocale && (savedLocale === "pt-BR" || savedLocale === "es")) {
      setLocale(savedLocale);
      setIsDetecting(false);
    } else {
      detectLocale().then((detected) => {
        setLocale(detected);
        localStorage.setItem("emcinco_locale", detected);
        setIsDetecting(false);
      });
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("emcinco_locale", newLocale);
  };

  const t = (key: string): string => {
    const translation = translations[locale]?.[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in locale: ${locale}`);
      return translations["pt-BR"]?.[key] || key;
    }
    return translation;
  };

  const currency = locale === "es" ? "USD" : "BRL";
  const currencySymbol = locale === "es" ? "$" : "R$";

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t, currency, currencySymbol }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export const translations: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    "landing.badge": "Avaliação de 1 min",
    "landing.subtitle": "Aprenda novas habilidades em apenas 5 minutos por dia. Descubra agora se você tem potencial para dominar qualquer habilidade em 4 semanas.",
    "landing.cta": "Quero descobrir meu perfil",
    "landing.feature1": "Aprenda novas habilidades",
    "landing.feature2": "Leva 1 minuto",
    "landing.feature3": "Base científica",
    
    "quiz.age.question": "Qual é a sua faixa etária?",
    "quiz.age.highlight": "faixa etária",
    "quiz.age.micro": "Perfil",
    "quiz.age.opt1": "18-24 anos",
    "quiz.age.opt2": "25-34 anos",
    "quiz.age.opt3": "35-44 anos",
    "quiz.age.opt4": "45-54 anos",
    "quiz.age.opt5": "55 anos ou mais",
    
    "quiz.struggle.question": "Seja sincero: o que costuma acontecer quando você tenta aprender algo novo?",
    "quiz.struggle.highlight": "aprender algo novo",
    "quiz.struggle.micro": "Autoconhecimento",
    "quiz.struggle.opt1": "Começo animado, mas me distraio fácil",
    "quiz.struggle.opt2": "Penso demais... e acabo nem começando",
    "quiz.struggle.opt3": "Sou consistente, mas evoluo muito devagar",
    "quiz.struggle.opt4": "Fico perdido, não sei por onde começar",
    "quiz.struggle.opt5": "Simplesmente não tenho tempo",
    
    "quiz.consistency.statement": "Eu tenho potencial, só não consigo manter a consistência.",
    "quiz.consistency.sub": "Você concorda com essa afirmação?",
    "quiz.consistency.highlight": "consistência",
    "quiz.consistency.micro": "Foco e Atenção",
    
    "quiz.focus.statement": "Quando eu realmente foco, eu vou longe. O difícil é entrar no foco.",
    "quiz.focus.sub": "Você concorda com essa afirmação?",
    "quiz.focus.highlight": "entrar no foco",
    "quiz.focus.micro": "Foco e Atenção",
    
    "quiz.focusBlockers.question": "Hoje em dia, qual é o seu maior desafio com foco e produtividade?",
    "quiz.focusBlockers.highlight": "foco e produtividade",
    "quiz.focusBlockers.micro": "Bloqueios",
    "quiz.focusBlockers.opt1": "Dificuldade em manter o foco por muito tempo",
    "quiz.focusBlockers.opt2": "Minha mente se dispersa fácil",
    "quiz.focusBlockers.opt3": "Procrastino e fico sem clareza do que fazer",
    "quiz.focusBlockers.opt4": "Chego mentalmente esgotado no fim do dia",
    
    "quiz.autopilot.statement": "Sinto que meus dias acontecem no piloto automático.",
    "quiz.autopilot.sub": "Você concorda?",
    "quiz.autopilot.highlight": "piloto automático",
    "quiz.autopilot.micro": "Rotina",
    
    "quiz.typicalDay.question": "Como você descreveria um dia típico da sua rotina?",
    "quiz.typicalDay.highlight": "sua rotina",
    "quiz.typicalDay.micro": "Rotina",
    "quiz.typicalDay.opt1": "Sempre corrido, sem tempo pra nada",
    "quiz.typicalDay.opt2": "Ocupado, mas administrável",
    "quiz.typicalDay.opt3": "Calmo, porém sem foco",
    "quiz.typicalDay.opt4": "Caótico e imprevisível",
    
    "quiz.screenDistraction.question": "Com que frequência o seu celular acaba roubando sua atenção, mesmo quando você quer se concentrar?",
    "quiz.screenDistraction.highlight": "se concentrar",
    "quiz.screenDistraction.micro": "Distrações",
    "quiz.screenDistraction.opt1": "Quase o tempo todo",
    "quiz.screenDistraction.opt2": "Várias vezes ao dia",
    "quiz.screenDistraction.opt3": "Algumas vezes",
    "quiz.screenDistraction.opt4": "Quase nunca",
    
    "quiz.dedicatedTime.question": "Sendo realista: quanto tempo por dia você consegue dedicar para evoluir?",
    "quiz.dedicatedTime.highlight": "evoluir",
    "quiz.dedicatedTime.micro": "Tempo",
    "quiz.dedicatedTime.opt1": "2 minutos",
    "quiz.dedicatedTime.opt2": "5 minutos (ideal para a sua rotina)",
    "quiz.dedicatedTime.opt3": "10 minutos",
    "quiz.dedicatedTime.opt4": "15 minutos ou mais",
    
    "quiz.routineChaos.question": "Como você se sente em relação ao seu progresso hoje?",
    "quiz.routineChaos.highlight": "progresso",
    "quiz.routineChaos.micro": "Progresso",
    "quiz.routineChaos.opt1": "Me sinto estagnado e sem direção",
    "quiz.routineChaos.opt2": "Começo muitas coisas, mas não termino",
    "quiz.routineChaos.opt3": "Sei que poderia render muito mais",
    "quiz.routineChaos.opt4": "Estou bem, mas quero melhorar",
    
    "quiz.fixPriority.question": "O que você quer melhorar primeiro?",
    "quiz.fixPriority.highlight": "melhorar primeiro",
    "quiz.fixPriority.micro": "Prioridades",
    "quiz.fixPriority.opt1": "Disciplina",
    "quiz.fixPriority.opt2": "Foco",
    "quiz.fixPriority.opt3": "Confiança",
    "quiz.fixPriority.opt4": "Consistência",
    "quiz.fixPriority.opt5": "Carreira / Dinheiro",
    "quiz.fixPriority.opt6": "Criatividade",
    "quiz.fixPriority.opt7": "Ansiedade",
    "quiz.fixPriority.opt8": "Energia",
    
    "quiz.story1.title": "Seu problema não é preguiça.",
    "quiz.story1.highlight": "não é preguiça",
    "quiz.story1.text": "Se aprender parece difícil, é porque o seu sistema está sobrecarregado: atenção dispersa, metas confusas e decisões demais. O nosso método reconstrói esse sistema em apenas 5 minutos por dia.",
    
    "quiz.sufferingArea.question": "O que mais sofre quando sua consistência falha?",
    "quiz.sufferingArea.highlight": "consistência falha",
    "quiz.sufferingArea.micro": "Impacto",
    "quiz.sufferingArea.opt1": "Carreira e promoções",
    "quiz.sufferingArea.opt2": "Confiança pessoal",
    "quiz.sufferingArea.opt3": "Renda e finanças",
    "quiz.sufferingArea.opt4": "Relacionamentos",
    "quiz.sufferingArea.opt5": "Saúde mental",
    "quiz.sufferingArea.opt6": "Criatividade",
    "quiz.sufferingArea.opt7": "Motivação",
    
    "quiz.skillInterest.question": "Que tipo de habilidade você mais gostaria de desenvolver agora?",
    "quiz.skillInterest.highlight": "desenvolver",
    "quiz.skillInterest.micro": "Habilidades",
    "quiz.skillInterest.opt1": "Tecnologia e IA",
    "quiz.skillInterest.opt2": "Comunicação",
    "quiz.skillInterest.opt3": "Negócios",
    "quiz.skillInterest.opt4": "Criatividade",
    "quiz.skillInterest.opt5": "Mente e corpo",
    "quiz.skillInterest.opt6": "Idiomas",
    
    "quiz.learningStyle.question": "Qual formato de aprendizado funciona melhor para você?",
    "quiz.learningStyle.highlight": "aprendizado",
    "quiz.learningStyle.micro": "Estilo",
    "quiz.learningStyle.opt1": "Microlições rápidas e diretas",
    "quiz.learningStyle.opt2": "Passo a passo, bem estruturado",
    "quiz.learningStyle.opt3": "Leitura no meu ritmo",
    "quiz.learningStyle.opt4": "Aprender na prática, fazendo",
    "quiz.learningStyle.opt5": "Um pouco de tudo",
    
    "quiz.badHabits.question": "Quais hábitos estão te atrapalhando?",
    "quiz.badHabits.highlight": "atrapalhando",
    "quiz.badHabits.micro": "Hábitos",
    "quiz.badHabits.opt1": "Dormir tarde",
    "quiz.badHabits.opt2": "Tempo de tela",
    "quiz.badHabits.opt3": "Rolar feed infinito",
    "quiz.badHabits.opt4": "Pular treinos",
    "quiz.badHabits.opt5": "Açúcar",
    "quiz.badHabits.opt6": "Procrastinação",
    "quiz.badHabits.opt7": "Pensar demais",
    "quiz.badHabits.opt8": "Nenhum",
    
    "quiz.authority.title": "Fundamentado em neurociência.",
    "quiz.authority.highlight": "neurociência",
    "quiz.authority.text": "Nossa IA combina micro-hábitos, ambiente certos e pequenos reforços de dopamina, deixando sua evolução fácil e natural.",
    
    "quiz.appExperience.question": "Você já tentou melhorar sua produtividade com outros métodos?",
    "quiz.appExperience.highlight": "outros métodos",
    "quiz.appExperience.micro": "Experiência",
    "quiz.appExperience.opt1": "Sim, mas acabei desistindo",
    "quiz.appExperience.opt2": "Sim, e ainda uso alguns",
    "quiz.appExperience.opt3": "Não, estou começando agora",
    
    "quiz.expertReview.title": "Missões diárias personalizadas.",
    "quiz.expertReview.highlight": "personalizadas",
    "quiz.expertReview.text": "Com base nas suas respostas, criamos uma trilha única com missões de 5 minutos que se adaptam ao seu ritmo. Sem esforço. Sem decisões. Apenas seguir o plano.",
    
    "quiz.outcomeDesire.question": "Como sua vida melhora quando você resolve isso?",
    "quiz.outcomeDesire.highlight": "resolve isso",
    "quiz.outcomeDesire.micro": "Resultados",
    "quiz.outcomeDesire.opt1": "Melhor desempenho",
    "quiz.outcomeDesire.opt2": "Mais dinheiro",
    "quiz.outcomeDesire.opt3": "Mais confiança",
    "quiz.outcomeDesire.opt4": "Foco afiado",
    "quiz.outcomeDesire.opt5": "Menos ansiedade",
    "quiz.outcomeDesire.opt6": "Criatividade",
    "quiz.outcomeDesire.opt7": "Disciplina real",
    
    "quiz.habitStacking.title": "Sua jornada de 4 semanas está sendo criada.",
    "quiz.habitStacking.highlight": "4 semanas",
    "quiz.habitStacking.text": "Estamos analisando seu perfil e montando uma trilha que elimina a procrastinação e coloca você em modo de evolução constante.",
    
    "quiz.summary.title": "Análise de Perfil Concluída",
    "quiz.summary.text": "Seu maior problema é a falta de consistência e não a falta de capacidade. Seu plano priorizará missões curtas diárias para evitar sobrecarga e manter você avançando todos os dias.",
    
    "quiz.commitmentTime.question": "Quanto tempo você quer dedicar diariamente ao seu plano EmCinco?",
    "quiz.commitmentTime.highlight": "plano EmCinco",
    "quiz.commitmentTime.micro": "Compromisso",
    "quiz.commitmentTime.opt1": "5 min",
    "quiz.commitmentTime.opt2": "10 min",
    "quiz.commitmentTime.opt3": "15 min",
    "quiz.commitmentTime.opt4": "20 min",
    
    "quiz.timeline.title": "A partir de agora, esse será o último plano que você irá precisar para aprender algo novo.",
    
    "quiz.email.question": "Digite seu e-mail para receber seu plano personalizado",
    "quiz.email.highlight": "plano personalizado",
    "quiz.email.micro": "Contato",
    "quiz.email.placeholder": "seu@email.com",
    "quiz.email.note": "Prometemos: nada de spam.",
    
    "quiz.name.question": "Qual é o seu nome?",
    "quiz.name.highlight": "seu nome",
    "quiz.name.micro": "Contato",
    "quiz.name.placeholder": "Seu nome",
    
    "quiz.whatsapp.question": "Qual é o seu WhatsApp? (opcional)",
    "quiz.whatsapp.highlight": "WhatsApp",
    "quiz.whatsapp.micro": "Contato",
    "quiz.whatsapp.placeholder": "(11) 99999-9999",
    "quiz.whatsapp.note": "Opcional - para receber dicas extras",
    
    "quiz.continue": "Continuar",
    "quiz.selectAll": "Selecione todas que se aplicam",
    
    "result.urgencyBanner": "Vagas limitadas para o plano de 4 semanas. Restam",
    "result.urgencyAccess": "acessos e",
    "result.urgencyEnds": "Encerra em",
    "result.profileBadge": "Plano adaptado ao seu perfil",
    "result.mechanismTitle": "Mecanismo EmCinco",
    "result.nowLabel": "Agora",
    "result.goalLabel": "Sua Meta",
    "result.whatYouGet": "O que você recebe HOJE:",
    "result.plan4weeks": "Seu plano personalizado de 4 semanas",
    "result.dailyChallenge": "1 desafio novo todos os dias (apenas 5 min)",
    "result.progressTracking": "Acompanhamento de progresso automático",
    "result.weeklyReports": "Relatórios semanais de evolução",
    "result.privateAccess": "Acesso ao painel privado",
    "result.whatsappSupport": "Suporte por WhatsApp",
    "result.guarantee30": "Garantia de 30 dias",
    "result.guaranteeText": "Se você não sentir progresso real, devolvemos 100% do seu dinheiro.",
    "result.ctaButton": "COMEÇAR AGORA - QUERO MUDAR MEU HÁBITO",
    "result.securePayment": "Pagamento seguro",
    "result.noHiddenSubscription": "Sem assinatura oculta",
    "result.easyCancel": "Cancelamento fácil",
    
    "result.plan1week": "Plano 1 Semana",
    "result.plan4week": "Plano 4 Semanas",
    "result.plan12week": "Plano 12 Semanas",
    "result.perDay": "por dia",
    "result.mostPopular": "Mais Popular",
    
    "result.faqTitle": "Perguntas Frequentes",
    "result.faq1q": "Por que a abordagem EmCinco funciona?",
    "result.faq1a": "Nosso plano ajuda você a construir hábitos de forma mais profunda, com mais energia e foco. Combinamos técnicas comprovadas de mudança comportamental com orientação personalizada. Você recebe instruções passo a passo e rotinas que levam apenas 5 minutos por dia.",
    "result.faq2q": "Como este plano pode me ajudar?",
    "result.faq2a": "O EmCinco foi desenvolvido para eliminar a fadiga de decisão e criar momentum consistente. Você vai notar mais clareza mental, energia estável e progresso visível em suas metas.",
    "result.faq3q": "Quando vou começar a sentir os efeitos?",
    "result.faq3a": "A maioria dos usuários relata mudanças notáveis na primeira semana. Os maiores benefícios aparecem após 21 dias de prática consistente.",
    "result.faq4q": "É baseado em ciência?",
    "result.faq4a": "Sim! O EmCinco é baseado em pesquisas de psicologia comportamental, neurociência e formação de hábitos de instituições como Stanford, MIT e Harvard.",
    
    "success.title": "Parabéns",
    "success.subtitle": "Seu acesso foi ativado com sucesso!",
    "success.processing": "Verificando seu pagamento...",
    
    "checkout.title": "Complete seu pedido",
    "checkout.email": "E-mail",
    "checkout.name": "Nome completo",
    "checkout.cardDetails": "Dados do cartão",
    "checkout.pay": "Pagar",
    "checkout.processing": "Processando...",
  },
  "es": {
    "landing.badge": "Evaluación de 1 min",
    "landing.subtitle": "Aprende nuevas habilidades en solo 5 minutos al día. Descubre ahora si tienes el potencial para dominar cualquier habilidad en 4 semanas.",
    "landing.cta": "Quiero descubrir mi perfil",
    "landing.feature1": "Aprende nuevas habilidades",
    "landing.feature2": "Toma 1 minuto",
    "landing.feature3": "Base científica",
    
    "quiz.age.question": "¿Cuál es tu rango de edad?",
    "quiz.age.highlight": "rango de edad",
    "quiz.age.micro": "Perfil",
    "quiz.age.opt1": "18-24 años",
    "quiz.age.opt2": "25-34 años",
    "quiz.age.opt3": "35-44 años",
    "quiz.age.opt4": "45-54 años",
    "quiz.age.opt5": "55 años o más",
    
    "quiz.struggle.question": "Sé honesto: ¿qué suele pasar cuando intentas aprender algo nuevo?",
    "quiz.struggle.highlight": "aprender algo nuevo",
    "quiz.struggle.micro": "Autoconocimiento",
    "quiz.struggle.opt1": "Empiezo emocionado, pero me distraigo fácil",
    "quiz.struggle.opt2": "Pienso demasiado... y termino sin empezar",
    "quiz.struggle.opt3": "Soy consistente, pero avanzo muy lento",
    "quiz.struggle.opt4": "Me siento perdido, no sé por dónde empezar",
    "quiz.struggle.opt5": "Simplemente no tengo tiempo",
    
    "quiz.consistency.statement": "Tengo potencial, solo no logro mantener la consistencia.",
    "quiz.consistency.sub": "¿Estás de acuerdo con esta afirmación?",
    "quiz.consistency.highlight": "consistencia",
    "quiz.consistency.micro": "Enfoque y Atención",
    
    "quiz.focus.statement": "Cuando realmente me enfoco, llego lejos. Lo difícil es entrar en foco.",
    "quiz.focus.sub": "¿Estás de acuerdo con esta afirmación?",
    "quiz.focus.highlight": "entrar en foco",
    "quiz.focus.micro": "Enfoque y Atención",
    
    "quiz.focusBlockers.question": "Hoy en día, ¿cuál es tu mayor desafío con el enfoque y la productividad?",
    "quiz.focusBlockers.highlight": "enfoque y productividad",
    "quiz.focusBlockers.micro": "Bloqueos",
    "quiz.focusBlockers.opt1": "Dificultad para mantener el foco por mucho tiempo",
    "quiz.focusBlockers.opt2": "Mi mente se dispersa fácil",
    "quiz.focusBlockers.opt3": "Procrastino y no tengo claridad de qué hacer",
    "quiz.focusBlockers.opt4": "Llego mentalmente agotado al final del día",
    
    "quiz.autopilot.statement": "Siento que mis días pasan en piloto automático.",
    "quiz.autopilot.sub": "¿Estás de acuerdo?",
    "quiz.autopilot.highlight": "piloto automático",
    "quiz.autopilot.micro": "Rutina",
    
    "quiz.typicalDay.question": "¿Cómo describirías un día típico de tu rutina?",
    "quiz.typicalDay.highlight": "tu rutina",
    "quiz.typicalDay.micro": "Rutina",
    "quiz.typicalDay.opt1": "Siempre corriendo, sin tiempo para nada",
    "quiz.typicalDay.opt2": "Ocupado, pero manejable",
    "quiz.typicalDay.opt3": "Tranquilo, pero sin foco",
    "quiz.typicalDay.opt4": "Caótico e impredecible",
    
    "quiz.screenDistraction.question": "¿Con qué frecuencia tu celular termina robando tu atención, incluso cuando quieres concentrarte?",
    "quiz.screenDistraction.highlight": "concentrarte",
    "quiz.screenDistraction.micro": "Distracciones",
    "quiz.screenDistraction.opt1": "Casi todo el tiempo",
    "quiz.screenDistraction.opt2": "Varias veces al día",
    "quiz.screenDistraction.opt3": "Algunas veces",
    "quiz.screenDistraction.opt4": "Casi nunca",
    
    "quiz.dedicatedTime.question": "Siendo realista: ¿cuánto tiempo al día puedes dedicar para mejorar?",
    "quiz.dedicatedTime.highlight": "mejorar",
    "quiz.dedicatedTime.micro": "Tiempo",
    "quiz.dedicatedTime.opt1": "2 minutos",
    "quiz.dedicatedTime.opt2": "5 minutos (ideal para tu rutina)",
    "quiz.dedicatedTime.opt3": "10 minutos",
    "quiz.dedicatedTime.opt4": "15 minutos o más",
    
    "quiz.routineChaos.question": "¿Cómo te sientes respecto a tu progreso hoy?",
    "quiz.routineChaos.highlight": "progreso",
    "quiz.routineChaos.micro": "Progreso",
    "quiz.routineChaos.opt1": "Me siento estancado y sin dirección",
    "quiz.routineChaos.opt2": "Empiezo muchas cosas, pero no termino",
    "quiz.routineChaos.opt3": "Sé que podría rendir mucho más",
    "quiz.routineChaos.opt4": "Estoy bien, pero quiero mejorar",
    
    "quiz.fixPriority.question": "¿Qué quieres mejorar primero?",
    "quiz.fixPriority.highlight": "mejorar primero",
    "quiz.fixPriority.micro": "Prioridades",
    "quiz.fixPriority.opt1": "Disciplina",
    "quiz.fixPriority.opt2": "Enfoque",
    "quiz.fixPriority.opt3": "Confianza",
    "quiz.fixPriority.opt4": "Consistencia",
    "quiz.fixPriority.opt5": "Carrera / Dinero",
    "quiz.fixPriority.opt6": "Creatividad",
    "quiz.fixPriority.opt7": "Ansiedad",
    "quiz.fixPriority.opt8": "Energía",
    
    "quiz.story1.title": "Tu problema no es pereza.",
    "quiz.story1.highlight": "no es pereza",
    "quiz.story1.text": "Si aprender parece difícil, es porque tu sistema está sobrecargado: atención dispersa, metas confusas y demasiadas decisiones. Nuestro método reconstruye ese sistema en solo 5 minutos al día.",
    
    "quiz.sufferingArea.question": "¿Qué es lo que más sufre cuando falla tu consistencia?",
    "quiz.sufferingArea.highlight": "consistencia falla",
    "quiz.sufferingArea.micro": "Impacto",
    "quiz.sufferingArea.opt1": "Carrera y promociones",
    "quiz.sufferingArea.opt2": "Confianza personal",
    "quiz.sufferingArea.opt3": "Ingresos y finanzas",
    "quiz.sufferingArea.opt4": "Relaciones",
    "quiz.sufferingArea.opt5": "Salud mental",
    "quiz.sufferingArea.opt6": "Creatividad",
    "quiz.sufferingArea.opt7": "Motivación",
    
    "quiz.skillInterest.question": "¿Qué tipo de habilidad te gustaría desarrollar ahora?",
    "quiz.skillInterest.highlight": "desarrollar",
    "quiz.skillInterest.micro": "Habilidades",
    "quiz.skillInterest.opt1": "Tecnología e IA",
    "quiz.skillInterest.opt2": "Comunicación",
    "quiz.skillInterest.opt3": "Negocios",
    "quiz.skillInterest.opt4": "Creatividad",
    "quiz.skillInterest.opt5": "Mente y cuerpo",
    "quiz.skillInterest.opt6": "Idiomas",
    
    "quiz.learningStyle.question": "¿Qué formato de aprendizaje funciona mejor para ti?",
    "quiz.learningStyle.highlight": "aprendizaje",
    "quiz.learningStyle.micro": "Estilo",
    "quiz.learningStyle.opt1": "Microlecciones rápidas y directas",
    "quiz.learningStyle.opt2": "Paso a paso, bien estructurado",
    "quiz.learningStyle.opt3": "Lectura a mi ritmo",
    "quiz.learningStyle.opt4": "Aprender en la práctica, haciendo",
    "quiz.learningStyle.opt5": "Un poco de todo",
    
    "quiz.badHabits.question": "¿Cuáles hábitos te están afectando?",
    "quiz.badHabits.highlight": "afectando",
    "quiz.badHabits.micro": "Hábitos",
    "quiz.badHabits.opt1": "Dormir tarde",
    "quiz.badHabits.opt2": "Tiempo de pantalla",
    "quiz.badHabits.opt3": "Scroll infinito",
    "quiz.badHabits.opt4": "Saltarme entrenamientos",
    "quiz.badHabits.opt5": "Azúcar",
    "quiz.badHabits.opt6": "Procrastinación",
    "quiz.badHabits.opt7": "Pensar demasiado",
    "quiz.badHabits.opt8": "Ninguno",
    
    "quiz.authority.title": "Basado en neurociencia.",
    "quiz.authority.highlight": "neurociencia",
    "quiz.authority.text": "Nuestra IA combina micro-hábitos, ambientes correctos y pequeños refuerzos de dopamina, haciendo tu evolución fácil y natural.",
    
    "quiz.appExperience.question": "¿Has intentado mejorar tu productividad con otros métodos?",
    "quiz.appExperience.highlight": "otros métodos",
    "quiz.appExperience.micro": "Experiencia",
    "quiz.appExperience.opt1": "Sí, pero terminé abandonando",
    "quiz.appExperience.opt2": "Sí, y aún uso algunos",
    "quiz.appExperience.opt3": "No, estoy empezando ahora",
    
    "quiz.expertReview.title": "Misiones diarias personalizadas.",
    "quiz.expertReview.highlight": "personalizadas",
    "quiz.expertReview.text": "Basándonos en tus respuestas, creamos una ruta única con misiones de 5 minutos que se adaptan a tu ritmo. Sin esfuerzo. Sin decisiones. Solo seguir el plan.",
    
    "quiz.outcomeDesire.question": "¿Cómo mejora tu vida cuando resuelves esto?",
    "quiz.outcomeDesire.highlight": "resuelves esto",
    "quiz.outcomeDesire.micro": "Resultados",
    "quiz.outcomeDesire.opt1": "Mejor desempeño",
    "quiz.outcomeDesire.opt2": "Más dinero",
    "quiz.outcomeDesire.opt3": "Más confianza",
    "quiz.outcomeDesire.opt4": "Enfoque afilado",
    "quiz.outcomeDesire.opt5": "Menos ansiedad",
    "quiz.outcomeDesire.opt6": "Creatividad",
    "quiz.outcomeDesire.opt7": "Disciplina real",
    
    "quiz.habitStacking.title": "Tu viaje de 4 semanas se está creando.",
    "quiz.habitStacking.highlight": "4 semanas",
    "quiz.habitStacking.text": "Estamos analizando tu perfil y armando una ruta que elimina la procrastinación y te pone en modo de evolución constante.",
    
    "quiz.summary.title": "Análisis de Perfil Completado",
    "quiz.summary.text": "Tu mayor problema es la falta de consistencia y no la falta de capacidad. Tu plan priorizará misiones cortas diarias para evitar sobrecarga y mantenerte avanzando todos los días.",
    
    "quiz.commitmentTime.question": "¿Cuánto tiempo quieres dedicar diariamente a tu plan EmCinco?",
    "quiz.commitmentTime.highlight": "plan EmCinco",
    "quiz.commitmentTime.micro": "Compromiso",
    "quiz.commitmentTime.opt1": "5 min",
    "quiz.commitmentTime.opt2": "10 min",
    "quiz.commitmentTime.opt3": "15 min",
    "quiz.commitmentTime.opt4": "20 min",
    
    "quiz.timeline.title": "A partir de ahora, este será el último plan que necesitarás para aprender algo nuevo.",
    
    "quiz.email.question": "Ingresa tu email para recibir tu plan personalizado",
    "quiz.email.highlight": "plan personalizado",
    "quiz.email.micro": "Contacto",
    "quiz.email.placeholder": "tu@email.com",
    "quiz.email.note": "Prometemos: nada de spam.",
    
    "quiz.name.question": "¿Cuál es tu nombre?",
    "quiz.name.highlight": "tu nombre",
    "quiz.name.micro": "Contacto",
    "quiz.name.placeholder": "Tu nombre",
    
    "quiz.whatsapp.question": "¿Cuál es tu WhatsApp? (opcional)",
    "quiz.whatsapp.highlight": "WhatsApp",
    "quiz.whatsapp.micro": "Contacto",
    "quiz.whatsapp.placeholder": "+52 55 1234 5678",
    "quiz.whatsapp.note": "Opcional - para recibir consejos extras",
    
    "quiz.continue": "Continuar",
    "quiz.selectAll": "Selecciona todas las que apliquen",
    
    "result.urgencyBanner": "Lugares limitados para el plan de 4 semanas. Quedan",
    "result.urgencyAccess": "accesos y",
    "result.urgencyEnds": "Termina en",
    "result.profileBadge": "Plan adaptado a tu perfil",
    "result.mechanismTitle": "Mecanismo EmCinco",
    "result.nowLabel": "Ahora",
    "result.goalLabel": "Tu Meta",
    "result.whatYouGet": "Lo que recibes HOY:",
    "result.plan4weeks": "Tu plan personalizado de 4 semanas",
    "result.dailyChallenge": "1 desafío nuevo todos los días (solo 5 min)",
    "result.progressTracking": "Seguimiento de progreso automático",
    "result.weeklyReports": "Reportes semanales de evolución",
    "result.privateAccess": "Acceso al panel privado",
    "result.whatsappSupport": "Soporte por WhatsApp",
    "result.guarantee30": "Garantía de 30 días",
    "result.guaranteeText": "Si no sientes progreso real, te devolvemos el 100% de tu dinero.",
    "result.ctaButton": "EMPEZAR AHORA - QUIERO CAMBIAR MI HÁBITO",
    "result.securePayment": "Pago seguro",
    "result.noHiddenSubscription": "Sin suscripción oculta",
    "result.easyCancel": "Cancelación fácil",
    
    "result.plan1week": "Plan 1 Semana",
    "result.plan4week": "Plan 4 Semanas",
    "result.plan12week": "Plan 12 Semanas",
    "result.perDay": "por día",
    "result.mostPopular": "Más Popular",
    
    "result.faqTitle": "Preguntas Frecuentes",
    "result.faq1q": "¿Por qué funciona el enfoque EmCinco?",
    "result.faq1a": "Nuestro plan te ayuda a construir hábitos de forma más profunda, con más energía y enfoque. Combinamos técnicas comprobadas de cambio de comportamiento con orientación personalizada. Recibes instrucciones paso a paso y rutinas que toman solo 5 minutos al día.",
    "result.faq2q": "¿Cómo puede ayudarme este plan?",
    "result.faq2a": "EmCinco fue diseñado para eliminar la fatiga de decisión y crear impulso consistente. Notarás más claridad mental, energía estable y progreso visible en tus metas.",
    "result.faq3q": "¿Cuándo empezaré a sentir los efectos?",
    "result.faq3a": "La mayoría de los usuarios reporta cambios notables en la primera semana. Los mayores beneficios aparecen después de 21 días de práctica consistente.",
    "result.faq4q": "¿Está basado en ciencia?",
    "result.faq4a": "¡Sí! EmCinco está basado en investigaciones de psicología del comportamiento, neurociencia y formación de hábitos de instituciones como Stanford, MIT y Harvard.",
    
    "success.title": "¡Felicitaciones!",
    "success.subtitle": "¡Tu acceso fue activado con éxito!",
    "success.processing": "Verificando tu pago...",
    
    "checkout.title": "Completa tu pedido",
    "checkout.email": "Email",
    "checkout.name": "Nombre completo",
    "checkout.cardDetails": "Datos de la tarjeta",
    "checkout.pay": "Pagar",
    "checkout.processing": "Procesando...",
  }
};

export const pricing = {
  "pt-BR": {
    currency: "BRL",
    currencySymbol: "R$",
    regular: {
      "1week": { price: 10.5, daily: 1.5, original: 49.99 },
      "4week": { price: 19.99, daily: 0.71, original: 49.99 },
      "12week": { price: 34.99, daily: 0.41, original: 99.99 },
    },
    final: {
      "1week": { price: 2.62, daily: 7.14, original: 49.99 },
      "4week": { price: 4.99, daily: 0.17, original: 49.99 },
      "12week": { price: 8.74, daily: 0.10, original: 99.99 },
    }
  },
  "es": {
    currency: "USD",
    currencySymbol: "$",
    regular: {
      "1week": { price: 3.9, daily: 0.56, original: 19.99 },
      "4week": { price: 9.9, daily: 0.35, original: 29.99 },
      "12week": { price: 15.9, daily: 0.19, original: 49.99 },
    },
    final: {
      "1week": { price: 1.9, daily: 0.27, original: 19.99 },
      "4week": { price: 4.9, daily: 0.17, original: 29.99 },
      "12week": { price: 7.9, daily: 0.09, original: 49.99 },
    }
  }
};

export function usePricing() {
  const { locale } = useLocale();
  return pricing[locale];
}
