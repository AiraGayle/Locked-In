import './modals.css';

const alertMessages = {
  kicked: {
    title: 'Removed from room',
    body: 'You have been removed from this room by the host.',
  },
  closed: {
    title: 'Room closed',
    body: 'This room has been closed by the host.',
  },
};

const RoomAlerts = ({ type = 'closed', onClose }) => {
  const alert = alertMessages[type] || alertMessages.closed;

  return (
    <Modal title={alert.title} onClose={onClose}>
      <p className="room-modal__message">{alert.body}</p>
      <div className="room-modal__actions">
        <button className="room-modal__submit-btn" onClick={onClose}>
          Go to dashboard
        </button>
      </div>
    </Modal>
  );
};

export default RoomAlerts;