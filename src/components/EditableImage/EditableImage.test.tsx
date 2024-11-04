import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableImage from './EditableImage';
import { act } from 'react-dom/test-utils';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the Material UI icon
jest.mock('@mui/icons-material/EditRounded', () => ({
  __esModule: true,
  default: () => <div data-testid="edit-icon">Edit Icon</div>,
}));

// Mock the Avatar component
jest.mock('components/Avatar/Avatar', () => ({
  __esModule: true,
  default: ({
    name,
    alt,
    size,
    shape,
  }: {
    name: string;
    alt: string;
    size: string;
    shape: string;
  }) => (
    <div
      data-testid="avatar"
      data-name={name}
      data-size={size}
      data-shape={shape}
    >
      {name}
    </div>
  ),
}));

describe('EditableImage Component', () => {
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();
  const defaultProps = {
    src: 'test-image.jpg',
    alt: 'Test Image',
    onSave: mockOnSave,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create a file
  const createTestFile = () => {
    return new File(['test'], 'test.png', { type: 'image/png' });
  };

  it('renders with image source correctly', () => {
    render(<EditableImage {...defaultProps} />);
    const img = screen.getByAltText('Test Image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test-image.jpg');
  });

  it('renders with Avatar when no source but name is provided', () => {
    render(
      <EditableImage
        {...defaultProps}
        src={null}
        name="John Doe"
        size="md"
        shape="circle"
      />,
    );
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-name', 'John Doe');
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveAttribute('data-shape', 'circle');
  });

  it('shows edit overlay on hover', async () => {
    render(<EditableImage {...defaultProps} />);
    const container = screen.getByAltText('Test Image').parentElement;
    expect(container).toBeTruthy();

    if (container) {
      fireEvent.mouseEnter(container);
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();

      fireEvent.mouseLeave(container);
      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
    }
  });

  it('opens modal on click', () => {
    render(<EditableImage {...defaultProps} />);
    const container = screen.getByAltText('Test Image').parentElement;
    expect(container).toBeTruthy();

    if (container) {
      fireEvent.click(container);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    }
  });

  it('handles save action correctly', async () => {
    render(<EditableImage {...defaultProps} />);
    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.click(container);
    }

    const file = createTestFile();
    const editButton = screen.getByText('edit');
    fireEvent.click(editButton);

    const input = document.querySelector('input[type="file"]');
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      const saveButton = screen.getByText('save');
      fireEvent.click(saveButton);
    });

    expect(mockOnSave).toHaveBeenCalledWith(expect.any(File));
  });

  it('handles delete action correctly', async () => {
    render(<EditableImage {...defaultProps} />);
    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.click(container);
    }

    const deleteButton = screen.getByText('delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  it('handles cancel action correctly', async () => {
    render(<EditableImage {...defaultProps} />);
    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.click(container);
    }

    const file = createTestFile();
    const editButton = screen.getByText('edit');
    fireEvent.click(editButton);

    const input = document.querySelector('input[type="file"]');
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      const cancelButton = screen.getByText('cancel');
      fireEvent.click(cancelButton);
    });

    expect(screen.getByAltText('Test Image')).toHaveAttribute(
      'src',
      'test-image.jpg',
    );
  });

  it('renders with custom size configuration', () => {
    const sizeConfig = {
      width: '200px',
      height: '200px',
    };
    render(<EditableImage {...defaultProps} sizeConfig={sizeConfig} />);
    const img = screen.getByAltText('Test Image');
    expect(img).toHaveStyle({ width: '200px', height: '200px' });
  });

  it('shows continue button instead of save when showContinue is true', async () => {
    render(<EditableImage {...defaultProps} showContinue={true} />);
    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.click(container);
    }

    const file = createTestFile();
    const editButton = screen.getByText('edit');
    fireEvent.click(editButton);

    const input = document.querySelector('input[type="file"]');
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      expect(screen.getByText('continue')).toBeInTheDocument();
      expect(screen.queryByText('save')).not.toBeInTheDocument();
    });
  });

  it('handles close action correctly', () => {
    render(<EditableImage {...defaultProps} />);
    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.click(container);
    }

    const closeButton = screen.getByText('close');
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
