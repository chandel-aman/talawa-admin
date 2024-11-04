import React, { act } from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'jest-localstorage-mock';
import 'jest-location-mock';
import { I18nextProvider } from 'react-i18next';

import { StaticMockLink } from 'utils/StaticMockLink';
import CommunityProfile from './CommunityProfile';
import i18n from 'utils/i18nForTest';
import { GET_COMMUNITY_DATA } from 'GraphQl/Queries/Queries';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RESET_COMMUNITY, UPDATE_COMMUNITY } from 'GraphQl/Mutations/mutations';

const MOCKS1 = [
  {
    request: {
      query: GET_COMMUNITY_DATA,
    },
    result: {
      data: {
        getCommunityData: null,
      },
    },
  },
  {
    request: {
      query: UPDATE_COMMUNITY,
      variables: {
        data: {
          name: 'Name',
          websiteLink: 'https://website.com',
          logo: 'data:image/png;base64,bG9nbw==',
          socialMediaUrls: {
            facebook: 'https://socialurl.com',
            instagram: 'https://socialurl.com',
            X: 'https://socialurl.com',
            linkedIn: 'https://socialurl.com',
            gitHub: 'https://socialurl.com',
            youTube: 'https://socialurl.com',
            reddit: 'https://socialurl.com',
            slack: 'https://socialurl.com',
          },
        },
      },
    },
    result: {
      data: {
        updateCommunity: true,
      },
    },
  },
];

const MOCKS2 = [
  {
    request: {
      query: GET_COMMUNITY_DATA,
    },
    result: {
      data: {
        getCommunityData: {
          _id: null,
          name: null,
          logoUrl: null,
          websiteLink: null,
          socialMediaUrls: {
            facebook: null,
            gitHub: null,
            youTube: null,
            instagram: null,
            linkedIn: null,
            reddit: null,
            slack: null,
            X: null,
          },
        },
      },
    },
  },
  {
    request: {
      query: RESET_COMMUNITY,
      variables: {
        resetPreLoginImageryId: 'communityId',
      },
    },
    result: {
      data: {
        resetCommunity: true,
      },
    },
  },
];

const MOCKS3 = [
  {
    request: {
      query: GET_COMMUNITY_DATA,
    },
    result: {
      data: {
        getCommunityData: {
          _id: 'communityId',
          name: 'testName',
          logoUrl: 'image.png',
          websiteLink: 'http://websitelink.com',
          socialMediaUrls: {
            facebook: 'http://sociallink.com',
            gitHub: 'http://sociallink.com',
            youTube: 'http://sociallink.com',
            instagram: 'http://sociallink.com',
            linkedIn: 'http://sociallink.com',
            reddit: 'http://sociallink.com',
            slack: 'http://sociallink.com',
            X: 'http://sociallink.com',
          },
        },
      },
    },
  },
  {
    request: {
      query: RESET_COMMUNITY,
      variables: {
        resetPreLoginImageryId: 'communityId',
      },
    },
    result: {
      data: {
        resetCommunity: true,
      },
    },
  },
];

const link1 = new StaticMockLink(MOCKS1, true);
const link2 = new StaticMockLink(MOCKS2, true);
const link3 = new StaticMockLink(MOCKS3, true);

const profileVariables = {
  name: 'Name',
  websiteLink: 'https://website.com',
  socialUrl: 'https://socialurl.com',
  logo: new File(['logo'], 'test.png', {
    type: 'image/png',
  }),
};

