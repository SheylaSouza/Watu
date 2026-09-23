import type { Locator, Page } from '@playwright/test';

export class BooksElements {
  readonly volatileContentSelector = '#fixedban, iframe, .advertisement, [id*="google_ads"]';
  readonly searchBox: Locator;
  readonly booksTable: Locator;
  readonly columnHeaders: Locator;
  readonly bookLinks: Locator;
  readonly bookRows: Locator;

  constructor(page: Page) {
    this.searchBox = page.getByPlaceholder('Type to search');
    this.booksTable = page.getByRole('table');
    this.columnHeaders = this.booksTable.getByRole('columnheader');
    this.bookLinks = this.booksTable.getByRole('link');
    this.bookRows = this.booksTable.getByRole('row');
  }

  bookLink(title: string): Locator {
    return this.booksTable.getByRole('link', { name: title, exact: true });
  }
}
