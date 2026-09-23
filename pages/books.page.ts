import type { Page } from '@playwright/test';

import { BooksElements } from '../elements/books.elements';

export class BooksPage {
  readonly elements: BooksElements;

  constructor(private readonly page: Page) {
    this.elements = new BooksElements(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/books', { waitUntil: 'domcontentloaded' });
    await this.elements.booksTable.waitFor({ state: 'visible' });
  }

  async waitForLoaded(): Promise<void> {
    await this.elements.searchBox.waitFor({ state: 'visible' });
    await this.elements.booksTable.waitFor({ state: 'visible' });
  }

  async search(searchValue: string): Promise<void> {
    await this.elements.searchBox.fill(searchValue);
  }

  async openBook(title: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(
        (url: URL) => url.pathname === '/books' && url.searchParams.has('search'),
      ),
      this.elements.bookLink(title).click(),
    ]);
  }

  async getDisplayedRowsText(): Promise<string[]> {
    const rows = await this.elements.bookRows.allTextContents();
    return rows
      .slice(1)
      .map((row: string) => row.trim())
      .filter((row: string) => row.length > 0);
  }

  async hideVolatileContent(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        ${this.elements.volatileContentSelector} {
          visibility: hidden !important;
        }
      `,
    });
  }
}
