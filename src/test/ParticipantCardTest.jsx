import React from 'react';
import ParticipantCard from '../Components/Participants/ParticipantCard.jsx';

// Datos de prueba para el componente
const testParticipant = {
  id: '123',
  user_id: 'user-123',
  name: 'Usuario de Prueba',
  email: 'test@example.com',
  created_at: '2024-01-01T10:00:00Z'
};

const testStats = {
  totalContributions: 1500,
  transactionCount: 5,
  lastActivity: '2024-02-15T14:30:00Z'
};

const ParticipantCardTest = () => {
  const handleRemove = (id) => {
    console.log('Eliminar participante:', id);
  };

  const handleViewDetails = (participant) => {
    console.log('Ver detalles:', participant);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Prueba del ParticipantCard</h2>
      
      <h3>Participante Activo (Admin)</h3>
      <ParticipantCard
        participant={testParticipant}
        stats={testStats}
        vacaColor="#3F60E5"
        isAdmin={true}
        currentUserId="current-user-id"
        onRemove={handleRemove}
        onViewDetails={handleViewDetails}
      />

      <h3>Usuario Actual</h3>
      <ParticipantCard
        participant={{...testParticipant, user_id: 'current-user-id'}}
        stats={testStats}
        vacaColor="#10b981"
        isAdmin={false}
        currentUserId="current-user-id"
        onRemove={handleRemove}
        onViewDetails={handleViewDetails}
      />

      <h3>Participante Pendiente</h3>
      <ParticipantCard
        participant={{...testParticipant, user_id: null, id: '456'}}
        stats={{}}
        vacaColor="#f59e0b"
        isAdmin={true}
        currentUserId="current-user-id"
        onRemove={handleRemove}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default ParticipantCardTest;
