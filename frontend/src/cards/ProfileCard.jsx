import './ProfileCard.css'
import { formatDate } from '../utils/time';
import { useState, useRef } from 'react';
import { uploadAvatar, updateUsername } from '../services/users';
import { Pencil, X, Check } from 'lucide-react';

const ProfileCard = ({ name, email, joinedDate, avatarUrl, onUserUpdate }) => {
  const [preview, setPreview] = useState(avatarUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [username, setUsername] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const fileInputRef = useRef(null);

  const initials = username
    ?.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const data = await uploadAvatar(file);
      setPreview(data.user.avatar_url);
      onUserUpdate({ avatar_url: data.user.avatar_url });
    } catch (err) {
      console.error('Upload failed:', err);
      setPreview(avatarUrl ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    try {
      const data = await updateUsername(trimmed);
      setUsername(data.user.username);
      onUserUpdate({ username: data.user.username });
    } catch (err) {
      console.error('Failed to update username:', err);
      setNameInput(username);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNameInput(username);
    setIsEditing(false);
  };

  return (
    <div className="profile-card">
      <div className="profile-card__avatar-wrap">
        {preview
          ? <img src={preview} alt="avatar" className="profile-card__avatar-img" />
          : <div className="profile-card__avatar">{initials}</div>
        }
        {isUploading && <div className="profile-card__avatar-overlay">...</div>}
        {isEditing && (
          <button
            className="profile-card__avatar-edit-btn"
            onClick={() => fileInputRef.current.click()}
            title="Change photo"
          >
            <Pencil size={10} />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="profile-card__info">
        {isEditing ? (
          <input
            className="profile-card__name-input"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            autoFocus
          />
        ) : (
          <div className="profile-card__name">{username}</div>
        )}
        <div className="profile-card__email">{email}</div>
        <div className="profile-card__joined">Since {formatDate(joinedDate)}</div>
      </div>

      <div className="profile-card__actions">
        {isEditing ? (
          <>
            <button className="profile-card__action-btn profile-card__action-btn--save" onClick={handleSave} title="Save">
              <Check size={14} />
            </button>
            <button className="profile-card__action-btn profile-card__action-btn--cancel" onClick={handleCancel} title="Cancel">
              <X size={14} />
            </button>
          </>
        ) : (
          <button className="profile-card__action-btn" onClick={() => setIsEditing(true)} title="Edit profile">
            <Pencil size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;