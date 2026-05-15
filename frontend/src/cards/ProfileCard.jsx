import './ProfileCard.css'
import { formatDate } from '../utils/time';
import { useState, useRef, useEffect } from 'react';
import { uploadAvatar, updateUsername } from '../services/users';
import { Pencil, X, Check } from 'lucide-react';

const ProfileCard = ({ name, email, joinedDate, avatarUrl, onUserUpdate }) => {
  const [preview, setPreview] = useState(avatarUrl ?? null);
  const [pendingPreview, setPendingPreview] = useState(null); // local blob URL, not yet committed
  const [pendingFile, setPendingFile] = useState(null);       // file staged for upload on save
  const [isUploading, setIsUploading] = useState(false);
  const [username, setUsername] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const fileInputRef = useRef(null);

  // Update preview when avatarUrl prop changes
  useEffect(() => {
    setPreview(avatarUrl ?? null);
  }, [avatarUrl]);

  // Update username when name prop changes
  useEffect(() => {
    setUsername(name);
    setNameInput(name);
  }, [name]);

  const initials = username
    ?.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  // Displayed avatar: show pending preview while editing, otherwise the committed preview
  const displayedAvatar = isEditing && pendingPreview ? pendingPreview : preview;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Stage the file and show a local preview — don't upload yet
    setPendingPreview(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setIsUploading(true);
    try {
      // Upload avatar only if the user actually picked a new file
      if (pendingFile) {
        const data = await uploadAvatar(pendingFile);
        setPreview(data.user.avatar_url);
        onUserUpdate({ avatar_url: data.user.avatar_url });
      }

      // Update username
      const data = await updateUsername(trimmed);
      setUsername(data.user.username);
      onUserUpdate({ username: data.user.username });
    } catch (err) {
      console.error('Save failed:', err);
      setNameInput(username); // revert name on error
    } finally {
      // Discard pending state regardless of outcome
      setPendingPreview(null);
      setPendingFile(null);
      setIsUploading(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Discard staged file/preview — committed preview is untouched
    setPendingPreview(null);
    setPendingFile(null);
    setNameInput(username);
    setIsEditing(false);
  };

  return (
    <div className="profile-card">
      <div className="profile-card__avatar-wrap">
        {displayedAvatar
          ? <img src={displayedAvatar} alt="avatar" className="profile-card__avatar-img" />
          : <div className="profile-card__avatar">{initials}</div>
        }
        <div className="profile-card__avatar-overlay">...</div>
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
            <button className="profile-card__action-btn profile-card__action-btn--save" onClick={handleSave} title="Save" disabled={isUploading}>
              <Check size={14} />
            </button>
            <button className="profile-card__action-btn profile-card__action-btn--cancel" onClick={handleCancel} title="Cancel" disabled={isUploading}>
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