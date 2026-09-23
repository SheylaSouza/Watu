@api @reservation
Feature: Book reservation API

  Scenario: Create a reservation with valid data
    Given the client has a valid client identifier
    And the reservation contains valid data
    When the client creates the reservation
    Then the reservation should be created successfully

  @negative
  Scenario: Reject a reservation without a user identifier
    Given the client has a valid client identifier
    And the reservation does not contain a user identifier
    When the client attempts to create the reservation
    Then a validation error response should be returned
