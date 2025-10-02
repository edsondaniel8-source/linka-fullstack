import React, { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import accommodationService, { HotelRoom } from "../../../../shared/lib/accommodationService";

export default function RoomDetails() {
  // Conecta a rota "/rooms/:roomId"
  const [match, params] = useRoute("/rooms/:roomId");
  const roomId = params?.roomId;
  
  const [, setLocation] = useLocation();
  const [room, setRoom] = useState<HotelRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setError("ID do quarto não encontrado na URL.");
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      setLoading(true);
      try {
        const data = await accommodationService.getRoomById(roomId);
        setRoom(data);
      } catch (err) {
        console.error("Erro ao buscar quarto:", err);
        setError("Não foi possível carregar os detalhes do quarto.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleBack = () => setLocation("/rooms");
  const handleEdit = () => room && setLocation(`/rooms/edit/${room.id}`);

  const handleDelete = async () => {
    if (!room) return;
    if (!confirm("Tem certeza que deseja excluir este quarto?")) return;

    try {
      await accommodationService.deleteRoom(room.id);
      alert("Quarto excluído com sucesso!");
      setLocation("/rooms");
    } catch (err) {
      console.error("Erro ao excluir quarto:", err);
      alert("Erro ao excluir quarto.");
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? (room?.images?.length || 1) - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === (room?.images?.length || 1) - 1 ? 0 : prev + 1));
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) return <div>Carregando detalhes do quarto...</div>;
  if (error) return <div>{error}</div>;
  if (!room) return <div>Quarto não encontrado.</div>;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Detalhes do Quarto {room.roomNumber}</h1>

      <div style={{ marginBottom: 12 }}>
        <strong>Tipo de Quarto:</strong> {room.roomType}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Preço por Noite:</strong> {room.pricePerNight.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Status:</strong> {room.status}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Amenities:</strong> {room.amenities?.join(", ") || "Nenhuma"}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Imagens:</strong>
        {room.images?.length ? (
          <div style={{ marginTop: 8, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <button
                onClick={handlePrevImage}
                style={{
                  padding: "8px 16px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                &larr;
              </button>
              <img
                src={room.images[currentImageIndex]}
                alt={`Quarto ${room.roomNumber} ${currentImageIndex + 1}`}
                style={{ width: 300, height: 200, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                onClick={() => openModal(currentImageIndex)}
              />
              <button
                onClick={handleNextImage}
                style={{
                  padding: "8px 16px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                &rarr;
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              {currentImageIndex + 1} / {room.images.length}
            </div>
          </div>
        ) : (
          <span>Nenhuma imagem disponível</span>
        )}
      </div>

      {/* Modal for full-size image */}
      {isModalOpen && room.images && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={closeModal}
        >
          <img
            src={room.images[currentImageIndex]}
            alt={`Quarto ${room.roomNumber} ${currentImageIndex + 1}`}
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
          />
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              padding: "8px 16px",
              background: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Fechar
          </button>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleBack} style={{ marginRight: 8 }}>Voltar</button>
        <button onClick={handleEdit} style={{ marginRight: 8 }}>Editar</button>
        <button onClick={handleDelete} style={{ background: "#ff4d4f", color: "#fff" }}>
          Excluir Quarto
        </button>
      </div>
    </div>
  );
}