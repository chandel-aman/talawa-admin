import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Form } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

import Loader from 'components/Loader/Loader';
import { GET_COMMUNITY_DATA } from 'GraphQl/Queries/Queries';
import { RESET_COMMUNITY } from 'GraphQl/Mutations/mutations';
import {
  FacebookLogo,
  InstagramLogo,
  XLogo,
  LinkedInLogo,
  GithubLogo,
  YoutubeLogo,
  RedditLogo,
  SlackLogo,
} from 'assets/svgs/social-icons';
import convertToBase64 from 'utils/convertToBase64';
import styles from './CommunityProfile.module.css';
import { errorHandler } from 'utils/errorHandler';
import useLocalStorage from 'utils/useLocalstorage';
import UpdateSession from '../../UpdateSession/UpdateSession';
import EditableImage from 'components/EditableImage/EditableImage';

/**
 * `CommunityProfile` component allows users to view and update their community profile details.
 *
 * It includes functionalities to:
 * - Display current community profile information
 * - Update profile details including social media links and logo
 * - Reset profile changes to the initial state
 *
 * @returns JSX.Element - The `CommunityProfile` component.
 *
 * @example
 * ```tsx
 * <CommunityProfile />
 * ```
 */
const CommunityProfile = (): JSX.Element => {
  // Translation hooks for internationalization
  const { t } = useTranslation('translation', {
    keyPrefix: 'communityProfile',
  });
  const { t: tCommon } = useTranslation('common');
  const { getItem } = useLocalStorage();

  type PreLoginImageryDataType = {
    _id: string;
    name: string | undefined;
    websiteLink: string | undefined;
    logoUrl: string | undefined;
    socialMediaUrls: {
      facebook: string | undefined;
      instagram: string | undefined;
      X: string | undefined;
      linkedIn: string | undefined;
      gitHub: string | undefined;
      youTube: string | undefined;
      reddit: string | undefined;
      slack: string | undefined;
    };
  };

  // State hook for managing profile variables
  const [profileVariable, setProfileVariable] = React.useState({
    name: '',
    websiteLink: '',
    logoUrl: '',
    facebook: '',
    instagram: '',
    X: '',
    linkedIn: '',
    github: '',
    youtube: '',
    reddit: '',
    slack: '',
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const { data, loading, refetch } = useQuery(GET_COMMUNITY_DATA);
  const [resetPreLoginImagery] = useMutation(RESET_COMMUNITY);

  React.useEffect(() => {
    const preLoginData: PreLoginImageryDataType | undefined =
      data?.getCommunityData;
    if (preLoginData)
      setProfileVariable({
        name: preLoginData.name ?? '',
        websiteLink: preLoginData.websiteLink ?? '',
        logoUrl: preLoginData.logoUrl ?? '',
        facebook: preLoginData.socialMediaUrls.facebook ?? '',
        instagram: preLoginData.socialMediaUrls.instagram ?? '',
        X: preLoginData.socialMediaUrls.X ?? '',
        linkedIn: preLoginData.socialMediaUrls.linkedIn ?? '',
        github: preLoginData.socialMediaUrls.gitHub ?? '',
        youtube: preLoginData.socialMediaUrls.youTube ?? '',
        reddit: preLoginData.socialMediaUrls.reddit ?? '',
        slack: preLoginData.socialMediaUrls.slack ?? '',
      });
  }, [data]);

  /**
   * Handles change events for form inputs.
   *
   * @param e - Change event for input elements
   */
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setProfileVariable({
      ...profileVariable,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handles change events for image inputs.
   *
   * @param file - Change event for file input
   */
  const handleImageChange = async (file: File): Promise<void> => {
    if (file) {
      const base64file = await convertToBase64(file);
      setSelectedImage(file);
      setProfileVariable((prev) => ({
        ...prev,
        logoUrl: base64file ?? '',
      }));
    }
  };

  /**
   * Handles form submission to update community profile.
   *
   * @param e - Form submit event
   */
  const handleOnSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profileVariable.name);
      formData.append('websiteLink', profileVariable.websiteLink);
      formData.append('logoUrl', profileVariable.logoUrl);
      if (selectedImage) formData.append('file', selectedImage);

      // Append social media URLs as a JSON string
      const socialMediaUrls = {
        facebook: profileVariable.facebook,
        instagram: profileVariable.instagram,
        twitter: profileVariable.X,
        linkedIn: profileVariable.linkedIn,
        gitHub: profileVariable.github,
        youTube: profileVariable.youtube,
        reddit: profileVariable.reddit,
        slack: profileVariable.slack,
      };
      formData.append('socialMediaUrls', JSON.stringify(socialMediaUrls));

      const accessToken = getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_TALAWA_REST_URL}/community/update`,
        {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (response.ok) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success(t('profileChangedMsg'));
        refetch();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to update community profile',
        );
      }
    } catch (error: unknown) {
      errorHandler(t, error as Error);
    }
  };

  /**
   * Resets profile data to initial values and performs a reset operation.
   */
  const resetData = async (): Promise<void> => {
    const preLoginData: PreLoginImageryDataType | undefined =
      data?.getCommunityData;
    try {
      setProfileVariable({
        name: '',
        websiteLink: '',
        logoUrl: '',
        facebook: '',
        instagram: '',
        X: '',
        linkedIn: '',
        github: '',
        youtube: '',
        reddit: '',
        slack: '',
      });

      await resetPreLoginImagery({
        variables: {
          resetPreLoginImageryId: preLoginData?._id,
        },
      });
      toast.success(t(`resetData`));
    } catch (error: unknown) {
      /* istanbul ignore next */
      errorHandler(t, error as Error);
    }
  };

  /**
   * Determines whether the save and reset buttons should be disabled.
   *
   * @returns boolean - True if buttons should be disabled, otherwise false
   */
  const isDisabled = (): boolean => {
    if (
      profileVariable.name == '' &&
      profileVariable.websiteLink == '' &&
      profileVariable.logoUrl == ''
    ) {
      return true;
    } else {
      return false;
    }
  };

  if (loading) {
    <Loader />;
  }
  return (
    <>
      <Card
        className={`${styles.card} rounded-4 mb-4 shadow-sm border border-light-subtle`}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{t('editProfile')}</div>
        </div>
        <Card.Body>
          <div className="mb-3">{t('communityProfileInfo')}</div>

          <Form onSubmit={handleOnSubmit}>
            <div className="d-flex align-items-start justify-content-between">
              <Form.Label>{t('logo')}</Form.Label>
              <EditableImage
                src={profileVariable.logoUrl}
                alt="Community Logo"
                size="md"
                shape="rounded"
                onSave={handleImageChange}
                tooltipText={t('editCommunityLogo')}
                modalTitle={t('logo')}
                sizeConfig={{
                  maxHeight: '80px',
                  width: 'min-content',
                }}
                showContinue
              />
            </div>
            <Form.Group>
              <Form.Label className={styles.formLabel}>
                {t('communityName')}
              </Form.Label>
              <Form.Control
                type="text"
                id="communityName"
                name="name"
                value={profileVariable.name}
                onChange={handleOnChange}
                className="mb-3"
                placeholder={t('communityName')}
                autoComplete="off"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className={styles.formLabel}>
                {t('wesiteLink')}
              </Form.Label>
              <Form.Control
                type="url"
                id="websiteLink"
                name="websiteLink"
                value={profileVariable.websiteLink}
                onChange={handleOnChange}
                className="mb-3"
                placeholder={t('wesiteLink')}
                autoComplete="off"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className={styles.formLabel}>
                {t('social')}
              </Form.Label>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={FacebookLogo} alt="Facebook Logo" />
                <Form.Control
                  type="url"
                  id="facebook"
                  name="facebook"
                  data-testid="facebook"
                  className={styles.socialInput}
                  value={profileVariable.facebook}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={InstagramLogo} alt="Instagram Logo" />
                <Form.Control
                  type="url"
                  id="instagram"
                  name="instagram"
                  data-testid="instagram"
                  className={styles.socialInput}
                  value={profileVariable.instagram}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={XLogo} alt="X Logo" />
                <Form.Control
                  type="url"
                  id="X"
                  name="X"
                  data-testid="X"
                  className={styles.socialInput}
                  value={profileVariable.X}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={LinkedInLogo} alt="LinkedIn Logo" />
                <Form.Control
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  data-testid="linkedIn"
                  className={styles.socialInput}
                  value={profileVariable.linkedIn}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={GithubLogo} alt="Github Logo" />
                <Form.Control
                  type="url"
                  id="github"
                  name="github"
                  data-testid="github"
                  className={styles.socialInput}
                  value={profileVariable.github}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={YoutubeLogo} alt="Youtube Logo" />
                <Form.Control
                  type="url"
                  id="youtube"
                  name="youtube"
                  data-testid="youtube"
                  className={styles.socialInput}
                  value={profileVariable.youtube}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={RedditLogo} alt="Reddit Logo" />
                <Form.Control
                  type="url"
                  id="reddit"
                  name="reddit"
                  data-testid="reddit"
                  className={styles.socialInput}
                  value={profileVariable.reddit}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <img src={SlackLogo} alt="Slack Logo" />
                <Form.Control
                  type="url"
                  id="slack"
                  name="slack"
                  data-testid="slack"
                  className={styles.socialInput}
                  value={profileVariable.slack}
                  onChange={handleOnChange}
                  placeholder={t('url')}
                  autoComplete="off"
                />
              </div>
            </Form.Group>
            <div
              className={`${styles.btn} d-flex justify-content-end gap-3 my-3`}
            >
              <Button
                variant="outline-success"
                onClick={resetData}
                data-testid="resetChangesBtn"
                disabled={isDisabled()}
              >
                {tCommon('resetChanges')}
              </Button>
              <Button
                type="submit"
                data-testid="saveChangesBtn"
                disabled={isDisabled()}
              >
                {tCommon('saveChanges')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <UpdateSession />
    </>
  );
};

export default CommunityProfile;
