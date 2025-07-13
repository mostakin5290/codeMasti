import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const PrivacyPolicyPage = () => {
    return (
        <LegalPageLayout title="Privacy Policy">
            <p>
                Your privacy is important to us. It is CodeMasti's policy to respect your privacy regarding any information we may collect from you across our website.
            </p>
            
            <h2>1. Information We Collect</h2>
            <h3>Log Data</h3>
            <p>
                When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.
            </p>
            <h3>Personal Information</h3>
            <p>
                We may ask for personal information, such as your:
            </p>
            <ul>
                <li>Name</li>
                <li>Email</li>
                <li>Social media profiles</li>
                <li>Date of birth</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
                We may use the information we collect to operate, maintain, and provide the features and functionality of the Service, as well as to communicate directly with you, such as to send you email messages and push notifications.
            </p>
            
            <h2>3. Security of Your Personal Information</h2>
            <p>
                The security of your personal information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
        </LegalPageLayout>
    );
};

export default PrivacyPolicyPage;