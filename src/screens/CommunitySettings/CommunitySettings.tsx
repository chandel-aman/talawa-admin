import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Row } from 'react-bootstrap';
import CommunityProfile from 'components/Community/CommunityProfile/CommunityProfile';
import CommunitySecuritySettings from 'components/Community/CommunitySecuritySettings/CommunitySecuritySettings';
import styles from './CommunitySettings.module.css';

type SettingType = 'profile' | 'security';

const CommunitySettings = (): JSX.Element => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'communitySettings',
  });
  const { t: tCommon } = useTranslation('common');

  const communitySettings: SettingType[] = ['profile', 'security'];

  const [communitySetting, setCommunitySetting] =
    useState<SettingType>('profile');

  document.title = t('title');

  return (
    <>
      <div
        className={`${styles.settingsContainer} mt-4 bg-white rounded-4 mb-3`}
      >
        <Row className="mx-3 mt-4">
          <Col>
            <div className={styles.settingsTabs}>
              {communitySettings.map((setting, index) => (
                <Button
                  key={index}
                  className="me-3 border rounded-3"
                  variant={communitySetting === setting ? `success` : `none`}
                  onClick={() => setCommunitySetting(setting)}
                  data-testid={`${setting}Settings`}
                >
                  {t(setting)}
                </Button>
              ))}
            </div>
          </Col>
          <Row className="mt-3">
            <hr />
          </Row>
        </Row>

        {communitySetting == 'profile' && (
          <Row className={`${styles.settingsBody} mt-3`}>
            <Col>
              <CommunityProfile />
            </Col>
          </Row>
        )}
        {communitySetting == 'security' && (
          <Row className={`${styles.settingsBody} mt-3`}>
            <Col>
              <CommunitySecuritySettings />
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default CommunitySettings;
