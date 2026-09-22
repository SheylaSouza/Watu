import { expect, test } from '@playwright/test';

import { BooksPage } from '../../pages/books.page';

test.describe('DemoQA Book Store visual contract', () => {
  test('shows the stable book catalogue elements and records visual evidence', async ({
    page,
  }, testInfo) => {
    const booksPage = new BooksPage(page);

    await booksPage.open();
    await booksPage.hideVolatileContent();

    await expect(booksPage.searchBox).toBeVisible();
    await expect(booksPage.columnHeaders).toContainText(['Image', 'Title', 'Author', 'Publisher']);
    await expect(booksPage.bookLinks.first()).toBeVisible();

    const screenshot = await booksPage.booksTable.screenshot({ animations: 'disabled' });
    await testInfo.attach('books-table-visual-evidence', {
      body: screenshot,
      contentType: 'image/png',
    });
  });
});
