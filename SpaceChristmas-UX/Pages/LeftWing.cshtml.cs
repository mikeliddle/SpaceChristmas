using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SpaceChristmas_UX.Pages
{
    public class LeftWingModel : PageModel
    {
        private readonly ILogger<LeftWingModel> _logger;

        public LeftWingModel(ILogger<LeftWingModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}
