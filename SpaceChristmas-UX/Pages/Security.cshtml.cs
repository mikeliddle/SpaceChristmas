using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SpaceChristmas_UX.Pages
{
    public class SecurityModel : PageModel
    {
        private readonly ILogger<SecurityModel> _logger;

        public SecurityModel(ILogger<SecurityModel> logger)
        {
            _logger = logger;
        }
        public void OnGet()
        {

        }
    }
}