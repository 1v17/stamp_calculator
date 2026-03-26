import '@testing-library/jest-dom/jest-globals';
import { render, screen } from '@testing-library/react';
import { StampChip } from '../StampChip';
import {describe, it, expect} from '@jest/globals';

describe('StampChip', () => {
  describe('"picked" variant', () => {
    it('renders the formatted dollar value', () => {
      render(<StampChip value={43} count={1} variant="picked" />);
      expect(screen.getByText('$0.43')).toBeInTheDocument();
    });

    it('renders the count with x prefix', () => {
      render(<StampChip value={43} count={3} variant="picked" />);
      expect(screen.getByText('x 3')).toBeInTheDocument();
    });

    it('applies the chipPicked CSS class', () => {
      const { container } = render(<StampChip value={43} count={1} variant="picked" />);
      const chip = container.firstChild as HTMLElement;
      // identity-obj-proxy returns the class name as a string
      expect(chip.className).toContain('chipPicked');
    });
  });

  describe('"needed" variant', () => {
    it('renders the formatted dollar value', () => {
      render(<StampChip value={100} count={2} variant="needed" />);
      expect(screen.getByText('$1.00')).toBeInTheDocument();
    });

    it('renders the count with x prefix', () => {
      render(<StampChip value={100} count={2} variant="needed" />);
      expect(screen.getByText('x 2')).toBeInTheDocument();
    });

    it('applies the chipNeeded CSS class', () => {
      const { container } = render(<StampChip value={100} count={1} variant="needed" />);
      const chip = container.firstChild as HTMLElement;
      expect(chip.className).toContain('chipNeeded');
    });

    it('does NOT apply the chipPicked class', () => {
      const { container } = render(<StampChip value={100} count={1} variant="needed" />);
      const chip = container.firstChild as HTMLElement;
      expect(chip.className).not.toContain('chipPicked');
    });
  });

  describe('value formatting', () => {
    it('formats large cent values correctly', () => {
      render(<StampChip value={599} count={1} variant="needed" />);
      expect(screen.getByText('$5.99')).toBeInTheDocument();
    });

    it('formats single-cent value', () => {
      render(<StampChip value={1} count={1} variant="picked" />);
      expect(screen.getByText('$0.01')).toBeInTheDocument();
    });
  });
});
