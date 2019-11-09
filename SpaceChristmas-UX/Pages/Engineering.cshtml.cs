using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SpaceChristmas_UX.Pages
{
    public class EngineeringModel : PageModel
    {
        private readonly ILogger<EngineeringModel> _logger;

        public EngineeringModel(ILogger<EngineeringModel> logger)
        {
            _logger = logger;
        }
        public void OnGet()
        {

        }
    }
}