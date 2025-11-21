'use client';

import { Gender } from '@/lib/types/face-swap.types';
import { useFaceSwapStore } from '@/lib/store/face-swap-store';
import Card from '@/components/ui/card/card';
import './gender-selector.style.scss';

export default function GenderSelector() {
  const { selectedGender, setGender } = useFaceSwapStore();

  return (
    <Card className="gender-selector">
      <h3 className="gender-selector__title">Chọn giới tính</h3>
      <div className="gender-selector__options">
        <button
          className={`gender-selector__option ${
            selectedGender === Gender.MALE ? 'gender-selector__option--active' : ''
          }`}
          onClick={() => setGender(Gender.MALE)}
        >
          Nam
        </button>
        <button
          className={`gender-selector__option ${
            selectedGender === Gender.FEMALE ? 'gender-selector__option--active' : ''
          }`}
          onClick={() => setGender(Gender.FEMALE)}
        >
          Nữ
        </button>
      </div>
    </Card>
  );
}

