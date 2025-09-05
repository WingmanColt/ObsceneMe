using Core.Helpers;
using eCommerce.Utility;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace eCommerce.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CodController : ControllerBase
    {
        private readonly IspOrder _spOrderService;
        public CodController(IspOrder spOrderService) {

            _spOrderService = spOrderService;
        }

        [HttpPut]
        [Route("check-success")]
        public async Task<IActionResult> CheckSuccess([FromBody] TokenModel model)
        {
            var result = TokenUtility.ValidateToken(60*24, model.Token);

            if (result)
            {
                var oResult = await _spOrderService.UpdateIsPayed(model.Code);

                if (oResult.Success) {
                    return Ok(oResult);
                }
                return Ok(oResult);
            }

            return Ok(OperationResult.FailureResult("Invalid Token.")) ;

        }
    }

    public class TokenModel
    {
        public string Token { get; set; }
        public string Code { get; set; }
    }

}