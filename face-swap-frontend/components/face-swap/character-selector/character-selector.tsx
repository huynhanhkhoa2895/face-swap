'use client';

import { CharacterType } from '@/lib/types/face-swap.types';
import { useFaceSwapStore } from '@/lib/store/face-swap-store';
import Card from '@/components/ui/card/card';
import './character-selector.style.scss';

export default function CharacterSelector() {
  const { selectedCharacter, setCharacter } = useFaceSwapStore();

  return (
    <Card className="character-selector">
      <h3 className="character-selector__title">Chọn nhân vật</h3>
      <div className="character-selector__options">
        <button
          className={`character-selector__option ${
            selectedCharacter === CharacterType.COLLEAGUE
              ? 'character-selector__option--active'
              : ''
          }`}
          onClick={() => setCharacter(CharacterType.COLLEAGUE)}
        >
          Đồng nghiệp
        </button>
        <button
          className={`character-selector__option ${
            selectedCharacter === CharacterType.BOSS
              ? 'character-selector__option--active'
              : ''
          }`}
          onClick={() => setCharacter(CharacterType.BOSS)}
        >
          Sếp
        </button>
        <button
          className={`character-selector__option ${
            selectedCharacter === CharacterType.HOMIE
              ? 'character-selector__option--active'
              : ''
          }`}
          onClick={() => setCharacter(CharacterType.HOMIE)}
        >
          Bạn thân
        </button>
      </div>
    </Card>
  );
}

