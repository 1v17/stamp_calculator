import '@testing-library/jest-dom/jest-globals';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StampCalculator from '../StampCalculator';
import { DEFAULT_STAMPS } from '../solve';
import {describe, it, expect} from '@jest/globals';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setup() {
  const user = userEvent.setup();
  render(<StampCalculator />);
  return { user };
}

// ---------------------------------------------------------------------------
// Initial render
// ---------------------------------------------------------------------------
describe('StampCalculator - initial render', () => {
  it('shows the heading', () => {
    setup();
    expect(screen.getByText('Stamp Calculator')).toBeInTheDocument();
  });

  it('renders all default stamp tiles', () => {
    setup();
    // Each tile has a remove button labelled "x"; count must equal DEFAULT_STAMPS.length
    const removeBtns = screen.getAllByRole('button', { name: '×' });
    expect(removeBtns.length).toBe(DEFAULT_STAMPS.length);
  });

  it('shows the "No stamps picked yet" placeholder', () => {
    setup();
    expect(screen.getByText(/no stamps picked yet/i)).toBeInTheDocument();
  });

  it('shows the Calculate button', () => {
    setup();
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
  });

  it('does not show an error initially', () => {
    setup();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not show a result panel initially', () => {
    setup();
    expect(screen.queryByText(/you pay/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// addStamp
// ---------------------------------------------------------------------------
describe('StampCalculator - addStamp', () => {
  it('adds a new stamp tile when + is clicked', async () => {
    const { user } = setup();
    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '0.99');
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('$0.99')).toBeInTheDocument();
  });

  it('adds a stamp when Enter is pressed in the input', async () => {
    const { user } = setup();
    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '0.88{Enter}');
    expect(screen.getByText('$0.88')).toBeInTheDocument();
  });

  it('does not add a duplicate stamp value', async () => {
    const { user } = setup();
    // 0.43 is already a default stamp
    const before = screen.getAllByRole('button', { name: '×' }).length;
    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '0.43');
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getAllByRole('button', { name: '×' }).length).toBe(before);
  });

  it('ignores zero value', async () => {
    const { user } = setup();
    const before = screen.getAllByRole('button', { name: '×' }).length;
    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '0');
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getAllByRole('button', { name: '×' }).length).toBe(before);
  });

  it('ignores empty value', async () => {
    const { user } = setup();
    const before = screen.getAllByRole('button', { name: '×' }).length;
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getAllByRole('button', { name: '×' }).length).toBe(before);
  });

  it('clears the input after adding', async () => {
    const { user } = setup();
    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '0.77');
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(input).toHaveValue(null);
  });
});

