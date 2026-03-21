import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsDialog } from './settings-dialog';

// Mock Evolu store
vi.mock('@/store/evolu', () => ({
  useEvolu: () => ({
    appOwner: {},
    restoreAppOwner: vi.fn(),
    resetAppOwner: vi.fn(),
    exportDatabase: vi.fn().mockResolvedValue(new Uint8Array()),
  })
}));

// Mock React use
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    use: vi.fn().mockReturnValue({ mnemonic: 'test mnemonic phrase' }),
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}));

// Mock Evolu common
vi.mock('@evolu/common', () => ({
  Mnemonic: {
    from: vi.fn()
  }
}));

describe('SettingsDialog', () => {
  it('renders the trigger button', () => {
    // using testing wrapper?
    render(<SettingsDialog />);
    // The button has a setting icon, which we can find by title but setting title was partially replaced, 
    // Wait, I should not use getByTitle if it was removed in previous step. Let's find button by document.querySelector or role if it's the only one
    // But testing the dialog opens is easier.
    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBeGreaterThan(0);
  });

  it('opens dialog and shows content', () => {
    render(<SettingsDialog />);
    // Since dialog uses radix, the button may not have text. 
    // Just click the first button
    const trigger = screen.getAllByRole('button')[0];
    fireEvent.click(trigger);
    
    expect(screen.getByText('Recovery Phrase')).toBeInTheDocument();
    expect(screen.getByText('Reveal')).toBeInTheDocument();
    expect(screen.getByText('Restore from Mnemonic')).toBeInTheDocument();
    expect(screen.getByText('Download Local Backup')).toBeInTheDocument();
    expect(screen.getByText('Reset All Local Data')).toBeInTheDocument();
  });
});
