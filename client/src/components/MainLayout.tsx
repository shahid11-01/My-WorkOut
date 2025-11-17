import { Button } from './ui/Button';

interface MainLayoutProps {
  username: string;
  onLogout: () => void;
}

export function MainLayout({ username, onLogout }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My WorkOut</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">안녕하세요, {username}님!</span>
            <Button onClick={onLogout} variant="outline">
              로그아웃
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">대시보드</h2>
          <p className="text-muted-foreground">
            여기에 운동 추적 기능이 들어갈 예정입니다.
          </p>
        </div>
      </main>
    </div>
  );
}