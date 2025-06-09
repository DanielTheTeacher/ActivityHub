
import React from 'react';
import { Link } from 'react-router-dom';

const DisclaimerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brandPageBg py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-lg p-6 md:p-8 space-y-4">
        <div className="mb-6">
            <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brandPrimary-600 hover:bg-brandPrimary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandPrimary-500 transition-colors"
                aria-label="Back to activities"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Activities
            </Link>
        </div>
        
        <img 
            src="../assets/daniel_the_teacher_logo.png" 
            alt="Daniel the Teacher Logo" 
            className="h-28 w-auto mb-5 mx-auto"
        />
        <h1 className="text-2xl font-bold text-brandPrimary-700 mb-6 text-center">
          Disclaimer and Information
        </h1>
        
        <h2 className="text-xl font-semibold text-brandTextPrimary mt-4">Disclaimer</h2>
        <p className="text-brandTextSecondary text-sm leading-relaxed">
          Aktiviteter er hovedsakelig basert på <i>700 classroom activities: conversation, functions, grammar, vocabulary</i>, av Seymour, D., & Popova, M. Disse aktivitetene er skrevet om i språket, og tilpasset en moderne og norsk kulturell kontekst, samt tilpasset VG1 yrkesfag. Hvorvidt disse er endret nok til å regnes som et nytt åndsverk er uavklart, så derfor bør ikke denne siden distribueres utenfor lærer-fellesskapet ved Kristiansund VGS.
        </p>
        <p className="text-brandTextSecondary text-sm leading-relaxed">
          Dette gjelder også innhold fra Skills (vokabular), samt FuelBox-spørsmål.
        </p>

        <h2 className="text-xl font-semibold text-brandTextPrimary mt-6">Website Information</h2>
        <p className="text-brandTextSecondary text-sm leading-relaxed">
          Nettsiden er laget av Daniel Bolstad-Heien. Den er primært programmert i TypeScript (ved bruk av React-rammeverket) med assistanse fra Google Gemini 2.5 pro (03-25), og feilsøking via Anthropic Claude 4 Opus. Aktiviteter er manuelt skrevet om, og skrevet om ved hjelp av Google Gemini 2.5 pro (05-06).
        </p>
        <p className="text-brandTextSecondary text-sm leading-relaxed">
          Alle nettsidefiler er lastet opp til GitHub.com i samsvar med GDPR og skolereglement. Ingen data samles inn fra brukeren. Nettsiden omdirigerer kun til tjenester som også er i samsvar med GDPR og skolereglement, inkludert Microsoft Copilot, som er sanksjonert av Møre og Romsdal Fylkeskommune for bruk i skolesammenheng.
        </p>

        <hr className="my-8 border-brandNeutral-200" />

        <h2 className="text-lg font-semibold text-brandTextPrimary">Reference</h2>
        <p className="text-brandTextSecondary text-sm leading-relaxed">
          Seymour, D., & Popova, M. (2003). <i>700 classroom activities: conversation, functions, grammar, vocabulary</i>. Macmillan Education.
        </p>
      </div>
    </div>
  );
};

export default DisclaimerPage;