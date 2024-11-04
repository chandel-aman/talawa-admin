import React from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import styles from './UserProfileSettings.module.css';
import useLocalStorage from 'utils/useLocalstorage';
import { toast } from 'react-toastify';
import { errorHandler } from 'utils/errorHandler';
import { CalendarIcon } from '@mui/x-date-pickers';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EditableImage from 'components/EditableImage/EditableImage';

interface InterfaceUserProfile {
  firstName: string;
  lastName: string;
  createdAt: string;
  email: string;
  image: string;
  onImageUpdate: () => Promise<void>;
}
const joinedDate = (param: string): string => {
  const date = new Date(param);
  if (date?.toDateString() === 'Invalid Date') {
    return 'Unavailable';
  }
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * UserProfile component displays user profile details including an avatar or profile image, name, email, and join date.
 * It also provides a button to copy the profile link.
 *
 * @param  props - The properties to be passed into the component.
 * @param firstName - The first name of the user.
 * @param lastName - The last name of the user.
 * @param email - The email address of the user.
 * @param image - The URL of the user's profile image.
 * @returns The JSX element for the user profile card.
 */
const UserProfile: React.FC<InterfaceUserProfile> = ({
  firstName,
  lastName,
  createdAt,
  email,
  image,
  onImageUpdate,
}): JSX.Element => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'settings',
  });
  const { t: tCommon } = useTranslation('common');
  const { getItem } = useLocalStorage();

  const handleSave = async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const accessToken = getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_TALAWA_REST_URL}/user/update-profile-picture`,
        {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (response.ok) {
        toast.success(t('profileChangedMsg'));
        await onImageUpdate();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error: unknown) {
      errorHandler(t, error as Error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      const accessToken = getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_TALAWA_REST_URL}/user/update-profile-picture`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (response.ok) {
        toast.success(t('profilePictureDeletedMsg'));
        await onImageUpdate();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile picture');
      }
    } catch (error: unknown) {
      errorHandler(t, error as Error);
    }
  };

  return (
    <Card border="0" className="rounded-4 mb-4">
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{t('profileDetails')}</div>
      </div>
      <Card.Body className={styles.cardBody}>
        <div className="d-flex align-items-center gap-3 mb-2">
          <EditableImage
            src={image}
            alt={`${firstName} ${lastName}`}
            name={`${firstName} ${lastName}`}
            size="md"
            shape="circle"
            onSave={handleSave}
            onDelete={handleDelete}
            tooltipText={t('editProfilePicture')}
            modalTitle={t('profilePicture')}
            sizeConfig={{
              maxHeight: '80px',
            }}
          />

          <p className="fs-2 my-0 fw-medium">
            {firstName}&nbsp;{lastName}
          </p>
        </div>

        <div className="d-flex flex-column mx-2">
          <span data-testid="userEmail">
            <MailOutlineIcon fontSize="small" />
            &nbsp;
            {email}
          </span>
          <span>
            <CalendarIcon fontSize="small" />
            &nbsp;
            {tCommon('joined')} {joinedDate(createdAt)}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserProfile;
