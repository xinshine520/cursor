import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useLocaleStore } from '../../stores/localeStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './Button';
import { Select } from './Select';
import { cn } from '../../utils/cn';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isDark, toggle } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-gray-900 text-white' : 'bg-gray-50')}>
      <header className={cn('border-b', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">{t.connections.title}</h1>
              <nav className="flex gap-4">
                <Link
                  to="/"
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname === '/'
                      ? isDark
                        ? 'bg-gray-700 text-white'
                        : 'bg-blue-100 text-blue-700'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {t.nav.connections}
                </Link>
                <Link
                  to="/query"
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname === '/query'
                      ? isDark
                        ? 'bg-gray-700 text-white'
                        : 'bg-blue-100 text-blue-700'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {t.nav.query}
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'zh' | 'en')}
                className="h-9 text-sm"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </Select>
              <Button variant="ghost" size="sm" onClick={toggle}>
                {isDark ? '☀️' : '🌙'}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
