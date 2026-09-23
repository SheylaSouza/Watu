@api @health
Feature: Book service availability

  Scenario: Report that the service is available
    When the client requests the service health
    Then the response should be successful
