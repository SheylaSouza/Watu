import type { Locator, Page } from '@playwright/test';

export class BookDetailsElements {
  readonly title: Locator;
  readonly backToStoreButton: Locator;

  constructor(page: Page) {
    this.title = page.locator('#title-wrapper').locator('#userName-value');
    this.backToStoreButton = page.getByRole('button', {
      name: 'Back To Book Store',
      exact: true,
    });
  }
}
