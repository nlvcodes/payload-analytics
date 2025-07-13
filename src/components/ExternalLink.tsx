'use client'

import React from 'react'

interface ExternalLinkProps {
  href: string
  text: string
  className?: string
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({ href, text, className = '' }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`analytics-external-link ${className}`}
    >
      {text}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="analytics-external-link-icon"
      >
        <path
          d="M5.75 10.25L10.25 5.75M10.25 5.75H6.5M10.25 5.75V9.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}