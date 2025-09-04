'use client';

import * as React from 'react';

interface CustomScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  viewportRef?: React.Ref<HTMLDivElement>;
}

export function CustomScrollArea({ children, className = '', viewportRef }: CustomScrollAreaProps) {
  return (
    <>
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thick;
          scrollbar-color: rgba(107, 114, 128, 0.6) rgba(243, 244, 246, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 28px; 
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.3);
          border-radius: 9px;
          margin: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.6);
          border-radius: 9px;
          transition: all 0.3s ease;
          min-height: 80px;
          border: 3px solid transparent;
          background-clip: content-box;
          box-shadow: inset 0 0 0 1px rgba(107, 114, 128, 0.2);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.8);
          border: 2px solid transparent;
          background-clip: content-box;
          box-shadow: inset 0 0 0 1px rgba(75, 85, 99, 0.3);
          transform: scale(1.10);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(55, 65, 81, 0.9);
          border: 1px solid transparent;
          background-clip: content-box;
          transform: scale(1.02);
        }
        
        /* Dark mode support */
        .dark .custom-scrollbar {
          scrollbar-color: rgba(75, 85, 99, 0.7) rgba(31, 41, 55, 0.3);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.7);
          box-shadow: inset 0 0 0 1px rgba(75, 85, 99, 0.3);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.9);
          box-shadow: inset 0 0 0 1px rgba(107, 114, 128, 0.4);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(156, 163, 175, 1);
        }
        
        /* Smooth scrolling */
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
        
        .custom-scrollbar:hover::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
        }
        
        .dark .custom-scrollbar:hover::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
        }
        
        /* Add cursor pointer to indicate it's interactive */
        .custom-scrollbar::-webkit-scrollbar-thumb {
          cursor: grab;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          cursor: grabbing;
        }
      `}</style>
      
      <div 
        ref={viewportRef}
        className={`custom-scrollbar overflow-y-auto overflow-x-hidden ${className}`}
      >
        {children}
      </div>
    </>
  );
}