import type { Page } from '@playwright/test';

import { BookDetailsElements } from '../elements/book-details.elements';

export class BookDetailsPage {
  readonly elements: BookDetailsElements;

  constructor(private readonly page: Page) {
    this.elements = new BookDetailsElements(page);
  }

  async backToStore(): Promise<void> {
    await Promise.all([
      this.page.waitForURL((url: URL) => url.pathname === '/books' && url.search.length === 0),
      this.elements.backToStoreButton.click(),
    ]);
  }
}
