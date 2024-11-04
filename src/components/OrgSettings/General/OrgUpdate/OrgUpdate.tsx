import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import type { ApolloError } from '@apollo/client';
import { WarningAmberRounded } from '@mui/icons-material';
import { UPDATE_ORGANIZATION_MUTATION } from 'GraphQl/Mutations/mutations';
import { ORGANIZATIONS_LIST } from 'GraphQl/Queries/Queries';
import Loader from 'components/Loader/Loader';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { errorHandler } from 'utils/errorHandler';
import styles from './OrgUpdate.module.css';
import type {
  InterfaceQueryOrganizationsListObject,
  InterfaceAddress,
} from 'utils/interfaces';
import { countryOptions } from 'utils/formEnumFields';
import useLocalStorage from 'utils/useLocalstorage';

interface InterfaceOrgUpdateProps {
  orgId: string;
}

/**
 * Component for updating organization details.
 *
 * This component allows users to update the organization's name, description, address,
 * visibility settings, and upload an image. It uses GraphQL mutations and queries to
 * fetch and update data.
 *
 * @param props - Component props containing the organization ID.
 * @returns The rendered component.
 */
function orgUpdate(props: InterfaceOrgUpdateProps): JSX.Element {
  const { orgId } = props;
  const { getItem } = useLocalStorage();

  const [formState, setFormState] = useState<{
    orgName: string;
    orgDescrip: string;
    address: InterfaceAddress;
    orgImage: string | null;
  }>({
    orgName: '',
    orgDescrip: '',
    address: {
      city: '',
      countryCode: '',
      dependentLocality: '',
      line1: '',
      line2: '',
      postalCode: '',
      sortingCode: '',
      state: '',
    },
    orgImage: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleInputChange = (fieldName: string, value: string): void => {
    setFormState((prevState) => ({
      ...prevState,
      address: {
        ...prevState.address,
        [fieldName]: value,
      },
    }));
  };

  const [userRegistrationRequiredChecked, setuserRegistrationRequiredChecked] =
    React.useState(false);
  const [visiblechecked, setVisibleChecked] = React.useState(false);

  const [login] = useMutation(UPDATE_ORGANIZATION_MUTATION);

  const { t } = useTranslation('translation', {
    keyPrefix: 'orgUpdate',
  });
  const { t: tCommon } = useTranslation('common');

  const {
    data,
    loading,
    refetch,
    error,
  }: {
    data?: {
      organizations: InterfaceQueryOrganizationsListObject[];
    };
    loading: boolean;
    refetch: (variables: { id: string }) => void;
    error?: ApolloError;
  } = useQuery(ORGANIZATIONS_LIST, {
    variables: { id: orgId },
    notifyOnNetworkStatusChange: true,
  });

  // Update form state when data changes
  useEffect(() => {
    let isMounted = true;
    if (data && isMounted) {
      setFormState({
        ...formState,
        orgName: data.organizations[0].name,
        orgDescrip: data.organizations[0].description,
        address: data.organizations[0].address,
      });
      setuserRegistrationRequiredChecked(
        data.organizations[0].userRegistrationRequired,
      );
      setVisibleChecked(data.organizations[0].visibleInSearch);
    }
    return () => {
      isMounted = false;
    };
  }, [data, orgId]);

  /**
   * Handles the save button click event.
   * Updates the organization with the form data.
   */
  const onSaveChangesClicked = async (): Promise<void> => {
    try {
      const { data } = await login({
        variables: {
          id: orgId,
          name: formState.orgName,
          description: formState.orgDescrip,
          address: {
            city: formState.address.city,
            countryCode: formState.address.countryCode,
            dependentLocality: formState.address.dependentLocality,
            line1: formState.address.line1,
            line2: formState.address.line2,
            postalCode: formState.address.postalCode,
            sortingCode: formState.address.sortingCode,
            state: formState.address.state,
          },
          userRegistrationRequired: userRegistrationRequiredChecked,
          visibleInSearch: visiblechecked,
        },
      });
      // istanbul ignore next
      if (data) {
        refetch({ id: orgId });
        toast.success(t('successfulUpdated'));
      }
    } catch (error: unknown) {
      errorHandler(t, error);
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setShowPreviewModal(true);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const handleSaveImage = async (): Promise<void> => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append('file', selectedImage);
      const accessToken = getItem('token');
      try {
        const response = await fetch(
          `${process.env.REACT_APP_TALAWA_REST_URL}/org/${orgId}/update-image`,
          {
            method: 'POST',
            body: formData,
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data) {
            refetch({ id: orgId });
            toast.success(t('successfulUpdated'));
          }
          console.log(data);
          setShowPreviewModal(false);
          setSelectedImage(null);
        } else {
          console.error('Failed to update profile picture');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleCancelImage = (): void => {
    setPreviewUrl(null);
    setSelectedImage(null);
    setShowPreviewModal(false);
  };

  if (loading) {
    return <Loader styles={styles.message} size="lg" />;
  }

  if (error) {
    return (
      <div className={styles.message}>
        <WarningAmberRounded className={styles.icon} fontSize="large" />
        <h6 className="fw-bold text-danger text-center">
          Error occured while loading Organization Data
          <br />
          {`${error.message}`}
        </h6>
      </div>
    );
  }

  return (
    <>
      <div id="orgupdate" className={styles.userupdatediv}>
        <form>
          <Form.Label>{tCommon('name')}</Form.Label>
          <Form.Control
            className="mb-3"
            placeholder={t('enterNameOrganization')}
            autoComplete="off"
            required
            value={formState.orgName}
            onChange={(e): void => {
              setFormState({
                ...formState,
                orgName: e.target.value,
              });
            }}
          />
          <Form.Label>{tCommon('description')}</Form.Label>
          <Form.Control
            className="mb-3"
            placeholder={tCommon('description')}
            autoComplete="off"
            required
            value={formState.orgDescrip}
            onChange={(e): void => {
              setFormState({
                ...formState,
                orgDescrip: e.target.value,
              });
            }}
          />
          <Form.Label>{tCommon('address')}</Form.Label>
          <Row className="mb-1">
            <Col sm={6} className="mb-3">
              <Form.Control
                required
                as="select"
                value={formState.address.countryCode}
                data-testid="countrycode"
                onChange={(e) => {
                  const countryCode = e.target.value;
                  handleInputChange('countryCode', countryCode);
                }}
              >
                <option value="" disabled>
                  Select a country
                </option>
                {countryOptions.map((country) => (
                  <option
                    key={country.value.toUpperCase()}
                    value={country.value.toUpperCase()}
                  >
                    {country.label}
                  </option>
                ))}
              </Form.Control>
            </Col>
            <Col sm={6} className="mb-3">
              <Form.Control
                placeholder={t('city')}
                autoComplete="off"
                required
                value={formState.address.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Col>
          </Row>
          <Row className="mb-1">
            <Col sm={6} className="mb-3">
              <Form.Control
                placeholder={t('state')}
                autoComplete="off"
                value={formState.address.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </Col>
            <Col sm={6} className="mb-3">
              <Form.Control
                placeholder={t('dependentLocality')}
                autoComplete="off"
                value={formState.address.dependentLocality}
                onChange={(e) =>
                  handleInputChange('dependentLocality', e.target.value)
                }
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={6} className="mb-1">
              <Form.Control
                placeholder={t('line1')}
                autoComplete="off"
                value={formState.address.line1}
                onChange={(e) => handleInputChange('line1', e.target.value)}
              />
            </Col>
            <Col sm={6} className="mb-1">
              <Form.Control
                placeholder={t('line2')}
                autoComplete="off"
                value={formState.address.line2}
                onChange={(e) => handleInputChange('line2', e.target.value)}
              />
            </Col>
          </Row>
          <Row className="mb-1">
            <Col sm={6} className="mb-1">
              <Form.Control
                placeholder={t('postalCode')}
                autoComplete="off"
                value={formState.address.postalCode}
                onChange={(e) =>
                  handleInputChange('postalCode', e.target.value)
                }
              />
            </Col>
            <Col sm={6} className="mb-1">
              <Form.Control
                placeholder={t('sortingCode')}
                autoComplete="off"
                value={formState.address.sortingCode}
                onChange={(e) =>
                  handleInputChange('sortingCode', e.target.value)
                }
              />
            </Col>
          </Row>
          <Row>
            <Col sm={6} className="d-flex mb-3">
              <Form.Label className="me-3">
                {t('userRegistrationRequired')}:
              </Form.Label>
              <Form.Switch
                placeholder={t('userRegistrationRequired')}
                checked={userRegistrationRequiredChecked}
                onChange={(): void =>
                  setuserRegistrationRequiredChecked(
                    !userRegistrationRequiredChecked,
                  )
                }
              />
            </Col>
            <Col sm={6} className="d-flex mb-3">
              <Form.Label className="me-3">
                {t('isVisibleInSearch')}:
              </Form.Label>
              <Form.Switch
                placeholder={t('isVisibleInSearch')}
                checked={visiblechecked}
                onChange={(): void => setVisibleChecked(!visiblechecked)}
              />
            </Col>
          </Row>
          <Form.Label htmlFor="orgphoto">{tCommon('displayImage')}:</Form.Label>
          <Form.Control
            className="mb-4"
            accept="image/*"
            placeholder={tCommon('displayImage')}
            name="photo"
            type="file"
            multiple={false}
            onChange={handleImageChange}
            data-testid="organisationImage"  
            />
          <div className="d-flex justify-content-end">
            <Button
              variant="success"
              value="savechanges"
              onClick={onSaveChangesClicked}
            >
              {tCommon('saveChanges')}
            </Button>
          </div>
        </form>
      </div>
      {showPreviewModal && previewUrl && (
        <Modal
          show={showPreviewModal}
          onHide={handleCancelImage}
          backdrop="static"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Image Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '100%', height: 'auto' }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelImage}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveImage}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
export default orgUpdate;
