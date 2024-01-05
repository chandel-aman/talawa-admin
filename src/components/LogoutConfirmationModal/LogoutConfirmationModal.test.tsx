import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import 'jest-localstorage-mock';
import { I18nextProvider } from 'react-i18next';
import i18nForTest from 'utils/i18nForTest';

import LogoutConfirmationModal from './LogoutConfirmationModal';

describe('LogoutConfirmationModal', () => {
  test('renders correctly and responds to user interactions', () => {
    const onRequestClose = jest.fn();
    const handleConfirmSave = jest.fn();
    const handleCancelSave = jest.fn();

    const { getByText } = render(
      <I18nextProvider i18n={i18nForTest}>
        <LogoutConfirmationModal
          isOpen={true}
          onRequestClose={onRequestClose}
          handleConfirmSave={handleConfirmSave}
          handleCancelSave={handleCancelSave}
        />
      </I18nextProvider>
    );

    // Check if the modal is open
    expect(getByText(/Confirm Logout/i)).toBeInTheDocument();

    // Simulate clicking the "Yes" button
    fireEvent.click(getByText(/Yes/i));
    expect(handleConfirmSave).toHaveBeenCalled();

    // Simulate clicking the "No" button
    fireEvent.click(getByText(/No/i));
    expect(handleCancelSave).toHaveBeenCalled();
  });

  test('logs out when the user clicks "No"', () => {
    const onRequestClose = jest.fn();
    const handleConfirmSave = jest.fn();
    const handleCancelSave = jest.fn(() => {
      localStorage.clear();
    });

    localStorage.setItem('token', 'testValue');
    localStorage.setItem('email', 'testemail');
    localStorage.setItem('timeout', 'testtimeout');

    const { getByText } = render(
      <I18nextProvider i18n={i18nForTest}>
        <LogoutConfirmationModal
          isOpen={true}
          onRequestClose={onRequestClose}
          handleConfirmSave={handleConfirmSave}
          handleCancelSave={handleCancelSave}
        />
      </I18nextProvider>
    );

    // Simulate clicking the "No" button
    fireEvent.click(getByText(/No/i));
    expect(handleCancelSave).toHaveBeenCalled();
    expect(localStorage.clear).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(global.window.location.pathname).toBe('/');
  });

  test('does not render when isOpen is false', () => {
    const onRequestClose = jest.fn();
    const handleConfirmSave = jest.fn();
    const handleCancelSave = jest.fn();

    const { queryByText } = render(
      <I18nextProvider i18n={i18nForTest}>
        <LogoutConfirmationModal
          isOpen={false}
          onRequestClose={onRequestClose}
          handleConfirmSave={handleConfirmSave}
          handleCancelSave={handleCancelSave}
        />
      </I18nextProvider>
    );

    // Check if the modal is not open
    expect(queryByText(/Confirm Logout/i)).not.toBeInTheDocument();
  });
});
