import React from "react";

type InfoIconProps = {
  title?: string;
  tooltipId?: string;
};

export const InfoIcon: React.FC<InfoIconProps> = ({ title, tooltipId }) => {
  const generatedId = React.useId();
  const id = tooltipId ?? generatedId;
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const isPointerDownRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) {
        return;
      }
      if (containerRef.current.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && !isPointerDownRef.current) {
      setOpen(true);
    }
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && !isPointerDownRef.current) {
      close();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOpen((previous) => !previous);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    isPointerDownRef.current = event.pointerType !== "mouse";
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-300"
        title={title}
        aria-label="Informations complémentaires"
        aria-describedby={id}
        aria-expanded={open}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onFocus={() => setOpen(true)}
        onBlur={close}
      >
        ?
      </button>
      <div
        id={id}
        role="tooltip"
        className={`absolute left-1/2 z-10 mt-2 w-48 max-w-xs -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg transition-opacity duration-150 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {title}
      </div>
    </span>
  );
};
