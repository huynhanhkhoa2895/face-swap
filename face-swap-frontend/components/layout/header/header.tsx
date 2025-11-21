import Link from 'next/link';
import './header.style.scss';

export default function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <Link href="/" className="header__logo">
          Face Swap
        </Link>
        <nav className="header__nav">
          <Link href="/create" className="header__link">
            Tạo Video
          </Link>
        </nav>
      </div>
    </header>
  );
}

