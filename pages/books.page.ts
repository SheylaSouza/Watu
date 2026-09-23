import type { Locator, Page } from '@playwright/test';

export class BooksPage {
  readonly searchBox: Locator;
  readonly booksTable: Locator;
  readonly columnHeaders: Locator;
  readonly bookLinks: Locator;
  readonly bookRows: Locator;

  constructor(private readonly page: Page) {
    this.searchBox = page.getByPlaceholder('Type to search');
    this.booksTable = page.getByRole('table');
    this.columnHeaders = this.booksTable.getByRole('columnheader');
    this.bookLinks = this.booksTable.getByRole('link');
    this.bookRows = this.booksTable.getByRole('row');
  }

  async open(): Promise<void> {
    await this.page.goto('/books', { waitUntil: 'domcontentloaded' });
    await this.booksTable.waitFor({ state: 'visible' });
  }

  async waitForLoaded(): Promise<void> {
    await this.searchBox.waitFor({ state: 'visible' });
    await this.booksTable.waitFor({ state: 'visible' });
  }

  async search(searchValue: string): Promise<void> {
    await this.searchBox.fill(searchValue);
  }

  bookLink(title: string): Locator {
    return this.booksTable.getByRole('link', { name: title, exact: true });
  }

  async openBook(title: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(
        (url: URL) => url.pathname === '/books' && url.searchParams.has('search'),
      ),
      this.bookLink(title).click(),
    ]);
  }

  async getDisplayedRowsText(): Promise<string[]> {
    const rows = await this.bookRows.allTextContents();
    return rows
      .slice(1)
      .map((row: string) => row.trim())
      .filter((row: string) => row.length > 0);
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
