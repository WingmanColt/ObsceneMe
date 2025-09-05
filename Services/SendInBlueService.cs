using brevo_csharp.Api;
using brevo_csharp.Model;
using Core.Helpers;
using Entities.EmailTemplateModels;
using System.Text;

namespace Services
{
    public class SendInBlueService : ISendInBlueService
    {
        private readonly ErrorLoggingService _errorLogger;

        public SendInBlueService(ErrorLoggingService errorLogger)
        {
            _errorLogger = errorLogger;
        }

       /* public async Task<OperationResult> SendCustomEmailAsync(string email, int templateId, ContactAttributes details)
        {
            try
            {
                if (!(await EnsureContactExists(email, details)))
                    return OperationResult.FailureResult($"Email wasn't sent. Contact does not exist.");

                return await SendTransactionalEmail(email, null, null, templateId, details);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(SendCustomEmailAsync), nameof(SendInBlueService));
                return OperationResult.FailureResult($"Email sending to {email} failed! Ex: {ex.Message}");
            }
        }*/
       /*
        private async Task<bool> EnsureContactExists(string email, ContactAttributes contactAttributes)
        {
            var apiInstance = new ContactsApi();
            GetContacts contacts = await apiInstance.GetContactsAsync();
            var contatct = contacts.Contacts;
            var contactList = JsonConvert.SerializeObject(contacts.Contacts);


            // var contactExists = await apiInstanceContacts.GetContactsAsync();
            // var contactList = JsonConvert.SerializeObject(contactExists.Contacts);

            if (!contactList.Contains(email))
            {
                return await AddNewContact(email, contactAttributes).ConfigureAwait(true);
            }
            else
            {
                return await UpdateExistingContact(email, contactAttributes).ConfigureAwait(true);
            }
        }

        private async Task<bool> AddNewContact(string email, ContactAttributes attributes)
        {
            var apiInstanceContacts = new ContactsApi();
            var createContact = new CreateContact(email: email, attributes: attributes, updateEnabled: true);

            try
            {
                await apiInstanceContacts.CreateContactAsync(createContact).ConfigureAwait(false);
                return true;
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(AddNewContact), nameof(SendInBlueService));
                return false;
            }
        }

        private async Task<bool> UpdateExistingContact(string email, ContactAttributes attributes)
        {
            var apiInstanceContacts = new ContactsApi();
            var updateContact = new UpdateContact(attributes: attributes);
            try
            {
                await apiInstanceContacts.UpdateContactAsync(email, updateContact).ConfigureAwait(false);
                return true;
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(UpdateExistingContact), nameof(SendInBlueService));
                return false;
            }
        }

          private async Task<OperationResult> SendTransactionalEmail(string ourEmail, string toEmail, string subject, string message, int templateId, ContactAttributes attributes)
          {
              try
              {
                  var from = new SendSmtpEmailSender { Email = ourEmail, Name = model.WebName };

                  // Ensure toEmail is not null before creating SendSmtpEmailTo object
                  if (string.IsNullOrEmpty(toEmail))
                  {
                      throw new ArgumentException("Recipient email address cannot be null or empty", nameof(toEmail));
                  }

                  var sendEmail = new SendSmtpEmail(
                      sender: from,
                      to: new List<SendSmtpEmailTo>() { new SendSmtpEmailTo(toEmail, toEmail) { Email = toEmail, Name = toEmail } },
                      subject: subject,
                      htmlContent: message, // Assuming message is HTML content
                      templateId: templateId,
                      _params: attributes is not null ? new { ITEMS = attributes.Items } : null
                  );

                  sendEmail.Sender = from;
                  sendEmail.To = new List<SendSmtpEmailTo>() { new SendSmtpEmailTo(toEmail, toEmail) { Email = toEmail, Name = toEmail } };
                  sendEmail.Subject = subject;
                  sendEmail.TemplateId = templateId;
                  sendEmail.Params = attributes is not null ? new { ITEMS = attributes.Items } : null;

                  var apiInstance = new TransactionalEmailsApi();
                  CreateSmtpEmail result = await apiInstance.SendTransacEmailAsync(sendEmail);
                  if (result is null)
                      return OperationResult.FailureResult($"Email sending from {supportEmail} to {toEmail} failed!");

                  return OperationResult.SuccessResult("MessageId: " + result.MessageId);
              }
              catch (Exception ex)
              {
                  _errorLogger.LogException(ex, nameof(SendTransactionalEmail), nameof(SendInBlueService));
                  return OperationResult.FailureResult($"Email sending from {supportEmail} to {toEmail} failed! Ex: {ex.Message}");
              }
          }

          public async Task<OperationResult> SendEmailAsync(string email, string subject, string message, int templateId)
          {
              try
              {
                  if (!(await EnsureContactExists(email, null)))
                      return OperationResult.FailureResult($"Email wasn't sent. Contact does not exist.");


                  return await SendTransactionalEmail(email, subject, message, templateId, null);
              }
              catch (Exception ex)
              {
                  _errorLogger.LogException(ex, nameof(SendEmailAsync), nameof(SendInBlueService));
                  return OperationResult.FailureResult($"Email sending to {email} failed! Ex: {ex.Message}");
              }
          }
        */

