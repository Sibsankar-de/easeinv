"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "react-tooltip";

type IconTooltipProps = {
  icon: React.ReactNode;
  tooltip: string;
  tooltipId?: string;
};

export const IconTooltip = ({
  icon,
  tooltip,
  tooltipId = "icon-tooltip",
}: IconTooltipProps) => {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <span
      className="w-fit h-fit cursor-help"
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltip}
    >
      {icon}

      {mounted &&
        createPortal(
          <Tooltip
            id={tooltipId}
            place="bottom"
            delayShow={0}
            className="max-w-sm"
          />,
          document.body,
        )}
    </span>
  );
};
