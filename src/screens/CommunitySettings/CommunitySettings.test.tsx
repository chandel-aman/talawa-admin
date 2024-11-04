import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import CommunitySettings from './CommunitySettings';
import i18n from 'utils/i18nForTest';

// Mock the child components
jest.mock('components/Community/CommunityProfile/CommunityProfile', () => {
  return function MockCommunityProfile() {
    return <div data-testid="community-profile">Community Profile Component</div>;
  };
});

jest.mock('components/Community/CommunitySecuritySettings/CommunitySecuritySettings', () => {
  return function MockCommunitySecuritySettings() {
    return <div data-testid="community-security">Community Security Component</div>;
  };
});

describe('CommunitySettings Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <CommunitySettings />
        </I18nextProvider>
      </BrowserRouter>
    );
  };

  test('should render both setting tabs', () => {
    renderComponent();
    
    expect(screen.getByTestId('profileSettings')).toBeInTheDocument();
    expect(screen.getByTestId('securitySettings')).toBeInTheDocument();
  });

  test('should show profile settings by default', () => {
    renderComponent();
    
    expect(screen.getByTestId('community-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('community-security')).not.toBeInTheDocument();
  });

  // test('should handle setting changes correctly for each tab click', () => {
  //   renderComponent();
    
  //   // Get all setting buttons
  //   const buttons = screen.getAllByRole('button');
  //   const settings = ['profile', 'security'];
    
  //   // Click each button and verify the corresponding content
  //   settings.forEach((setting) => {
  //     const button = screen.getByTestId(`${setting}Settings`);
  //     userEvent.click(button);
      
  //     // Verify correct content is shown
  //     if (setting === 'profile') {
  //       expect(screen.getByTestId('community-profile')).toBeInTheDocument();
  //       expect(screen.queryByTestId('community-security')).not.toBeInTheDocument();
  //     } else {
  //       expect(screen.queryByTestId('community-profile')).not.toBeInTheDocument();
  //       expect(screen.getByTestId('community-security')).toBeInTheDocument();
  //     }
      
  //     // Verify button states
  //     buttons.forEach((btn) => {
  //       if (btn === button) {
  //         expect(btn).toHaveClass('btn-success');
  //       } else {
  //         expect(btn).toHaveClass('btn-none');
  //       }
  //     });
  //   });
  // });

  test('should maintain state after multiple tab switches', () => {
    renderComponent();
    
    // Initial state - profile
    expect(screen.getByTestId('community-profile')).toBeInTheDocument();
    
    // Switch to security
    userEvent.click(screen.getByTestId('securitySettings'));
    expect(screen.getByTestId('community-security')).toBeInTheDocument();
    
    // Switch back to profile
    userEvent.click(screen.getByTestId('profileSettings'));
    expect(screen.getByTestId('community-profile')).toBeInTheDocument();
    
    // Switch to security again
    userEvent.click(screen.getByTestId('securitySettings'));
    expect(screen.getByTestId('community-security')).toBeInTheDocument();
  });

  test('should set document title', () => {
    renderComponent();
    
    expect(document.title).toBe('Community Settings');
  });

  test('should handle rapid tab switching without errors', () => {
    renderComponent();
    
    const profileTab = screen.getByTestId('profileSettings');
    const securityTab = screen.getByTestId('securitySettings');
    
    // Rapidly switch between tabs multiple times
    userEvent.click(securityTab);
    userEvent.click(profileTab);
    userEvent.click(securityTab);
    userEvent.click(profileTab);
    
    // Verify the final state is correct
    expect(screen.getByTestId('community-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('community-security')).not.toBeInTheDocument();
    expect(profileTab).toHaveClass('btn-success');
    expect(securityTab).toHaveClass('btn-none');
  });
});