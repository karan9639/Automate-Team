"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

const ReferAndEarn = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "AUTOMATE2023";
  const referralLink = `https://automateteam.com/refer?code=${referralCode}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Refer & Earn</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Referral Code</h2>
          <button
            onClick={() => copyToClipboard(referralCode)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded-md text-center font-mono text-lg">
          {referralCode}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Referral Link</h2>
          <button
            onClick={() => copyToClipboard(referralLink)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded-md text-center text-sm sm:text-base break-all">
          {referralLink}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Share your referral code or link with friends and colleagues</li>
          <li>
            When they sign up using your code, they get 1 month free premium
            access
          </li>
          <li>Once they become a paid user, you earn ₹500 as a reward</li>
          <li>There's no limit to how many people you can refer!</li>
        </ol>

        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
            <Share2 size={18} />
            <span>Share Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferAndEarn;
