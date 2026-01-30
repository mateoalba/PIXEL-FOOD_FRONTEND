import { useState, useEffect } from 'react';
import { recetasApi } from '@/api/recetas';
import { ingredientesApi } from '@/api/ingredientes';
import { platosApi } from '@/api/platos'; 
import type { Receta } from '@/types/receta';
import type { Ingrediente } from '@/types/ingrediente';
import type { Plato } from '@/types/plato';
import ProtectedButton from '../ProtectedButton';
import { X, PlusCircle, Trash2 } from 'lucide-react';

interface Props {
  plato: Plato | null; 
  open: boolean;
  onClose: () => void;
}

export const RecetasModal = ({ plato: initialPlato, open, onClose }: Props) => {
  const [receta, setReceta] = useState<Receta[]>([]);
  const [todosIngredientes, setTodosIngredientes] = useState<Ingrediente[]>([]);
  const [todosPlatos, setTodosPlatos] = useState<Plato[]>([]); 
  const [platoLocal, setPlatoLocal] = useState<Plato | null>(initialPlato);
  const [loading, setLoading] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState('');
  const [cantidad, setCantidad] = useState<number | ''>('');

  useEffect(() => {
    if (open) {
      setPlatoLocal(initialPlato);
      cargarAuxiliares();
      if (initialPlato) {
        cargarIngredientesPlato(initialPlato.id_plato);
      } else {
        setReceta([]); 
      }
    }
  }, [open, initialPlato]);

  const cargarAuxiliares = async () => {
    try {
      const [resIngs, resPlatos] = await Promise.all([
        ingredientesApi.getAll(),
        platosApi.getAll()
      ]);
      setTodosIngredientes(resIngs);
      setTodosPlatos(resPlatos);
    } catch (error) {
      console.error("Error al cargar auxiliares:", error);
    }
  };

  const cargarIngredientesPlato = async (idPlato: string) => {
    setLoading(true);
    try {
      const res = await recetasApi.getByPlato(idPlato);
      setReceta(res);
    } catch (error) {
      console.error("Error al cargar receta:", error);
    } finally {
      setLoading(false);
    }
  };

  const ingredienteYaExiste = (id: string) => {
    return receta.some(r => String(r.ingrediente?.id_ingrediente) === String(id));
  };

  const handlePlatoChange = (id: string) => {
    const p = todosPlatos.find(pl => String(pl.id_plato) === id);
    if (p) {
      setPlatoLocal(p);
      cargarIngredientesPlato(p.id_plato);
    } else {
      setPlatoLocal(null);
      setReceta([]);
    }
  };

  const handleAdd = async () => {
    if (Number(cantidad) <= 0) {
      alert("La cantidad debe ser un número positivo mayor a cero.");
      return;
    }
    if (!selectedIngrediente || !cantidad || !platoLocal) return;
    if (ingredienteYaExiste(selectedIngrediente)) {
        alert("Este insumo ya está en la receta.");
        return;
    }
    
    try {
      await recetasApi.create({
        id_plato: platoLocal.id_plato,
        id_ingrediente: selectedIngrediente,
        cantidad: Number(cantidad)
      });
      setSelectedIngrediente('');
      setCantidad('');
      cargarIngredientesPlato(platoLocal.id_plato); 
    } catch (error) {
      alert("Error al añadir el ingrediente");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Quitar este ingrediente de la receta?")) {
      try {
        await recetasApi.remove(id);
        if (platoLocal) cargarIngredientesPlato(platoLocal.id_plato);
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  if (!open) return null;

  // CLASE EXACTA DEL CRUD MODAL
  const inputClass = "w-full bg-white border-4 border-black px-5 py-3 text-lg font-black text-[#263238] uppercase outline-none transition-all focus:bg-yellow-50 focus:translate-x-1 focus:translate-y-1 focus:shadow-none shadow-[4px_4px_0px_#000]";

  return (
    <div className="fixed inset-0 bg-[#263238]/90 backdrop-blur-sm flex items-center justify-center z-100 p-4 md:p-10">
      
      {/* CONTENEDOR ANCHO max-w-4xl IGUAL AL CRUD MODAL */}
      <div className="bg-white border-8 border-black shadow-[15px_15px_0px_#000] w-full max-w-4xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        {/* HEADER IDÉNTICO CON p-8 Y text-3xl */}
        <div className="bg-[#263238] p-8 flex justify-between items-center relative border-b-8 border-black">
          <div className="absolute top-0 left-0 w-3 h-full bg-[#E53935]"></div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter" style={{ textShadow: '2px 2px 0px #E53935' }}>
              {platoLocal ? `RECETA: ${platoLocal.nombre}` : 'CREAR NUEVA RECETA'}
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

        {/* CUERPO CON p-8 Y BG GRISÁCEO */}
        <div className="p-8 bg-[#F4F7F6] overflow-y-auto custom-scrollbar">
          
          {/* SELECCIÓN DE PLATO (ESTILO CARD DEL CRUD) */}
          {!initialPlato && (
            <div className="mb-8 p-6 bg-white border-4 border-black shadow-[4px_4px_0px_#000]">
              <label className="block text-xs font-black text-[#263238] uppercase tracking-widest mb-3 italic">
                1. SELECCIONAR PLATO DEL MENÚ
              </label>
              <select 
                className={inputClass}
                value={platoLocal?.id_plato || ''}
                onChange={(e) => handlePlatoChange(e.target.value)}
              >
                <option value="">-- SELECCIONAR... --</option>
                {todosPlatos.map(p => (
                  <option key={p.id_plato} value={p.id_plato} className="font-black">{p.nombre.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          <div className={!platoLocal ? "opacity-30 pointer-events-none" : ""}>
            <ProtectedButton permisos={['crear_recetas']}>
              <div className="mb-8 p-6 bg-white border-4 border-black shadow-[4px_4px_0px_#000]">
                <label className="block text-xs font-black text-[#263238] uppercase tracking-widest mb-4 italic">
                  2. AÑADIR INSUMOS AL SISTEMA
                </label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-6">
                    <select 
                      className={inputClass}
                      value={selectedIngrediente}
                      onChange={(e) => setSelectedIngrediente(e.target.value)}
                    >
                      <option value="">SELECCIONAR INSUMO...</option>
                      {todosIngredientes.map(ing => (
                        <option 
                          key={ing.id_ingrediente} 
                          value={ing.id_ingrediente}
                          disabled={ingredienteYaExiste(ing.id_ingrediente)}
                          className="font-black"
                        >
                          {ing.nombre.toUpperCase()} ({ing.unidad_medida})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <input 
                      type="number" 
                      min="0.01" step="0.01" 
                      className={inputClass}
                      placeholder="CANT."
                      value={cantidad}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        if (typeof val === 'number' && val < 0) return;
                        setCantidad(val);
                      }}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button 
                      onClick={handleAdd}
                      disabled={!selectedIngrediente || !cantidad || Number(cantidad) <= 0 || ingredienteYaExiste(selectedIngrediente)}
                      className="w-full h-full bg-[#43A047] text-white border-4 border-black font-black uppercase text-sm shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 py-4"
                    >
                      <PlusCircle className="w-5 h-5" /> AÑADIR
                    </button>
                  </div>
                </div>
              </div>
            </ProtectedButton>

            {/* TABLA CON ESTILO DE BORDES CRUD */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#263238] text-white font-black uppercase text-[10px] tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4 border-b-4 border-black">INSUMO</th>
                    <th className="px-6 py-4 border-b-4 border-black text-center">CANTIDAD</th>
                    <th className="px-6 py-4 border-b-4 border-black text-center">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-black/5">
                  {receta.map((r) => (
                    <tr key={r.id_receta} className="hover:bg-yellow-50 transition-colors">
                      <td className="px-6 py-4 font-black text-[#263238] uppercase italic text-lg">{r.ingrediente?.nombre}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-white border-4 border-black px-4 py-1 font-black text-sm shadow-[3px_3px_0px_#000]">
                          {r.cantidad} {r.ingrediente?.unidad_medida.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ProtectedButton permisos={['eliminar_recetas']}>
                          <button 
                            onClick={() => handleDelete(r.id_receta)}
                            className="bg-white border-4 border-black p-2 text-[#E53935] hover:bg-[#E53935] hover:text-white shadow-[3px_3px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                          >
                            <Trash2 className="w-5 h-5" strokeWidth={3} />
                          </button>
                        </ProtectedButton>
                      </td>
                    </tr>
                  ))}
                  {receta.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="text-center py-16 text-gray-400 font-black uppercase italic text-sm tracking-widest">
                        --- NO HAY INGREDIENTES REGISTRADOS ---
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FOOTER IGUAL AL CRUD */}
        <div className="p-8 border-t-8 border-black bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-[#263238] text-white border-4 border-black font-black uppercase italic text-lg shadow-[6px_6px_0px_#000] hover:bg-black active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            FINALIZAR CONFIGURACIÓN
          </button>
        </div>
      </div>
    </div>
  );
};