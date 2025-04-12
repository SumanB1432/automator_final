import React from "react";

const PrivacySection = () => {
  return (
    <div className="min-h-screen bg-[#11011E] px-4 sm:px-8 py-12 text-[#ECF1F0] font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Title */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">
            Privacy and Security Policy for JobForm Automator
          </h1>
        </header>

        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Introduction
          </h2>
          <p className="text-base sm:text-lg text-[#B6B6B6] leading-7">
            Welcome to JobForm Automator! We are committed to protecting your
            privacy and ensuring the security of your data while you use our
            browser extension. This Privacy and Security Policy explains how we
            collect, use, and safeguard your information. By using our
            extension, you consent to the practices described in this policy.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Information We Collect
          </h2>
          <div className="ml-4 space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">
                User-Provided Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-[#B6B6B6]">
                <li>Your name</li>
                <li>Email address</li>
                <li>Google OAuth ID</li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="text-lg sm:text-xl font-medium mb-2">
                Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-[#B6B6B6]">
                <li>Information you fill on job posting web pages.</li>
                <li>Information you fill on LinkedIn.</li>
                <li>Information you fill on Indeed.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            How We Use Your Information
          </h2>
          <p className="ml-4 leading-7 text-base sm:text-lg">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2 text-[#B6B6B6]">
            <li>
              <strong>Authentication:</strong> To verify your identity and provide
              you access to our extension.
            </li>
            <li>
              <strong>Extension Functionality:</strong> To enable the core
              functionality of our extension, including data capture and filling.
            </li>
            <li>
              <strong>Communication:</strong> To send you important notifications,
              updates, and support responses.
            </li>
            <li>
              <strong>Improvement:</strong> To analyze user behavior and feedback to
              improve our extension&apos;s features and user experience.
            </li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Data Security
          </h2>
          <p className="ml-4 leading-7 text-base sm:text-lg">
            We take the security of your data seriously:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2 text-[#B6B6B6]">
            <li>
              <strong>Encryption:</strong> User data is encrypted both in transit
              and at rest.
            </li>
            <li>
              <strong>Access Control:</strong> Only authorized personnel have
              access to user data, and access is limited to what is necessary for
              providing support and maintaining the extension.
            </li>
            <li>
              <strong>Data Backup:</strong> Regular backups of user data are maintained
              to prevent data loss.
            </li>
            <li>
              <strong>Third-party Services:</strong> We carefully select and monitor
              third-party services and providers to ensure they meet security and
              privacy standards.
            </li>
          </ul>
        </section>

        {/* Your Choices */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Your Choices
          </h2>
          <ul className="list-disc list-inside ml-4 space-y-2 text-[#B6B6B6]">
            <li>
              <strong>Account Deletion:</strong> You can request the deletion of your
              account and associated data at any time.
            </li>
            <li>
              <strong>Data Access:</strong> You can request access to the data we hold
              about you.
            </li>
          </ul>
        </section>

        {/* Policy Disclosure */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Policy Disclosure: Injection of Ads on Job Form Pages
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#B6B6B6]">
            We are committed to providing our users with the best possible service
            and ensuring the sustainability of our platform. To support these goals,
            we have implemented a policy to disclose the use of content scripts that
            may inject advertisements into certain parts of websites you fill for
            jobs. This disclosure aims to inform our users about the presence of ads
            and how they may encounter them while using our extension.
          </p>
        </section>

        {/* Advertisement Integration */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Advertisement Integration for Monetization
          </h2>
          <ul className="list-disc list-inside mt-4 space-y-2 text-[#B6B6B6]">
            <li>
              To continue offering our services without charge to our users, we rely
              on advertising revenue as one of our sources of income. As a part of
              this strategy, we may use content scripts to inject advertisements into
              specific areas of websites.
            </li>
            <li>
              These ads help us generate revenue, which, in turn, allows us to maintain
              and improve our services, develop new features, and provide customer
              support. By using our platform, you are indirectly supporting its
              sustainability.
            </li>
          </ul>
        </section>

        {/* Transparency in Ad Placement */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Transparency in Ad Placement
          </h2>
          <ul className="list-disc list-inside mt-4 space-y-2 text-[#B6B6B6]">
            <li>
              We understand the importance of clarity when it comes to advertising on
              our platform. Ads injected through content scripts will be clearly marked
              as such. You will easily recognize them as distinct from our regular
              content.
            </li>
            <li>
              While filling out forms or using our services, you may encounter these
              ads. Please be aware that they are presented with the intention of
              supporting our free services.
            </li>
          </ul>
        </section>

        {/* User Experience */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Prioritizing User Experience
          </h2>
          <ul className="list-disc list-inside mt-4 space-y-2 text-[#B6B6B6]">
            <li>
              Your experience on our platform is of utmost importance to us. We are
              committed to ensuring that ads do not disrupt your browsing experience
              or hinder your ability to use our services.
            </li>
            <li>
              We actively monitor the performance and relevance of advertisements to
              maintain a balance between providing free services and delivering a
              seamless user experience. If you encounter any issues with ad placement or
              content, please do not hesitate to report them to us.
            </li>
          </ul>
        </section>

        {/* Payment Solutions */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Effortless Payment Solutions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#B6B6B6]">
            JobForm Automator offers a convenient payment system for its services.
            Users can easily subscribe to the tool using popular payment methods,
            ensuring a smooth and secure transaction process. The focus is on providing
            a hassle-free payment experience, allowing users to quickly access the tool’s
            features and streamline their job application process. For detailed information
            on the payment options and pricing, you can visit the JobForm Automator website.
          </p>
        </section>

        {/* Bot Policy */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Policy for Using JobForm Automator Bot
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#B6B6B6]">
            JobForm Automator offers a convenient payment system for its services.
            Users can easily subscribe to the tool using popular payment methods,
            ensuring a smooth and secure transaction process. The focus is on providing
            a hassle-free payment experience, allowing users to quickly access the tool’s
            features and streamline their job application process. For detailed information
            on the payment options and pricing, you can visit the JobForm Automator website.
          </p>
        </section>

        {/* Points of Disclosure */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Points of Disclosure
          </h2>
          <div className="ml-4 space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">
                Refund Policy for JobForm Automator
              </h3>
              <ul className="list-disc list-inside space-y-2 text-[#B6B6B6]">
                <li>
                  <span className="font-semibold">Satisfaction Guarantee:</span> If you
                  are not satisfied with our extension, we will refund your purchase
                  amount.
                </li>
                <li>
                  <span className="font-semibold">Eligibility for Refund:</span> Refunds
                  are available for technical issues or if the service does not meet
                  advertised standards.
                </li>
                <li>
                  <span className="font-semibold">Time Frame:</span> Requests must be made
                  within 14 days of purchase.
                </li>
                <li>
                  <span className="font-semibold">Requesting a Refund:</span> Contact customer
                  support with purchase details and reason for refund.
                </li>
                <li>
                  <span className="font-semibold">Refund Method:</span> Refunds will be issued
                  to the original payment method within 7 working days.
                </li>
                <li>
                  <span className="font-semibold">Non-Refundable Fees:</span> Transaction fees
                  or payment gateway charges are non-refundable.
                </li>
                <li>
                  <span className="font-semibold">Policy Amendments:</span> Subject to change;
                  review periodically.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-6">
                Conclusion
              </h2>
              <p className="mt-4 mb-6 text-base sm:text-lg">
                We believe in creating a transparent and trustworthy environment for our
                users. Our use of content scripts to inject ads is designed to support our
                goal of offering the best possible service while keeping it accessible to all.
                We value your feedback and encourage you to reach out to us with any questions
                or concerns you may have about this policy or your experience on our extension.
                Thank you for being a part of our community, and we appreciate your continued support.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacySection;
