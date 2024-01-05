import React, { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { GET_ORGANIZATION_TIMEOUT } from 'GraphQl/Queries/Queries';
import { UPDATE_ORGANIZATION_TIMEOUT } from 'GraphQl/Mutations/mutations';
import { errorHandler } from 'utils/errorHandler';

import styles from './UpdateTimeout.module.css';

interface InterfaceUpdateTimeoutProps {
  orgId: string;
}

const UpdateTimeout = (props: InterfaceUpdateTimeoutProps): JSX.Element => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'updateTimeout',
  });
  const [timeoutValue, setTimeoutValue] = useState<number>(15);
  const [currentTimeout, setCurrentTimeout] = useState<number>(30);

  const [tooltipPosition, setTooltipPosition] = useState(0);

  const { orgId } = props;

  const { data } = useQuery(GET_ORGANIZATION_TIMEOUT, {
    variables: { organizationId: orgId },
  });

  const [updateOrganizationTimeout] = useMutation(UPDATE_ORGANIZATION_TIMEOUT);

  useEffect(() => {
    if (data) {
      const timeoutMinutes = parseInt(data?.getOrganizationTimeout, 10);
      const roundedTimeout = Math.round(timeoutMinutes / 5) * 5;
      setCurrentTimeout(roundedTimeout);
      setTimeoutValue(roundedTimeout);
    }
  }, [data, orgId]);

  useEffect(() => {
    const newPosition = ((timeoutValue - 15) / 45) * 100;
    setTooltipPosition(newPosition);
  }, [timeoutValue]);

  const handleTimeoutChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(event.target.value, 10);
    setTimeoutValue(value);
  };

  const handleUpdateTimeout = async (): Promise<void> => {
    try {
      const timeoutUpdated = await updateOrganizationTimeout({
        variables: {
          organizationId: orgId,
          timeout: timeoutValue,
        },
      });
      if (timeoutUpdated) {
        setCurrentTimeout(timeoutValue);
        toast.success(t('successfullyUpdated'));
      }
    } catch (error) {
      toast.error(errorHandler(t, error));
    }
  };

  return (
    <Card border="0" className="rounded-4 mb-4">
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{t('updateTimeout')}</div>
      </div>
      <Card.Body className={styles.cardBody}>
        <Form.Label className={'text-secondary fw-bold d-block'}>
          {t('currentTimeout')}:&nbsp;
          {currentTimeout !== 0 ? (
            <span className={styles.currentTimeout}>
              {currentTimeout}&nbsp;{t('minutes')}
            </span>
          ) : (
            <span className={styles.currentTimeout}>{t('noTimeoutSet')}</span>
          )}
        </Form.Label>

        <Form.Label className={'text-secondary fw-bold'}>
          {t('updateTimeout')}
        </Form.Label>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            value={timeoutValue}
            min={15}
            max={60}
            step={5}
            onChange={handleTimeoutChange}
            className={styles.rangeSlider}
          />
          <div
            className={styles.tooltip}
            style={{ left: `calc(${tooltipPosition}% - 5px)` }}
          >
            {timeoutValue}
          </div>
        </div>
        <div className={styles.sliderLabels}>
          <span className={styles.label}>{t('15min')}</span>
          <span className={styles.label}>{t('30min')}</span>
          <span className={styles.label}>{t('45min')}</span>
          <span className={styles.label}>{t('60min')}</span>
        </div>

        <Button variant="primary" onClick={handleUpdateTimeout}>
          {t('update')}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default UpdateTimeout;
