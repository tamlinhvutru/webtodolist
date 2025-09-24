import { useState } from 'react';

interface SignupProps {
  onSignupSuccess: (userId: string) => void;
  onSwitchToLogin: () => void;
}

function Signup({ onSignupSuccess, onSwitchToLogin }: SignupProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Đăng ký thất bại');
      }
      const data = await response.json();
      console.log('Signup response:', data); // Debug response
      const token = data.token;
      if (!token) throw new Error('No token received from server');
      localStorage.setItem('token', token); // Lưu token
      const userId = data.user?.id?.toString();
      if (!userId) throw new Error('No user ID received from server');
      localStorage.setItem('userId', userId); // Lưu userId
      console.log('Signup successful, token saved:', token); // Debug
      onSignupSuccess(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      console.error('Signup error:', err); // Debug
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Đăng ký</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên đăng nhập"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Đăng ký
          </button>
        </form>
        <p className="mt-4 text-center">
          Đã có tài khoản?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;