import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Avatar from 'components/Avatar/Avatar';
import CustomModal from 'components/UI/CustomModal';
import React, { useEffect, useRef, useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import styles from './EditableImage.module.css';

interface InterfaceSizeConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
}

interface InterfaceEditableImageProps {
  src: string | null | undefined;
  alt: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
  onSave: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  tooltipText?: string;
  modalTitle?: string;
  sizeConfig?: InterfaceSizeConfig;
  previewSizeConfig?: InterfaceSizeConfig;
  showContinue?: boolean;
}

const EditableImage: React.FC<InterfaceEditableImageProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  onSave,
  onDelete,
  tooltipText = 'Edit Image',
  modalTitle = 'Edit Image',
  sizeConfig,
  previewSizeConfig,
  showContinue = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  const { t: tCommon } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (src) {
      setPreviewUrl(src);
    }
  }, [src]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setSelectedImage(file);
      };
      reader.readAsDataURL(file);
      setIsEditing(true);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (selectedImage) {
      await onSave(selectedImage);
      setShowModal(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (onDelete) {
      await onDelete();
      setPreviewUrl(null);
      setShowModal(false);
    }
  };

  const handleEditClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = (): void => {
    setPreviewUrl(src);
    setIsEditing(false);
    setSelectedImage(null);
  };

  const renderImage = (): React.ReactNode => {
    if (src) {
      return (
        <img
          src={src}
          alt={alt}
          className={`${styles.image} ${styles[shape]}`}
          style={{ ...sizeConfig }}
        />
      );
    } else if (name) {
      return <Avatar name={name} alt={alt} size={size} shape={shape} />;
    }
  };

  const renderModalContent = (): React.ReactNode => (
    <div className={styles.modalContent}>
      <div
        className={`${styles.modalImageContainer} ${styles[shape]}`}
        style={{ ...previewSizeConfig }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className={styles.modalImage} />
        ) : (
          name && (
            <Avatar
              name={name}
              alt="profile picture"
              size="xl"
              shape={shape}
              avatarStyle={styles.modalImage}
            />
          )
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
    </div>
  );

  const renderModalFooter = (): React.ReactNode => (
    <div className={styles.modalFooter}>
      {src && onDelete && !isEditing && (
        <Button variant="danger" onClick={handleDelete}>
          {tCommon('delete')}
        </Button>
      )}
      {!isEditing && (
        <Button variant="secondary" onClick={handleEditClick}>
          {tCommon('edit')}
        </Button>
      )}
      {isEditing && (
        <>
          <Button variant="secondary" onClick={handleCancel}>
            {tCommon('cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {tCommon(showContinue ? 'continue' : 'save')}
          </Button>
        </>
      )}
      {!isEditing && (
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          {tCommon('close')}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="edit-tooltip">{tooltipText}</Tooltip>}
      >
        <div
          className={`${styles.imageContainer} ${styles[shape]}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => setShowModal(true)}
          style={{ ...sizeConfig }}
        >
          {renderImage()}
          {isHovering && (
            <div className={`${styles.editOverlay} ${styles[shape]}`}>
              <EditRoundedIcon className={styles.editIcon} />
            </div>
          )}
        </div>
      </OverlayTrigger>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalTitle}
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </CustomModal>
    </>
  );
};

export default EditableImage;