async function wait(ms = 100): Promise<void> {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('utils/convertToBase64', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock fetch API
global.fetch = jest.fn();

describe('Testing Community Profile File Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should handle image file upload correctly', async () => {
    render(
      <MockedProvider addTypename={false}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <CommunityProfile />
          </I18nextProvider>
        </BrowserRouter>
      </MockedProvider>
    );

    // Create a sample file
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    // Get the file input (you'll need to expose it in the EditableImage component)
    const fileInput = screen.getByTestId('file-input');
    
    // Simulate file upload
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

  });

  test('Should handle successful form submission', async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' })
    });

    render(
      <MockedProvider addTypename={false}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <CommunityProfile />
          </I18nextProvider>
        </BrowserRouter>
      </MockedProvider>
    );

    // Fill in required fields to enable submit button
    const nameInput = screen.getByPlaceholderText(/Community Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Community' } });

    // Submit the form
    const submitButton = screen.getByTestId('saveChangesBtn');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalled();
  });

  test('Should handle failed form submission', async () => {
    // Mock failed fetch response
    const errorMessage = 'Failed to update community profile';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage })
    });

    render(
      <MockedProvider addTypename={false}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <CommunityProfile />
          </I18nextProvider>
        </BrowserRouter>
      </MockedProvider>
    );

    // Fill in required fields to enable submit button
    const nameInput = screen.getByPlaceholderText(/Community Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Community' } });

    // Submit the form
    const submitButton = screen.getByTestId('saveChangesBtn');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});

