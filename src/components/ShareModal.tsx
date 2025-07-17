import React, { useState } from 'react';
import { X, Facebook, Twitter, Share, MessageCircle, Mail, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  complaintTitle: string;
  onShare: (platform: string) => Promise<void>;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  complaintId, 
  complaintTitle, 
  onShare 
}) => {
  const [isSharing, setIsSharing] = useState<string | null>(null);

  const handleShare = async (platform: string) => {
    setIsSharing(platform);
    try {
      await onShare(platform);
      toast.success(`Reclamo compartido en ${platform}`);
      onClose();
    } catch (error) {
      toast.error(`Error al compartir en ${platform}`);
    } finally {
      setIsSharing(null);
    }
  };

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/complaint/${complaintId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
      onClose();
    } catch (error) {
      toast.error('Error al copiar enlace');
    }
  };

  if (!isOpen) return null;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      platform: 'facebook'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      platform: 'twitter'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      platform: 'whatsapp'
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      platform: 'email'
    },
    {
      name: 'Telegram',
      icon: Share,
      color: 'bg-blue-500 hover:bg-blue-600',
      platform: 'telegram'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Compartir Reclamo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Comparte este reclamo para aumentar su visibilidad: "{complaintTitle}"
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map((option) => (
            <button
              key={option.platform}
              onClick={() => handleShare(option.platform)}
              disabled={isSharing === option.platform}
              className={`${option.color} text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50`}
            >
              <option.icon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isSharing === option.platform ? 'Compartiendo...' : option.name}
              </span>
            </button>
          ))}
        </div>

        <div className="border-t pt-4">
          <button
            onClick={copyToClipboard}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm font-medium">Copiar enlace</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;