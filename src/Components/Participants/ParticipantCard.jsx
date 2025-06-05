import React from 'react';

const ParticipantCard = ({ participant, vacaColor }) => {
  if (!participant) return null;
  return (
    <div className="participant-card" style={{ borderLeft: `5px solid ${vacaColor || '#3F60E5'}` }}>
      <div className="participant-avatar" style={{backgroundColor: vacaColor || '#3F60E5'}}>
        {participant.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="participant-info">
        <div className="participant-name">{participant.name}</div>
        <div className="participant-email">{participant.email}</div>
        <div className="participant-status">{participant.status}</div>
        <div className="participant-contribution">Aporte: ${participant.amount || 0}</div>
        {participant.percent !== undefined && (
          <div className="participant-percent">{participant.percent}%</div>
        )}
      </div>
    </div>
  );
};

export default ParticipantCard;
