/**
 * React Testing Library verification test
 * This test verifies that React Testing Library is properly configured
 */

import { render, screen } from '@testing-library/react';

// Simple test component
function TestComponent({ message }: { message: string }) {
  return (
    <div>
      <h1>Test Component</h1>
      <p data-testid="message">{message}</p>
    </div>
  );
}

describe('React Testing Library Configuration', () => {
  it('should render React components', () => {
    render(<TestComponent message="Hello, World!" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Component'
    );
  });

  it('should support data-testid queries', () => {
    render(<TestComponent message="Test message" />);

    expect(screen.getByTestId('message')).toHaveTextContent('Test message');
  });

  it('should support jest-dom matchers', () => {
    render(<TestComponent message="Visible content" />);

    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toBeVisible();
    expect(heading).toHaveTextContent('Test Component');
  });
});
