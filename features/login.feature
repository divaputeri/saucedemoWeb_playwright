Feature: Login

  # --- Positive cases ---
  Scenario Outline: Valid users can log in
    Given I am on the app login screen
    When I login with "<username>" and "<password>"
    Then I should see the products screen

    Examples:
      | username                 | password      | note                       |
      | standard_user            | secret_sauce  | valid credentials          |
      | problem_user             | secret_sauce  | valid but problem user     |
      |   standard_user          | secret_sauce  | username with space front  |
      | standard_user            | secret_sauce  | username with space back   |
      | performance_glitch_user  | secret_sauce  | glitch user                |



  # --- Negative & edge cases ---
  Scenario Outline: Invalid logins should show error
    Given I am on the app login screen
    When I login with "<username>" and "<password>"
    Then I should see an error message

    Examples:
      | username                 | password        | note                       |
      | locked_out_user          | secret_sauce    | locked out                 |
      | random_user              | secret_sauce    | username not in DB         |
      | standard_user            | wrong_pass      | wrong password             |
      |                          |                 | both empty                 |
      | standard_user            |                 | username only              |
      |                          | secret_sauce    | password only              |
      | STANDARD_USER            | secret_sauce    | uppercase username         |
      | standard_user            | SECRET_SAUCE    | uppercase password         |
      | user!@#                  | secret_sauce    | username special chars     |
      | standard_user            | secret_sauce$%^ | password special chars     |
      | ' OR 1=1 --              | password        | SQL injection username     |
      | <script>alert(1)</script>| password        | XSS injection username     |
      | standard_user            | brute_force     | brute force attempt (wrong)|

  # --- Session behavior after "restart" ---
  Scenario: Session persists or not after restart (document the behavior)
    Given I am on the app login screen
    When I login with "standard_user" and "secret_sauce"
    And I restart the app
    Then I should see the login screen


  # --- Logout: login beberapa user lalu logout ---
  Scenario Outline: Users can logout from the side menu
    Given I am on the app login screen
    When I login with "<username>" and "<password>"
    And I open the menu
    And I logout
    Then I should see the login screen

  Examples:
    | username                 | password      |
    | standard_user            | secret_sauce  |
    | problem_user             | secret_sauce  |
    | performance_glitch_user  | secret_sauce  |

  # --- About: buka tautan About setelah login ---
  Scenario: Navigate to About from the side menu
    Given I am on the app login screen
    When I login with "standard_user" and "secret_sauce"
    And I open the menu
    And I navigate to About
    Then I should be on the About page

  # --- Performance Test ---
  Scenario: Inventory renders within SLA per user
    Given I am on the app login screen
    When I login with "<username>" and "secret_sauce"
    Then the products screen should render within <ms> ms

  Examples:
    | username                | ms   |
    | standard_user           | 1500 |
    | performance_glitch_user | 5000 |
