@inventory
Feature: Inventory Functionality - UI Tests
  As a user
  I want to be able to view and interact with products
  So that I can make purchases

  Background:
    Given Initiate required instances to execute the test
    And I am on the login page
    When I login with valid credentials
    Then I should be redirected to the inventory page

  @inventory-backpack-details
  Scenario: Should validate Sauce Labs Backpack product details
    Then I should see the Sauce Labs Backpack product name
    And I should see the Sauce Labs Backpack product description
    And I should see the Sauce Labs Backpack product price
    And I should see the Sauce Labs Backpack product image

  @inventory-backpack-add-to-cart
  Scenario: Should add Sauce Labs Backpack to cart
    When I add the Sauce Labs Backpack to the cart
    Then the cart badge should show "1" item
    And the Sauce Labs Backpack should be in the cart 