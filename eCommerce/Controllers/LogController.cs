using Microsoft.AspNetCore.Mvc;

namespace eCommerce.Controllers
{
    [ApiController]
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class LogController : ControllerBase
    {
        private readonly ErrorLoggingService _errorLogger;

        public LogController(ErrorLoggingService errorLogger)
        {
            _errorLogger = errorLogger;
        }

      /* [HttpPost]
        [Route("send-error-message")]
        public IActionResult LogError([FromBody] LogEntry logEntry)
        {
            return Ok();
             try
             {
                 string path = _errorLogger.checkPath();
                 string logMessage = $"{logEntry.Timestamp} : {logEntry.Message}\n";
                 System.IO.File.AppendAllText(path, logMessage);

                 return Ok("Error logged successfully");
             }
             catch (Exception ex)
             {
                 return StatusCode(500, $"Error logging: {ex.Message}");
             }
        }*/


        [Route("log-dir")]
        public IActionResult LogDir()
        {
            return Ok(_errorLogger.checkPath());
        }
    }

    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public string Message { get; set; }
    }

}