import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import Avatar from './Avatar';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18nForTest from 'utils/i18nForTest';
import styles from './Avatar.module.css';

interface InterfaceAvatarProps {
  name: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  avatarStyle?: string;
  dataTestId?: string;
  shape?: 'circle' | 'square' | 'rounded';
}

describe('Avatar component', () => {
  const renderAvatar = (props: InterfaceAvatarProps): RenderResult => {
    return render(
      <BrowserRouter>
        <I18nextProvider i18n={i18nForTest}>
          <Avatar {...props} />
        </I18nextProvider>
      </BrowserRouter>,
    );
  };

  test('renders with name and alt attribute', (): void => {
    const testName = 'John Doe';
    const testAlt = 'Test Alt Text';
    const testSize = 'md';

    const { getByAltText } = renderAvatar({
      name: testName,
      alt: testAlt,
      size: testSize,
    });
    const avatarElement = getByAltText(testAlt);

    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement.getAttribute('src')).toBeDefined();
    expect(avatarElement.classList.contains(styles.avatarMedium)).toBe(false);
  });

  test('renders with custom style and data-testid', (): void => {
    const testName = 'Jane Doe';
    const testStyle = 'custom-avatar-style';
    const testDataTestId = 'custom-avatar-test-id';

    const { getByTestId } = renderAvatar({
      name: testName,
      avatarStyle: testStyle,
      dataTestId: testDataTestId,
    });
    const avatarElement = getByTestId(testDataTestId);

    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement.getAttribute('src')).toBeDefined();
    expect(avatarElement.classList.contains(testStyle)).toBe(true);
  });

  test.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    'renders with size %s',
    (size): void => {
      const testName = 'Size Test';
      const { getByAltText } = renderAvatar({ name: testName, size });
      const avatarElement = getByAltText('Dummy Avatar');

      expect(avatarElement).toBeInTheDocument();
      expect(
        avatarElement.classList.contains(
          styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`],
        ),
      ).toBe(true);
    },
  );

  test('renders with circle shape', (): void => {
    const testName = 'Circle Shape Test';
    const { getByAltText } = renderAvatar({ name: testName, shape: 'circle' });
    const avatarElement = getByAltText('Dummy Avatar');

    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement.classList.contains(styles.avatarSquare)).toBe(false);
    expect(avatarElement.classList.contains(styles.avatarRounded)).toBe(false);
  });

  test('renders with square shape', (): void => {
    const testName = 'Square Shape Test';
    const { getByAltText } = renderAvatar({ name: testName, shape: 'square' });
    const avatarElement = getByAltText('Dummy Avatar');

    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement.classList.contains(styles.avatarSquare)).toBe(true);
    expect(avatarElement.classList.contains(styles.avatarRounded)).toBe(false);
  });

  test('renders with rounded shape', (): void => {
    const testName = 'Rounded Shape Test';
    const { getByAltText } = renderAvatar({ name: testName, shape: 'rounded' });
    const avatarElement = getByAltText('Dummy Avatar');

    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement.classList.contains(styles.avatarSquare)).toBe(false);
    expect(avatarElement.classList.contains(styles.avatarRounded)).toBe(true);
  });

  test('renders with default props', (): void => {
    const testName = 'Default Test';

    const { getByAltText } = renderAvatar({ name: testName });
    const avatarElement = getByAltText('Dummy Avatar');

    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement.classList.contains(styles.avatarMedium)).toBe(false);
    expect(avatarElement.classList.contains(styles.avatarSquare)).toBe(false);
    expect(avatarElement.classList.contains(styles.avatarRounded)).toBe(false);
  });
});
