import { X, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title = 'Confirmar acción',
  message,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const activeBtnAnim = "active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-100";

  return (
    <div className="fixed inset-0 bg-[#263238]/90 backdrop-blur-sm flex items-center justify-center z-200 p-4">
      {/* CONTENEDOR ESTILO PIXEL */}
      <div className="bg-white border-8 border-black shadow-[12px_12px_0px_#000] w-full max-w-md overflow-hidden transform transition-all">
        
        {/* HEADER CON ESTILO RETRO */}
        <div className="bg-[#263238] p-6 flex justify-between items-center relative border-b-8 border-black">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#FBC02D]"></div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter" style={{ textShadow: '2px 2px 0px #E53935' }}>
              {title}
            </h2>
            <p className="text-yellow-400 text-[10px] font-black tracking-[0.2em] uppercase mt-1">Requerida Validación</p>
          </div>
          <button 
            onClick={onCancel} 
            className="bg-[#E53935] border-4 border-black text-white p-1 hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <X className="w-5 h-5" strokeWidth={4} />
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-8 bg-white text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
              <AlertTriangle className="w-10 h-10 text-yellow-600" strokeWidth={3} />
            </div>
          </div>
          
          <p className="text-lg font-black text-[#263238] uppercase italic leading-tight">
            {message}
          </p>
          
          <div className="mt-4 p-2 bg-gray-100 border-2 border-dashed border-gray-400 font-bold text-[10px] text-gray-500 uppercase">
            Esta operación no se puede revertir del sistema
          </div>

          {/* ACCIONES ESTILO BOTONES ARCADE */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={onCancel}
              className={`bg-gray-200 border-4 border-black text-black font-black py-3 uppercase text-sm shadow-[4px_4px_0px_#000] hover:bg-white ${activeBtnAnim}`}
            >
              DESCARTAR
            </button>
            <button
              onClick={onConfirm}
              className={`bg-[#E53935] text-white border-4 border-black font-black py-3 uppercase text-sm shadow-[4px_4px_0px_#000] hover:bg-[#c62828] ${activeBtnAnim}`}
            >
              CONFIRMAR
            </button>
          </div>
        </div>
        
        {/* DECORACIÓN INFERIOR PIXEL */}
        <div className="h-2 bg-[#263238] flex">
            <div className="w-1/3 h-full bg-[#E53935]"></div>
            <div className="w-1/3 h-full bg-[#FB8C00]"></div>
            <div className="w-1/3 h-full bg-[#FBC02D]"></div>
        </div>
      </div>
    </div>
  );
}