import { useState } from 'react';
import { FaShareAlt } from 'react-icons/fa';

export const ShareToggle = ({ postId, initialState }: { postId: string; initialState: boolean }) => {
    const [enabled, setEnabled] = useState(initialState);
  
    const toggle = async () => {
      try {
        const res = await fetch(`/api/shareWithArtist/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareWithArtist: !enabled }),
        });
        if (res.ok) setEnabled(!enabled);
      } catch (err) {
        console.error(err);
      }
    };
  
    return (
      <div className="flex items-center gap-2">
        <FaShareAlt className="text-gray-600" />
        <button
          onClick={toggle}
          role="switch"
          aria-checked={enabled}
          className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            enabled ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform duration-200 ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-gray-700 select-none">{enabled ? 'Shared with artist' : 'Not shared with artist'}</span>
      </div>
    );
  };
  