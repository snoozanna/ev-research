import React from "react";
import { colourEmojis } from '../components/Post';
import { FaVoicemail, FaRegComments, FaAlignJustify } from "react-icons/fa";

const FilterBar = ({
  selectedPerformance,
  setSelectedPerformance,
  performances,
  sharedFilter,
  setSharedFilter,
  setColourFilter,
  colourFilter,
  reflectionType,
  setReflectionType
}) => {
  return (
    <>
      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 mb-6 items-center text-xs">
        <div className="flex gap-2">
          {/* Performance filter */}
          <select
            value={selectedPerformance}
            onChange={(e) => setSelectedPerformance(e.target.value)}
            className="p-2 border rounded-md truncate max-w-1/2"
          >
            <option value="all">All Performances</option>
            {performances.map((perf) => (
              <option key={perf.id} value={perf.id} className="truncate">
                {perf.name}
              </option>
            ))}
          </select>

          {/* Shared filter */}
          <select
            value={sharedFilter}
            onChange={(e) =>
              setSharedFilter(e.target.value as 'all' | 'shared' | 'not_shared')
            }
            className="p-2 border rounded-md"
          >
            <option value="all">All</option>
            <option value="shared">Shared with artist</option>
            <option value="not_shared">Not shared</option>
          </select>
        </div>

        {/* Reflection type filter */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setReflectionType('all')}
            className={`p-2 rounded-full border transition ${
              reflectionType === 'all'
                ? 'bg-(--pink) text-white border-(--pink)'
                : ' border-gray-300 hover:bg-gray-100'
            }`}
            title="All Types"
          >
            All
          </button>

          <button
            onClick={() => setReflectionType('text')}
            className={`p-2 rounded-full border transition ${
              reflectionType === 'text'
                ? 'bg-(--pink) text-white border-(--pink)'
                : ' hover:bg-gray-100'
            }`}
            title="Text Reflections"
          >
            <FaAlignJustify className="text-lg" />
          </button>

          <button
            onClick={() => setReflectionType('voice')}
            className={`p-2 rounded-full border transition ${
              reflectionType === 'voice'
                ? 'bg-(--pink) text-white border-(--pink)'
                : '  hover:bg-gray-100'
            }`}
            title="Voice Notes"
          >
            <FaVoicemail className="text-lg" />
          </button>

          <button
            onClick={() => setReflectionType('prompt')}
            className={`p-2 rounded-full border transition ${
              reflectionType === 'prompt'
                ? 'bg-(--pink) text-white border-(--pink)'
                : ' hover:bg-gray-100'
            }`}
            title="Prompt Answers"
          >
            <FaRegComments className="text-lg" />
          </button>
        </div>

        {/* Colour filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setColourFilter(num)}
              className={`text-2xl transition-transform transform hover:scale-125 ${
                colourFilter === num ? 'opacity-100 scale-150' : 'opacity-60'
              }`}
              title={`Rating ${num}`}
            >
              {colourEmojis[num]}
            </button>
          ))}
        </div>

        {/* Clear filter button */}
        <button
          onClick={() => {
            setColourFilter('all');
            setReflectionType('all');
          }}
          className="px-2 py-1 border rounded-md text-xs text-gray-700 hover:bg-gray-100"
        >
          Clear
        </button>
      </div>
    </>
  );
};

export default FilterBar;

