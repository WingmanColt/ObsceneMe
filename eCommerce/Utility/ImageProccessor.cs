using Core.Helpers;
using System.Diagnostics;

namespace eCommerce.Utility
{
    public class ImageSize
    {
        public string Device { get; set; }
        public string Size { get; set; }
    }

    public class ImageProcessor
    {
        private readonly IConfiguration _configuration;

        public ImageProcessor(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public OperationResult ResizeImage(string imageFilePath, string outputFolder)
        {
            if (!File.Exists(imageFilePath))
            {
                return OperationResult.FailureResult($"Image file not found: {imageFilePath}");
            }

            var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(imageFilePath);
            var originalFileExtension = Path.GetExtension(imageFilePath);
            var tempFilePath = Path.Combine(Path.GetTempPath(), Path.GetFileName(imageFilePath));

            try
            {
                // Copy to a temporary location to avoid file locking issues
                File.Copy(imageFilePath, tempFilePath, overwrite: true);

                // Continue resizing logic
                var sizes = _configuration.GetSection("AppSettings:ImageSizes").Get<List<ImageSize>>();
                if (sizes == null || !sizes.Any())
                {
                    return OperationResult.FailureResult("No image sizes configured.");
                }

                Directory.CreateDirectory(outputFolder);

                foreach (var sizeGroup in sizes)
                {
                    var dimensions = sizeGroup.Size.Split('x');
                    var width = dimensions[0];
                    var height = dimensions[1];
                    var outputFile = Path.Combine(outputFolder, $"{fileNameWithoutExtension}_{sizeGroup.Device}.webp");

                    var command = $"magick \"{tempFilePath}\" -resize {width}x{height} -quality 100 \"{outputFile}\"";
                    var commandResult = RunCommand(command);

                    if (!commandResult.Success)
                    {
                        return OperationResult.FailureResult($"Error processing image: TempFile:{tempFilePath}, New Image: {outputFile}");
                    }
                }

                // Return success if all sizes are processed without error
                return OperationResult.SuccessResult($"All images are resized successfully, {outputFolder}");
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Error processing image: {ex.Message}");
            }
            finally
            {
                // Clean up the temp file
                if (File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath);
                }
            }
        }

        private OperationResult RunCommand(string command)
        {
            try
            {
                var processStartInfo = new ProcessStartInfo("cmd.exe", $"/c {command}")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                using (var process = new Process { StartInfo = processStartInfo })
                {
                    process.Start();
                    var output = process.StandardOutput.ReadToEnd();
                    var error = process.StandardError.ReadToEnd();
                    process.WaitForExit();

                    if (process.ExitCode != 0)
                    {
                        return OperationResult.FailureResult($"Command error. Output: {output}, Error: {error}");
                    }
                    else
                    {
                       return OperationResult.SuccessResult("Image processed successfully.");                       
                    }
                }
            }
            catch (Exception ex)
            {
                return OperationResult.FailureResult($"Error running command: {ex.Message}");
            }
        }
    }
}
