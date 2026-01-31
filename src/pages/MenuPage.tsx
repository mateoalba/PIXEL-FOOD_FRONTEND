import { useState, useEffect, useRef } from 'react'; // Añadido useRef
import { useLocation } from 'react-router-dom';
import { Plus, ShoppingCart, Loader2, X, Info, Utensils } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import { categoriasApi } from '@/api/categorias';
import { platosApi } from '@/api/platos';
import type { Plato, Categoria } from '@/types';

// Extendemos la interfaz localmente para incluir las recetas que vienen de la DB
interface PlatoConRecetas extends Plato {
  recetas?: {
    id_receta: string;
    cantidad: number;
    ingrediente?: {
      id_ingrediente: string;
      nombre: string;
    };
  }[];
}

interface MenuPageProps {
  onNavigate: (page: string) => void;
  cart: any[];
  setCart: (cart: any[]) => void;
}

export default function MenuPage({ onNavigate, cart, setCart }: MenuPageProps) {
  const location = useLocation();
  const { data: categorias, loading: loadingCats } = useCrud<Categoria>(categoriasApi);
  const { data: platos, loading: loadingPlatos } = useCrud<Plato>(platosApi);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewingPlato, setViewingPlato] = useState<PlatoConRecetas | null>(null);

  // Esta referencia ayuda a saber si ya procesamos la categoría enviada desde Home
  const initialCategorySet = useRef(false);

  useEffect(() => {
    if (categorias.length > 0) {
      // Si venimos del Home y aún no hemos marcado la categoría inicial
      if (location.state?.categoryName && !initialCategorySet.current) {
        const found = categorias.find(
          c => c.nombre.toUpperCase() === location.state.categoryName.toUpperCase()
        );
        if (found) {
          setSelectedCategory(found.id_categoria);
        } else {
          setSelectedCategory(categorias[0].id_categoria);
        }
        initialCategorySet.current = true; // Bloqueamos para que no vuelva a forzar esta categoría
      } 
      // Si no hay estado o ya procesamos el inicio, solo ponemos la primera si no hay nada seleccionado
      else if (!selectedCategory) {
        setSelectedCategory(categorias[0].id_categoria);
      }
    }
  }, [categorias, location.state]);

  const addToCart = (plato: Plato) => {
    const existingItem = cart.find((item) => item.id === plato.id_plato);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === plato.id_plato ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        id: plato.id_plato, 
        name: plato.nombre, 
        price: Number(plato.precio), 
        quantity: 1,
        image: plato.imagen || '' 
      }]);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredPlatos = platos.filter(plato => {
    const idDesdeObjeto = typeof plato.categoria === 'object' ? plato.categoria?.id_categoria : null;
    const idDirecto = (plato as any).id_categoria;
    const platoCatId = idDesdeObjeto || idDirecto;
    return String(platoCatId) === String(selectedCategory);
  });

  const currentCategoryInfo = categorias.find(c => String(c.id_categoria) === String(selectedCategory));

  if (loadingCats || loadingPlatos) {
    return (
      <div className="min-h-screen bg-[#263238] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        <p className="text-white font-black mt-4 uppercase italic">Cargando Menú...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E53935] via-[#FB8C00] to-[#FBC02D] pb-10">
      
      {/* MODAL DE DETALLE DEL PRODUCTO */}
      {viewingPlato && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-8 border-black w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-[16px_16px_0px_#000] flex flex-col md:flex-row">
            
            <button 
              onClick={() => setViewingPlato(null)}
              className="absolute top-4 right-4 z-50 bg-white border-4 border-black p-1 hover:bg-[#E53935] hover:text-white transition-all duration-200"
            >
              <X size={32} strokeWidth={4} />
            </button>
            
            <div className="w-full md:w-1/2 bg-gray-100 border-b-8 md:border-b-0 md:border-r-8 border-black">
              <img 
                src={viewingPlato.imagen || 'https://placehold.co/600x400?text=Comida+Rica'} 
                alt={viewingPlato.nombre}
                className="w-full h-full object-cover min-h-75 md:min-h-125"
              />
            </div>
            
            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                   <span className="bg-[#FBC02D] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[3px_3px_0px_#000]">
                    {currentCategoryInfo?.nombre || 'Especialidad'}
                  </span>
                  {!viewingPlato.disponible && (
                    <span className="bg-red-600 text-white border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[3px_3px_0px_#000]">
                      No disponible
                    </span>
                  )}
                </div>
                
                <h2 className="text-5xl font-black uppercase italic leading-tight text-[#263238] tracking-tighter">
                  {viewingPlato.nombre}
                </h2>
                <p className="text-[#E53935] text-5xl font-black mt-2 italic drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                  ${Number(viewingPlato.precio).toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="bg-gray-50 border-4 border-black p-5 shadow-[5px_5px_0px_#000]">
                  <h4 className="font-black uppercase text-xs mb-2 flex items-center gap-2 text-gray-400">
                    <Info size={16} strokeWidth={3} /> Descripción
                  </h4>
                  <p className="text-gray-700 font-bold leading-relaxed">
                    {viewingPlato.descripcion || 'Una delicia preparada con pasión por nuestros expertos chefs.'}
                  </p>
                </div>

                <div className="bg-white border-4 border-black p-5 shadow-[5px_5px_0px_#000]">
                  <h4 className="font-black uppercase text-xs mb-3 flex items-center gap-2 text-gray-400">
                    <Utensils size={16} strokeWidth={3} /> Ingredientes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingPlato.recetas && viewingPlato.recetas.length > 0 ? (
                      viewingPlato.recetas.map((r, idx) => (
                        <span key={idx} className="bg-gray-100 border-2 border-black px-3 py-1 text-[10px] font-black uppercase italic">
                          {r.ingrediente?.nombre || 'Ingrediente'}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs font-bold text-gray-400 uppercase italic">Receta tradicional secreta</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                disabled={!viewingPlato.disponible}
                onClick={() => { addToCart(viewingPlato); setViewingPlato(null); }}
                className={`w-full py-5 border-4 border-black font-black uppercase text-2xl flex items-center justify-center gap-3 transition-all shadow-[8px_8px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                  viewingPlato.disponible 
                    ? 'bg-[#43A047] hover:bg-[#388E3C] text-white cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
                }`}
              >
                <Plus size={28} strokeWidth={4} />
                Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-[#263238] border-b-4 border-black sticky top-0 z-50 shadow-[0px_4px_0px_#000]">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-black uppercase italic leading-none">Nuestro Menú</h1>
            <p className="text-yellow-400 font-bold mt-1 uppercase text-xs tracking-widest">Deliciosa comida rápida</p>
          </div>

          <button
            onClick={() => onNavigate('carrito')}
            className="bg-[#E53935] hover:bg-[#C62828] text-white border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 transition-all shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none"
          >
            <ShoppingCart className="h-6 w-6" strokeWidth={3} />
            <span className="hidden sm:inline">Pedido</span>
            {totalItems > 0 && (
              <span className="ml-2 bg-[#FBC02D] text-black border-2 border-black px-2 py-0.5 text-xs font-black animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* SELECTOR DE CATEGORÍAS */}
        <div className="flex flex-wrap gap-2 mb-10 bg-white p-2 border-4 border-black shadow-[8px_8px_0px_#000]">
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              onClick={() => setSelectedCategory(cat.id_categoria)}
              className={`flex-1 min-w-35 px-4 py-3 font-black uppercase text-sm border-2 transition-all ${
                String(selectedCategory) === String(cat.id_categoria)
                  ? 'bg-[#E53935] text-white border-black shadow-[3px_3px_0px_#000]'
                  : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* DESCRIPCIÓN DE LA CATEGORÍA CON ANIMACIÓN */}
        {currentCategoryInfo && (
          <div 
            key={currentCategoryInfo.id_categoria} 
            className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <div className="bg-[#263238] text-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <ShoppingCart size={80} />
              </div>
              <h2 className="text-4xl font-black uppercase italic mb-2 text-[#FBC02D]">
                {currentCategoryInfo.nombre}
              </h2>
              <p className="font-bold text-gray-300 uppercase text-sm tracking-wider max-w-2xl">
                {currentCategoryInfo.descripcion || `Disfruta nuestra selección exclusiva de ${currentCategoryInfo.nombre.toLowerCase()}.`}
              </p>
            </div>
          </div>
        )}

        {/* LISTADO DE PLATOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredPlatos.map((plato) => (
            <div
              key={plato.id_plato}
              onClick={() => setViewingPlato(plato as PlatoConRecetas)}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden flex flex-col cursor-pointer group"
            >
              <div className="relative h-56 bg-gray-100 border-b-4 border-black overflow-hidden">
                {plato.imagen ? (
                  <img 
                    src={plato.imagen} 
                    alt={plato.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Comida+Rica'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🍔</div>
                )}

                {!plato.disponible ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-white text-red-600 border-4 border-red-600 px-4 py-2 font-black uppercase -rotate-12 text-xl shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                      Agotado
                    </span>
                  </div>
                ) : (
                  <span className="absolute top-3 right-3 bg-[#FBC02D] text-black border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
                    Popular
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-[#263238] uppercase italic mb-2 tracking-tight">
                  {plato.nombre}
                </h3>
                
                <p className="text-gray-500 font-bold text-xs uppercase mb-6 line-clamp-3 leading-relaxed flex-1">
                  {plato.descripcion || 'Sin descripción.'}
                </p>

                <div className="flex justify-between items-center mt-auto gap-4">
                  <span className="text-3xl font-black text-[#E53935]">
                    ${Number(plato.precio).toFixed(2)}
                  </span>
                  
                  <button
                    disabled={!plato.disponible}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      addToCart(plato); 
                    }}
                    className={`px-6 py-3 border-4 border-black font-black uppercase flex items-center gap-2 transition-all shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                      plato.disponible 
                        ? 'bg-[#43A047] hover:bg-[#388E3C] text-white cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
                    }`}
                  >
                    <Plus className="w-5 h-5" strokeWidth={4} />
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredPlatos.length === 0 && !loadingPlatos && (
          <div className="text-center py-32 border-4 border-dashed border-black/30 rounded-2xl bg-black/5">
             <p className="text-black/40 font-black uppercase text-2xl italic">No hay platos en esta sección</p>
             <p className="text-xs text-black/20 mt-2">ID Categoria Seleccionada: {selectedCategory}</p>
          </div>
        )}
      </div>
    </div>
  );
}