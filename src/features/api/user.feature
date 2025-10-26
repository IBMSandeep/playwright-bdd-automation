Feature: Sauce Demo - API Tests

  @api @get
  Scenario: TC1 - Verify homepage content through API
    Given I set the request URL to "https://www.saucedemo.com/"
    When I send a GET request
    Then the response status code should be 200
    And the response should contain "Swag Labs"

  @api @get @json @apiTestSmoke
  Scenario: TC2 - Verify manifest.json content
    Given I set the request URL to "https://www.saucedemo.com/manifest.json"
    When I send a GET request
    Then the response status code should be 200
    And the response body should contain the following values:
      | theme_color       | #eefcf6       |
      | background_color  | #132322       |
      | display           | browser       |
      | scope             | /             |
      | start_url         | /.            |
      | name              | Swag Labs     |
      | short_name        | Swag Labs     |
    And the response should contain "icon-192x192.png"
    And the response should contain "icon-256x256.png"
    And the response should contain "icon-384x384.png"
    And the response should contain "icon-512x512.png" 