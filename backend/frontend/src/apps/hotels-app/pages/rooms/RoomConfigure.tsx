import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import accommodationService, { HotelRoom } from "../../../../shared/lib/accommodationService";

interface RoomConfigureProps {
  accommodationId: string; // Required prop for accommodation ID
}

export default function RoomConfigure({ accommodationId }: RoomConfigureProps) {
  // Conecta a rota "/rooms/configure/:roomId?" (roomId opcional para edição)
  const [match, params] = useRoute("/rooms/configure/:roomId");
  const roomId = params?.roomId;

  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<Partial<HotelRoom>>({
    roomNumber: "",
    roomType: "",
    pricePerNight: 0,
    status: "Disponível",
    amenities: [],
    images: [],
  });

  // Carrega dados se estiver editando
  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        const data = await accommodationService.getRoomById(roomId);
        setRoomData(data);
      } catch (err) {
        console.error("Erro ao carregar quarto:", err);
        setError("Não foi possível carregar os dados do quarto.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleChange = (key: keyof HotelRoom, value: any) => {
    setRoomData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const roomToSave = {
        accommodationId, // Required
        roomTypeId: roomData.roomTypeId || roomData.roomType || "", // Map roomType to roomTypeId, fallback to empty string
        roomNumber: roomData.roomNumber || "", // Required
        roomType: roomData.roomType || "", // Included for compatibility
        pricePerNight: roomData.pricePerNight ?? 0, // Optional, fallback to 0
        status: roomData.status || "Disponível", // Optional, fallback to "Disponível"
        amenities: roomData.amenities || [], // Optional, fallback to empty array
        images: roomData.images || [], // Optional, fallback to empty array
      };

      if (roomId) {
        await accommodationService.updateRoom(roomId, roomToSave);
        alert("Quarto atualizado com sucesso!");
      } else {
        await accommodationService.createRoom(roomToSave);
        alert("Quarto criado com sucesso!");
      }
      setLocation("/rooms");
    } catch (err) {
      console.error("Erro ao salvar quarto:", err);
      alert("Erro ao salvar o quarto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando dados do quarto...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1>{roomId ? "Editar Quarto" : "Criar Novo Quarto"}</h1>

      <div style={{ marginBottom: 12 }}>
        <label>Número do Quarto:</label>
        <input
          type="text"
          value={roomData.roomNumber || ""}
          onChange={(e) => handleChange("roomNumber", e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Tipo de Quarto:</label>
        <input
          type="text"
          value={roomData.roomType || ""}
          onChange={(e) => handleChange("roomType", e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Preço por Noite:</label>
        <input
          type="number"
          value={roomData.pricePerNight || 0}
          onChange={(e) => handleChange("pricePerNight", parseFloat(e.target.value))}
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Status:</label>
        <select
          value={roomData.status || "Disponível"}
          onChange={(e) => handleChange("status", e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="Disponível">Disponível</option>
          <option value="Ocupado">Ocupado</option>
          <option value="Manutenção">Manutenção</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Amenities (separados por vírgula):</label>
        <input
          type="text"
          value={(roomData.amenities || []).join(", ")}
          onChange={(e) => handleChange("amenities", e.target.value.split(",").map((a) => a.trim()))}
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>URLs das Imagens (separadas por vírgula):</label>
        <input
          type="text"
          value={(roomData.images || []).join(", ")}
          onChange={(e) => handleChange("images", e.target.value.split(",").map((a) => a.trim()))}
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "8px 16px", background: "#4caf50", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          {saving ? "Salvando..." : "Salvar Quarto"}
        </button>
        <button
          onClick={() => setLocation("/rooms")}
          style={{ marginLeft: 8, padding: "8px 16px", background: "#ccc", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}