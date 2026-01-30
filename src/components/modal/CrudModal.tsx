import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export interface Field<T> {
  name: keyof T;
  label: string;
  required?: boolean;
  type?: 'text' | 'password' | 'select' | 'number' | 'email' | 'date' | 'time';
  options?: { label: string; value: any }[];
  disabled?: boolean;
  min?: number;
}

interface Props<T> {
  open: boolean;
  title: string;
  initialData?: Partial<T>;
  fields: Field<T>[];
  onSubmit: (data: Partial<T>) => void;
  onClose: () => void;
  children?: ReactNode;
}

export function CrudModal<T>({
  open,
  title,
  initialData,
  fields,
  onSubmit,
  onClose,
  children,
}: Props<T>) {
  const [form, setForm] = useState<Partial<T>>({});

  useEffect(() => {
    if (open) {
      setForm(initialData || {});
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (key: keyof T, value: any, fieldConfig?: Field<T>) => {
    let finalValue = value;
    if (fieldConfig?.type === 'number') {
      if (value === '') {
        finalValue = '';
      } else {
        const numValue = Number(value);
        const minVal = fieldConfig.min ?? 0;
        if (numValue < minVal) return; 
        finalValue = numValue;
      }
    }
    setForm(prev => ({ ...prev, [key]: finalValue }));
  };

  const handleSubmit = () => {
    const tieneErrores = fields.some(field => {
        if (field.type === 'number') {
            const val = form[field.name] as any;
            const min = field.min ?? 0;
            if (val !== '' && val < min) return true;
        }
        return false;
    });

    if (tieneErrores) {
        alert("Por favor, revisa los campos numéricos. No pueden ser negativos.");
        return;
    }

    const cleaned: Partial<T> = {};
    Object.keys(form).forEach(key => {
      const value = form[key as keyof T];
      const isId = key === '_id' || key.startsWith('id_');
      if (isId || (value !== undefined && value !== null && value !== '')) {
        cleaned[key as keyof T] = value;
      }
    });

    onSubmit(cleaned);
  };

  // ESTILO DE INPUTS ACTUALIZADO AL ESTILO PIXEL
  const inputClass = (isDisabled?: boolean) => `
    w-full bg-white border-4 border-black px-5 py-3 
    text-lg font-black text-[#263238] uppercase outline-none transition-all
    ${isDisabled 
      ? 'opacity-50 cursor-not-allowed bg-gray-100' 
      : 'focus:bg-yellow-50 focus:translate-x-1 focus:translate-y-1 focus:shadow-none shadow-[4px_4px_0px_#000]'}
  `;

  return (
    <div className="fixed inset-0 bg-[#263238]/90 backdrop-blur-sm flex items-center justify-center z-100 p-4 md:p-10">
      
      {/* CONTENEDOR ESTILO PIXEL */}
      <div className="bg-white border-8 border-black shadow-[15px_15px_0px_#000] w-full max-w-4xl overflow-hidden transform transition-all">
        
        {/* HEADER CON LÍNEA ROJA Y ESTILO RETRO */}
        <div className="bg-[#263238] p-8 flex justify-between items-center relative border-b-8 border-black">
          <div className="absolute top-0 left-0 w-3 h-full bg-[#E53935]"></div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter" style={{ textShadow: '2px 2px 0px #E53935' }}>
              {title}
            </h2>
            <p className="text-yellow-400 text-xs font-black tracking-[0.2em] uppercase mt-1">ESTACIÓN DE CONTROL</p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-[#E53935] border-4 border-black text-white p-2 hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <X className="w-6 h-6" strokeWidth={4} />
          </button>
        </div>

        <div className="p-8 bg-[#F4F7F6]">
          <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            {children ? (
              <div className="w-full">{children}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  {fields.map(field => (
                    <div key={String(field.name)} className={field.type === 'text' && String(field.name).includes('nombre') ? 'md:col-span-2' : ''}>
                      <label className="block text-xs font-black text-[#263238] uppercase tracking-widest mb-3 italic">
                        {field.label} {field.required && <span className="text-[#E53935]">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={(form[field.name] as any) || ''}
                            onChange={e => handleChange(field.name, e.target.value)}
                            disabled={field.disabled}
                            className={`${inputClass(field.disabled)} appearance-none cursor-pointer`}
                            required={field.required}
                          >
                            <option value="" className="text-gray-400">SELECCIONAR...</option>
                            {field.options?.map(opt => (
                              <option key={opt.value} value={opt.value} className="text-[#263238] font-black">
                                {opt.label.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black font-black">
                            ▼
                          </div>
                        </div>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={(form[field.name] as any) || ''}
                          onChange={e => handleChange(field.name, e.target.value, field)}
                          disabled={field.disabled}
                          min={field.min ?? (field.type === 'number' ? 0 : undefined)}
                          onKeyDown={(e) => {
                            if (field.type === 'number' && e.key === '-') e.preventDefault();
                          }}
                          className={inputClass(field.disabled)}
                          placeholder="INGRESAR DATOS..."
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* ACCIONES ESTILO BOTONES ARCADE */}
                <div className="flex flex-col md:flex-row gap-6 mt-10 pt-8 border-t-4 border-black/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="order-2 md:order-1 flex-1 bg-gray-200 border-4 border-black text-black font-black py-4 uppercase text-sm shadow-[4px_4px_0px_#000] hover:bg-white active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                  >
                    DESCARTAR
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="order-1 md:order-2 flex-[1.5] bg-[#43A047] text-white border-4 border-black font-black py-4 text-xl uppercase italic shadow-[6px_6px_0px_#000] hover:bg-[#388E3C] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6" strokeWidth={3} />
                    GUARDAR CAMBIOS
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}