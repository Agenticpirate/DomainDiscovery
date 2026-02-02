import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator';

// Feature: ui-ux-enhancement, Property 24: Component Variant Support
// Validates: Requirements 11.3, 11.4

describe('Property 24: Component Variant Support', () => {
  describe('Button component', () => {
    it('should accept and render all variant props correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'primary',
            'secondary',
            'tertiary',
            'success',
            'error',
            'outline',
            'ghost'
          ),
          fc.constantFrom('sm', 'md', 'lg'),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (variant, size, text) => {
            const { container } = render(
              <Button variant={variant as any} size={size as any}>
                {text}
              </Button>
            );

            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
            // Check that button contains the text (trimmed comparison)
            expect(button?.textContent?.trim()).toBe(text.trim());

            // Verify button has appropriate classes based on variant
            const buttonClasses = button?.className || '';
            expect(buttonClasses).toBeTruthy();

            // Verify size classes are applied
            if (size === 'sm') {
              expect(buttonClasses).toContain('px-3');
            } else if (size === 'md') {
              expect(buttonClasses).toContain('px-6');
            } else if (size === 'lg') {
              expect(buttonClasses).toContain('px-8');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle loading state correctly', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.string({ minLength: 1, maxLength: 20 }),
          (isLoading, text) => {
            const { container } = render(
              <Button isLoading={isLoading}>{text}</Button>
            );

            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();

            if (isLoading) {
              // Should have spinner SVG
              const spinner = container.querySelector('svg.animate-spin');
              expect(spinner).toBeInTheDocument();
              expect(button).toBeDisabled();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle disabled state correctly', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.string({ minLength: 1, maxLength: 20 }),
          (disabled, text) => {
            const { container } = render(
              <Button disabled={disabled}>{text}</Button>
            );

            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();

            if (disabled) {
              expect(button).toBeDisabled();
              expect(button?.className).toContain('opacity-50');
            } else {
              expect(button).not.toBeDisabled();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Input component', () => {
    it('should render with different validation states', () => {
      fc.assert(
        fc.property(
          fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { nil: undefined }),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { nil: undefined }),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (error, success, placeholder) => {
            const { container } = render(
              <Input error={error} success={success} placeholder={placeholder} />
            );

            const input = container.querySelector('input');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('placeholder', placeholder);

            // Check for error state
            if (error) {
              const errorText = container.querySelector('[role="alert"]');
              expect(errorText).toBeInTheDocument();
              expect(errorText?.textContent?.trim()).toBe(error.trim());
              expect(input?.className).toContain('border-red-500');
            }

            // Check for success state (only if no error)
            if (success && !error) {
              const successText = container.querySelector('.text-emerald-400');
              expect(successText).toBeInTheDocument();
              expect(successText?.textContent?.trim()).toBe(success.trim());
              expect(input?.className).toContain('border-emerald-500');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should associate label with input correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (label, placeholder) => {
            const { container } = render(
              <Input label={label} placeholder={placeholder} />
            );

            const labelElement = container.querySelector('label');
            const input = container.querySelector('input');

            expect(labelElement).toBeInTheDocument();
            expect(labelElement?.textContent?.trim()).toBe(label.trim());
            expect(input).toBeInTheDocument();

            // Verify label is associated with input
            const inputId = input?.getAttribute('id');
            const labelFor = labelElement?.getAttribute('for');
            expect(inputId).toBeTruthy();
            expect(labelFor).toBe(inputId);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Badge component', () => {
    it('should render with all variant types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'default',
            'success',
            'error',
            'warning',
            'info',
            'neutral'
          ),
          fc.constantFrom('sm', 'md', 'lg'),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (variant, size, text) => {
            const { container } = render(
              <Badge variant={variant as any} size={size as any}>
                {text}
              </Badge>
            );

            const badge = container.querySelector('span');
            expect(badge).toBeInTheDocument();
            expect(badge?.textContent?.trim()).toBe(text.trim());

            // Verify badge has appropriate classes
            const badgeClasses = badge?.className || '';
            expect(badgeClasses).toContain('inline-flex');
            expect(badgeClasses).toContain('rounded-full');

            // Verify size classes
            if (size === 'sm') {
              expect(badgeClasses).toContain('text-[10px]');
            } else if (size === 'md') {
              expect(badgeClasses).toContain('text-xs');
            } else if (size === 'lg') {
              expect(badgeClasses).toContain('text-sm');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('AvailabilityIndicator component', () => {
    it('should render correct icon for each status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('available', 'unavailable', 'loading', 'unknown'),
          fc.constantFrom('sm', 'md', 'lg'),
          (status, size) => {
            const { container } = render(
              <AvailabilityIndicator
                status={status as any}
                size={size as any}
              />
            );

            const statusElement = container.querySelector('[role="status"]');
            expect(statusElement).toBeInTheDocument();

            // Verify correct icon is rendered based on status
            const expectedIcon = {
              available: 'checkmark',
              unavailable: 'x-mark',
              loading: 'spinner',
              unknown: 'question',
            }[status];

            const icon = container.querySelector(`[data-icon="${expectedIcon}"]`);
            expect(icon).toBeInTheDocument();

            // Verify aria-label is present
            expect(statusElement).toHaveAttribute('aria-label');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show label when showLabel is true', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('available', 'unavailable', 'loading', 'unknown'),
          fc.boolean(),
          (status, showLabel) => {
            const { container } = render(
              <AvailabilityIndicator
                status={status as any}
                showLabel={showLabel}
              />
            );

            const statusElement = container.querySelector('[role="status"]');
            expect(statusElement).toBeInTheDocument();

            const labelText = {
              available: 'Available',
              unavailable: 'Taken',
              loading: 'Checking...',
              unknown: 'Unknown',
            }[status];

            if (showLabel) {
              expect(statusElement).toHaveTextContent(labelText);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