        // Invoice
        public async Task<OperationResult> SendInvoiceEmail(InvoiceModel model, string recipientEmail)
        {
            try
            {
                var projectDirectory = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;
                if (projectDirectory is null)
                  return OperationResult.FailureResult($"Email Html Template parrent dir not found.");

                string dir = Path.Combine(projectDirectory, model.HtmlContentPath);
                string htmlContent = ReadHtmlFile(dir);

                var itemsHtmlBuilder = new StringBuilder();
                foreach (var product in model.OrderedProduct)
                {
                    // Extract only values of selected variant items.
                    var selectedVariantItemValues = product.SelectedVariants
                    .SelectMany(variant => variant.VariantItems.Where(item => item.IsSelected))
                    .Select(item => item.Value);

                    // Concatenate selected values into a single string separated by commas
                    string selectedVariantItemTitles = string.Join(", ", selectedVariantItemValues);
                    string freeShippingHtml = product.IsFreeShipping ? "YES" : "NO";

                    itemsHtmlBuilder.Append($@"
                        <tr>
                            <td class='cs-width_3' style='text-align: left; padding: 10px 15px; line-height: 1.55em;'>{product.Title}</td>
                            <td class='cs-width_3' style='text-align: left; padding: 10px 15px; line-height: 1.55em;'>{freeShippingHtml}</td>
                            <td class='cs-width_2' style='text-align: left; padding: 10px 15px; line-height: 1.55em;'>{product.CustomerPreferenceQuantity}</td>
                            <td class='cs-width_2' style='text-align: left; padding: 10px 15px; line-height: 1.55em;'>{selectedVariantItemTitles}</td>
                            <td class='cs-width_2' style='text-align: left; padding: 10px 15px; line-height: 1.55em;'>{Math.Round(product.Price * model.CurrencyPrice, 2).ToString("0.00")} {model.Currency}</td>
                            <td class='cs-width_2' style='text-align: left; padding: 10px 15px; line-height: 1.55em;'>{product.DiscountRate.ToString("0.00")} {model.Currency}</td>
                        </tr>");
                }
                /*<td class='cs-width_2 cs-text_right' style='text-align: left; padding: 10px 15px; line-height: 1.55em;'>{Math.Round((product.Price - product.DiscountRate) * model.CurrencyPrice, 2).ToString("0.00")} {model.Currency}</td>*/
                string itemsHtml = itemsHtmlBuilder.ToString();

                htmlContent = htmlContent.Replace("{{LOGO}}", "https://ik.imagekit.io/beautyflex/logo-soar-32x32.webp?updatedAt=1710436830162")
                                         .Replace("{{CUSTOMER_NAME}}", model.CustomerName)
                                         .Replace("{{CUSTOMER_EMAIL}}", model.CustomerEmail)
                                         .Replace("{{WEBNAME}}", model.WebName)
                                         .Replace("{{WEBURL}}", model.WebUrl)
                                         .Replace("{{ORDER_CODE}}", model.OrderCode)
                                         .Replace("{{ORDER_DATE}}", model.OrderDate)
                                         .Replace("{{ADDRESS}}", model.Address)
                                         .Replace("{{COUNTRY}}", model.Country)
                                         .Replace("{{TOWN}}", model.Town)
                                         .Replace("{{STATE}}", model.State)
                                         .Replace("{{POSTAL_CODE}}", model.PostalCode)
                                         .Replace("{{CURRENCY}}", model.Currency)
                                         .Replace("{{TOTAL_COST}}", model.TotalCost)
                                         .Replace("{{TOTAL_AMOUNT}}", model.TotalAmount)
                                         .Replace("{{TOTAL_DISCOUNT}}", model.TotalDiscount)
                                         .Replace("{{OUR_EMAIL}}", model.OurEmail)
                                         .Replace("{{PAYMENT_TYPE}}", model.PaymentMethod)
                                         .Replace("{{SHIPPING_TYPE}}", model.ShippingType)
                                         .Replace("{{PHONE}}", model.Phone)
                                         .Replace("{{NOTES}}", model.Notes)
                                         .Replace("{{FACEBOOK}}", model.Facebook)
                                         .Replace("{{INSTAGRAM}}", model.Instagram)
                                         .Replace("{{TIKTOK}}", model.Tiktok)
                                         .Replace("{{ITEMS}}", itemsHtml);

                var apiInstance = new TransactionalEmailsApi();
                var from = new SendSmtpEmailSender { Email = model.OurEmail, Name = model.WebName };

                var email = new SendSmtpEmail(
                    sender: from,
                    to: new List<SendSmtpEmailTo> { new SendSmtpEmailTo(recipientEmail) },
                    subject: "Invoice",
                    htmlContent: htmlContent
                );

                CreateSmtpEmail response = await apiInstance.SendTransacEmailAsync(email);
                if (response is null)
                    return OperationResult.FailureResult($"Invoice Email sending from {model.OurEmail} to {recipientEmail} failed!");

                return OperationResult.SuccessResult(response.MessageId);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(SendInvoiceEmail), nameof(SendInBlueService));
                return OperationResult.FailureResult($"Invoice Email sending from {model.OurEmail} to {recipientEmail} failed! Ex: {ex.Message}");
            }
        }

