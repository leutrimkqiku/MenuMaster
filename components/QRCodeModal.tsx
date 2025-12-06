import React from 'react';
import { X, Download, ExternalLink, Link as LinkIcon } from 'lucide-react';

interface QRCodeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ url, title, onClose }) => {
  // Using a reliable public API for QR generation to avoid heavy dependencies in this demo environment
  // In a production app, we would use a library like 'qrcode.react' or 'qrcode'
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=000000&bgcolor=ffffff&margin=10`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all scale-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800">QR Kodi: {title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center justify-center bg-white">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 mb-6">
            <img 
                src={qrImageUrl} 
                alt="QR Code" 
                className="w-48 h-48 md:w-56 md:h-56 object-contain" 
            />
          </div>
          
          <p className="text-center text-sm text-gray-500 mb-6 px-4">
            Skanoni këtë kod për të parë menunë dixhitale.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full">
            <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
                <ExternalLink className="w-4 h-4" />
                Hap Linkun
            </a>
             <a 
                href={qrImageUrl} 
                download={`qrcode-${title}.png`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
            >
                <Download className="w-4 h-4" />
                Shkarko
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;