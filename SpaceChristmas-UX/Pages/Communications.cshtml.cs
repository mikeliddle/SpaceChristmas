using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace SpaceChristmas_UX.Pages
{
    public class CommunicationsModel : PageModel
    {
        private readonly ILogger<CommunicationsModel> _logger;

        public CommunicationsModel(ILogger<CommunicationsModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }
    }
}