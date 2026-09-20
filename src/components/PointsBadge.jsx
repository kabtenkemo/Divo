import { Star } from 'lucide-react';

export default function PointsBadge({ points, size = 15, style, className }) {
  return (
    <span className={`points-badge ${className || ''}`} style={style}>
      <Star size={size} fill="currentColor" strokeWidth={0} />
      {points}
    </span>
  );
}