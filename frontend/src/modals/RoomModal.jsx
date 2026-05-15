import { useState } from 'react';
import Modal from '../components/modal/modal.jsx';
import './modals.css';

const RoomModal = ({ mode = 'join', onClose, onSubmit }) => {
  const isJoin = mode === 'join';

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) {
      return setError(isJoin ? 'Invite code is required' : 'Room name is required');
    }

    setError('');
    setIsLoading(true);

    try {
      const value = isJoin
        ? input.trim().toUpperCase()
        : input.trim();

      await onSubmit(value);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <Modal
      title={isJoin ? 'Join a room' : 'Create a room'}
      onClose={onClose}
    >
      <input
        type="text"
        placeholder={isJoin ? 'Enter invite code' : 'Room name'}
        value={isJoin ? input.toUpperCase() : input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={isJoin ? 8 : undefined}
        autoFocus
      />

      {error && <p className="room-modal__error">{error}</p>}

      <div className="room-modal__actions">
        <button className="room-modal__cancel-btn" onClick={onClose}>
          Cancel
        </button>

        <button
          className="room-modal__submit-btn"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading
            ? isJoin
              ? 'Joining...'
              : 'Creating...'
            : isJoin
              ? 'Join'
              : 'Create'}
        </button>
      </div>
    </Modal>
  );
};

export default RoomModal;