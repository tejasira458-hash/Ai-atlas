
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClose: () => void;
  isOpen: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem, onClose, isOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed top-0 left-0 h-full bg-white w-80 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-blue-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-blue-600 flex items-center">
              <i className="fas fa-clock-rotate-left mr-3"></i>
              History
            </h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times text-slate-400"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {history.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-5xl mb-4 grayscale opacity-30">📚</div>
                <p className="text-slate-400 font-bold italic">Your learning journey starts here! Ask your first question.</p>
              </div>
            ) : (
              history.slice().reverse().map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase text-blue-400 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                      {item.grade}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                    {item.query || "New Lesson"}
                  </h4>
                  {item.subject && (
                    <div className="mt-2 text-[10px] font-bold text-orange-500 uppercase flex items-center">
                      <i className="fas fa-tag mr-1 opacity-50"></i>
                      {item.subject}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              AI ATLAS Explorer
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryPanel;
