import { expect } from '@playwright/test';

import { Given, Then, When } from '../../bdd/fixtures';

Given('the visitor opens the Book Store catalogue', async ({ booksPage }) => {
  await booksPage.open();
});

Given('the visitor is viewing the Book Store catalogue', async ({ booksPage }) => {
  await booksPage.open();
});

Given(
  'the visitor is viewing the details for the available book {string}',
  async ({ bookDetailsPage, booksPage }, title: string) => {
    await booksPage.open();
    await expect(booksPage.bookLink(title)).toBeVisible();
    await booksPage.openBook(title);
    await expect(bookDetailsPage.title).toHaveText(title);
    await expect(bookDetailsPage.backToStoreButton).toBeVisible();
  },
);

When('the catalogue finishes loading', async ({ booksPage }) => {
  await booksPage.waitForLoaded();
});

When('the book catalogue finishes loading', async ({ booksPage }) => {
  await booksPage.waitForLoaded();
});

When('the visitor searches for {string}', async ({ booksPage }, searchValue: string) => {
  await booksPage.search(searchValue);
});

When('the visitor selects the {string} button', async ({ bookDetailsPage }, buttonName: string) => {
  expect(buttonName).toBe('Back To Book Store');
  await bookDetailsPage.backToStore();
});

Then('the home page must be visible', async ({ booksPage, page }) => {
  await expect(page).toHaveURL(/\/books$/);
  await expect(booksPage.searchBox).toBeVisible();
  await expect(booksPage.booksTable).toBeVisible();
});

Then('the search field should be visible', async ({ booksPage }) => {
  await expect(booksPage.searchBox).toBeVisible();
});

Then(
  'the columns {string}, {string}, {string}, {string} should be displayed',
  async ({ booksPage }, image: string, title: string, author: string, publisher: string) => {
    await expect(booksPage.columnHeaders).toContainText([image, title, author, publisher]);
  },
);

Then('at least one book link should be visible', async ({ booksPage }) => {
  await expect(booksPage.bookLinks.first()).toBeVisible();
});

Then(
  'a screenshot of the book catalogue should be attached to the report',
  async ({ $testInfo, booksPage }) => {
    await booksPage.hideVolatileContent();
    await expect(booksPage.booksTable).toBeVisible();

    const screenshot = await booksPage.booksTable.screenshot({ animations: 'disabled' });
    await $testInfo.attach('UI - Book catalogue visual evidence', {
      body: screenshot,
      contentType: 'image/png',
    });
  },
);

Then('the catalogue should display {string}', async ({ booksPage }, expectedBook: string) => {
  await expect(booksPage.bookLink(expectedBook)).toBeVisible();
});

Then(
  'every displayed result should contain {string}',
  async ({ booksPage }, searchValue: string) => {
    const displayedRows = await booksPage.getDisplayedRowsText();

    expect(displayedRows.length).toBeGreaterThan(0);
    for (const rowText of displayedRows) {
      expect(rowText.toLowerCase()).toContain(searchValue.toLowerCase());
    }
  },
);
