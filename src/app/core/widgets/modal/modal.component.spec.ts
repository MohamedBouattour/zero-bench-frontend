import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  beforeAll(() => {
    // jsdom does not implement the modal dialog API.
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  });

  function setup(open = true, dismissible = true) {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('title', 'Edit consultant');
    fixture.componentRef.setInput('open', open);
    fixture.componentRef.setInput('dismissible', dismissible);
    fixture.detectChanges();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    return { fixture, closed, dialog };
  }

  it('opens the native dialog and renders the title', async () => {
    const { fixture, dialog } = setup();
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Edit consultant');
  });

  it('emits closed from the close button', () => {
    const { closed, dialog } = setup();
    (dialog.querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement).click();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('turns Escape (cancel) into a closed event instead of closing itself', () => {
    const { closed, dialog } = setup();
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape when not dismissible', () => {
    const { closed, dialog } = setup(true, false);
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(closed).not.toHaveBeenCalled();
  });
});
