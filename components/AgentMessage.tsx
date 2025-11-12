import React from 'react';
import { marked } from 'marked';

import { PlaygroundMessage } from '../types';
import { DownloadIcon, XCircleIcon } from './icons/Icons';

/**
 * Renders a single chat message, handling user and agent messages,
 * errors, file attachments, and grounding URLs.
 */
const AgentMessage: React.FC<{ message: PlaygroundMessage }> = ({ message }) => {
  const html = marked.parse(message.text);

  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') => {
    // Decode base64 content for download
    const byteCharacters = atob(content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`w-fit max-w-full md:max-w-lg lg:max-w-xl p-4 rounded-2xl
          ${message.sender === 'user' ? 'bg-primary text-white rounded-br-none' : ''}
          ${message.sender === 'agent' && !message.isError ? 'bg-surface-light text-text-primary rounded-bl-none' : ''}
          ${message.sender === 'agent' && message.isError ? 'bg-red-500/20 text-red-300 border border-red-500 rounded-bl-none' : ''}
      `}>
        {message.isError && (
          <div className="flex items-center space-x-2 text-red-400 mb-2">
            <XCircleIcon />
            <span className="font-semibold">Error from Agent:</span>
          </div>
        )}
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html as string }}></div>
        {message.file && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <button onClick={() => downloadFile(message.file!.filename, message.file!.content, message.file!.mimeType || 'text/plain')} className="flex items-center space-x-2 text-sm font-semibold hover:underline">
              <DownloadIcon />
              <span>{message.file.filename}</span>
            </button>
          </div>
        )}
        {message.downloadFile && ( // NEW: Handle agent-generated downloadable files
          <div className="mt-3 pt-3 border-t border-white/20">
            <button onClick={() => downloadFile(message.downloadFile!.filename, message.downloadFile!.content, message.downloadFile!.mimeType)} className="flex items-center space-x-2 text-sm font-semibold hover:underline text-accent">
              <DownloadIcon />
              <span>Download: {message.downloadFile.filename}</span>
            </button>
          </div>
        )}
        {message.groundingUrls && message.groundingUrls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-sm font-semibold mb-2">Sources:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {message.groundingUrls.map((source, idx) => (
                <li key={idx}>
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMessage;