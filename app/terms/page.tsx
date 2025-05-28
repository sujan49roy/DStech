import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8 pt-24"> {/* Added pt-24 for navbar height */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Terms of Service
          </h1>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using DStech (the "Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of the terms, then you may not access the Service.
            </p>

            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p>
              DStech provides a platform for users to store, share, and discover information, including but not limited to 
              text content, code snippets, datasets, and project documentation ("User Content").
            </p>

            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <p>
              To access certain features of the Service, you may be required to create an account. You are responsible 
              for safeguarding your account password and for any activities or actions under your password. 
              You agree to notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-semibold">4. User Content</h2>
            <p>
              You retain ownership of any intellectual property rights that you hold in your User Content. 
              When you upload, submit, store, send or receive content to or through our Service, you give DStech 
              (and those we work with) a worldwide license to use, host, store, reproduce, modify, create derivative works, 
              communicate, publish, publicly perform, publicly display and distribute such content. This license is for the 
              limited purpose of operating, promoting, and improving our Services, and to develop new ones.
            </p>
            <p>
              You agree not to post User Content that is illegal, obscene, defamatory, threatening, infringing of intellectual 
              property rights, invasive of privacy, or otherwise injurious or objectionable.
            </p>

            <h2 className="text-2xl font-semibold">5. Prohibited Conduct</h2>
            <p>
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside">
              <li>Copying, distributing, or disclosing any part of the Service in any medium.</li>
              <li>Using any automated system, including "robots," "spiders," "offline readers," etc., to access the Service.</li>
              <li>Transmitting spam, chain letters, or other unsolicited email.</li>
              <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
              <li>Taking any action that imposes, or may impose at our sole discretion an unreasonable or disproportionately large load on our infrastructure.</li>
              <li>Uploading invalid data, viruses, worms, or other software agents through the Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold">6. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
              under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the Service or use the account deletion feature if available.
            </p>

            <h2 className="text-2xl font-semibold">7. Disclaimers</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, 
              whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular 
              purpose, non-infringement or course of performance.
            </p>

            <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
            <p>
              In no event shall DStech, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
              indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, 
              use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h2 className="text-2xl font-semibold">9. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction/Country, e.g., "the State of California, United States"], 
              without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold">10. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
              will be determined at our sole discretion.
            </p>

            <h2 className="text-2xl font-semibold">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at [Your Contact Email or Link to Contact Page].
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}