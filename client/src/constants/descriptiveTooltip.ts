const descriptiveTooltip = {
  STOCK_TRACKING:
    "When enabled, the system will track the stock levels of this product. You can set the initial stock quantity and receive notifications when stock is low.",
  PRICE_PER_QUANTITY:
    "Set the selling price for each quantity of the product. This allows you to manage pricing based on different quantity breaks, such as offering discounts for bulk purchases.",
  PRODUCT_IMAGE:
    "Product images will be displayed in your online store. Not applicable for local stores.",
  CLIENT_SIDE_API_REQUESTS:
    "Enabling this option allows API requests to be made directly from the client-side (browsers). This is useful for scenarios where you want to allow users to interact with your API without going through a server. However, it may expose your API key to the public, so use this option with caution. Also for your privacy and security, currently we are only allowing requests with specific scopes and whitelisted origins. Please make sure to configure the scopes and whitelisted origins properly to avoid any security risks.",
  API_KEY_EXPIRY:
    "If not selected, the expiry date will default to 10 years from the creation date.",
  ALERT_THRESHOLD:
    "The stock level at which a low stock alert will be triggered for this product.",
  EMAIL_ALERT:
    "When enabled, an email notification will be sent to the store managers when stock falls below the threshold.",
};

export default descriptiveTooltip;