        // Discount 
        public async Task<OperationResult> SendDiscountEmail(DiscountModel model, string recipientEmail)
        {
            try
            {
                var projectDirectory = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;
                if (projectDirectory is null)
                    return OperationResult.FailureResult($"Email Html Template parrent dir not found.");

                string dir = Path.Combine(projectDirectory, model.HtmlContentPath);
                string htmlContent = ReadHtmlFile(dir);


                htmlContent = htmlContent.Replace("{{CODE}}", model.Code)
                                         .Replace("{{EXPIRATION_DATE}}", model.ExpirationDate)
                                         .Replace("{{CUSTOMERNAME}}", model.CustomerName)
                                         .Replace("{{BANNERIMAGE}}", model.Banner)
                                         .Replace("{{OUR_EMAIL}}", model.OurEmail)
                                         .Replace("{{WEBNAME}}", model.WebName)
                                         .Replace("{{WEBURL}}", model.WebUrl)
                                         .Replace("{{FACEBOOK}}", model.Facebook)
                                         .Replace("{{INSTAGRAM}}", model.Instagram)
                                         .Replace("{{TIKTOK}}", model.Tiktok);

                var apiInstance = new TransactionalEmailsApi();
                var from = new SendSmtpEmailSender { Email = model.OurEmail, Name = model.WebName };

                var email = new SendSmtpEmail(
                    sender: from,
                    to: new List<SendSmtpEmailTo> { new SendSmtpEmailTo(recipientEmail) },
                    subject: "Special Discount",
                    htmlContent: htmlContent
                );

                CreateSmtpEmail response = await apiInstance.SendTransacEmailAsync(email);
                if (response is null)
                    return OperationResult.FailureResult($"Discount Email sending from {model.OurEmail} to {recipientEmail} failed!");

                return OperationResult.SuccessResult(response.MessageId);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(SendDiscountEmail), nameof(SendInBlueService));
                return OperationResult.FailureResult($"Discount Email sending from {model.OurEmail} to {recipientEmail} failed! Ex: {ex.Message}");
            }
        }

