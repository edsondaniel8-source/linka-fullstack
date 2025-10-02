import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import accommodationService, {
  HotelRoom,
  CreateRoomRequest,
} from "../../../../shared/lib/accommodationService";

export default function RoomEdit() {
  const { roomId } = useParams<{ roomId?: string }>();
  const [, setLocation] = useLocation();

  const [room, setRoom] = useState<HotelRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        const roomData = await accommodationService.getRoomById(roomId);
        setRoom(roomData);
      } catch (err) {
        console.error("Erro ao carregar quarto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleSave = async () => {
    if (!room) return;
    setSaving(true);

    try {
      const payload: Partial<CreateRoomRequest> = {
        roomNumber: room.roomNumber,
        status: room.status,
        amenities: room.amenities,
        images: room.images,
        ...(typeof room.pricePerNight === "number" ? { pricePerNight: room.pricePerNight } : {}),
      };

      await accommodationService.updateRoom(room.id, payload);
      alert("Quarto atualizado com sucesso!");
      setLocation("/rooms");
    } catch (err) {
      console.error("Erro ao atualizar quarto:", err);
      alert("Erro ao salvar quarto.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocation(-1 as any); // wouter suporta -1 para voltar
  };

  if (loading) return <div>Carregando...</div>;
  if (!room) return <div>Quarto não encontrado</div>;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Editando quarto: {room.roomNumber ?? room.id}</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600 }}>Número do quarto</label>
        <input
          type="text"
          value={room.roomNumber ?? ""}
          onChange={(e) =>
            setRoom((prev) => (prev ? { ...prev, roomNumber: e.target.value } : prev))
          }
          placeholder="Número do quarto"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600 }}>Preço por noite</label>
        <input
          type="number"
          value={room.pricePerNight ?? 0}
          onChange={(e) =>
            setRoom((prev) =>
              prev ? { ...prev, pricePerNight: Number(e.target.value) } : prev
            )
          }
          placeholder="Preço por noite"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600 }}>Status</label>
        <select
          value={room.status ?? "available"}
          onChange={(e) =>
            setRoom((prev) => (prev ? { ...prev, status: e.target.value } : prev))
          }
        >
          <option value="available">available</option>
          <option value="occupied">occupied</option>
          <option value="maintenance">maintenance</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600 }}>
          Amenities (separadas por vírgula)
        </label>
        <input
          type="text"
          value={(room.amenities || []).join(", ")}
          onChange={(e) =>
            setRoom((prev) =>
              prev
                ? {
                    ...prev,
                    amenities: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }
                : prev
            )
          }
          placeholder="Wi-Fi, Estacionamento, Ar condicionado"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>

        <button style={{ marginLeft: 8 }} onClick={handleCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </div>
  );
}