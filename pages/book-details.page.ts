import type { Locator, Page } from '@playwright/test';

export class BookDetailsPage {
  readonly title: Locator;
  readonly backToStoreButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('#title-wrapper').locator('#userName-value');
    this.backToStoreButton = page.getByRole('button', {
      name: 'Back To Book Store',
      exact: true,
    });
  }

  async backToStore(): Promise<void> {
    await Promise.all([
      this.page.waitForURL((url: URL) => url.pathname === '/books' && url.search.length === 0),
      this.backToStoreButton.click(),
    ]);
  }
}
