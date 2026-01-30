import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import axios from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
  id: string; // Cambiado a string para coincidir con el IsUUID del DTO
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrdersPageProps {
  onNavigate: (page: string) => void;
  cart: CartItem[];
  setCart: (cart: any[]) => void;
}

export default function OrdersPage({ onNavigate, cart, setCart }: OrdersPageProps) {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'preparing' | 'ready'>('preparing');
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // Obtenemos el usuario autenticado

  const updateQuantity = (id: string, change: number) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
      )
      .filter((item) => item.quantity > 0);
    setCart(updatedCart);
  };

  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

// FUNCIÓN AJUSTADA PARA VACIAR EL CARRITO AL FINALIZAR
  const handlePlaceOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Preparamos los items según PedidoItemDto
      const itemsParaDto = cart.map(item => ({
        id_plato: item.id,
        cantidad: item.quantity
      }));

      // 2. Construimos el body exacto para CreatePedidoDto
      const pedidoData = {
        tipo: 'LOCAL', 
        id_usuario: (user as any)?.id_usuario || undefined, 
        id_mesa: undefined, 
        total: Number(total.toFixed(2)), 
        estado: 'PENDIENTE', 
        items: itemsParaDto 
      };

      // 3. Enviamos una única petición POST
      const resPedido = await axios.post('/pedido', pedidoData);

      // Extraemos el ID que devuelve tu Entity
      const pedidoId = resPedido.data.id_pedido || resPedido.data.id;
      setNewOrderId(pedidoId);

      // --- CAMBIO CLAVE AQUÍ ---
      // Vaciamos el carrito global inmediatamente para que no persista
      setCart([]); 
      // -------------------------

      // Éxito visual
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderStatus('ready');
      }, 3000);

    } catch (error: any) {
      console.error("Error al procesar el pedido:", error.response?.data || error);
      const msg = error.response?.data?.message;
      alert(`Error de validación: ${Array.isArray(msg) ? msg.join(', ') : msg || 'Revisa la consola'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const neoBtn = "transition-all duration-100 border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none";
  const activeBtnAnim = "active:translate-y-1 active:shadow-none transition-all duration-100";

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E53935] via-[#FB8C00] to-[#FBC02D] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full border-4 border-black bg-white p-10 text-center shadow-[16px_16px_0px_#000]">
          {orderStatus === 'preparing' ? (
            <>
              <div className="w-24 h-24 bg-[#FBC02D] border-4 border-black mx-auto mb-8 flex items-center justify-center animate-bounce shadow-[8px_8px_0px_#000]">
                <Clock className="w-12 h-12 text-black" strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-black uppercase mb-4 italic tracking-tighter text-[#263238]">Preparando tu pedido...</h2>
              <p className="text-gray-600 font-bold mb-8 uppercase">Nuestra cocina está a toda marcha</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-[#43A047] border-4 border-black mx-auto mb-8 flex items-center justify-center shadow-[8px_8px_0px_#000]">
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-5xl font-black uppercase mb-2 italic tracking-tighter text-[#263238]">¡ESTÁ LISTO!</h2>
              <p className="text-gray-500 font-bold mb-8 text-lg uppercase">Pasa por ventanilla</p>
              
              <div className="border-4 border-black p-6 mb-10 bg-gray-50 text-left relative shadow-[8px_8px_0px_#000]">
                <div className="absolute -top-4 left-6 bg-[#263238] text-white border-2 border-black px-4 py-1 text-xs font-black uppercase italic">Ticket de Orden</div>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between font-black text-sm mb-2 border-b-2 border-dashed border-gray-300 pb-2 uppercase">
                    <span>{item.name} <span className="text-[#E53935] ml-2">x{item.quantity}</span></span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-6 flex justify-between items-end">
                    <span className="font-black text-sm uppercase text-gray-500">Total a pagar:</span>
                    <span className="font-black text-4xl text-[#E53935] italic">${total.toFixed(2)}</span>
                </div>
                <div className="mt-6 bg-[#263238] border-4 border-black p-4 text-center shadow-[4px_4px_0px_#FB8C00]">
                    <p className="font-black text-2xl text-white italic uppercase">Orden <span className="text-[#FBC02D]">#{newOrderId?.toString().slice(0, 8) || '...'}</span></p>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
                onClick={() => onNavigate(`caja/${newOrderId}`)}
                className={`bg-[#43A047] text-white border-4 border-black py-4 font-black uppercase shadow-[8px_8px_0px_#000] text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] ${activeBtnAnim}`}>
                Pagar Ahora
            </button>
            <button 
                onClick={() => { setCart([]); onNavigate('menu'); }}
                className={`bg-white text-black border-4 border-black py-4 font-black uppercase shadow-[8px_8px_0px_#000] text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] ${activeBtnAnim}`}
            >
                Nueva Orden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E53935] via-[#FB8C00] to-[#FBC02D] pb-20">
      <div className="bg-[#263238] border-b-4 border-black p-6 sticky top-0 z-50 shadow-[0px_4px_0px_#000]">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FBC02D] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
              <ShoppingBag size={24} className="text-black" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-black uppercase italic leading-none">Mi Pedido</h1>
              <p className="text-[#FBC02D] font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Review your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cart.length === 0 ? (
            <div className="bg-white border-4 border-black p-20 text-center shadow-[12px_12px_0px_#000]">
              <p className="font-black text-2xl uppercase italic text-gray-400">Tu carrito está vacío</p>
              <button onClick={() => onNavigate('menu')} className={`mt-6 bg-[#E53935] text-white px-8 py-3 font-black uppercase ${neoBtn}`}>Ver el Menú</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="relative border-4 border-black bg-white p-6 flex flex-col sm:flex-row items-center gap-6 shadow-[10px_10px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-transform">
                <button 
                  onClick={() => removeItem(item.id)} 
                  className={`absolute top-3 right-3 p-1.5 bg-white text-red-600 ${neoBtn} shadow-[2px_2px_0px_#000]`}
                >
                  <Trash2 size={16} strokeWidth={3} />
                </button>

                <div className="w-28 h-28 border-4 border-black overflow-hidden shrink-0 bg-gray-100 shadow-[4px_4px_0px_#000]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-black uppercase text-[#263238] italic leading-tight mb-1">{item.name}</h3>
                  <p className="text-2xl font-black text-[#E53935]">${Number(item.price).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={() => updateQuantity(item.id, -1)} className={`w-10 h-10 bg-white flex items-center justify-center font-black ${neoBtn}`}>
                    <Minus strokeWidth={4} className="w-5 h-5 text-black" />
                  </button>
                  <span className="font-black text-2xl min-w-7.5 text-center text-[#263238]">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className={`w-10 h-10 bg-[#43A047] text-white flex items-center justify-center font-black ${neoBtn}`}>
                    <Plus strokeWidth={4} className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="border-4 border-black bg-white sticky top-32 shadow-[12px_12px_0px_#000] overflow-hidden">
            <div className="bg-[#FBC02D] border-b-4 border-black p-4 text-center">
              <h2 className="font-black uppercase text-xl italic text-[#263238]">Total a Pagar</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between font-bold uppercase text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold uppercase text-sm">
                <span className="text-gray-500">Tax (10%)</span>
                <span className="text-black">${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t-4 border-black pt-4 flex justify-between items-center">
                <span className="font-black text-xl uppercase italic">Total</span>
                <span className="font-black text-4xl text-[#E53935] tracking-tighter">${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full bg-[#E53935] text-white border-4 border-black py-5 font-black uppercase text-xl shadow-[8px_8px_0px_#8b1b1b] hover:translate-y-1 hover:shadow-[4px_4px_0px_#8b1b1b] active:translate-y-2 active:shadow-none disabled:opacity-50"
              >
                {isSubmitting ? 'GUARDANDO...' : 'Confirmar Orden'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}