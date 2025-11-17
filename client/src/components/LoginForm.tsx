import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/Card';
import { Axis3D } from 'lucide-react';
import axios from 'axios';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onLogin: (username: string) => void;
}

export function LoginForm({ onSwitchToSignup, onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log('로그인 시도:', {email, password});

      const response = await axios.post('http://localhost:8586/api/auth/login', {
        email,
        password,
      });

      console.log('로그인 성공:', response.data);

       const token = response.data.token;
      localStorage.setItem('token', token);
      onLogin(email.split('@')[0]);  //임시로 username을 이메일 앞부분으로 설정
    } catch(error:any) {
      console.error('로그인 실패:', error);
      if(error.respomnse && error.response.status ==401) {
        setError('이메일 또는 비밀번호가 잘못되었습니다');
      } else {
        setError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
      }
    }
   
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          계정에 로그인하여 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">이메일</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">비밀번호</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            로그인
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary hover:underline font-medium"
          >
            회원가입하기
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}