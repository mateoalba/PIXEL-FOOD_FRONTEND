import { useState, useEffect } from 'react';
import type { PedidoItem, Pedido, Plato } from '@/types';
import { platosApi } from '@/api/platos'; 
import { mesasApi } from '@/api/mesas'; 
import { ShoppingCart, UtensilsCrossed, CheckCircle2, Hash } from 'lucide-react';

interface Props {
  selected: Pedido | null;
  user: any;
  onSuccess: () => void;
  createItem: (data: any) => Promise<any>;
  updateItem: (id: string, data: any) => Promise<any>;
}

export function PedidoForm({ selected, user, onSuccess, createItem, updateItem }: Props) {
  const [items, setItems] = useState<PedidoItem[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [mesas, setMesas] = useState<any[]>([]); 
  const [tipo, setTipo] = useState<string>('LOCAL');
  const [idMesa, setIdMesa] = useState<string>('');
  const [estado, setEstado] = useState<string>('PENDIENTE');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataPlatos, dataMesas] = await Promise.all([
          platosApi.getAll(),
          mesasApi.getAll()
        ]);
        
        setPlatos(dataPlatos);
        setMesas(dataMesas.filter((m: any) => m.estado.toLowerCase() === 'libre'));

        if (selected) {
          setEstado(selected.estado);
          setTipo(selected.tipo);
          setIdMesa(selected.id_mesa || '');
          // Cargamos desde detalles (Entity) o items (Dto)
          const itemsCargar = selected.detalles || [];
          setItems(itemsCargar.map((i: any) => ({
            id_plato: i.id_plato,
            cantidad: i.cantidad
          })));
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargarDatos();
  }, [selected]);

  const agregarPlato = (plato: Plato) => {
    const existe = items.find(i => i.id_plato === plato.id_plato);
    if (existe) {
      setItems(items.map(i => 
        i.id_plato === plato.id_plato ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      setItems([...items, { id_plato: plato.id_plato, cantidad: 1 }]);
    }
  };

  const calcularTotal = () => items.reduce((acc, item) => {
    const p = platos.find(pl => pl.id_plato === item.id_plato);
    return acc + (p ? Number(p.precio) * item.cantidad : 0);
  }, 0);

  const enviarFormulario = async () => {
    try {
      if (selected) {
        await updateItem(selected.id_pedido, { estado });
      } else {
        const nuevoPedido = {
          tipo,
          id_usuario: user?.id || user?.id_usuario,
          id_mesa: tipo === 'LOCAL' && idMesa !== "" ? idMesa : null,
          total: Number(calcularTotal().toFixed(2)),
          estado: 'PENDIENTE',
          // Mapeo limpio para cumplir con tu CreateDetallePedidoDto
          items: items.map(i => ({
            id_plato: i.id_plato,
            cantidad: Number(i.cantidad)
          }))
        };
        await createItem(nuevoPedido);
      }
      onSuccess();
    } catch (error: any) {
      alert("Error en el pedido: " + (error.response?.data?.message || "Revisa los campos"));
    }
  };

  // Clases de estilo Pixel-Food
  const boxStyle = "border-4 border-black bg-white shadow-[4px_4px_0px_#000]";
  const inputStyle = "w-full bg-white border-4 border-black px-4 py-2 text-sm font-black uppercase outline-none focus:bg-yellow-50 transition-colors";

  if (selected) {
    return (
      <div className="space-y-6 p-1">
        <div className="bg-[#263238] border-4 border-black p-4 shadow-[4px_4px_0px_#E53935] flex items-center gap-3">
          <Hash className="text-[#FBC02D]" size={20} />
          <p className="text-white font-black uppercase italic text-sm">
            ORDEN: <span className="text-[#FBC02D]">{selected.id_pedido.slice(0, 8)}</span>
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase italic text-gray-600">Actualizar Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputStyle}>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="PREPARANDO">EN COCINA</option>
            <option value="LISTO">LISTO</option>
            <option value="ENTREGADO">ENTREGADO</option>
          </select>
        </div>
        <button onClick={enviarFormulario} className="w-full bg-[#43A047] text-white border-4 border-black py-4 font-black uppercase italic shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
          <CheckCircle2 size={20} /> GUARDAR CAMBIOS
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar p-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase italic">Servicio</label>
          <select value={tipo} onChange={(e) => { setTipo(e.target.value); if(e.target.value !== 'LOCAL') setIdMesa(''); }} className={inputStyle}>
            <option value="LOCAL">LOCAL</option>
            <option value="PARA_LLEVAR">LLEVAR</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase italic">Mesa</label>
          <select value={idMesa} onChange={(e) => setIdMesa(e.target.value)} disabled={tipo !== 'LOCAL'} className={`${inputStyle} disabled:bg-gray-200 disabled:shadow-none`}>
            <option value="">SELECCIONAR...</option>
            {mesas.map(m => (
              <option key={m.id_mesa} value={m.id_mesa}>MESA #{m.numero}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={boxStyle}>
        <div className="bg-[#FBC02D] border-b-4 border-black p-2 flex items-center gap-2">
            <UtensilsCrossed size={14} />
            <p className="text-[10px] font-black uppercase italic">Seleccionar Platos</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 max-h-40 overflow-y-auto bg-white">
          {platos.map(p => (
            <button key={p.id_plato} onClick={() => agregarPlato(p)} className="flex justify-between items-center p-2 border-2 border-black hover:bg-yellow-50 transition-all active:translate-y-0.5 font-black uppercase text-[10px]">
              <span className="truncate">{p.nombre}</span>
              <span className="text-[#E53935] ml-2 shrink-0">${Number(p.precio).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-4 border-black bg-[#fafafa] p-4 shadow-[6px_6px_0px_#263238]">
        <div className="flex items-center gap-2 mb-4 border-b-2 border-black/10 pb-2">
            <ShoppingCart size={16} className="text-[#E53935]" />
            <p className="text-xs font-black uppercase italic text-[#263238]">Resumen de Pedido ({items.length})</p>
        </div>
        {items.length === 0 ? (
          <p className="text-[10px] text-gray-400 font-bold uppercase italic text-center py-2">Sin platos seleccionados</p>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id_plato} className="flex justify-between items-center text-[11px] font-black uppercase border-b-2 border-dashed border-gray-300 pb-1">
                <span>{platos.find(p => p.id_plato === item.id_plato)?.nombre} <span className="text-[#E53935]">x{item.cantidad}</span></span>
                <span>${((platos.find(p => p.id_plato === item.id_plato)?.precio || 0) * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4">
              <span className="font-black text-[10px] uppercase italic">Total a Pagar</span>
              <span className="font-black text-3xl text-[#E53935] italic tracking-tighter leading-none">${calcularTotal().toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={enviarFormulario} 
        disabled={items.length === 0 || (tipo === 'LOCAL' && !idMesa)} 
        className="w-full bg-[#43A047] text-white border-4 border-black py-4 font-black text-xl uppercase italic shadow-[8px_8px_0px_#000] hover:bg-[#388E3C] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none"
      >
        CONFIRMAR PEDIDO
      </button>
    </div>
  );
}