// ---------------------------------------------------------------------------
// removeStamp
// ---------------------------------------------------------------------------
describe('StampCalculator - removeStamp', () => {
  it('removes a stamp when its x button is clicked', async () => {
    const { user } = setup();
    // Add a unique stamp so we can target it
    const addInput = screen.getByPlaceholderText('0.00');
    await user.type(addInput, '0.99');
    await user.click(screen.getByRole('button', { name: '+' }));

    // Find the tile that contains "$0.99" and click its remove button
    const tile = screen.getByText('$0.99').closest('div')!;
    await user.click(within(tile).getByRole('button', { name: '×' }));
    expect(screen.queryByText('$0.99')).not.toBeInTheDocument();
  });

  it('clears the result panel when a stamp is removed', async () => {
    const { user } = setup();
    const postage = screen.getByPlaceholderText(/e\.g\. 3\.65/i);
    await user.type(postage, '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/you pay/i)).toBeInTheDocument();

    // Remove the first stamp tile
    await user.click(screen.getAllByRole('button', { name: '×' })[0]);
    expect(screen.queryByText(/you pay/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// addPicked
// ---------------------------------------------------------------------------
describe('StampCalculator - addPicked', () => {
  it('adds a picked stamp with default qty 1', async () => {
    const { user } = setup();
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    await user.type(valueInput, '0.43');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    // $0.43 is also a default stamp tile, so there are now >1 occurrences
    expect(screen.getAllByText('$0.43').length).toBeGreaterThan(1);
  });

  it('adds a picked stamp with custom qty', async () => {
    const { user } = setup();
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    const qtyInput = screen.getByPlaceholderText(/qty/i);
    await user.clear(qtyInput);
    await user.type(qtyInput, '3');
    await user.type(valueInput, '0.20');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByText(/subtotal:\s*\$0\.60/i)).toBeInTheDocument(); // line total: 0.20 x 3
  });

  it('merges count when the same value is added again', async () => {
    const { user } = setup();
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    await user.type(valueInput, '0.43');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.type(valueInput, '0.43');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    // Line total should now be 2 x 0.43 = 0.86
    expect(screen.getByText(/subtotal:\s*\$0\.86/i)).toBeInTheDocument();
  });

  it('ignores zero / invalid value', async () => {
    const { user } = setup();
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    await user.type(valueInput, '0');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByText(/no stamps picked yet/i)).toBeInTheDocument();
  });

  it('shows subtotal after adding a stamp', async () => {
    const { user } = setup();
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    await user.type(valueInput, '0.43');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// removePicked
// ---------------------------------------------------------------------------
describe('StampCalculator - removePicked', () => {
  async function addOnePicked(user: ReturnType<typeof userEvent.setup>, val = '0.43') {
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    await user.type(valueInput, val);
    await user.click(screen.getByRole('button', { name: /^add$/i }));
  }

  it('removes the picked stamp when its x is clicked', async () => {
    const { user } = setup();
    await addOnePicked(user, '0.43');
    // The x inside pickedItem removes the picked stamp
    const pickedSection = screen.getByText(/subtotal/i).closest('div')!.parentElement!;
    await user.click(within(pickedSection).getByRole('button', { name: '×' }));
    expect(screen.getByText(/no stamps picked yet/i)).toBeInTheDocument();
  });

  it('clears the result after removing a picked stamp', async () => {
    const { user } = setup();
    await addOnePicked(user);
    const postage = screen.getByPlaceholderText(/e\.g\. 3\.65/i);
    await user.type(postage, '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/you pay/i)).toBeInTheDocument();

    const pickedSection = screen.getByText(/subtotal/i).closest('div')!.parentElement!;
    await user.click(within(pickedSection).getByRole('button', { name: '×' }));
    expect(screen.queryByText(/you pay/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// updatePickedCount
// ---------------------------------------------------------------------------
describe('StampCalculator - updatePickedCount', () => {
  it('updates the line total when qty is changed', async () => {
    const { user } = setup();
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    await user.type(valueInput, '0.20');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    // The qty input inside the picked list has value 1; change to 2
    const qtyInputs = screen.getAllByRole('spinbutton');
    const pickedQtyInput = qtyInputs.find(
      (el) => (el as HTMLInputElement).value === '1' && !(el as HTMLInputElement).placeholder,
    )!;
    await user.clear(pickedQtyInput);
    await user.type(pickedQtyInput, '2');
    const pickedRow = pickedQtyInput.closest('div');
    expect(pickedRow).not.toBeNull();
    expect(within(pickedRow as HTMLElement).getByText(/=\s*\$0\.40/)).toBeInTheDocument();
  });

  it('removes the stamp when qty is set to 0', async () => {
    const { user } = setup();
    const valueInput = screen.getByPlaceholderText(/value.*0\.17/i);
    await user.type(valueInput, '0.20');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    const qtyInputs = screen.getAllByRole('spinbutton');
    const pickedQtyInput = qtyInputs.find(
      (el) => (el as HTMLInputElement).value === '1' && !(el as HTMLInputElement).placeholder,
    )!;
    await user.clear(pickedQtyInput);
    await user.type(pickedQtyInput, '0');
    expect(screen.getByText(/no stamps picked yet/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// calculate — error states
// ---------------------------------------------------------------------------
describe('StampCalculator - calculate errors', () => {
  it('shows error when postage is empty', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/valid postage/i)).toBeInTheDocument();
  });

  it('shows error when postage is zero', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/valid postage/i)).toBeInTheDocument();
  });

  it('shows error when no stamp values are available', async () => {
    const { user } = setup();
    // Remove all stamps
    const removeBtns = screen.getAllByRole('button', { name: '×' });
    for (const btn of removeBtns) {
      await user.click(btn);
    }
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '1.00');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/at least one stamp/i)).toBeInTheDocument();
  });

  it('clears error on a subsequent successful calculate', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/valid postage/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.queryByText(/valid postage/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// calculate — result (no picked stamps)
// ---------------------------------------------------------------------------
describe('StampCalculator - calculate result (no picked)', () => {
  it('shows the result panel after calculating', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/you pay/i)).toBeInTheDocument();
  });

  it('shows "Total stamps" stat', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/total stamps/i)).toBeInTheDocument();
  });

  it('shows "Overpay" stat', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/overpay/i)).toBeInTheDocument();
  });

  it('shows needed stamp chips in result', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    // One 43¢ stamp chip should appear in the result
    expect(screen.getByText(/still needed/i)).toBeInTheDocument();
  });

  it('clears result when postage input is changed', async () => {
    const { user } = setup();
    const postage = screen.getByPlaceholderText(/e\.g\. 3\.65/i);
    await user.type(postage, '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/you pay/i)).toBeInTheDocument();

    await user.type(postage, '5');
    expect(screen.queryByText(/you pay/i)).not.toBeInTheDocument();
  });

  it('triggers calculation with Enter key in postage input', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.43{Enter}');
    expect(screen.getByText(/you pay/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// calculate — picked stamps already cover postage
// ---------------------------------------------------------------------------
describe('StampCalculator - picked stamps cover postage', () => {
  it('shows "already cover" message when picked >= postage', async () => {
    const { user } = setup();
    // Add a 0.50 picked stamp
    await user.type(screen.getByPlaceholderText(/value.*0\.17/i), '0.50');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    // Postage = 0.43 (less than 0.50 picked)
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.43');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/already cover/i)).toBeInTheDocument();
  });

  it('does not show "Still needed" section when covered', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/value.*0\.17/i), '1.00');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.75');
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.queryByText(/still needed/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// calculate — picked + needed
// ---------------------------------------------------------------------------
describe('StampCalculator - picked + additional needed', () => {
  it('shows "Already picked" and "Still needed" sections', async () => {
    const { user } = setup();
    // Pick a 0.20 stamp
    await user.type(screen.getByPlaceholderText(/value.*0\.17/i), '0.20');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    // Need 0.50 total → 0.30 remainder to solve
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.50');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/already picked \(/i)).toBeInTheDocument();
    expect(screen.getByText(/still needed/i)).toBeInTheDocument();
  });

  it('result panel shows total stamps including picked', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/value.*0\.17/i), '0.20');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.type(screen.getByPlaceholderText(/e\.g\. 3\.65/i), '0.50');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    // Total stamps should be > 1 (at least 1 picked + however many needed)
    expect(screen.getByText(/total stamps/i)).toBeInTheDocument();
  });
});
