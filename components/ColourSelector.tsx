import { useState } from 'react';
import { FaPalette } from 'react-icons/fa';
import { colourClasses, colourEmojis } from '../components/Post'; // ✅ reuse same shared colour mapping

type ColourSelectorProps = {
  postId: string;
  colour: number;
  onColourChange: (newColour: number) => void;
};

export const ColourSelector = ({ postId, colour, onColourChange }: ColourSelectorProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = async (newColour: number) => {
    if (isUpdating || newColour === colour) return;
    onColourChange(newColour); // Update immediately for UI feedback
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
    <div className="flex flex-col gap-2 items-start">

      <div className="flex gap-2 items-center">
  
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
  <button
    key={num}
    type="button"
    onClick={() => handleClick(num)}
    className={`text-xl transition-transform transform hover:scale-125 ${
      colour === num ? "opacity-100 scale-125" : "opacity-60"
    }`}
    title={`Rating ${num}`}
  >
    {colourEmojis[num]}
  </button>
))}
         
   
      </div>
      {isUpdating && <span className="text-gray-500 text-sm">Updating...</span>}

    </div>
  );
};
