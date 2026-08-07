import React from 'react';
import { Rocket, Trees, Target, Crosshair, Triangle, Scissors, Shovel } from 'lucide-react';

export default function CategoryIcon({ category, size = 15, className = '', style = {} }) {
  const props = { size, className, style };
  switch (category) {
    case 'Drivers': return <Rocket {...props} />;
    case 'Woods': return <Trees {...props} />;
    case 'LongIrons': return <Target {...props} />;
    case 'ShortIrons': return <Crosshair {...props} />;
    case 'Wedges': return <Triangle {...props} />;
    case 'RoughIrons': return <Scissors {...props} />;
    case 'SandWedges': return <Shovel {...props} />;
    default: return <Target {...props} />;
  }
}
