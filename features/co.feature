Feature: Checkout page

  Background:
    Given I am logged in as "standard_user" with "secret_sauce"

  Scenario Outline: Checkout form shows error when field is empty
    Given I am on the products screen
    And I add 1 products to cart
    When I open the cart
    And I proceed to checkout
    And I enter checkout info "<first>" "<last>" "<zip>"
    And I continue checkout
    Then I should see checkout error "<error>"

  Examples:
    | first | last   | zip   | error                   |
    |       | Puteri | 88888 | First Name is required  |
    | Diva  |        | 88888 | Last Name is required   |
    | Diva  | Puteri |       | Postal Code is required |

  Scenario: Cancel checkout goes back to cart
    Given I am on the products screen
    And I add 1 products to cart
    And I open the cart
    And I proceed to checkout
    When I cancel checkout
    Then I am on the products screen

  Scenario Outline: Successful checkout
    Given I am on the products screen
    When I add <n> products to cart
    And I open the cart
    And I proceed to checkout
    And I enter checkout info "Diva" "Puteri" "12345"
    And I continue checkout
    And I should be on the checkout overview
    And the overview should list <n> items
    And I finish checkout
    Then I should see the order complete screen

  Examples:
    | n |
    | 1 |
    | 2 |
    | 3 |
    | 4 |
    | 5 |
    | 6 |


