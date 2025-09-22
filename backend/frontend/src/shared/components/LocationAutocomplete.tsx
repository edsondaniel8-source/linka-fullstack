import { useState, useRef, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";

// Enhanced Mozambican locations with neighborhoods, reference points and detailed descriptions
const mozambiqueLocations = [
  // Maputo Cidade - Neighborhoods and Reference Points
  { name: "Maputo", province: "Maputo Cidade", country: "Moçambique", fullName: "Maputo, Maputo Cidade, Moçambique", type: "city" },
  { name: "Polana", province: "Maputo Cidade", country: "Moçambique", fullName: "Polana, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Baixa", province: "Maputo Cidade", country: "Moçambique", fullName: "Baixa, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Sommerschield", province: "Maputo Cidade", country: "Moçambique", fullName: "Sommerschield, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Coop", province: "Maputo Cidade", country: "Moçambique", fullName: "Coop, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Costa do Sol", province: "Maputo Cidade", country: "Moçambique", fullName: "Costa do Sol, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Aeroporto Internacional de Maputo", province: "Maputo Cidade", country: "Moçambique", fullName: "Aeroporto Internacional de Maputo, Maputo Cidade, Moçambique", type: "transport_hub", parentCity: "Maputo" },
  { name: "Mercado Central", province: "Maputo Cidade", country: "Moçambique", fullName: "Mercado Central, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  { name: "Praia da Costa do Sol", province: "Maputo Cidade", country: "Moçambique", fullName: "Praia da Costa do Sol, Maputo, Maputo Cidade, Moçambique", type: "beach", parentCity: "Maputo" },
  { name: "Hospital Central de Maputo", province: "Maputo Cidade", country: "Moçambique", fullName: "Hospital Central de Maputo, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  { name: "Universidade Eduardo Mondlane", province: "Maputo Cidade", country: "Moçambique", fullName: "Universidade Eduardo Mondlane, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  
  // Maputo Província  
  { name: "Matola", province: "Maputo Província", country: "Moçambique", fullName: "Matola, Maputo Província, Moçambique", type: "city" },
  { name: "Machava", province: "Maputo Província", country: "Moçambique", fullName: "Machava, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "Liberdade", province: "Maputo Província", country: "Moçambique", fullName: "Liberdade, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "Boane", province: "Maputo Província", country: "Moçambique", fullName: "Boane, Maputo Província, Moçambique", type: "city" },
  { name: "Manhiça", province: "Maputo Província", country: "Moçambique", fullName: "Manhiça, Maputo Província, Moçambique", type: "city" },
  { name: "Baião", province: "Maputo Província", country: "Moçambique", fullName: "Baião, Maputo Província, Moçambique", type: "city" },
  
  // Gaza
  { name: "Xai-Xai", province: "Gaza", country: "Moçambique", fullName: "Xai-Xai, Gaza, Moçambique", type: "city" },
  { name: "Praia de Xai-Xai", province: "Gaza", country: "Moçambique", fullName: "Praia de Xai-Xai, Xai-Xai, Gaza, Moçambique", type: "beach", parentCity: "Xai-Xai" },
  { name: "Chokwé", province: "Gaza", country: "Moçambique", fullName: "Chokwé, Gaza, Moçambique", type: "city" },
  { name: "Chibuto", province: "Gaza", country: "Moçambique", fullName: "Chibuto, Gaza, Moçambique", type: "city" },
  { name: "Mandlakaze", province: "Gaza", country: "Moçambique", fullName: "Mandlakaze, Gaza, Moçambique", type: "city" },
  
  // Inhambane - Tourism hotspots with beaches and reference points
  { name: "Inhambane", province: "Inhambane", country: "Moçambique", fullName: "Inhambane, Inhambane, Moçambique", type: "city" },
  { name: "Maxixe", province: "Inhambane", country: "Moçambique", fullName: "Maxixe, Inhambane, Moçambique", type: "city" },
  { name: "Vilanculos", province: "Inhambane", country: "Moçambique", fullName: "Vilanculos, Inhambane, Moçambique", type: "city" },
  { name: "Praia de Vilanculos", province: "Inhambane", country: "Moçambique", fullName: "Praia de Vilanculos, Vilanculos, Inhambane, Moçambique", type: "beach", parentCity: "Vilanculos" },
  { name: "Aeroporto de Vilanculos", province: "Inhambane", country: "Moçambique", fullName: "Aeroporto de Vilanculos, Vilanculos, Inhambane, Moçambique", type: "transport_hub", parentCity: "Vilanculos" },
  { name: "Tofo", province: "Inhambane", country: "Moçambique", fullName: "Tofo, Inhambane, Inhambane, Moçambique", type: "beach", parentCity: "Inhambane" },
  { name: "Barra", province: "Inhambane", country: "Moçambique", fullName: "Barra, Inhambane, Inhambane, Moçambique", type: "beach", parentCity: "Inhambane" },
  { name: "Massinga", province: "Inhambane", country: "Moçambique", fullName: "Massinga, Inhambane, Moçambique", type: "city" },
  
  // Sofala - Commercial hub
  { name: "Beira", province: "Sofala", country: "Moçambique", fullName: "Beira, Sofala, Moçambique", type: "city" },
  { name: "Aeroporto de Beira", province: "Sofala", country: "Moçambique", fullName: "Aeroporto de Beira, Beira, Sofala, Moçambique", type: "transport_hub", parentCity: "Beira" },
  { name: "Porto da Beira", province: "Sofala", country: "Moçambique", fullName: "Porto da Beira, Beira, Sofala, Moçambique", type: "transport_hub", parentCity: "Beira" },
  { name: "Chaimite", province: "Sofala", country: "Moçambique", fullName: "Chaimite, Beira, Sofala, Moçambique", type: "neighborhood", parentCity: "Beira" },
  { name: "Munhava", province: "Sofala", country: "Moçambique", fullName: "Munhava, Beira, Sofala, Moçambique", type: "neighborhood", parentCity: "Beira" },
  { name: "Dondo", province: "Sofala", country: "Moçambique", fullName: "Dondo, Sofala, Moçambique", type: "city" },
  { name: "Gorongosa", province: "Sofala", country: "Moçambique", fullName: "Gorongosa, Sofala, Moçambique", type: "city" },
  { name: "Parque Nacional da Gorongosa", province: "Sofala", country: "Moçambique", fullName: "Parque Nacional da Gorongosa, Gorongosa, Sofala, Moçambique", type: "landmark", parentCity: "Gorongosa" },
  
  // Manica
  { name: "Chimoio", province: "Manica", country: "Moçambique", fullName: "Chimoio, Manica, Moçambique", type: "city" },
  { name: "Aeroporto de Chimoio", province: "Manica", country: "Moçambique", fullName: "Aeroporto de Chimoio, Chimoio, Manica, Moçambique", type: "transport_hub", parentCity: "Chimoio" },
  { name: "Gondola", province: "Manica", country: "Moçambique", fullName: "Gondola, Manica, Moçambique", type: "city" },
  { name: "Sussundenga", province: "Manica", country: "Moçambique", fullName: "Sussundenga, Manica, Moçambique", type: "city" },
  
  // Tete
  { name: "Tete", province: "Tete", country: "Moçambique", fullName: "Tete, Tete, Moçambique", type: "city" },
  { name: "Moatize", province: "Tete", country: "Moçambique", fullName: "Moatize, Tete, Moçambique", type: "city" },
  { name: "Cahora Bassa", province: "Tete", country: "Moçambique", fullName: "Cahora Bassa, Tete, Moçambique", type: "landmark" },
  
  // Zambézia
  { name: "Quelimane", province: "Zambézia", country: "Moçambique", fullName: "Quelimane, Zambézia, Moçambique", type: "city" },
  { name: "Mocuba", province: "Zambézia", country: "Moçambique", fullName: "Mocuba, Zambézia, Moçambique", type: "city" },
  { name: "Milange", province: "Zambézia", country: "Moçambique", fullName: "Milange, Zambézia, Moçambique", type: "city" },
  { name: "Caia", province: "Zambézia", country: "Moçambique", fullName: "Caia, Zambézia, Moçambique", type: "city" },
  
  // Nampula
  { name: "Nampula", province: "Nampula", country: "Moçambique", fullName: "Nampula, Nampula, Moçambique", type: "city" },
  { name: "Aeroporto de Nampula", province: "Nampula", country: "Moçambique", fullName: "Aeroporto de Nampula, Nampula, Nampula, Moçambique", type: "transport_hub", parentCity: "Nampula" },
  { name: "Nacala", province: "Nampula", country: "Moçambique", fullName: "Nacala, Nampula, Moçambique", type: "city" },
  { name: "Porto de Nacala", province: "Nampula", country: "Moçambique", fullName: "Porto de Nacala, Nacala, Nampula, Moçambique", type: "transport_hub", parentCity: "Nacala" },
  { name: "Angoche", province: "Nampula", country: "Moçambique", fullName: "Angoche, Nampula, Moçambique", type: "city" },
  { name: "Ilha de Moçambique", province: "Nampula", country: "Moçambique", fullName: "Ilha de Moçambique, Nampula, Moçambique", type: "landmark" },
  
  // Cabo Delgado
  { name: "Pemba", province: "Cabo Delgado", country: "Moçambique", fullName: "Pemba, Cabo Delgado, Moçambique", type: "city" },
  { name: "Aeroporto de Pemba", province: "Cabo Delgado", country: "Moçambique", fullName: "Aeroporto de Pemba, Pemba, Cabo Delgado, Moçambique", type: "transport_hub", parentCity: "Pemba" },
  { name: "Montepuez", province: "Cabo Delgado", country: "Moçambique", fullName: "Montepuez, Cabo Delgado, Moçambique", type: "city" },
  { name: "Mocímboa da Praia", province: "Cabo Delgado", country: "Moçambique", fullName: "Mocímboa da Praia, Cabo Delgado, Moçambique", type: "city" },
  
  // Niassa
  { name: "Lichinga", province: "Niassa", country: "Moçambique", fullName: "Lichinga, Niassa, Moçambique", type: "city" },
  { name: "Cuamba", province: "Niassa", country: "Moçambique", fullName: "Cuamba, Niassa, Moçambique", type: "city" },
  { name: "Mandimba", province: "Niassa", country: "Moçambique", fullName: "Mandimba, Niassa, Moçambique", type: "city" },
  
  // More Maputo neighborhoods and reference points
  { name: "Alto Maé", province: "Maputo Cidade", country: "Moçambique", fullName: "Alto Maé, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Malhangalene", province: "Maputo Cidade", country: "Moçambique", fullName: "Malhangalene, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Maxaquene", province: "Maputo Cidade", country: "Moçambique", fullName: "Maxaquene, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Xipamanine", province: "Maputo Cidade", country: "Moçambique", fullName: "Xipamanine, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Chamanculo", province: "Maputo Cidade", country: "Moçambique", fullName: "Chamanculo, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Mafalala", province: "Maputo Cidade", country: "Moçambique", fullName: "Mafalala, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Jardim", province: "Maputo Cidade", country: "Moçambique", fullName: "Jardim, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Central", province: "Maputo Cidade", country: "Moçambique", fullName: "Central, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Munhuana", province: "Maputo Cidade", country: "Moçambique", fullName: "Munhuana, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Tempo", province: "Maputo Cidade", country: "Moçambique", fullName: "Tempo, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Bagamoyo", province: "Maputo Cidade", country: "Moçambique", fullName: "Bagamoyo, Maputo, Maputo Cidade, Moçambique", type: "neighborhood", parentCity: "Maputo" },
  { name: "Terminal de Autocarros", province: "Maputo Cidade", country: "Moçambique", fullName: "Terminal de Autocarros, Maputo, Maputo Cidade, Moçambique", type: "transport_hub", parentCity: "Maputo" },
  { name: "Estação CFM", province: "Maputo Cidade", country: "Moçambique", fullName: "Estação CFM, Maputo, Maputo Cidade, Moçambique", type: "transport_hub", parentCity: "Maputo" },
  { name: "Fortaleza de Maputo", province: "Maputo Cidade", country: "Moçambique", fullName: "Fortaleza de Maputo, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  { name: "Casa de Ferro", province: "Maputo Cidade", country: "Moçambique", fullName: "Casa de Ferro, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  { name: "Museu de História Natural", province: "Maputo Cidade", country: "Moçambique", fullName: "Museu de História Natural, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  { name: "Shopping Maputo", province: "Maputo Cidade", country: "Moçambique", fullName: "Shopping Maputo, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  { name: "Mercado do Peixe", province: "Maputo Cidade", country: "Moçambique", fullName: "Mercado do Peixe, Maputo, Maputo Cidade, Moçambique", type: "landmark", parentCity: "Maputo" },
  
  // More Matola neighborhoods and areas
  { name: "Matola A", province: "Maputo Província", country: "Moçambique", fullName: "Matola A, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "Matola B", province: "Maputo Província", country: "Moçambique", fullName: "Matola B, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "Matola C", province: "Maputo Província", country: "Moçambique", fullName: "Matola C, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "Fomento", province: "Maputo Província", country: "Moçambique", fullName: "Fomento, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "T3", province: "Maputo Província", country: "Moçambique", fullName: "T3, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "Sikwama", province: "Maputo Província", country: "Moçambique", fullName: "Sikwama, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "25 de Junho", province: "Maputo Província", country: "Moçambique", fullName: "25 de Junho, Matola, Maputo Província, Moçambique", type: "neighborhood", parentCity: "Matola" },
  { name: "Terminal da Matola", province: "Maputo Província", country: "Moçambique", fullName: "Terminal da Matola, Matola, Maputo Província, Moçambique", type: "transport_hub", parentCity: "Matola" },
  
  // Beaches around Mozambique
  { name: "Praia da Polana", province: "Maputo Cidade", country: "Moçambique", fullName: "Praia da Polana, Maputo, Maputo Cidade, Moçambique", type: "beach", parentCity: "Maputo" },
  { name: "Praia do Wimbi", province: "Cabo Delgado", country: "Moçambique", fullName: "Praia do Wimbi, Pemba, Cabo Delgado, Moçambique", type: "beach", parentCity: "Pemba" },
  { name: "Praia de Nacala", province: "Nampula", country: "Moçambique", fullName: "Praia de Nacala, Nacala, Nampula, Moçambique", type: "beach", parentCity: "Nacala" },
  { name: "Praia da Barra", province: "Gaza", country: "Moçambique", fullName: "Praia da Barra, Inhambane, Gaza, Moçambique", type: "beach", parentCity: "Inhambane" },
  { name: "Praia de Závora", province: "Inhambane", country: "Moçambique", fullName: "Praia de Závora, Inhambane, Inhambane, Moçambique", type: "beach", parentCity: "Inhambane" },
  { name: "Praia de Bazaruto", province: "Inhambane", country: "Moçambique", fullName: "Praia de Bazaruto, Vilanculos, Inhambane, Moçambique", type: "beach", parentCity: "Vilanculos" },
  { name: "Praia de Benguerra", province: "Inhambane", country: "Moçambique", fullName: "Praia de Benguerra, Vilanculos, Inhambane, Moçambique", type: "beach", parentCity: "Vilanculos" },
  { name: "Praia de Machangulo", province: "Maputo Província", country: "Moçambique", fullName: "Praia de Machangulo, Maputo Província, Moçambique", type: "beach" },
  { name: "Praia do Bilene", province: "Gaza", country: "Moçambique", fullName: "Praia do Bilene, Gaza, Moçambique", type: "beach" },
  { name: "Praia de Ponta Malongane", province: "Maputo Província", country: "Moçambique", fullName: "Praia de Ponta Malongane, Maputo Província, Moçambique", type: "beach" },
  { name: "Praia de Ponta do Ouro", province: "Maputo Província", country: "Moçambique", fullName: "Praia de Ponta do Ouro, Maputo Província, Moçambique", type: "beach" },
  
  // More Beira neighborhoods and areas
  { name: "Ponta Gêa", province: "Sofala", country: "Moçambique", fullName: "Ponta Gêa, Beira, Sofala, Moçambique", type: "neighborhood", parentCity: "Beira" },
  { name: "Macúti", province: "Sofala", country: "Moçambique", fullName: "Macúti, Beira, Sofala, Moçambique", type: "neighborhood", parentCity: "Beira" },
  { name: "Manga", province: "Sofala", country: "Moçambique", fullName: "Manga, Beira, Sofala, Moçambique", type: "neighborhood", parentCity: "Beira" },
  { name: "Esturro", province: "Sofala", country: "Moçambique", fullName: "Esturro, Beira, Sofala, Moçambique", type: "neighborhood", parentCity: "Beira" },
  { name: "Praia Nova", province: "Sofala", country: "Moçambique", fullName: "Praia Nova, Beira, Sofala, Moçambique", type: "neighborhood", parentCity: "Beira" },
  { name: "Terminal Rodoviário da Beira", province: "Sofala", country: "Moçambique", fullName: "Terminal Rodoviário da Beira, Beira, Sofala, Moçambique", type: "transport_hub", parentCity: "Beira" },
  { name: "Praia de Macúti", province: "Sofala", country: "Moçambique", fullName: "Praia de Macúti, Beira, Sofala, Moçambique", type: "beach", parentCity: "Beira" },
  
  // More Nampula areas
  { name: "Muhala", province: "Nampula", country: "Moçambique", fullName: "Muhala, Nampula, Nampula, Moçambique", type: "neighborhood", parentCity: "Nampula" },
  { name: "Napipine", province: "Nampula", country: "Moçambique", fullName: "Napipine, Nampula, Nampula, Moçambique", type: "neighborhood", parentCity: "Nampula" },
  { name: "Central de Nampula", province: "Nampula", country: "Moçambique", fullName: "Central de Nampula, Nampula, Nampula, Moçambique", type: "neighborhood", parentCity: "Nampula" },
  
  // Additional cities and towns
  { name: "Ressano Garcia", province: "Maputo Província", country: "Moçambique", fullName: "Ressano Garcia, Maputo Província, Moçambique", type: "city" },
  { name: "Namaacha", province: "Maputo Província", country: "Moçambique", fullName: "Namaacha, Maputo Província, Moçambique", type: "city" },
  { name: "Moamba", province: "Maputo Província", country: "Moçambique", fullName: "Moamba, Maputo Província, Moçambique", type: "city" },
  { name: "Marracuene", province: "Maputo Província", country: "Moçambique", fullName: "Marracuene, Maputo Província, Moçambique", type: "city" },
  { name: "Magude", province: "Maputo Província", country: "Moçambique", fullName: "Magude, Maputo Província, Moçambique", type: "city" },
  { name: "Matutuíne", province: "Maputo Província", country: "Moçambique", fullName: "Matutuíne, Maputo Província, Moçambique", type: "city" },
  { name: "Salamanga", province: "Maputo Província", country: "Moçambique", fullName: "Salamanga, Maputo Província, Moçambique", type: "city" },
  
  // More Gaza cities and landmarks
  { name: "Bilene", province: "Gaza", country: "Moçambique", fullName: "Bilene, Gaza, Moçambique", type: "city" },
  { name: "Massingir", province: "Gaza", country: "Moçambique", fullName: "Massingir, Gaza, Moçambique", type: "city" },
  { name: "Chicualacuala", province: "Gaza", country: "Moçambique", fullName: "Chicualacuala, Gaza, Moçambique", type: "city" },
  { name: "Barragem de Massingir", province: "Gaza", country: "Moçambique", fullName: "Barragem de Massingir, Gaza, Moçambique", type: "landmark" },
  
  // More Inhambane areas and beaches
  { name: "Jangamo", province: "Inhambane", country: "Moçambique", fullName: "Jangamo, Inhambane, Moçambique", type: "city" },
  { name: "Morrumbene", province: "Inhambane", country: "Moçambique", fullName: "Morrumbene, Inhambane, Moçambique", type: "city" },
  { name: "Homoíne", province: "Inhambane", country: "Moçambique", fullName: "Homoíne, Inhambane, Moçambique", type: "city" },
  { name: "Inharrime", province: "Inhambane", country: "Moçambique", fullName: "Inharrime, Inhambane, Moçambique", type: "city" },
  { name: "Zavala", province: "Inhambane", country: "Moçambique", fullName: "Zavala, Inhambane, Moçambique", type: "city" },
  { name: "Panda", province: "Inhambane", country: "Moçambique", fullName: "Panda, Inhambane, Moçambique", type: "city" },
  { name: "Funhalouro", province: "Inhambane", country: "Moçambique", fullName: "Funhalouro, Inhambane, Moçambique", type: "city" },
  { name: "Praia da Barra de Inhambane", province: "Inhambane", country: "Moçambique", fullName: "Praia da Barra de Inhambane, Inhambane, Inhambane, Moçambique", type: "beach", parentCity: "Inhambane" },
  { name: "Praia de Pomene", province: "Inhambane", country: "Moçambique", fullName: "Praia de Pomene, Inhambane, Inhambane, Moçambique", type: "beach", parentCity: "Inhambane" },
  
  // More Sofala cities
  { name: "Nhamatanda", province: "Sofala", country: "Moçambique", fullName: "Nhamatanda, Sofala, Moçambique", type: "city" },
  { name: "Búzi", province: "Sofala", country: "Moçambique", fullName: "Búzi, Sofala, Moçambique", type: "city" },
  { name: "Chibabava", province: "Sofala", country: "Moçambique", fullName: "Chibabava, Sofala, Moçambique", type: "city" },
  { name: "Chemba", province: "Sofala", country: "Moçambique", fullName: "Chemba, Sofala, Moçambique", type: "city" },
  { name: "Marromeu", province: "Sofala", country: "Moçambique", fullName: "Marromeu, Sofala, Moçambique", type: "city" },
  { name: "Muanza", province: "Sofala", country: "Moçambique", fullName: "Muanza, Sofala, Moçambique", type: "city" },
  
  // More Manica cities and landmarks
  { name: "Catandica", province: "Manica", country: "Moçambique", fullName: "Catandica, Manica, Moçambique", type: "city" },
  { name: "Manica", province: "Manica", country: "Moçambique", fullName: "Manica, Manica, Moçambique", type: "city" },
  { name: "Mossurize", province: "Manica", country: "Moçambique", fullName: "Mossurize, Manica, Moçambique", type: "city" },
  { name: "Bárue", province: "Manica", country: "Moçambique", fullName: "Bárue, Manica, Moçambique", type: "city" },
  { name: "Penhalonga", province: "Manica", country: "Moçambique", fullName: "Penhalonga, Manica, Moçambique", type: "city" },
  { name: "Monte Binga", province: "Manica", country: "Moçambique", fullName: "Monte Binga, Manica, Moçambique", type: "landmark" },
  
  // More Tete cities and landmarks
  { name: "Angónia", province: "Tete", country: "Moçambique", fullName: "Angónia, Tete, Moçambique", type: "city" },
  { name: "Tsangano", province: "Tete", country: "Moçambique", fullName: "Tsangano, Tete, Moçambique", type: "city" },
  { name: "Mutarara", province: "Tete", country: "Moçambique", fullName: "Mutarara, Tete, Moçambique", type: "city" },
  { name: "Magoe", province: "Tete", country: "Moçambique", fullName: "Magoe, Tete, Moçambique", type: "city" },
  { name: "Chifunde", province: "Tete", country: "Moçambique", fullName: "Chifunde, Tete, Moçambique", type: "city" },
  { name: "Macanga", province: "Tete", country: "Moçambique", fullName: "Macanga, Tete, Moçambique", type: "city" },
  { name: "Barragem de Cahora Bassa", province: "Tete", country: "Moçambique", fullName: "Barragem de Cahora Bassa, Tete, Moçambique", type: "landmark" },
  
  // More Zambézia cities
  { name: "Namacurra", province: "Zambézia", country: "Moçambique", fullName: "Namacurra, Zambézia, Moçambique", type: "city" },
  { name: "Nicoadala", province: "Zambézia", country: "Moçambique", fullName: "Nicoadala, Zambézia, Moçambique", type: "city" },
  { name: "Inhassunge", province: "Zambézia", country: "Moçambique", fullName: "Inhassunge, Zambézia, Moçambique", type: "city" },
  { name: "Maganja da Costa", province: "Zambézia", country: "Moçambique", fullName: "Maganja da Costa, Zambézia, Moçambique", type: "city" },
  { name: "Chinde", province: "Zambézia", country: "Moçambique", fullName: "Chinde, Zambézia, Moçambique", type: "city" },
  { name: "Lugela", province: "Zambézia", country: "Moçambique", fullName: "Lugela, Zambézia, Moçambique", type: "city" },
  { name: "Alto Molócuè", province: "Zambézia", country: "Moçambique", fullName: "Alto Molócuè, Zambézia, Moçambique", type: "city" },
  { name: "Gurué", province: "Zambézia", country: "Moçambique", fullName: "Gurué, Zambézia, Moçambique", type: "city" },
  { name: "Ilé", province: "Zambézia", country: "Moçambique", fullName: "Ilé, Zambézia, Moçambique", type: "city" },
  
  // More Nampula cities and landmarks
  { name: "Rapale", province: "Nampula", country: "Moçambique", fullName: "Rapale, Nampula, Moçambique", type: "city" },
  { name: "Ribaué", province: "Nampula", country: "Moçambique", fullName: "Ribaué, Nampula, Moçambique", type: "city" },
  { name: "Malema", province: "Nampula", country: "Moçambique", fullName: "Malema, Nampula, Moçambique", type: "city" },
  { name: "Murrupula", province: "Nampula", country: "Moçambique", fullName: "Murrupula, Nampula, Moçambique", type: "city" },
  { name: "Lalaua", province: "Nampula", country: "Moçambique", fullName: "Lalaua, Nampula, Moçambique", type: "city" },
  { name: "Mossuril", province: "Nampula", country: "Moçambique", fullName: "Mossuril, Nampula, Moçambique", type: "city" },
  { name: "Monapo", province: "Nampula", country: "Moçambique", fullName: "Monapo, Nampula, Moçambique", type: "city" },
  { name: "Meconta", province: "Nampula", country: "Moçambique", fullName: "Meconta, Nampula, Moçambique", type: "city" },
  { name: "Mogincual", province: "Nampula", country: "Moçambique", fullName: "Mogincual, Nampula, Moçambique", type: "city" },
  { name: "Memba", province: "Nampula", country: "Moçambique", fullName: "Memba, Nampula, Moçambique", type: "city" },
  { name: "Eráti", province: "Nampula", country: "Moçambique", fullName: "Eráti, Nampula, Moçambique", type: "city" },
  
  // More Cabo Delgado cities and beaches
  { name: "Mueda", province: "Cabo Delgado", country: "Moçambique", fullName: "Mueda, Cabo Delgado, Moçambique", type: "city" },
  { name: "Muidumbe", province: "Cabo Delgado", country: "Moçambique", fullName: "Muidumbe, Cabo Delgado, Moçambique", type: "city" },
  { name: "Nangade", province: "Cabo Delgado", country: "Moçambique", fullName: "Nangade, Cabo Delgado, Moçambique", type: "city" },
  { name: "Palma", province: "Cabo Delgado", country: "Moçambique", fullName: "Palma, Cabo Delgado, Moçambique", type: "city" },
  { name: "Macomia", province: "Cabo Delgado", country: "Moçambique", fullName: "Macomia, Cabo Delgado, Moçambique", type: "city" },
  { name: "Quissanga", province: "Cabo Delgado", country: "Moçambique", fullName: "Quissanga, Cabo Delgado, Moçambique", type: "city" },
  { name: "Ibo", province: "Cabo Delgado", country: "Moçambique", fullName: "Ibo, Cabo Delgado, Moçambique", type: "city" },
  { name: "Ancuabe", province: "Cabo Delgado", country: "Moçambique", fullName: "Ancuabe, Cabo Delgado, Moçambique", type: "city" },
  { name: "Chiúre", province: "Cabo Delgado", country: "Moçambique", fullName: "Chiúre, Cabo Delgado, Moçambique", type: "city" },
  { name: "Metuge", province: "Cabo Delgado", country: "Moçambique", fullName: "Metuge, Cabo Delgado, Moçambique", type: "city" },
  { name: "Balama", province: "Cabo Delgado", country: "Moçambique", fullName: "Balama, Cabo Delgado, Moçambique", type: "city" },
  { name: "Namuno", province: "Cabo Delgado", country: "Moçambique", fullName: "Namuno, Cabo Delgado, Moçambique", type: "city" },
  { name: "Meluco", province: "Cabo Delgado", country: "Moçambique", fullName: "Meluco, Cabo Delgado, Moçambique", type: "city" },
  { name: "Ilha do Ibo", province: "Cabo Delgado", country: "Moçambique", fullName: "Ilha do Ibo, Cabo Delgado, Moçambique", type: "landmark" },
  { name: "Praia de Palma", province: "Cabo Delgado", country: "Moçambique", fullName: "Praia de Palma, Palma, Cabo Delgado, Moçambique", type: "beach", parentCity: "Palma" },
  
  // More Niassa cities
  { name: "Mecanhelas", province: "Niassa", country: "Moçambique", fullName: "Mecanhelas, Niassa, Moçambique", type: "city" },
  { name: "Marrupa", province: "Niassa", country: "Moçambique", fullName: "Marrupa, Niassa, Moçambique", type: "city" },
  { name: "Metarica", province: "Niassa", country: "Moçambique", fullName: "Metarica, Niassa, Moçambique", type: "city" },
  { name: "Muembe", province: "Niassa", country: "Moçambique", fullName: "Muembe, Niassa, Moçambique", type: "city" },
  { name: "Ngauma", province: "Niassa", country: "Moçambique", fullName: "Ngauma, Niassa, Moçambique", type: "city" },
  { name: "Sanga", province: "Niassa", country: "Moçambique", fullName: "Sanga, Niassa, Moçambique", type: "city" },
  { name: "Mavago", province: "Niassa", country: "Moçambique", fullName: "Mavago, Niassa, Moçambique", type: "city" },
  { name: "Majune", province: "Niassa", country: "Moçambique", fullName: "Majune, Niassa, Moçambique", type: "city" },
  { name: "Chimbonila", province: "Niassa", country: "Moçambique", fullName: "Chimbonila, Niassa, Moçambique", type: "city" },
  { name: "Maúa", province: "Niassa", country: "Moçambique", fullName: "Maúa, Niassa, Moçambique", type: "city" },
  { name: "Reserva do Niassa", province: "Niassa", country: "Moçambique", fullName: "Reserva do Niassa, Niassa, Moçambique", type: "landmark" },
  
] as LocationItem[];

interface LocationItem {
  name: string;
  province: string;
  country: string;
  fullName: string;
  type: 'city' | 'neighborhood' | 'transport_hub' | 'landmark' | 'beach';
  parentCity?: string;
}

interface LocationAutocompleteProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: LocationItem) => void;
  className?: string;
  "data-testid"?: string;
}

export default function LocationAutocomplete({
  id,
  placeholder,
  value,
  onChange,
  onLocationSelect,
  className,
  "data-testid": testId,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<LocationItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getLocationIcon = (type: LocationItem['type']) => {
    switch (type) {
      case 'city': return 'fas fa-city';
      case 'neighborhood': return 'fas fa-home';
      case 'transport_hub': return 'fas fa-plane';
      case 'landmark': return 'fas fa-landmark';
      case 'beach': return 'fas fa-umbrella-beach';
      default: return 'fas fa-map-marker-alt';
    }
  };

  const getLocationTypeLabel = (type: LocationItem['type']) => {
    switch (type) {
      case 'city': return 'Cidade';
      case 'neighborhood': return 'Bairro';
      case 'transport_hub': return 'Transporte';
      case 'landmark': return 'Ponto de Referência';
      case 'beach': return 'Praia';
      default: return '';
    }
  };

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = (mozambiqueLocations as LocationItem[]).filter(location =>
        location.name.toLowerCase().includes(value.toLowerCase()) ||
        location.province.toLowerCase().includes(value.toLowerCase()) ||
        location.fullName.toLowerCase().includes(value.toLowerCase()) ||
        (location.parentCity && location.parentCity.toLowerCase().includes(value.toLowerCase()))
      )
      // Sort by relevance: exact matches first, then starts with, then contains
      .sort((a, b) => {
        const searchTerm = value.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match priority
        if (aName === searchTerm && bName !== searchTerm) return -1;
        if (bName === searchTerm && aName !== searchTerm) return 1;
        
        // Starts with priority
        if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
        if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
        
        // City type priority
        if (a.type === 'city' && b.type !== 'city') return -1;
        if (b.type === 'city' && a.type !== 'city') return 1;
        
        return aName.localeCompare(bName, 'pt');
      })
      .slice(0, 15); // Limit to 15 suggestions
      
      setFilteredLocations(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredLocations([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationClick = (location: LocationItem) => {
    onChange(location.name);
    onLocationSelect?.(location);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className={`pl-10 pr-4 py-3 ${className}`}
          data-testid={testId}
          autoComplete="off"
        />
      </div>
      
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {filteredLocations.map((location, index) => (
            <div
              key={`${location.name}-${location.province}-${location.type}`}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors"
              onClick={() => handleLocationClick(location)}
              data-testid={`suggestion-${index}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <i className={`${getLocationIcon(location.type)} text-primary w-4 h-4`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{location.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {location.parentCity && location.parentCity !== location.name && (
                      <span>{location.parentCity}, </span>
                    )}
                    {location.province}, {location.country}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground">
                      {getLocationTypeLabel(location.type)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredLocations.length === 15 && (
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 text-center border-t">
              Continue digitando para mais opções...
            </div>
          )}
        </div>
      )}
    </div>
  );
}