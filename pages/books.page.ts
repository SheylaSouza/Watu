import type { Locator, Page } from '@playwright/test';

export class BooksPage {
  readonly searchBox: Locator;
  readonly booksTable: Locator;
  readonly columnHeaders: Locator;
  readonly bookLinks: Locator;

  constructor(private readonly page: Page) {
    this.searchBox = page.getByPlaceholder('Type to search');
    this.booksTable = page.getByRole('table');
    this.columnHeaders = this.booksTable.getByRole('columnheader');
    this.bookLinks = this.booksTable.getByRole('link');
  }

  async open(): Promise<void> {
    await this.page.goto('/books', { waitUntil: 'domcontentloaded' });
    await this.booksTable.waitFor({ state: 'visible' });
  }

  async hideVolatileContent(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        #fixedban, iframe, .advertisement, [id*="google_ads"] {
          visibility: hidden !important;
        }
      `,
    });
  }
}
