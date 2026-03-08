export default {
  common: {
    appName: 'QuasarMemo',
    impressum: 'Imprint',
    dataProtection: 'Data Protection',
    save: 'Save',
    copy: 'Copied',
    copyError: 'Error copying',
  },
  landing: {
    hero: {
      title: 'Your thoughts.',
      titleHighlight: 'Instantly organized.',
      subtitle:
        'Speak your ideas. QuasarMemo transcribes, analyzes, and summarizes them automatically. You can record your meetings and get a structured, well-described summary right away.',
      cta: 'Record now',
    },
    howItWorks: {
      title: 'How it works',
      step1: {
        title: 'Speak your message',
        desc: 'Start recording with a click on the microphone.',
      },
      step2: {
        title: 'AI processes your recording',
        desc: 'Automatic transcription and summary of the message.',
      },
      step3: {
        title: 'Get your result',
        desc: 'You see the finished transcript and the structured summary.',
      },
    },
    privacy: {
      title: 'Privacy comes first',
      desc: 'Your recordings and summaries are stored locally. There are no user accounts, no tracking, and no advertising.',
    },
    cta: {
      title: 'Ready to think more productively?',
      button: 'Get started',
    },
    footer: {
      copyright: '© 2026 QuasarMemo',
      disclaimer: 'This app is used at your own responsibility.',
    },
  },
  index: {
    microAccess: 'Please allow microphone access',
    emptyState: {
      ready: 'Ready to record',
      setup: 'Setup required',
      tapMic: 'Tap the microphone',
      enterKey: 'Please enter API key',
    },
    result: {
      title: 'AI Result',
      transcript: 'Perfect transcript',
    },
    controls: {
      process: 'Process',
    },
    settings: {
      title: 'Settings',
      geminiKey: 'Gemini Private Key',
      apiKeyLabel: 'Gemini API Key',
    },
    notify: {
      saved: 'Saved',
      done: 'Done',
      geminiError: 'Gemini Error',
      unknownError: 'Unknown error with Gemini',
    },
    meta: {
      title: 'QuasarMemo – AI-powered voice & meeting summary',
      description:
        'QuasarMemo transcribes voice recordings and meetings automatically and creates structured summaries – local, private, and free.',
      keywords: 'Voice memo, AI transcription, Meeting summary, Notes app, Voice recording',
    },
    geminiPrompt: 'Transcribe and summarize.',
  },
  language: {
    label: 'Language',
    de: 'Deutsch',
    en: 'English',
  },
  imprint: {
    title: 'Legal Notice',
    appName: 'QuasarMemo',
    author: 'Bakre',
    address: 'Berlin 12099, Germany',
    noteLabel: 'Note:',
    noteText: 'This is a purely private, free app. No personal data is stored or processed.',
  },
  privacy: {
    title: 'Privacy Policy',
    dataStorage:
      'QuasarMemo does not store any personal data on external servers. All voice recordings and content are stored locally on your device only.',
    aiProcessing:
      "This app acts as an intermediary between you and an AI service (Gemini). Content you send to the AI is processed by Gemini and then displayed within the app. Google's privacy policy applies to the processing of this data by Gemini.",
    apiKey:
      'To use the AI features, your personal Gemini API key is required. It is stored exclusively on your device and is never transmitted to our servers.',
    userResponsibility:
      'What you send to the AI is your own responsibility. The app has no influence over how or where Google or Gemini processes or stores your data.',
    noPayment:
      'Since the app does not involve any financial transactions, no payment information is required.',
  },
};
