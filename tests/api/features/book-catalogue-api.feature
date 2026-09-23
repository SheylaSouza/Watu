@api @catalogue
Feature: Book catalogue API

  Scenario: List available books with a valid contract
    Given the client has a valid client identifier
    When the client requests 2 available books
    Then the response should be successful

  Scenario: Retrieve a known book by ISBN
    Given the client has a valid client identifier
    And the ISBN belongs to a known book
    When the client requests the book details
    Then the response should be successful

  @negative
  Scenario: Request an unknown book
    Given the client has a valid client identifier
    When the client requests an unknown ISBN
    Then a not found response should be returned

  @authentication @negative
  Scenario: Reject a protected request without a client identifier
    Given the client does not provide a client identifier
    When the client requests the book catalogue
    Then a missing client ID response should be returned
