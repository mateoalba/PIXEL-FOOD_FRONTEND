import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import { categoriasApi } from '@/api/categorias';
import { platosApi } from '@/api/platos';
import type { Plato, Categoria } from '@/types';

interface MenuPageProps {
  onNavigate: (page: string) => void;
  cart: any[];
  setCart: (cart: any[]) => void;
}

export default function MenuPage({ onNavigate, cart, setCart }: MenuPageProps) {
  const { data: categorias, loading: loadingCats } = useCrud<Categoria>(categoriasApi);
  const { data: platos, loading: loadingPlatos } = useCrud<Plato>(platosApi);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Efecto para debug y selección inicial
  useEffect(() => {
    if (categorias.length > 0 && !selectedCategory) {
      console.log("Categorías cargadas (UUID):", categorias[0].id_categoria);
      setSelectedCategory(categorias[0].id_categoria);
    }
  }, [categorias, selectedCategory]);

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

  /**
   * FILTRADO CORREGIDO PARA UUID Y RELACIONES TYPEORM
   */
  const filteredPlatos = platos.filter(plato => {
    // 1. Intentamos obtener el ID si 'categoria' es un objeto (relación ManyToOne)
    const idDesdeObjeto = typeof plato.categoria === 'object' ? plato.categoria?.id_categoria : null;
    
    // 2. Intentamos obtener el ID si viene como campo plano id_categoria
    const idDirecto = (plato as any).id_categoria;

    const platoCatId = idDesdeObjeto || idDirecto;

    // Comparación de UUIDs como strings
    return String(platoCatId) === String(selectedCategory);
  });

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

        {/* LISTADO DE PLATOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredPlatos.map((plato) => (
            <div
              key={plato.id_plato}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-transform overflow-hidden flex flex-col"
            >
              {/* Imagen del Plato */}
              <div className="relative h-56 bg-gray-100 border-b-4 border-black overflow-hidden">
                {plato.imagen ? (
                  <img 
                    src={plato.imagen} 
                    alt={plato.nombre}
                    className="w-full h-full object-cover"
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

              {/* Contenido */}
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
                    onClick={() => addToCart(plato)}
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