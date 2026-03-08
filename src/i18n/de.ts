export default {
  common: {
    appName: 'QuasarMemo',
    impressum: 'Impressum',
    dataProtection: 'Datenschutz',
    save: 'Speichern',
    copy: 'Kopiert',
    copyError: 'Fehler beim Kopieren',
  },
  landing: {
    hero: {
      title: 'Deine Gedanken.',
      titleHighlight: 'Sofort organisiert.',
      subtitle:
        'Sprich deine Ideen ein. QuasarMemo transkribiert, analysiert und fasst sie automatisch zusammen. Du kannst deine Meetings aufnehmen und direkt eine strukturierte, gut beschriebene Zusammenfassung erhalten.',
      cta: 'Jetzt aufnehmen',
    },
    howItWorks: {
      title: 'So funktioniert es',
      step1: {
        title: 'Sprich deine Nachricht',
        desc: 'Starte die Aufnahme mit einem Klick auf das Mikrofon.',
      },
      step2: {
        title: 'KI verarbeitet deine Aufnahme',
        desc: 'Automatische Transkription und Zusammenfassung der Nachricht.',
      },
      step3: {
        title: 'Ergebnis erhalten',
        desc: 'Du siehst das fertige Transkript und die strukturierte Zusammenfassung.',
      },
    },
    privacy: {
      title: 'Datenschutz steht an erster Stelle',
      desc: 'Deine Aufnahmen und Zusammenfassungen werden lokal gespeichert. Es gibt keine Nutzerkonten, kein Tracking und keine Werbung.',
    },
    cta: {
      title: 'Bereit, produktiver zu denken?',
      button: 'Jetzt starten',
    },
    footer: {
      copyright: '© 2026 QuasarMemo',
      disclaimer: 'Diese App wird auf eigene Verantwortung verwendet.',
    },
  },
  index: {
    microAccess: 'Bitte Mikrofonzugriff erlauben',
    emptyState: {
      ready: 'Bereit zur Aufnahme',
      setup: 'Setup erforderlich',
      tapMic: 'Tippe auf das Mikrofon',
      enterKey: 'Bitte API Key eingeben',
    },
    result: {
      title: 'KI Ergebnis',
      transcript: 'Perfektes Transkript',
    },
    controls: {
      process: 'Verarbeiten',
    },
    settings: {
      title: 'Einstellungen',
      geminiKey: 'Gemini Private Schlüssel',
      apiKeyLabel: 'Gemini API Key',
    },
    notify: {
      saved: 'Gespeichert',
      done: 'Fertig',
      geminiError: 'Gemini Fehler',
      unknownError: 'Unbekannter Fehler bei Gemini',
    },
    meta: {
      title: 'QuasarMemo – KI-gestützte Sprach- & Meeting-Zusammenfassung',
      description:
        'QuasarMemo transkribiert Sprachaufnahmen und Meetings automatisch und erstellt strukturierte Zusammenfassungen – lokal, privat und kostenlos.',
      keywords:
        'Sprachmemo, KI Transkription, Meeting Zusammenfassung, Notizen App, Sprachaufnahme',
    },
    geminiPrompt: 'Transkribiere und fasse zusammen.',
  },
  language: {
    label: 'Sprache',
    de: 'Deutsch',
    en: 'English',
  },
  imprint: {
    title: 'Impressum',
    appName: 'QuasarMemo',
    author: 'Bakre',
    address: 'Berlin 12099, Deutschland',
    noteLabel: 'Hinweis:',
    noteText:
      'Dies ist eine rein private, kostenlose App. Es werden keine personenbezogenen Daten gespeichert oder verarbeitet.',
  },
  privacy: {
    title: 'Datenschutz',
    dataStorage:
      'QuasarMemo speichert keinerlei personenbezogene Daten auf externen Servern. Alle Sprachaufnahmen und Inhalte werden nur lokal auf Ihrem Gerät gespeichert.',
    aiProcessing:
      'Diese App fungiert als Vermittler zwischen Ihnen und einer KI (Gemini). Inhalte, die Sie an die KI senden, werden von Gemini verarbeitet und anschließend in der App angezeigt. Für die Verarbeitung dieser Daten durch Gemini gelten die Datenschutzbestimmungen von Google.',
    apiKey:
      'Zur Nutzung der KI-Funktionen ist Ihr persönlicher Gemini API-Key erforderlich. Dieser wird ausschließlich lokal auf Ihrem Gerät gespeichert und niemals an unsere Server übertragen.',
    userResponsibility:
      'Was Sie an die KI senden, liegt in Ihrer eigenen Verantwortung. Die App hat keinen Einfluss darauf, wie und wo Google bzw. Gemini Ihre Daten verarbeitet oder speichert.',
    noPayment:
      'Da die App keine finanziellen Transaktionen beinhaltet, sind auch keine Zahlungsinformationen erforderlich.',
  },
};
