
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    let inList = false;
    let listItems: React.ReactNode[] = [];
    
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('##')) {
        const title = trimmed.replace('##', '').trim();
        let emoji = "🌟";
        let colorClass = "text-blue-700";
        let specialContainer = "";

        if (title.toLowerCase().includes('short notes')) {
          emoji = "📝";
          colorClass = "text-emerald-700";
        } else if (title.toLowerCase().includes('diagram')) {
          emoji = "🎨";
          colorClass = "text-purple-700";
        } else if (title.toLowerCase().includes('memory trick')) {
          emoji = "💡";
          colorClass = "text-orange-700";
        }

        elements.push(
          <h2 key={`h2-${idx}`} className={`text-2xl font-black ${colorClass} mt-10 mb-4 flex items-center`}>
            <span className="mr-3 text-3xl">{emoji}</span>
            {title}
          </h2>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        elements.push(
          <li key={`li-${idx}`} className="ml-6 mb-3 text-slate-700 list-none flex items-start">
            <span className="text-blue-400 mr-3 mt-1.5 text-[10px]"><i className="fas fa-circle"></i></span>
            <span className="text-lg leading-relaxed">{formatInline(trimmed.substring(1).trim())}</span>
          </li>
        );
        return;
      }

      // Empty lines
      if (trimmed === '') {
        elements.push(<div key={`br-${idx}`} className="h-4" />);
        return;
      }

      // Regular Paragraphs or Diagram Text
      // Detect if this looks like an ASCII/Emoji diagram line
      const isDiagramLine = /[-=+>|<]/.test(trimmed) && trimmed.length > 5;
      
      elements.push(
        <p key={`p-${idx}`} className={`mb-4 text-lg text-slate-700 leading-relaxed font-medium ${isDiagramLine ? 'font-mono bg-slate-50 p-2 rounded-lg border-l-4 border-purple-200' : ''}`}>
          {formatInline(line)}
        </p>
      );
    });

    return elements;
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-orange-600 font-black">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return <div className="space-y-1">{formatContent(content)}</div>;
};

export default MarkdownRenderer;
