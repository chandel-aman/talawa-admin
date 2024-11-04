import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Form,
  Button,
  Table,
  Alert,
  Modal,
  Dropdown,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_BACKUP,
  RESTORE_BACKUP,
  DELETE_BACKUP,
  SCHEDULE_BACKUP,
} from 'GraphQl/Mutations/mutations';
import { LIST_BACKUPS, LIST_SCHEDULED_BACKUPS } from 'GraphQl/Queries/Queries';
import styles from './CommunitySecuritySettings.module.css';

interface InterfaceBackup {
  _id: string;
  date: Date;
  type: string;
}

interface InterfaceScheduledBackup {
  _id: string;
  type: 'one-time' | 'recurring';
  frequency?: 'daily' | 'alternate' | 'weekly';
  date?: Date;
  time: string;
}

const CommunitySecuritySettings: React.FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'communitySecuritySettings',
  });
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [encryption, setEncryption] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<'one-time' | 'recurring'>(
    'one-time',
  );
  const [scheduleFrequency, setScheduleFrequency] = useState<
    'daily' | 'alternate' | 'weekly'
  >('daily');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('00:00');

  // Apollo hooks
  const [createBackup, { loading: createBackupLoading }] =
    useMutation(CREATE_BACKUP);
  const [restoreBackup, { loading: restoreBackupLoading }] =
    useMutation(RESTORE_BACKUP);
  const [deleteBackup, { loading: deleteBackupLoading }] =
    useMutation(DELETE_BACKUP);
  const [scheduleBackup] = useMutation(SCHEDULE_BACKUP);
  const {
    data: backupsData,
    loading: backupsLoading,
    refetch: refetchBackups,
  } = useQuery(LIST_BACKUPS);
  const {
    data: scheduledBackupsData,
    loading: scheduledBackupsLoading,
    refetch: refetchScheduledBackups,
  } = useQuery(LIST_SCHEDULED_BACKUPS);

  const handleInstantBackup = async (): Promise<void> => {
    try {
      const result = await createBackup();
      if (result.data.createBackup) {
        toast.success(t('instantBackupSuccess'));
        refetchBackups();
      } else {
        toast.error(t('instantBackupError'));
      }
    } catch (error) {
      toast.error(t('instantBackupError'));
      console.error('Instant backup error:', error);
    }
  };

  const handleScheduledBackup = async (): Promise<void> => {
    try {
      const variables =
        scheduleType === 'recurring'
          ? {
              type: scheduleType,
              frequency: scheduleFrequency,
              time: scheduleTime,
            }
          : { type: scheduleType, date: scheduleDate, time: scheduleTime };

      const result = await scheduleBackup({ variables });
      if (result.data.scheduleBackup) {
        toast.success(t('scheduledBackupSuccess'));
        refetchScheduledBackups();
        setShowScheduleModal(false);
      } else {
        toast.error(t('scheduledBackupError'));
      }
    } catch (error) {
      toast.error(t('scheduledBackupError'));
      console.error('Schedule backup error:', error);
    }
  };

  const handleRestore = async (): Promise<void> => {
    if (!selectedBackup) {
      toast.error(t('selectBackupError'));
      return;
    }

    try {
      const result = await restoreBackup({ variables: { id: selectedBackup } });
      if (result.data.restoreBackup) {
        toast.success(t('restoreSuccess'));
        setSelectedBackup(null);
        refetchBackups();
      } else {
        toast.error(t('restoreError'));
      }
    } catch (error) {
      toast.error(t('restoreError'));
      console.error('Restore error:', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedBackup) {
      toast.error(t('selectBackupError'));
      return;
    }

    try {
      const result = await deleteBackup({ variables: { id: selectedBackup } });
      if (result.data.deleteBackup) {
        toast.success(t('deleteSuccess'));
        setSelectedBackup(null);
        refetchBackups();
      } else {
        toast.error(t('deleteError'));
      }
    } catch (error) {
      toast.error(t('deleteError'));
      console.error('Delete error:', error);
    }
  };

  const handleEncryptionToggle = (): void => {
    setEncryption((prev) => !prev);
    // Note: Implement a separate mutation for toggling encryption
  };

  const handleBackupSelection = (id: string): void => {
    setSelectedBackup((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.securitySettingsContainer}>
      <Card className="rounded-4 mb-4 shadow-sm border border-light-subtle">
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{t('backupAndRestore')}</div>
        </div>
        <Card.Body className={styles.cardBody}>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="backup-dropdown">
              {t('backup')}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleInstantBackup}>
                {t('instantBackup')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowScheduleModal(true)}>
                {t('scheduleBackup')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <hr />

          <h5>{t('scheduledBackups')}</h5>
          {scheduledBackupsLoading ? (
            <Alert variant="info">{t('loadingScheduledBackups')}</Alert>
          ) : scheduledBackupsData?.scheduledBackups.length === 0 ? (
            <Alert variant="info">{t('noScheduledBackups')}</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>{t('type')}</th>
                  <th>{t('frequency')}</th>
                  <th>{t('date')}</th>
                  <th>{t('time')}</th>
                </tr>
              </thead>
              <tbody>
                {scheduledBackupsData?.scheduledBackups.map(
                  (backup: InterfaceScheduledBackup) => (
                    <tr key={backup._id}>
                      <td>{backup.type}</td>
                      <td>
                        {backup.type === 'recurring' ? backup.frequency : '-'}
                      </td>
                      <td>
                        {backup.type === 'one-time'
                          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            new Date(backup.date!).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>{backup.time}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </Table>
          )}

          <hr />

          <h5>{t('availableBackups')}</h5>
          {backupsLoading ? (
            <Alert variant="info">{t('loadingBackups')}</Alert>
          ) : backupsData?.backup.length === 0 ? (
            <Alert variant="info">{t('noBackupsAvailable')}</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('type')}</th>
                  <th>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {backupsData?.backup.map((backup: InterfaceBackup) => (
                  <tr
                    key={backup._id}
                    onClick={() => handleBackupSelection(backup._id)}
                    className={
                      selectedBackup === backup._id ? 'table-primary' : ''
                    }
                  >
                    <td>{new Date(backup.date).toLocaleString()}</td>
                    <td>{backup.type}</td>
                    <td>
                      <Form.Check
                        type="radio"
                        name="backupSelection"
                        checked={selectedBackup === backup._id}
                        // onChange={() => {}}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <div className="d-flex gap-2">
            <Button
              variant="success"
              onClick={handleRestore}
              disabled={!selectedBackup || restoreBackupLoading}
            >
              {restoreBackupLoading ? t('restoring') : t('restore')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!selectedBackup || deleteBackupLoading}
            >
              {deleteBackupLoading ? t('deleting') : t('delete')}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="rounded-4 mb-4 shadow-sm border border-light-subtle">
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{t('encryption')}</div>
        </div>
        <Card.Body className={styles.cardBody}>
          <Form.Check
            type="switch"
            id="encryption-switch"
            label={t('enableEncryption')}
            checked={encryption}
            onChange={handleEncryptionToggle}
            className="d-flex gap-3"
          />
          <Alert variant="info" className="mt-3">
            {encryption ? t('encryptionEnabled') : t('encryptionDisabled')}
          </Alert>
        </Card.Body>
      </Card>

      <Modal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('scheduleBackup')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('backupType')}</Form.Label>
              <Form.Select
                value={scheduleType}
                onChange={(e) =>
                  setScheduleType(e.target.value as 'one-time' | 'recurring')
                }
              >
                <option value="one-time">{t('oneTimeBackup')}</option>
                <option value="recurring">{t('recurringBackup')}</option>
              </Form.Select>
            </Form.Group>
            {scheduleType === 'recurring' && (
              <Form.Group className="mb-3">
                <Form.Label>{t('frequency')}</Form.Label>
                <Form.Select
                  value={scheduleFrequency}
                  onChange={(e) =>
                    setScheduleFrequency(
                      e.target.value as 'daily' | 'alternate' | 'weekly',
                    )
                  }
                >
                  <option value="daily">{t('daily')}</option>
                  <option value="alternate">{t('alternate')}</option>
                  <option value="weekly">{t('weekly')}</option>
                </Form.Select>
              </Form.Group>
            )}
            {scheduleType === 'one-time' && (
              <Form.Group className="mb-3">
                <Form.Label>{t('date')}</Form.Label>
                <Form.Control
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>{t('time')}</Form.Label>
              <Form.Control
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowScheduleModal(false)}
          >
            {t('close')}
          </Button>
          <Button variant="primary" onClick={handleScheduledBackup}>
            {t('scheduleBackup')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommunitySecuritySettings;
