import { useState, useEffect } from 'react';
import { platosApi } from '@/api/platos';
import { categoriasApi } from '@/api/categorias';
import type { Plato } from '@/types/plato';
import type { Categoria } from '@/types/categoria';
import { useCrud } from '@/hooks/useCrud';
import { CrudModal, type Field } from '@/components/modal/CrudModal';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { RecetasModal } from '@/components/modal/RecetasModal';
import ProtectedButton from '@/components/ProtectedButton';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  ChefHat, 
  Edit, 
  X, 
  AlertCircle, 
  LayoutGrid 
} from 'lucide-react';

export default function Platos() {
  const { data, loading, error, createItem, updateItem, deleteItem } = useCrud<Plato>(platosApi);
  const { user } = useAuth();
  
  const puedeEditarTodo = user?.permisos.includes('editar_platos') && user?.rol?.toLowerCase() !== 'empleado';
  const esEmpleado = user?.rol?.toLowerCase() === 'empleado';

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recetaOpen, setRecetaOpen] = useState(false);
  const [selected, setSelected] = useState<Plato | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriasApi.getAll();
        setCategorias(res);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCats();
  }, []);

  const fields: Field<Plato>[] = [
    { name: 'nombre', label: 'Nombre del Plato', type: 'text', required: true, disabled: !!(selected && !puedeEditarTodo) },
    { name: 'descripcion', label: 'Descripción (Ingredientes)', type: 'text', required: true, disabled: !!(selected && !puedeEditarTodo) },
    { name: 'precio', label: 'Precio', type: 'number', required: true, min: 0.01, disabled: !!(selected && !puedeEditarTodo) },
    { name: 'imagen' as any, label: 'Ruta de la Imagen', type: 'text', required: false, disabled: !!(selected && !puedeEditarTodo) },
    { 
      name: 'disponible', 
      label: '¿Está Disponible?', 
      type: 'select', 
      options: [
        { label: 'Sí (Disponible)', value: true as any },
        { label: 'No (Agotado)', value: false as any }
      ] 
    },
    {
      name: 'id_categoria' as any, 
      label: 'Categoría',
      type: 'select',
      required: true,
      disabled: !!(selected && !puedeEditarTodo),
      options: categorias.map(c => ({ label: c.nombre, value: c.id_categoria }))
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#263238] via-[#37474F] to-[#455A64] pb-10 font-sans">
      
      {/* HEADER */}
      <div className="bg-[#263238] border-b-4 border-black mb-8" style={{ boxShadow: '0px 4px 0px #000000' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#E53935] border-4 border-black flex items-center justify-center" style={{ boxShadow: '4px 4px 0px #000000' }}>
                <LayoutGrid className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl text-white font-black uppercase leading-relaxed">Gestión de Menú</h1>
                <p className="text-yellow-400 font-bold uppercase text-sm tracking-widest">PIXEL-FOOD - Control de Platos</p>
              </div>
            </div>
            
            <ProtectedButton permisos={['crear_platos']}>
              <button
                onClick={() => { setSelected(null); setModalOpen(true); }}
                className="bg-[#FB8C00] hover:bg-[#f57c00] text-white border-4 border-black font-black uppercase px-6 py-2 hover:translate-x-1 hover:translate-y-1 transition-transform flex items-center gap-2 shadow-[4px_4px_0px_#000]"
              >
                <Plus className="w-5 h-5" strokeWidth={4} /> Nuevo Plato
              </button>
            </ProtectedButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {error && (
          <div className="bg-white border-4 border-black p-4 mb-6 text-[#E53935] font-black flex items-center gap-2 shadow-[4px_4px_0px_#000000]">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#E53935]"></div>
          </div>
        ) : (
          /* GRID DE TARJETAS - AJUSTADO A 3 COLUMNAS MÁXIMO */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {data.map((plato) => (
              <div 
                key={plato.id_plato}
                className="group relative bg-white border-4 border-black flex flex-col shadow-[10px_10px_0px_#000000] hover:-translate-y-1 transition-transform"
              >
                {/* BOTÓN ELIMINAR (X ROJA) SIEMPRE VISIBLE */}
                <ProtectedButton permisos={['eliminar_platos']}>
                  <button 
                    onClick={() => { setSelected(plato); setConfirmOpen(true); }}
                    className="absolute -top-4 -right-4 z-30 bg-[#E53935] text-white border-4 border-black p-1 hover:scale-110 transition-transform shadow-[4px_4px_0px_#000]"
                  >
                    <X className="w-6 h-6" strokeWidth={4} />
                  </button>
                </ProtectedButton>

                {/* CONTENEDOR DE IMAGEN Y BOTONES OVERLAY */}
                <div className="relative h-56 border-b-4 border-black overflow-hidden bg-gray-200">
                  {plato.imagen ? (
                    <img src={plato.imagen} alt={plato.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-black">SIN IMAGEN</div>
                  )}

                  {/* OVERLAY DE BOTONES (APARECE AL PASAR EL MOUSE) */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 z-20">
                    <ProtectedButton permisos={['ver_recetas']}>
                      <button 
                        onClick={() => { setSelected(plato); setRecetaOpen(true); }}
                        className="p-4 bg-white border-4 border-black hover:bg-purple-400 transition-colors shadow-[4px_4px_0px_#000]"
                        title="Ver Receta / Ingredientes"
                      >
                        <ChefHat className="w-8 h-8 text-black" strokeWidth={3} />
                      </button>
                    </ProtectedButton>

                    <button 
                      onClick={() => { setSelected(plato); setModalOpen(true); }}
                      className="p-4 bg-white border-4 border-black hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_#000]"
                      title="Editar"
                    >
                      <Edit className="w-8 h-8 text-black" strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* INFO DEBAJO DE LA IMAGEN */}
                <div className="p-5 flex flex-col gap-3 grow bg-white">
                  <div>
                    <h3 className="text-xl font-black uppercase italic text-[#263238]">{plato.nombre}</h3>
                    {/* INGREDIENTES DEBAJO DEL NOMBRE */}
                    <p className="text-[11px] text-gray-500 font-bold uppercase leading-tight mt-1 line-clamp-2">
                      {plato.descripcion}
                    </p>
                  </div>
                  
                  {/* PRECIO RESALTADO */}
                  <div className="text-3xl font-black text-[#E53935] py-1">
                    ${Number(plato.precio).toFixed(2)}
                  </div>

                  {/* FILA DE CATEGORÍA Y ESTADO (JUNTOS AL FINAL) */}
                  <div className="flex gap-2 mt-auto">
                    <div className="flex-1 bg-[#FB8C00] text-white border-2 border-black font-black py-2 text-[10px] uppercase text-center shadow-[2px_2px_0px_#000]">
                      {plato.categoria?.nombre || 'General'}
                    </div>
                    <div className={`flex-1 border-2 border-black font-black py-2 text-[10px] uppercase text-center shadow-[2px_2px_0px_#000] ${
                      plato.disponible ? 'bg-[#43A047] text-white' : 'bg-[#E53935] text-white'
                    }`}>
                      {plato.disponible ? 'Disponible' : 'Agotado'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALES */}
      <RecetasModal open={recetaOpen} plato={selected} onClose={() => { setRecetaOpen(false); setSelected(null); }} />

      <CrudModal<Plato>
        open={modalOpen}
        title={esEmpleado ? 'ACTUALIZAR DISPONIBILIDAD' : (selected ? 'EDITAR PLATO' : 'CREAR NUEVO PLATO')}
        initialData={selected || undefined}
        fields={fields}
        onSubmit={(form) => {
          const { id_plato, categoria, recetas, ...payload } = form as any;
          const finalPayload = {
            ...payload,
            precio: Number(payload.precio),
            disponible: String(payload.disponible) === 'true' 
          };
          if (selected) updateItem(selected.id_plato, finalPayload);
          else createItem(finalPayload);
          setModalOpen(false);
          setSelected(null);
        }}
        onClose={() => { setModalOpen(false); setSelected(null); }}
      />

      <ConfirmModal
        open={confirmOpen}
        title="¡ALERTA DE ELIMINACIÓN!"
        message={`¿Deseas borrar "${selected?.nombre}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selected) deleteItem(selected.id_plato);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}