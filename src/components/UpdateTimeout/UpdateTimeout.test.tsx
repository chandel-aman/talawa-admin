import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { UPDATE_ORGANIZATION_TIMEOUT } from 'GraphQl/Mutations/mutations';
import { GET_ORGANIZATION_TIMEOUT } from 'GraphQl/Queries/Queries';
import { I18nextProvider } from 'react-i18next';
import { StaticMockLink } from 'utils/StaticMockLink';
import i18nForTest from 'utils/i18nForTest';
import UpdateTimeout from './UpdateTimeout';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const MOCKS = [
  {
    request: {
      query: GET_ORGANIZATION_TIMEOUT,
      variables: { organizationId: 'org1' },
    },
    result: {
      data: { getOrganizationTimeout: '30' },
    },
  },
  {
    request: {
      query: UPDATE_ORGANIZATION_TIMEOUT,
      variables: { organizationId: 'org1', timeout: 20 },
    },
    result: {
      data: { updateOrganizationTimeout: true },
    },
  },
];

const MOCKS_NO_TIMEOUT = [
  {
    request: {
      query: GET_ORGANIZATION_TIMEOUT,
      variables: { organizationId: 'org2' },
    },
    result: {
      data: { getOrganizationTimeout: '0' },
    },
  },
];

const MOCKS_ERROR = [
  {
    request: {
      query: UPDATE_ORGANIZATION_TIMEOUT,
      variables: { organizationId: 'org1', timeout: 20 },
    },
    error: new Error('Mock Graphql Updating Organization Timeout Error'),
  },
];

const link = new StaticMockLink(MOCKS, true);
const link1 = new StaticMockLink(MOCKS_ERROR, true);
const link2 = new StaticMockLink(MOCKS_NO_TIMEOUT, true);

async function wait(ms = 500): Promise<void> {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

global.alert = jest.fn();

describe('UpdateTimeout', () => {
  test('renders correctly and responds to user interactions', async () => {
    const { getByRole } = render(
      <MockedProvider link={link} addTypename={false}>
        <I18nextProvider i18n={i18nForTest}>
          <UpdateTimeout orgId="org1" />
        </I18nextProvider>
      </MockedProvider>
    );

    await wait();

    expect(screen.queryAllByText(/Update Timeout/i)[0]).toBeInTheDocument();

    // Simulate changing the timeout value
    fireEvent.change(getByRole('slider'), { target: { value: 20 } });

    // Simulate clicking the "update" button
    fireEvent.click(screen.getAllByText(/Update/i)[2]);

    // Wait for the mutation to finish
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Check if the timeout value was updated
    expect((getByRole('slider') as HTMLInputElement).value).toBe('20');

    // Check if the success toast was shown
    expect(toast.success).toHaveBeenCalled();
  });

  test('Shows an error toast when updating the timeout fails', async () => {
    const { getByRole } = render(
      <MockedProvider link={link1} addTypename={false}>
        <I18nextProvider i18n={i18nForTest}>
          <UpdateTimeout orgId="org1" />
        </I18nextProvider>
      </MockedProvider>
    );

    await wait();

    // Simulate changing the timeout value
    fireEvent.change(getByRole('slider'), { target: { value: 20 } });

    // Simulate clicking the "update" button
    fireEvent.click(screen.getAllByText(/Update/i)[2]);

    // Wait for the mutation to finish
    await wait();

    // Check if the error toast was shown
    expect(toast.error).toHaveBeenCalled();
  });

  test('Shows a default timeout when no timeout is found', async () => {
    render(
      <MockedProvider link={link2} addTypename={false}>
        <I18nextProvider i18n={i18nForTest}>
          <UpdateTimeout orgId="org2" />
        </I18nextProvider>
      </MockedProvider>
    );

    await wait();

    const noTimeoutElement = screen.getByText(
      'No timeout set (default 30 minutes)'
    );
    expect(noTimeoutElement).toBeInTheDocument();
  });

  test('Shows the current timeout when a timeout is set', async () => {
    render(
      <MockedProvider link={link} addTypename={false}>
        <I18nextProvider i18n={i18nForTest}>
          <UpdateTimeout orgId="org1" />
        </I18nextProvider>
      </MockedProvider>
    );

    await wait();

    const timeoutElement = screen.getByText(/30 minutes/i);
    expect(timeoutElement).toBeInTheDocument();
  });
});