        // Skipped Checkout 
        public async Task<OperationResult> SendSkippedCheckoutEmail(SkippedCheckoutModel model, string recipientEmail)
        {
            try
            {
                var projectDirectory = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;
                if (projectDirectory is null)
                    return OperationResult.FailureResult($"Email Html Template parrent dir not found.");

                string dir = Path.Combine(projectDirectory, model.HtmlContentPath);
                string htmlContent = ReadHtmlFile(dir);


                htmlContent = htmlContent.Replace("{{OUR_EMAIL}}", model.OurEmail)
                                         .Replace("{{CUSTOMERID}}", model.CustomerName)
                                         .Replace("{{CUSTOMERNAME}}", model.CustomerName)
                                         .Replace("{{BANNERIMAGE}}", model.Banner)
                                         .Replace("{{WEBNAME}}", model.WebName)
                                         .Replace("{{WEBURL}}", model.WebUrl)
                                         .Replace("{{FACEBOOK}}", model.Facebook)
                                         .Replace("{{INSTAGRAM}}", model.Instagram)
                                         .Replace("{{TIKTOK}}", model.Tiktok);

                var apiInstance = new TransactionalEmailsApi();
                var from = new SendSmtpEmailSender { Email = model.OurEmail, Name = model.WebName };

                var email = new SendSmtpEmail(
                    sender: from,
                    to: new List<SendSmtpEmailTo> { new SendSmtpEmailTo(recipientEmail) },
                    subject: "Here is a sneaky coupon just for you!",
                    htmlContent: htmlContent
                );

                CreateSmtpEmail response = await apiInstance.SendTransacEmailAsync(email);
                if (response is null)
                    return OperationResult.FailureResult($"Skipped Checkout Email sending from {model.OurEmail} to {recipientEmail} failed!");

                return OperationResult.SuccessResult(response.MessageId);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(SendSkippedCheckoutEmail), nameof(SendInBlueService));
                return OperationResult.FailureResult($"Skipped Checkout Email sending from {model.OurEmail} to {recipientEmail} failed! Ex: {ex.Message}");
            }
        }

        // Verification
        public async Task<OperationResult> SendVerificationEmail(VerificationModel model, string recipientEmail)
        {
            try
            {
                var projectDirectory = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;
                if (projectDirectory is null)
                    return OperationResult.FailureResult($"Email Html Template parrent dir not found.");

                string dir = Path.Combine(projectDirectory, model.HtmlContentPath);
                string htmlContent = ReadHtmlFile(dir);


                htmlContent = htmlContent.Replace("{{WEBNAME}}", model.WebName)
                                         .Replace("{{OUR_EMAIL}}", model.OurEmail)
                                         .Replace("{{CODE}}", model.Code)
                                         .Replace("{{BANNERIMAGE}}", model.Banner)                             
                                         .Replace("{{WEBURL}}", model.WebUrl)
                                         .Replace("{{FACEBOOK}}", model.Facebook)
                                         .Replace("{{INSTAGRAM}}", model.Instagram)
                                         .Replace("{{TIKTOK}}", model.Tiktok);

                var apiInstance = new TransactionalEmailsApi();
                var from = new SendSmtpEmailSender { Email = model.OurEmail, Name = model.WebName };

                var email = new SendSmtpEmail(
                    sender: from,
                    to: new List<SendSmtpEmailTo> { new SendSmtpEmailTo(recipientEmail) },
                    subject: "Account Verification",
                    htmlContent: htmlContent
                );

                CreateSmtpEmail response = await apiInstance.SendTransacEmailAsync(email);
                if (response is null)
                    return OperationResult.FailureResult($"Verification Email sending from {model.OurEmail} to {recipientEmail} failed!");

                return OperationResult.SuccessResult(response.MessageId);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(SendVerificationEmail), nameof(SendInBlueService));
                return OperationResult.FailureResult($"Verification Email sending from {model.OurEmail} to {recipientEmail} failed! Ex: {ex.Message}");
            }
        }


        private string ReadHtmlFile(string filePath)
        {
            // Read HTML content from the file
            string htmlContent;
            try
            {
                htmlContent = File.ReadAllText(filePath);
            }
            catch (Exception ex)
            {
                _errorLogger.LogException(ex, nameof(ReadHtmlFile), nameof(SendInBlueService));
                Console.WriteLine("Error reading HTML file: " + ex.Message);
                htmlContent = string.Empty;
            }
            return htmlContent;
        }
    }

    public interface ISendInBlueService
    {
        Task<OperationResult> SendInvoiceEmail(InvoiceModel model, string recipientEmail);
        Task<OperationResult> SendSkippedCheckoutEmail(SkippedCheckoutModel model, string recipientEmail);
        Task<OperationResult> SendDiscountEmail(DiscountModel model, string recipientEmail);
        Task<OperationResult> SendVerificationEmail(VerificationModel model, string recipientEmail);
    }
}
