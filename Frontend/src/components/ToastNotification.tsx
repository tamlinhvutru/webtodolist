import { AlertCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

function Notification({ message, type }: NotificationProps) {
  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {type === 'error' ? <AlertCircle size={20} /> : <span>✓</span>}
        {message}
      </div>
    </div>
  );
}

export default Notification;