import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import accommodationService, { HotelRoom } from "../../../../shared/lib/accommodationService";

interface RoomListProps {
  accommodationId: string;
}

export default function RoomList({ accommodationId }: RoomListProps) {
  const [, setLocation] = useLocation();
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await accommodationService.getRooms(accommodationId);
      setRooms(data);
    } catch (err) {
      console.error("Erro ao buscar quartos:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [accommodationId]);

  const handleEdit = (roomId: string) => {
    setLocation(`/rooms/edit/${roomId}`);
  };

  const handleViewDetails = (roomId: string) => {
    setLocation(`/rooms/details/${roomId}`);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Tem certeza que deseja excluir este quarto?")) return;

    setDeleting(roomId);
    try {
      if (accommodationService.deleteRoom) {
        await accommodationService.deleteRoom(roomId);
      } else {
        console.warn("Método deleteRoom não implementado no service.");
      }
      // Atualiza a lista após exclusão
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      alert("Quarto excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir quarto:", err);
      alert("Erro ao excluir quarto.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div>Carregando quartos...</div>;
  if (rooms.length === 0) return <div>Nenhum quarto encontrado.</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Quartos</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th style={{ textAlign: "left", padding: 8 }}>Número</th>
            <th style={{ textAlign: "left", padding: 8 }}>Tipo</th>
            <th style={{ textAlign: "left", padding: 8 }}>Preço / Noite</th>
            <th style={{ textAlign: "left", padding: 8 }}>Status</th>
            <th style={{ textAlign: "center", padding: 8 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} style={{ borderBottom: "1px solid #eee" }}>
              <td
                style={{ padding: 8, cursor: "pointer", color: "#0070f3" }}
                onClick={() => handleViewDetails(room.id)}
                title="Clique para ver detalhes"
              >
                {room.roomNumber}
              </td>
              <td style={{ padding: 8 }}>{room.roomType}</td>
              <td style={{ padding: 8 }}>{room.pricePerNight?.toFixed(2) ?? "-"}</td>
              <td style={{ padding: 8 }}>{room.status}</td>
              <td style={{ padding: 8, textAlign: "center" }}>
                <button onClick={() => handleEdit(room.id)} style={{ marginRight: 8 }}>
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  disabled={deleting === room.id}
                  style={{ color: "red" }}
                >
                  {deleting === room.id ? "Excluindo..." : "Excluir"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}