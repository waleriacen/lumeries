import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung von Lumeries',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>

        <p className="text-sm text-gray-500 mb-8">Zuletzt aktualisiert: Januar 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Verantwortlicher</h2>
          <p className="text-gray-700">
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
            Lumeries<br />
            E-Mail: contact@lumeries.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Welche Daten wir erheben</h2>
          <p className="text-gray-700 mb-4">Wir erheben folgende Daten:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>E-Mail-Adresse:</strong> Wenn du dich für den kostenlosen Poster-Download anmeldest</li>
            <li><strong>Vorname:</strong> Für die Personalisierung der E-Mail-Kommunikation</li>
            <li><strong>Poster-Daten:</strong> Datum, Namen und Ort die du für dein Poster eingibst</li>
            <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, besuchte Seiten (anonymisiert)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Zweck der Datenverarbeitung</h2>
          <p className="text-gray-700 mb-4">Wir verwenden deine Daten für:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Erstellung und Versand deines personalisierten Mondposters</li>
            <li>Zusendung von E-Mails mit dem Download-Link</li>
            <li>Verbesserung unserer Website und Dienste</li>
            <li>Kundensupport über unseren Chat</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Drittanbieter-Dienste</h2>
          <p className="text-gray-700 mb-4">Wir nutzen folgende Drittanbieter:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Vercel:</strong> Hosting unserer Website (USA)</li>
            <li><strong>Supabase:</strong> Datenbank für Chat-Nachrichten (EU/USA)</li>
            <li><strong>Brevo (Sendinblue):</strong> E-Mail-Versand (EU)</li>
            <li><strong>Stripe:</strong> Zahlungsabwicklung für Premium-Produkte (USA)</li>
            <li><strong>OpenStreetMap/Nominatim:</strong> Ortssuche für Koordinaten</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
          <p className="text-gray-700">
            Wir verwenden nur technisch notwendige Cookies für die Funktionalität der Website
            (z.B. Spracheinstellung, Chat-Session). Wir verwenden keine Tracking-Cookies für Werbezwecke.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Deine Rechte</h2>
          <p className="text-gray-700 mb-4">Du hast das Recht auf:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Auskunft über deine gespeicherten Daten</li>
            <li>Berichtigung unrichtiger Daten</li>
            <li>Löschung deiner Daten</li>
            <li>Einschränkung der Verarbeitung</li>
            <li>Datenübertragbarkeit</li>
            <li>Widerspruch gegen die Verarbeitung</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Kontaktiere uns unter contact@lumeries.com um deine Rechte auszuüben.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Datensicherheit</h2>
          <p className="text-gray-700">
            Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um deine Daten
            gegen Manipulation, Verlust oder unberechtigten Zugriff zu schützen. Unsere Website
            verwendet SSL-Verschlüsselung (HTTPS).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Änderungen</h2>
          <p className="text-gray-700">
            Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren. Die aktuelle
            Version findest du immer auf dieser Seite.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a href="/" className="text-blue-600 hover:text-blue-800">← Zurück zur Startseite</a>
        </div>
      </div>
    </main>
  );
}
