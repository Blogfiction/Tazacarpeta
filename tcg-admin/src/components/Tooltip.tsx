import { useState, useRef } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Tooltip({ children, label, className = '', id }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useRef(id || `tooltip-${Math.random().toString(36).substr(2, 9)}`).current;

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      offset(5),
      flip({
        fallbackAxisSideDirection: 'start',
        padding: 5
      }),
      shift({ padding: 5 })
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 200, close: 0 },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const referenceProps = getReferenceProps({
    className,
    'aria-describedby': isOpen ? tooltipId : undefined,
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...referenceProps}
      >
        {children}
      </div>
      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            id={tooltipId}
            role="tooltip"
            className="z-50 px-2 py-1 text-xs font-press-start bg-gray-900 text-white rounded shadow-lg max-w-xs text-center"
          >
            {label}
          </div>
        )}
      </FloatingPortal>
    </>
  );
}