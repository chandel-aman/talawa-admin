import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';
import { MockedProvider } from '@apollo/react-testing';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18nForTest from 'utils/i18nForTest';
import { toast } from 'react-toastify';
import { errorHandler } from 'utils/errorHandler';

// Mock the dependencies
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('utils/errorHandler', () => ({
  errorHandler: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('UserProfile Component', () => {
  const mockOnImageUpdate = jest.fn();
  const defaultProps = {
    firstName: 'Christopher',
    lastName: 'Doe',
    createdAt: '2023-04-13T04:53:17.742+00:00',
    email: 'john.doe@example.com',
    image: 'profile-image-url',
    onImageUpdate: mockOnImageUpdate,
  };

  const renderComponent = (props = {}) => {
    return render(
      <MockedProvider addTypename={false}>
        <BrowserRouter>
          <I18nextProvider i18n={i18nForTest}>
            <UserProfile {...defaultProps} {...props} />
          </I18nextProvider>
        </BrowserRouter>
      </MockedProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
  });

  describe('Rendering', () => {
    test('renders user profile details correctly', () => {
      renderComponent();

      expect(screen.getByText('Christopher Doe')).toBeInTheDocument();
      expect(screen.getByTestId('userEmail')).toHaveTextContent('john.doe@example.com');
      expect(screen.getByAltText('Christopher Doe')).toHaveAttribute('src', 'profile-image-url');
      expect(screen.getByText(/Joined 13 April 2023/)).toBeInTheDocument();
      expect(screen.getByText('Profile Details')).toBeInTheDocument();
    });

    test('handles invalid date correctly', () => {
      renderComponent({ createdAt: 'invalid-date' });
      expect(screen.getByText(/Joined Unavailable/)).toBeInTheDocument();
    });

    test('renders without image correctly', () => {
      renderComponent({ image: '' });
      const profileImage = screen.getByAltText('Christopher Doe');
      expect(profileImage).toBeInTheDocument();
    });
  });

  describe('Image Update Functionality', () => {
    test('handles successful image upload', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      );

      renderComponent();

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const editableImage = screen.getByAltText('Christopher Doe').closest('div');
      
      // Simulate file upload
      if (editableImage) {
        const input = document.createElement('input');
        input.type = 'file';
        const event = { target: { files: [file] } };
        await fireEvent.change(input, event);
      }

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/user/update-profile-picture'),
          expect.objectContaining({
            method: 'POST',
            headers: { Authorization: 'Bearer mock-token' },
          })
        );
        expect(toast.success).toHaveBeenCalled();
        expect(mockOnImageUpdate).toHaveBeenCalled();
      });
    });

    test('handles failed image upload', async () => {
      const errorMessage = 'Failed to update profile';
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: errorMessage }),
        } as Response)
      );

      renderComponent();

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const editableImage = screen.getByAltText('Christopher Doe').closest('div');
      
      if (editableImage) {
        const input = document.createElement('input');
        input.type = 'file';
        const event = { target: { files: [file] } };
        await fireEvent.change(input, event);
      }

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalled();
      });
    });

    test('handles network error during image upload', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      renderComponent();

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const editableImage = screen.getByAltText('Christopher Doe').closest('div');
      
      if (editableImage) {
        const input = document.createElement('input');
        input.type = 'file';
        const event = { target: { files: [file] } };
        await fireEvent.change(input, event);
      }

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalled();
      });
    });
  });

  describe('Image Delete Functionality', () => {
    test('handles successful image deletion', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      );

      renderComponent();

      // Trigger delete functionality through EditableImage
      const deleteButton = screen.getByLabelText('Delete profile picture');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/user/update-profile-picture'),
          expect.objectContaining({
            method: 'DELETE',
            headers: { Authorization: 'Bearer mock-token' },
          })
        );
        expect(toast.success).toHaveBeenCalled();
        expect(mockOnImageUpdate).toHaveBeenCalled();
      });
    });

    test('handles failed image deletion', async () => {
      const errorMessage = 'Failed to delete profile picture';
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: errorMessage }),
        } as Response)
      );

      renderComponent();

      const deleteButton = screen.getByLabelText('Delete profile picture');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalled();
      });
    });

    test('handles network error during image deletion', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      renderComponent();

      const deleteButton = screen.getByLabelText('Delete profile picture');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalled();
      });
    });
  });

  describe('Date Formatting', () => {
    test('formats different date patterns correctly', () => {
      const dates = [
        { input: '2024-01-01T00:00:00.000Z', expected: '1 January 2024' },
        { input: '2023-12-31T23:59:59.999Z', expected: '31 December 2023' },
        { input: new Date().toISOString(), expected: expect.any(String) },
      ];

      dates.forEach(({ input, expected }) => {
        renderComponent({ createdAt: input });
        expect(screen.getByText(new RegExp(`Joined ${expected}`))).toBeInTheDocument();
      });
    });
  });
});