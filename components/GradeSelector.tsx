
import React from 'react';
import { GradeLevel } from '../types';

interface GradeSelectorProps {
  selected: GradeLevel;
  onSelect: (grade: GradeLevel) => void;
}

const GRADES: GradeLevel[] = [
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
];

const GradeSelector: React.FC<GradeSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {GRADES.map((grade) => (
        <button
          key={grade}
          onClick={() => onSelect(grade)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
            selected === grade
              ? 'bg-yellow-400 border-yellow-500 text-yellow-900 scale-105 shadow-md'
              : 'bg-white border-blue-100 text-blue-600 hover:border-blue-300'
          }`}
        >
          {grade}
        </button>
      ))}
    </div>
  );
};

export default GradeSelector;
