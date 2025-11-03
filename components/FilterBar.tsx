import React from "react";
import { colourEmojis } from '../components/Post';

const FilterBar = ({selectedPerformance, setSelectedPerformance, performances, sharedFilter, setSharedFilter, setColourFilter, colourFilter}) => {
    return(
        <>
         {/* FILTER BAR */}
         <div className="flex flex-wrap gap-4 mb-6 items-center text-xs">
            <div className="flex gap-2">
         {/* Performance filter */}
         <select
           value={selectedPerformance}
           onChange={(e) => setSelectedPerformance(e.target.value)}
           className="p-2 border rounded-md"
         >
           <option value="all">All Performances</option>
           {performances.map((perf) => (
             <option key={perf.id} value={perf.id}>
               {perf.name}
             </option>
           ))}
         </select>

         {/* Shared filter */}
         <select
           value={sharedFilter}
           onChange={(e) => setSharedFilter(e.target.value as 'all' | 'shared' | 'not_shared')}
           className="p-2 border rounded-md"
         >
           <option value="all">All</option>
           <option value="shared">Shared with artist</option>
           <option value="not_shared">Not shared</option>
         </select>
         </div>
       {/* Colour filter */}
       <div className="flex items-center gap-2 flex-wrap">
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
 <button
   key={num}
   type="button"
   onClick={() => setColourFilter(num)}
   className={`text-2xl transition-transform transform hover:scale-125 ${
     colourFilter === num ? "opacity-100 scale-150" : "opacity-60"
   }`}
   title={`Rating ${num}`}
 >
   {colourEmojis[num]}
 </button>
))}

</div>
 {/* Clear filter button */}
 <button
   onClick={() => setColourFilter('all')}
   className=" px-2 py-1 border rounded-md text-xs text-gray-700 hover:bg-gray-100"
 >
   Clear
 </button>
       </div>
       </>
    )
}

export default FilterBar;