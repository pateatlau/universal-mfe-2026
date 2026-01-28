import type { Translations } from '../types';

/**
 * Hindi translations for the Universal Microfrontend Platform.
 *
 * Translation structure follows namespace conventions:
 * - `common.*` - Shared strings used across the app (owned by host)
 * - `navigation.*` - Navigation-related strings (owned by host)
 * - `errors.*` - Error messages (owned by host)
 * - `hello.*` - HelloRemote MFE namespace (owned by HelloRemote)
 *
 * Pluralization keys use CLDR plural categories:
 * - `one` - Singular form (0, 1 in Hindi)
 * - `other` - Plural form (2+ items)
 *
 * Note: Hindi uses the same plural rules as English for most cases,
 * but 0 is treated as singular in Hindi.
 *
 * Interpolation uses double curly braces: {{variableName}}
 */
export const hi: Translations = {
  common: {
    appName: 'यूनिवर्सल MFE',
    loading: 'लोड हो रहा है...',
    loadingRemote: 'रिमोट कॉम्पोनेन्ट लोड हो रहा है...',
    loadRemote: 'रिमोट कॉम्पोनेन्ट लोड करें',
    subtitle: 'मॉड्यूल फेडरेशन के माध्यम से रिमोट कॉम्पोनेन्ट को गतिशील रूप से लोड करना',
    subtitleMobile: 'ScriptManager + MFv2 के माध्यम से रिमोट को गतिशील रूप से लोड करना',
    error: 'एक त्रुटि हुई',
    retry: 'पुनः प्रयास करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sort: 'क्रमबद्ध करें',
    clear: 'साफ़ करें',
    reset: 'रीसेट करें',
    yes: 'हां',
    no: 'नहीं',
    ok: 'ठीक है',
    done: 'हो गया',
    welcome: 'स्वागत है',
    welcomeUser: 'स्वागत है, {{name}}!',
    homeDescription: 'यूनिवर्सल माइक्रोफ्रंटेंड प्लेटफॉर्म का अन्वेषण करें',
    standaloneTitle: {
      web: 'वेब रिमोट - स्टैंडअलोन मोड',
      mobile: 'मोबाइल रिमोट - स्टैंडअलोन',
    },
    standaloneSubtitle: 'रिमोट कॉम्पोनेन्ट को अलगाव में परीक्षण करना',
    items: {
      zero: 'कोई आइटम नहीं',
      one: '{{count}} आइटम',
      other: '{{count}} आइटम',
    },
    pressCount: {
      zero: 'अभी तक कोई प्रेस नहीं',
      one: 'रिमोट बटन {{count}} बार दबाया गया',
      other: 'रिमोट बटन {{count}} बार दबाया गया',
    },
    selected: {
      zero: 'कोई चयनित नहीं',
      one: '{{count}} चयनित',
      other: '{{count}} चयनित',
    },
    lastUpdated: 'अंतिम अपडेट {{date}}',
    createdBy: '{{author}} द्वारा बनाया गया',
    // Settings page section titles
    settings: {
      theme: 'थीम',
      language: 'भाषा',
    },
    // Navigation nested inside common (used via t('navigation.home') with namespace 'common')
    navigation: {
      title: 'नेविगेट करें',
      home: 'होम',
      settings: 'सेटिंग्स',
      remoteHello: 'रिमोट मॉड्यूल',
      profile: 'प्रोफ़ाइल',
      help: 'सहायता',
      about: 'के बारे में',
      logout: 'लॉग आउट',
      login: 'लॉग इन',
      signUp: 'साइन अप',
      menu: 'मेनू',
      openMenu: 'मेनू खोलें',
      closeMenu: 'मेनू बंद करें',
    },
    // Theme nested inside common (used via t('theme.light') with namespace 'common')
    theme: {
      title: 'थीम',
      light: 'लाइट',
      dark: 'डार्क',
      system: 'सिस्टम',
      toggle: 'थीम बदलें',
      currentTheme: 'वर्तमान थीम: {{theme}}',
    },
    // Language nested inside common (used via t('language.title') with namespace 'common')
    language: {
      title: 'भाषा',
      select: 'भाषा चुनें',
      current: 'वर्तमान भाषा: {{language}}',
      english: 'अंग्रेज़ी',
      hindi: 'हिन्दी',
      french: 'फ्रेंच',
      german: 'जर्मन',
      italian: 'इतालवी',
      portuguese: 'पुर्तगाली',
      chinese: 'चीनी',
      japanese: 'जापानी',
      korean: 'कोरियाई',
      arabic: 'अरबी',
    },
  },

  // Keep root-level navigation for backward compatibility
  navigation: {
    home: 'होम',
    settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    help: 'सहायता',
    about: 'के बारे में',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    signUp: 'साइन अप',
    menu: 'मेनू',
    openMenu: 'मेनू खोलें',
    closeMenu: 'मेनू बंद करें',
  },

  errors: {
    generic: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
    network: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
    notFound: 'अनुरोधित संसाधन नहीं मिला।',
    unauthorized: 'आप इस सामग्री को देखने के लिए अधिकृत नहीं हैं।',
    forbidden: 'पहुंच अस्वीकृत।',
    serverError: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।',
    timeout: 'अनुरोध का समय समाप्त हो गया। कृपया पुनः प्रयास करें।',
    validation: 'कृपया अपना इनपुट जांचें और पुनः प्रयास करें।',
    required: '{{field}} आवश्यक है',
    invalidEmail: 'कृपया एक वैध ईमेल पता दर्ज करें',
    invalidPhone: 'कृपया एक वैध फ़ोन नंबर दर्ज करें',
    passwordTooShort: 'पासवर्ड कम से कम {{min}} अक्षरों का होना चाहिए',
    passwordMismatch: 'पासवर्ड मेल नहीं खाते',
    remoteLoadFailed: '{{moduleName}} लोड करने में विफल। कृपया पुनः प्रयास करें।',
    remoteTimeout: '{{moduleName}} को लोड होने में बहुत अधिक समय लगा।',
  },

  accessibility: {
    skipToMain: 'मुख्य सामग्री पर जाएं',
    loading: 'लोड हो रहा है, कृपया प्रतीक्षा करें',
    menuOpen: 'मेनू खुला है',
    menuClosed: 'मेनू बंद है',
    expandedSection: '{{section}} विस्तारित',
    collapsedSection: '{{section}} संकुचित',
    selectedItem: '{{item}} चयनित',
    pageOf: 'पृष्ठ {{current}} का {{total}}',
    resultsCount: {
      zero: 'कोई परिणाम नहीं मिला',
      one: '{{count}} परिणाम मिला',
      other: '{{count}} परिणाम मिले',
    },
  },

  theme: {
    light: 'लाइट',
    dark: 'डार्क',
    system: 'सिस्टम',
    toggle: 'थीम बदलें',
    currentTheme: 'वर्तमान थीम: {{theme}}',
  },

  language: {
    select: 'भाषा चुनें',
    current: 'वर्तमान भाषा: {{language}}',
    english: 'अंग्रेज़ी',
    hindi: 'हिन्दी',
    french: 'फ्रेंच',
    german: 'जर्मन',
    italian: 'इतालवी',
    portuguese: 'पुर्तगाली',
    chinese: 'चीनी',
    japanese: 'जापानी',
    korean: 'कोरियाई',
    arabic: 'अरबी',
  },

  // HelloRemote MFE namespace
  // In a real app, this would be in the MFE's own translation file
  // and merged via mergeTranslations()
  hello: {
    greeting: 'रिमोट से नमस्ते!',
    greetingWithName: 'नमस्ते, {{name}}!',
    clickCount: {
      zero: 'आपने अभी तक क्लिक नहीं किया',
      one: 'आपने {{count}} बार क्लिक किया',
      other: 'आपने {{count}} बार क्लिक किया',
    },
    buttonLabel: 'मुझे क्लिक करें',
    buttonHint: 'काउंटर बढ़ाने के लिए टैप करें',
    description: 'यह कॉम्पोनेन्ट एक रिमोट माइक्रोफ्रंटेंड से लोड किया गया है।',
  },

  // Authentication namespace
  auth: {
    login: {
      title: 'साइन इन करें',
      email: 'ईमेल',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      password: 'पासवर्ड',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      signIn: 'साइन इन',
      forgotPassword: 'पासवर्ड भूल गए?',
      or: 'या',
      continueWithGoogle: 'Google के साथ जारी रखें',
      continueWithGitHub: 'GitHub के साथ जारी रखें',
      noAccount: 'खाता नहीं है? साइन अप करें',
    },
    signup: {
      title: 'खाता बनाएं',
      displayName: 'प्रदर्शन नाम',
      displayNamePlaceholder: 'अपना नाम दर्ज करें',
      email: 'ईमेल',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      password: 'पासवर्ड',
      passwordPlaceholder: 'एक पासवर्ड बनाएं',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      confirmPasswordPlaceholder: 'अपने पासवर्ड की पुष्टि करें',
      signUp: 'साइन अप',
      hasAccount: 'पहले से खाता है? साइन इन करें',
      termsAgreement: 'मैं सेवा की शर्तों और गोपनीयता नीति से सहमत हूं',
      passwordStrength: {
        weak: 'कमज़ोर',
        medium: 'मध्यम',
        strong: 'मज़बूत',
      },
    },
    forgotPassword: {
      title: 'पासवर्ड रीसेट करें',
      description: 'अपना ईमेल दर्ज करें और हम आपको एक रीसेट लिंक भेजेंगे।',
      email: 'ईमेल',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      send: 'रीसेट लिंक भेजें',
      successTitle: 'ईमेल भेजा गया!',
      success: 'पासवर्ड रीसेट ईमेल भेजा गया! अपना इनबॉक्स जांचें।',
      sentTo: 'हमने {{email}} पर एक रीसेट लिंक भेजा है',
      backToLogin: 'साइन इन पर वापस जाएं',
      tryAgain: 'एक अलग ईमेल आज़माएं',
    },
    errors: {
      invalidEmail: 'कृपया एक वैध ईमेल पता दर्ज करें।',
      emailRequired: 'ईमेल आवश्यक है',
      displayNameRequired: 'प्रदर्शन नाम आवश्यक है',
      weakPassword: 'पासवर्ड कम से कम {{min}} अक्षरों का होना चाहिए।',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते।',
      required: 'यह फ़ील्ड आवश्यक है।',
      userNotFound: 'इस ईमेल से कोई खाता नहीं मिला।',
      wrongPassword: 'गलत पासवर्ड।',
      emailInUse: 'इस ईमेल से पहले से एक खाता मौजूद है।',
      tooManyRequests: 'बहुत अधिक प्रयास। कृपया बाद में पुनः प्रयास करें।',
      networkError: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
      genericError: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    },
  },

  // Date/time formatting labels
  datetime: {
    today: 'आज',
    yesterday: 'कल',
    tomorrow: 'कल',
    now: 'अभी',
    justNow: 'अभी-अभी',
    minutesAgo: {
      one: '{{count}} मिनट पहले',
      other: '{{count}} मिनट पहले',
    },
    hoursAgo: {
      one: '{{count}} घंटे पहले',
      other: '{{count}} घंटे पहले',
    },
    daysAgo: {
      one: '{{count}} दिन पहले',
      other: '{{count}} दिन पहले',
    },
    weeksAgo: {
      one: '{{count}} सप्ताह पहले',
      other: '{{count}} सप्ताह पहले',
    },
    monthsAgo: {
      one: '{{count}} महीने पहले',
      other: '{{count}} महीने पहले',
    },
    yearsAgo: {
      one: '{{count}} साल पहले',
      other: '{{count}} साल पहले',
    },
    inMinutes: {
      one: '{{count}} मिनट में',
      other: '{{count}} मिनट में',
    },
    inHours: {
      one: '{{count}} घंटे में',
      other: '{{count}} घंटे में',
    },
    inDays: {
      one: '{{count}} दिन में',
      other: '{{count}} दिन में',
    },
  },
};
