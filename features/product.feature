Feature: Product page

  Scenario: Add product to cart
    Given I am logged in as "standard_user" with "secret_sauce"
    And I am on the products screen
    When I add 1 products to cart
    Then the cart badge should show "1"

  Scenario: Remove product outside the cart
    Given I am logged in as "standard_user" with "secret_sauce"
    And I am on the products screen
    When I add 1 products to cart
    And I remove 1 products from outside cart
    Then there should not be any "Remove" buttons

  Scenario: Navigate to cart page
    Given I am logged in as "standard_user" with "secret_sauce"
    And I am on the products screen
    When I add 1 products to cart
    And I open the cart
    Then I should see the product in the cart

  Scenario: Remove product from inside the cart
    Given I am logged in as "standard_user" with "secret_sauce"
    And I am on the products screen
    When I add 1 products to cart
    And I open the cart
    And I remove the product from the cart page
    Then there should not be any "Remove" buttons

  Scenario: Back to products page from the cart
    Given I am logged in as "standard_user" with "secret_sauce"
    And I am on the products screen
    When I open the cart
    When I continue shopping
    Then I am on the products screen

  Scenario Outline: Add all products behaves per user
    Given I am logged in as "<username>" with "secret_sauce"
    And I am on the products screen
    And I add all products to cart
    Then the cart badge should <not> show "6"
    Examples:
      | username      | not |
      | standard_user |     |   # should show "6"
      | problem_user  | not |   # should NOT show "6"

  Scenario Outline: Remove all product from outside the cart
    Given I am logged in as "<username>" with "secret_sauce"
    And I am on the products screen
    And I add all products to cart
    When I remove all products from outside cart
    Then there should <not> be any "Remove" buttons
    Examples:
      | username      | not |
      | standard_user | not |   # standard: harus hilang badge
      | problem_user  |     |   # problem: badge masih kelihatan (gagal remove semua)
  

  Scenario Outline: Remove all product from inside the cart
    Given I am logged in as "<username>" with "secret_sauce"
    And I am on the products screen
    And I add all products to cart
    When I open the cart
    And I remove all products from inside cart
    Then there should not be any "Remove" buttons
    Examples:
      | username      |
      | standard_user | 
      | problem_user  |

  Scenario Outline: Sort products
    Given I am logged in as "standard_user" with "secret_sauce"
    And I am on the products screen
    When I sort products by <option>
    Then products should be sorted <order>
    Examples:
      | option             | order           |
      | Name (A to Z)      | A to Z          |
      | Name (Z to A)      | Z to A          |
      | Price (low to high)| Price Low-High  |
      | Price (high to low)| Price High-Low  |

  Scenario Outline: Navigate product details behaves per user
    Given I am logged in as "<username>" with "secret_sauce"
    And I am on the products screen
    And I tap through all products
    Then the last opened product title should <not> match the clicked name
    Examples:
      | username      | not |
      | standard_user |     |   # Harus cocok (match)
      | problem_user  | not |   # Memang bug: tidak cocok (mismatch)

