import { useNavigate } from 'react-router-dom';

const FailedAttemptsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOkClick = () => {
    navigate('/user/register');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
            3 Attempts Failed
          </h2>
          
          <p className="text-gray-600 mb-8 font-medium leading-relaxed text-lg">
            Your account has been locked for security. 
            <br />
            <span className="text-red-600 font-bold">Please register again</span>
          </p>

          <button
            onClick={handleOkClick}
            className="w-full bg-red-600 hover:bg-slate-900 text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-lg transition-all shadow-xl hover:shadow-red-600/20"
          >
            OK - Register New
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailedAttemptsModal;

