import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/Card';
import axios from 'axios'; // API 호출을 위해 axios를 import 합니다.

interface SignupFormProps {
  onSwitchToLogin: () => void;
  // onSignup prop은 이제 API 호출 성공 시 부모(App.tsx)에게 알리는 용도로만 사용합니다.
  // 또는 로그인 탭으로 바로 전환하는 용도로 onSwitchToLogin을 호출할 수도 있습니다.
  onSignupSuccess: () => void; // 회원가입 성공 시 호출할 새 prop (예: 로그인 탭으로 전환)
}

export function SignupForm({ onSwitchToLogin, onSignupSuccess }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // 전화번호 입력을 위한 state (추가)
  const [error, setError] = useState(''); // API 오류 메시지를 저장할 state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작(새로고침)을 막습니다.
    setError(''); // 이전 오류 메시지를 초기화합니다.

    // 백엔드로 보낼 데이터 객체 (DTO와 일치)
    const registerData = {
      userName: username,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
    };

    try {
      // Axios를 사용해 백엔드 API(/api/auth/register)에 POST 요청을 보냅니다.
      // 포트 번호(3536)와 CORS 설정(WebConfig.java)이 올바른지 확인해야 합니다.
      const response = await axios.post('http://localhost:8586/api/auth/register', registerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 요청 성공 시
      console.log('회원가입 성공:', response.data); // "User registered successfully"
      
      // 회원가입 성공 후 로그인 탭으로 자동 전환
      onSignupSuccess(); 

    } catch (apiError: any) {
      // API 요청 실패 시 (예: 500 에러, 이메일 중복 등)
      console.error('회원가입 실패:', apiError);

      if (apiError.response && apiError.response.data) {
        // 백엔드에서 보낸 구체적인 오류 메시지가 있다면 표시합니다.
        // (현재 AuthController는 단순 문자열을 반환하므로, 더 복잡한 오류 처리가 필요할 수 있습니다.)
        setError(apiError.response.data.message || '회원가입에 실패했습니다. (예: 이메일 중복)');
      } else {
        // 네트워크 오류 등
        setError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          새로운 계정을 만들어 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* --- 오류 메시지 표시 --- */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="signup-username">유저이름</Label>
            <Input
              id="signup-username"
              type="text"
              placeholder="유저이름 입력"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">전화번호</Label>
            <Input
              id="phoneNumber"
              type="text"
              placeholder="전화번호 입력"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            회원가입
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            로그인하기
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}