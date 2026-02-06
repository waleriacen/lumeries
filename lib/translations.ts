export type Language = 'de' | 'en' | 'fr' | 'es';

export const languageNames: Record<Language, string> = {
  de: 'DE',
  en: 'EN',
  fr: 'FR',
  es: 'ES',
};

export const translations = {
  de: {
    // Hero
    badge: '100% KOSTENLOS',
    heroTitle: 'Dein persönliches Mondphasen-Poster',
    heroSubtitle: 'Erstelle ein einzigartiges Poster mit dem exakten Mond deiner besonderen Nacht – vollkommen kostenlos.',

    // Form
    formTitle: 'Gestalte dein Poster',
    dateLabel: 'Datum',
    name1Label: 'Name 1',
    name2Label: 'Name 2',
    name1Placeholder: 'Sarah',
    name2Placeholder: 'Michael',
    namesRequired: 'Bitte mindestens einen Namen eingeben',
    textLabel: 'Text wählen',
    customTextLabel: 'Eigener Text',
    customTextPlaceholder: 'Dein eigener Text',
    locationLabel: 'Ort (für Koordinaten)',
    locationPlaceholder: 'Stadt oder Adresse eingeben...',
    taglineLabel: 'Untertitel',
    taglinePlaceholder: 'Für immer & ewig',
    optional: '(optional)',
    required: '*',

    // Email section
    emailSectionText: 'Gib deine Daten ein, um dein kostenloses Poster zu erhalten:',
    firstNameLabel: 'Vorname',
    firstNamePlaceholder: 'Dein Vorname',
    firstNameRequired: 'Bitte Vornamen eingeben',
    emailLabel: 'E-Mail Adresse',
    emailPlaceholder: 'deine@email.de',

    // Button & consent
    submitButton: 'Kostenloses Poster erhalten',
    processing: 'Wird verarbeitet...',
    consentText: 'Mit dem Klick stimmst du zu, E-Mails von uns zu erhalten. Du kannst dich jederzeit abmelden.',

    // Trust badges
    completelyFree: '100% Kostenlos',
    instantDownload: 'Sofort-Download',
    highResolution: 'Hochauflösend',

    // Features
    feature1Title: 'Astronomisch exakt',
    feature1Text: 'Basierend auf echten Mondphasen-Daten',
    feature2Title: 'Persönlich gestaltet',
    feature2Text: 'Mit deinen Namen und besonderem Text',
    feature3Title: 'Perfektes Geschenk',
    feature3Text: 'Für Hochzeiten oder besondere Momente',

    // Success
    successTitle: 'Dein Poster ist unterwegs!',
    successText: 'Wir haben dir eine E-Mail an <strong>{email}</strong> geschickt. Klicke auf den Link in der E-Mail, um dein personalisiertes Mondphasen-Poster herunterzuladen.',
    successSpamNote: 'Keine E-Mail erhalten? Prüfe deinen Spam-Ordner oder versuche es erneut.',

    // Title options
    titleOptions: [
      'Die Nacht als wir uns trafen',
      'Die Nacht unserer Hochzeit',
      'Die Nacht als du geboren wurdest',
      'Der Mond in dieser Nacht',
      'Unsere erste Nacht',
      'Vollmond',
      'Eigener Text',
    ],

    // Preview
    tapToEnlarge: 'Tippe zum Vergrößern',
    closeModal: 'Schließen',

    // Validation
    emailRequired: 'Bitte E-Mail-Adresse eingeben',
    locationRequired: 'Bitte einen Ort auswählen',
    dateRequired: 'Bitte Datum auswählen',
    errorOccurred: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',

    // Default names
    defaultNames: 'Sarah & Michael',

    // Social Proof
    socialProofCount: 'Über 10.000 Paare haben ihr Poster erstellt',
    liveNotification: 'Gerade eben hat jemand aus {city} ein Poster erstellt',
    justNow: 'vor wenigen Sekunden',

    // Urgency
    urgencyBadge: 'Nur noch heute kostenlos',
    limitedText: 'Limitiert auf 500 Poster pro Monat',

    // Testimonials
    testimonial1Name: 'Lisa & Thomas',
    testimonial1Text: 'Wunderschönes Andenken an unsere Hochzeitsnacht!',
    testimonial2Name: 'Anna & Marco',
    testimonial2Text: 'Das perfekte Geschenk für unseren Jahrestag.',
    testimonial3Name: 'Sarah & Jan',
    testimonial3Text: 'So romantisch! Hängt jetzt über unserem Bett.',

    // Share
    shareOnPinterest: 'Auf Pinterest teilen',
    pinterestDescription: 'Personalisiertes Mondphasen-Poster kostenlos erstellen | Astronomisch exakter Mond deiner besonderen Nacht | Perfektes Geschenk Hochzeit Jahrestag Geburt | lumeries.com',
    shareTitle: 'Teile dein Poster',
    shareOnWhatsApp: 'Per WhatsApp teilen',
    shareOnFacebook: 'Auf Facebook teilen',
    shareOnX: 'Auf X teilen',
    copyLink: 'Link kopieren',
    linkCopied: 'Kopiert!',
    shareSuccessTitle: 'Teile es mit Freunden!',
    shareSuccessText: 'Zeig deinen Liebsten, wie besonders der Mond in eurer Nacht war.',

    // Exit Intent
    exitTitle: 'Warte! Dein Poster ist fast fertig',
    exitSubtitle: 'Erstelle in 2 Minuten dein kostenloses Mondphasen-Poster – über 10.000 Paare haben es schon.',
    exitCta: 'Kostenloses Poster erstellen',
    exitDismiss: 'Nein danke, vielleicht später',

    // Referral
    referralTitle: 'Teile die Liebe!',
    referralText: 'Teile Lumeries mit Freunden – ihr beide bekommt Rabatt auf Premium-Poster.',
    referralCode: 'Code kopieren',
    referralCopied: 'Kopiert!',
    referralShare: 'Per WhatsApp teilen',
    referralDiscount: '20% Rabatt für euch beide',

    // Email
    emailSubject: 'Dein Mondphasen-Poster',
    emailGreeting: 'Hallo',
    emailIntro: 'Dein personalisiertes Mondphasen-Poster ist fertig.',
    emailDownloadButton: 'Poster herunterladen',
    emailWhatYouGet: 'Dein Poster:',
    emailFeature1: 'Hochaufloesende Bilddatei',
    emailFeature2: 'Astronomisch korrekte Mondphase',
    emailFeature3: 'Verschiedene Druckformate waehlbar',
    emailPrintTip: 'Hinweis zum Drucken:',
    emailPrintText: 'Du kannst das Bild bei jedem Druckservice ausdrucken lassen, z.B. dm, Rossmann oder online.',
    emailQuestions: 'Bei Fragen antworte auf diese E-Mail.',
    emailUnsubscribe: 'Abmelden',
  },
  en: {
    // Hero
    badge: '100% FREE',
    heroTitle: 'Your Personal Moon Phase Poster',
    heroSubtitle: 'Create a unique poster with the exact moon from your special night – completely free.',

    // Form
    formTitle: 'Design your poster',
    dateLabel: 'Date',
    name1Label: 'Name 1',
    name2Label: 'Name 2',
    name1Placeholder: 'Sarah',
    name2Placeholder: 'Michael',
    namesRequired: 'Please enter at least one name',
    textLabel: 'Choose text',
    customTextLabel: 'Custom text',
    customTextPlaceholder: 'Your custom text',
    locationLabel: 'Location (for coordinates)',
    locationPlaceholder: 'Enter city or address...',
    taglineLabel: 'Tagline',
    taglinePlaceholder: 'Love Always & Forever',
    optional: '(optional)',
    required: '*',

    // Email section
    emailSectionText: 'Enter your details to receive your free poster:',
    firstNameLabel: 'First name',
    firstNamePlaceholder: 'Your first name',
    firstNameRequired: 'Please enter your first name',
    emailLabel: 'Email address',
    emailPlaceholder: 'your@email.com',

    // Button & consent
    submitButton: 'Get free poster',
    processing: 'Processing...',
    consentText: 'By clicking, you agree to receive emails from us. You can unsubscribe at any time.',

    // Trust badges
    completelyFree: '100% Free',
    instantDownload: 'Instant download',
    highResolution: 'High resolution',

    // Features
    feature1Title: 'Astronomically accurate',
    feature1Text: 'Based on real moon phase data',
    feature2Title: 'Personally designed',
    feature2Text: 'With your names and special text',
    feature3Title: 'Perfect gift',
    feature3Text: 'For weddings or special moments',

    // Success
    successTitle: 'Your poster is on its way!',
    successText: 'We\'ve sent an email to <strong>{email}</strong>. Click the link in the email to download your personalized moon phase poster.',
    successSpamNote: 'No email received? Check your spam folder or try again.',

    // Title options
    titleOptions: [
      'The night we met',
      'The night of our wedding',
      'The night you were born',
      'The moon that night',
      'Our first night',
      'Full moon',
      'Custom text',
    ],

    // Preview
    tapToEnlarge: 'Tap to enlarge',
    closeModal: 'Close',

    // Validation
    emailRequired: 'Please enter your email address',
    locationRequired: 'Please select a location',
    dateRequired: 'Please select a date',
    errorOccurred: 'An error occurred. Please try again.',

    // Default names
    defaultNames: 'Sarah & Michael',

    // Social Proof
    socialProofCount: 'Over 10,000 couples have created their poster',
    liveNotification: 'Someone from {city} just created a poster',
    justNow: 'just now',

    // Urgency
    urgencyBadge: 'Free today only',
    limitedText: 'Limited to 500 posters per month',

    // Testimonials
    testimonial1Name: 'Lisa & Thomas',
    testimonial1Text: 'Beautiful keepsake from our wedding night!',
    testimonial2Name: 'Anna & Marco',
    testimonial2Text: 'The perfect gift for our anniversary.',
    testimonial3Name: 'Sarah & Jan',
    testimonial3Text: 'So romantic! Now hanging above our bed.',

    // Share
    shareOnPinterest: 'Share on Pinterest',
    pinterestDescription: 'Create your free personalized moon phase poster | Astronomically accurate moon from your special night | Perfect gift for weddings anniversaries birthdays | lumeries.com',
    shareTitle: 'Share your poster',
    shareOnWhatsApp: 'Share on WhatsApp',
    shareOnFacebook: 'Share on Facebook',
    shareOnX: 'Share on X',
    copyLink: 'Copy link',
    linkCopied: 'Copied!',
    shareSuccessTitle: 'Share it with friends!',
    shareSuccessText: 'Show your loved ones how special the moon was on your night.',

    // Exit Intent
    exitTitle: 'Wait! Your poster is almost ready',
    exitSubtitle: 'Create your free moon phase poster in 2 minutes – over 10,000 couples already have.',
    exitCta: 'Create free poster',
    exitDismiss: 'No thanks, maybe later',

    // Referral
    referralTitle: 'Spread the love!',
    referralText: 'Share Lumeries with friends – you both get a discount on premium posters.',
    referralCode: 'Copy code',
    referralCopied: 'Copied!',
    referralShare: 'Share via WhatsApp',
    referralDiscount: '20% off for both of you',

    // Email
    emailSubject: 'Your Moon Phase Poster',
    emailGreeting: 'Hello',
    emailIntro: 'Your personalized moon phase poster is ready.',
    emailDownloadButton: 'Download poster',
    emailWhatYouGet: 'Your poster:',
    emailFeature1: 'High-resolution image file',
    emailFeature2: 'Astronomically accurate moon phase',
    emailFeature3: 'Multiple print sizes available',
    emailPrintTip: 'Printing note:',
    emailPrintText: 'You can print the image at any print service or photo lab.',
    emailQuestions: 'Questions? Reply to this email.',
    emailUnsubscribe: 'Unsubscribe',
  },
  fr: {
    // Hero
    badge: '100% GRATUIT',
    heroTitle: 'Votre poster personnalisé des phases lunaires',
    heroSubtitle: 'Créez un poster unique avec la lune exacte de votre nuit spéciale – entièrement gratuit.',

    // Form
    formTitle: 'Créez votre poster',
    dateLabel: 'Date',
    name1Label: 'Prénom 1',
    name2Label: 'Prénom 2',
    name1Placeholder: 'Sarah',
    name2Placeholder: 'Michel',
    namesRequired: 'Veuillez entrer au moins un prénom',
    textLabel: 'Choisir le texte',
    customTextLabel: 'Texte personnalisé',
    customTextPlaceholder: 'Votre texte personnalisé',
    locationLabel: 'Lieu (pour coordonnées)',
    locationPlaceholder: 'Entrez une ville ou une adresse...',
    taglineLabel: 'Sous-titre',
    taglinePlaceholder: 'Pour toujours',
    optional: '(optionnel)',
    required: '*',

    // Email section
    emailSectionText: 'Entrez vos informations pour recevoir votre poster gratuit :',
    firstNameLabel: 'Prénom',
    firstNamePlaceholder: 'Votre prénom',
    firstNameRequired: 'Veuillez entrer votre prénom',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'votre@email.fr',

    // Button & consent
    submitButton: 'Obtenir le poster gratuit',
    processing: 'Traitement en cours...',
    consentText: 'En cliquant, vous acceptez de recevoir nos e-mails. Vous pouvez vous désabonner à tout moment.',

    // Trust badges
    completelyFree: '100% Gratuit',
    instantDownload: 'Téléchargement instantané',
    highResolution: 'Haute résolution',

    // Features
    feature1Title: 'Astronomiquement précis',
    feature1Text: 'Basé sur les données réelles des phases lunaires',
    feature2Title: 'Personnellement conçu',
    feature2Text: 'Avec vos noms et texte spécial',
    feature3Title: 'Cadeau parfait',
    feature3Text: 'Pour les mariages ou moments spéciaux',

    // Success
    successTitle: 'Votre poster est en route !',
    successText: 'Nous avons envoyé un e-mail à <strong>{email}</strong>. Cliquez sur le lien dans l\'e-mail pour télécharger votre poster personnalisé.',
    successSpamNote: 'Pas d\'e-mail reçu ? Vérifiez votre dossier spam ou réessayez.',

    // Title options
    titleOptions: [
      'La nuit où nous nous sommes rencontrés',
      'La nuit de notre mariage',
      'La nuit de ta naissance',
      'La lune cette nuit-là',
      'Notre première nuit',
      'Pleine lune',
      'Texte personnalisé',
    ],

    // Preview
    tapToEnlarge: 'Appuyez pour agrandir',
    closeModal: 'Fermer',

    // Validation
    emailRequired: 'Veuillez entrer votre adresse e-mail',
    locationRequired: 'Veuillez sélectionner un lieu',
    dateRequired: 'Veuillez sélectionner une date',
    errorOccurred: 'Une erreur s\'est produite. Veuillez réessayer.',

    // Default names
    defaultNames: 'Sarah & Michel',

    // Social Proof
    socialProofCount: 'Plus de 10 000 couples ont créé leur poster',
    liveNotification: 'Quelqu\'un de {city} vient de créer un poster',
    justNow: 'à l\'instant',

    // Urgency
    urgencyBadge: 'Gratuit aujourd\'hui seulement',
    limitedText: 'Limité à 500 posters par mois',

    // Testimonials
    testimonial1Name: 'Lisa & Thomas',
    testimonial1Text: 'Un magnifique souvenir de notre nuit de noces !',
    testimonial2Name: 'Anna & Marco',
    testimonial2Text: 'Le cadeau parfait pour notre anniversaire.',
    testimonial3Name: 'Sarah & Jan',
    testimonial3Text: 'Tellement romantique ! Maintenant accroché au-dessus de notre lit.',

    // Share
    shareOnPinterest: 'Partager sur Pinterest',
    pinterestDescription: 'Poster personnalisé phases lunaires gratuit | Lune astronomiquement exacte de votre nuit spéciale | Cadeau parfait mariage anniversaire naissance | lumeries.com',
    shareTitle: 'Partagez votre poster',
    shareOnWhatsApp: 'Partager sur WhatsApp',
    shareOnFacebook: 'Partager sur Facebook',
    shareOnX: 'Partager sur X',
    copyLink: 'Copier le lien',
    linkCopied: 'Copié !',
    shareSuccessTitle: 'Partagez avec vos amis !',
    shareSuccessText: 'Montrez à vos proches la lune de votre nuit spéciale.',

    // Exit Intent
    exitTitle: 'Attendez ! Votre poster est presque prêt',
    exitSubtitle: 'Créez votre poster lunaire gratuit en 2 minutes – plus de 10 000 couples l\'ont déjà fait.',
    exitCta: 'Créer mon poster gratuit',
    exitDismiss: 'Non merci, peut-être plus tard',

    // Referral
    referralTitle: 'Partagez l\'amour !',
    referralText: 'Partagez Lumeries avec vos amis – vous recevez tous les deux une réduction sur les posters premium.',
    referralCode: 'Copier le code',
    referralCopied: 'Copié !',
    referralShare: 'Partager via WhatsApp',
    referralDiscount: '-20% pour vous deux',

    // Email
    emailSubject: 'Votre poster de phases lunaires',
    emailGreeting: 'Bonjour',
    emailIntro: 'Votre poster personnalise de phases lunaires est pret.',
    emailDownloadButton: 'Telecharger le poster',
    emailWhatYouGet: 'Votre poster:',
    emailFeature1: 'Image haute resolution',
    emailFeature2: 'Phase lunaire astronomiquement precise',
    emailFeature3: 'Plusieurs formats disponibles',
    emailPrintTip: 'Note pour impression:',
    emailPrintText: 'Vous pouvez imprimer image dans tout service impression.',
    emailQuestions: 'Questions? Repondez a cet e-mail.',
    emailUnsubscribe: 'Se desabonner',
  },
  es: {
    // Hero
    badge: '100% GRATIS',
    heroTitle: 'Tu póster personalizado de fases lunares',
    heroSubtitle: 'Crea un póster único con la luna exacta de tu noche especial – completamente gratis.',

    // Form
    formTitle: 'Diseña tu póster',
    dateLabel: 'Fecha',
    name1Label: 'Nombre 1',
    name2Label: 'Nombre 2',
    name1Placeholder: 'Sara',
    name2Placeholder: 'Miguel',
    namesRequired: 'Por favor, introduce al menos un nombre',
    textLabel: 'Elige el texto',
    customTextLabel: 'Texto personalizado',
    customTextPlaceholder: 'Tu texto personalizado',
    locationLabel: 'Lugar (para coordenadas)',
    locationPlaceholder: 'Introduce una ciudad o dirección...',
    taglineLabel: 'Subtítulo',
    taglinePlaceholder: 'Por siempre jamás',
    optional: '(opcional)',
    required: '*',

    // Email section
    emailSectionText: 'Introduce tus datos para recibir tu póster gratis:',
    firstNameLabel: 'Nombre',
    firstNamePlaceholder: 'Tu nombre',
    firstNameRequired: 'Por favor, introduce tu nombre',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@email.es',

    // Button & consent
    submitButton: 'Obtener póster gratis',
    processing: 'Procesando...',
    consentText: 'Al hacer clic, aceptas recibir emails nuestros. Puedes darte de baja en cualquier momento.',

    // Trust badges
    completelyFree: '100% Gratis',
    instantDownload: 'Descarga instantánea',
    highResolution: 'Alta resolución',

    // Features
    feature1Title: 'Astronómicamente preciso',
    feature1Text: 'Basado en datos reales de fases lunares',
    feature2Title: 'Diseño personalizado',
    feature2Text: 'Con tus nombres y texto especial',
    feature3Title: 'Regalo perfecto',
    feature3Text: 'Para bodas o momentos especiales',

    // Success
    successTitle: '¡Tu póster está en camino!',
    successText: 'Hemos enviado un email a <strong>{email}</strong>. Haz clic en el enlace del email para descargar tu póster personalizado.',
    successSpamNote: '¿No recibiste el email? Revisa tu carpeta de spam o inténtalo de nuevo.',

    // Title options
    titleOptions: [
      'La noche en que nos conocimos',
      'La noche de nuestra boda',
      'La noche en que naciste',
      'La luna esa noche',
      'Nuestra primera noche',
      'Luna llena',
      'Texto personalizado',
    ],

    // Preview
    tapToEnlarge: 'Toca para ampliar',
    closeModal: 'Cerrar',

    // Validation
    emailRequired: 'Por favor, introduce tu dirección de email',
    locationRequired: 'Por favor, selecciona una ubicación',
    dateRequired: 'Por favor, selecciona una fecha',
    errorOccurred: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',

    // Default names
    defaultNames: 'Sara & Miguel',

    // Social Proof
    socialProofCount: 'Más de 10.000 parejas han creado su póster',
    liveNotification: 'Alguien de {city} acaba de crear un póster',
    justNow: 'hace un momento',

    // Urgency
    urgencyBadge: 'Gratis solo hoy',
    limitedText: 'Limitado a 500 pósters por mes',

    // Testimonials
    testimonial1Name: 'Lisa & Thomas',
    testimonial1Text: '¡Un hermoso recuerdo de nuestra noche de bodas!',
    testimonial2Name: 'Anna & Marco',
    testimonial2Text: 'El regalo perfecto para nuestro aniversario.',
    testimonial3Name: 'Sarah & Jan',
    testimonial3Text: 'Tan romántico! Ahora cuelga sobre nuestra cama.',

    // Share
    shareOnPinterest: 'Compartir en Pinterest',
    pinterestDescription: 'Poster personalizado fases lunares gratis | Luna astronómicamente exacta de tu noche especial | Regalo perfecto boda aniversario cumpleaños | lumeries.com',
    shareTitle: 'Comparte tu póster',
    shareOnWhatsApp: 'Compartir en WhatsApp',
    shareOnFacebook: 'Compartir en Facebook',
    shareOnX: 'Compartir en X',
    copyLink: 'Copiar enlace',
    linkCopied: '¡Copiado!',
    shareSuccessTitle: '¡Comparte con tus amigos!',
    shareSuccessText: 'Muestra a tus seres queridos la luna de tu noche especial.',

    // Exit Intent
    exitTitle: '¡Espera! Tu póster está casi listo',
    exitSubtitle: 'Crea tu póster lunar gratuito en 2 minutos – más de 10.000 parejas ya lo tienen.',
    exitCta: 'Crear póster gratis',
    exitDismiss: 'No gracias, quizás después',

    // Referral
    referralTitle: '¡Comparte el amor!',
    referralText: 'Comparte Lumeries con amigos – ambos obtienen descuento en pósters premium.',
    referralCode: 'Copiar código',
    referralCopied: '¡Copiado!',
    referralShare: 'Compartir por WhatsApp',
    referralDiscount: '20% de descuento para ambos',

    // Email
    emailSubject: 'Tu poster de fases lunares',
    emailGreeting: 'Hola',
    emailIntro: 'Tu poster personalizado de fases lunares esta listo.',
    emailDownloadButton: 'Descargar poster',
    emailWhatYouGet: 'Tu poster:',
    emailFeature1: 'Imagen de alta resolucion',
    emailFeature2: 'Fase lunar astronomicamente precisa',
    emailFeature3: 'Varios formatos de impresion',
    emailPrintTip: 'Nota de impresion:',
    emailPrintText: 'Puedes imprimir la imagen en cualquier servicio de impresion.',
    emailQuestions: 'Preguntas? Responde a este correo.',
    emailUnsubscribe: 'Darse de baja',
  },
} as const;

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en;
}

export function detectLanguage(acceptLanguage?: string | null): Language {
  if (!acceptLanguage) return 'en';

  const languages = acceptLanguage.split(',').map(lang => {
    const [code, priority] = lang.trim().split(';q=');
    return {
      code: code.split('-')[0].toLowerCase(),
      priority: priority ? parseFloat(priority) : 1,
    };
  });

  languages.sort((a, b) => b.priority - a.priority);

  for (const lang of languages) {
    if (lang.code === 'de') return 'de';
    if (lang.code === 'fr') return 'fr';
    if (lang.code === 'es') return 'es';
    if (lang.code === 'en') return 'en';
  }

  return 'en';
}
