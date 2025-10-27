import { useState } from 'react';
import { FaPalette } from 'react-icons/fa';
import { colourClasses } from '../components/Post'; // ✅ reuse same shared colour mapping

type ColourSelectorProps = {
  postId: string;
  initialColour: any;
};

export const ColourSelector = ({ postId, initialColour }: ColourSelectorProps) => {
  const [colour, setColour] = useState<number>(initialColour);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async (newColour: number) => {
    if (isUpdating || newColour === colour) return; // prevent duplicate clicks
    setColour(newColour);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/colourRating/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colourRating: newColour }),
      });

      if (!res.ok) throw new Error('Failed to update colour');
    } catch (err) {
      console.error(err);
      alert('Error updating colour. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
     
      <div className="flex gap-2 items-center">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => handleClick(num)}
            disabled={isUpdating}
            className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
              colour === num ? 'border-white' : 'border-transparent'
            } ${colourClasses[num]} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
            title={`Colour ${num}`}
          />
        ))}
      </div>
      {isUpdating && <span className="text-gray-500 text-sm">Updating...</span>}
    </div>
  );
};
