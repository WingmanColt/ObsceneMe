using System;
using System.Collections.Generic;
using System.Linq;

namespace Core.Helpers
{
    public class OperationResult
    {
        // Constructor for success with ID
        protected OperationResult(int? id)
        {
            this.Success = true;
            this.Id = id;
        }

        // Constructor for success or failure with optional messages
        protected OperationResult(bool isSucceed, IEnumerable<string>? failureMessages = null, string? successMessage = null)
        {
            this.Success = isSucceed;

            if (isSucceed)
            {
                this.SuccessMessage = successMessage ?? "";
                this.FailureMessage = null;
                this.FailureMessages = new List<string>();
            }
            else
            {
                // On failure, set list and single failure message (first message or null)
                this.FailureMessages = failureMessages?.ToList() ?? new List<string>();
                this.FailureMessage = this.FailureMessages.FirstOrDefault();
                this.SuccessMessage = null;
            }
        }

        // Constructor for exception handling
        protected OperationResult(Exception ex)
        {
            this.Success = false;
            this.Exception = ex;
            this.FailureMessages = new List<string>();
            this.FailureMessage = null;
            this.SuccessMessage = null;
        }

        // General constructor for success/failure without messages
        public OperationResult(bool success)
        {
            this.Success = success;
            if (success)
            {
                this.SuccessMessage = "";
                this.FailureMessage = null;
                this.FailureMessages = new List<string>();
            }
            else
            {
                this.FailureMessage = null;
                this.FailureMessages = new List<string>();
                this.SuccessMessage = null;
            }
        }

        // Properties
        public bool Success { get; protected set; }

        private string? failureMessage;
        public string? FailureMessage
        {
            get => failureMessage;
            set
            {
                failureMessage = value;
                // Keep FailureMessages list in sync if setting single message directly
                if (failureMessage != null)
                {
                    if (FailureMessages == null)
                        FailureMessages = new List<string>();

                    if (!FailureMessages.Contains(failureMessage))
                    {
                        FailureMessages.Clear();
                        FailureMessages.Add(failureMessage);
                    }
                }
                else
                {
                    FailureMessages?.Clear();
                }
            }
        }

        public string? SuccessMessage { get; set; }
        public int? Id { get; set; }
        public Exception? Exception { get; protected set; }

        private List<string> failureMessages = new List<string>();
        public List<string> FailureMessages
        {
            get => failureMessages;
            set
            {
                failureMessages = value ?? new List<string>();
                // Keep single FailureMessage in sync with first message in list
                failureMessage = failureMessages.FirstOrDefault();
            }
        }

        // Static helper methods to create result instances

        public static OperationResult SuccessResult(int? id)
        {
            return new OperationResult(id);
        }

        public static OperationResult SuccessResult(string successMessage)
        {
            return new OperationResult(true, null, successMessage);
        }

        public static OperationResult SuccessResult()
        {
            return new OperationResult(true, null, "");
        }

        public static OperationResult FailureResult(IEnumerable<string> messages)
        {
            return new OperationResult(false, messages);
        }

        public static OperationResult FailureResult(string message)
        {
            return new OperationResult(false, new List<string> { message });
        }

        public static OperationResult ExceptionResult(Exception ex)
        {
            return new OperationResult(ex);
        }

        // Checks if there's an exception
        public bool HasException()
        {
            return this.Exception != null;
        }

        // Add a failure message after creation, keeps single message in sync
        public void AddFailureMessage(string message)
        {
            if (FailureMessages == null)
                FailureMessages = new List<string>();

            FailureMessages.Add(message);
            FailureMessage = FailureMessages.FirstOrDefault();
        }
    }
}
