import React from "react";
import InteractiveWorkflow from "./InteractiveWorkflow";

export default function WorkflowSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <InteractiveWorkflow />
      </div>
    </section>
  );
}
