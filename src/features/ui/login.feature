@login
Feature: Login Functionality - UI Tests
  As a user
  I want to be able to login to the application
  So that I can access my account

  Background:
    Given Initiate required instances to execute the test
    And I am on the login page

  @login-title
  Scenario: Verify Title Page
    Then the page title should be "Swag Labs"
    And the login logo should be displayed

  @login-valid
  Scenario: Login with valid credentials
    When I login with valid credentials
    Then I should be redirected to the inventory page

  @login-invalid
  Scenario: Login with invalid credentials
    When I login with username "invalid_user" and password "invalid_password"
    Then I should see an error message "Epic sadface: Username and password do not match any user in this service" 