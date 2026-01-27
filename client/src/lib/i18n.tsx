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
    "landing.badge": "Avaliacao de 1 min",
    "landing.subtitle": "Aprenda novas habilidades em apenas 5 minutos por dia. Descubra agora se voce tem potencial para dominar qualquer habilidade em 4 semanas.",
    "landing.cta": "Quero descobrir meu perfil",
    "landing.feature1": "Aprenda novas habilidades",
    "landing.feature2": "Leva 1 minuto",
    "landing.feature3": "Base cientifica",
    
    "quiz.age.question": "Qual e a sua faixa etaria?",
    "quiz.age.highlight": "faixa etaria",
    "quiz.age.micro": "Perfil",
    "quiz.age.opt1": "18-24 anos",
    "quiz.age.opt2": "25-34 anos",
    "quiz.age.opt3": "35-44 anos",
    "quiz.age.opt4": "45-54 anos",
    "quiz.age.opt5": "55 anos ou mais",
    
    "quiz.struggle.question": "Seja sincero: o que costuma acontecer quando voce tenta aprender algo novo?",
    "quiz.struggle.highlight": "aprender algo novo",
    "quiz.struggle.micro": "Autoconhecimento",
    "quiz.struggle.opt1": "Comeco animado, mas me distraio facil",
    "quiz.struggle.opt2": "Penso demais... e acabo nem comecando",
    "quiz.struggle.opt3": "Sou consistente, mas evoluo muito devagar",
    "quiz.struggle.opt4": "Fico perdido, nao sei por onde comecar",
    "quiz.struggle.opt5": "Simplesmente nao tenho tempo",
    
    "quiz.consistency.statement": "Eu tenho potencial, so nao consigo manter a consistencia.",
    "quiz.consistency.sub": "Voce concorda com essa afirmacao?",
    "quiz.consistency.highlight": "consistencia",
    "quiz.consistency.micro": "Foco e Atencao",
    
    "quiz.focus.statement": "Quando eu realmente foco, eu vou longe. O dificil e entrar no foco.",
    "quiz.focus.sub": "Voce concorda com essa afirmacao?",
    "quiz.focus.highlight": "entrar no foco",
    "quiz.focus.micro": "Foco e Atencao",
    
    "quiz.focusBlockers.question": "Hoje em dia, qual e o seu maior desafio com foco e produtividade?",
    "quiz.focusBlockers.highlight": "foco e produtividade",
    "quiz.focusBlockers.micro": "Bloqueios",
    "quiz.focusBlockers.opt1": "Dificuldade em manter o foco por muito tempo",
    "quiz.focusBlockers.opt2": "Minha mente se dispersa facil",
    "quiz.focusBlockers.opt3": "Procrastino e fico sem clareza do que fazer",
    "quiz.focusBlockers.opt4": "Chego mentalmente esgotado no fim do dia",
    
    "quiz.autopilot.statement": "Sinto que meus dias acontecem no piloto automatico.",
    "quiz.autopilot.sub": "Voce concorda?",
    "quiz.autopilot.highlight": "piloto automatico",
    "quiz.autopilot.micro": "Rotina",
    
    "quiz.typicalDay.question": "Como voce descreveria um dia tipico da sua rotina?",
    "quiz.typicalDay.highlight": "sua rotina",
    "quiz.typicalDay.micro": "Rotina",
    "quiz.typicalDay.opt1": "Sempre corrido, sem tempo pra nada",
    "quiz.typicalDay.opt2": "Ocupado, mas administravel",
    "quiz.typicalDay.opt3": "Calmo, porem sem foco",
    "quiz.typicalDay.opt4": "Caotico e imprevisivel",
    
    "quiz.screenDistraction.question": "Com que frequencia o seu celular acaba roubando sua atencao, mesmo quando voce quer se concentrar?",
    "quiz.screenDistraction.highlight": "se concentrar",
    "quiz.screenDistraction.micro": "Distracoes",
    "quiz.screenDistraction.opt1": "Quase o tempo todo",
    "quiz.screenDistraction.opt2": "Varias vezes ao dia",
    "quiz.screenDistraction.opt3": "Algumas vezes",
    "quiz.screenDistraction.opt4": "Quase nunca",
    
    "quiz.dedicatedTime.question": "Sendo realista: quanto tempo por dia voce consegue dedicar para evoluir?",
    "quiz.dedicatedTime.highlight": "evoluir",
    "quiz.dedicatedTime.micro": "Tempo",
    "quiz.dedicatedTime.opt1": "2 minutos",
    "quiz.dedicatedTime.opt2": "5 minutos (ideal para a sua rotina)",
    "quiz.dedicatedTime.opt3": "10 minutos",
    "quiz.dedicatedTime.opt4": "15 minutos ou mais",
    
    "quiz.routineChaos.question": "Como voce se sente em relacao ao seu progresso hoje?",
    "quiz.routineChaos.highlight": "progresso",
    "quiz.routineChaos.micro": "Progresso",
    "quiz.routineChaos.opt1": "Me sinto estagnado e sem direcao",
    "quiz.routineChaos.opt2": "Comeco muitas coisas, mas nao termino",
    "quiz.routineChaos.opt3": "Sei que poderia render muito mais",
    "quiz.routineChaos.opt4": "Estou bem, mas quero melhorar",
    
    "quiz.fixPriority.question": "O que voce quer melhorar primeiro?",
    "quiz.fixPriority.highlight": "melhorar primeiro",
    "quiz.fixPriority.micro": "Prioridades",
    "quiz.fixPriority.opt1": "Disciplina",
    "quiz.fixPriority.opt2": "Foco",
    "quiz.fixPriority.opt3": "Confianca",
    "quiz.fixPriority.opt4": "Consistencia",
    "quiz.fixPriority.opt5": "Carreira / Dinheiro",
    "quiz.fixPriority.opt6": "Criatividade",
    "quiz.fixPriority.opt7": "Ansiedade",
    "quiz.fixPriority.opt8": "Energia",
    
    "quiz.story1.title": "Seu problema nao e preguica.",
    "quiz.story1.highlight": "nao e preguica",
    "quiz.story1.text": "Se aprender parece dificil, e porque o seu sistema esta sobrecarregado: atencao dispersa, metas confusas e decisoes demais. O nosso metodo reconstroi esse sistema em apenas 5 minutos por dia.",
    
    "quiz.sufferingArea.question": "O que mais sofre quando sua consistencia falha?",
    "quiz.sufferingArea.highlight": "consistencia falha",
    "quiz.sufferingArea.micro": "Impacto",
    "quiz.sufferingArea.opt1": "Carreira e promocoes",
    "quiz.sufferingArea.opt2": "Confianca pessoal",
    "quiz.sufferingArea.opt3": "Renda e financas",
    "quiz.sufferingArea.opt4": "Relacionamentos",
    "quiz.sufferingArea.opt5": "Saude mental",
    "quiz.sufferingArea.opt6": "Criatividade",
    "quiz.sufferingArea.opt7": "Motivacao",
    
    "quiz.skillInterest.question": "Que tipo de habilidade voce mais gostaria de desenvolver agora?",
    "quiz.skillInterest.highlight": "desenvolver",
    "quiz.skillInterest.micro": "Habilidades",
    "quiz.skillInterest.opt1": "Tecnologia e IA",
    "quiz.skillInterest.opt2": "Comunicacao",
    "quiz.skillInterest.opt3": "Negocios",
    "quiz.skillInterest.opt4": "Criatividade",
    "quiz.skillInterest.opt5": "Mente e corpo",
    "quiz.skillInterest.opt6": "Idiomas",
    
    "quiz.learningStyle.question": "Qual formato de aprendizado funciona melhor para voce?",
    "quiz.learningStyle.highlight": "aprendizado",
    "quiz.learningStyle.micro": "Estilo",
    "quiz.learningStyle.opt1": "Microlcoes rapidas e diretas",
    "quiz.learningStyle.opt2": "Passo a passo, bem estruturado",
    "quiz.learningStyle.opt3": "Leitura no meu ritmo",
    "quiz.learningStyle.opt4": "Aprender na pratica, fazendo",
    "quiz.learningStyle.opt5": "Um pouco de tudo",
    
    "quiz.badHabits.question": "Quais habitos estao te atrapalhando?",
    "quiz.badHabits.highlight": "atrapalhando",
    "quiz.badHabits.micro": "Habitos",
    "quiz.badHabits.opt1": "Dormir tarde",
    "quiz.badHabits.opt2": "Tempo de tela",
    "quiz.badHabits.opt3": "Rolar feed infinito",
    "quiz.badHabits.opt4": "Pular treinos",
    "quiz.badHabits.opt5": "Acucar",
    "quiz.badHabits.opt6": "Procrastinacao",
    "quiz.badHabits.opt7": "Pensar demais",
    "quiz.badHabits.opt8": "Nenhum",
    
    "quiz.authority.title": "Fundamentado em neurociencia.",
    "quiz.authority.highlight": "neurociencia",
    "quiz.authority.text": "Nossa IA combina micro-habitos, ambiente certos e pequenos reforcos de dopamina, deixando sua evolucao facil e natural.",
    
    "quiz.appExperience.question": "Voce ja tentou melhorar sua produtividade com outros metodos?",
    "quiz.appExperience.highlight": "outros metodos",
    "quiz.appExperience.micro": "Experiencia",
    "quiz.appExperience.opt1": "Sim, mas acabei desistindo",
    "quiz.appExperience.opt2": "Sim, e ainda uso alguns",
    "quiz.appExperience.opt3": "Nao, estou comecando agora",
    
    "quiz.expertReview.title": "Missoes diarias personalizadas.",
    "quiz.expertReview.highlight": "personalizadas",
    "quiz.expertReview.text": "Com base nas suas respostas, criamos uma trilha unica com missoes de 5 minutos que se adaptam ao seu ritmo. Sem esforco. Sem decisoes. Apenas seguir o plano.",
    
    "quiz.outcomeDesire.question": "Como sua vida melhora quando voce resolve isso?",
    "quiz.outcomeDesire.highlight": "resolve isso",
    "quiz.outcomeDesire.micro": "Resultados",
    "quiz.outcomeDesire.opt1": "Melhor desempenho",
    "quiz.outcomeDesire.opt2": "Mais dinheiro",
    "quiz.outcomeDesire.opt3": "Mais confianca",
    "quiz.outcomeDesire.opt4": "Foco afiado",
    "quiz.outcomeDesire.opt5": "Menos ansiedade",
    "quiz.outcomeDesire.opt6": "Criatividade",
    "quiz.outcomeDesire.opt7": "Disciplina real",
    
    "quiz.habitStacking.title": "Sua jornada de 4 semanas esta sendo criada.",
    "quiz.habitStacking.highlight": "4 semanas",
    "quiz.habitStacking.text": "Estamos analisando seu perfil e montando uma trilha que elimina a procrastinacao e coloca voce em modo de evolucao constante.",
    
    "quiz.summary.title": "Analise de Perfil Concluida",
    "quiz.summary.text": "Seu maior problema e a falta de consistencia e nao a falta de capacidade. Seu plano priorizara missoes curtas diarias para evitar sobrecarga e manter voce avancando todos os dias.",
    
    "quiz.commitmentTime.question": "Quanto tempo voce quer dedicar diariamente ao seu plano EmCinco?",
    "quiz.commitmentTime.highlight": "plano EmCinco",
    "quiz.commitmentTime.micro": "Compromisso",
    "quiz.commitmentTime.opt1": "5 min",
    "quiz.commitmentTime.opt2": "10 min",
    "quiz.commitmentTime.opt3": "15 min",
    "quiz.commitmentTime.opt4": "20 min",
    
    "quiz.timeline.title": "Apartir de agora, esse sera o ultimo plano que voce ira precisar para aprender algo novo.",
    
    "quiz.email.question": "Digite seu e-mail para receber seu plano personalizado",
    "quiz.email.highlight": "plano personalizado",
    "quiz.email.micro": "Contato",
    "quiz.email.placeholder": "seu@email.com",
    "quiz.email.note": "Prometemos: nada de spam.",
    
    "quiz.name.question": "Qual e o seu nome?",
    "quiz.name.highlight": "seu nome",
    "quiz.name.micro": "Contato",
    "quiz.name.placeholder": "Seu nome",
    
    "quiz.whatsapp.question": "Qual e o seu WhatsApp? (opcional)",
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
    "result.whatYouGet": "O que voce recebe HOJE:",
    "result.plan4weeks": "Seu plano personalizado de 4 semanas",
    "result.dailyChallenge": "1 desafio novo todos os dias (apenas 5 min)",
    "result.progressTracking": "Acompanhamento de progresso automatico",
    "result.weeklyReports": "Relatorios semanais de evolucao",
    "result.privateAccess": "Acesso ao painel privado",
    "result.whatsappSupport": "Suporte por WhatsApp",
    "result.guarantee30": "Garantia de 30 dias",
    "result.guaranteeText": "Se voce nao sentir progresso real, devolvemos 100% do seu dinheiro.",
    "result.ctaButton": "COMECAR AGORA - QUERO MUDAR MEU HABITO",
    "result.securePayment": "Pagamento seguro",
    "result.noHiddenSubscription": "Sem assinatura oculta",
    "result.easyCancel": "Cancelamento facil",
    
    "result.plan1week": "Plano 1 Semana",
    "result.plan4week": "Plano 4 Semanas",
    "result.plan12week": "Plano 12 Semanas",
    "result.perDay": "por dia",
    "result.mostPopular": "Mais Popular",
    
    "result.faqTitle": "Perguntas Frequentes",
    "result.faq1q": "Por que a abordagem EmCinco funciona?",
    "result.faq1a": "Nosso plano ajuda voce a construir habitos de forma mais profunda, com mais energia e foco. Combinamos tecnicas comprovadas de mudanca comportamental com orientacao personalizada. Voce recebe instrucoes passo a passo e rotinas que levam apenas 5 minutos por dia.",
    "result.faq2q": "Como este plano pode me ajudar?",
    "result.faq2a": "O EmCinco foi desenvolvido para eliminar a fadiga de decisao e criar momentum consistente. Voce vai notar mais clareza mental, energia estavel e progresso visivel em suas metas.",
    "result.faq3q": "Quando vou comecar a sentir os efeitos?",
    "result.faq3a": "A maioria dos usuarios relata mudancas notaveis na primeira semana. Os maiores beneficios aparecem apos 21 dias de pratica consistente.",
    "result.faq4q": "E baseado em ciencia?",
    "result.faq4a": "Sim! O EmCinco e baseado em pesquisas de psicologia comportamental, neurociencia e formacao de habitos de instituicoes como Stanford, MIT e Harvard.",
    
    "success.title": "Parabens",
    "success.subtitle": "Seu acesso foi ativado com sucesso!",
    "success.processing": "Verificando seu pagamento...",
    
    "checkout.title": "Complete seu pedido",
    "checkout.email": "E-mail",
    "checkout.name": "Nome completo",
    "checkout.cardDetails": "Dados do cartao",
    "checkout.pay": "Pagar",
    "checkout.processing": "Processando...",
  },
  "es": {
    "landing.badge": "Evaluacion de 1 min",
    "landing.subtitle": "Aprende nuevas habilidades en solo 5 minutos al dia. Descubre ahora si tienes el potencial para dominar cualquier habilidad en 4 semanas.",
    "landing.cta": "Quiero descubrir mi perfil",
    "landing.feature1": "Aprende nuevas habilidades",
    "landing.feature2": "Toma 1 minuto",
    "landing.feature3": "Base cientifica",
    
    "quiz.age.question": "Cual es tu rango de edad?",
    "quiz.age.highlight": "rango de edad",
    "quiz.age.micro": "Perfil",
    "quiz.age.opt1": "18-24 anos",
    "quiz.age.opt2": "25-34 anos",
    "quiz.age.opt3": "35-44 anos",
    "quiz.age.opt4": "45-54 anos",
    "quiz.age.opt5": "55 anos o mas",
    
    "quiz.struggle.question": "Se honesto: que suele pasar cuando intentas aprender algo nuevo?",
    "quiz.struggle.highlight": "aprender algo nuevo",
    "quiz.struggle.micro": "Autoconocimiento",
    "quiz.struggle.opt1": "Empiezo emocionado, pero me distraigo facil",
    "quiz.struggle.opt2": "Pienso demasiado... y termino sin empezar",
    "quiz.struggle.opt3": "Soy consistente, pero avanzo muy lento",
    "quiz.struggle.opt4": "Me siento perdido, no se por donde empezar",
    "quiz.struggle.opt5": "Simplemente no tengo tiempo",
    
    "quiz.consistency.statement": "Tengo potencial, solo no logro mantener la consistencia.",
    "quiz.consistency.sub": "Estas de acuerdo con esta afirmacion?",
    "quiz.consistency.highlight": "consistencia",
    "quiz.consistency.micro": "Enfoque y Atencion",
    
    "quiz.focus.statement": "Cuando realmente me enfoco, llego lejos. Lo dificil es entrar en foco.",
    "quiz.focus.sub": "Estas de acuerdo con esta afirmacion?",
    "quiz.focus.highlight": "entrar en foco",
    "quiz.focus.micro": "Enfoque y Atencion",
    
    "quiz.focusBlockers.question": "Hoy en dia, cual es tu mayor desafio con el enfoque y la productividad?",
    "quiz.focusBlockers.highlight": "enfoque y productividad",
    "quiz.focusBlockers.micro": "Bloqueos",
    "quiz.focusBlockers.opt1": "Dificultad para mantener el foco por mucho tiempo",
    "quiz.focusBlockers.opt2": "Mi mente se dispersa facil",
    "quiz.focusBlockers.opt3": "Procrastino y no tengo claridad de que hacer",
    "quiz.focusBlockers.opt4": "Llego mentalmente agotado al final del dia",
    
    "quiz.autopilot.statement": "Siento que mis dias pasan en piloto automatico.",
    "quiz.autopilot.sub": "Estas de acuerdo?",
    "quiz.autopilot.highlight": "piloto automatico",
    "quiz.autopilot.micro": "Rutina",
    
    "quiz.typicalDay.question": "Como describirias un dia tipico de tu rutina?",
    "quiz.typicalDay.highlight": "tu rutina",
    "quiz.typicalDay.micro": "Rutina",
    "quiz.typicalDay.opt1": "Siempre corriendo, sin tiempo para nada",
    "quiz.typicalDay.opt2": "Ocupado, pero manejable",
    "quiz.typicalDay.opt3": "Tranquilo, pero sin foco",
    "quiz.typicalDay.opt4": "Caotico e impredecible",
    
    "quiz.screenDistraction.question": "Con que frecuencia tu celular termina robando tu atencion, incluso cuando quieres concentrarte?",
    "quiz.screenDistraction.highlight": "concentrarte",
    "quiz.screenDistraction.micro": "Distracciones",
    "quiz.screenDistraction.opt1": "Casi todo el tiempo",
    "quiz.screenDistraction.opt2": "Varias veces al dia",
    "quiz.screenDistraction.opt3": "Algunas veces",
    "quiz.screenDistraction.opt4": "Casi nunca",
    
    "quiz.dedicatedTime.question": "Siendo realista: cuanto tiempo al dia puedes dedicar para mejorar?",
    "quiz.dedicatedTime.highlight": "mejorar",
    "quiz.dedicatedTime.micro": "Tiempo",
    "quiz.dedicatedTime.opt1": "2 minutos",
    "quiz.dedicatedTime.opt2": "5 minutos (ideal para tu rutina)",
    "quiz.dedicatedTime.opt3": "10 minutos",
    "quiz.dedicatedTime.opt4": "15 minutos o mas",
    
    "quiz.routineChaos.question": "Como te sientes respecto a tu progreso hoy?",
    "quiz.routineChaos.highlight": "progreso",
    "quiz.routineChaos.micro": "Progreso",
    "quiz.routineChaos.opt1": "Me siento estancado y sin direccion",
    "quiz.routineChaos.opt2": "Empiezo muchas cosas, pero no termino",
    "quiz.routineChaos.opt3": "Se que podria rendir mucho mas",
    "quiz.routineChaos.opt4": "Estoy bien, pero quiero mejorar",
    
    "quiz.fixPriority.question": "Que quieres mejorar primero?",
    "quiz.fixPriority.highlight": "mejorar primero",
    "quiz.fixPriority.micro": "Prioridades",
    "quiz.fixPriority.opt1": "Disciplina",
    "quiz.fixPriority.opt2": "Enfoque",
    "quiz.fixPriority.opt3": "Confianza",
    "quiz.fixPriority.opt4": "Consistencia",
    "quiz.fixPriority.opt5": "Carrera / Dinero",
    "quiz.fixPriority.opt6": "Creatividad",
    "quiz.fixPriority.opt7": "Ansiedad",
    "quiz.fixPriority.opt8": "Energia",
    
    "quiz.story1.title": "Tu problema no es pereza.",
    "quiz.story1.highlight": "no es pereza",
    "quiz.story1.text": "Si aprender parece dificil, es porque tu sistema esta sobrecargado: atencion dispersa, metas confusas y demasiadas decisiones. Nuestro metodo reconstruye ese sistema en solo 5 minutos al dia.",
    
    "quiz.sufferingArea.question": "Que es lo que mas sufre cuando falla tu consistencia?",
    "quiz.sufferingArea.highlight": "consistencia falla",
    "quiz.sufferingArea.micro": "Impacto",
    "quiz.sufferingArea.opt1": "Carrera y promociones",
    "quiz.sufferingArea.opt2": "Confianza personal",
    "quiz.sufferingArea.opt3": "Ingresos y finanzas",
    "quiz.sufferingArea.opt4": "Relaciones",
    "quiz.sufferingArea.opt5": "Salud mental",
    "quiz.sufferingArea.opt6": "Creatividad",
    "quiz.sufferingArea.opt7": "Motivacion",
    
    "quiz.skillInterest.question": "Que tipo de habilidad te gustaria desarrollar ahora?",
    "quiz.skillInterest.highlight": "desarrollar",
    "quiz.skillInterest.micro": "Habilidades",
    "quiz.skillInterest.opt1": "Tecnologia e IA",
    "quiz.skillInterest.opt2": "Comunicacion",
    "quiz.skillInterest.opt3": "Negocios",
    "quiz.skillInterest.opt4": "Creatividad",
    "quiz.skillInterest.opt5": "Mente y cuerpo",
    "quiz.skillInterest.opt6": "Idiomas",
    
    "quiz.learningStyle.question": "Que formato de aprendizaje funciona mejor para ti?",
    "quiz.learningStyle.highlight": "aprendizaje",
    "quiz.learningStyle.micro": "Estilo",
    "quiz.learningStyle.opt1": "Microlecciones rapidas y directas",
    "quiz.learningStyle.opt2": "Paso a paso, bien estructurado",
    "quiz.learningStyle.opt3": "Lectura a mi ritmo",
    "quiz.learningStyle.opt4": "Aprender en la practica, haciendo",
    "quiz.learningStyle.opt5": "Un poco de todo",
    
    "quiz.badHabits.question": "Cuales habitos te estan afectando?",
    "quiz.badHabits.highlight": "afectando",
    "quiz.badHabits.micro": "Habitos",
    "quiz.badHabits.opt1": "Dormir tarde",
    "quiz.badHabits.opt2": "Tiempo de pantalla",
    "quiz.badHabits.opt3": "Scroll infinito",
    "quiz.badHabits.opt4": "Saltarme entrenamientos",
    "quiz.badHabits.opt5": "Azucar",
    "quiz.badHabits.opt6": "Procrastinacion",
    "quiz.badHabits.opt7": "Pensar demasiado",
    "quiz.badHabits.opt8": "Ninguno",
    
    "quiz.authority.title": "Basado en neurociencia.",
    "quiz.authority.highlight": "neurociencia",
    "quiz.authority.text": "Nuestra IA combina micro-habitos, ambientes correctos y pequenos refuerzos de dopamina, haciendo tu evolucion facil y natural.",
    
    "quiz.appExperience.question": "Has intentado mejorar tu productividad con otros metodos?",
    "quiz.appExperience.highlight": "otros metodos",
    "quiz.appExperience.micro": "Experiencia",
    "quiz.appExperience.opt1": "Si, pero termine abandonando",
    "quiz.appExperience.opt2": "Si, y aun uso algunos",
    "quiz.appExperience.opt3": "No, estoy empezando ahora",
    
    "quiz.expertReview.title": "Misiones diarias personalizadas.",
    "quiz.expertReview.highlight": "personalizadas",
    "quiz.expertReview.text": "Basandonos en tus respuestas, creamos una ruta unica con misiones de 5 minutos que se adaptan a tu ritmo. Sin esfuerzo. Sin decisiones. Solo seguir el plan.",
    
    "quiz.outcomeDesire.question": "Como mejora tu vida cuando resuelves esto?",
    "quiz.outcomeDesire.highlight": "resuelves esto",
    "quiz.outcomeDesire.micro": "Resultados",
    "quiz.outcomeDesire.opt1": "Mejor desempeno",
    "quiz.outcomeDesire.opt2": "Mas dinero",
    "quiz.outcomeDesire.opt3": "Mas confianza",
    "quiz.outcomeDesire.opt4": "Enfoque afilado",
    "quiz.outcomeDesire.opt5": "Menos ansiedad",
    "quiz.outcomeDesire.opt6": "Creatividad",
    "quiz.outcomeDesire.opt7": "Disciplina real",
    
    "quiz.habitStacking.title": "Tu viaje de 4 semanas se esta creando.",
    "quiz.habitStacking.highlight": "4 semanas",
    "quiz.habitStacking.text": "Estamos analizando tu perfil y armando una ruta que elimina la procrastinacion y te pone en modo de evolucion constante.",
    
    "quiz.summary.title": "Analisis de Perfil Completado",
    "quiz.summary.text": "Tu mayor problema es la falta de consistencia y no la falta de capacidad. Tu plan priorizara misiones cortas diarias para evitar sobrecarga y mantenerte avanzando todos los dias.",
    
    "quiz.commitmentTime.question": "Cuanto tiempo quieres dedicar diariamente a tu plan EmCinco?",
    "quiz.commitmentTime.highlight": "plan EmCinco",
    "quiz.commitmentTime.micro": "Compromiso",
    "quiz.commitmentTime.opt1": "5 min",
    "quiz.commitmentTime.opt2": "10 min",
    "quiz.commitmentTime.opt3": "15 min",
    "quiz.commitmentTime.opt4": "20 min",
    
    "quiz.timeline.title": "A partir de ahora, este sera el ultimo plan que necesitaras para aprender algo nuevo.",
    
    "quiz.email.question": "Ingresa tu email para recibir tu plan personalizado",
    "quiz.email.highlight": "plan personalizado",
    "quiz.email.micro": "Contacto",
    "quiz.email.placeholder": "tu@email.com",
    "quiz.email.note": "Prometemos: nada de spam.",
    
    "quiz.name.question": "Cual es tu nombre?",
    "quiz.name.highlight": "tu nombre",
    "quiz.name.micro": "Contacto",
    "quiz.name.placeholder": "Tu nombre",
    
    "quiz.whatsapp.question": "Cual es tu WhatsApp? (opcional)",
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
    "result.dailyChallenge": "1 desafio nuevo todos los dias (solo 5 min)",
    "result.progressTracking": "Seguimiento de progreso automatico",
    "result.weeklyReports": "Reportes semanales de evolucion",
    "result.privateAccess": "Acceso al panel privado",
    "result.whatsappSupport": "Soporte por WhatsApp",
    "result.guarantee30": "Garantia de 30 dias",
    "result.guaranteeText": "Si no sientes progreso real, te devolvemos el 100% de tu dinero.",
    "result.ctaButton": "EMPEZAR AHORA - QUIERO CAMBIAR MI HABITO",
    "result.securePayment": "Pago seguro",
    "result.noHiddenSubscription": "Sin suscripcion oculta",
    "result.easyCancel": "Cancelacion facil",
    
    "result.plan1week": "Plan 1 Semana",
    "result.plan4week": "Plan 4 Semanas",
    "result.plan12week": "Plan 12 Semanas",
    "result.perDay": "por dia",
    "result.mostPopular": "Mas Popular",
    
    "result.faqTitle": "Preguntas Frecuentes",
    "result.faq1q": "Por que funciona el enfoque EmCinco?",
    "result.faq1a": "Nuestro plan te ayuda a construir habitos de forma mas profunda, con mas energia y enfoque. Combinamos tecnicas comprobadas de cambio de comportamiento con orientacion personalizada. Recibes instrucciones paso a paso y rutinas que toman solo 5 minutos al dia.",
    "result.faq2q": "Como puede ayudarme este plan?",
    "result.faq2a": "EmCinco fue disenado para eliminar la fatiga de decision y crear impulso consistente. Notaras mas claridad mental, energia estable y progreso visible en tus metas.",
    "result.faq3q": "Cuando empezare a sentir los efectos?",
    "result.faq3a": "La mayoria de los usuarios reporta cambios notables en la primera semana. Los mayores beneficios aparecen despues de 21 dias de practica consistente.",
    "result.faq4q": "Esta basado en ciencia?",
    "result.faq4a": "Si! EmCinco esta basado en investigaciones de psicologia del comportamiento, neurociencia y formacion de habitos de instituciones como Stanford, MIT y Harvard.",
    
    "success.title": "Felicitaciones",
    "success.subtitle": "Tu acceso fue activado con exito!",
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
