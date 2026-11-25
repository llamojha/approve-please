import { useEffect, useState } from 'react';
import { characters } from '../../data/characters';
import styles from '../../styles/ReviewDesk.module.css';

export type CharacterExpression = 'neutral' | 'pleased' | 'concerned';
interface CharacterAvatarProps {
  characterId?: string;
  name: string;
  expression?: CharacterExpression;
  size?: number;
  className?: string;
}

/** Unknown/guest authors use initials rather than an unrelated coworker's face. */
export default function CharacterAvatar({ characterId, name, expression = 'neutral', size = 48, className = '' }: CharacterAvatarProps) {
  const character = characters.find(person => person.id === characterId);
  const src = character ? `/characters/studies/${character.id}-${expression}.png` : undefined;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <span className={`${styles.portrait} ${className}`} data-character={characterId} style={{ width: size, height: size }}>
    {!src || failed ? <span role="img" aria-label={name}>{name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('')}</span> :
      // Transparent portraits are already optimized assets at 256px.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} width={size} height={size} alt={name} onError={() => setFailed(true)} />}
  </span>;
}
