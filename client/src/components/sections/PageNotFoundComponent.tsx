"use client";

import { Home, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";
import { PrimaryBox } from "../ui/PrimaryBox";

export function PageNotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <h1 className="text-8xl font-bold text-red-300 mb-4">404</h1>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-primary mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-primary/70 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. It might
          have been moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            <Home className="w-5 h-5 text-primary" />
            Go to Homepage
          </Button>
        </div>

        {/* Suggestions */}
        <PrimaryBox className="my-10">
          <h3 className="text-lg font-semibold text-primary mb-3">
            What can you do?
          </h3>
          <ul className="text-left text-primary/70 space-y-2 list-disc list-inside">
            <li>Check the URL for typos or errors</li>
            <li>Use the search function to find what you're looking for</li>
            <li>Return to the homepage and navigate from there</li>
            <li>Contact support if you believe this is an error</li>
          </ul>
        </PrimaryBox>

        {/* Support Link */}
        <p className="mt-8 text-primary">
          Still lost?{" "}
          <a
            href="/support"
            className="font-semibold underline hover:text-indigo-800"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
