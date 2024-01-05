import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface InterfaceLogoutConfirmationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  handleConfirmSave: () => void;
  handleCancelSave: () => void;
}

const LogoutConfirmationModal: React.FC<
  InterfaceLogoutConfirmationModalProps
> = ({ isOpen, onRequestClose, handleConfirmSave, handleCancelSave }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'confirmLogoutModal',
  });

  return (
    <Modal show={isOpen} onHide={onRequestClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmLogout')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('logoutWarning')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleConfirmSave}>
          {t('yes')}
        </Button>
        <Button variant="danger" onClick={handleCancelSave}>
          {t('no')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LogoutConfirmationModal;