describe('Testing Community Profile Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Components should render properly', async () => {
    window.location.assign('/communityProfile');

    render(
      <MockedProvider addTypename={false} link={link1}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <CommunityProfile />
          </I18nextProvider>
        </BrowserRouter>
      </MockedProvider>,
    );
    await wait();

    expect(screen.getByPlaceholderText(/Community Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Website Link/i)).toBeInTheDocument();
    expect(screen.getByTestId(/facebook/i)).toBeInTheDocument();
    expect(screen.getByTestId(/instagram/i)).toBeInTheDocument();
    expect(screen.getByTestId(/X/i)).toBeInTheDocument();
    expect(screen.getByTestId(/linkedIn/i)).toBeInTheDocument();
    expect(screen.getByTestId(/github/i)).toBeInTheDocument();
    expect(screen.getByTestId(/youtube/i)).toBeInTheDocument();
    expect(screen.getByTestId(/reddit/i)).toBeInTheDocument();
    expect(screen.getByTestId(/slack/i)).toBeInTheDocument();
    expect(screen.getByTestId('resetChangesBtn')).toBeInTheDocument();
    expect(screen.getByTestId('resetChangesBtn')).toBeDisabled();
    expect(screen.getByTestId('saveChangesBtn')).toBeInTheDocument();
    expect(screen.getByTestId('saveChangesBtn')).toBeDisabled();
  });

  test('Testing all the input fields and update community data feature', async () => {
    window.location.assign('/communityProfile');

    await act(async () => {
      render(
        <MockedProvider addTypename={false} link={link1}>
          <BrowserRouter>
            <I18nextProvider i18n={i18n}>
              <CommunityProfile />
            </I18nextProvider>
          </BrowserRouter>
        </MockedProvider>,
      );
    });
    await wait();

    // Get form elements
    const communityName = screen.getByPlaceholderText(/Community Name/i);
    const websiteLink = screen.getByPlaceholderText(/Website Link/i);
    const facebook = screen.getByTestId(/facebook/i);
    const instagram = screen.getByTestId(/instagram/i);
    const X = screen.getByTestId(/X/i);
    const linkedIn = screen.getByTestId(/linkedIn/i);
    const github = screen.getByTestId(/github/i);
    const youtube = screen.getByTestId(/youtube/i);
    const reddit = screen.getByTestId(/reddit/i);
    const slack = screen.getByTestId(/slack/i);
    const saveChangesBtn = screen.getByTestId(/saveChangesBtn/i);
    const resetChangeBtn = screen.getByTestId(/resetChangesBtn/i);

    // Type in form values
    userEvent.type(communityName, profileVariables.name);
    userEvent.type(websiteLink, profileVariables.websiteLink);
    userEvent.type(facebook, profileVariables.socialUrl);
    userEvent.type(instagram, profileVariables.socialUrl);
    userEvent.type(X, profileVariables.socialUrl);
    userEvent.type(linkedIn, profileVariables.socialUrl);
    userEvent.type(github, profileVariables.socialUrl);
    userEvent.type(youtube, profileVariables.socialUrl);
    userEvent.type(reddit, profileVariables.socialUrl);
    userEvent.type(slack, profileVariables.socialUrl);

    // For the EditableImage component, we can either:
    // Option 1: Mock the handleImageChange function
    // Option 2: Test the EditableImage component separately
    // Option 3: Find the actual image upload button in EditableImage if needed

    await wait();

    // Verify form values
    expect(communityName).toHaveValue(profileVariables.name);
    expect(websiteLink).toHaveValue(profileVariables.websiteLink);
    expect(facebook).toHaveValue(profileVariables.socialUrl);
    expect(instagram).toHaveValue(profileVariables.socialUrl);
    expect(X).toHaveValue(profileVariables.socialUrl);
    expect(linkedIn).toHaveValue(profileVariables.socialUrl);
    expect(github).toHaveValue(profileVariables.socialUrl);
    expect(youtube).toHaveValue(profileVariables.socialUrl);
    expect(reddit).toHaveValue(profileVariables.socialUrl);
    expect(slack).toHaveValue(profileVariables.socialUrl);

    // Verify button states
    expect(saveChangesBtn).not.toBeDisabled();
    expect(resetChangeBtn).not.toBeDisabled();

    await wait();

    // Test form submission
    userEvent.click(saveChangesBtn);
    await wait();
  });

  test('If the queried data has some fields null then the input field should be empty', async () => {
    render(
      <MockedProvider addTypename={false} link={link2}>
        <I18nextProvider i18n={i18n}>
          <CommunityProfile />
        </I18nextProvider>
      </MockedProvider>,
    );
    await wait();

    expect(screen.getByPlaceholderText(/Community Name/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Website Link/i)).toHaveValue('');
    expect(screen.getByTestId(/facebook/i)).toHaveValue('');
    expect(screen.getByTestId(/instagram/i)).toHaveValue('');
    expect(screen.getByTestId(/X/i)).toHaveValue('');
    expect(screen.getByTestId(/linkedIn/i)).toHaveValue('');
    expect(screen.getByTestId(/github/i)).toHaveValue('');
    expect(screen.getByTestId(/youtube/i)).toHaveValue('');
    expect(screen.getByTestId(/reddit/i)).toHaveValue('');
    expect(screen.getByTestId(/slack/i)).toHaveValue('');
  });

  test('Should clear out all the input field when click on Reset Changes button', async () => {
    render(
      <MockedProvider addTypename={false} link={link3}>
        <I18nextProvider i18n={i18n}>
          <CommunityProfile />
        </I18nextProvider>
      </MockedProvider>,
    );
    await wait();

    const resetChangesBtn = screen.getByTestId('resetChangesBtn');
    userEvent.click(resetChangesBtn);
    await wait();

    expect(screen.getByPlaceholderText(/Community Name/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Website Link/i)).toHaveValue('');
    expect(screen.getByTestId(/facebook/i)).toHaveValue('');
    expect(screen.getByTestId(/instagram/i)).toHaveValue('');
    expect(screen.getByTestId(/X/i)).toHaveValue('');
    expect(screen.getByTestId(/linkedIn/i)).toHaveValue('');
    expect(screen.getByTestId(/github/i)).toHaveValue('');
    expect(screen.getByTestId(/youtube/i)).toHaveValue('');
    expect(screen.getByTestId(/reddit/i)).toHaveValue('');
    expect(screen.getByTestId(/slack/i)).toHaveValue('');
    expect(toast.success).toHaveBeenCalled();
  });

  test('Should have empty input fields when queried result is null', async () => {
    render(
      <MockedProvider addTypename={false} link={link1}>
        <I18nextProvider i18n={i18n}>
          <CommunityProfile />
        </I18nextProvider>
      </MockedProvider>,
    );

    expect(screen.getByPlaceholderText(/Community Name/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Website Link/i)).toHaveValue('');
    expect(screen.getByTestId(/facebook/i)).toHaveValue('');
    expect(screen.getByTestId(/instagram/i)).toHaveValue('');
    expect(screen.getByTestId(/X/i)).toHaveValue('');
    expect(screen.getByTestId(/linkedIn/i)).toHaveValue('');
    expect(screen.getByTestId(/github/i)).toHaveValue('');
    expect(screen.getByTestId(/youtube/i)).toHaveValue('');
    expect(screen.getByTestId(/reddit/i)).toHaveValue('');
    expect(screen.getByTestId(/slack/i)).toHaveValue('');
  });
  
});
