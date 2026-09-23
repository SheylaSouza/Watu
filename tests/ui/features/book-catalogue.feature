Feature: DemoQA Book Store catalogue

  @ui @smoke
  Scenario: Display the book catalogue
    Given the visitor opens the Book Store catalogue
    When the catalogue finishes loading
    Then the home page must be visible

  @ui @visual
  Scenario: Display the stable catalogue structure
    Given the visitor opens the Book Store catalogue
    When the book catalogue finishes loading
    Then the search field should be visible
    And the columns "Image", "Title", "Author", "Publisher" should be displayed
    And at least one book link should be visible

  @ui @screenshot
  Scenario: Record the book catalogue visual evidence
    Given the visitor opens the Book Store catalogue
    When the book catalogue finishes loading
    Then a screenshot of the book catalogue should be attached to the report

  @ui @search
  Scenario Outline: Filter the catalogue by <searchType>
    Given the visitor is viewing the Book Store catalogue
    When the visitor searches for "<searchValue>"
    Then the catalogue should display "<expectedBook>"
    And every displayed result should contain "<searchValue>"

    Examples:
      | searchType | searchValue          | expectedBook     |
      | title      | Git Pocket Guide     | Git Pocket Guide |
      | author     | Richard E. Silverman | Git Pocket Guide |
      | publisher  | O'Reilly Media       | Git Pocket Guide |

  @ui @navigation
  Scenario: Return to the Book Store catalogue
    Given the visitor is viewing the details for the available book "Git Pocket Guide"
    When the visitor selects the "Back To Book Store" button
    Then the home page must be visible
