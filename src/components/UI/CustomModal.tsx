import React from 'react';
import { Modal } from 'react-bootstrap';

interface InterfaceCustomModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const CustomModal: React.FC<InterfaceCustomModalProps> = ({
  show,
  onHide,
  title,
  children,
  footer,
}) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
};

export default CustomModal;
