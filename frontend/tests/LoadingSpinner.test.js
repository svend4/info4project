/**
 * LoadingSpinner Component Tests
 * Tests loading indicator display and accessibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../src/components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('should render with default message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should render with custom message', () => {
    render(<LoadingSpinner message="Fetching tasks..." />);

    expect(screen.getByText('Fetching tasks...')).toBeInTheDocument();
  });

  test('should have proper accessibility attributes', () => {
    render(<LoadingSpinner message="Please wait..." />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('should render spinner element', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  test('should have loading-spinner-container class', () => {
    const { container } = render(<LoadingSpinner />);

    const container_element = container.querySelector('.loading-spinner-container');
    expect(container_element).toBeInTheDocument();
  });

  test('should render loading message with correct class', () => {
    const { container } = render(<LoadingSpinner message="Processing..." />);

    const message = container.querySelector('.loading-message');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('Processing...');
  });
});
